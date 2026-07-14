const DEFAULT_SAMPLE_LIMIT = 4096;
const DIVERSE_SAMPLE_PASSES = 32;
const POSTERIOR_CHAIN_COUNT = 64;
const POSTERIOR_BURN_IN = 400;
const POSTERIOR_THINNING = 12;
const SUGGESTION_OPTIMIZATION_PASSES = 3;
const PROBE_CONFIG = {
    fast: {
        bitsPerRound: 12,
        sampleLimit: 256,
        seedLimit: 32,
        passes: 1,
        minimumOutcomeRatio: 1.5
    },
    balanced: {
        bitsPerRound: 12,
        sampleLimit: 512,
        seedLimit: 64,
        passes: 1,
        minimumOutcomeRatio: 1.25,
        latestProbeRound: 4
    },
    'low-rounds': {
        bitsPerRound: 12,
        sampleLimit: 1024,
        seedLimit: 128,
        passes: 2,
        minimumOutcomeRatio: 1.2
    }
};

export function judgeHalf(real, guess) {
    return (real.PlantA === guess.PlantA && real.PlantB !== guess.PlantB)
        || (real.PlantA === guess.PlantB && real.PlantB !== guess.PlantA)
        || (real.PlantB === guess.PlantB && real.PlantA !== guess.PlantA)
        || (real.PlantB === guess.PlantA && real.PlantA !== guess.PlantB);
}

export function judgeAttempt(secretTargets, guessTargets, rulesByTarget, lockedBefore = []) {
    const correct = Array.from({ length: secretTargets.length }, (_, index) => Boolean(lockedBefore[index]));
    const feedback = Array(secretTargets.length).fill('fault');

    for (let index = 0; index < secretTargets.length; index += 1) {
        if (correct[index]) {
            feedback[index] = 'correct';
            continue;
        }

        const guessTarget = guessTargets[index];
        if (secretTargets[index] === guessTarget) {
            feedback[index] = 'correct';
            correct[index] = true;
            continue;
        }

        const movableIndex = secretTargets.findIndex((target, targetIndex) => (
            target === guessTarget && !correct[targetIndex]
        ));
        if (movableIndex >= 0) {
            feedback[index] = 'change';
            continue;
        }

        const real = rulesByTarget.get(secretTargets[index]);
        const guess = rulesByTarget.get(guessTarget);
        feedback[index] = real && guess && judgeHalf(real, guess) ? 'half' : 'fault';
    }

    return { feedback, correct };
}

function feedbackMatches(secret, observations, rulesByTarget) {
    let locked = Array(secret.length).fill(false);
    for (const observation of observations) {
        const judged = judgeAttempt(secret, observation.guesses, rulesByTarget, locked);
        if (judged.feedback.some((state, index) => state !== observation.feedback[index])) return false;
        locked = judged.correct;
    }
    return true;
}

function propagate(domains, requiredTargets) {
    let changed = true;
    while (changed) {
        changed = false;
        const fixedTargets = domains.filter(domain => domain.size === 1).map(domain => [...domain][0]);
        if (new Set(fixedTargets).size !== fixedTargets.length) return false;

        for (const domain of domains) {
            if (domain.size === 1) continue;
            for (const target of fixedTargets) {
                if (domain.delete(target)) changed = true;
            }
            if (!domain.size) return false;
        }

        for (const target of requiredTargets) {
            const possible = domains.filter(domain => domain.has(target));
            if (!possible.length) return false;
            if (possible.length === 1 && possible[0].size > 1) {
                possible[0].clear();
                possible[0].add(target);
                changed = true;
            }
        }
    }
    return true;
}

function permutationCount(itemCount, slotCount, stopAt) {
    let count = 1;
    for (let index = 0; index < slotCount; index += 1) {
        count *= itemCount - index;
        if (count > stopAt) return count;
    }
    return count;
}

function createRandom(seed) {
    let state = seed >>> 0;
    return () => {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        return state / 0x100000000;
    };
}

function shuffleWithRandom(values, random) {
    for (let index = values.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(random() * (index + 1));
        [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
    }
    return values;
}

function sampleInitialSecrets(targets, slotCount, sampleLimit) {
    const random = createRandom(0xdec0de);
    const samples = [];
    const seen = new Set();
    while (samples.length < sampleLimit) {
        const pool = targets.slice();
        for (let index = pool.length - 1; index > 0; index -= 1) {
            const swapIndex = Math.floor(random() * (index + 1));
            [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
        }
        const sample = pool.slice(0, slotCount);
        const key = sample.join('\u0000');
        if (!seen.has(key)) {
            seen.add(key);
            samples.push(sample);
        }
    }
    return samples;
}

function collectAssignments(domains, requiredTargets, observations, rulesByTarget, limit, options = {}) {
    const random = options.random || null;
    const seen = options.seen || new Set();
    const samples = [];
    const assignment = Array(domains.length).fill(null);
    const used = new Set();
    let stopped = false;

    function search() {
        if (samples.length >= limit) {
            stopped = true;
            return;
        }

        let smallestDomainSize = Infinity;
        const nextSlotCandidates = [];
        const valuesBySlot = new Map();
        for (let slot = 0; slot < domains.length; slot += 1) {
            if (assignment[slot]) continue;
            const values = [...domains[slot]].filter(target => !used.has(target));
            if (!values.length) return;
            valuesBySlot.set(slot, values);
            if (values.length < smallestDomainSize) {
                smallestDomainSize = values.length;
                nextSlotCandidates.length = 0;
                nextSlotCandidates.push(slot);
            } else if (values.length === smallestDomainSize) {
                nextSlotCandidates.push(slot);
            }
        }

        if (!nextSlotCandidates.length) {
            if ([...requiredTargets].some(target => !used.has(target))) return;
            if (!feedbackMatches(assignment, observations, rulesByTarget)) return;
            const key = assignment.join('\u0000');
            if (!seen.has(key)) {
                seen.add(key);
                samples.push(assignment.slice());
            }
            return;
        }

        const nextSlot = random
            ? nextSlotCandidates[Math.floor(random() * nextSlotCandidates.length)]
            : nextSlotCandidates[0];
        const nextValues = valuesBySlot.get(nextSlot);
        if (random) shuffleWithRandom(nextValues, random);
        const unassignedSlots = assignment.reduce((slots, value, index) => {
            if (!value && index !== nextSlot) slots.push(index);
            return slots;
        }, []);

        for (const target of nextValues) {
            assignment[nextSlot] = target;
            used.add(target);

            const missingRequired = [...requiredTargets].filter(required => !used.has(required));
            const canStillPlaceRequired = missingRequired.length <= unassignedSlots.length
                && missingRequired.every(required => unassignedSlots.some(slot => domains[slot].has(required)));
            if (canStillPlaceRequired) search();

            used.delete(target);
            assignment[nextSlot] = null;
            if (stopped) return;
        }
    }

    search();
    return { samples, stopped };
}

function sampleDiverseAssignments(domains, requiredTargets, observations, rulesByTarget, sampleLimit, fallbackSamples) {
    const seen = new Set();
    const samples = [];
    const quota = Math.max(1, Math.ceil(sampleLimit / DIVERSE_SAMPLE_PASSES));

    for (let pass = 0; pass < DIVERSE_SAMPLE_PASSES && samples.length < sampleLimit; pass += 1) {
        const random = createRandom((0xdec0de ^ Math.imul(pass + 1, 0x9e3779b1)) >>> 0);
        const result = collectAssignments(
            domains,
            requiredTargets,
            observations,
            rulesByTarget,
            Math.min(quota, sampleLimit - samples.length),
            { random, seen }
        );
        samples.push(...result.samples);
    }

    for (const sample of fallbackSamples) {
        if (samples.length >= sampleLimit) break;
        const key = sample.join('\u0000');
        if (seen.has(key)) continue;
        seen.add(key);
        samples.push(sample);
    }
    return samples;
}

function samplePosteriorAssignments(targets, domains, observations, rulesByTarget, sampleLimit, seedSamples) {
    if (!seedSamples.length) return [];
    const mutableSlots = domains.reduce((slots, domain, index) => {
        if (domain.size > 1) slots.push(index);
        return slots;
    }, []);
    if (!mutableSlots.length) return Array.from({ length: sampleLimit }, () => seedSamples[0].slice());

    const chainCount = Math.min(POSTERIOR_CHAIN_COUNT, seedSamples.length, sampleLimit);
    const samplesPerChain = Math.ceil(sampleLimit / chainCount);
    const posteriorSamples = [];

    // Swap/replacement proposals are symmetric. Rejecting every proposal that
    // violates a domain or the complete feedback history keeps all collected
    // states valid and targets a uniform distribution over each reachable
    // solution component. Diverse DFS seeds cover disconnected components.
    for (let chain = 0; chain < chainCount && posteriorSamples.length < sampleLimit; chain += 1) {
        const seedIndex = Math.floor(chain * seedSamples.length / chainCount);
        let current = seedSamples[seedIndex].slice();
        const random = createRandom((0x51f15e ^ Math.imul(chain + 1, 0x85ebca6b)) >>> 0);
        const totalSteps = POSTERIOR_BURN_IN + samplesPerChain * POSTERIOR_THINNING;

        for (let step = 0; step < totalSteps && posteriorSamples.length < sampleLimit; step += 1) {
            const proposal = current.slice();
            const unusedTargets = targets.filter(target => !current.includes(target));
            const canSwap = mutableSlots.length > 1;
            const useSwap = canSwap && (!unusedTargets.length || random() < 0.55);

            if (useSwap) {
                const firstOffset = Math.floor(random() * mutableSlots.length);
                let secondOffset = Math.floor(random() * (mutableSlots.length - 1));
                if (secondOffset >= firstOffset) secondOffset += 1;
                const firstSlot = mutableSlots[firstOffset];
                const secondSlot = mutableSlots[secondOffset];
                [proposal[firstSlot], proposal[secondSlot]] = [proposal[secondSlot], proposal[firstSlot]];
            } else if (unusedTargets.length) {
                const slot = mutableSlots[Math.floor(random() * mutableSlots.length)];
                proposal[slot] = unusedTargets[Math.floor(random() * unusedTargets.length)];
            }

            const respectsDomains = proposal.every((target, slot) => domains[slot].has(target));
            if (respectsDomains && feedbackMatches(proposal, observations, rulesByTarget)) current = proposal;

            if (step >= POSTERIOR_BURN_IN && (step - POSTERIOR_BURN_IN) % POSTERIOR_THINNING === 0) {
                posteriorSamples.push(current.slice());
            }
        }
    }
    return posteriorSamples.slice(0, sampleLimit);
}

export function analyzePuzzle(rules, slotCount, observations, sampleLimit = DEFAULT_SAMPLE_LIMIT) {
    const targets = rules.map(rule => rule.Target);
    const rulesByTarget = new Map(rules.map(rule => [rule.Target, rule]));
    const domains = Array.from({ length: slotCount }, () => new Set(targets));
    const requiredTargets = new Set();
    const forbiddenTargets = new Set();
    const lockedTargets = Array(slotCount).fill(null);

    for (const observation of observations) {
        observation.feedback.forEach((state, slotIndex) => {
            const guessTarget = observation.guesses[slotIndex];
            const guessRule = rulesByTarget.get(guessTarget);
            if (!guessRule) {
                domains[slotIndex].clear();
                return;
            }

            if (state === 'correct') {
                const correctTarget = lockedTargets[slotIndex] || guessTarget;
                domains[slotIndex] = new Set([correctTarget]);
                lockedTargets[slotIndex] = correctTarget;
            } else if (state === 'change') {
                domains[slotIndex].delete(guessTarget);
                requiredTargets.add(guessTarget);
            } else if (state === 'half') {
                domains[slotIndex] = new Set([...domains[slotIndex]].filter(target => {
                    const realRule = rulesByTarget.get(target);
                    return target !== guessTarget && realRule && judgeHalf(realRule, guessRule);
                }));
                if (!lockedTargets.includes(guessTarget)) forbiddenTargets.add(guessTarget);
            } else {
                domains[slotIndex] = new Set([...domains[slotIndex]].filter(target => {
                    const realRule = rulesByTarget.get(target);
                    return target !== guessTarget && realRule && !judgeHalf(realRule, guessRule);
                }));
                if (!lockedTargets.includes(guessTarget)) forbiddenTargets.add(guessTarget);
            }
        });
    }

    for (const target of forbiddenTargets) {
        if (requiredTargets.has(target)) return contradictionResult(domains);
        domains.forEach(domain => domain.delete(target));
    }

    if (!propagate(domains, requiredTargets) || domains.some(domain => !domain.size)) {
        return contradictionResult(domains);
    }

    const initialPermutationCount = permutationCount(targets.length, slotCount, sampleLimit);
    if (!observations.length && initialPermutationCount > sampleLimit) {
        const samples = sampleInitialSecrets(targets, slotCount, sampleLimit);
        return {
            contradiction: false,
            domains: domains.map(domain => [...domain]),
            requiredTargets: [],
            samples,
            posteriorSamples: samples,
            sampleCount: sampleLimit,
            truncated: true
        };
    }

    // This deterministic pass owns contradiction/exactness decisions. The
    // randomized passes below only improve the representative distribution;
    // they never decide whether a valid answer exists.
    const exactProbe = collectAssignments(
        domains,
        requiredTargets,
        observations,
        rulesByTarget,
        sampleLimit + 1
    );
    if (!exactProbe.samples.length) return contradictionResult(domains);

    const truncated = exactProbe.samples.length > sampleLimit || exactProbe.stopped;
    const samples = truncated
        ? sampleDiverseAssignments(
            domains,
            requiredTargets,
            observations,
            rulesByTarget,
            sampleLimit,
            exactProbe.samples
        )
        : exactProbe.samples;
    const posteriorSamples = truncated
        ? samplePosteriorAssignments(targets, domains, observations, rulesByTarget, sampleLimit, samples)
        : samples;

    const supportedDomains = truncated
        ? domains.map(domain => [...domain])
        : domains.map((domain, slot) => {
            const supported = new Set(samples.map(sample => sample[slot]));
            return [...domain].filter(target => supported.has(target));
        });

    return {
        contradiction: false,
        domains: supportedDomains,
        requiredTargets: [...requiredTargets],
        samples,
        posteriorSamples,
        sampleCount: samples.length,
        truncated
    };
}

function contradictionResult(domains) {
    return {
        contradiction: true,
        domains: domains.map(domain => [...domain]),
        requiredTargets: [],
        samples: [],
        posteriorSamples: [],
        sampleCount: 0,
        truncated: false
    };
}

function entropy(parts, total) {
    return parts.reduce((score, count) => {
        if (!count) return score;
        const probability = count / total;
        return score - probability * Math.log2(probability);
    }, 0);
}

function feedbackEntropy(samples, guesses, rulesByTarget, lockedBefore) {
    if (!samples.length) return 0;
    const outcomes = new Map();
    for (const secret of samples) {
        const key = judgeAttempt(secret, guesses, rulesByTarget, lockedBefore).feedback.join('|');
        outcomes.set(key, (outcomes.get(key) || 0) + 1);
    }
    return entropy([...outcomes.values()], samples.length);
}

function feedbackStats(samples, guesses, rulesByTarget, lockedBefore) {
    if (!samples.length) return { entropy: 0, outcomeCount: 0 };
    const outcomes = new Map();
    for (const secret of samples) {
        const key = judgeAttempt(secret, guesses, rulesByTarget, lockedBefore).feedback.join('|');
        outcomes.set(key, (outcomes.get(key) || 0) + 1);
    }
    return {
        entropy: entropy([...outcomes.values()], samples.length),
        outcomeCount: outcomes.size
    };
}

function representativeSamples(samples, limit) {
    if (samples.length <= limit) return samples;
    const stride = samples.length / limit;
    return Array.from({ length: limit }, (_, index) => samples[Math.floor(index * stride)]);
}

function localSuggestion(rules, analysis) {
    const rulesByTarget = new Map(rules.map(rule => [rule.Target, rule]));
    const certainTargets = analysis.domains.map(domain => domain.length === 1 ? domain[0] : null);
    const used = new Set(certainTargets.filter(Boolean));

    return analysis.domains.map((domain, slotIndex) => {
        if (certainTargets[slotIndex]) return certainTargets[slotIndex];

        let bestTarget = null;
        let bestScore = -Infinity;
        for (const guess of rules) {
            if (used.has(guess.Target)) continue;
            let correct = 0;
            let half = 0;
            let fault = 0;
            for (const target of domain) {
                if (target === guess.Target) correct += 1;
                else if (judgeHalf(rulesByTarget.get(target), guess)) half += 1;
                else fault += 1;
            }
            const elsewhere = analysis.domains.reduce((count, otherDomain, otherIndex) => (
                count + (otherIndex !== slotIndex && otherDomain.includes(guess.Target) ? 1 : 0)
            ), 0);
            const score = entropy([correct, half, fault], Math.max(1, domain.length)) + Math.min(elsewhere, 2) * 0.08;
            if (score > bestScore) {
                bestScore = score;
                bestTarget = guess.Target;
            }
        }
        if (bestTarget) used.add(bestTarget);
        return bestTarget || domain.find(target => !used.has(target)) || domain[0] || '';
    });
}

function findCloseoutCandidate(samples, lockedBefore) {
    const slotCount = samples[0]?.length || 0;
    const counts = Array.from({ length: slotCount }, () => new Map());
    for (const sample of samples) {
        sample.forEach((target, slot) => {
            counts[slot].set(target, (counts[slot].get(target) || 0) + 1);
        });
    }

    let guesses = samples[0]?.slice() || [];
    let bestExpectedExact = -Infinity;
    for (const sample of samples) {
        const expectedExact = sample.reduce((sum, target, slot) => (
            sum + (lockedBefore[slot] ? 0 : (counts[slot].get(target) || 0) / samples.length)
        ), 0);
        if (expectedExact > bestExpectedExact) {
            bestExpectedExact = expectedExact;
            guesses = sample.slice();
        }
    }

    const unlockedCount = guesses.reduce((count, _, slot) => count + (lockedBefore[slot] ? 0 : 1), 0);
    return {
        guesses,
        counts,
        averageConfidence: unlockedCount ? bestExpectedExact / unlockedCount : 1,
        expectedWrong: unlockedCount - Math.max(0, bestExpectedExact)
    };
}

function shouldCloseOut(closeout) {
    return closeout.averageConfidence >= 0.8 && closeout.expectedWrong <= 0.75;
}

function makeEntropySuggestion(rules, analysis, lockedBefore = []) {
    let suggestion = localSuggestion(rules, analysis);
    if (!analysis.samples.length || analysis.contradiction) return suggestion;

    const rulesByTarget = new Map(rules.map(rule => [rule.Target, rule]));
    const posteriorSamples = analysis.posteriorSamples?.length ? analysis.posteriorSamples : analysis.samples;
    const sampleStride = Math.max(1, Math.ceil(posteriorSamples.length / 1024));
    const optimizationSamples = posteriorSamples.filter((_, index) => index % sampleStride === 0).slice(0, 1024);
    const exactMatchCounts = analysis.domains.map((_, slot) => {
        const counts = new Map();
        for (const sample of posteriorSamples) {
            counts.set(sample[slot], (counts.get(sample[slot]) || 0) + 1);
        }
        return counts;
    });
    const scoreCache = new Map();
    const suggestionScore = candidate => {
        const key = candidate.join('\u0000');
        if (scoreCache.has(key)) return scoreCache.get(key);
        const informationGain = feedbackEntropy(optimizationSamples, candidate, rulesByTarget, lockedBefore);
        const expectedExact = candidate.reduce((count, target, slot) => (
            count + (exactMatchCounts[slot].get(target) || 0) / posteriorSamples.length
        ), 0);
        const score = informationGain + expectedExact * 0.0025;
        scoreCache.set(key, score);
        return score;
    };
    const candidateStride = Math.max(1, Math.ceil(analysis.samples.length / 96));
    const candidateRows = [
        suggestion,
        ...analysis.samples.filter((_, index) => index % candidateStride === 0).slice(0, 96)
    ];
    let bestRowScore = -Infinity;
    for (const candidateRow of candidateRows) {
        const score = suggestionScore(candidateRow);
        if (score > bestRowScore) {
            bestRowScore = score;
            suggestion = candidateRow.slice();
        }
    }

    for (let pass = 0; pass < SUGGESTION_OPTIMIZATION_PASSES; pass += 1) {
        let changed = false;
        for (let slot = 0; slot < suggestion.length; slot += 1) {
            if (lockedBefore[slot] || analysis.domains[slot].length === 1) continue;
            const usedElsewhere = new Set(suggestion.filter((_, index) => index !== slot));
            let bestTarget = suggestion[slot];
            let bestScore = suggestionScore(suggestion);

            for (const target of analysis.domains[slot]) {
                if (usedElsewhere.has(target)) continue;
                const candidate = suggestion.slice();
                candidate[slot] = target;
                const score = suggestionScore(candidate);
                if (score > bestScore + 1e-12) {
                    bestScore = score;
                    bestTarget = target;
                }
            }
            if (bestTarget !== suggestion[slot]) changed = true;
            suggestion[slot] = bestTarget;
        }

        // A one-slot replacement cannot cross states where two occupied slots
        // must move together. Test all legal pair swaps without touching fixed
        // or previously-correct slots.
        let bestSwap = null;
        let bestSwapScore = suggestionScore(suggestion);
        for (let first = 0; first < suggestion.length; first += 1) {
            if (lockedBefore[first] || analysis.domains[first].length === 1) continue;
            for (let second = first + 1; second < suggestion.length; second += 1) {
                if (lockedBefore[second] || analysis.domains[second].length === 1) continue;
                const candidate = suggestion.slice();
                [candidate[first], candidate[second]] = [candidate[second], candidate[first]];
                const score = suggestionScore(candidate);
                if (score > bestSwapScore + 1e-12) {
                    bestSwapScore = score;
                    bestSwap = [first, second];
                }
            }
        }
        if (bestSwap) {
            const [first, second] = bestSwap;
            [suggestion[first], suggestion[second]] = [suggestion[second], suggestion[first]];
            changed = true;
        }
        if (!changed) break;
    }
    return suggestion;
}

function initialPermutationBits(targetCount, slotCount) {
    let bits = 0;
    for (let index = 0; index < slotCount; index += 1) {
        bits += Math.log2(Math.max(1, targetCount - index));
    }
    return bits;
}

export function recommendationProbeRound(targetCount, slotCount, mode = 'balanced') {
    const config = PROBE_CONFIG[mode];
    if (!config) return Infinity;
    const complexityRounds = Math.ceil(initialPermutationBits(targetCount, slotCount) / config.bitsPerRound);
    return Math.min(4, Math.max(2, complexityRounds));
}

function compareProbeScores(left, right) {
    if (left.outcomeCount !== right.outcomeCount) return left.outcomeCount - right.outcomeCount;
    if (Math.abs(left.entropy - right.entropy) > 1e-12) return left.entropy - right.entropy;
    return left.expectedExact - right.expectedExact;
}

function makeOutcomeProbe(rules, analysis, lockedBefore, baseline, config) {
    const rulesByTarget = new Map(rules.map(rule => [rule.Target, rule]));
    const targets = rules.map(rule => rule.Target);
    const optimizationSamples = representativeSamples(analysis.samples, config.sampleLimit);
    const exactMatchCounts = analysis.domains.map((_, slot) => {
        const counts = new Map();
        for (const sample of analysis.samples) {
            counts.set(sample[slot], (counts.get(sample[slot]) || 0) + 1);
        }
        return counts;
    });
    const scoreCache = new Map();
    const scoreCandidate = candidate => {
        const key = candidate.join('\u0000');
        if (scoreCache.has(key)) return scoreCache.get(key);
        const stats = feedbackStats(optimizationSamples, candidate, rulesByTarget, lockedBefore);
        const expectedExact = candidate.reduce((count, target, slot) => (
            count + (exactMatchCounts[slot].get(target) || 0) / analysis.samples.length
        ), 0);
        const score = { ...stats, expectedExact };
        scoreCache.set(key, score);
        return score;
    };

    const seedStride = Math.max(1, Math.ceil(analysis.samples.length / config.seedLimit));
    const seedRows = [
        baseline,
        ...analysis.samples.filter((_, index) => index % seedStride === 0).slice(0, config.seedLimit)
    ];
    let suggestion = baseline.slice();
    let bestScore = scoreCandidate(suggestion);
    for (const seed of seedRows) {
        const candidate = seed.slice();
        lockedBefore.forEach((locked, slot) => {
            if (locked) candidate[slot] = baseline[slot];
        });
        const score = scoreCandidate(candidate);
        if (compareProbeScores(score, bestScore) > 0) {
            suggestion = candidate;
            bestScore = score;
        }
    }

    for (let pass = 0; pass < config.passes; pass += 1) {
        let changed = false;
        for (let slot = 0; slot < suggestion.length; slot += 1) {
            if (lockedBefore[slot]) continue;
            let bestTarget = suggestion[slot];
            let slotBestScore = scoreCandidate(suggestion);
            for (const target of targets) {
                const candidate = suggestion.slice();
                candidate[slot] = target;
                const score = scoreCandidate(candidate);
                if (compareProbeScores(score, slotBestScore) > 0) {
                    bestTarget = target;
                    slotBestScore = score;
                }
            }
            if (bestTarget !== suggestion[slot]) changed = true;
            suggestion[slot] = bestTarget;
        }

        // Single-slot coordinate descent can stop at a local optimum when two
        // occupied probe values need to move together. Try legal pair swaps as
        // a small second step; green slots remain untouched.
        let bestSwap = null;
        let bestSwapScore = scoreCandidate(suggestion);
        for (let first = 0; first < suggestion.length; first += 1) {
            if (lockedBefore[first]) continue;
            for (let second = first + 1; second < suggestion.length; second += 1) {
                if (lockedBefore[second] || suggestion[first] === suggestion[second]) continue;
                const candidate = suggestion.slice();
                [candidate[first], candidate[second]] = [candidate[second], candidate[first]];
                const score = scoreCandidate(candidate);
                if (compareProbeScores(score, bestSwapScore) > 0) {
                    bestSwapScore = score;
                    bestSwap = [first, second];
                }
            }
        }
        if (bestSwap) {
            const [first, second] = bestSwap;
            [suggestion[first], suggestion[second]] = [suggestion[second], suggestion[first]];
            changed = true;
        }
        if (!changed) break;
    }

    const baselineFull = feedbackStats(analysis.samples, baseline, rulesByTarget, lockedBefore);
    const suggestionFull = feedbackStats(analysis.samples, suggestion, rulesByTarget, lockedBefore);
    const requiredOutcomes = Math.ceil(baselineFull.outcomeCount * config.minimumOutcomeRatio);
    return suggestionFull.outcomeCount > baselineFull.outcomeCount
        && suggestionFull.outcomeCount >= requiredOutcomes
        ? suggestion
        : baseline;
}

export function makeSuggestionPlan(rules, analysis, lockedBefore = [], options = {}) {
    const mode = options.mode in PROBE_CONFIG ? options.mode : 'fast';
    const baseline = makeEntropySuggestion(rules, analysis, lockedBefore);
    if (analysis.contradiction || analysis.truncated || analysis.samples.length <= 1) {
        return { guesses: baseline, probe: false };
    }

    const posteriorSamples = analysis.posteriorSamples?.length ? analysis.posteriorSamples : analysis.samples;
    if (shouldCloseOut(findCloseoutCandidate(posteriorSamples, lockedBefore))) {
        return { guesses: baseline, probe: false };
    }

    const config = PROBE_CONFIG[mode];
    const earliestRound = recommendationProbeRound(rules.length, analysis.domains.length, mode);
    const round = Math.max(1, Number(options.round) || 1);
    if (options.probeUsed || round < earliestRound || round > (config.latestProbeRound || Infinity)) {
        return { guesses: baseline, probe: false };
    }

    const probe = makeOutcomeProbe(rules, analysis, lockedBefore, baseline, config);
    const probeSlots = probe.map((target, slot) => target !== baseline[slot]);
    return { guesses: probe, probe: probeSlots.some(Boolean), probeSlots };
}

export function makeSuggestion(rules, analysis, lockedBefore = [], options = {}) {
    return makeSuggestionPlan(rules, analysis, lockedBefore, options).guesses;
}

export function suggestionConfidence(analysis, suggestion) {
    const posteriorSamples = analysis.posteriorSamples?.length ? analysis.posteriorSamples : analysis.samples;
    if (!posteriorSamples.length) return suggestion.map(() => 0);
    return suggestion.map((target, slot) => {
        const matches = posteriorSamples.filter(sample => sample[slot] === target).length;
        return matches / posteriorSamples.length;
    });
}
