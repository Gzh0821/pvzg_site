<template>
  <li v-if="matchesQuery" class="json-node">
    <div class="json-node__row">
      <button
        v-if="isExpandable"
        class="json-node__toggle"
        type="button"
        :aria-expanded="isExpanded"
        :aria-label="`${isExpanded ? '−' : '+'} ${path}`"
        @click="expanded = !expanded"
      >
        {{ isExpanded ? '−' : '+' }}
      </button>
      <span v-else class="json-node__spacer" />
      <code class="json-node__key">{{ displayKey }}</code>
      <span class="json-node__colon">:</span>
      <code class="json-node__preview" :class="`json-node__preview--${valueType}`">{{ preview }}</code>
      <span class="json-node__actions">
        <button type="button" :title="copyPath" @click="copy(path, copyPath)">{{ copyPath }}</button>
        <button type="button" :title="copyValue" @click="copy(serializedValue, copyValue)">{{ copyValue }}</button>
      </span>
    </div>

    <ul v-if="isExpandable && isExpanded" class="json-node__children">
      <JsonTreeNode
        v-for="([childKey, childValue]) in visibleEntries"
        :key="childKey"
        :node-key="childKey"
        :value="childValue"
        :path="childPath(childKey)"
        :query="query"
        :copy-path="copyPath"
        :copy-value="copyValue"
        :depth="depth + 1"
        @copy="emit('copy', $event)"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import type { JsonValue } from './types';

interface CopyRequest {
  text: string;
  label: string;
}

const props = defineProps<{
  nodeKey: string;
  value: JsonValue;
  path: string;
  query: string;
  copyPath: string;
  copyValue: string;
  depth: number;
}>();

const emit = defineEmits<{
  copy: [request: CopyRequest];
}>();

const isRecord = (value: JsonValue): value is { [key: string]: JsonValue } => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const entriesOf = (value: JsonValue): [string, JsonValue][] => {
  if (Array.isArray(value)) return value.map((item, index) => [String(index), item]);
  if (isRecord(value)) return Object.entries(value);
  return [];
};

const pathFor = (parentPath: string, parentValue: JsonValue, key: string) => (
  Array.isArray(parentValue) ? `${parentPath}[${key}]` : `${parentPath}.${key}`
);

const primitiveText = (value: JsonValue) => {
  if (typeof value === 'string') return value;
  if (value === null) return 'null';
  if (typeof value === 'object') return '';
  return String(value);
};

const nodeMatches = (value: JsonValue, path: string, key: string, query: string): boolean => {
  const term = query.trim().toLocaleLowerCase();
  if (!term) return true;
  if (`${path} ${key} ${primitiveText(value)}`.toLocaleLowerCase().includes(term)) return true;
  return entriesOf(value).some(([childKey, childValue]) => (
    nodeMatches(childValue, pathFor(path, value, childKey), childKey, term)
  ));
};

const expanded = ref(props.depth === 0);
const rawEntries = computed(() => entriesOf(props.value));
const isExpandable = computed(() => rawEntries.value.length > 0);
const isExpanded = computed(() => Boolean(props.query.trim()) || expanded.value);
const matchesQuery = computed(() => nodeMatches(props.value, props.path, props.nodeKey, props.query));
const visibleEntries = computed(() => rawEntries.value.filter(([key, value]) => (
  nodeMatches(value, pathFor(props.path, props.value, key), key, props.query)
)));
const displayKey = computed(() => props.nodeKey);
const valueType = computed(() => {
  if (props.value === null) return 'null';
  if (Array.isArray(props.value)) return 'array';
  return typeof props.value;
});
const preview = computed(() => {
  if (Array.isArray(props.value)) return `[${props.value.length}]`;
  if (isRecord(props.value)) return `{${Object.keys(props.value).length}}`;
  return JSON.stringify(props.value);
});
const serializedValue = computed(() => (
  typeof props.value === 'string' ? props.value : JSON.stringify(props.value, null, 2)
));

const childPath = (key: string) => pathFor(props.path, props.value, key);
const copy = (text: string, label: string) => emit('copy', { text, label });
</script>

<style scoped>
.json-node,
.json-node__children {
  margin: 0;
  padding: 0;
  list-style: none;
}

.json-node__children {
  padding-left: 1.2rem;
  border-left: 1px solid #c9b98d;
}

.json-node__row {
  display: grid;
  grid-template-columns: 1.6rem minmax(5rem, auto) auto minmax(0, 1fr) auto;
  gap: 0.35rem;
  align-items: baseline;
  min-height: 2rem;
  padding: 0.2rem 0.35rem;
  border-radius: 4px;
}

.json-node__row:hover,
.json-node__row:focus-within {
  background: rgb(75 50 31 / 8%);
}

.json-node__toggle,
.json-node__spacer {
  width: 1.45rem;
}

.json-node__toggle {
  height: 1.45rem;
  padding: 0;
  color: #fff8dc;
  border: 0;
  border-radius: 3px;
  background: #695037;
  font-weight: 900;
  line-height: 1;
  cursor: pointer;
}

.json-node__key,
.json-node__preview {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.78rem;
  overflow-wrap: anywhere;
}

.json-node__key {
  color: #684213;
  font-weight: 800;
}

.json-node__colon {
  color: #8b795f;
}

.json-node__preview {
  color: #244d2e;
  white-space: pre-wrap;
}

.json-node__preview--number,
.json-node__preview--boolean {
  color: #8d2f1b;
}

.json-node__preview--null {
  color: #776b5c;
  font-style: italic;
}

.json-node__actions {
  display: inline-flex;
  gap: 0.25rem;
  opacity: 0;
}

.json-node__row:hover .json-node__actions,
.json-node__row:focus-within .json-node__actions {
  opacity: 1;
}

.json-node__actions button {
  padding: 0.12rem 0.35rem;
  color: #49331f;
  border: 1px solid #9d805a;
  border-radius: 3px;
  background: #fff8dc;
  font-size: 0.65rem;
  cursor: pointer;
}

[data-theme='dark'] .json-node__children {
  border-color: #695941;
}

[data-theme='dark'] .json-node__row:hover,
[data-theme='dark'] .json-node__row:focus-within {
  background: rgb(255 248 220 / 7%);
}

[data-theme='dark'] .json-node__key {
  color: #e6bb63;
}

[data-theme='dark'] .json-node__preview {
  color: #a7d7ae;
}

[data-theme='dark'] .json-node__preview--number,
[data-theme='dark'] .json-node__preview--boolean {
  color: #ef9b78;
}

@media (max-width: 600px) {
  .json-node__row {
    grid-template-columns: 1.6rem minmax(4.5rem, auto) auto minmax(6rem, 1fr);
  }

  .json-node__actions {
    grid-column: 2 / -1;
    opacity: 1;
  }
}
</style>
