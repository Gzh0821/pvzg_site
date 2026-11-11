<template>
  <section class="community-levels" :aria-busy="loading">
    <div class="level-toolbar">
      <a v-if="selectedPath" class="level-back" :href="listUrl" @click="navigate($event, listUrl)"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m11.5 4.5-5.5 5.5 5.5 5.5M6 10h10" /></svg>{{ t.back }}</a>
      <p v-else>{{ t.intro }}</p>
      <button class="level-button level-refresh" type="button" :disabled="loading" @click="loadCatalog"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M15.5 7a6 6 0 1 0 .3 5M15.5 3v4h-4" /></svg>{{ t.refresh }}</button>
    </div>
    <p v-if="loading" role="status">{{ t.loading }}</p>
    <div v-else-if="error" role="alert"><p>{{ error }}</p><button class="level-button" type="button" @click="loadCatalog">{{ t.retry }}</button></div>
    <template v-else-if="selected">
      <header class="level-heading">
        <div class="level-summary">
          <h2>{{ title(selected) }}</h2>
          <p class="level-author">{{ selected.author || selected.folder }}</p>
          <p v-if="description(selected)" class="level-description">{{ description(selected) }}</p>
        </div>
        <div class="level-actions">
          <a v-if="GAME_LAUNCH_ENABLED" class="level-button level-primary" :href="githubLevelLink(selected)" @click="openHint = true">{{ t.open }}</a>
          <button class="level-button" :class="{ 'level-primary': !GAME_LAUNCH_ENABLED }" type="button" :disabled="!rawBytes" @click="download"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3v9m-4-4 4 4 4-4M4 13v3h12v-3" /></svg>{{ t.download }}</button>
        </div>
        <p v-if="openHint" class="level-hint" role="status">{{ t.openHint }}</p>
      </header>
      <dl class="level-facts">
        <div v-if="selected.stage"><dt>{{ t.stage }}</dt><dd>{{ stageLabel(selected.stage) }}</dd></div>
        <div v-if="selected.waveCount !== null"><dt>{{ t.waves }}</dt><dd>{{ selected.waveCount }}</dd></div>
        <div v-if="selected.startingSun !== null"><dt>{{ t.sun }}</dt><dd>{{ selected.startingSun }}</dd></div>
        <div><dt>{{ t.supply }}</dt><dd>{{ seedLabel(selected.seedMode) }}</dd></div>
      </dl>
      <p v-if="detailLoading" role="status">{{ t.loadingDetail }}</p>
      <div v-else-if="detailError" role="alert"><p>{{ detailError }}</p><button class="level-button" type="button" @click="loadCatalog">{{ t.retry }}</button></div>
      <template v-else>
        <section v-for="kind in (['plants', 'zombies'] as const)" v-show="references[kind].length" :key="kind" class="level-references">
          <h3>{{ t[kind] }} <span>{{ references[kind].length }}</span></h3>
          <ul>
            <li v-for="id in references[kind]" :key="id">
              <img v-if="entityImage(id, kind)" :src="entityImage(id, kind)" alt="" loading="lazy" @error="hideImage" />
              <span>{{ entityName(id, kind) }}</span>
            </li>
          </ul>
        </section>
        <p v-if="references.plants.length || references.zombies.length" class="level-hint">{{ t.referencesHint }}</p>
      </template>
      <p class="level-path">{{ selected.path }}</p>
    </template>
    <template v-else-if="!selectedPath">
      <form class="level-search" @submit.prevent>
        <label>{{ t.search }}<input v-model="query" type="search" :placeholder="t.searchHint" /></label>
        <label>{{ t.author }}<select v-model="author"><option value="">{{ t.all }}</option><option v-for="name in authors" :key="name">{{ name }}</option></select></label>
      </form>
      <p class="level-result" aria-live="polite">{{ filtered.length }} {{ t.results }}</p>
      <ul v-if="visible.length" class="level-list">
        <li v-for="entry in visible" :key="entry.path">
          <div><a class="level-title" :href="detailUrl(entry)" @click="navigate($event, detailUrl(entry))">{{ title(entry) }}</a><p>{{ entry.author || entry.folder }}<span v-if="entry.stage"> · {{ stageLabel(entry.stage) }}</span></p><p v-if="description(entry)" class="level-excerpt">{{ description(entry) }}</p></div>
          <a class="level-detail-link" :href="detailUrl(entry)" @click="navigate($event, detailUrl(entry))">{{ t.details }}</a>
        </li>
      </ul>
      <p v-else>{{ t.empty }}</p>
      <nav v-if="pages > 1" class="level-pagination" :aria-label="t.pagination">
        <button class="level-button" type="button" :disabled="page === 1" @click="page--">{{ t.previous }}</button><span>{{ page }} / {{ pages }}</span><button class="level-button" type="button" :disabled="page === pages" @click="page++">{{ t.next }}</button>
      </nav>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vuepress/client';
import { getPlantMap } from '../plantsAlmanac/formatPlants';
import { getZombieMap } from '../zombiesAlmanac/formatZombies';
import { stageOptions } from '../level-editor/stage-registry.mjs';
import dailyZh from '../daily-level/locales/zh.json';
import dailyEn from '../daily-level/locales/en.json';
import dailyEs from '../daily-level/locales/es.json';
import dailyRu from '../daily-level/locales/ru.json';
import messages from './i18n.json';
import { API_BASE, parseCatalog, localizedText, githubLevelLink, rawLevelUrl, verifyLevelBytes, levelReferences } from './catalog.mjs';

type Entry = { path: string; sha: string; size: number; title: Record<string, string>; description: Record<string, string>; author: string; folder: string; stage: string; waveCount: number | null; startingSun: number | null; seedMode: string };
// Enable after a public desktop release supports pvzge://github-level/open.
const GAME_LAUNCH_ENABLED = false;
const injectedLanguage = String(inject('i18nLanguage', 'en'));
const language = (injectedLanguage.startsWith('zh') ? 'zh' : injectedLanguage.startsWith('es') ? 'es' : injectedLanguage.startsWith('ru') ? 'ru' : 'en') as keyof typeof messages;
const t = messages[language];
const daily = { zh: dailyZh, en: dailyEn, es: dailyEs, ru: dailyRu }[language];
const route = useRoute();
const router = useRouter();
const prefix = { zh: '', en: '/en', es: '/es-ES', ru: '/ru-RU' }[language];
const listUrl = `${prefix}/creator-garden/community-level.html`;
const hydrated = ref(false);
const selectedPath = computed(() => hydrated.value && typeof route.query.path === 'string' ? route.query.path : '');
const entries = ref<Entry[]>([]), query = ref(''), author = ref(''), page = ref(1);
const loading = ref(true), error = ref(''), detailLoading = ref(false), detailError = ref(''), openHint = ref(false);
const rawBytes = ref<Uint8Array | null>(null);
const references = ref<{ plants: string[]; zombies: string[] }>({ plants: [], zombies: [] });
const plantMap = computed<Record<string, any>>(() => getPlantMap(language));
const zombieMap = computed<Record<string, any>>(() => getZombieMap(language));
let controller: AbortController | null = null;
const title = (entry: Entry) => localizedText(entry.title, language) || entry.path.split('/').at(-1);
const description = (entry: Entry) => localizedText(entry.description, language);
const authors = computed(() => [...new Set(entries.value.map(entry => entry.author || entry.folder))].sort((a, b) => a.localeCompare(b)));
const filtered = computed(() => {
  const search = query.value.trim().toLocaleLowerCase();
  return entries.value.filter(entry => (!author.value || (entry.author || entry.folder) === author.value)
    && (!search || [title(entry), description(entry), entry.author, entry.path].join(' ').toLocaleLowerCase().includes(search)))
    .slice().sort((a, b) => String(title(a)).localeCompare(String(title(b)), language, { numeric: true }));
});
const pages = computed(() => Math.ceil(filtered.value.length / 24));
const visible = computed(() => filtered.value.slice((page.value - 1) * 24, page.value * 24));
const selected = computed(() => entries.value.find(entry => entry.path === selectedPath.value));
const detailUrl = (entry: Entry) => `${listUrl}?${new URLSearchParams({ path: entry.path })}`;
const seedLabel = (mode: string) => (daily.seedModes as Record<string, string>)[mode] || mode;
const stageLabel = (stage: string) => stageOptions.find(option => option.value === stage)?.label || stage;
watch([query, author], () => { page.value = 1; });

function navigate(event: MouseEvent, target: string) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  void router.push(target);
}

function resetDetail() {
  detailError.value = ''; detailLoading.value = false; rawBytes.value = null; openHint.value = false;
  references.value = { plants: [], zombies: [] };
}

async function loadCatalog() {
  controller?.abort(); controller = new AbortController();
  const signal = controller.signal;
  loading.value = true; error.value = ''; resetDetail();
  try {
    const response = await fetch(`${API_BASE}catalog.json`, { signal, cache: 'no-cache' });
    if (!response.ok) throw Error('catalog');
    const catalog = parseCatalog(await response.json()) as Entry[];
    if (signal.aborted) return;
    entries.value = catalog;
    if (selectedPath.value && !selected.value) throw Error('missing');
    loading.value = false;
    if (selected.value) await loadDetail(selected.value, signal);
  } catch (err) {
    if (signal.aborted) return;
    error.value = err instanceof Error && err.message === 'missing' ? t.missing : t.failed;
  } finally { if (!signal.aborted) loading.value = false; }
}
async function loadDetail(entry: Entry, signal: AbortSignal) {
  detailLoading.value = true;
  try {
    const response = await fetch(rawLevelUrl(entry.path), { signal, redirect: 'error' });
    if (!response.ok) throw Error('download');
    const bytes = new Uint8Array(await response.arrayBuffer());
    const raw = await verifyLevelBytes(bytes, entry);
    if (signal.aborted) return;
    rawBytes.value = bytes; references.value = levelReferences(raw);
  } catch (err) { if (!signal.aborted) detailError.value = err instanceof Error && err.message === 'changed' ? t.changed : t.failed; }
  finally { if (!signal.aborted) detailLoading.value = false; }
}
function download() {
  if (!rawBytes.value || !selected.value) return;
  const url = URL.createObjectURL(new Blob([rawBytes.value as BlobPart], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = selected.value.path.split('/').at(-1) || 'level.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function entityName(id: string, kind: 'plants' | 'zombies') { return (kind === 'plants' ? plantMap.value : zombieMap.value)[id]?.name || id; }
function entityImage(id: string, kind: 'plants' | 'zombies') {
  const entity = (kind === 'plants' ? plantMap.value : zombieMap.value)[id];
  if (!entity) return '';
  return kind === 'plants' ? `/assets/image/plants/plants_${id}_c.webp` : `/assets/image/zombies/Zombie_${entity.zombieType || id}_0.webp`;
}
function hideImage(event: Event) { (event.target as HTMLImageElement).hidden = true; }
watch(() => route.query.path, async () => {
  const path = selectedPath.value;
  if (!entries.value.length) { await loadCatalog(); return; }
  controller?.abort(); controller = new AbortController();
  const signal = controller.signal;
  resetDetail(); error.value = ''; loading.value = false;
  const entry = selected.value;
  if (path && !entry) error.value = t.missing;
  detailLoading.value = !!entry;
  if (entry) await loadDetail(entry, signal);
});
onMounted(() => { hydrated.value = true; void loadCatalog(); });
onUnmounted(() => controller?.abort());
</script>

<style scoped>
.community-levels {
  --level-line: var(--vp-c-divider);
  --level-soft: var(--vp-c-bg-alt);
  --level-accent: var(--vp-c-accent, #3eaf7c);
  --level-muted: var(--vp-c-text-mute);
  color: var(--vp-c-text);
  text-align: start;
  font-optical-sizing: auto;
}
.community-levels *, .community-levels *::before, .community-levels *::after { box-sizing: border-box; }
.community-levels p { text-align: start; }
.community-levels svg { width: 1.125rem; height: 1.125rem; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; flex-shrink: 0; }
.level-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin: 1.25rem 0; }
.level-toolbar p { margin: 0; max-width: 65ch; line-height: 1.6; }
.level-back { display: inline-flex; align-items: center; gap: .4rem; min-height: 2.75rem; font-weight: 600; text-underline-offset: .2em; }
.level-button { display: inline-flex; align-items: center; justify-content: center; gap: .5rem; min-height: 2.75rem; max-width: 100%; border: 1px solid var(--level-line); border-radius: .75rem; padding: .6rem 1rem; background: var(--level-soft); color: inherit; font: inherit; font-weight: 600; line-height: 1.25; text-align: center; text-decoration: none; cursor: pointer; touch-action: manipulation; transition: background-color .16s ease-out, border-color .16s ease-out, transform .12s ease-out; }
.level-button:not(:disabled):hover { border-color: var(--level-accent); background: color-mix(in srgb, var(--level-accent) 8%, var(--level-soft)); text-decoration: none; }
.level-button:not(:disabled):active { transform: scale(.97); }
.level-button:disabled { opacity: .5; cursor: default; }
.level-button.level-primary { background: var(--level-accent); color: var(--vp-c-accent-text, #fff); border-color: transparent; }
.level-button.level-primary:not(:disabled):hover { background: color-mix(in srgb, var(--level-accent) 90%, var(--vp-c-text)); border-color: transparent; }
.community-levels :is(a, button, input, select):focus-visible { outline: 2px solid var(--level-accent); outline-offset: 3px; }
.community-levels ::selection { background: color-mix(in srgb, var(--level-accent) 25%, transparent); }
.level-search { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 1rem; margin-top: 1.5rem; }
.level-search label { display: grid; gap: .5rem; font-size: .9375rem; font-weight: 600; }
.level-search :is(input, select) { width: 100%; min-width: 0; min-height: 2.75rem; border: 1px solid var(--level-line); border-radius: .625rem; padding: .65rem .75rem; background: var(--vp-c-bg); color: inherit; font: inherit; caret-color: var(--level-accent); }
.level-search input::placeholder { color: var(--level-muted); opacity: 1; }
.level-result, .level-path { color: var(--level-muted); font-size: .875rem; overflow-wrap: anywhere; }
.level-result { font-variant-numeric: tabular-nums; }
.level-list { list-style: none; padding: 0; margin: 0; }
.level-list > li { display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; margin: 0; padding: 1.125rem 0; border-bottom: 1px solid var(--level-line); }
.level-list > li > div { min-width: 0; }
.level-title { font-size: 1.125rem; font-weight: 700; line-height: 1.4; overflow-wrap: anywhere; text-underline-offset: .2em; }
.level-list p { margin: .35rem 0 0; font-size: .9375rem; line-height: 1.5; }
.level-list p:first-of-type { color: var(--level-muted); }
.level-excerpt { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere; }
.level-detail-link { flex-shrink: 0; padding: .7rem 0; font-size: .9375rem; text-underline-offset: .2em; }
.level-pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.5rem; font-variant-numeric: tabular-nums; }
.level-heading { display: flex; flex-wrap: wrap; align-items: start; justify-content: space-between; gap: 1rem 1.5rem; padding: .375rem 0 1.25rem; border-bottom: 1px solid var(--level-line); }
.level-summary { flex: 1 1 18rem; min-width: 0; }
.level-heading h2 { margin: 0; padding: 0; border: 0; font-size: clamp(1.75rem, 2.8vw, 2.375rem); line-height: 1.2; letter-spacing: -.02em; overflow-wrap: anywhere; text-wrap: balance; }
.level-author { margin: .625rem 0 0; color: var(--level-muted); font-size: .9375rem; line-height: 1.5; }
.level-description { margin: .875rem 0 0; white-space: pre-wrap; max-width: 70ch; line-height: 1.65; overflow-wrap: anywhere; }
.level-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .625rem; padding-top: .125rem; }
.level-hint { flex-basis: 100%; margin: 1rem 0 0; color: var(--level-muted); font-size: .875rem; line-height: 1.6; }
.level-facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr)); gap: 1rem 1.5rem; padding: 1.25rem 0 .5rem; margin: 0; }
.level-facts > div { min-width: 0; }
.level-facts dt { color: var(--level-muted); font-size: .8125rem; line-height: 1.4; }
.level-facts dd { margin: .375rem 0 0; font-size: .9375rem; line-height: 1.5; font-weight: 600; overflow-wrap: anywhere; font-variant-numeric: tabular-nums; }
.level-references { margin-top: 1.75rem; }
.level-references h3 { display: flex; align-items: baseline; gap: .5rem; margin: 0 0 .875rem; padding: 0; font-size: 1.1875rem; line-height: 1.4; }
.level-references h3 span { color: var(--level-muted); font-size: .8125rem; font-weight: 400; font-variant-numeric: tabular-nums; }
.level-references ul { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 10rem), 1fr)); list-style: none; padding: 0; margin: 0; gap: .625rem 1rem; }
.level-references li { display: grid; grid-template-columns: 3.5rem minmax(0, 1fr); align-items: center; gap: .5rem; min-width: 0; min-height: 3rem; margin: 0; padding: 0; font-size: .9375rem; line-height: 1.4; overflow-wrap: anywhere; }
.level-references img { width: 3.5rem; height: 3rem; object-fit: contain; }
.level-references li:not(:has(img:not([hidden]))) { grid-template-columns: minmax(0, 1fr); }
.level-path { margin-top: 1.25rem; line-height: 1.5; }
@media (max-width: 540px) {
  .level-search { grid-template-columns: 1fr; }
  .level-list > li { align-items: start; gap: .75rem; }
  .level-toolbar { align-items: start; }
  .level-refresh { flex-shrink: 0; }
  .level-facts { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (prefers-reduced-motion: reduce) { .level-button { transition: none; } .level-button:not(:disabled):active { transform: none; } }
@media (prefers-contrast: more) { .community-levels { --level-muted: var(--vp-c-text); } .level-button { border-color: currentColor; } }
</style>
