<template>
  <div class="almanac-v2-ad-placement">
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-client="ca-pub-2336226859954206"
         data-ad-slot="1822530351"
         data-ad-format="auto"
         data-full-width-responsive="true">
    </ins>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[] & { push: (value: Record<string, unknown>) => number };
  }
}

onMounted(() => {
  (window.adsbygoogle = window.adsbygoogle || []).push({});
});
</script>

<style>
.almanac-v2-ad-placement {
  margin: 1rem 0 1.35rem;
}
</style>
