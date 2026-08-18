<template>
  <ResultPage v-if="resultId" :locale="locale" :result-id="resultId" />
  <App v-else :locale="locale" />
</template>

<script setup>
import { onMounted, ref } from 'vue';

import App from './App.vue';
import ResultPage from './ResultPage.vue';
import { LOCALES } from './quiz-data.mjs';
import { getResultById } from './quiz-results.mjs';

defineProps({
  locale: { type: String, default: 'zh', validator: (value) => Object.hasOwn(LOCALES, value) },
});

const resultId = ref('');

onMounted(() => {
  const candidate = new URLSearchParams(window.location.search).get('plant') ?? '';
  if (getResultById(candidate)) resultId.value = candidate;
});
</script>
