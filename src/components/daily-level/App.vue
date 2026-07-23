<template>
  <section class="daily-level-shell">
    <template v-if="mode === 'home'">
      <header class="daily-archive-header">
        <div>
          <h2>{{ t('archiveTitle') }}</h2>
          <p>{{ t('archiveDescription', { days: archiveWindowDays }) }}</p>
        </div>
        <a v-if="currentDetailUrl" class="daily-level-button daily-level-button--secondary" :href="currentDetailUrl">
          {{ t('today') }}
        </a>
      </header>

      <section class="daily-archive" :aria-label="t('archiveTitle')">
        <div class="daily-calendar">
          <div class="daily-calendar__head">
            <button type="button" :aria-label="t('previousMonth')" :disabled="!canGoPreviousMonth" @click="changeMonth(-1)">‹</button>
            <strong>{{ visibleMonthLabel }}</strong>
            <button type="button" :aria-label="t('nextMonth')" :disabled="!canGoNextMonth" @click="changeMonth(1)">›</button>
          </div>
          <div class="daily-calendar__weekdays" aria-hidden="true">
            <span v-for="weekday in weekdayLabels" :key="weekday">{{ weekday }}</span>
          </div>
          <div class="daily-calendar__grid">
            <template v-for="day in calendarDays" :key="day.date">
              <a
                v-if="day.entry"
                class="daily-calendar__day daily-calendar__day--active"
                :class="{
                  'daily-calendar__day--outside': !day.inMonth,
                  'daily-calendar__day--start': day.isStart,
                  'daily-calendar__day--today': day.date === currentDate
                }"
                :href="detailUrl(day.entry)"
                :aria-label="calendarDayLabel(day)"
                :title="day.entry.level.title"
              >
                <span>{{ day.day }}</span>
                <em v-if="day.isStart" aria-hidden="true">{{ t('newBadge') }}</em>
              </a>
              <span v-else class="daily-calendar__day" :class="{ 'daily-calendar__day--outside': !day.inMonth }">
                <span>{{ day.day }}</span>
              </span>
            </template>
          </div>
        </div>

        <div class="daily-archive-list">
          <div class="daily-archive-list__head">
            <h2>{{ t('recentLevels') }}</h2>
            <span>{{ recentEntries.length }}</span>
          </div>
          <div v-if="archiveLoading" class="daily-archive-list__state">{{ t('loadingArchive') }}</div>
          <div v-else-if="archiveError" class="daily-archive-list__state daily-archive-list__state--error">{{ archiveError }}</div>
          <div v-else-if="!recentEntries.length" class="daily-archive-list__state">{{ t('noArchive') }}</div>
          <a v-for="entry in recentEntries" :key="entry.date" class="daily-archive-entry" :href="detailUrl(entry)">
            <time :datetime="entry.date">{{ formatShortDate(entry.date) }}</time>
            <span>
              <strong>{{ entry.level.title }}</strong>
              <small>{{ entry.level.author || t('unknownAuthor') }}</small>
            </span>
            <b aria-hidden="true">›</b>
          </a>
        </div>
      </section>
    </template>

    <template v-else>
      <nav class="daily-detail-nav" :aria-label="t('detailNavigation')">
        <a class="daily-detail-nav__back" :href="backPath">← {{ t('backToArchive') }}</a>
        <span>
          <a v-if="previousEntry" :href="detailUrl(previousEntry)">{{ t('previousLevel') }}</a>
          <a v-if="nextEntry" :href="detailUrl(nextEntry)">{{ t('nextLevel') }}</a>
        </span>
      </nav>

      <div class="daily-level-hero">
        <div class="daily-level-hero__main">
          <p v-if="detailDisplayDate" class="daily-level-context">
            <strong>{{ isTodayDetail ? t('todayLevel') : t('historicalLevel') }}</strong>
            <time :datetime="detailDisplayDate">{{ formatLongDate(detailDisplayDate) }}</time>
          </p>
          <h2>{{ currentLevel?.title || t('loadingTitle') }}</h2>
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
            <component
              :is="entityAlmanacPath(plant, 'plant') ? 'a' : 'article'"
              v-for="plant in visiblePlants"
              :key="entityKey(plant)"
              class="daily-level-entity"
              :href="entityAlmanacPath(plant, 'plant') || undefined"
              :title="entityAlmanacPath(plant, 'plant') ? t('viewAlmanac') : undefined"
            >
              <img :src="plantImage(plant)" :alt="entityName(plant, 'plant')" loading="lazy" @error="hideBrokenImage" />
              <div>
                <strong>{{ entityName(plant, 'plant') }}</strong>
                <span>{{ roleSummary(plant.roles) }}</span>
              </div>
            </component>
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
            <component
              :is="entityAlmanacPath(zombie, 'zombie') ? 'a' : 'article'"
              v-for="zombie in visibleZombies"
              :key="entityKey(zombie)"
              class="daily-level-entity"
              :href="entityAlmanacPath(zombie, 'zombie') || undefined"
              :title="entityAlmanacPath(zombie, 'zombie') ? t('viewAlmanac') : undefined"
            >
              <img v-if="zombieImage(zombie)" :src="zombieImage(zombie)" :alt="entityName(zombie, 'zombie')" loading="lazy" @error="hideBrokenImage" />
              <div v-else class="daily-level-placeholder" aria-hidden="true">?</div>
              <div>
                <strong>{{ entityName(zombie, 'zombie') }}</strong>
                <span>{{ zombieDetail(zombie) }}</span>
              </div>
            </component>
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
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAlmanacEntityPath } from '../almanac-v2/almanac-routes';
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
  archiveWindowDays?: number;
  daily: {
    date: string;
    slot: number;
    activeFrom: string;
    activeUntil: string;
    level: DailyLevel;
  };
};

type ArchiveEntry = {
  date: string;
  slot: number;
  activeFrom: string;
  activeUntil: string;
  intervalDays: number;
  level: {
    slug: string;
    title: string;
    author: string;
    stats: {
      stage: string;
      seedMode: string;
      waveCount: number;
    };
    counts: {
      plants: number;
      zombies: number;
      mechanics: number;
    };
  };
};

type CalendarPayload = {
  archiveWindowDays?: number;
  currentDate: string;
  daily: ArchiveEntry[];
};

type CalendarDay = {
  date: string;
  day: number;
  inMonth: boolean;
  isStart: boolean;
  entry: ArchiveEntry | null;
};

const props = withDefaults(defineProps<{
  apiBase?: string;
  mode?: 'home' | 'detail';
  detailPath?: string;
  backPath?: string;
}>(), {
  apiBase: 'https://daily-level-api.pvzge.com/api/v1',
  mode: 'home',
  detailPath: '/creator-garden/daily-level/detail.html',
  backPath: '/creator-garden/daily-level.html'
});

const mode = computed(() => props.mode);

const injectedLanguage = inject('i18nLanguage', 'en');
const language = computed<'zh' | 'en' | 'es' | 'ru'>(() => {
  const value = String(injectedLanguage);
  if (value.startsWith('zh')) return 'zh';
  if (value.startsWith('es')) return 'es';
  if (value.startsWith('ru')) return 'ru';
  return 'en';
});
const messages = Object.fromEntries(
  Object.entries(import.meta.glob('./locales/*.json', { eager: true }))
    .map(([key, value]) => [key.match(/\/([a-zA-Z-]+)\.json$/)?.[1], (value as { default: Record<string, unknown> }).default])
    .filter(([locale]) => locale)
) as Record<'zh' | 'en' | 'es' | 'ru', Record<string, unknown>>;
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
const archiveEntries = ref<ArchiveEntry[]>([]);
const calendarCurrentDate = ref('');
const loading = ref(true);
const error = ref('');
const archiveLoading = ref(true);
const archiveError = ref('');
const downloading = ref(false);
const deepLinkHintVisible = ref(false);
const showAllPlants = ref(false);
const showAllZombies = ref(false);
const nowTimestamp = ref(Date.now());
const visibleMonth = ref(startOfUtcMonth(new Date()));
let countdownTimer: number | undefined;
let deepLinkHintTimer: number | undefined;

const currentLevel = computed(() => payload.value?.daily.level || null);
const currentDate = computed(() => payload.value?.daily.date || '');
const selectedArchiveEntry = computed(() => archiveEntries.value.find((entry) => entry.date === currentDate.value) || null);
const isTodayDetail = computed(() => {
  const entry = selectedArchiveEntry.value;
  const today = calendarCurrentDate.value;
  return Boolean(
    mode.value === 'detail'
    && entry
    && today >= entry.date
    && today < entry.activeUntil.slice(0, 10)
  );
});
const detailDisplayDate = computed(() => (
  isTodayDetail.value ? calendarCurrentDate.value : currentDate.value
));
const archiveWindowDays = computed(() => payload.value?.archiveWindowDays || 30);
const currentDetailUrl = computed(() => {
  const entry = archiveEntries.value.find((item) => (
    currentDate.value >= item.date && currentDate.value < item.activeUntil.slice(0, 10)
  ));
  return entry ? detailUrl(entry) : '';
});
const localeCode = computed(() => ({ zh: 'zh-CN', en: 'en-US', es: 'es-ES', ru: 'ru-RU' })[language.value]);
const earliestArchiveDate = computed(() => archiveEntries.value[0]?.date || '');
const latestArchiveDate = computed(() => archiveEntries.value.at(-1)?.date || currentDate.value);
const visibleMonthLabel = computed(() => new Intl.DateTimeFormat(localeCode.value, {
  year: 'numeric',
  month: 'long',
  timeZone: 'UTC'
}).format(visibleMonth.value));
const weekdayLabels = computed(() => Array.from({ length: 7 }, (_, index) => {
  const monday = new Date(Date.UTC(2026, 0, 5 + index));
  return new Intl.DateTimeFormat(localeCode.value, { weekday: 'narrow', timeZone: 'UTC' }).format(monday);
}));
const calendarDays = computed<CalendarDay[]>(() => buildCalendarDays(
  visibleMonth.value,
  archiveEntries.value,
  currentDate.value,
  archiveWindowDays.value
));
const recentEntries = computed(() => archiveEntries.value
  .slice()
  .sort((a, b) => b.date.localeCompare(a.date))
  .slice(0, 4));
const canGoPreviousMonth = computed(() => {
  if (!earliestArchiveDate.value) return false;
  return addUtcMonths(visibleMonth.value, -1).getTime() >= startOfUtcMonth(parseUtcDate(earliestArchiveDate.value)).getTime();
});
const canGoNextMonth = computed(() => {
  if (!latestArchiveDate.value) return false;
  return addUtcMonths(visibleMonth.value, 1).getTime() <= startOfUtcMonth(parseUtcDate(latestArchiveDate.value)).getTime();
});
const selectedArchiveIndex = computed(() => archiveEntries.value.findIndex((entry) => entry.date === currentDate.value));
const previousEntry = computed(() => {
  const index = selectedArchiveIndex.value;
  return index > 0 ? archiveEntries.value[index - 1] : null;
});
const nextEntry = computed(() => {
  const index = selectedArchiveIndex.value;
  return index >= 0 && index < archiveEntries.value.length - 1 ? archiveEntries.value[index + 1] : null;
});
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
const normalizedApiBase = computed(() => {
  const base = props.apiBase.endsWith('/') ? props.apiBase : `${props.apiBase}/`;
  if (/^https?:\/\//.test(base) || typeof window === 'undefined') return base;
  return new URL(base, window.location.origin).toString();
});
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
    isTodayDetail.value && activeCountdown.value ? { label: t('activeCountdown'), value: activeCountdown.value } : null
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
  if (mode.value === 'detail') {
    nowTimestamp.value = Date.now();
    countdownTimer = window.setInterval(() => {
      nowTimestamp.value = Date.now();
    }, 1000);
  }

  try {
    loading.value = true;
    error.value = '';
    archiveLoading.value = true;
    archiveError.value = '';

    if (mode.value === 'detail') {
      const calendarResponse = await fetch(new URL('daily/calendar.json', normalizedApiBase.value));
      if (!calendarResponse.ok) throw new Error(`${calendarResponse.status} ${calendarResponse.statusText}`);
      const calendarPayload = await calendarResponse.json() as CalendarPayload;
      archiveEntries.value = calendarPayload.daily;
      calendarCurrentDate.value = calendarPayload.currentDate;
      const requestedDate = new URLSearchParams(window.location.search).get('date') || '';
      if (!/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) throw new Error(t('missingDate'));
      const entry = archiveEntries.value.find((item) => item.date === requestedDate);
      if (!entry) throw new Error(t('outsideArchive', { days: calendarPayload.archiveWindowDays || 30 }));
      const response = await fetch(new URL(`daily/by-date/${requestedDate}.json`, normalizedApiBase.value));
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      payload.value = await response.json();
    } else {
      const [currentResponse, calendarResponse] = await Promise.all([
        fetch(new URL('daily/current.json', normalizedApiBase.value)),
        fetch(new URL('daily/calendar.json', normalizedApiBase.value))
      ]);
      if (!currentResponse.ok) throw new Error(`${currentResponse.status} ${currentResponse.statusText}`);
      payload.value = await currentResponse.json();
      if (calendarResponse.ok) {
        const calendarPayload = await calendarResponse.json() as CalendarPayload;
        archiveEntries.value = calendarPayload.daily;
        calendarCurrentDate.value = calendarPayload.currentDate;
      } else {
        archiveError.value = t('archiveUnavailable');
      }
    }

    if (payload.value?.daily.date) visibleMonth.value = startOfUtcMonth(parseUtcDate(payload.value.daily.date));
  } catch (err) {
    if (mode.value === 'home') archiveError.value = t('archiveUnavailable');
    else error.value = err instanceof Error ? err.message : String(err);
  } finally {
    loading.value = false;
    archiveLoading.value = false;
  }
});

onUnmounted(() => {
  if (countdownTimer !== undefined) window.clearInterval(countdownTimer);
  if (deepLinkHintTimer !== undefined) window.clearTimeout(deepLinkHintTimer);
});

function parseUtcDate(dateText: string) {
  return new Date(`${dateText}T00:00:00.000Z`);
}

function formatUtcDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfUtcMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function addUtcMonths(date: Date, months: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
}

function addUtcDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function isSameUtcMonth(left: Date, right: Date) {
  return left.getUTCFullYear() === right.getUTCFullYear() && left.getUTCMonth() === right.getUTCMonth();
}

function buildCalendarDays(month: Date, entries: ArchiveEntry[], today: string, windowDays: number): CalendarDay[] {
  const firstDay = startOfUtcMonth(month);
  const mondayOffset = (firstDay.getUTCDay() + 6) % 7;
  const gridStart = addUtcDays(firstDay, -mondayOffset);
  const earliestAllowed = today ? formatUtcDate(addUtcDays(parseUtcDate(today), -windowDays)) : '';

  return Array.from({ length: 42 }, (_, index) => {
    const date = addUtcDays(gridStart, index);
    const dateText = formatUtcDate(date);
    const inRange = Boolean(today && dateText <= today && (!earliestAllowed || dateText >= earliestAllowed));
    const entry = inRange
      ? entries.find((item) => dateText >= item.date && dateText < item.activeUntil.slice(0, 10)) || null
      : null;
    return {
      date: dateText,
      day: date.getUTCDate(),
      inMonth: isSameUtcMonth(date, month),
      isStart: entry?.date === dateText,
      entry
    };
  });
}

function changeMonth(offset: number) {
  if ((offset < 0 && !canGoPreviousMonth.value) || (offset > 0 && !canGoNextMonth.value)) return;
  visibleMonth.value = addUtcMonths(visibleMonth.value, offset);
}

function detailUrl(entry: ArchiveEntry) {
  const query = new URLSearchParams({ date: entry.date, slug: entry.level.slug });
  return `${props.detailPath}?${query.toString()}`;
}

function formatShortDate(dateText: string) {
  return new Intl.DateTimeFormat(localeCode.value, {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  }).format(parseUtcDate(dateText));
}

function formatLongDate(dateText: string) {
  return new Intl.DateTimeFormat(localeCode.value, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  }).format(parseUtcDate(dateText));
}

function calendarDayLabel(day: CalendarDay) {
  if (!day.entry) return day.date;
  const state = day.isStart ? ` · ${t('newLevel')}` : '';
  return `${formatShortDate(day.date)}${state} · ${day.entry.level.title}`;
}

function entityKey(entity: DailyEntity) {
  return `${entity.kind}-${entity.id}-${entity.basedOn || ''}`;
}

function entityAlmanacPath(entity: DailyEntity, type: 'plant' | 'zombie') {
  if (entity.kind !== 'official') return null;
  return getAlmanacEntityPath(type, entity.id, language.value);
}

function formatCountdown(milliseconds: number) {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) return t('refreshSoon');
  const totalSeconds = Math.max(1, Math.ceil(milliseconds / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [
    days ? t('countdown.days', { count: days }) : '',
    hours ? t('countdown.hours', { count: hours }) : '',
    minutes ? t('countdown.minutes', { count: minutes }) : '',
    t('countdown.seconds', { count: seconds })
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
  --daily-green: var(--vp-c-accent, var(--vp-c-brand-1, #3eaf7c));
  --daily-accent-text: var(--vp-c-accent-text, #fff);
  --daily-amber: #b86f1d;
  --daily-coral: #c5523b;
  max-width: 1120px;
  margin: 0 auto;
  color: var(--daily-ink);
}

.daily-archive-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  padding: 24px 0 20px;
}

.daily-archive-header h2 {
  margin: 0;
  font-size: clamp(2rem, 3.4vw, 3rem);
  line-height: 1.05;
  letter-spacing: -0.015em;
}

.daily-archive-header p:last-child {
  max-width: 660px;
  margin: 12px 0 0;
  color: var(--daily-muted);
  line-height: 1.6;
}

.daily-archive {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(260px, 0.75fr);
  gap: 14px;
}

.daily-calendar,
.daily-archive-list {
  border: 1px solid var(--daily-separator);
  border-radius: 20px;
  background: var(--daily-panel);
  box-shadow: 0 12px 36px color-mix(in srgb, var(--daily-ink) 6%, transparent);
}

.daily-calendar {
  padding: 14px;
}

.daily-calendar__head,
.daily-archive-list__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.daily-calendar__head {
  min-height: 48px;
  padding: 0 2px 10px;
}

.daily-calendar__head strong {
  font-size: 1.05rem;
  font-variant-numeric: tabular-nums;
}

.daily-calendar__head button {
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  background: var(--daily-soft);
  color: var(--daily-ink);
  font: inherit;
  font-size: 1.65rem;
  line-height: 1;
  cursor: pointer;
  transition: background 0.16s ease, transform 0.16s ease;
}

.daily-calendar__head button:hover:not(:disabled) {
  background: color-mix(in srgb, var(--daily-green) 14%, var(--daily-soft));
  transform: scale(1.04);
}

.daily-calendar__head button:disabled {
  cursor: default;
  opacity: 0.28;
}

.daily-calendar__weekdays,
.daily-calendar__grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 5px;
}

.daily-calendar__weekdays {
  padding: 2px 0 7px;
  color: var(--daily-muted);
  font-size: 0.72rem;
  font-weight: 700;
  text-align: center;
}

.daily-calendar__day {
  position: relative;
  min-width: 0;
  min-height: 50px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  color: var(--daily-muted);
  font-size: 0.88rem;
  font-variant-numeric: tabular-nums;
  text-decoration: none;
}

.daily-calendar__day--outside {
  opacity: 0.34;
}

.daily-calendar__day--active {
  background: color-mix(in srgb, var(--daily-green) 7%, var(--daily-soft));
  color: var(--daily-ink);
  font-weight: 750;
  transition: background 0.16s ease, transform 0.16s ease;
}

.daily-calendar__day--start {
  background: color-mix(in srgb, var(--daily-green) 17%, var(--daily-soft));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--daily-green) 48%, transparent);
}

.daily-calendar__day--active:hover {
  background: color-mix(in srgb, var(--daily-green) 18%, var(--daily-soft));
  text-decoration: none;
  transform: translateY(-1px);
}

.daily-calendar__day--active em {
  position: absolute;
  top: 5px;
  right: 5px;
  min-width: 17px;
  height: 15px;
  display: inline-grid;
  place-items: center;
  border-radius: 5px;
  padding: 0 3px;
  background: var(--daily-green);
  color: var(--daily-accent-text);
  font-size: 0.56rem;
  font-style: normal;
  font-weight: 800;
  line-height: 1;
}

.daily-calendar__day--today {
  box-shadow: inset 0 0 0 2px var(--daily-green);
}

.daily-archive-list {
  min-height: 100%;
  overflow: hidden;
}

.daily-archive-list__head {
  min-height: 58px;
  padding: 0 16px;
  border-bottom: 1px solid var(--daily-line);
}

.daily-archive-list__head h2 {
  margin: 0;
  font-size: 1.05rem;
}

.daily-archive-list__head span {
  color: var(--daily-muted);
  font-variant-numeric: tabular-nums;
}

.daily-archive-list__state {
  padding: 18px 16px;
  color: var(--daily-muted);
  font-size: 0.9rem;
}

.daily-archive-list__state--error {
  color: var(--daily-coral);
}

.daily-archive-entry {
  min-height: 68px;
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr) 16px;
  gap: 10px;
  align-items: center;
  padding: 9px 14px;
  border-bottom: 1px solid var(--daily-line);
  color: var(--daily-ink);
  text-decoration: none;
  transition: background 0.16s ease;
}

.daily-archive-entry:last-child {
  border-bottom: 0;
}

.daily-archive-entry:hover {
  background: color-mix(in srgb, var(--daily-green) 8%, transparent);
  text-decoration: none;
}

.daily-archive-entry time,
.daily-archive-entry b {
  color: var(--daily-muted);
  font-size: 0.78rem;
  font-variant-numeric: tabular-nums;
}

.daily-archive-entry span {
  min-width: 0;
}

.daily-archive-entry strong,
.daily-archive-entry small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.daily-archive-entry strong {
  font-size: 0.9rem;
}

.daily-archive-entry small {
  margin-top: 2px;
  color: var(--daily-muted);
  font-size: 0.74rem;
}

.daily-detail-nav {
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid var(--daily-line);
  font-size: 0.88rem;
}

.daily-detail-nav span {
  display: flex;
  gap: 18px;
}

.daily-detail-nav a {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  color: var(--daily-green);
  font-weight: 700;
  text-decoration: none;
}

.daily-level-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 18px;
  align-items: start;
  margin-top: 28px;
  padding: 28px 0 24px;
  border-bottom: 1px solid var(--daily-line);
}

.daily-level-hero h2 {
  margin: 0;
  font-size: clamp(2.35rem, 4.2vw, 4rem);
  line-height: 1;
  letter-spacing: 0;
  overflow-wrap: normal;
  word-break: normal;
}

.daily-level-context {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px;
  margin: 0 0 10px;
  color: var(--daily-muted);
  font-size: 0.88rem;
  font-variant-numeric: tabular-nums;
}

.daily-level-context strong {
  color: var(--daily-green);
  font-size: 0.92rem;
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
  color: var(--daily-accent-text);
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

a.daily-level-entity {
  color: inherit;
  text-decoration: none;
  transition: border-color 160ms ease, background-color 160ms ease;
}

@media (hover: hover) and (pointer: fine) {
  a.daily-level-entity:hover {
    border-color: var(--daily-green);
    background: color-mix(in srgb, var(--daily-green) 7%, var(--daily-panel));
  }
}

a.daily-level-entity:focus-visible {
  outline: 2px solid var(--daily-green);
  outline-offset: 2px;
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
  .daily-archive-header {
    display: grid;
    align-items: start;
    padding-top: 14px;
  }

  .daily-archive-header .daily-level-button {
    width: 100%;
  }

  .daily-archive {
    grid-template-columns: 1fr;
  }

  .daily-calendar,
  .daily-archive-list {
    border-radius: 16px;
  }

  .daily-calendar {
    padding: 10px 8px 12px;
  }

  .daily-calendar__weekdays,
  .daily-calendar__grid {
    gap: 2px;
  }

  .daily-calendar__day {
    min-height: 44px;
    font-size: 0.82rem;
  }

  .daily-detail-nav {
    align-items: flex-start;
    flex-direction: column;
    gap: 0;
    padding: 4px 0;
  }

  .daily-detail-nav span {
    width: 100%;
    justify-content: space-between;
  }

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
  .daily-level-button,
  .daily-calendar__head button,
  .daily-calendar__day--active,
  .daily-archive-entry {
    transition: none;
  }

  .daily-level-button:hover,
  .daily-calendar__head button:hover:not(:disabled),
  .daily-calendar__day--active:hover {
    transform: none;
  }
}
</style>
