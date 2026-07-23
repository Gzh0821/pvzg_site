<template>
  <article class="almanac-shell" :class="`almanac-shell--${entity.kind}`">
    <header class="almanac-toolbar">
      <RouterLink class="back-link" :to="entity.directoryPath">← {{ labels.back }}</RouterLink>
      <div class="toolbar-switches">
        <nav class="view-switch" :aria-label="labels.viewMode">
          <button
            type="button"
            :class="{ active: activeView === 'user' }"
            :aria-pressed="activeView === 'user'"
            @click="setView('user')"
          >
            {{ labels.userView }}
          </button>
          <button
            type="button"
            :class="{ active: activeView === 'developer' }"
            :aria-pressed="activeView === 'developer'"
            @click="setView('developer')"
          >
            {{ labels.developerView }}
          </button>
        </nav>

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
    </header>

    <AdSenseUnit />

    <section
      class="showcase"
      :class="{ 'showcase--single': !entity.stats.length }"
      :aria-label="entity.name"
    >
      <div class="entity-stage" :data-world="entity.world">
        <div class="entity-stage__visual">
          <div class="entity-stage__horizon" />
          <img
            :src="entity.image"
            :alt="entity.name"
            width="420"
            height="330"
            fetchpriority="high"
          >
        </div>

        <header class="entity-identity">
          <div class="entity-identity__copy">
            <h1>{{ entity.name }}</h1>
            <p class="entity-codename">{{ labels.codename }}: {{ entity.codename }}</p>
            <p v-if="entity.world || entity.summary" class="entity-summary">
              <template v-if="entity.world">{{ worldLabel }}</template>
              <template v-if="entity.world && entity.summary"> · </template>
              {{ entity.summary }}
            </p>
          </div>

          <div v-if="entity.family" class="family-mark">
            <img :src="entity.family.icon" alt="" width="56" height="56">
            <strong>{{ entity.family.name }}</strong>
          </div>
        </header>
      </div>

      <div v-if="entity.stats.length" class="stat-panel">
        <h2>{{ labels.attributes }}</h2>
        <dl>
          <div
            v-for="(stat, statIndex) in entity.stats"
            :key="`${stat.type}-${statIndex}`"
            class="stat-row"
          >
            <dt>
              <img v-if="stat.icon" :src="stat.icon" alt="" width="38" height="38">
              <span>{{ stat.label }}</span>
            </dt>
            <dd>{{ stat.value }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <template v-if="activeView === 'user'">
      <div class="lore-stack">
      <section v-if="entity.description" class="lore-panel">
        <h2>{{ labels.introduction }}</h2>
        <p>{{ entity.description }}</p>
      </section>

      <section v-if="entity.specials.length" class="lore-panel">
        <h2>{{ labels.specials }}</h2>
        <div class="special-list">
          <p
            v-for="(special, specialIndex) in entity.specials"
            :key="`${entity.codename}-${specialIndex}`"
            class="special-entry"
          >
            <span v-if="special.name">{{ special.name }}: </span><span class="special-description">{{ special.description }}</span>
          </p>
        </div>
      </section>

      <section v-if="entity.chat" class="lore-panel lore-panel--chat">
        <h2>{{ labels.chat }}</h2>
        <blockquote>{{ entity.chat }}</blockquote>
      </section>

      <section v-if="!entity.hasAlmanac" class="lore-panel">
        <h2>{{ labels.introduction }}</h2>
        <p>{{ labels.noAlmanac }}</p>
      </section>
      </div>

      <div v-if="hasRelations" class="relation-stack">
      <section v-if="entity.parents.length" class="relation-section">
        <h2>{{ labels.originEntities }}</h2>
        <div class="relation-rail">
          <RouterLink
            v-for="parent in entity.parents"
            :key="parent.codename"
            class="relation-card"
            :to="parent.path"
          >
            <img :src="parent.image" alt="" loading="lazy" width="78" height="60">
            <span>
              <strong>{{ parent.name }}</strong>
              <small>{{ parent.codename }}</small>
            </span>
          </RouterLink>
        </div>
      </section>

      <section v-if="entity.children.length" class="relation-section">
        <h2>{{ labels.derivedEntities }}</h2>
        <div class="relation-rail">
          <RouterLink
            v-for="child in entity.children"
            :key="child.codename"
            class="relation-card"
            :to="child.path"
          >
            <img :src="child.image" alt="" loading="lazy" width="78" height="60">
            <span>
              <strong>{{ child.name }}</strong>
              <small>{{ child.codename }}</small>
            </span>
          </RouterLink>
        </div>
      </section>

      <section v-if="entity.siblings.length" class="relation-section">
        <h2>{{ labels.siblingEntities }}</h2>
        <div class="relation-rail">
          <RouterLink
            v-for="sibling in entity.siblings"
            :key="sibling.codename"
            class="relation-card"
            :to="sibling.path"
          >
            <img :src="sibling.image" alt="" loading="lazy" width="78" height="60">
            <span>
              <strong>{{ sibling.name }}</strong>
              <small>{{ sibling.codename }}</small>
            </span>
          </RouterLink>
        </div>
      </section>
      </div>

      <nav v-if="entity.previous && entity.next" class="sequence-nav" :aria-label="labels.nearby">
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
    </template>

    <AlmanacDeveloperPanel
      v-else
      :src="entity.developerPayloadUrl"
      :codename="entity.codename"
      :kind="entity.kind"
      :labels="labels"
    />
  </article>
</template>

<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  onMounted,
  ref,
  watch,
} from 'vue';
import { usePageFrontmatter, useRoute, useRouter } from 'vuepress/client';

import AdSenseUnit from './AdSenseUnit.vue';
import { getAlmanacText, getWorldLabel } from './locales';
import type { AlmanacEntity, AlmanacPageFrontmatter } from './types';

type AlmanacView = 'user' | 'developer';

const AlmanacDeveloperPanel = defineAsyncComponent(() => import('./AlmanacDeveloperPanel.vue'));
const frontmatter = usePageFrontmatter<AlmanacPageFrontmatter>();
const route = useRoute();
const router = useRouter();
const activeView = ref<AlmanacView>('user');
const entity = computed(() => frontmatter.value.almanacEntity as AlmanacEntity);
const labels = computed(() => getAlmanacText(entity.value.locale));
const worldLabel = computed(() => getWorldLabel(entity.value.world, entity.value.locale));
const hasRelations = computed(() => (
  entity.value.parents.length > 0
  || entity.value.children.length > 0
  || entity.value.siblings.length > 0
));
const localePrefix = computed(() => entity.value.locale === 'en' ? '/en' : '');
const plantDirectoryPath = computed(() => `${localePrefix.value}/almanac/plants.html`);
const zombieDirectoryPath = computed(() => `${localePrefix.value}/almanac/zombies.html`);

const routeView = () => route.query.view === 'developer' ? 'developer' : 'user';
const syncViewFromRoute = () => { activeView.value = routeView(); };
const setView = (view: AlmanacView) => {
  activeView.value = view;
  const query = { ...route.query };
  if (view === 'developer') query.view = 'developer';
  else delete query.view;
  void router.replace({ path: route.path, query, hash: route.hash });
};

onMounted(syncViewFromRoute);
watch(() => route.query.view, syncViewFromRoute);
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
  --almanac-description: #865600;
  position: relative;
  left: 50%;
  box-sizing: border-box;
  width: min(1120px, calc(100vw - 2rem));
  margin-top: 0.75rem;
  transform: translateX(-50%);
  color: var(--almanac-ink);
}

:global(.vp-page:has(.almanac-shell) > .vp-page-title) {
  display: none;
}

.almanac-shell--zombie {
  --almanac-accent: #706b91;
  --almanac-accent-dark: #494560;
}

.almanac-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 3.25rem;
  padding: 0.45rem 0.55rem 0.45rem 1rem;
  color: #fff8dc;
  border: 3px solid var(--almanac-wood-dark);
  border-radius: 12px;
  background: var(--almanac-wood);
  box-shadow: inset 0 2px 0 rgb(255 255 255 / 12%), 0 4px 0 var(--almanac-wood-dark);
}

.back-link {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  padding-inline: 0.25rem;
  color: #f2e7c4;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
}

.back-link:hover {
  color: white;
}

.toolbar-switches {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  display: inline-flex;
  min-width: 4.6rem;
  min-height: 2.75rem;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.75rem;
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

.view-switch {
  display: inline-flex;
  gap: 0.2rem;
  padding: 0.3rem;
  border: 2px solid var(--almanac-wood-dark);
  border-radius: 11px;
  background: #37271c;
}

.view-switch button {
  min-height: 2.75rem;
  padding: 0.35rem 0.75rem;
  color: #d9ccb0;
  border: 0;
  border-radius: 7px;
  background: transparent;
  font-family: 'pvzgeFontEN', 'pvzgFont', 'Noto Sans SC', sans-serif;
  font-size: 0.9rem;
  font-weight: 800;
  cursor: pointer;
}

.view-switch button.active {
  color: #2b241c;
  background: #ead8a5;
  box-shadow: inset 0 -3px 0 #ad8952;
}

.entity-identity {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: end;
  padding: 1rem 1.1rem 1.1rem;
  color: #fff8dc;
  border-top: 4px solid var(--almanac-wood-dark);
  background: linear-gradient(105deg, var(--almanac-wood) 0 72%, #392718 72% 100%);
  box-shadow: inset 0 2px 0 rgb(255 255 255 / 10%);
}

.entity-identity__copy {
  min-width: 0;
}

.entity-identity h1 {
  margin: 0;
  color: #fff8dc;
  font-family: 'pvzgeFontEN', 'pvzgFont', 'Noto Sans SC', sans-serif;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.02;
  text-shadow: 0 2px 0 rgb(0 0 0 / 45%);
}

.entity-codename {
  margin: 0.35rem 0 0;
  color: #f2e7c4;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.88rem;
  overflow-wrap: anywhere;
}

.entity-summary {
  margin: 0.65rem 0 0;
  color: #f0e3c2;
  font-family: 'pvzgeFontEN', 'pvzgFont', 'Noto Sans SC', sans-serif;
  font-size: 1.08rem;
  line-height: 1.4;
}

.family-mark {
  display: grid;
  grid-template-columns: 3.5rem minmax(0, 1fr);
  gap: 0.65rem;
  align-items: center;
  min-width: 10.5rem;
  padding-left: 0.95rem;
  border-left: 2px solid rgb(239 226 185 / 25%);
}

.family-mark img {
  width: 3.5rem;
  height: 3.5rem;
  object-fit: contain;
  filter: drop-shadow(0 3px 2px rgb(0 0 0 / 35%));
}

.family-mark strong {
  color: #fff8dc;
  font-family: 'pvzgeFontEN', 'pvzgFont', 'Noto Sans SC', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.25;
}

.showcase {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
  gap: 1rem;
  align-items: start;
  margin-bottom: 1.15rem;
}

.showcase--single {
  grid-template-columns: 1fr;
}

.entity-stage {
  --stage-sky: #9cc9a0;
  --stage-ground: #63894d;
  display: grid;
  grid-template-rows: minmax(300px, 1fr) auto;
  min-height: 470px;
  overflow: hidden;
  border: 4px solid var(--almanac-wood);
  border-radius: 14px;
  background: var(--almanac-wood);
  box-shadow: inset 0 0 0 2px rgb(255 255 255 / 20%), 0 6px 0 var(--almanac-wood-dark);
}

.entity-stage__visual {
  position: relative;
  display: grid;
  min-height: 300px;
  overflow: hidden;
  place-items: center;
  background-color: var(--stage-sky);
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

.entity-stage__visual::before {
  position: absolute;
  inset: 0;
  z-index: -2;
  background: linear-gradient(to bottom, var(--stage-sky) 0 59%, var(--stage-ground) 59% 100%);
  content: '';
}

.entity-stage__visual::after {
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

.entity-stage__visual > img {
  z-index: 1;
  width: min(76%, 400px);
  height: 320px;
  object-fit: contain;
  filter: drop-shadow(0 13px 7px rgb(38 27 18 / 42%));
}

.stat-panel {
  overflow: hidden;
  border: 4px solid var(--almanac-wood);
  border-radius: 14px;
  background: var(--almanac-paper);
  box-shadow: 0 6px 0 var(--almanac-wood-dark);
}

.stat-panel h2,
.neighbor-section h2,
.relation-section h2,
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
.relation-section,
.lore-panel {
  overflow: hidden;
  margin-bottom: 1.15rem;
  border: 3px solid var(--almanac-wood);
  border-radius: 11px;
  background: var(--almanac-paper);
  box-shadow: 0 5px 0 rgb(75 50 31 / 28%);
}

.neighbor-section h2,
.relation-section h2,
.lore-panel h2 {
  padding: 0.72rem 1rem;
}

.relation-stack {
  display: grid;
  gap: 0.2rem;
}

.relation-rail {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
  gap: 0.65rem;
  padding: 0.8rem;
}

.relation-card {
  display: grid;
  min-width: 0;
  grid-template-columns: 4.9rem minmax(0, 1fr);
  align-items: center;
  overflow: hidden;
  color: var(--almanac-ink);
  border: 2px solid #9a7a4c;
  border-radius: 8px;
  background: #fff5d4;
  text-decoration: none;
}

.relation-card img {
  width: 4.9rem;
  height: 3.75rem;
  object-fit: contain;
  background: rgb(79 138 69 / 16%);
}

.almanac-shell--zombie .relation-card img {
  background: rgb(112 107 145 / 18%);
}

.relation-card > span {
  display: grid;
  min-width: 0;
  gap: 0.15rem;
  padding: 0.45rem 0.55rem;
}

.relation-card strong,
.relation-card small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.relation-card strong {
  font-size: 0.88rem;
}

.relation-card small {
  color: var(--almanac-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.7rem;
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
  color: var(--almanac-description);
  font-family: 'pvzgeFontEN', 'pvzgFont', 'Noto Sans SC', sans-serif;
  font-size: clamp(1.18rem, 1rem + 0.7vw, 1.5rem);
  line-height: 1.45;
}

.special-list {
  display: grid;
  gap: 0.4rem;
}

.special-entry {
  margin: 0;
  line-height: inherit;
}

.special-description {
  color: #f00;
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
.relation-card:focus-visible,
.neighbor-card:focus-visible {
  outline: 3px solid #e1a83a;
  outline-offset: 3px;
}

.view-switch button:focus-visible {
  outline: 3px solid #e1a83a;
  outline-offset: 3px;
}

.back-link,
.species-switch a,
.sequence-nav a,
.relation-card,
.neighbor-card {
  transition: color 160ms ease, background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}

.view-switch button {
  transition: color 160ms ease, background-color 160ms ease, box-shadow 160ms ease;
}

[data-theme='dark'] .almanac-shell {
  --almanac-paper: #342d20;
  --almanac-paper-deep: #463a29;
  --almanac-ink: #f2e5c4;
  --almanac-muted: #c8b795;
  --almanac-description: #e2b000;
}

[data-theme='dark'] .stat-panel,
[data-theme='dark'] .neighbor-section,
[data-theme='dark'] .relation-section,
[data-theme='dark'] .lore-panel,
[data-theme='dark'] .sequence-nav a {
  border-color: #8a6949;
}

[data-theme='dark'] .entity-identity h1 {
  color: #fff8dc;
  text-shadow: 0 2px 0 rgb(0 0 0 / 45%);
}

[data-theme='dark'] .neighbor-card,
[data-theme='dark'] .relation-card {
  color: #f2e5c4;
  border-color: #856747;
  background: #211c16;
}

@media (max-width: 820px) {
  .showcase {
    grid-template-columns: 1fr;
  }

  .entity-stage {
    min-height: 0;
  }

  .entity-stage__visual {
    min-height: 320px;
  }

  .entity-stage__visual > img {
    height: 285px;
  }
}

@media (max-width: 600px) {
  .almanac-shell {
    width: calc(100vw - 1rem);
  }

  .almanac-toolbar {
    align-items: stretch;
    flex-direction: column-reverse;
    gap: 0.25rem;
    padding: 0.45rem;
    border-width: 3px;
  }

  .back-link {
    padding-inline: 0.45rem;
  }

  .toolbar-switches {
    width: 100%;
    flex-direction: column-reverse;
    gap: 0.35rem;
  }

  .species-switch {
    width: 100%;
    box-sizing: border-box;
  }

  .species-switch a {
    flex: 1;
  }

  .view-switch {
    width: 100%;
    box-sizing: border-box;
  }

  .view-switch button {
    flex: 1;
  }

  .entity-identity {
    grid-template-columns: 1fr;
    gap: 0.85rem;
    padding: 1rem;
  }

  .entity-stage {
    border-width: 3px;
    border-radius: 11px;
  }

  .entity-stage__visual {
    min-height: 275px;
  }

  .entity-stage__visual > img {
    width: 86%;
    height: 250px;
  }

  .family-mark {
    grid-template-columns: 3rem minmax(0, 1fr);
    min-width: 0;
    padding: 0.75rem 0 0;
    border-top: 2px solid rgb(239 226 185 / 25%);
    border-left: 0;
  }

  .family-mark img {
    width: 3rem;
    height: 3rem;
  }

  .stat-panel {
    border-width: 3px;
    border-radius: 11px;
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

  .view-switch button {
    transition: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .back-link,
  .species-switch a,
  .sequence-nav a,
  .relation-card,
  .neighbor-card {
    transition: none;
  }

  .neighbor-rail {
    scroll-behavior: auto;
  }
}
</style>
