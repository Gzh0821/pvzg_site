<template>
  <main v-if="result" ref="shellElement" class="pqr-shell" :lang="localeMeta.htmlLang">
    <section class="pqr-hero">
      <div class="pqr-copy">
        <p class="pqr-eyebrow">{{ copy.resultEyebrow }}</p>
        <p class="pqr-archetype">{{ localize(ARCHETYPE_COPY[result.archetype]) }}</p>
        <h1>{{ localize(result.name) }}</h1>
        <p class="pqr-title">{{ localize(result.title) }}</p>
        <div class="pqr-tags" aria-label="Personality traits">
          <span v-for="tag in traitTags" :key="tag">{{ tag }}</span>
        </div>
        <blockquote>“{{ localize(result.motto) }}”</blockquote>
      </div>

      <div class="pqr-reveal" :class="{ 'is-revealed': revealed }">
        <div class="pqr-plant-stage">
          <span class="pqr-sun-mark" aria-hidden="true">✦</span>
          <img :src="plantImage(result.id)" :alt="localize(result.name)">
        </div>
      </div>
    </section>

    <section class="pqr-actions" aria-label="Result actions">
      <button class="pqr-button pqr-primary" type="button" @click="shareResult">{{ copy.share }}</button>
      <button class="pqr-button" type="button" @click="copyResult">{{ copy.copy }}</button>
      <button class="pqr-button" type="button" @click="downloadCard">{{ copy.download }}</button>
      <a class="pqr-link" :href="quizPath">↻ {{ copy.retry }}</a>
      <a class="pqr-link" :href="almanacPath">{{ copy.almanac }} →</a>
    </section>

    <section class="pqr-section pqr-why" aria-labelledby="pqr-why-title">
      <div>
        <h2 id="pqr-why-title">{{ copy.whyTitle }}</h2>
        <p>{{ whyText }}</p>
      </div>
    </section>

    <AdSenseUnit />

    <section class="pqr-section" aria-labelledby="pqr-mechanic-title">
      <div>
        <h2 id="pqr-mechanic-title">{{ copy.mechanicTitle }}</h2>
        <p>{{ localize(result.mechanism) }}</p>
      </div>
    </section>

    <section v-if="personalResult" class="pqr-section" aria-labelledby="pqr-axis-title">
      <div>
        <h2 id="pqr-axis-title">{{ copy.axisTitle }}</h2>
        <div class="pqr-axes">
          <div v-for="axis in axisRows" :key="axis.axis" class="pqr-axis-row">
            <span>{{ localize(AXIS_COPY[axis.axis].negative) }}</span>
            <div class="pqr-axis-track" aria-hidden="true">
              <i></i><b :style="axisMarkerStyle(axis.value)"></b>
            </div>
            <span>{{ localize(AXIS_COPY[axis.axis].positive) }}</span>
          </div>
        </div>
      </div>
    </section>

    <section v-if="nearbyResults.length" class="pqr-section" aria-labelledby="pqr-close-title">
      <div>
        <h2 id="pqr-close-title">{{ copy.closeTitle }}</h2>
        <div class="pqr-nearby">
          <a v-for="nearby in nearbyResults" :key="nearby.id" :href="resultPath(nearby.id)">
            <img :src="plantImage(nearby.id)" alt="">
            <span>{{ localize(nearby.name) }}</span>
          </a>
        </div>
      </div>
    </section>

    <Teleport to="body">
      <p class="pqr-toast" :class="{ 'is-visible': toast }" role="status" aria-live="polite">{{ toast }}</p>
    </Teleport>
  </main>
</template>

<script setup>
import QRCode from 'qrcode';
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

import AdSenseUnit from '../almanac-v2/AdSenseUnit.vue';
import { trackEvent } from '../analytics';
import {
  AXIS_COPY, LOCALES, QUIZ_RESULT_SESSION_KEY, QUIZ_VERSION, UI_COPY,
  getQuizPath, getResultPath, t,
} from './quiz-data.mjs';
import { AXIS_KEYS, getStrongestAxes } from './quiz-engine.mjs';
import { ARCHETYPE_COPY, RESULTS, getResultById } from './quiz-results.mjs';

const props = defineProps({
  locale: { type: String, default: 'zh', validator: (value) => Object.hasOwn(LOCALES, value) },
  resultId: { type: String, required: true },
});

const localeMeta = computed(() => LOCALES[props.locale] ?? LOCALES.zh);
const result = computed(() => getResultById(props.resultId));
const localize = (value) => t(value, props.locale);
const copy = computed(() => Object.fromEntries(Object.entries(UI_COPY).map(([key, value]) => [key, localize(value)])));
const personalResult = ref(null);
const revealed = ref(false);
const toast = ref('');
const shellElement = ref(null);
let toastTimer = 0;

const sourceScores = computed(() => personalResult.value?.scores ?? result.value?.profile ?? {});
const strongestAxes = computed(() => getStrongestAxes(sourceScores.value, 3));
const traitTags = computed(() => strongestAxes.value.map(({ axis, value }) => localize(
  AXIS_COPY[axis][value >= 0 ? 'positive' : 'negative'],
)));
const whyText = computed(() => localize(result.value.fit));
const axisRows = computed(() => AXIS_KEYS.map((axis) => ({ axis, value: sourceScores.value[axis] ?? 0 })));
const nearbyResults = computed(() => (personalResult.value?.ranking ?? [])
  .slice(1, 4)
  .map(({ id }) => getResultById(id))
  .filter(Boolean));
const quizPath = computed(() => getQuizPath(props.locale));
const resultPath = (id) => getResultPath(id, props.locale);
const plantImage = (id) => `/assets/image/quiz-plants/${id}.png`;
const almanacPath = computed(() => `${props.locale === 'zh' ? '' : '/en'}/almanac/plants/${result.value.id}.html`);
const resultNumber = computed(() => RESULTS.findIndex((candidate) => candidate.id === result.value.id) + 1);

const axisMarkerStyle = (value) => ({ insetInlineStart: `${Math.max(2, Math.min(98, (value + 1) * 50))}%` });
const resultUrl = () => `https://www.pvzge.com${resultPath(result.value.id)}`;
const resultText = () => copy.value.resultTemplate
  .replace('{name}', localize(result.value.name))
  .replace('{title}', localize(result.value.title))
  .replace('{url}', resultUrl());

const showToast = (message) => {
  window.clearTimeout(toastTimer);
  toast.value = message;
  toastTimer = window.setTimeout(() => { toast.value = ''; }, 2400);
};
const copyText = async (text) => {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const textarea = document.createElement('textarea');
  textarea.value = text; textarea.style.position = 'fixed'; textarea.style.opacity = '0';
  document.body.append(textarea); textarea.select(); document.execCommand('copy'); textarea.remove();
};
const copyResult = async () => {
  await copyText(resultText());
  showToast(copy.value.copied);
};

const loadImage = (source) => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = reject;
  image.src = source;
});
const fitText = (context, text, maxWidth, startSize, minSize, family) => {
  let size = startSize;
  while (size >= minSize) {
    context.font = `700 ${size}px ${family}`;
    if (context.measureText(text).width <= maxWidth) return;
    size -= 2;
  }
  context.font = `700 ${minSize}px ${family}`;
};
const drawContainedImage = (context, image, x, y, width, height) => {
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  context.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
};
const canvasBlob = (canvas) => new Promise((resolve, reject) => {
  canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Unable to create share card')), 'image/png');
});
const buildCardBlob = async () => {
  await Promise.all([
    document.fonts?.load('96px "pvzgFont"'),
    document.fonts?.load('96px "pvzgeFontEN"'),
  ].filter(Boolean));

  const qrDataUrl = await QRCode.toDataURL(resultUrl(), {
    width: 360,
    margin: 2,
    color: { dark: '#173f3fff', light: '#ffffffff' },
  });
  const [logo, plant, qrCode] = await Promise.all([
    loadImage('/pvzg_nav.webp'),
    loadImage(plantImage(result.value.id)),
    loadImage(qrDataUrl),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1440;
  const context = canvas.getContext('2d');
  const titleFont = props.locale === 'zh' ? '"pvzgFont", sans-serif' : '"pvzgeFontEN", sans-serif';

  context.fillStyle = '#d8e5f0';
  context.fillRect(0, 0, 1080, 1440);
  context.fillStyle = '#b9d3f2';
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(1080, 0);
  context.lineTo(1080, 344);
  context.bezierCurveTo(760, 250, 520, 430, 0, 292);
  context.closePath();
  context.fill();

  context.drawImage(logo, 58, 38, 260, 82);
  context.fillStyle = '#5a7080';
  context.font = '700 23px Arial, sans-serif';
  context.textAlign = 'right';
  context.fillText(`${resultNumber.value} / ${RESULTS.length}`, 1000, 82);
  context.textAlign = 'left';

  context.fillStyle = '#b94735';
  context.font = `700 32px ${titleFont}`;
  context.fillText(copy.value.shareEyebrow, 70, 174);
  context.fillStyle = '#19384a';
  fitText(context, localize(result.value.name), 900, 92, 54, titleFont);
  context.fillText(localize(result.value.name), 70, 286);
  context.fillStyle = '#b94735';
  fitText(context, localize(result.value.title), 900, 48, 32, titleFont);
  context.fillText(localize(result.value.title), 70, 368);
  context.fillStyle = '#19384a';
  context.font = '700 30px "Noto Sans SC", Arial, sans-serif';
  context.fillText(traitTags.value.join(' · '), 70, 430);

  context.save();
  context.translate(540, 745);
  context.fillStyle = '#f0b46f';
  context.beginPath();
  for (let index = 0; index < 64; index += 1) {
    const angle = Math.PI * 2 * index / 64 - Math.PI / 2;
    const radius = index % 2 ? 278 : 322;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (!index) context.moveTo(x, y); else context.lineTo(x, y);
  }
  context.closePath();
  context.fill();
  context.fillStyle = '#f8dbb4';
  context.beginPath();
  context.arc(0, 0, 258, 0, Math.PI * 2);
  context.fill();
  context.restore();
  drawContainedImage(context, plant, 250, 475, 580, 550);

  context.fillStyle = '#6f9e4d';
  context.beginPath();
  context.moveTo(0, 1038);
  context.bezierCurveTo(210, 982, 420, 1084, 650, 1028);
  context.bezierCurveTo(840, 982, 960, 1000, 1080, 1020);
  context.lineTo(1080, 1128);
  context.lineTo(0, 1128);
  context.closePath();
  context.fill();
  context.strokeStyle = '#dadd99';
  context.lineWidth = 11;
  context.beginPath();
  context.moveTo(0, 1060);
  context.bezierCurveTo(210, 1004, 420, 1106, 650, 1050);
  context.bezierCurveTo(840, 1004, 960, 1022, 1080, 1042);
  context.stroke();

  context.fillStyle = '#19384a';
  context.fillRect(0, 1104, 1080, 336);
  context.fillStyle = '#f8f5e9';
  fitText(context, `“${localize(result.value.motto)}”`, 700, 34, 20, '"Noto Sans SC", Arial, sans-serif');
  context.fillText(`“${localize(result.value.motto)}”`, 70, 1244);
  context.fillStyle = '#d8e5f0';
  context.font = '700 32px Arial, sans-serif';
  context.fillText('PVZGE.COM', 70, 1390);

  context.imageSmoothingEnabled = false;
  context.drawImage(qrCode, 824, 1150, 200, 200);
  context.imageSmoothingEnabled = true;
  context.fillStyle = '#f8f5e9';
  context.font = `700 22px ${titleFont}`;
  context.textAlign = 'center';
  context.fillText(copy.value.scanToQuiz, 924, 1382);

  return canvasBlob(canvas);
};
const shareResult = async () => {
  try {
    const blob = await buildCardBlob();
    const file = new File([blob], `pvzge-plant-${result.value.id}.png`, { type: 'image/png' });
    if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
      await navigator.share({ title: localize(result.value.title), text: resultText(), url: resultUrl(), files: [file] });
      trackEvent('quiz_share', { share_method: 'native_file', site_locale: props.locale });
      return;
    }
    if (navigator.share) {
      await navigator.share({ title: localize(result.value.title), text: resultText(), url: resultUrl() });
      trackEvent('quiz_share', { share_method: 'native_link', site_locale: props.locale });
      return;
    }
  } catch (error) {
    if (error?.name === 'AbortError') return;
  }
  await copyText(resultText());
  trackEvent('quiz_share', { share_method: 'copy', site_locale: props.locale });
  showToast(copy.value.unavailableShare);
};
const downloadCard = async () => {
  const blob = await buildCardBlob(); const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = `pvzge-plant-${result.value.id}.png`; anchor.click();
  URL.revokeObjectURL(url); showToast(copy.value.shareReady);
};

onMounted(async () => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(QUIZ_RESULT_SESSION_KEY) || 'null');
    if (saved?.version === QUIZ_VERSION && saved.resultId === result.value.id) personalResult.value = saved;
  } catch { personalResult.value = null; }
  await nextTick();
  shellElement.value?.scrollIntoView({ block: 'start', behavior: 'auto' });
  requestAnimationFrame(() => { revealed.value = true; });
});
onBeforeUnmount(() => window.clearTimeout(toastTimer));
</script>

<style scoped>
.pqr-shell {
  --pqr-ink: #f8f5e9;
  --pqr-muted: #d0d8d5;
  --pqr-line: rgba(255, 255, 255, .24);
  --pqr-leaf: #b9dd76;
  --pqr-leaf-strong: #d0ed99;
  --pqr-sun: #f1c84c;
  --pqr-soft: rgba(255, 255, 255, .09);
  position: relative;
  left: 50%;
  width: min(980px, calc(100vw - 2rem));
  margin: 1.5rem 0 3rem;
  overflow: hidden;
  scroll-margin-top: 70px;
  color: var(--pqr-ink);
  font-family: "Noto Sans SC", Arial, sans-serif;
  background: #061927;
  border: 1px solid rgba(255, 255, 255, .2);
  box-shadow: 0 18px 50px rgba(0, 0, 0, .22);
  transform: translateX(-50%);
}

.pqr-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(300px, .9fr);
  gap: clamp(2rem, 8vw, 6rem);
  align-items: center;
  min-height: 560px;
  padding: clamp(2rem, 6vw, 5rem) clamp(1rem, 4vw, 3rem);
  overflow: hidden;
  background:
    linear-gradient(90deg, rgba(3, 15, 25, .91) 0%, rgba(3, 15, 25, .67) 50%, rgba(3, 15, 25, .84) 100%),
    url('/assets/image/background-origin.webp') center 44% / cover no-repeat;
  border-block: 1px solid var(--pqr-line);
}

.pqr-hero::after {
  position: absolute;
  inset: auto 0 0;
  height: 8px;
  content: "";
  background: repeating-linear-gradient(90deg, #58823e 0 42px, #6e954d 42px 84px);
}

.pqr-eyebrow {
  margin: 0 0 .6rem;
  color: var(--pqr-leaf);
  font-size: .78rem;
  font-weight: 800;
  letter-spacing: .14em;
  text-transform: uppercase;
}

.pqr-archetype { margin: 0 0 1rem; color: var(--pqr-muted); font-size: .9rem; }
.pqr-copy h1 {
  margin: 0;
  font-family: "pvzgeFontEN", "pvzgFont", "Noto Sans SC", sans-serif;
  font-size: clamp(3.2rem, 8vw, 6.8rem);
  line-height: .94;
}

.pqr-title { margin: 1.05rem 0 0; color: var(--pqr-leaf-strong); font-size: clamp(1.2rem, 2.8vw, 1.85rem); font-weight: 800; }
.pqr-tags { display: flex; flex-wrap: wrap; gap: .3rem 0; margin: 1.45rem 0; color: var(--pqr-muted); font-size: .88rem; }
.pqr-tags span { display: inline-flex; align-items: center; }
.pqr-tags span:not(:last-child)::after { margin: 0 .65rem; color: var(--pqr-leaf); content: "•"; }
.pqr-copy blockquote { max-width: 34rem; margin: 1.3rem 0 0; padding: 0; color: var(--pqr-muted); border: 0; font-size: 1rem; line-height: 1.75; }

.pqr-reveal { position: relative; min-height: 390px; }
.pqr-plant-stage {
  position: relative;
  display: grid;
  place-items: center;
  width: min(100%, 390px);
  height: 390px;
  margin: auto;
  opacity: 0;
  transform: translateY(28px) scale(.96);
  transition: opacity 420ms ease, transform 560ms cubic-bezier(.2, .78, .25, 1);
}

.pqr-plant-stage::before {
  position: absolute;
  inset: auto 5% 52px;
  height: 8px;
  content: "";
  background: repeating-linear-gradient(90deg, #547c3b 0 42px, #6b914b 42px 84px);
  border-bottom: 3px solid #765b38;
}

.pqr-plant-stage::after {
  position: absolute;
  inset: auto 14% 36px;
  height: 28px;
  content: "";
  background: radial-gradient(ellipse, rgba(58, 47, 30, .25), transparent 70%);
}

.pqr-reveal.is-revealed .pqr-plant-stage { opacity: 1; transform: none; }
.pqr-plant-stage img { position: relative; z-index: 1; width: 92%; height: 92%; object-fit: contain; filter: drop-shadow(0 12px 7px rgba(50, 61, 28, .23)); }
.pqr-sun-mark { position: absolute; z-index: 2; inset-block-start: 6px; inset-inline-end: 6%; color: var(--pqr-sun); font-size: 4rem; line-height: 1; transform: rotate(12deg); }

.pqr-section {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  margin: 0;
  padding: clamp(2rem, 5vw, 3.5rem) clamp(1rem, 4vw, 3rem);
  background: rgba(4, 18, 29, .94);
  border-bottom: 1px solid var(--pqr-line);
}

.pqr-section h2 {
  margin: 0 0 1rem;
  color: var(--pqr-leaf-strong);
  font-family: "pvzgeFontEN", "pvzgFont", "Noto Sans SC", sans-serif;
  font-size: clamp(1.4rem, 3vw, 2rem);
}

.pqr-section p { max-width: 52rem; margin: .4rem 0; color: var(--pqr-muted); line-height: 1.85; }
.pqr-why { background: #0a2330; }

.pqr-axes { display: grid; gap: 1.05rem; max-width: 760px; }
.pqr-axis-row { display: grid; grid-template-columns: 82px 1fr 82px; gap: .9rem; align-items: center; color: var(--pqr-muted); font-size: .82rem; }
.pqr-axis-row > span:last-child { text-align: end; }
.pqr-axis-track { position: relative; height: 2px; background: var(--pqr-line); }
.pqr-axis-track i { position: absolute; inset-block-start: -4px; inset-inline-start: 50%; width: 1px; height: 10px; background: var(--pqr-line); }
.pqr-axis-track b { position: absolute; inset-block-start: 50%; width: 12px; height: 12px; background: var(--pqr-sun); border: 2px solid #061927; border-radius: 50%; box-shadow: 0 0 0 1px var(--pqr-sun); transform: translate(-50%, -50%); }

.pqr-nearby { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0 1.5rem; border-top: 1px solid var(--pqr-line); }
.pqr-nearby a { display: grid; grid-template-columns: 58px 1fr; gap: .65rem; align-items: center; min-height: 78px; padding: .55rem 0; color: var(--pqr-ink); border-bottom: 1px solid var(--pqr-line); text-decoration: none; transition: color 130ms ease, background-color 130ms ease; }
.pqr-nearby a:hover { color: var(--pqr-leaf-strong); background: var(--pqr-soft); }
.pqr-nearby img { width: 56px; height: 56px; object-fit: contain; }

.pqr-actions { display: flex; flex-wrap: wrap; gap: .7rem; align-items: center; padding: 2rem clamp(1rem, 4vw, 3rem) 1rem; background: #061927; }
.pqr-button, .pqr-link { min-height: 44px; padding: .72rem 1rem; font: inherit; font-weight: 750; border-radius: 4px; }
.pqr-button { color: var(--pqr-ink); background: transparent; border: 1px solid var(--pqr-line); cursor: pointer; transition: background-color 130ms ease, transform 130ms ease; }
.pqr-button:hover { background: var(--pqr-soft); }
.pqr-button:active { transform: translateY(1px); }
.pqr-primary { color: #17240f; background: #b9dd76; border-color: #d9efa8; }
.pqr-primary:hover { background: #cae991; }
.pqr-link { display: inline-flex; align-items: center; color: var(--pqr-leaf-strong); text-decoration: none; }
.pqr-link:hover { text-decoration: underline; text-underline-offset: 4px; }
.pqr-toast { position: fixed; inset-inline-start: 50%; inset-block-end: 24px; z-index: 20; margin: 0; padding: .75rem 1rem; color: #f8f5e9; background: #061927; border: 1px solid var(--pqr-line); border-radius: 4px; box-shadow: 0 8px 24px rgba(0, 0, 0, .28); opacity: 0; transform: translate(-50%, 10px); pointer-events: none; transition: opacity 150ms ease, transform 150ms ease; }
.pqr-toast.is-visible { opacity: 1; transform: translate(-50%, 0); }
.pqr-shell :focus-visible { outline: 3px solid var(--pqr-sun); outline-offset: 3px; }

@media (max-width: 760px) {
  .pqr-shell { width: min(100%, calc(100vw - 1rem)); }
  .pqr-hero { grid-template-columns: 1fr; min-height: 0; gap: .5rem; padding: 1.5rem 1rem 2rem; background-position: 50% center; }
  .pqr-reveal { order: -1; min-height: 250px; }
  .pqr-plant-stage { width: 250px; height: 250px; }
  .pqr-plant-stage::before { inset-block-end: 43px; }
  .pqr-plant-stage::after { inset-block-end: 28px; }
  .pqr-sun-mark { font-size: 2.7rem; }
  .pqr-copy h1 { font-size: clamp(3rem, 17vw, 5rem); }
  .pqr-section { padding: 1.7rem 1rem; }
  .pqr-axis-row { grid-template-columns: 64px 1fr 64px; gap: .5rem; }
  .pqr-nearby { grid-template-columns: 1fr; }
  .pqr-actions { padding: 1.2rem 1rem .8rem; }
  .pqr-button { flex: 1 1 45%; }
}

@media (prefers-reduced-motion: reduce) {
  .pqr-plant-stage, .pqr-toast, .pqr-nearby a { transition-duration: .01ms !important; }
  .pqr-plant-stage { opacity: 1; transform: none; }
}

@media (prefers-contrast: more) {
  .pqr-shell { --pqr-line: currentColor; }
  .pqr-section, .pqr-button { border-width: 2px; }
}
</style>
