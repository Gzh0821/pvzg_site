<template>
  <section class="daily-level-shell">
    <div class="daily-level-hero">
      <div class="daily-level-hero__main">
        <p class="daily-level-kicker">{{ t('kicker') }}</p>
        <h1>{{ currentLevel?.title || t('loadingTitle') }}</h1>
      </div>

      <div class="daily-level-actions">
        <button class="daily-level-button daily-level-button--primary" :disabled="!deepLinkUrl" @click="openInGame">
          <VPIcon icon="computer" />
          <span>{{ t('openInGame') }}</span>
        </button>
        <button class="daily-level-button daily-level-button--secondary" :disabled="!currentLevel || downloading" @click="downloadLevel">
          <VPIcon icon="download" />
          <span>{{ downloading ? t('downloading') : t('download') }}</span>
        </button>
      </div>
      <p v-if="deepLinkHintVisible" class="daily-level-deep-link-hint">{{ t('deepLinkHint') }}</p>
    </div>

    <div v-if="loading" class="daily-level-state">{{ t('loading') }}</div>
    <div v-else-if="error" class="daily-level-state daily-level-state--error">
      <strong>{{ t('failed') }}</strong>
      <span>{{ error }}</span>
    </div>

    <template v-else-if="currentLevel">
      <section class="daily-level-summary">
        <p v-if="currentLevel.description" class="daily-level-description">{{ currentLevel.description }}</p>
        <div class="daily-level-details" aria-label="Level details">
          <div v-for="detail in levelDetails" :key="detail.label" class="daily-level-detail">
            <span>{{ detail.label }}</span>
            <strong>{{ detail.value }}</strong>
          </div>
        </div>
      </section>

      <div class="daily-level-facts" aria-label="Level facts">
        <div v-for="fact in facts" :key="fact.label" class="daily-level-fact">
          <span>{{ fact.label }}</span>
          <strong>{{ fact.value }}</strong>
        </div>
      </div>

      <section class="daily-level-section">
        <div class="daily-level-section__head">
          <h2>{{ t('plants') }}</h2>
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
          {{ showAllPlants ? t('showLess') : t('showMore', { count: hiddenPlantCount }) }}
        </button>
      </section>

      <section class="daily-level-section">
        <div class="daily-level-section__head">
          <h2>{{ t('zombies') }}</h2>
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
          {{ showAllZombies ? t('showLess') : t('showMore', { count: hiddenZombieCount }) }}
        </button>
      </section>

      <section class="daily-level-section daily-level-section--compact">
        <div class="daily-level-section__head">
          <h2>{{ t('mechanics') }}</h2>
          <span>{{ currentLevel.mechanics.length }}</span>
        </div>
        <div class="daily-level-tags">
          <span v-for="mechanic in currentLevel.mechanics" :key="mechanic.id">{{ mechanicLabel(mechanic.id) }}</span>
        </div>
      </section>

      <section v-if="notices.length" class="daily-level-section daily-level-section--compact">
        <div class="daily-level-section__head">
          <h2>{{ t('notices') }}</h2>
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
import { computed, inject, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

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
  description?: string;
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
    slot: number;
    activeFrom: string;
    activeUntil: string;
    level: DailyLevel;
  };
};

const props = withDefaults(defineProps<{ apiBase?: string }>(), {
  apiBase: 'https://daily-level-api.pvzge.com/api/v1'
});

const injectedLanguage = inject('i18nLanguage', 'en');
const language = computed(() => (String(injectedLanguage).startsWith('zh') ? 'zh' : 'en'));
const messages = Object.fromEntries(
  Object.entries(import.meta.glob('./locales/*.json', { eager: true }))
    .map(([key, value]) => [key.match(/\/([a-zA-Z-]+)\.json$/)?.[1], (value as { default: Record<string, unknown> }).default])
    .filter(([locale]) => locale)
) as Record<'zh' | 'en', Record<string, unknown>>;
const { t, te, locale } = useI18n({
  useScope: 'local',
  locale: language.value,
  fallbackLocale: 'en',
  messages
});
locale.value = language.value;
const plantMap = computed<Record<string, any>>(() => getPlantMap(language.value));
const zombieMap = computed<Record<string, any>>(() => getZombieMap(language.value));

const payload = ref<DailyPayload | null>(null);
const loading = ref(true);
const error = ref('');
const downloading = ref(false);
const deepLinkHintVisible = ref(false);
const showAllPlants = ref(false);
const showAllZombies = ref(false);
const nowTimestamp = ref(Date.now());
let countdownTimer: number | undefined;
let deepLinkHintTimer: number | undefined;

const currentLevel = computed(() => payload.value?.daily.level || null);
const activeCountdown = computed(() => {
  if (!payload.value?.daily.activeUntil) return '';
  return formatCountdown(new Date(payload.value.daily.activeUntil).getTime() - nowTimestamp.value);
});
const rawDownloadUrl = computed(() => {
  if (!currentLevel.value?.rawUrl) return '';
  return new URL(`../../${currentLevel.value.rawUrl}`, normalizedApiBase.value).toString();
});
const deepLinkUrl = computed(() => {
  if (!currentLevel.value || !payload.value?.daily.date || !Number.isInteger(payload.value.daily.slot)) return '';
  const url = new URL('pvzge://daily-level/open');
  url.searchParams.set('date', payload.value.daily.date);
  url.searchParams.set('slot', String(payload.value.daily.slot));
  url.searchParams.set('slug', currentLevel.value.slug);
  return url.toString();
});
const normalizedApiBase = computed(() => (props.apiBase.endsWith('/') ? props.apiBase : `${props.apiBase}/`));
const visiblePlants = computed(() => (showAllPlants.value ? currentLevel.value?.entities.plants || [] : (currentLevel.value?.entities.plants || []).slice(0, 18)));
const visibleZombies = computed(() => (showAllZombies.value ? currentLevel.value?.entities.zombies || [] : (currentLevel.value?.entities.zombies || []).slice(0, 18)));
const hiddenPlantCount = computed(() => Math.max(0, (currentLevel.value?.entities.plants.length || 0) - visiblePlants.value.length));
const hiddenZombieCount = computed(() => Math.max(0, (currentLevel.value?.entities.zombies.length || 0) - visibleZombies.value.length));
const notices = computed(() => currentLevel.value?.diagnostics.filter((item) => item.severity !== 'info') || []);
const levelDetails = computed(() => {
  const level = currentLevel.value;
  if (!level) return [];
  return [
    level.author ? { label: t('author'), value: level.author } : null,
    level.stats.stage ? { label: t('stage'), value: level.stats.stage } : null,
    activeCountdown.value ? { label: t('activeCountdown'), value: activeCountdown.value } : null
  ].filter((item): item is { label: string; value: string } => Boolean(item));
});
const facts = computed(() => {
  const level = currentLevel.value;
  if (!level) return [];
  const seedModeKey = `seedModes.${level.stats.seedMode}`;
  return [
    { label: t('seedMode'), value: te(seedModeKey) ? t(seedModeKey) : level.stats.seedMode },
    { label: t('waves'), value: String(level.stats.waveCount || '-') },
    { label: t('sun'), value: String(level.stats.startingSun ?? '-') }
  ];
});

onMounted(async () => {
  nowTimestamp.value = Date.now();
  countdownTimer = window.setInterval(() => {
    nowTimestamp.value = Date.now();
  }, 1000);

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

onUnmounted(() => {
  if (countdownTimer !== undefined) window.clearInterval(countdownTimer);
  if (deepLinkHintTimer !== undefined) window.clearTimeout(deepLinkHintTimer);
});

function entityKey(entity: DailyEntity) {
  return `${entity.kind}-${entity.id}-${entity.basedOn || ''}`;
}

function formatCountdown(milliseconds: number) {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) return t('refreshSoon');
  const totalSeconds = Math.max(1, Math.ceil(milliseconds / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (language.value === 'zh') {
    const parts = [
      days ? `${days}天` : '',
      hours ? `${hours}小时` : '',
      minutes ? `${minutes}分` : '',
      `${seconds}秒`
    ].filter(Boolean);
    return parts.join(' ');
  }

  const plural = (value: number, unit: string) => `${value} ${unit}${value === 1 ? '' : 's'}`;
  const parts = [
    days ? plural(days, 'day') : '',
    hours ? plural(hours, 'hour') : '',
    minutes ? plural(minutes, 'min') : '',
    plural(seconds, 'sec')
  ].filter(Boolean);
  return parts.join(' ');
}

function entityBaseId(entity: DailyEntity) {
  return entity.kind === 'local' && entity.basedOn ? entity.basedOn : entity.id;
}

function entityName(entity: DailyEntity, type: 'plant' | 'zombie') {
  if (entity.kind === 'unresolved') return `${entity.id} (${t('unresolved')})`;
  const baseId = entityBaseId(entity);
  const map = type === 'plant' ? plantMap.value : zombieMap.value;
  const baseName = map[baseId]?.name || entity.name?.[language.value] || entity.name?.en || baseId;
  if (entity.kind === 'local') {
    return `${entity.id} (${t('localBased', { name: baseName })})`;
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
  return roles.map((role) => {
    const key = `roleLabels.${role}`;
    return te(key) ? t(key) : role;
  }).join(' / ');
}

function zombieDetail(entity: DailyEntity) {
  const waveText = entity.firstWave ? t('wave', { wave: entity.firstWave }) : roleSummary(entity.roles);
  return entity.count > 1 ? `${waveText} x${entity.count}` : waveText;
}

function mechanicLabel(id: string) {
  const key = `mechanicLabels.${id}`;
  return te(key) ? t(key) : id;
}

function hideBrokenImage(event: Event) {
  const target = event.target as HTMLImageElement;
  target.style.visibility = 'hidden';
}

function openInGame() {
  if (!deepLinkUrl.value) return;
  deepLinkHintVisible.value = false;
  if (deepLinkHintTimer !== undefined) window.clearTimeout(deepLinkHintTimer);
  window.location.href = deepLinkUrl.value;
  deepLinkHintTimer = window.setTimeout(() => {
    if (document.visibilityState === 'visible') deepLinkHintVisible.value = true;
  }, 1800);
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
  --daily-panel: color-mix(in srgb, var(--vp-c-bg-alt) 88%, #eef5eb 12%);
  --daily-soft: color-mix(in srgb, var(--vp-c-bg-alt) 80%, #e9f2e6 20%);
  --daily-line: color-mix(in srgb, var(--vp-c-divider) 64%, transparent);
  --daily-separator: color-mix(in srgb, var(--vp-c-border) 52%, transparent);
  --daily-green: #2f7d4f;
  --daily-amber: #b86f1d;
  --daily-coral: #c5523b;
  max-width: 1120px;
  margin: 0 auto;
  color: var(--daily-ink);
}

.daily-level-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 18px;
  align-items: start;
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
  font-size: clamp(2.35rem, 4.2vw, 4rem);
  line-height: 1;
  letter-spacing: 0;
  overflow-wrap: normal;
  word-break: normal;
}

.daily-level-tags span {
  min-height: 28px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid var(--daily-separator);
  padding: 4px 10px;
  background: var(--daily-soft);
  font-size: 0.85rem;
}

.daily-level-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: flex-start;
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
  border: 1px solid var(--daily-separator);
  background: var(--daily-soft);
  color: var(--daily-ink);
}

.daily-level-deep-link-hint {
  margin: -8px 0 0;
  color: var(--daily-muted);
  font-size: 0.9rem;
}

.daily-level-state {
  margin: 24px 0;
  border: 1px solid var(--daily-separator);
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

.daily-level-summary {
  padding: 18px 0 4px;
}

.daily-level-description {
  max-width: 760px;
  margin: 0 0 14px;
  color: var(--daily-ink);
  font-size: 1.02rem;
  line-height: 1.6;
}

.daily-level-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
}

.daily-level-detail {
  min-height: 58px;
  display: grid;
  align-content: center;
  gap: 4px;
  border: 1px solid var(--daily-separator);
  border-radius: 12px;
  padding: 11px 14px;
  background: var(--daily-panel);
}

.daily-level-detail span {
  color: var(--daily-muted);
  font-size: 0.76rem;
}

.daily-level-detail strong {
  overflow-wrap: anywhere;
  font-size: 0.95rem;
  line-height: 1.25;
}

.daily-level-facts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin: 20px 0;
}

.daily-level-fact {
  min-height: 78px;
  display: grid;
  align-content: center;
  gap: 4px;
  border: 1px solid var(--daily-separator);
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
  grid-template-columns: repeat(auto-fill, minmax(176px, 1fr));
  gap: 8px;
}

.daily-level-entity {
  min-height: 64px;
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  border: 1px solid var(--daily-separator);
  border-radius: 12px;
  padding: 8px;
  background: var(--daily-panel);
}

.daily-level-entity img,
.daily-level-placeholder {
  width: 44px;
  height: 44px;
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
  font-size: 0.88rem;
  line-height: 1.25;
}

.daily-level-entity span {
  display: block;
  margin-top: 2px;
  color: var(--daily-muted);
  font-size: 0.74rem;
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
  border: 1px solid var(--daily-separator);
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
