import assert from 'node:assert/strict';
import { analyzePuzzle, judgeAttempt, makeSuggestion, suggestionConfidence } from './solver.mjs';

const rules = [
    { PlantA: 'a', PlantB: 'a', Target: 'aa' },
    { PlantA: 'a', PlantB: 'b', Target: 'ab' },
    { PlantA: 'a', PlantB: 'c', Target: 'ac' },
    { PlantA: 'b', PlantB: 'b', Target: 'bb' },
    { PlantA: 'b', PlantB: 'c', Target: 'bc' }
];
const byTarget = new Map(rules.map(rule => [rule.Target, rule]));
const secret = ['aa', 'bc', 'ac'];
const guess = ['bc', 'bb', 'ac'];
const judged = judgeAttempt(secret, guess, byTarget);

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

const truncated = analyzePuzzle(rules, 3, [{ guesses: guess, feedback: judged.feedback }], 1);
assert.equal(truncated.truncated, true);
assert.ok(truncated.domains.every((domain, index) => domain.length >= analysis.domains[index].length));

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

console.log('plant decoding solver tests passed');
