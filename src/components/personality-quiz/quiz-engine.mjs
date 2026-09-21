export const AXIS_KEYS = Object.freeze([
  'initiative',
  'risk',
  'planning',
  'social',
  'method',
  'tempo',
  'change',
  'presence',
]);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const normalizeVector = (vector = {}) => Object.fromEntries(
  AXIS_KEYS.map((axis) => [axis, clamp(Number(vector[axis]) || 0, -1, 1)]),
);

export const scoreAnswerRecords = (answerRecords, questionMap) => {
  const totals = Object.fromEntries(AXIS_KEYS.map((axis) => [axis, 0]));
  const exposures = Object.fromEntries(AXIS_KEYS.map((axis) => [axis, 0]));

  for (const record of answerRecords) {
    const question = questionMap.get(record.questionId);
    const option = question?.options.find((candidate) => candidate.id === record.optionId);
    if (!option) continue;

    const vector = normalizeVector(option.vector);
    for (const axis of AXIS_KEYS) {
      if (!vector[axis]) continue;
      totals[axis] += vector[axis];
      exposures[axis] += Math.abs(vector[axis]);
    }
  }

  return Object.fromEntries(AXIS_KEYS.map((axis) => [
    axis,
    exposures[axis] ? clamp(totals[axis] / exposures[axis], -1, 1) : 0,
  ]));
};

const squaredDistance = (scores, profile) => AXIS_KEYS.reduce((distance, axis) => {
  const delta = (scores[axis] || 0) - (profile[axis] || 0);
  return distance + delta * delta;
}, 0);

export const rankResults = (scores, results) => results
  .map((result) => ({
    id: result.id,
    distance: Math.sqrt(squaredDistance(scores, result.profile)),
  }))
  .sort((left, right) => left.distance - right.distance || left.id.localeCompare(right.id));

export const needsTieBreak = (ranking, usedTieBreakCount, maxTieBreaks = 2) => {
  if (usedTieBreakCount >= maxTieBreaks || ranking.length < 2) return false;
  return ranking[1].distance - ranking[0].distance < 0.08;
};

export const chooseTieBreakQuestion = ({ ranking, results, tieBreakQuestions, usedQuestionIds }) => {
  const first = results.find((result) => result.id === ranking[0]?.id);
  const second = results.find((result) => result.id === ranking[1]?.id);
  if (!first || !second) return null;

  const axisPreference = AXIS_KEYS
    .map((axis) => ({ axis, delta: Math.abs(first.profile[axis] - second.profile[axis]) }))
    .sort((left, right) => right.delta - left.delta || left.axis.localeCompare(right.axis));

  for (const { axis } of axisPreference) {
    const question = tieBreakQuestions.find((candidate) => (
      candidate.axis === axis && !usedQuestionIds.has(candidate.id)
    ));
    if (question) return question;
  }

  return tieBreakQuestions.find((question) => !usedQuestionIds.has(question.id)) ?? null;
};

export const evaluateQuiz = ({ answers, tieAnswers = [], questions, tieBreakQuestions, results }) => {
  const allQuestions = [...questions, ...tieBreakQuestions];
  const questionMap = new Map(allQuestions.map((question) => [question.id, question]));
  const records = [...answers, ...tieAnswers];
  const scores = scoreAnswerRecords(records, questionMap);
  const ranking = rankResults(scores, results);
  return { scores, ranking };
};

export const getStrongestAxes = (scores, count = 3) => AXIS_KEYS
  .map((axis) => ({ axis, value: scores[axis] || 0, strength: Math.abs(scores[axis] || 0) }))
  .sort((left, right) => right.strength - left.strength || left.axis.localeCompare(right.axis))
  .slice(0, count);
