<template>
  <section class="developer-panel" :aria-busy="status === 'loading'">
    <div v-if="status === 'loading'" class="developer-state">{{ labels.developerLoading }}</div>
    <div v-else-if="status === 'error'" class="developer-state developer-state--error">
      <p>{{ labels.developerError }}</p>
      <button type="button" @click="loadPayload">{{ labels.retry }}</button>
    </div>

    <template v-else-if="payload">
      <header class="developer-heading">
        <h2>{{ labels.developerView }}</h2>
        <p><strong>{{ labels.dataVersion }}:</strong> <code>{{ payload.dataVersion }}</code></p>
      </header>

      <section class="reference-panel">
        <h3>{{ labels.references }}</h3>
        <dl>
          <div v-for="reference in references" :key="reference.key">
            <dt>{{ reference.label }}</dt>
            <dd>
              <code>{{ reference.value.resolvedPath || labels.unavailable }}</code>
              <span v-if="reference.value.rtid">
                <strong>{{ labels.requestedReference }}:</strong> <code>{{ reference.value.rtid }}</code>
              </span>
              <span v-if="reference.value.resolvedAlias">
                <strong>{{ labels.resolvedAlias }}:</strong> <code>{{ reference.value.resolvedAlias }}</code>
              </span>
            </dd>
          </div>
        </dl>
      </section>

      <section v-if="payload.warnings.length" class="warning-panel">
        <h3>{{ labels.developerWarning }}</h3>
        <ul>
          <li v-for="warning in payload.warnings" :key="warning">{{ warning }}</li>
        </ul>
      </section>

      <label class="developer-search">
        <span>{{ labels.searchFields }}</span>
        <span class="developer-search__control">
          <input v-model.trim="query" type="search" :placeholder="labels.searchFields">
          <button v-if="query" type="button" @click="query = ''">{{ labels.clearSearch }}</button>
        </span>
      </label>

      <div class="raw-sections">
        <section v-for="section in rawSections" :key="section.key" class="raw-section">
          <h3>{{ section.label }}</h3>
          <JsonTree
            v-if="section.value !== null"
            :value="section.value"
            :root-path="section.key"
            :query="query"
            :copy-path="labels.copyPath"
            :copy-value="labels.copyValue"
            :no-matches="labels.noMatches"
            @copy="copyToClipboard"
          />
          <p v-else class="raw-section__empty">{{ labels.unavailable }}</p>
        </section>
      </div>

      <p class="copy-status" aria-live="polite">{{ copyStatus }}</p>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';

import JsonTree from './JsonTree.vue';
import type { AlmanacText } from './locales';
import type {
  AlmanacDeveloperPayload,
  AlmanacKind,
  JsonValue,
} from './types';

const props = defineProps<{
  src: string;
  codename: string;
  kind: AlmanacKind;
  labels: AlmanacText;
}>();

const payload = ref<AlmanacDeveloperPayload | null>(null);
const status = ref<'loading' | 'ready' | 'error'>('loading');
const query = ref('');
const copyStatus = ref('');
let controller: AbortController | null = null;
let copyTimer: ReturnType<typeof setTimeout> | null = null;

const isDeveloperPayload = (value: unknown): value is AlmanacDeveloperPayload => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<AlmanacDeveloperPayload>;
  return candidate.schemaVersion === 1
    && typeof candidate.dataVersion === 'string'
    && candidate.kind === props.kind
    && candidate.codename === props.codename
    && Boolean(candidate.references)
    && Boolean(candidate.availability);
};

const loadPayload = async () => {
  controller?.abort();
  controller = new AbortController();
  status.value = 'loading';
  payload.value = null;

  try {
    const response = await fetch(props.src, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const value: unknown = await response.json();
    if (!isDeveloperPayload(value)) throw new Error('Unexpected developer payload');
    payload.value = value;
    status.value = 'ready';
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return;
    status.value = 'error';
  }
};

const references = computed(() => payload.value ? [
  { key: 'feature', label: props.labels.featureData, value: payload.value.references.feature },
  { key: 'props', label: props.labels.propsData, value: payload.value.references.props },
  { key: 'almanac', label: props.labels.almanacData, value: payload.value.references.almanac },
] : []);

const rawSections = computed<{ key: string; label: string; value: JsonValue | null }[]>(() => payload.value ? [
  { key: 'feature', label: props.labels.featureData, value: payload.value.feature },
  { key: 'props', label: props.labels.propsData, value: payload.value.props },
  { key: 'almanac', label: props.labels.almanacData, value: payload.value.almanac },
] : []);

const copyToClipboard = async ({ text, label }: { text: string; label: string }) => {
  try {
    await navigator.clipboard.writeText(text);
    copyStatus.value = `${label} · ${props.labels.copied}`;
    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { copyStatus.value = ''; }, 1800);
  } catch {
    copyStatus.value = props.labels.developerError;
  }
};

watch(() => props.src, loadPayload, { immediate: true });

onBeforeUnmount(() => {
  controller?.abort();
  if (copyTimer) clearTimeout(copyTimer);
});
</script>

<style scoped>
.developer-panel {
  min-height: 10rem;
  margin-bottom: 1.15rem;
  color: var(--almanac-ink);
}

.developer-state,
.developer-heading,
.reference-panel,
.warning-panel,
.developer-search,
.raw-section {
  box-sizing: border-box;
  border: 3px solid var(--almanac-wood);
  border-radius: 10px;
  background: var(--almanac-paper);
  box-shadow: 0 4px 0 rgb(75 50 31 / 22%);
}

.developer-state {
  padding: 1.25rem;
  text-align: center;
}

.developer-state p {
  margin: 0 0 0.75rem;
}

.developer-state button,
.developer-search button {
  padding: 0.42rem 0.7rem;
  color: #fff8dc;
  border: 2px solid var(--almanac-accent-dark);
  border-radius: 5px;
  background: var(--almanac-accent);
  font-weight: 800;
  cursor: pointer;
}

.developer-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.8rem;
  padding: 0.8rem 1rem;
  background: var(--almanac-wood);
  color: #fff8dc;
}

.developer-heading h2,
.developer-heading p {
  margin: 0;
}

.developer-heading h2,
.reference-panel h3,
.warning-panel h3,
.raw-section h3 {
  font-family: 'pvzgeFontEN', 'pvzgFont', 'Noto Sans SC', sans-serif;
}

.developer-heading h2 {
  color: #fff8dc;
  font-size: 1.35rem;
}

.developer-heading code {
  color: #fff1b8;
}

.reference-panel,
.warning-panel,
.developer-search,
.raw-section {
  margin-bottom: 0.8rem;
  overflow: hidden;
}

.reference-panel h3,
.warning-panel h3,
.raw-section h3 {
  margin: 0;
  padding: 0.7rem 0.9rem;
  color: #fff8dc;
  background: var(--almanac-wood);
  font-size: 1.05rem;
}

.reference-panel dl {
  margin: 0;
}

.reference-panel dl > div {
  display: grid;
  grid-template-columns: 7rem minmax(0, 1fr);
  gap: 0.75rem;
  padding: 0.65rem 0.85rem;
  border-top: 1px solid var(--almanac-paper-deep);
}

.reference-panel dt {
  font-weight: 900;
}

.reference-panel dd {
  display: grid;
  min-width: 0;
  gap: 0.25rem;
  margin: 0;
}

.reference-panel dd span {
  display: flex;
  min-width: 0;
  gap: 0.35rem;
  align-items: baseline;
}

.reference-panel code,
.warning-panel li,
.developer-heading code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  overflow-wrap: anywhere;
}

.warning-panel ul {
  margin: 0;
  padding: 0.8rem 1rem 0.8rem 2rem;
}

.developer-search {
  display: grid;
  gap: 0.45rem;
  padding: 0.75rem 0.85rem;
  font-weight: 800;
}

.developer-search__control {
  display: flex;
  gap: 0.5rem;
}

.developer-search input {
  min-width: 0;
  flex: 1;
  padding: 0.6rem 0.7rem;
  color: var(--almanac-ink);
  border: 2px solid #8d7555;
  border-radius: 5px;
  background: rgb(255 255 255 / 55%);
  font: inherit;
}

.raw-sections {
  display: grid;
  gap: 0.2rem;
}

.raw-section__empty {
  margin: 0;
  padding: 1rem;
  color: var(--almanac-muted);
}

.copy-status {
  position: sticky;
  bottom: 1rem;
  z-index: 4;
  width: fit-content;
  min-height: 1.4rem;
  margin: 0 auto;
  padding: 0.25rem 0.65rem;
  color: #fff8dc;
  border-radius: 4px;
  background: var(--almanac-accent-dark);
  font-size: 0.78rem;
}

.copy-status:empty {
  visibility: hidden;
}

[data-theme='dark'] .developer-search input {
  background: #211c16;
}

@media (max-width: 600px) {
  .developer-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .reference-panel dl > div {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }

  .developer-search__control {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
