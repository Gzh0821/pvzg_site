import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import decodingData from './decoding-plants.json' with { type: 'json' };
import { analyzePuzzle, judgeAttempt, makeSuggestion, suggestionConfidence } from './solver.mjs';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const rules = [
    { PlantA: 'a', PlantB: 'a', Target: 'aa' },
    { PlantA: 'a', PlantB: 'b', Target: 'ab' },
    { PlantA: 'a', PlantB: 'c', Target: 'ac' },
    { PlantA: 'b', PlantB: 'b', Target: 'bb' },
    { PlantA: 'b', PlantB: 'c', Target: 'bc' }
];
const byTarget = new Map(rules.map(rule => [rule.Target, rule]));

function gameJudgeHalf(real, guess) {
    return (guess.PlantA === real.PlantA && guess.PlantB !== real.PlantB)
        || (guess.PlantA === real.PlantB && guess.PlantB !== real.PlantA)
        || (guess.PlantB === real.PlantB && guess.PlantA !== real.PlantA)
        || (guess.PlantB === real.PlantA && guess.PlantA !== real.PlantB);
}

// Independent transcription of ArcadeDecodingPlants.judgeTarget(). Do not call
// the website oracle here: this is the game-body parity reference.
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

        let existsInUnsolvedSlot = false;
        for (let targetIndex = 0; targetIndex < secretTargets.length; targetIndex += 1) {
            if (secretTargets[targetIndex] === guessTargets[index] && !correct[targetIndex]) {
                existsInUnsolvedSlot = true;
                break;
            }
        }
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

function feedbackHistoryMatches(secret, observations, rulesByTarget) {
    let locked = Array(secret.length).fill(false);
    for (const observation of observations) {
        const judged = gameJudgeAttempt(secret, observation.guesses, rulesByTarget, locked);
        if (!judged.feedback.every((state, index) => state === observation.feedback[index])) return false;
        locked = judged.correct;
    }
    return true;
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

function rowsWithReplacement(values, length) {
    const rows = [];
    const row = [];
    function visit() {
        if (row.length === length) {
            rows.push(row.slice());
            return;
        }
        for (const value of values) {
            row.push(value);
            visit();
            row.pop();
        }
    }
    visit();
    return rows;
}

function sortedRowKeys(rows) {
    return rows.map(row => row.join('\u0000')).sort();
}

function createRandom(seed) {
    let state = seed >>> 0;
    return () => {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        return state / 0x100000000;
    };
}

function findGameDecodingData(buildRoot) {
    const importRoot = path.join(buildRoot, 'src/public/assets/resources/import');
    if (!fs.existsSync(importRoot)) return null;
    const directories = fs.readdirSync(importRoot, { withFileTypes: true }).filter(entry => entry.isDirectory());
    for (const directory of directories) {
        const directoryPath = path.join(importRoot, directory.name);
        for (const filename of fs.readdirSync(directoryPath)) {
            if (!filename.endsWith('.json')) continue;
            const filePath = path.join(directoryPath, filename);
            const source = fs.readFileSync(filePath, 'utf8');
            if (!source.includes('"DecodingPlants"') || !source.includes('"BASES"')) continue;
            const root = JSON.parse(source);
            let found = null;
            function walk(value) {
                if (found) return;
                if (Array.isArray(value)) {
                    if (value[0] === 20 && value[1] === 'DecodingPlants' && value[2]?.BASES && value[2]?.MERGES) {
                        found = value[2];
                        return;
                    }
                    value.forEach(walk);
                } else if (value && typeof value === 'object') {
                    Object.values(value).forEach(walk);
                }
            }
            walk(root);
            if (found) return found;
        }
    }
    return null;
}

function verifyCurrentGameBody() {
    const defaultBuildRoot = path.resolve(currentDir, '../../../../pvzge_build');
    const buildRoot = process.env.PVZGE_BUILD_ROOT || defaultBuildRoot;
    const gameBundlePath = path.join(buildRoot, 'src/public/assets/main/index.js');
    if (!fs.existsSync(gameBundlePath)) return false;

    const gameBundle = fs.readFileSync(gameBundlePath, 'utf8');
    const moduleStart = gameBundle.indexOf('System.register("chunks:///_virtual/ArcadeDecodingPlants.ts"');
    const moduleEnd = gameBundle.indexOf('System.register("chunks:///_virtual/', moduleStart + 20);
    assert.ok(moduleStart >= 0 && moduleEnd > moduleStart, 'current game body must contain ArcadeDecodingPlants.ts');
    const moduleSource = gameBundle.slice(moduleStart, moduleEnd);
    assert.ok(moduleSource.includes('if(this.CodePlants[t]==e)return ht.correct'), 'game must judge same-slot targets first');
    assert.ok(moduleSource.includes('r==e&&(null==a||!a.isCorrect())'), 'game must judge other unsolved slots second');
    assert.ok(moduleSource.includes('return i.judgeHalf(l)?ht.half:ht.fault'), 'game must judge half before fault');

    const gameData = findGameDecodingData(buildRoot);
    assert.ok(gameData, 'current game body must expose embedded DecodingPlants data');
    assert.deepEqual(gameData, decodingData, 'website DecodingPlants data must match the current game body exactly');
    return true;
}

const secret = ['aa', 'bc', 'ac'];
const guess = ['bc', 'bb', 'ac'];
const judged = judgeAttempt(secret, guess, byTarget);
assert.deepEqual(judged, gameJudgeAttempt(secret, guess, byTarget));
assert.deepEqual(judged.feedback, ['change', 'half', 'correct']);

const analysis = analyzePuzzle(rules, 3, [{ guesses: guess, feedback: judged.feedback }], 100);
assert.equal(analysis.contradiction, false);
assert.ok(analysis.samples.some(sample => sample.join(',') === secret.join(',')));
assert.equal(analysis.domains[2].join(','), 'ac');

const suggestion = makeSuggestion(rules, analysis);
assert.equal(suggestion.length, 3);
assert.equal(new Set(suggestion).size, 3);
assert.deepEqual(makeSuggestion(rules, analysis), suggestion);
assert.equal(suggestionConfidence(analysis, suggestion).length, 3);

const certainSlotAnalysis = {
    contradiction: false,
    domains: [['aa', 'bb'], ['ac']],
    samples: [['aa', 'ac'], ['bb', 'ac']],
    posteriorSamples: [['aa', 'ac'], ['bb', 'ac']]
};
const certainSlotSuggestion = makeSuggestion(rules, certainSlotAnalysis, [false, true]);
assert.equal(certainSlotSuggestion[1], 'ac');
assert.equal(new Set(certainSlotSuggestion).size, 2);

const duplicateSecret = ['aa', 'bb'];
assert.deepEqual(
    judgeAttempt(duplicateSecret, ['bb', 'bb'], byTarget).feedback,
    ['change', 'correct'],
    'a later exact slot must still inform an earlier wrong-position result'
);
assert.deepEqual(
    judgeAttempt(duplicateSecret, ['aa', 'aa'], byTarget).feedback,
    ['correct', 'fault'],
    'a target already fixed earlier in the row must not be reported as movable later'
);

const lockedSecret = ['aa', 'bb', 'ac'];
const firstGuess = ['aa', 'bc', 'ab'];
const firstJudged = gameJudgeAttempt(lockedSecret, firstGuess, byTarget);
const secondGuess = ['aa', 'aa', 'ac'];
const secondJudged = gameJudgeAttempt(lockedSecret, secondGuess, byTarget, firstJudged.correct);
const lockedAnalysis = analyzePuzzle(rules, 3, [
    { guesses: firstGuess, feedback: firstJudged.feedback },
    { guesses: secondGuess, feedback: secondJudged.feedback }
], 100);
assert.equal(lockedAnalysis.contradiction, false);
assert.ok(lockedAnalysis.samples.some(sample => sample.join(',') === lockedSecret.join(',')));
const lockedSuggestion = makeSuggestion(rules, lockedAnalysis, firstJudged.correct);
assert.equal(lockedSuggestion[0], 'aa', 'a correct slot must never be changed by recommendation optimization');

const truncated = analyzePuzzle(rules, 3, [{ guesses: guess, feedback: judged.feedback }], 1);
assert.equal(truncated.truncated, true);
assert.ok(truncated.domains.every((domain, index) => domain.length >= analysis.domains[index].length));
assert.ok(truncated.samples.every(candidate => feedbackHistoryMatches(candidate, [{ guesses: guess, feedback: judged.feedback }], byTarget)));
assert.ok(truncated.posteriorSamples.every(candidate => feedbackHistoryMatches(candidate, [{ guesses: guess, feedback: judged.feedback }], byTarget)));

const impossible = analyzePuzzle(rules, 3, [{
    guesses: ['aa', 'ab', 'ac'],
    feedback: ['correct', 'correct', 'correct']
}, {
    guesses: ['aa', 'ab', 'ac'],
    feedback: ['fault', 'correct', 'correct']
}]);
assert.equal(impossible.contradiction, true);

const solved = analyzePuzzle(rules, 3, [{
    guesses: secret,
    feedback: ['correct', 'correct', 'correct']
}]);
assert.deepEqual(suggestionConfidence(solved, secret), [1, 1, 1]);

// Exhaust every 3-slot secret and every user row (including duplicate guesses).
// Candidate results are compared against a brute-force game-body oracle.
const exhaustiveSecrets = permutations(rules.map(rule => rule.Target), 3);
const exhaustiveGuesses = rowsWithReplacement(rules.map(rule => rule.Target), 3);
let exhaustiveCases = 0;
for (const exhaustiveGuess of exhaustiveGuesses) {
    const feedbackGroups = new Map();
    for (const exhaustiveSecret of exhaustiveSecrets) {
        const gameResult = gameJudgeAttempt(exhaustiveSecret, exhaustiveGuess, byTarget);
        assert.deepEqual(judgeAttempt(exhaustiveSecret, exhaustiveGuess, byTarget), gameResult);
        const key = gameResult.feedback.join('|');
        if (!feedbackGroups.has(key)) feedbackGroups.set(key, []);
        feedbackGroups.get(key).push(exhaustiveSecret);
        exhaustiveCases += 1;
    }
    for (const [feedbackKey, expectedSecrets] of feedbackGroups) {
        const observation = { guesses: exhaustiveGuess, feedback: feedbackKey.split('|') };
        const result = analyzePuzzle(rules, 3, [observation], 1000);
        assert.equal(result.contradiction, false);
        assert.deepEqual(sortedRowKeys(result.samples), sortedRowKeys(expectedSecrets));
    }
}
assert.equal(exhaustiveCases, 7500);

// Multi-round histories exercise persistent locks and feedback from positions
// that are processed later in the same row. Every result is compared with all
// 60 possible secrets through the independent game oracle.
const multiRoundRandom = createRandom(0xdec0de);
const multiRoundCases = 2500;
for (let trial = 0; trial < multiRoundCases; trial += 1) {
    const multiRoundSecret = exhaustiveSecrets[Math.floor(multiRoundRandom() * exhaustiveSecrets.length)];
    const rawFirstGuess = exhaustiveGuesses[Math.floor(multiRoundRandom() * exhaustiveGuesses.length)];
    const firstResult = gameJudgeAttempt(multiRoundSecret, rawFirstGuess, byTarget);
    const rawSecondGuess = exhaustiveGuesses[Math.floor(multiRoundRandom() * exhaustiveGuesses.length)];
    const actualSecondGuess = rawSecondGuess.map((target, slot) => (
        firstResult.correct[slot] ? multiRoundSecret[slot] : target
    ));
    const secondResult = gameJudgeAttempt(multiRoundSecret, actualSecondGuess, byTarget, firstResult.correct);
    const observations = [
        { guesses: rawFirstGuess, feedback: firstResult.feedback },
        { guesses: actualSecondGuess, feedback: secondResult.feedback }
    ];
    const expectedSecrets = exhaustiveSecrets.filter(candidate => feedbackHistoryMatches(candidate, observations, byTarget));
    const result = analyzePuzzle(rules, 3, observations, 1000);
    assert.equal(result.contradiction, false);
    assert.deepEqual(sortedRowKeys(result.samples), sortedRowKeys(expectedSecrets));
    assert.ok(result.samples.some(candidate => candidate.every((target, slot) => target === multiRoundSecret[slot])));
    const recommendation = makeSuggestion(rules, result, secondResult.correct);
    secondResult.correct.forEach((locked, slot) => {
        if (locked) assert.equal(recommendation[slot], multiRoundSecret[slot]);
    });
}

assert.equal(decodingData.BASES.length, 10);
assert.equal(decodingData.MERGES.length, 45);
assert.equal(new Set(decodingData.MERGES.map(rule => rule.Target)).size, 45);
assert.equal(new Set(decodingData.MERGES.map(rule => [rule.PlantA, rule.PlantB].sort().join('|'))).size, 45);
const currentRulesByTarget = new Map(decodingData.MERGES.map(rule => [rule.Target, rule]));
let currentRuleParityCases = 0;
for (const real of decodingData.MERGES) {
    for (const currentGuess of decodingData.MERGES) {
        assert.deepEqual(
            judgeAttempt([real.Target], [currentGuess.Target], currentRulesByTarget),
            gameJudgeAttempt([real.Target], [currentGuess.Target], currentRulesByTarget)
        );
        currentRuleParityCases += 1;
    }
}
assert.equal(currentRuleParityCases, 2025);
const verifiedGameBody = verifyCurrentGameBody();

console.log(`plant decoding solver tests passed: ${exhaustiveCases} exhaustive, ${multiRoundCases} multi-round, ${currentRuleParityCases} current-rule game-oracle cases; game body ${verifiedGameBody ? 'verified' : 'not present'}`);
