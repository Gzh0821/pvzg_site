<template>
  <div class="almanac-ad" aria-label="Advertisement">
    <ins
      class="adsbygoogle"
      style="display: block"
      data-ad-client="ca-pub-2336226859954206"
      data-ad-slot="1822530351"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted } from 'vue';

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[] & { push: (value: Record<string, unknown>) => number };
  }
}

onMounted(async () => {
  await nextTick();
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch {
    // Ad blockers and local previews may prevent AdSense from initializing.
  }
});
</script>

<style scoped>
.almanac-ad {
  box-sizing: border-box;
  width: 100%;
  min-height: 100px;
  margin: 1rem 0 1.35rem;
  overflow: hidden;
}

.almanac-ad:has(.adsbygoogle[data-ad-status='unfilled']) {
  display: none;
}

:global(.vp-page:has(.almanac-shell) > .vp-page-title) {
  display: none;
}

@media (max-width: 640px) {
  .almanac-ad {
    min-height: 90px;
    margin-block: 0.75rem 1rem;
  }
}
</style>
