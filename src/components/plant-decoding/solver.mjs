const DEFAULT_SAMPLE_LIMIT = 4096;

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

export function analyzePuzzle(rules, slotCount, observations, sampleLimit = DEFAULT_SAMPLE_LIMIT) {
    const targets = rules.map(rule => rule.Target);
    const rulesByTarget = new Map(rules.map(rule => [rule.Target, rule]));
    const domains = Array.from({ length: slotCount }, () => new Set(targets));
    const requiredTargets = new Set();
    const forbiddenTargets = new Set();

    for (const observation of observations) {
        observation.feedback.forEach((state, slotIndex) => {
            const guessTarget = observation.guesses[slotIndex];
            const guessRule = rulesByTarget.get(guessTarget);
            if (!guessRule) {
                domains[slotIndex].clear();
                return;
            }

            if (state === 'correct') {
                domains[slotIndex] = new Set([guessTarget]);
            } else if (state === 'change') {
                domains[slotIndex].delete(guessTarget);
                requiredTargets.add(guessTarget);
            } else if (state === 'half') {
                domains[slotIndex] = new Set([...domains[slotIndex]].filter(target => {
                    const realRule = rulesByTarget.get(target);
                    return target !== guessTarget && realRule && judgeHalf(realRule, guessRule);
                }));
                forbiddenTargets.add(guessTarget);
            } else {
                domains[slotIndex] = new Set([...domains[slotIndex]].filter(target => {
                    const realRule = rulesByTarget.get(target);
                    return target !== guessTarget && realRule && !judgeHalf(realRule, guessRule);
                }));
                forbiddenTargets.add(guessTarget);
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
        return {
            contradiction: false,
            domains: domains.map(domain => [...domain]),
            requiredTargets: [],
            samples: sampleInitialSecrets(targets, slotCount, sampleLimit),
            sampleCount: sampleLimit,
            truncated: true
        };
    }

    const samples = [];
    let truncated = false;
    const assignment = Array(slotCount).fill(null);
    const used = new Set();

    function search() {
        if (samples.length >= sampleLimit) {
            truncated = true;
            return;
        }

        let nextSlot = -1;
        let nextValues = null;
        for (let slot = 0; slot < slotCount; slot += 1) {
            if (assignment[slot]) continue;
            const values = [...domains[slot]].filter(target => !used.has(target));
            if (!values.length) return;
            if (!nextValues || values.length < nextValues.length) {
                nextSlot = slot;
                nextValues = values;
            }
        }

        if (nextSlot < 0) {
            if ([...requiredTargets].some(target => !used.has(target))) return;
            if (feedbackMatches(assignment, observations, rulesByTarget)) samples.push(assignment.slice());
            return;
        }

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
            if (truncated) return;
        }
    }

    search();
    if (!samples.length) return contradictionResult(domains);

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

export function makeSuggestion(rules, analysis, lockedBefore = []) {
    let suggestion = localSuggestion(rules, analysis);
    if (!analysis.samples.length || analysis.contradiction) return suggestion;

    const rulesByTarget = new Map(rules.map(rule => [rule.Target, rule]));
    const sampleStride = Math.max(1, Math.ceil(analysis.samples.length / 1024));
    const optimizationSamples = analysis.samples.filter((_, index) => index % sampleStride === 0).slice(0, 1024);
    const candidateStride = Math.max(1, Math.ceil(analysis.samples.length / 96));
    const candidateRows = [
        suggestion,
        ...analysis.samples.filter((_, index) => index % candidateStride === 0).slice(0, 96)
    ];
    let bestRowScore = -Infinity;
    for (const candidateRow of candidateRows) {
        const score = feedbackEntropy(optimizationSamples, candidateRow, rulesByTarget, lockedBefore);
        if (score > bestRowScore) {
            bestRowScore = score;
            suggestion = candidateRow.slice();
        }
    }

    for (let pass = 0; pass < 1; pass += 1) {
        for (let slot = 0; slot < suggestion.length; slot += 1) {
            if (lockedBefore[slot] || analysis.domains[slot].length === 1) continue;
            const usedElsewhere = new Set(suggestion.filter((_, index) => index !== slot));
            let bestTarget = suggestion[slot];
            let bestScore = -Infinity;

            for (const target of analysis.domains[slot]) {
                if (usedElsewhere.has(target)) continue;
                const candidate = suggestion.slice();
                candidate[slot] = target;
                const informationGain = feedbackEntropy(optimizationSamples, candidate, rulesByTarget, lockedBefore);
                const exactMatches = analysis.samples.filter(sample => sample[slot] === target).length;
                const score = informationGain + (exactMatches / analysis.samples.length) * 0.01;
                if (score > bestScore) {
                    bestScore = score;
                    bestTarget = target;
                }
            }
            suggestion[slot] = bestTarget;
        }
    }
    return suggestion;
}

export function suggestionConfidence(analysis, suggestion) {
    if (!analysis.samples.length) return suggestion.map(() => 0);
    return suggestion.map((target, slot) => {
        const matches = analysis.samples.filter(sample => sample[slot] === target).length;
        return matches / analysis.samples.length;
    });
}
