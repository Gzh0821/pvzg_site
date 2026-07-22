<template>
  <div class="almanac-shell" :class="`almanac-shell--${directory.kind}`">
    <header class="almanac-hero">
      <div>
        <p class="almanac-eyebrow">{{ labels.siteLabel }}</p>
        <h1>{{ title }}</h1>
        <p class="almanac-hero__description">{{ description }}</p>
      </div>
      <nav class="species-switch" :aria-label="labels.siteLabel">
        <RouterLink
          :to="plantDirectoryPath"
          :class="{ active: directory.kind === 'plant' }"
          :aria-current="directory.kind === 'plant' ? 'page' : undefined"
        >
          {{ labels.plants }}
        </RouterLink>
        <RouterLink
          :to="zombieDirectoryPath"
          :class="{ active: directory.kind === 'zombie' }"
          :aria-current="directory.kind === 'zombie' ? 'page' : undefined"
        >
          {{ labels.zombies }}
        </RouterLink>
      </nav>
    </header>

    <AdSenseUnit />

    <section class="filter-board" :aria-label="labels.search">
      <label class="search-field">
        <span>{{ labels.search }}</span>
        <input v-model.trim="query" type="search" :placeholder="labels.searchPlaceholder">
      </label>

      <label class="select-field">
        <span>{{ labels.world }}</span>
        <select v-model="world">
          <option value="">{{ labels.allWorlds }}</option>
          <option v-for="option in worldOptions" :key="option.code" :value="option.code">
            {{ option.name }}
          </option>
        </select>
      </label>

      <output class="result-count" aria-live="polite">{{ labels.resultCount(filteredEntities.length) }}</output>

      <fieldset v-if="directory.kind === 'plant'" class="family-field">
        <legend>{{ labels.family }}</legend>
        <div class="family-picker">
          <button
            type="button"
            class="family-option family-option--all"
            :class="{ active: family === '' }"
            :aria-label="labels.allFamilies"
            :aria-pressed="family === ''"
            :title="labels.allFamilies"
            @click="family = ''"
          >
            <img src="/assets/wikicon/All_familyicon.webp" alt="" width="42" height="42">
          </button>
          <button
            v-for="option in familyOptions"
            :key="option.code"
            type="button"
            class="family-option"
            :class="{ active: family === option.code }"
            :aria-label="option.name"
            :aria-pressed="family === option.code"
            :title="option.name"
            @click="family = option.code"
          >
            <img :src="option.icon" alt="" width="42" height="42">
          </button>
        </div>
      </fieldset>
    </section>

    <div v-if="filteredEntities.length" class="packet-grid">
      <RouterLink
        v-for="entity in filteredEntities"
        :key="entity.codename"
        :to="entity.path"
        class="entity-packet"
      >
        <span class="entity-packet__number">{{ getEntityNumber(entity) }}</span>
        <img
          v-if="entity.family"
          class="entity-packet__family-icon"
          :src="entity.family.icon"
          :alt="entity.family.name"
          :title="entity.family.name"
          loading="lazy"
          width="34"
          height="35"
        >
        <div class="entity-packet__art" :data-world="entity.world">
          <img :src="entity.image" :alt="entity.name" loading="lazy" width="180" height="140">
        </div>
        <div class="entity-packet__body">
          <strong>{{ entity.name }}</strong>
          <span class="entity-packet__codename">{{ entity.codename }}</span>
          <span v-if="entity.summary" class="entity-packet__summary">{{ entity.summary }}</span>
        </div>
      </RouterLink>
    </div>

    <p v-else class="empty-state">{{ labels.noResults }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { usePageFrontmatter } from 'vuepress/client';

import AdSenseUnit from './AdSenseUnit.vue';
import { getAlmanacText, getKindDescription, getKindTitle, getWorldLabel } from './locales';
import type { AlmanacDirectoryData, AlmanacDirectoryEntity, AlmanacPageFrontmatter } from './types';

const frontmatter = usePageFrontmatter<AlmanacPageFrontmatter>();
const directory = computed(() => frontmatter.value.almanacDirectory as AlmanacDirectoryData);
const labels = computed(() => getAlmanacText(directory.value.locale));
const title = computed(() => getKindTitle(directory.value.kind, directory.value.locale));
const description = computed(() => getKindDescription(directory.value.kind, directory.value.locale));
const localePrefix = computed(() => directory.value.locale === 'en' ? '/en' : '');
const plantDirectoryPath = computed(() => `${localePrefix.value}/almanac/plants.html`);
const zombieDirectoryPath = computed(() => `${localePrefix.value}/almanac/zombies.html`);

const query = ref('');
const family = ref('');
const world = ref('');

watch(() => directory.value.kind, () => {
  query.value = '';
  family.value = '';
  world.value = '';
});

const familyOptions = computed(() => {
  const options = new Map<string, { name: string; icon: string }>();
  for (const entity of directory.value.entities) {
    if (entity.family) {
      options.set(entity.family.code, {
        name: entity.family.name,
        icon: entity.family.icon,
      });
    }
  }
  return [...options]
    .map(([code, option]) => ({ code, ...option }))
    .sort((a, b) => {
      if (a.code === 'Nope') return 1;
      if (b.code === 'Nope') return -1;
      return a.name.localeCompare(b.name);
    });
});

const worldOptions = computed(() => [...new Set(directory.value.entities.map((entity) => entity.world))]
  .filter(Boolean)
  .map((code) => ({ code, name: getWorldLabel(code, directory.value.locale) }))
  .sort((a, b) => a.name.localeCompare(b.name)));

const getEntityNumber = (entity: AlmanacDirectoryEntity) => entity.numericId
  ?? directory.value.entities.findIndex((candidate) => candidate.codename === entity.codename) + 1;

const filteredEntities = computed(() => {
  const normalizedQuery = query.value.toLocaleLowerCase();
  return directory.value.entities.filter((entity) => {
    const searchable = [
      entity.name,
      entity.englishName,
      entity.codename,
      entity.numericId,
      entity.summary,
      entity.family?.name,
      getWorldLabel(entity.world, directory.value.locale),
    ].filter((value) => value !== null && value !== undefined).join(' ').toLocaleLowerCase();

    return (!normalizedQuery || searchable.includes(normalizedQuery))
      && (!family.value || entity.family?.code === family.value)
      && (!world.value || entity.world === world.value);
  });
});
</script>

<style scoped>
.almanac-shell {
  --almanac-wood: #4b321f;
  --almanac-wood-dark: #2b1c13;
  --almanac-paper: #efe2b9;
  --almanac-paper-deep: #dbc58f;
  --almanac-ink: #2b241c;
  --almanac-accent: #4f8a45;
  --almanac-accent-dark: #315a2c;
  position: relative;
  left: 50%;
  box-sizing: border-box;
  width: min(1180px, calc(100vw - 2rem));
  margin-top: 0.75rem;
  transform: translateX(-50%);
  color: var(--almanac-ink);
}

.almanac-shell--zombie {
  --almanac-accent: #706b91;
  --almanac-accent-dark: #494560;
}

.almanac-hero {
  position: relative;
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 2rem;
  overflow: hidden;
  padding: 1.45rem 1.6rem 1.25rem;
  color: #fff8dc;
  border: 4px solid var(--almanac-wood-dark);
  border-radius: 18px 18px 10px 10px;
  background-color: var(--almanac-wood);
  box-shadow: inset 0 2px 0 rgb(255 255 255 / 13%), 0 7px 0 var(--almanac-wood-dark);
}

.almanac-hero::after {
  position: absolute;
  top: 0;
  right: 8%;
  width: 34%;
  height: 100%;
  border-inline: 1px solid rgb(255 255 255 / 8%);
  content: '';
  opacity: 0.65;
  transform: skewX(-18deg);
  pointer-events: none;
}

.almanac-eyebrow {
  margin: 0 0 0.25rem;
  color: #e8c56a;
  font-family: 'pvzgeFontEN', 'pvzgFont', 'Noto Sans SC', sans-serif;
  font-size: 0.82rem;
  letter-spacing: 0.08em;
}

.almanac-hero h1 {
  margin: 0;
  color: #fff8dc;
  font-family: 'pvzgeFontEN', 'pvzgFont', 'Noto Sans SC', sans-serif;
  font-size: clamp(2rem, 5vw, 3.75rem);
  line-height: 1;
  text-shadow: 0 3px 0 var(--almanac-wood-dark);
}

.almanac-hero__description {
  max-width: 42rem;
  margin: 0.65rem 0 0;
  color: #f2e7c4;
  line-height: 1.55;
}

.species-switch {
  z-index: 1;
  display: inline-flex;
  flex: 0 0 auto;
  gap: 0.35rem;
  padding: 0.35rem;
  border: 2px solid var(--almanac-wood-dark);
  border-radius: 12px;
  background: #2f2219;
}

.species-switch a {
  min-width: 5rem;
  padding: 0.55rem 0.85rem;
  color: #d9ccb0;
  border-radius: 8px;
  font-weight: 700;
  text-align: center;
  text-decoration: none;
}

.species-switch a.active {
  color: white;
  background: var(--almanac-accent);
  box-shadow: inset 0 -3px 0 var(--almanac-accent-dark);
}

.filter-board {
  display: grid;
  grid-template-columns: minmax(15rem, 2fr) minmax(9rem, 1fr) auto;
  gap: 0.85rem;
  align-items: end;
  box-sizing: border-box;
  margin: 0 0 1.3rem;
  padding: 1rem;
  border: 3px solid var(--almanac-wood);
  border-radius: 10px;
  background: var(--almanac-paper);
  box-shadow: 0 5px 0 rgb(75 50 31 / 28%);
}

.search-field,
.select-field,
.family-field legend {
  display: grid;
  gap: 0.35rem;
  min-width: 0;
  color: #695038;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.family-field {
  grid-column: 1 / -1;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.family-field legend {
  margin-bottom: 0.35rem;
  padding: 0;
}

.family-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.family-option {
  position: relative;
  display: grid;
  width: 3.35rem;
  height: 3.35rem;
  flex: 0 0 3.35rem;
  padding: 0.3rem;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: transparent;
  box-shadow: none;
  cursor: pointer;
  transition: transform 140ms ease;
}

.family-option::after {
  position: absolute;
  inset: 0.12rem;
  content: '';
  border: 2px solid transparent;
  border-radius: 50%;
  pointer-events: none;
  transition: border-color 140ms ease, box-shadow 140ms ease;
}

.family-option img {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  object-fit: contain;
  filter: drop-shadow(0 2px 1px rgb(43 28 16 / 28%));
}

.family-option:hover {
  transform: translateY(-1px);
}

.family-option:hover::after {
  border-color: rgb(225 168 58 / 72%);
}

.family-option.active::after {
  border-color: var(--almanac-accent-dark);
  box-shadow: 0 0 0 2px #e1a83a, 0 0 8px rgb(225 168 58 / 46%);
}

.search-field input,
.select-field select {
  box-sizing: border-box;
  width: 100%;
  height: 2.75rem;
  padding: 0 0.8rem;
  color: var(--almanac-ink);
  border: 2px solid #9a7a4c;
  border-radius: 7px;
  outline: none;
  background: #fff9e3;
  font: inherit;
  font-size: 0.94rem;
  font-weight: 600;
  letter-spacing: normal;
  text-transform: none;
}

.search-field input:focus-visible,
.select-field select:focus-visible,
.family-option:focus-visible,
.entity-packet:focus-visible,
.species-switch a:focus-visible {
  outline: 3px solid #e1a83a;
  outline-offset: 3px;
}

.result-count {
  align-self: center;
  min-width: 4.7rem;
  padding-bottom: 0.55rem;
  color: #695038;
  font-weight: 800;
  text-align: right;
}

.packet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 1.1rem;
}

.entity-packet {
  position: relative;
  display: flex;
  min-width: 0;
  overflow: hidden;
  flex-direction: column;
  color: var(--almanac-ink);
  border: 3px solid var(--almanac-wood);
  border-radius: 13px 13px 8px 8px;
  background: var(--almanac-paper);
  box-shadow: 0 6px 0 var(--almanac-wood-dark);
  text-decoration: none;
  transition: transform 150ms ease, box-shadow 150ms ease;
}

.entity-packet:hover {
  color: var(--almanac-ink);
  box-shadow: 0 9px 0 var(--almanac-wood-dark);
  transform: translateY(-3px);
}

.entity-packet__number {
  position: absolute;
  z-index: 2;
  top: 0.55rem;
  left: 0.55rem;
  min-width: 2.2rem;
  padding: 0.16rem 0.35rem;
  color: white;
  border: 2px solid rgb(255 255 255 / 45%);
  border-radius: 999px;
  background: rgb(43 36 28 / 75%);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.72rem;
  font-weight: 800;
  text-align: center;
}

.entity-packet__art {
  position: relative;
  display: grid;
  height: 145px;
  overflow: hidden;
  place-items: center;
  border-bottom: 3px solid var(--almanac-wood);
  background-color: #8fbd73;
}

.almanac-shell--zombie .entity-packet__art {
  background-color: #a4a0bd;
}

.entity-packet__art::before {
  position: absolute;
  inset: 61% 0 0;
  border-top: 2px solid rgb(255 255 255 / 35%);
  background: rgb(65 104 48 / 35%);
  content: '';
}

.entity-packet__art img {
  z-index: 1;
  width: min(88%, 180px);
  height: 132px;
  object-fit: contain;
  filter: drop-shadow(0 6px 3px rgb(30 23 17 / 34%));
}

.entity-packet__body {
  display: grid;
  gap: 0.18rem;
  padding: 0.85rem 0.9rem 1rem;
}

.entity-packet__body strong {
  overflow: hidden;
  font-family: 'pvzgeFontEN', 'pvzgFont', 'Noto Sans SC', sans-serif;
  font-size: 1.18rem;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entity-packet__codename {
  overflow: hidden;
  color: #6d5a45;
  font-size: 0.75rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entity-packet__family-icon {
  position: absolute;
  z-index: 2;
  top: 0.45rem;
  right: 0.45rem;
  width: 2.15rem;
  height: 2.2rem;
  object-fit: contain;
  pointer-events: none;
  filter: drop-shadow(0 2px 1px rgb(43 28 16 / 32%));
}

.entity-packet__summary {
  display: -webkit-box;
  min-height: 2.65em;
  margin-top: 0.38rem;
  overflow: hidden;
  color: #514332;
  font-size: 0.83rem;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.empty-state {
  padding: 3rem 1rem;
  color: #6d5a45;
  border: 3px dashed #a9895c;
  border-radius: 12px;
  background: var(--almanac-paper);
  font-weight: 700;
  text-align: center;
}

[data-theme='dark'] .almanac-shell {
  --almanac-paper: #342d20;
  --almanac-paper-deep: #463a29;
  --almanac-ink: #f2e5c4;
}

[data-theme='dark'] .filter-board,
[data-theme='dark'] .entity-packet,
[data-theme='dark'] .empty-state {
  border-color: #8a6949;
}

[data-theme='dark'] .search-field,
[data-theme='dark'] .select-field,
[data-theme='dark'] .family-field legend,
[data-theme='dark'] .result-count,
[data-theme='dark'] .entity-packet__codename,
[data-theme='dark'] .entity-packet__summary {
  color: #d4c19c;
}

[data-theme='dark'] .search-field input,
[data-theme='dark'] .select-field select {
  color: #f5e9c8;
  border-color: #8a6949;
  background: #211c16;
}

[data-theme='dark'] .family-option.active::after {
  border-color: var(--almanac-accent);
}

@media (max-width: 820px) {
  .almanac-hero {
    align-items: stretch;
    flex-direction: column;
    gap: 1rem;
  }

  .species-switch {
    align-self: flex-start;
  }

  .filter-board {
    grid-template-columns: 1fr 1fr;
  }

  .search-field {
    grid-column: 1 / -1;
  }

  .result-count {
    justify-self: end;
  }
}

@media (max-width: 560px) {
  .almanac-shell {
    width: calc(100vw - 1rem);
  }

  .almanac-hero {
    padding: 1.2rem 1rem 1rem;
    border-width: 3px;
  }

  .species-switch {
    width: 100%;
    box-sizing: border-box;
  }

  .species-switch a {
    flex: 1;
  }

  .filter-board {
    grid-template-columns: 1fr;
  }

  .search-field,
  .result-count {
    grid-column: auto;
  }

  .family-picker {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 0.3rem;
    scroll-snap-type: x proximity;
  }

  .family-option {
    scroll-snap-align: start;
  }

  .packet-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.7rem;
  }

  .entity-packet__art {
    height: 126px;
  }

  .entity-packet__art img {
    height: 116px;
  }

  .entity-packet__body {
    padding: 0.7rem;
  }

  .entity-packet__body strong {
    font-size: 1rem;
  }

  .entity-packet__summary {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .family-option {
    transition: none;
  }

  .family-option::after {
    transition: none;
  }

  .family-option:hover {
    transform: none;
  }

  .entity-packet {
    transition: none;
  }

  .entity-packet:hover {
    transform: none;
  }
}
</style>
