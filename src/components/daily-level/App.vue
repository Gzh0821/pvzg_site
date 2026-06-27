<template>
  <section class="daily-level-shell">
    <div class="daily-level-hero">
      <div class="daily-level-hero__main">
        <p class="daily-level-kicker">{{ t.kicker }}</p>
        <h1>{{ currentLevel?.title || t.loadingTitle }}</h1>
        <div class="daily-level-meta">
          <span v-if="currentLevel?.author">{{ currentLevel.author }}</span>
          <span v-if="currentLevel?.stats?.stage">{{ currentLevel.stats.stage }}</span>
          <span v-if="activeRange">{{ activeRange }}</span>
        </div>
      </div>

      <div class="daily-level-actions">
        <button class="daily-level-button daily-level-button--primary" :disabled="!currentLevel || downloading" @click="downloadLevel">
          <VPIcon icon="download" />
          <span>{{ downloading ? t.downloading : t.download }}</span>
        </button>
        <a v-if="rawDownloadUrl" class="daily-level-button daily-level-button--secondary" :href="rawDownloadUrl" target="_blank" rel="noopener">
          <VPIcon icon="up-right-from-square" />
          <span>{{ t.raw }}</span>
        </a>
      </div>
    </div>

    <div v-if="loading" class="daily-level-state">{{ t.loading }}</div>
    <div v-else-if="error" class="daily-level-state daily-level-state--error">
      <strong>{{ t.failed }}</strong>
      <span>{{ error }}</span>
    </div>

    <template v-else-if="currentLevel">
      <div class="daily-level-facts" aria-label="Level facts">
        <div v-for="fact in facts" :key="fact.label" class="daily-level-fact">
          <span>{{ fact.label }}</span>
          <strong>{{ fact.value }}</strong>
        </div>
      </div>

      <section class="daily-level-section">
        <div class="daily-level-section__head">
          <h2>{{ t.plants }}</h2>
          <span>{{ currentLevel.entities.plants.length }}</span>
        </div>
        <div class="daily-level-grid daily-level-grid--plants">
          <article v-for="plant in visiblePlants" :key="entityKey(plant)" class="daily-level-entity">
            <img :src="plantImage(plant)" :alt="entityName(plant, 'plant')" loading="lazy" @error="hideBrokenImage" />
            <div>
              <strong>{{ entityName(plant, 'plant') }}</strong>
              <span>{{ roleSummary(plant.roles) }}</span>
            </div>
          </article>
        </div>
        <button v-if="hiddenPlantCount > 0" class="daily-level-more" @click="showAllPlants = !showAllPlants">
          {{ showAllPlants ? t.showLess : t.showMore(hiddenPlantCount) }}
        </button>
      </section>

      <section class="daily-level-section">
        <div class="daily-level-section__head">
          <h2>{{ t.zombies }}</h2>
          <span>{{ currentLevel.entities.zombies.length }}</span>
        </div>
        <div class="daily-level-grid daily-level-grid--zombies">
          <article v-for="zombie in visibleZombies" :key="entityKey(zombie)" class="daily-level-entity">
            <img v-if="zombieImage(zombie)" :src="zombieImage(zombie)" :alt="entityName(zombie, 'zombie')" loading="lazy" @error="hideBrokenImage" />
            <div v-else class="daily-level-placeholder" aria-hidden="true">?</div>
            <div>
              <strong>{{ entityName(zombie, 'zombie') }}</strong>
              <span>{{ zombieDetail(zombie) }}</span>
            </div>
          </article>
        </div>
        <button v-if="hiddenZombieCount > 0" class="daily-level-more" @click="showAllZombies = !showAllZombies">
          {{ showAllZombies ? t.showLess : t.showMore(hiddenZombieCount) }}
        </button>
      </section>

      <section class="daily-level-section daily-level-section--compact">
        <div class="daily-level-section__head">
          <h2>{{ t.mechanics }}</h2>
          <span>{{ currentLevel.mechanics.length }}</span>
        </div>
        <div class="daily-level-tags">
          <span v-for="mechanic in currentLevel.mechanics" :key="mechanic.id">{{ mechanicLabel(mechanic.id) }}</span>
        </div>
      </section>

      <section v-if="notices.length" class="daily-level-section daily-level-section--compact">
        <div class="daily-level-section__head">
          <h2>{{ t.notices }}</h2>
          <span>{{ notices.length }}</span>
        </div>
        <ul class="daily-level-notices">
          <li v-for="notice in notices" :key="notice.code + notice.message">{{ notice.message }}</li>
        </ul>
      </section>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue';

import { getPlantMap } from '../plantsAlmanac/formatPlants';
import { getZombieMap } from '../zombiesAlmanac/formatZombies';

type DailyEntity = {
  id: string;
  kind: 'official' | 'local' | 'unresolved';
  basedOn?: string;
  name?: Record<string, string>;
  cardSprite?: string;
  roles: string[];
  count: number;
  firstWave: number | null;
  lastWave: number | null;
};

type DailyLevel = {
  slug: string;
  title: string;
  author: string;
  rawUrl: string;
  stats: {
    stage: string;
    startingSun: number;
    seedMode: string;
    seedSlots: number | null;
    waveCount: number;
    flagWaveInterval: number | null;
  };
  entities: {
    plants: DailyEntity[];
    zombies: DailyEntity[];
  };
  mechanics: { id: string; count: number }[];
  board: {
    initialPlants: number;
    initialZombies: number;
    gridItems: number;
    gravestones: number;
  };
  diagnostics: { severity: string; code: string; message: string }[];
};

type DailyPayload = {
  generatedAt: string;
  daily: {
    date: string;
    activeFrom: string;
    activeUntil: string;
    level: DailyLevel;
  };
};

const props = withDefaults(defineProps<{ apiBase?: string }>(), {
  apiBase: 'https://pvzge-daily-level.pages.dev/api/v1'
});

const injectedLanguage = inject('i18nLanguage', 'en');
const language = computed(() => (String(injectedLanguage).startsWith('zh') ? 'zh' : 'en'));
const plantMap = computed<Record<string, any>>(() => getPlantMap(language.value));
const zombieMap = computed<Record<string, any>>(() => getZombieMap(language.value));

const copy = {
  zh: {
    kicker: '每日关卡',
    loadingTitle: '正在载入今日关卡',
    loading: '正在载入关卡数据...',
    failed: '无法载入每日关卡',
    download: '下载关卡',
    downloading: '正在下载',
    raw: '查看源文件',
    plants: '本关植物',
    zombies: '本关僵尸',
    mechanics: '机制',
    notices: '诊断',
    showLess: '收起',
    showMore: (count: number) => `展开其余 ${count} 个`,
    seedMode: '供给',
    waves: '波次',
    sun: '阳光',
    board: '开局棋盘',
    until: '持续到',
    wave: '第 {wave} 波',
    localBased: '基于 {name}',
    unresolved: '未识别',
    seedModes: {
      conveyor: '传送带',
      chooser: '玩家选卡',
      preset: '固定卡组',
      none: '无种子栏'
    }
  },
  en: {
    kicker: 'Daily Level',
    loadingTitle: 'Loading today level',
    loading: 'Loading level data...',
    failed: 'Daily level unavailable',
    download: 'Download level',
    downloading: 'Downloading',
    raw: 'Open source',
    plants: 'Plants',
    zombies: 'Zombies',
    mechanics: 'Mechanics',
    notices: 'Diagnostics',
    showLess: 'Show less',
    showMore: (count: number) => `Show ${count} more`,
    seedMode: 'Supply',
    waves: 'Waves',
    sun: 'Sun',
    board: 'Opening board',
    until: 'Until',
    wave: 'Wave {wave}',
    localBased: 'Based on {name}',
    unresolved: 'Unresolved',
    seedModes: {
      conveyor: 'Conveyor',
      chooser: 'Choose plants',
      preset: 'Fixed seed bank',
      none: 'No seed bank'
    }
  }
};

const roleLabels = {
  zh: {
    'seed-preset': '固定卡组',
    'seed-locked': '锁定卡槽',
    'seed-include': '可选植物',
    'seed-exclude': '禁用植物',
    'conveyor-initial': '传送带初始',
    'conveyor-add': '传送带加入',
    'conveyor-remove': '传送带移除',
    'initial-board': '开局放置',
    'wave-spawned': '波次生成',
    'protect-target': '保护目标',
    wave: '波次',
    storm: '风暴生成',
    'ground-spawn': '地下生成'
  },
  en: {
    'seed-preset': 'Fixed bank',
    'seed-locked': 'Locked slot',
    'seed-include': 'Allowed',
    'seed-exclude': 'Excluded',
    'conveyor-initial': 'Conveyor start',
    'conveyor-add': 'Conveyor add',
    'conveyor-remove': 'Conveyor remove',
    'initial-board': 'Opening board',
    'wave-spawned': 'Wave spawn',
    'protect-target': 'Protect target',
    wave: 'Waves',
    storm: 'Storm spawn',
    'ground-spawn': 'Ground spawn'
  }
};

const mechanicLabels = {
  zh: {
    conveyor: '传送带',
    'conveyor-wave-change': '传送带波次变化',
    'initial-plants': '开局植物',
    'initial-zombies': '开局僵尸',
    'grid-items': '地物',
    gravestones: '墓碑',
    'star-challenge': '星星挑战',
    'beat-the-level': '通关目标',
    'plants-lost-limit': '植物损失限制',
    'timed-kill-challenge': '限时击杀',
    'protect-the-plant': '保护植物',
    railcart: '矿车',
    'mold-colony': '霉菌地块',
    'level-scheduler': '关卡调度',
    'wave-scheduler': '波次调度',
    'frost-wind': '冰风',
    dinosaur: '恐龙',
    'storm-zombies': '风暴僵尸',
    'ground-spawn': '地下出怪',
    'spawn-plants': '生成植物',
    'spawn-gravestones': '生成墓碑',
    'missile-locate': '导弹定位',
    'wave-warning': '波次警告',
    'random-events': '随机事件',
    'last-stand': '坚不可摧',
    'future-minigame': '未来小游戏',
    'cowboy-minigame': '西部小游戏',
    'sky-city-ship': '天空船体',
    'level-of-the-day': '每日关卡模块'
  },
  en: {
    conveyor: 'Conveyor',
    'conveyor-wave-change': 'Conveyor changes',
    'initial-plants': 'Opening plants',
    'initial-zombies': 'Opening zombies',
    'grid-items': 'Board objects',
    gravestones: 'Gravestones',
    'star-challenge': 'Star challenge',
    'beat-the-level': 'Beat the level',
    'plants-lost-limit': 'Plant loss limit',
    'timed-kill-challenge': 'Timed kills',
    'protect-the-plant': 'Protect plants',
    railcart: 'Railcart',
    'mold-colony': 'Mold colony',
    'level-scheduler': 'Level scheduler',
    'wave-scheduler': 'Wave scheduler',
    'frost-wind': 'Frost wind',
    dinosaur: 'Dinosaur',
    'storm-zombies': 'Storm zombies',
    'ground-spawn': 'Ground spawn',
    'spawn-plants': 'Spawn plants',
    'spawn-gravestones': 'Spawn gravestones',
    'missile-locate': 'Missile targeting',
    'wave-warning': 'Wave warning',
    'random-events': 'Random events',
    'last-stand': 'Last stand',
    'future-minigame': 'Future minigame',
    'cowboy-minigame': 'Wild West minigame',
    'sky-city-ship': 'Sky ship',
    'level-of-the-day': 'Level of the day'
  }
};

const payload = ref<DailyPayload | null>(null);
const loading = ref(true);
const error = ref('');
const downloading = ref(false);
const showAllPlants = ref(false);
const showAllZombies = ref(false);

const t = computed(() => copy[language.value]);
const currentLevel = computed(() => payload.value?.daily.level || null);
const activeRange = computed(() => {
  if (!payload.value?.daily.activeUntil) return '';
  return `${t.value.until} ${formatDate(payload.value.daily.activeUntil)}`;
});
const rawDownloadUrl = computed(() => {
  if (!currentLevel.value?.rawUrl) return '';
  return new URL(`../../${currentLevel.value.rawUrl}`, normalizedApiBase.value).toString();
});
const normalizedApiBase = computed(() => (props.apiBase.endsWith('/') ? props.apiBase : `${props.apiBase}/`));
const visiblePlants = computed(() => (showAllPlants.value ? currentLevel.value?.entities.plants || [] : (currentLevel.value?.entities.plants || []).slice(0, 18)));
const visibleZombies = computed(() => (showAllZombies.value ? currentLevel.value?.entities.zombies || [] : (currentLevel.value?.entities.zombies || []).slice(0, 18)));
const hiddenPlantCount = computed(() => Math.max(0, (currentLevel.value?.entities.plants.length || 0) - visiblePlants.value.length));
const hiddenZombieCount = computed(() => Math.max(0, (currentLevel.value?.entities.zombies.length || 0) - visibleZombies.value.length));
const notices = computed(() => currentLevel.value?.diagnostics.filter((item) => item.severity !== 'info') || []);
const facts = computed(() => {
  const level = currentLevel.value;
  if (!level) return [];
  const boardCount = level.board.initialPlants + level.board.initialZombies + level.board.gridItems + level.board.gravestones;
  return [
    { label: t.value.seedMode, value: t.value.seedModes[level.stats.seedMode] || level.stats.seedMode },
    { label: t.value.waves, value: String(level.stats.waveCount || '-') },
    { label: t.value.sun, value: String(level.stats.startingSun ?? '-') },
    { label: t.value.board, value: String(boardCount) }
  ];
});

onMounted(async () => {
  try {
    loading.value = true;
    error.value = '';
    const response = await fetch(new URL('daily/current.json', normalizedApiBase.value));
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    payload.value = await response.json();
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    loading.value = false;
  }
});

function entityKey(entity: DailyEntity) {
  return `${entity.kind}-${entity.id}-${entity.basedOn || ''}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(language.value === 'zh' ? 'zh-CN' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  }).format(new Date(value));
}

function entityBaseId(entity: DailyEntity) {
  return entity.kind === 'local' && entity.basedOn ? entity.basedOn : entity.id;
}

function entityName(entity: DailyEntity, type: 'plant' | 'zombie') {
  if (entity.kind === 'unresolved') return `${entity.id} (${t.value.unresolved})`;
  const baseId = entityBaseId(entity);
  const map = type === 'plant' ? plantMap.value : zombieMap.value;
  const baseName = map[baseId]?.name || entity.name?.[language.value] || entity.name?.en || baseId;
  if (entity.kind === 'local') {
    return `${entity.id} (${t.value.localBased.replace('{name}', baseName)})`;
  }
  return baseName;
}

function plantImage(entity: DailyEntity) {
  return `/assets/image/plants/plants_${entityBaseId(entity)}_c.webp`;
}

function zombieImage(entity: DailyEntity) {
  if (entity.kind === 'unresolved') return '';
  const baseId = entityBaseId(entity);
  const zombie = zombieMap.value[baseId];
  const sprite = zombie?.zombieType || entity.cardSprite || baseId;
  return `/assets/image/zombies/Zombie_${sprite}_0.webp`;
}

function roleSummary(roles: string[]) {
  return roles.map((role) => roleLabels[language.value][role] || role).join(' / ');
}

function zombieDetail(entity: DailyEntity) {
  const waveText = entity.firstWave ? t.value.wave.replace('{wave}', String(entity.firstWave)) : roleSummary(entity.roles);
  return entity.count > 1 ? `${waveText} x${entity.count}` : waveText;
}

function mechanicLabel(id: string) {
  return mechanicLabels[language.value][id] || id;
}

function hideBrokenImage(event: Event) {
  const target = event.target as HTMLImageElement;
  target.style.visibility = 'hidden';
}

async function downloadLevel() {
  if (!currentLevel.value || !rawDownloadUrl.value) return;
  downloading.value = true;
  try {
    const response = await fetch(rawDownloadUrl.value);
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = rawDownloadUrl.value.split('/').pop() || `${currentLevel.value.slug}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    downloading.value = false;
  }
}
</script>

<style scoped>
.daily-level-shell {
  --daily-ink: color-mix(in srgb, var(--vp-c-text) 92%, #13251b);
  --daily-muted: color-mix(in srgb, var(--vp-c-text) 58%, transparent);
  --daily-panel: color-mix(in srgb, var(--vp-c-bg) 86%, #f5f8f1);
  --daily-soft: color-mix(in srgb, var(--vp-c-bg) 74%, #e9f1e3);
  --daily-line: color-mix(in srgb, var(--vp-c-divider) 64%, transparent);
  --daily-green: #2f7d4f;
  --daily-amber: #b86f1d;
  --daily-coral: #c5523b;
  max-width: 1120px;
  margin: 0 auto;
  color: var(--daily-ink);
}

.daily-level-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px;
  align-items: end;
  padding: 28px 0 24px;
  border-bottom: 1px solid var(--daily-line);
}

.daily-level-kicker {
  margin: 0 0 8px;
  color: var(--daily-green);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.daily-level-hero h1 {
  margin: 0;
  font-size: clamp(2rem, 5vw, 4.8rem);
  line-height: 0.98;
  letter-spacing: 0;
}

.daily-level-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
  color: var(--daily-muted);
}

.daily-level-meta span,
.daily-level-tags span {
  min-height: 28px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 4px 10px;
  background: var(--daily-soft);
  font-size: 0.85rem;
}

.daily-level-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.daily-level-button {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 12px;
  padding: 0 16px;
  color: inherit;
  font: inherit;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.16s ease, opacity 0.16s ease, background 0.16s ease;
}

.daily-level-button:hover {
  transform: translateY(-1px);
  text-decoration: none;
}

.daily-level-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
}

.daily-level-button--primary {
  background: var(--daily-green);
  color: #fff;
}

.daily-level-button--secondary {
  background: var(--daily-soft);
}

.daily-level-state {
  margin: 24px 0;
  padding: 18px;
  border-radius: 14px;
  background: var(--daily-panel);
  color: var(--daily-muted);
}

.daily-level-state--error {
  display: grid;
  gap: 4px;
  color: var(--daily-coral);
}

.daily-level-facts {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin: 20px 0;
}

.daily-level-fact {
  min-height: 78px;
  display: grid;
  align-content: center;
  gap: 4px;
  border-radius: 16px;
  padding: 14px 16px;
  background: var(--daily-panel);
}

.daily-level-fact span {
  color: var(--daily-muted);
  font-size: 0.78rem;
}

.daily-level-fact strong {
  overflow-wrap: anywhere;
  font-size: 1rem;
}

.daily-level-section {
  margin-top: 28px;
}

.daily-level-section--compact {
  padding-top: 4px;
}

.daily-level-section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.daily-level-section__head h2 {
  margin: 0;
  font-size: 1.3rem;
  letter-spacing: 0;
}

.daily-level-section__head span {
  color: var(--daily-muted);
  font-variant-numeric: tabular-nums;
}

.daily-level-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 10px;
}

.daily-level-entity {
  min-height: 76px;
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  border-radius: 14px;
  padding: 10px;
  background: var(--daily-panel);
}

.daily-level-entity img,
.daily-level-placeholder {
  width: 54px;
  height: 54px;
  object-fit: contain;
}

.daily-level-placeholder {
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: color-mix(in srgb, var(--daily-coral) 16%, transparent);
  color: var(--daily-coral);
  font-weight: 800;
}

.daily-level-entity strong {
  display: block;
  overflow-wrap: anywhere;
  font-size: 0.92rem;
  line-height: 1.25;
}

.daily-level-entity span {
  display: block;
  margin-top: 4px;
  color: var(--daily-muted);
  font-size: 0.78rem;
  line-height: 1.3;
}

.daily-level-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.daily-level-tags span:nth-child(3n + 1) {
  color: var(--daily-green);
}

.daily-level-tags span:nth-child(3n + 2) {
  color: var(--daily-amber);
}

.daily-level-tags span:nth-child(3n) {
  color: var(--daily-coral);
}

.daily-level-more {
  min-height: 40px;
  margin-top: 12px;
  border: 0;
  border-radius: 12px;
  padding: 0 14px;
  background: var(--daily-soft);
  color: var(--daily-ink);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.daily-level-notices {
  margin: 0;
  padding-left: 20px;
  color: var(--daily-coral);
}

@media (max-width: 760px) {
  .daily-level-hero {
    grid-template-columns: 1fr;
    align-items: stretch;
    padding-top: 16px;
  }

  .daily-level-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .daily-level-facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .daily-level-grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .daily-level-button {
    transition: none;
  }

  .daily-level-button:hover {
    transform: none;
  }
}
</style>
