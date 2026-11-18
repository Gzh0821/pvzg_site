<template>
  <dialog ref="dialog" class="asset-quick-preview" :aria-label="asset.name" @keydown.stop @cancel.prevent="dismiss" @click="backdrop">
    <header>
      <img v-if="asset.image" :src="asset.image" alt="">
      <div><h3>{{ asset.name }}</h3><code>{{ asset.local ? asset.base : asset.code }}</code></div>
      <button type="button" autofocus class="text-button" :aria-label="translate('dismissAlmanac')" @click="dismiss"><CloseOutlined /></button>
    </header>
    <p v-if="intro">{{ intro }}</p>
    <dl v-if="fields.length">
      <div v-for="[key, label] in fields" :key="key"><dt>{{ translate(label) }}</dt><dd>{{ properties[key] }}</dd></div>
    </dl>
    <a v-if="path" :href="path" target="_blank" rel="noopener noreferrer" class="asset-almanac-link"><BookOutlined />{{ translate(asset.local ? 'baseAlmanac' : 'fullAlmanac') }}</a>
  </dialog>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { BookOutlined, CloseOutlined } from '@ant-design/icons-vue';
import { getAlmanacEntityPath } from '../../../almanac-v2/almanac-routes';
import type { AssetOption, LocaleKey } from '../../core/types';
import { almanacText, assetPropertyFields, resolveAssetData } from './catalog';

const props = defineProps<{ asset: AssetOption; trigger: HTMLButtonElement; objects: any[]; language: LocaleKey; translate: (key: string) => string }>();
const emit = defineEmits<{ dismiss: [] }>();
const dialog = ref<HTMLDialogElement>();
const data = computed(() => resolveAssetData(props.asset, props.objects));
const intro = computed(() => almanacText(data.value?.almanac?.objdata?.Introduction, props.language));
const properties = computed(() => data.value?.properties?.objdata || {});
const fields = computed(() => assetPropertyFields.filter(([key]) => typeof properties.value[key] === 'number'));
const path = computed(() => props.asset.kind === 'object' ? null : getAlmanacEntityPath(props.asset.kind, props.asset.base || props.asset.code, props.language));

function dismiss() {
  dialog.value?.close();
  props.trigger.focus({ preventScroll: true });
  emit('dismiss');
}
function backdrop(event: MouseEvent) {
  const panel = dialog.value;
  if (!panel || event.target !== panel) return;
  const box = panel.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dismiss();
}
function position() {
  const panel = dialog.value;
  if (!panel) return;
  const row = props.trigger.getBoundingClientRect();
  panel.style.setProperty('--preview-left', Math.max(8, Math.min(row.right + 8, innerWidth - panel.offsetWidth - 8)) + 'px');
  panel.style.setProperty('--preview-top', Math.max(8, Math.min(row.top, innerHeight - panel.offsetHeight - 8)) + 'px');
}
onMounted(() => {
  dialog.value?.showModal();
  position();
  window.addEventListener('resize', position);
});
onBeforeUnmount(() => window.removeEventListener('resize', position));
</script>
