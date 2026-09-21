<template>
  <main ref="shellElement" class="pq-shell" :lang="localeMeta.htmlLang" @pointerdown="lastInputWasPointer = true">
    <section v-if="stage === 'intro'" class="pq-panel pq-intro" aria-labelledby="pq-title">
      <div>
        <p class="pq-eyebrow">{{ copy.eyebrow }}</p>
        <h1 id="pq-title">{{ copy.title }}</h1>
        <p class="pq-lede">{{ copy.intro }}</p>
        <div class="pq-actions">
          <button class="pq-button pq-primary" type="button" @click="startQuiz">
            {{ copy.start }} <span aria-hidden="true">→</span>
          </button>
          <button v-if="hasSavedProgress" class="pq-button pq-secondary" type="button" @click="resumeQuiz">
            {{ copy.resume }}
          </button>
        </div>
      </div>

      <div class="pq-plant-stage" aria-hidden="true">
        <img class="pq-plant pq-plant-left" src="/assets/image/quiz-plants/mirrornut.png" alt="">
        <img class="pq-plant pq-plant-center" src="/assets/image/quiz-plants/sunflower.png" alt="">
        <img class="pq-plant pq-plant-right" src="/assets/image/quiz-plants/darkmatterdragonfruit.png" alt="">
        <span class="pq-mystery-mark">?</span>
      </div>
    </section>

    <section v-else-if="stage === 'quiz' || stage === 'tie'" class="pq-panel pq-question-panel" aria-labelledby="pq-question-title">
      <header class="pq-question-header">
        <div>
          <p class="pq-eyebrow">{{ stage === 'tie' ? copy.tieEyebrow : copy.eyebrow }}</p>
          <p v-if="stage === 'tie'" class="pq-tie-intro">{{ copy.tieIntro }}</p>
        </div>
        <p class="pq-progress-label">{{ progressLabel }}</p>
      </header>

      <div class="pq-wave-track" role="progressbar" :aria-label="progressLabel" :aria-valuemin="1"
        :aria-valuemax="stage === 'tie' ? 2 : QUESTIONS.length" :aria-valuenow="progressValue">
        <div class="pq-wave-fill" :style="{ width: `${progressPercent}%` }"><span aria-hidden="true">⚑</span></div>
      </div>

      <Transition name="pq-question" mode="out-in">
        <div :key="currentQuestion.id" class="pq-question-body">
          <h2 id="pq-question-title" ref="questionHeading" tabindex="-1">{{ localize(currentQuestion.prompt) }}</h2>
          <div class="pq-options" role="radiogroup" aria-labelledby="pq-question-title">
            <button v-for="(option, index) in currentQuestion.options" :key="option.id" class="pq-option"
              :class="{ 'is-selected': selectedOptionId === option.id }" type="button" role="radio"
              :aria-checked="selectedOptionId === option.id" @click="selectOption(option.id)">
              <span class="pq-option-key" aria-hidden="true">{{ index + 1 }}</span>
              <span>{{ localize(option.label) }}</span>
              <span class="pq-option-check" aria-hidden="true">✓</span>
            </button>
          </div>
        </div>
      </Transition>

      <footer class="pq-question-footer">
        <button v-if="stage === 'quiz'" class="pq-text-button" type="button" :disabled="currentIndex === 0" @click="goPrevious">
          ← {{ copy.previous }}
        </button>
        <span v-else />
        <p class="pq-keyboard-hint">{{ copy.keyboardHint }}</p>
        <button v-if="stage === 'quiz' && currentIndex === QUESTIONS.length - 1" class="pq-button pq-primary pq-reveal"
          type="button" :disabled="!selectedOptionId" @click="finishCoreQuestions">{{ copy.reveal }}</button>
        <button v-else class="pq-text-button pq-restart" type="button" @click="restartQuiz">{{ copy.restart }}</button>
      </footer>
    </section>

    <section v-else class="pq-panel pq-calculating" aria-live="polite">
      <div class="pq-seed-loader" aria-hidden="true">?</div>
      <h2>{{ copy.calculating }}</h2>
    </section>
    <p class="pq-sr-status" aria-live="polite">{{ liveMessage }}</p>
  </main>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import {
  LOCALES, QUESTIONS, QUIZ_RESULT_SESSION_KEY, QUIZ_SESSION_KEY, QUIZ_VERSION,
  TIE_BREAK_QUESTIONS, UI_COPY, getResultPath, t,
} from './quiz-data.mjs';
import { chooseTieBreakQuestion, evaluateQuiz, needsTieBreak } from './quiz-engine.mjs';
import { RESULTS } from './quiz-results.mjs';
import { trackEvent } from '../analytics';

const props = defineProps({
  locale: { type: String, default: 'zh', validator: (value) => Object.hasOwn(LOCALES, value) },
});
const stage = ref('intro');
const answers = ref([]);
const tieAnswers = ref([]);
const currentIndex = ref(0);
const currentTieQuestionId = ref('');
const hasSavedProgress = ref(false);
const liveMessage = ref('');
const questionHeading = ref(null);
const shellElement = ref(null);
let advanceTimer = 0;
let lastInputWasPointer = false;

const localeMeta = computed(() => LOCALES[props.locale]);
const localize = (value) => t(value, props.locale);
const copy = computed(() => Object.fromEntries(Object.entries(UI_COPY).map(([key, value]) => [key, localize(value)])));
const currentQuestion = computed(() => stage.value === 'tie'
  ? TIE_BREAK_QUESTIONS.find((question) => question.id === currentTieQuestionId.value) ?? TIE_BREAK_QUESTIONS[0]
  : QUESTIONS[currentIndex.value] ?? QUESTIONS[0]);
const currentRecords = computed(() => stage.value === 'tie' ? tieAnswers.value : answers.value);
const selectedOptionId = computed(() => currentRecords.value.find((record) => record.questionId === currentQuestion.value.id)?.optionId ?? '');
const progressValue = computed(() => stage.value === 'tie' ? tieAnswers.value.length + 1 : currentIndex.value + 1);
const progressPercent = computed(() => stage.value === 'tie' ? Math.min(100, progressValue.value * 50) : progressValue.value / QUESTIONS.length * 100);
const progressLabel = computed(() => (stage.value === 'tie' ? copy.value.tieProgress : copy.value.questionProgress)
  .replace('{current}', String(progressValue.value)).replace('{total}', String(QUESTIONS.length)));

const setRecord = (records, questionId, optionId) => [
  ...records.filter((record) => record.questionId !== questionId), { questionId, optionId },
];
const serializeProgress = () => ({
  version: QUIZ_VERSION, locale: props.locale, stage: stage.value, answers: answers.value,
  tieAnswers: tieAnswers.value, currentIndex: currentIndex.value, currentTieQuestionId: currentTieQuestionId.value,
});
const saveProgress = () => {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(QUIZ_SESSION_KEY, JSON.stringify(serializeProgress()));
  hasSavedProgress.value = answers.value.length > 0;
};
const parseSavedProgress = () => {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const saved = JSON.parse(sessionStorage.getItem(QUIZ_SESSION_KEY) || 'null');
    return saved?.version === QUIZ_VERSION && Array.isArray(saved.answers) ? saved : null;
  } catch { return null; }
};
const restoreProgress = (saved) => {
  answers.value = saved.answers.filter((record) => QUESTIONS.some((question) => question.id === record.questionId
    && question.options.some((option) => option.id === record.optionId)));
  tieAnswers.value = (saved.tieAnswers ?? []).filter((record) => TIE_BREAK_QUESTIONS.some((question) => question.id === record.questionId
    && question.options.some((option) => option.id === record.optionId)));
  currentIndex.value = Math.min(Math.max(Number(saved.currentIndex) || 0, 0), QUESTIONS.length - 1);
  currentTieQuestionId.value = TIE_BREAK_QUESTIONS.some((question) => question.id === saved.currentTieQuestionId) ? saved.currentTieQuestionId : '';
  stage.value = saved.stage === 'tie' && currentTieQuestionId.value ? 'tie' : 'quiz';
};
const focusQuestion = async () => {
  await nextTick();
  shellElement.value?.scrollIntoView({
    block: 'start',
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
  });
  if (!lastInputWasPointer) questionHeading.value?.focus({ preventScroll: true });
  lastInputWasPointer = false;
};
const startQuiz = () => {
  window.clearTimeout(advanceTimer);
  answers.value = []; tieAnswers.value = []; currentIndex.value = 0; currentTieQuestionId.value = '';
  stage.value = 'quiz'; saveProgress(); focusQuestion();
};
const resumeQuiz = () => {
  const saved = parseSavedProgress();
  if (!saved) return startQuiz();
  restoreProgress(saved); focusQuestion();
};
const restartQuiz = () => {
  sessionStorage.removeItem(QUIZ_SESSION_KEY); sessionStorage.removeItem(QUIZ_RESULT_SESSION_KEY);
  hasSavedProgress.value = false; startQuiz();
};
const selectOption = (optionId) => {
  window.clearTimeout(advanceTimer);
  if (stage.value === 'tie') tieAnswers.value = setRecord(tieAnswers.value, currentQuestion.value.id, optionId);
  else answers.value = setRecord(answers.value, currentQuestion.value.id, optionId);
  const index = currentQuestion.value.options.findIndex((option) => option.id === optionId);
  liveMessage.value = `${index + 1}. ${localize(currentQuestion.value.options[index].label)}`;
  saveProgress();
  if (stage.value === 'tie') advanceTimer = window.setTimeout(continueAfterTieBreak, 180);
  else if (currentIndex.value < QUESTIONS.length - 1) advanceTimer = window.setTimeout(() => {
    currentIndex.value += 1; saveProgress(); focusQuestion();
  }, 180);
};
const goPrevious = () => {
  if (!currentIndex.value) return;
  window.clearTimeout(advanceTimer); currentIndex.value -= 1; saveProgress(); focusQuestion();
};
const evaluate = () => evaluateQuiz({
  answers: answers.value, tieAnswers: tieAnswers.value, questions: QUESTIONS,
  tieBreakQuestions: TIE_BREAK_QUESTIONS, results: RESULTS,
});
const findNextTieBreak = (evaluation) => chooseTieBreakQuestion({
  ranking: evaluation.ranking, results: RESULTS, tieBreakQuestions: TIE_BREAK_QUESTIONS,
  usedQuestionIds: new Set(tieAnswers.value.map((record) => record.questionId)),
});
const finishCoreQuestions = () => {
  if (!selectedOptionId.value || answers.value.length !== QUESTIONS.length) return;
  const evaluation = evaluate();
  if (needsTieBreak(evaluation.ranking, tieAnswers.value.length)) {
    const question = findNextTieBreak(evaluation);
    if (question) {
      currentTieQuestionId.value = question.id; stage.value = 'tie'; saveProgress(); focusQuestion(); return;
    }
  }
  revealResult(evaluation);
};
const continueAfterTieBreak = () => {
  const evaluation = evaluate();
  if (needsTieBreak(evaluation.ranking, tieAnswers.value.length)) {
    const question = findNextTieBreak(evaluation);
    if (question) { currentTieQuestionId.value = question.id; saveProgress(); focusQuestion(); return; }
  }
  revealResult(evaluation);
};
const revealResult = (evaluation) => {
  const resultId = evaluation.ranking[0].id;
  stage.value = 'calculating';
  trackEvent('quiz_complete', {
    quiz_result: resultId,
    site_locale: props.locale,
    tie_break_used: tieAnswers.value.length > 0,
  });
  sessionStorage.setItem(QUIZ_RESULT_SESSION_KEY, JSON.stringify({
    version: QUIZ_VERSION, locale: props.locale, resultId, scores: evaluation.scores,
    ranking: evaluation.ranking.slice(0, 5), completedAt: Date.now(),
  }));
  sessionStorage.removeItem(QUIZ_SESSION_KEY);
  window.location.assign(getResultPath(resultId, props.locale));
};
const handleKeydown = (event) => {
  lastInputWasPointer = false;
  if (!['quiz', 'tie'].includes(stage.value) || event.altKey || event.ctrlKey || event.metaKey) return;
  const index = Number(event.key) - 1;
  if (!Number.isInteger(index) || !currentQuestion.value.options[index]) return;
  event.preventDefault(); selectOption(currentQuestion.value.options[index].id);
};
onMounted(() => { hasSavedProgress.value = Boolean(parseSavedProgress()?.answers?.length); window.addEventListener('keydown', handleKeydown); });
onBeforeUnmount(() => { window.clearTimeout(advanceTimer); window.removeEventListener('keydown', handleKeydown); });
</script>

<style scoped>
.pq-shell {
  --pq-ink: #f8f5e9;
  --pq-muted: #d0d8d5;
  --pq-line: rgba(255, 255, 255, .24);
  --pq-leaf: #b9dd76;
  --pq-leaf-strong: #d0ed99;
  --pq-sun: #f1c84c;
  --pq-soft: rgba(255, 255, 255, .09);
  position: relative;
  left: 50%;
  width: min(1010px, calc(100vw - 2rem));
  min-height: 570px;
  margin: 1.5rem 0 3rem;
  overflow: hidden;
  scroll-margin-top: 70px;
  color: var(--pq-ink);
  font-family: "Noto Sans SC", Arial, sans-serif;
  background:
    linear-gradient(90deg, rgba(3, 15, 25, .91) 0%, rgba(3, 15, 25, .72) 48%, rgba(3, 15, 25, .86) 100%),
    url('/assets/image/background-origin.webp') center 44% / cover no-repeat;
  border: 1px solid rgba(255, 255, 255, .2);
  box-shadow: 0 18px 50px rgba(0, 0, 0, .22);
  transform: translateX(-50%);
}

.pq-panel {
  min-height: 570px;
  padding: clamp(1.75rem, 4vw, 3rem) clamp(1.25rem, 5vw, 4.5rem);
  background: linear-gradient(90deg, rgba(4, 18, 29, .66), rgba(4, 18, 29, .4));
  border-block: 1px solid var(--pq-line);
}

.pq-intro {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(300px, .85fr);
  align-items: center;
  gap: clamp(2rem, 7vw, 6rem);
  overflow: hidden;
}

.pq-intro::after {
  position: absolute;
  inset: auto 0 0;
  height: 8px;
  content: "";
  background: repeating-linear-gradient(90deg, #58823e 0 42px, #6e954d 42px 84px);
}

.pq-eyebrow {
  margin: 0 0 .85rem;
  color: var(--pq-leaf);
  font-size: .78rem;
  font-weight: 800;
  letter-spacing: .13em;
  text-transform: uppercase;
}

.pq-intro h1,
.pq-question-body h2,
.pq-calculating h2 {
  margin: 0;
  font-family: "pvzgeFontEN", "pvzgFont", "Noto Sans SC", sans-serif;
  letter-spacing: .01em;
}

.pq-intro h1 {
  max-width: 12ch;
  font-size: clamp(2.6rem, 5vw, 4.3rem);
  line-height: 1.02;
}

.pq-lede {
  max-width: 36rem;
  margin: 1.35rem 0 0;
  color: var(--pq-muted);
  font-size: clamp(1rem, 1.55vw, 1.12rem);
  line-height: 1.75;
}

.pq-actions {
  display: flex;
  flex-wrap: wrap;
  gap: .75rem;
  margin-top: 2rem;
}

.pq-button,
.pq-option,
.pq-text-button {
  min-height: 44px;
  font: inherit;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.pq-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: .8rem;
  padding: .82rem 1.25rem;
  color: #17240f;
  font-weight: 800;
  background: #b9dd76;
  border: 1px solid #d9efa8;
  border-radius: 4px;
  transition: background-color 140ms ease, transform 140ms ease;
}

.pq-secondary {
  color: var(--pq-ink);
  background: transparent;
  border-color: var(--pq-line);
}

.pq-button:hover:not(:disabled) { background: #cae991; }
.pq-secondary:hover:not(:disabled) { color: var(--pq-leaf-strong); background: var(--pq-soft); }
.pq-button:active:not(:disabled) { transform: translateY(1px); }
.pq-button:disabled { cursor: not-allowed; opacity: .42; }

.pq-plant-stage {
  position: relative;
  height: 390px;
}

.pq-plant-stage::before {
  position: absolute;
  inset: auto 2% 42px;
  height: 8px;
  content: "";
  background: repeating-linear-gradient(90deg, #547c3b 0 42px, #6b914b 42px 84px);
  border-bottom: 3px solid #765b38;
}

.pq-plant-stage::after {
  position: absolute;
  inset: auto 8% 7px;
  height: 18px;
  content: "";
  background: radial-gradient(ellipse, rgba(59, 50, 35, .22), transparent 70%);
}

.pq-plant {
  position: absolute;
  z-index: 1;
  inset-block-end: 45px;
  inset-inline-start: 50%;
  width: 210px;
  height: 260px;
  object-fit: contain;
  filter: drop-shadow(0 10px 5px rgba(49, 60, 28, .2));
  transform-origin: 50% 100%;
}

.pq-plant-left { transform: translateX(-92%) scale(.82) rotate(-5deg); }
.pq-plant-center { z-index: 2; transform: translateX(-50%); }
.pq-plant-right { transform: translateX(-8%) scale(.84) rotate(5deg); }

.pq-mystery-mark {
  position: absolute;
  z-index: 3;
  inset-block-start: 34px;
  inset-inline-end: 12%;
  color: var(--pq-leaf-strong);
  font-family: "pvzgeFontEN", "pvzgFont", sans-serif;
  font-size: 4.5rem;
  line-height: 1;
  transform: rotate(7deg);
}

.pq-question-panel {
  display: flex;
  flex-direction: column;
  width: min(840px, 100%);
  margin-inline: auto;
}

.pq-question-header,
.pq-question-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.pq-question-header .pq-eyebrow { margin-bottom: .2rem; }
.pq-tie-intro,
.pq-progress-label,
.pq-keyboard-hint { margin: 0; color: var(--pq-muted); font-size: .86rem; }
.pq-progress-label { flex: none; font-variant-numeric: tabular-nums; }

.pq-wave-track {
  height: 3px;
  margin: 1.15rem 0 2.7rem;
  background: var(--pq-line);
}

.pq-wave-fill {
  position: relative;
  height: 100%;
  background: var(--pq-leaf);
  transition: width 260ms cubic-bezier(.2, .75, .25, 1);
}

.pq-wave-fill span {
  position: absolute;
  inset-inline-end: -8px;
  inset-block-start: -19px;
  color: var(--pq-sun);
  font-size: 1.2rem;
}

.pq-question-body { flex: 1; }
.pq-question-body h2 {
  max-width: 30ch;
  margin: 0 0 2rem;
  font-size: clamp(1.7rem, 3.6vw, 2.65rem);
  line-height: 1.3;
  outline: none;
}

.pq-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 1.6rem;
  border-top: 1px solid var(--pq-line);
}

.pq-option {
  display: grid;
  grid-template-columns: 32px 1fr 22px;
  gap: .8rem;
  align-items: center;
  min-height: 88px;
  padding: 1rem .35rem;
  color: var(--pq-ink);
  text-align: start;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--pq-line);
  transition: color 130ms ease, background-color 130ms ease;
}

.pq-option:hover { color: var(--pq-leaf-strong); background: var(--pq-soft); }
.pq-option.is-selected { color: var(--pq-leaf-strong); background: rgba(185, 221, 118, .18); }

.pq-option-key {
  color: var(--pq-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: .78rem;
  font-weight: 800;
}

.pq-option.is-selected .pq-option-key { color: var(--pq-leaf-strong); }
.pq-option-check { color: transparent; font-size: 1.05rem; font-weight: 900; }
.pq-option.is-selected .pq-option-check { color: var(--pq-leaf-strong); }

.pq-question-footer {
  min-height: 54px;
  margin-top: 2rem;
  padding-top: 1.2rem;
  border-top: 1px solid var(--pq-line);
}

.pq-text-button {
  padding: .55rem .25rem;
  color: var(--pq-leaf-strong);
  background: transparent;
  border: 0;
  font-weight: 700;
}

.pq-text-button:hover:not(:disabled) { text-decoration: underline; text-underline-offset: 4px; }
.pq-text-button:active:not(:disabled) { transform: translateY(1px); }
.pq-text-button:disabled { cursor: default; opacity: .3; }
.pq-restart { color: var(--pq-muted); }
.pq-reveal { min-width: 180px; }

.pq-calculating { display: grid; place-content: center; justify-items: center; text-align: center; }
.pq-seed-loader {
  display: grid;
  place-items: center;
  width: 92px;
  height: 108px;
  margin-bottom: 2rem;
  color: var(--pq-leaf-strong);
  background: var(--pq-soft);
  border: 2px solid var(--pq-line);
  border-radius: 3px;
  font-family: "pvzgeFontEN", "pvzgFont", sans-serif;
  font-size: 3rem;
  font-weight: 900;
}

.pq-question-enter-active,
.pq-question-leave-active { transition: opacity 140ms ease, transform 140ms ease; }
.pq-question-enter-from { opacity: 0; transform: translateX(10px); }
.pq-question-leave-to { opacity: 0; transform: translateX(-8px); }
.pq-sr-status { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap; }
.pq-shell :focus-visible { outline: 3px solid var(--pq-sun); outline-offset: 3px; }

@media (max-width: 780px) {
  .pq-shell { width: min(100%, calc(100vw - 1rem)); min-height: 0; margin-top: .75rem; background-position: 50% center; }
  .pq-panel { min-height: 0; padding: 1.4rem .35rem 2rem; background: rgba(4, 18, 29, .7); }
  .pq-intro { grid-template-columns: 1fr; gap: .8rem; padding-inline: 1rem; }
  .pq-intro h1 { max-width: 14ch; font-size: clamp(2.35rem, 12vw, 3.7rem); }
  .pq-plant-stage { order: -1; height: 210px; }
  .pq-plant-stage::before { inset-inline: 0; }
  .pq-plant { inset-block-end: 35px; width: 130px; height: 155px; }
  .pq-mystery-mark { inset-block-start: 18px; inset-inline-end: 8%; font-size: 3rem; }
  .pq-options { grid-template-columns: 1fr; }
  .pq-option { min-height: 68px; }
  .pq-keyboard-hint { display: none; }
  .pq-question-footer { align-items: flex-end; }
  .pq-reveal { min-width: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .pq-shell *, .pq-shell *::before, .pq-shell *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; }
}

@media (prefers-contrast: more) {
  .pq-shell { --pq-line: currentColor; }
  .pq-option, .pq-panel { border-width: 2px; }
}
</style>
