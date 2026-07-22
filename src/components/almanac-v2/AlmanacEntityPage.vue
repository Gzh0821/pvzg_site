<template>
  <article class="almanac-shell" :class="`almanac-shell--${entity.kind}`">
    <header class="entity-header">
      <div class="entity-header__topline">
        <RouterLink class="back-link" :to="entity.directoryPath">← {{ labels.back }}</RouterLink>
        <nav class="species-switch" :aria-label="labels.siteLabel">
          <RouterLink
            :to="plantDirectoryPath"
            :class="{ active: entity.kind === 'plant' }"
            :aria-current="entity.kind === 'plant' ? 'page' : undefined"
          >
            {{ labels.plants }}
          </RouterLink>
          <RouterLink
            :to="zombieDirectoryPath"
            :class="{ active: entity.kind === 'zombie' }"
            :aria-current="entity.kind === 'zombie' ? 'page' : undefined"
          >
            {{ labels.zombies }}
          </RouterLink>
        </nav>
      </div>

      <p class="entity-eyebrow">{{ kindTitle }}</p>
      <h1>{{ entity.name }}</h1>
      <p v-if="entity.englishName !== entity.name" class="entity-english">{{ entity.englishName }}</p>
      <p v-if="entity.summary" class="entity-summary">{{ entity.summary }}</p>
      <div class="entity-tags">
        <span v-if="entity.world">{{ worldLabel }}</span>
        <span v-if="entity.family">{{ entity.family.name }}</span>
      </div>
    </header>

    <AdSenseUnit />

    <section class="showcase" :aria-label="entity.name">
      <div class="entity-stage" :data-world="entity.world">
        <div class="entity-stage__horizon" />
        <img
          :src="entity.image"
          :alt="entity.name"
          width="420"
          height="330"
          fetchpriority="high"
        >
        <div class="entity-nameplate">
          <strong>{{ entity.name }}</strong>
          <span>{{ entity.englishName }}</span>
        </div>
      </div>

      <div class="stat-panel">
        <h2>{{ labels.attributes }}</h2>
        <dl>
          <div v-for="stat in entity.stats" :key="stat.type" class="stat-row">
            <dt>
              <img v-if="stat.icon" :src="stat.icon" alt="" width="38" height="38">
              <span>{{ stat.label }}</span>
            </dt>
            <dd>{{ stat.value }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <nav class="sequence-nav" :aria-label="labels.nearby">
      <RouterLink :to="entity.previous.path" rel="prev">
        <span>{{ labels.previous }}</span>
        <strong>← {{ entity.previous.name }}</strong>
      </RouterLink>
      <RouterLink :to="entity.next.path" rel="next">
        <span>{{ labels.next }}</span>
        <strong>{{ entity.next.name }} →</strong>
      </RouterLink>
    </nav>

    <section class="neighbor-section" :aria-labelledby="`nearby-${entity.codename}`">
      <h2 :id="`nearby-${entity.codename}`">{{ labels.nearby }}</h2>
      <div class="neighbor-rail">
        <template v-for="neighbor in entity.neighbors" :key="neighbor.codename">
          <div v-if="neighbor.current" class="neighbor-card current" aria-current="page">
            <img :src="neighbor.image" alt="" width="92" height="70">
            <span>{{ neighbor.name }}</span>
          </div>
          <RouterLink v-else class="neighbor-card" :to="neighbor.path">
            <img :src="neighbor.image" alt="" loading="lazy" width="92" height="70">
            <span>{{ neighbor.name }}</span>
          </RouterLink>
        </template>
      </div>
    </section>

    <div class="lore-stack">
      <section v-if="entity.description" class="lore-panel">
        <h2>{{ labels.introduction }}</h2>
        <p>{{ entity.description }}</p>
      </section>

      <section v-if="entity.specials.length" class="lore-panel">
        <h2>{{ labels.specials }}</h2>
        <div class="special-list">
          <article v-for="special in entity.specials" :key="`${special.name}-${special.description}`">
            <h3 v-if="special.name">{{ special.name }}</h3>
            <p>{{ special.description }}</p>
          </article>
        </div>
      </section>

      <section v-if="entity.chat" class="lore-panel lore-panel--chat">
        <h2>{{ labels.chat }}</h2>
        <blockquote>{{ entity.chat }}</blockquote>
      </section>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePageFrontmatter } from 'vuepress/client';

import AdSenseUnit from './AdSenseUnit.vue';
import { getAlmanacText, getKindTitle, getWorldLabel } from './locales';
import type { AlmanacEntity, AlmanacPageFrontmatter } from './types';

const frontmatter = usePageFrontmatter<AlmanacPageFrontmatter>();
const entity = computed(() => frontmatter.value.almanacEntity as AlmanacEntity);
const labels = computed(() => getAlmanacText(entity.value.locale));
const kindTitle = computed(() => getKindTitle(entity.value.kind, entity.value.locale));
const worldLabel = computed(() => getWorldLabel(entity.value.world, entity.value.locale));
const localePrefix = computed(() => entity.value.locale === 'en' ? '/en' : '');
const plantDirectoryPath = computed(() => `${localePrefix.value}/almanac/plants.html`);
const zombieDirectoryPath = computed(() => `${localePrefix.value}/almanac/zombies.html`);
</script>

<style scoped>
.almanac-shell {
  --almanac-wood: #4b321f;
  --almanac-wood-dark: #281a11;
  --almanac-paper: #efe2b9;
  --almanac-paper-deep: #d9c38f;
  --almanac-ink: #2b241c;
  --almanac-muted: #6d5a45;
  --almanac-accent: #4f8a45;
  --almanac-accent-dark: #315a2c;
  position: relative;
  left: 50%;
  box-sizing: border-box;
  width: min(1120px, calc(100vw - 2rem));
  transform: translateX(-50%);
  color: var(--almanac-ink);
}

.almanac-shell--zombie {
  --almanac-accent: #706b91;
  --almanac-accent-dark: #494560;
}

.entity-header {
  position: relative;
  overflow: hidden;
  padding: 1.35rem 1.55rem 1.5rem;
  color: #fff8dc;
  border: 4px solid var(--almanac-wood-dark);
  border-radius: 18px 18px 10px 10px;
  background: var(--almanac-wood);
  box-shadow: inset 0 2px 0 rgb(255 255 255 / 13%), 0 7px 0 var(--almanac-wood-dark);
}

.entity-header::after {
  position: absolute;
  top: -50%;
  right: 3%;
  width: 28%;
  height: 210%;
  border-inline: 1px solid rgb(255 255 255 / 8%);
  content: '';
  opacity: 0.65;
  transform: rotate(13deg);
  pointer-events: none;
}

.entity-header__topline {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.4rem;
}

.back-link {
  color: #f2e7c4;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
}

.back-link:hover {
  color: white;
}

.species-switch {
  display: inline-flex;
  gap: 0.3rem;
  padding: 0.3rem;
  border: 2px solid var(--almanac-wood-dark);
  border-radius: 11px;
  background: #2f2219;
}

.species-switch a {
  min-width: 4.6rem;
  padding: 0.45rem 0.75rem;
  color: #d9ccb0;
  border-radius: 7px;
  font-weight: 700;
  text-align: center;
  text-decoration: none;
}

.species-switch a.active {
  color: white;
  background: var(--almanac-accent);
  box-shadow: inset 0 -3px 0 var(--almanac-accent-dark);
}

.entity-eyebrow {
  margin: 0 0 0.2rem;
  color: #e8c56a;
  font-family: 'pvzgeFontEN', 'pvzgFont', 'Noto Sans SC', sans-serif;
  font-size: 0.82rem;
  letter-spacing: 0.08em;
}

.entity-header h1 {
  margin: 0;
  color: #fff8dc;
  font-family: 'pvzgeFontEN', 'pvzgFont', 'Noto Sans SC', sans-serif;
  font-size: clamp(2.35rem, 7vw, 4.8rem);
  line-height: 0.98;
  text-shadow: 0 4px 0 var(--almanac-wood-dark);
}

.entity-english {
  margin: 0.45rem 0 0;
  color: #e6d6aa;
  font-family: 'pvzgeFontEN', 'Noto Sans SC', sans-serif;
  font-size: clamp(1rem, 2vw, 1.35rem);
}

.entity-summary {
  max-width: 44rem;
  margin: 0.85rem 0 0;
  color: #fff8dc;
  font-size: 1.05rem;
  line-height: 1.55;
}

.entity-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 1rem;
}

.entity-tags span {
  padding: 0.3rem 0.65rem;
  border: 1px solid rgb(255 255 255 / 28%);
  border-radius: 999px;
  background: rgb(27 18 12 / 38%);
  color: #f4e7c4;
  font-size: 0.8rem;
  font-weight: 700;
}

.showcase {
  display: grid;
  grid-template-columns: minmax(0, 1.18fr) minmax(280px, 0.82fr);
  gap: 1rem;
  margin-bottom: 1.15rem;
}

.entity-stage {
  --stage-sky: #9cc9a0;
  --stage-ground: #63894d;
  position: relative;
  display: grid;
  min-height: 410px;
  overflow: hidden;
  place-items: center;
  border: 4px solid var(--almanac-wood);
  border-radius: 12px;
  background-color: var(--stage-sky);
  box-shadow: inset 0 0 0 2px rgb(255 255 255 / 20%), 0 6px 0 var(--almanac-wood-dark);
  isolation: isolate;
}

.entity-stage[data-world='dark'] {
  --stage-sky: #49445f;
  --stage-ground: #454b35;
}

.entity-stage[data-world='future'],
.entity-stage[data-world='sky'] {
  --stage-sky: #8ec5cf;
  --stage-ground: #637b72;
}

.entity-stage[data-world='beach'],
.entity-stage[data-world='water'],
.entity-stage[data-world='pirate'] {
  --stage-sky: #8ac3c9;
  --stage-ground: #c4a66d;
}

.entity-stage[data-world='egypt'],
.entity-stage[data-world='cowboy'],
.entity-stage[data-world='lostcity'],
.entity-stage[data-world='dino'] {
  --stage-sky: #d5b978;
  --stage-ground: #937047;
}

.entity-stage::before {
  position: absolute;
  inset: 0;
  z-index: -2;
  background: linear-gradient(to bottom, var(--stage-sky) 0 59%, var(--stage-ground) 59% 100%);
  content: '';
}

.entity-stage::after {
  position: absolute;
  right: -6%;
  bottom: -17%;
  left: -6%;
  z-index: -1;
  height: 53%;
  border-radius: 50% 50% 0 0;
  background: rgb(58 95 45 / 32%);
  box-shadow: inset 0 3px 0 rgb(255 255 255 / 16%);
  content: '';
}

.entity-stage__horizon {
  position: absolute;
  inset: 59% 0 auto;
  height: 2px;
  background: rgb(255 255 255 / 28%);
}

.entity-stage > img {
  z-index: 1;
  width: min(74%, 420px);
  height: 330px;
  margin-bottom: 1.6rem;
  object-fit: contain;
  filter: drop-shadow(0 13px 7px rgb(38 27 18 / 42%));
}

.entity-nameplate {
  position: absolute;
  z-index: 2;
  right: 1rem;
  bottom: 0.8rem;
  left: 1rem;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.7rem 0.9rem;
  color: #fff5d5;
  border: 3px solid var(--almanac-wood-dark);
  border-radius: 8px;
  background: var(--almanac-wood);
  box-shadow: inset 0 2px 0 rgb(255 255 255 / 12%);
}

.entity-nameplate strong {
  font-family: 'pvzgeFontEN', 'pvzgFont', 'Noto Sans SC', sans-serif;
  font-size: 1.2rem;
}

.entity-nameplate span {
  overflow: hidden;
  color: #d9c9a5;
  font-size: 0.78rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat-panel {
  overflow: hidden;
  border: 4px solid var(--almanac-wood);
  border-radius: 12px;
  background: var(--almanac-paper);
  box-shadow: 0 6px 0 var(--almanac-wood-dark);
}

.stat-panel h2,
.neighbor-section h2,
.lore-panel h2 {
  margin: 0;
  color: #fff8dc;
  background: var(--almanac-wood);
  font-family: 'pvzgeFontEN', 'pvzgFont', 'Noto Sans SC', sans-serif;
  font-size: 1.3rem;
  line-height: 1.2;
}

.stat-panel h2 {
  padding: 0.85rem 1rem;
  border-bottom: 3px solid var(--almanac-wood-dark);
}

.stat-panel dl {
  display: grid;
  gap: 0.45rem;
  margin: 0;
  padding: 0.75rem;
}

.stat-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.65rem;
  align-items: center;
  min-height: 3.2rem;
  padding: 0.4rem 0.55rem;
  border: 2px solid var(--almanac-accent-dark);
  border-radius: 8px;
  background: var(--almanac-accent);
  box-shadow: inset 0 -3px 0 rgb(26 45 23 / 24%);
}

.stat-row dt {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  min-width: 0;
  color: white;
  font-weight: 800;
  text-shadow: 0 1px 1px rgb(0 0 0 / 55%);
}

.stat-row dt img {
  flex: 0 0 auto;
  object-fit: contain;
}

.stat-row dd {
  max-width: 11rem;
  margin: 0;
  color: #fff9cf;
  font-family: 'pvzgeFontEN', 'pvzgFont', 'Noto Sans SC', sans-serif;
  font-size: 1.08rem;
  font-weight: 800;
  text-align: right;
  text-shadow: 0 1px 1px rgb(0 0 0 / 55%);
  overflow-wrap: anywhere;
}

.sequence-nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin: 1.2rem 0;
}

.sequence-nav a {
  display: grid;
  gap: 0.15rem;
  padding: 0.75rem 0.9rem;
  color: var(--almanac-ink);
  border: 2px solid #9d7a4e;
  border-radius: 9px;
  background: var(--almanac-paper);
  text-decoration: none;
}

.sequence-nav a:last-child {
  text-align: right;
}

.sequence-nav span {
  color: var(--almanac-muted);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.sequence-nav strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.neighbor-section,
.lore-panel {
  overflow: hidden;
  margin-bottom: 1.15rem;
  border: 3px solid var(--almanac-wood);
  border-radius: 11px;
  background: var(--almanac-paper);
  box-shadow: 0 5px 0 rgb(75 50 31 / 28%);
}

.neighbor-section h2,
.lore-panel h2 {
  padding: 0.72rem 1rem;
}

.neighbor-rail {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.65rem;
  padding: 0.8rem;
}

.neighbor-card {
  display: grid;
  min-width: 0;
  overflow: hidden;
  color: var(--almanac-ink);
  border: 2px solid #9a7a4c;
  border-radius: 8px;
  background: #fff5d4;
  text-align: center;
  text-decoration: none;
}

.neighbor-card.current {
  border-color: var(--almanac-accent-dark);
  box-shadow: inset 0 0 0 2px var(--almanac-accent);
}

.neighbor-card img {
  width: 100%;
  height: 72px;
  object-fit: contain;
  background: rgb(79 138 69 / 16%);
}

.almanac-shell--zombie .neighbor-card img {
  background: rgb(112 107 145 / 18%);
}

.neighbor-card span {
  overflow: hidden;
  padding: 0.45rem 0.35rem;
  font-size: 0.78rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lore-stack {
  display: grid;
  gap: 0.2rem;
}

.lore-panel > p,
.lore-panel blockquote,
.special-list {
  margin: 0;
  padding: 1.1rem 1.2rem 1.25rem;
  color: var(--almanac-ink);
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 1rem;
  line-height: 1.8;
}

.special-list {
  display: grid;
  gap: 0.85rem;
}

.special-list article {
  padding: 0.85rem 0.95rem;
  border-left: 5px solid var(--almanac-accent);
  background: rgb(255 255 255 / 28%);
}

.special-list h3 {
  margin: 0 0 0.25rem;
  color: var(--almanac-ink);
  font-family: 'pvzgeFontEN', 'pvzgFont', 'Noto Sans SC', sans-serif;
  font-size: 1.02rem;
}

.special-list p {
  margin: 0;
}

.lore-panel blockquote {
  border: 0;
  background: transparent;
  font-style: italic;
}

.lore-panel blockquote::before {
  color: var(--almanac-accent);
  content: '“';
  font-family: Georgia, serif;
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 0;
  vertical-align: -0.38em;
}

.back-link:focus-visible,
.species-switch a:focus-visible,
.sequence-nav a:focus-visible,
.neighbor-card:focus-visible {
  outline: 3px solid #e1a83a;
  outline-offset: 3px;
}

[data-theme='dark'] .almanac-shell {
  --almanac-paper: #342d20;
  --almanac-paper-deep: #463a29;
  --almanac-ink: #f2e5c4;
  --almanac-muted: #c8b795;
}

[data-theme='dark'] .stat-panel,
[data-theme='dark'] .neighbor-section,
[data-theme='dark'] .lore-panel,
[data-theme='dark'] .sequence-nav a {
  border-color: #8a6949;
}

[data-theme='dark'] .neighbor-card {
  color: #f2e5c4;
  border-color: #856747;
  background: #211c16;
}

[data-theme='dark'] .special-list article {
  background: rgb(255 255 255 / 5%);
}

@media (max-width: 820px) {
  .showcase {
    grid-template-columns: 1fr;
  }

  .entity-stage {
    min-height: 360px;
  }

  .entity-stage > img {
    height: 285px;
  }
}

@media (max-width: 600px) {
  .almanac-shell {
    width: calc(100vw - 1rem);
  }

  .entity-header {
    padding: 1rem;
    border-width: 3px;
  }

  .entity-header__topline {
    align-items: stretch;
    flex-direction: column-reverse;
    margin-bottom: 1.05rem;
  }

  .species-switch {
    width: 100%;
    box-sizing: border-box;
  }

  .species-switch a {
    flex: 1;
  }

  .entity-stage {
    min-height: 325px;
  }

  .entity-stage > img {
    width: 86%;
    height: 250px;
    margin-bottom: 2rem;
  }

  .entity-nameplate span {
    display: none;
  }

  .sequence-nav {
    grid-template-columns: 1fr;
  }

  .sequence-nav a:last-child {
    text-align: left;
  }

  .neighbor-rail {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
  }

  .neighbor-card {
    min-width: 8.2rem;
    scroll-snap-align: start;
  }

  .stat-row dd {
    max-width: 8.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .neighbor-rail {
    scroll-behavior: auto;
  }
}
</style>
