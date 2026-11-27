<template>
  <div class="animation" :style="{ backgroundImage: `url(${getAlmanacWorldBackground(background)})` }">
    <div ref="host" class="canvas-host" role="img" :aria-label="name" />
    <template v-if="status === 'ready'">
      <div v-if="actions.length" class="clips">
        <button
          v-for="clip in actions" :key="clip" type="button"
          :aria-label="clipControls[clip].label" :data-playing="action === clip"
          @click="player?.play(clip)"
        >
          <img :src="controlsPath + clipControls[clip].icon" alt="">
          <span class="action-hint" aria-hidden="true">{{ clipControls[clip].label }}</span>
        </button>
      </div>
      <button
        v-if="config.costumes > 0" class="costume-cycle" type="button"
        :aria-label="`${costumeLabel} · ${labels.nextCostume}`" :title="labels.nextCostume"
        @click="nextCostume"
      >
        <img :src="controlsPath + 'costume-roller.png'" alt="">
      </button>
      <button
        type="button" class="scene-cycle" :aria-label="backgroundLabel" :title="backgroundLabel"
        @click="nextBackground"
      >
        <img :src="controlsPath + 'scene-ship.webp'" alt="">
      </button>
    </template>
    <div v-else class="status" role="status">
      {{ status === 'loading' ? labels.animationLoading : labels.animationError }}
      <button v-if="status === 'error'" type="button" @click="load">{{ labels.retry }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { getAlmanacText, getWorldLabel } from './locales';
import { plantAnimations, type AnimatedPlant, type PlantAction, type PlantAnimationConfig } from './plant-animations';
import { mountPlantAnimation } from './plant-animation-player';
import type { AlmanacLocale } from './types';
import { almanacBackgrounds, getAlmanacWorldBackground } from './world-backgrounds';

const props = defineProps<{
  code: AnimatedPlant;
  locale: AlmanacLocale;
  name: string;
  world: string;
  displayOffset?: { x: number; y: number };
}>();
const config: PlantAnimationConfig = plantAnimations[props.code];
const actions = Object.keys(config.actions) as PlantAction[];
const labels = computed(() => getAlmanacText(props.locale));
const controlsPath = '/assets/almanac-animation/controls/';
const clipControls = computed(() => ({
  Shoot: { label: labels.value.shoot, icon: 'attack.webp' },
  Lob: { label: labels.value.lob, icon: 'attack.webp' },
  Lob_Butter: { label: labels.value.lobButter, icon: 'butter.webp' },
  Produce: { label: labels.value.produceSun, icon: 'sun.webp' },
  Water: { label: labels.value.water, icon: 'watering-can.webp' },
  Freeze: { label: labels.value.lobFreeze, icon: 'freeze.webp' },
  Coin: { label: labels.value.produceCoin, icon: 'coin.webp' },
  Attack: { label: labels.value.attack, icon: 'attack.webp' },
  Grow: { label: labels.value.grow, icon: 'grow.webp' },
  Block: { label: labels.value.block, icon: 'block.webp' },
  Food: { label: labels.value.plantFood, icon: 'plant-food.webp' },
}));
const background = ref(almanacBackgrounds.includes(props.world) ? props.world : 'default');
const backgroundLabel = computed(() => labels.value.background + ' · ' + getWorldLabel(background.value, props.locale));
const costume = ref(-1);
const costumeLabel = computed(() => costume.value === -1
  ? labels.value.defaultCostume : `${labels.value.costume} ${costume.value + 1}`);
const action = ref<string>(config.idle);
const host = ref<HTMLDivElement>();
const status = ref<'loading' | 'error' | 'ready'>('loading');
let controller: AbortController;
let player: Awaited<ReturnType<typeof mountPlantAnimation>>;

function nextBackground() {
  const index = almanacBackgrounds.indexOf(background.value);
  background.value = almanacBackgrounds[(index + 1) % almanacBackgrounds.length];
}

function nextCostume() {
  costume.value = costume.value + 1 === config.costumes ? -1 : costume.value + 1;
  player?.setCostume(costume.value);
}

async function load() {
  controller?.abort();
  const request = new AbortController();
  controller = request;
  status.value = 'loading';
  try {
    player = await mountPlantAnimation(host.value, props.code, props.displayOffset, request.signal, (clip: string) => { action.value = clip; });
    if (!request.signal.aborted) status.value = 'ready';
  } catch (error) {
    if (request.signal.aborted) return;
    console.error('Almanac animation:', error);
    status.value = 'error';
  }
}

onMounted(load);
onBeforeUnmount(() => controller?.abort());
</script>

<style scoped>
.animation {
  --action-size: clamp(44px, 5vw, 54px);
  --tools-inset: clamp(7px, 1vw, 12px);
  position: absolute;
  inset: 0;
  z-index: 1;
  background-position: center;
  background-size: cover;
  font-family: 'pvzgeFontEN', 'pvzgFont', sans-serif;
}

.canvas-host {
  position: absolute;
  inset: 0;
}
.canvas-host :deep(canvas) {
  width: 100%;
  height: 100%;
  display: block;
}

.clips {
  position: absolute;
  right: var(--tools-inset);
  bottom: var(--tools-inset);
  max-width: calc(100% - 44px - 3 * var(--tools-inset));
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 5px;
}
.clips button {
  position: relative;
  flex: none;
  display: grid;
  place-items: center;
  width: var(--action-size);
  height: var(--action-size);
  padding: 0;
  border: 2px solid #483218;
  border-radius: 50%;
  background: radial-gradient(ellipse at 40% 25%, #8e9d42, #4b652c 60%, #293b1a 90%);
  box-shadow: 0 2px 1px #382812b3;
  cursor: pointer;
}
.clips button::after {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: url('/assets/almanac-animation/controls/action-ring.webp') center / 100% 100%;
  content: '';
  pointer-events: none;
}
.clips img {
  width: 70%;
  height: 70%;
  object-fit: contain;
  filter: drop-shadow(0 1px 1px #203216);
}
.clips img[src$="attack.webp"] {
  width: 90%;
  height: 90%;
  border-radius: 50%;
}
.clips button[data-playing=true] {
  background: radial-gradient(ellipse at 40% 25%, #ffea85, #b68a27 85%);
  box-shadow: 0 0 0 2px #fff1ae, 0 2px 3px #382812;
}
.clips button:active { transform: translateY(1px); }
.action-hint {
  position: absolute;
  bottom: calc(100% + 5px);
  padding: 3px 8px;
  border-radius: 5px;
  color: #fff3c8;
  background: #382918ed;
  font: 1rem/1.3 'pvzgeFontEN', 'pvzgFont', sans-serif;
  white-space: nowrap;
  visibility: hidden;
  pointer-events: none;
}
.clips button:last-child .action-hint { right: 0; }
.clips button:focus-visible .action-hint { visibility: visible; }
@media (hover: hover) {
  .clips button:hover { filter: brightness(1.12); }
  .clips button:hover .action-hint { visibility: visible; }
}

.scene-cycle {
  left: var(--tools-inset);
  bottom: var(--tools-inset);
}
.costume-cycle {
  top: var(--tools-inset);
  right: var(--tools-inset);
}
.scene-cycle,
.costume-cycle {
  position: absolute;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}
.scene-cycle img,
.costume-cycle img {
  width: 40px;
  max-height: 40px;
  object-fit: contain;
}
.scene-cycle:active,
.costume-cycle:active { transform: translateY(1px); }
.animation :focus-visible { outline: 3px solid #fff1a0; outline-offset: 2px; }
.status {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 6px 12px;
  border-radius: 8px;
  color: #fff4cb;
  background: #47301fe8;
}
.status button { color: inherit; font: inherit; }
</style>
