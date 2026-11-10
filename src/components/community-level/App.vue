<template>
  <section class="community-levels" :aria-busy="loading">
    <div class="level-toolbar">
      <a v-if="selectedPath" :href="listUrl">{{ t.back }}</a>
      <p v-else>{{ t.intro }}</p>
      <button type="button" :disabled="loading" @click="loadCatalog">{{ t.refresh }}</button>
    </div>
    <p v-if="loading" role="status">{{ t.loading }}</p>
    <div v-else-if="error" role="alert"><p>{{ error }}</p><button type="button" @click="loadCatalog">{{ t.retry }}</button></div>
    <template v-else-if="selected">
      <header class="level-heading">
        <h2>{{ title(selected) }}</h2>
        <p>{{ selected.author || selected.folder }}</p>
        <p v-if="description(selected)" class="level-description">{{ description(selected) }}</p>
        <div class="level-actions">
          <a v-if="GAME_LAUNCH_ENABLED" class="level-primary" :href="githubLevelLink(selected)" @click="openHint = true">{{ t.open }}</a>
          <button type="button" :disabled="!rawBytes" @click="download">{{ t.download }}</button>
          <a :href="sourceUrl" target="_blank" rel="noopener noreferrer">{{ t.source }}</a>
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
      <div v-else-if="detailError" role="alert"><p>{{ detailError }}</p><button type="button" @click="loadCatalog">{{ t.retry }}</button></div>
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
          <div><a class="level-title" :href="detailUrl(entry)">{{ title(entry) }}</a><p>{{ entry.author || entry.folder }}<span v-if="entry.stage"> · {{ stageLabel(entry.stage) }}</span></p><p v-if="description(entry)" class="level-excerpt">{{ description(entry) }}</p></div>
          <a class="level-detail-link" :href="detailUrl(entry)">{{ t.details }}</a>
        </li>
      </ul>
      <p v-else>{{ t.empty }}</p>
      <nav v-if="pages > 1" class="level-pagination" :aria-label="t.pagination">
        <button type="button" :disabled="page === 1" @click="page--">{{ t.previous }}</button><span>{{ page }} / {{ pages }}</span><button type="button" :disabled="page === pages" @click="page++">{{ t.next }}</button>
      </nav>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vuepress/client';
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
const prefix = { zh: '', en: '/en', es: '/es-ES', ru: '/ru-RU' }[language];
const listUrl = `${prefix}/creator-garden/community-level.html`;
const selectedPath = computed(() => typeof route.query.path === 'string' ? route.query.path : '');
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
const sourceUrl = computed(() => selected.value ? `https://github.com/NanGarden31415926/PvZ2-Gardendless-GitHubLevels/blob/main/${selected.value.path.split('/').map(encodeURIComponent).join('/')}` : '');
const detailUrl = (entry: Entry) => `${listUrl}?${new URLSearchParams({ path: entry.path })}`;
const seedLabel = (mode: string) => (daily.seedModes as Record<string, string>)[mode] || mode;
const stageLabel = (stage: string) => stageOptions.find(option => option.value === stage)?.label || stage;
watch([query, author], () => { page.value = 1; });

async function loadCatalog() {
  controller?.abort(); controller = new AbortController();
  const signal = controller.signal;
  loading.value = true; error.value = ''; detailError.value = ''; rawBytes.value = null; openHint.value = false;
  references.value = { plants: [], zombies: [] };
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
watch(selectedPath, loadCatalog);
onMounted(loadCatalog);
onUnmounted(() => controller?.abort());
</script>

<style scoped>
.community-levels { --level-line: var(--vp-c-divider); --level-soft: var(--vp-c-bg-alt); --level-accent: var(--vp-c-accent, #3eaf7c); color: var(--vp-c-text); }
.level-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin: 1.5rem 0; }
.level-toolbar p { margin: 0; max-width: 65ch; }
.community-levels button, .level-actions a { min-height: 44px; border: 1px solid var(--level-line); border-radius: 12px; padding: .55rem 1rem; background: var(--level-soft); color: inherit; font: inherit; cursor: pointer; text-decoration: none; }
.community-levels button:hover, .level-actions a:hover { border-color: var(--level-accent); }
.community-levels button:disabled { opacity: .5; cursor: default; }
.community-levels :is(a, button, input, select):focus-visible { outline: 2px solid var(--level-accent); outline-offset: 3px; }
.level-search { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 1rem; margin-top: 2rem; }
.level-search label { display: grid; gap: .5rem; font-weight: 600; }
.level-search :is(input, select) { box-sizing: border-box; width: 100%; min-width: 0; min-height: 44px; border: 1px solid var(--level-line); border-radius: 10px; padding: .65rem; background: var(--vp-c-bg); color: inherit; font: inherit; caret-color: var(--level-accent); }
.level-result, .level-path { color: var(--vp-c-text-mute); font-size: .875rem; overflow-wrap: anywhere; }
.level-list { list-style: none; padding: 0; margin: 0; }
.level-list > li { display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; padding: 1.25rem 0; border-bottom: 1px solid var(--level-line); }
.level-list > li > div { min-width: 0; }
.level-title { font-size: 1.2rem; font-weight: 700; overflow-wrap: anywhere; }
.level-list p { margin: .4rem 0 0; }
.level-excerpt { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere; }
.level-detail-link { flex-shrink: 0; padding: .7rem 0; }
.level-pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.5rem; font-variant-numeric: tabular-nums; }
.level-heading { padding: 1rem 0 1.5rem; border-bottom: 1px solid var(--level-line); }
.level-heading h2 { margin: 0; border: 0; font-size: clamp(1.8rem, 4vw, 3rem); line-height: 1.2; overflow-wrap: anywhere; }
.level-description { white-space: pre-wrap; max-width: 70ch; overflow-wrap: anywhere; }
.level-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .75rem; margin-top: 1.5rem; }
.level-actions .level-primary { background: var(--level-accent); color: var(--vp-c-accent-text, #fff); border-color: transparent; font-weight: 700; }
.level-hint { font-size: .875rem; line-height: 1.6; }
.level-facts { display: flex; flex-wrap: wrap; gap: 1.5rem 3rem; padding: 1.5rem 0; margin: 0; }
.level-facts dt { font-size: .875rem; }
.level-facts dd { margin: .4rem 0 0; font-weight: 700; }
.level-references { margin-top: 2rem; }
.level-references h3 span { margin-left: .5rem; font-size: .875rem; font-weight: 400; }
.level-references ul { display: grid; grid-template-columns: repeat(auto-fill, minmax(125px, 1fr)); list-style: none; padding: 0; gap: .75rem; }
.level-references li { display: flex; align-items: center; gap: .5rem; overflow-wrap: anywhere; min-width: 0; }
.level-references img { width: 52px; height: 44px; object-fit: contain; flex-shrink: 0; }
@media (max-width: 540px) { .level-search { grid-template-columns: 1fr; } .level-list > li { align-items: start; gap: .75rem; } .level-toolbar { align-items: start; } .level-toolbar button { flex-shrink: 0; } }
</style>
