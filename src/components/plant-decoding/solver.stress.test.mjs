import assert from 'node:assert/strict';

import decodingData from './decoding-plants.json' with { type: 'json' };
import { analyzePuzzle, judgeAttempt, makeSuggestion, makeSuggestionPlan, suggestionConfidence } from './solver.mjs';

function createRandom(seed) {
    let state = seed >>> 0;
    return () => {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        return state / 0x100000000;
    };
}

function shuffle(values, random) {
    const result = values.slice();
    for (let index = result.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(random() * (index + 1));
        [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
}

function gameJudgeHalf(real, guess) {
    return (guess.PlantA === real.PlantA && guess.PlantB !== real.PlantB)
        || (guess.PlantA === real.PlantB && guess.PlantB !== real.PlantA)
        || (guess.PlantB === real.PlantB && guess.PlantA !== real.PlantA)
        || (guess.PlantB === real.PlantA && guess.PlantA !== real.PlantB);
}

function gameJudgeAttempt(secretTargets, guessTargets, rulesByTarget, lockedBefore = []) {
    const correct = Array.from({ length: secretTargets.length }, (_, index) => Boolean(lockedBefore[index]));
    const feedback = Array(secretTargets.length).fill('fault');
    for (let index = 0; index < secretTargets.length; index += 1) {
        if (correct[index]) {
            feedback[index] = 'correct';
            continue;
        }
        if (secretTargets[index] === guessTargets[index]) {
            feedback[index] = 'correct';
            correct[index] = true;
            continue;
        }
        const existsInUnsolvedSlot = secretTargets.some((target, targetIndex) => (
            target === guessTargets[index] && !correct[targetIndex]
        ));
        if (existsInUnsolvedSlot) {
            feedback[index] = 'change';
            continue;
        }
        const real = rulesByTarget.get(secretTargets[index]);
        const guess = rulesByTarget.get(guessTargets[index]);
        feedback[index] = real && guess && gameJudgeHalf(real, guess) ? 'half' : 'fault';
    }
    return { feedback, correct };
}

function historyMatches(secret, observations, rulesByTarget) {
    let locked = Array(secret.length).fill(false);
    for (const observation of observations) {
        const judged = gameJudgeAttempt(secret, observation.guesses, rulesByTarget, locked);
        if (!judged.feedback.every((state, index) => state === observation.feedback[index])) return false;
        locked = judged.correct;
    }
    return true;
}

function totalVariationBySlot(samples, exact, targets, slotCount) {
    return Array.from({ length: slotCount }, (_, slot) => {
        let difference = 0;
        for (const target of targets) {
            const sampledProbability = samples.filter(row => row[slot] === target).length / samples.length;
            const exactProbability = exact.filter(row => row[slot] === target).length / exact.length;
            difference += Math.abs(sampledProbability - exactProbability);
        }
        return difference / 2;
    });
}

function feedbackEntropy(secrets, guesses, rulesByTarget) {
    const outcomes = new Map();
    for (const secret of secrets) {
        const key = gameJudgeAttempt(secret, guesses, rulesByTarget).feedback.join('|');
        outcomes.set(key, (outcomes.get(key) || 0) + 1);
    }
    let entropy = 0;
    for (const count of outcomes.values()) {
        const probability = count / secrets.length;
        entropy -= probability * Math.log2(probability);
    }
    return entropy;
}

function permutations(values, length) {
    const rows = [];
    const row = [];
    function visit() {
        if (row.length === length) {
            rows.push(row.slice());
            return;
        }
        for (const value of values) {
            if (row.includes(value)) continue;
            row.push(value);
            visit();
            row.pop();
        }
    }
    visit();
    return rows;
}

const random = createRandom(0x5eedc0de);
let generatedHistories = 0;
let analyzedRounds = 0;
let recommendationChecks = 0;

for (let trial = 0; trial < 1200; trial += 1) {
    const baseCount = 3 + (trial % 8);
    const bases = decodingData.BASES.slice(0, baseCount);
    const rules = decodingData.MERGES.filter(rule => bases.includes(rule.PlantA) && bases.includes(rule.PlantB));
    const targets = rules.map(rule => rule.Target);
    const slotCount = Math.min(3 + (trial % 8), rules.length);
    const rulesByTarget = new Map(rules.map(rule => [rule.Target, rule]));
    const secret = shuffle(targets, random).slice(0, slotCount);
    const observations = [];
    let locked = Array(slotCount).fill(false);

    for (let round = 0; round < 3; round += 1) {
        const guesses = Array.from({ length: slotCount }, (_, slot) => {
            if (locked[slot]) return secret[slot];
            return targets[Math.floor(random() * targets.length)];
        });
        const judged = gameJudgeAttempt(secret, guesses, rulesByTarget, locked);
        assert.deepEqual(judgeAttempt(secret, guesses, rulesByTarget, locked), judged);
        observations.push({ guesses, feedback: judged.feedback });
        locked = judged.correct;
        generatedHistories += 1;

        const analysis = analyzePuzzle(rules, slotCount, observations, 24);
        analyzedRounds += 1;
        assert.equal(analysis.contradiction, false, `valid history contradicted at trial ${trial}, round ${round}`);
        analysis.domains.forEach((domain, slot) => {
            assert.ok(domain.includes(secret[slot]), `true target removed at trial ${trial}, round ${round}, slot ${slot}`);
        });
        assert.ok(analysis.samples.every(candidate => historyMatches(candidate, observations, rulesByTarget)));
        assert.ok(analysis.posteriorSamples.every(candidate => historyMatches(candidate, observations, rulesByTarget)));
        if (!analysis.truncated) {
            assert.ok(analysis.samples.some(candidate => candidate.every((target, slot) => target === secret[slot])));
        }

        if (trial < 80 || trial % 100 === 0) {
            const recommendation = makeSuggestion(rules, analysis, locked);
            assert.equal(recommendation.length, slotCount);
            assert.equal(new Set(recommendation).size, slotCount);
            recommendation.forEach((target, slot) => {
                assert.ok(rulesByTarget.has(target));
                if (locked[slot]) assert.equal(target, secret[slot], 'recommendation changed a locked correct slot');
            });
            recommendationChecks += 1;
        }
        if (locked.every(Boolean)) break;
    }
}

// Exact regression for the former deterministic-prefix failure. The old solver
// reported a sampled 100% probability where the exact probability was 25.45%.
const fiveBases = decodingData.BASES.slice(0, 5);
const mediumRules = decodingData.MERGES.filter(rule => fiveBases.includes(rule.PlantA) && fiveBases.includes(rule.PlantB));
const mediumTargets = mediumRules.map(rule => rule.Target);
const mediumRulesByTarget = new Map(mediumRules.map(rule => [rule.Target, rule]));
const slotCount = 7;
const regressionGuess = [
    'glacierShroom',
    'repeater',
    'fumeshroom',
    'sunshroom',
    'sweetpotato',
    'scaredyShroom',
    'snowpea'
];
const regressionFeedback = ['change', 'fault', 'change', 'change', 'change', 'half', 'change'];
const exactCandidates = [];
const row = [];
function enumerateExactCandidates() {
    if (row.length === slotCount) {
        const feedback = gameJudgeAttempt(row, regressionGuess, mediumRulesByTarget).feedback;
        if (feedback.every((state, index) => state === regressionFeedback[index])) exactCandidates.push(row.slice());
        return;
    }
    for (const target of mediumTargets) {
        if (row.includes(target)) continue;
        row.push(target);
        enumerateExactCandidates();
        row.pop();
    }
}
enumerateExactCandidates();
assert.equal(exactCandidates.length, 20296);

const regressionAnalysis = analyzePuzzle(mediumRules, slotCount, [{
    guesses: regressionGuess,
    feedback: regressionFeedback
}]);
assert.equal(regressionAnalysis.truncated, true);
assert.equal(regressionAnalysis.samples.length, 4096);
assert.equal(regressionAnalysis.posteriorSamples.length, 4096);
assert.equal(new Set(regressionAnalysis.samples.map(candidate => candidate.join('\u0000'))).size, 4096);
assert.ok(regressionAnalysis.samples.every(candidate => historyMatches(candidate, [{ guesses: regressionGuess, feedback: regressionFeedback }], mediumRulesByTarget)));
assert.ok(regressionAnalysis.posteriorSamples.every(candidate => historyMatches(candidate, [{ guesses: regressionGuess, feedback: regressionFeedback }], mediumRulesByTarget)));

const totalVariations = totalVariationBySlot(
    regressionAnalysis.posteriorSamples,
    exactCandidates,
    mediumTargets,
    slotCount
);
assert.ok(Math.max(...totalVariations) < 0.06, `posterior sampling bias too high: ${totalVariations.join(', ')}`);

const regressionSuggestion = makeSuggestion(mediumRules, regressionAnalysis, Array(slotCount).fill(false));
const sampledConfidence = suggestionConfidence(regressionAnalysis, regressionSuggestion);
const exactConfidence = regressionSuggestion.map((target, slot) => (
    exactCandidates.filter(candidate => candidate[slot] === target).length / exactCandidates.length
));
const maxConfidenceError = Math.max(...sampledConfidence.map((value, slot) => Math.abs(value - exactConfidence[slot])));
assert.ok(maxConfidenceError < 0.03, `confidence error too high: ${maxConfidenceError}`);
const repeatedRegressionAnalysis = analyzePuzzle(mediumRules, slotCount, [{
    guesses: regressionGuess,
    feedback: regressionFeedback
}]);
assert.deepEqual(repeatedRegressionAnalysis.samples, regressionAnalysis.samples);
assert.deepEqual(repeatedRegressionAnalysis.posteriorSamples, regressionAnalysis.posteriorSamples);
assert.deepEqual(
    makeSuggestion(mediumRules, repeatedRegressionAnalysis, Array(slotCount).fill(false)),
    regressionSuggestion,
    'truncated analysis and recommendation must be deterministic across repeated runs'
);

// Regression for the former single-slot local optimum. The best move requires
// swapping two occupied slots at once, so ordinary coordinate replacement
// cannot reach it while preserving unique guesses.
const optimizerFirstGuess = ['snowpea', 'twinsunflower', 'solartomato', 'icebloom'];
const optimizerFeedback = ['fault', 'fault', 'half', 'fault'];
const optimizerAnalysis = analyzePuzzle(mediumRules, 4, [{
    guesses: optimizerFirstGuess,
    feedback: optimizerFeedback
}], 50000);
assert.equal(optimizerAnalysis.truncated, false);
assert.equal(optimizerAnalysis.samples.length, 420);
const optimizedSuggestion = makeSuggestion(mediumRules, optimizerAnalysis, Array(4).fill(false));
const optimizedEntropy = feedbackEntropy(optimizerAnalysis.samples, optimizedSuggestion, mediumRulesByTarget);
let exactBestEntropy = -Infinity;
for (const candidate of permutations(mediumTargets, 4)) {
    exactBestEntropy = Math.max(exactBestEntropy, feedbackEntropy(optimizerAnalysis.samples, candidate, mediumRulesByTarget));
}
assert.ok(Math.abs(optimizedEntropy - exactBestEntropy) < 1e-12, `optimizer missed the exact best entropy: ${optimizedEntropy} vs ${exactBestEntropy}`);

// Maximum supported 45-rule/10-slot configuration must remain bounded and
// produce legal, unique recommendations before and after a full feedback row.
const fullRulesByTarget = new Map(decodingData.MERGES.map(rule => [rule.Target, rule]));
const maxSecret = decodingData.MERGES.slice(-10).map(rule => rule.Target);
const maxStart = performance.now();
const maxInitialAnalysis = analyzePuzzle(decodingData.MERGES, 10, []);
const maxInitialSuggestion = makeSuggestion(decodingData.MERGES, maxInitialAnalysis, Array(10).fill(false));
const maxInitialDuration = performance.now() - maxStart;
assert.equal(maxInitialSuggestion.length, 10);
assert.equal(new Set(maxInitialSuggestion).size, 10);
const maxFeedback = gameJudgeAttempt(maxSecret, maxInitialSuggestion, fullRulesByTarget).feedback;
const maxRoundStart = performance.now();
const maxRoundAnalysis = analyzePuzzle(decodingData.MERGES, 10, [{
    guesses: maxInitialSuggestion,
    feedback: maxFeedback
}]);
const maxRoundSuggestion = makeSuggestion(decodingData.MERGES, maxRoundAnalysis, Array(10).fill(false));
const maxRoundDuration = performance.now() - maxRoundStart;
assert.equal(maxRoundAnalysis.contradiction, false);
maxRoundAnalysis.domains.forEach((domain, slot) => assert.ok(domain.includes(maxSecret[slot])));
assert.equal(maxRoundSuggestion.length, 10);
assert.equal(new Set(maxRoundSuggestion).size, 10);
assert.ok(maxInitialDuration < 5000, `max initial recommendation took ${maxInitialDuration}ms`);
assert.ok(maxRoundDuration < 5000, `max feedback recommendation took ${maxRoundDuration}ms`);

// A full-size exact branch exercises the optional outcome-count probe. It may
// replace inferred/off-domain slots, but it must keep actual green slots and
// must not run again after the history records that a probe was already used.
const probeSecret = [
    'scaredyShroom', 'explodeonut', 'icebloom', 'inferno', 'pepperpult',
    'sporeshroom', 'skyshooter', 'starfruit', 'lychee', 'repeater'
];
const probeRows = [
    ['cherribomb', 'sunshroom', 'glacierShroom', 'iceweed', 'hotdate', 'sporeshroom', 'stallia', 'plantern', 'peanut', 'stickybombrice'],
    ['sweetpotato', 'snowpea', 'icebloom', 'pineapple', 'endurian', 'sporeshroom', 'gloomshroom', 'scaredyShroom', 'bulbkekengi', 'spikerock'],
    ['starfruit', 'primalpotatomine', 'icebloom', 'pepperpult', 'inferno', 'sporeshroom', 'firegourd', 'slingpea', 'melonpult', 'skyshooter']
];
const probeHistory = [];
let probeLocked = Array(10).fill(false);
for (const guesses of probeRows) {
    const judgedProbe = gameJudgeAttempt(probeSecret, guesses, fullRulesByTarget, probeLocked);
    probeHistory.push({ guesses, feedback: judgedProbe.feedback });
    probeLocked = judgedProbe.correct;
}
const probeAnalysis = analyzePuzzle(decodingData.MERGES, 10, probeHistory);
assert.equal(probeAnalysis.truncated, false);
const lowRoundPlan = makeSuggestionPlan(decodingData.MERGES, probeAnalysis, probeLocked, {
    mode: 'low-rounds',
    round: 4,
    probeUsed: false
});
const lowRoundBaseline = makeSuggestionPlan(decodingData.MERGES, probeAnalysis, probeLocked, {
    mode: 'low-rounds',
    round: 4,
    probeUsed: true
});
assert.equal(lowRoundPlan.probe, true);
assert.deepEqual(
    lowRoundPlan.probeSlots,
    lowRoundPlan.guesses.map((target, slot) => target !== lowRoundBaseline.guesses[slot]),
    'only slots changed from the normal recommendation should be marked as probes'
);
probeLocked.forEach((locked, slot) => {
    if (locked) assert.equal(lowRoundPlan.guesses[slot], probeSecret[slot]);
    if (locked) assert.equal(lowRoundPlan.probeSlots[slot], false);
});
assert.ok(lowRoundPlan.guesses.some((target, slot) => (
    !probeLocked[slot] && !probeAnalysis.domains[slot].includes(target)
)), 'an outcome probe may use an off-domain target in an unlocked slot');
assert.equal(makeSuggestionPlan(decodingData.MERGES, probeAnalysis, probeLocked, {
    mode: 'balanced',
    round: 5,
    probeUsed: false
}).probe, false, 'balanced mode should close out instead of starting a late probe');
assert.equal(makeSuggestionPlan(decodingData.MERGES, probeAnalysis, probeLocked, {
    mode: 'low-rounds',
    round: 5,
    probeUsed: false
}).probe, true, 'low-rounds mode may still trade a late round for more information');
assert.equal(makeSuggestionPlan(decodingData.MERGES, probeAnalysis, probeLocked, {
    mode: 'low-rounds',
    round: 4,
    probeUsed: true
}).probe, false);

console.log(JSON.stringify({
    status: 'plant decoding stress tests passed',
    generatedHistories,
    analyzedRounds,
    recommendationChecks,
    exactRegressionCandidates: exactCandidates.length,
    maxPosteriorTotalVariation: Math.max(...totalVariations),
    maxSuggestionConfidenceError: maxConfidenceError,
    exactOptimizerEntropy: optimizedEntropy,
    maxInitialDurationMs: maxInitialDuration,
    maxRoundDurationMs: maxRoundDuration
}, null, 2));
