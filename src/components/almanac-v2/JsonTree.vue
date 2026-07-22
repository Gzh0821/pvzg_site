<template>
  <ul v-if="hasMatches" class="json-tree">
    <JsonTreeNode
      v-for="([key, childValue]) in visibleEntries"
      :key="key"
      :node-key="key"
      :value="childValue"
      :path="childPath(key)"
      :query="query"
      :copy-path="copyPath"
      :copy-value="copyValue"
      :depth="0"
      @copy="emit('copy', $event)"
    />
  </ul>
  <p v-else class="json-tree__empty">{{ noMatches }}</p>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import JsonTreeNode from './JsonTreeNode.vue';
import type { JsonValue } from './types';

interface CopyRequest {
  text: string;
  label: string;
}

const props = defineProps<{
  value: JsonValue;
  rootPath: string;
  query: string;
  copyPath: string;
  copyValue: string;
  noMatches: string;
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

const rawEntries = computed(() => entriesOf(props.value));
const visibleEntries = computed(() => rawEntries.value.filter(([key, value]) => (
  nodeMatches(value, pathFor(props.rootPath, props.value, key), key, props.query)
)));
const hasMatches = computed(() => visibleEntries.value.length > 0);
const childPath = (key: string) => pathFor(props.rootPath, props.value, key);
</script>

<style scoped>
.json-tree {
  margin: 0;
  padding: 0.75rem;
  overflow-x: auto;
  list-style: none;
}

.json-tree__empty {
  margin: 0;
  padding: 1rem;
  color: #78684f;
}
</style>
