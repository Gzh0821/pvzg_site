<template>
  <button ref="trigger" type="button" class="add-button" aria-haspopup="dialog" :aria-expanded="open" @click="emit('update:open', true)">
    <PlusOutlined />{{ translate('addSpecialAction') }}
  </button>
  <dialog ref="dialog" class="wave-event-picker" :aria-label="title" @cancel.prevent="dismiss" @click="backdrop">
    <header><strong>{{ title }}</strong><button type="button" class="text-button" :aria-label="translate('dismissPicker')" @click="dismiss"><CloseOutlined /></button></header>
    <input ref="search" v-model="query" type="search" class="asset-search" :aria-label="translate('searchWaveEvents')" :placeholder="translate('searchWaveEvents')" @keydown.down.prevent="list?.querySelector('button')?.focus()" @keydown.enter="chooseOnlyResult" />
    <div ref="list" class="event-catalog">
      <button v-for="item in results" :key="item.kind" type="button" @click="choose(item.kind)">{{ translate(item.labelKey) }}</button>
      <div v-if="!results.length" class="asset-empty" role="status">{{ translate('noEventResults') }}</div>
    </div>
  </dialog>
</template>
<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { ADDABLE_WAVE_ACTIONS } from '../../wave-action-codec.mjs';
import type { AddableWaveActionKind } from '../../core/types';

const props = defineProps<{ open: boolean; wave: number; translate: (key: string, args?: Record<string, number>) => string }>();
const emit = defineEmits<{ 'update:open': [open: boolean]; choose: [kind: AddableWaveActionKind] }>();
const trigger = ref<HTMLButtonElement>();
const dialog = ref<HTMLDialogElement>();
const search = ref<HTMLInputElement>();
const list = ref<HTMLElement>();
const query = ref('');
const title = computed(() => props.translate('selectedWaveNumber', { wave: props.wave }) + ' · ' + props.translate('addSpecialAction'));
const results = computed(() => {
  const searchTerm = query.value.trim().toLowerCase();
  return ADDABLE_WAVE_ACTIONS.filter(({ labelKey, objclass }) =>
    [props.translate(labelKey), objclass].some(value => value.toLowerCase().includes(searchTerm)));
});
function dismiss() { emit('update:open', false); }
function chooseOnlyResult(event: KeyboardEvent) {
  if (event.isComposing || results.value.length !== 1) return;
  event.preventDefault();
  choose(results.value[0].kind);
}
async function choose(kind: AddableWaveActionKind) {
  const layout = trigger.value?.closest('.workbench-layout');
  dismiss();
  emit('choose', kind);
  await nextTick();
  const selected = layout?.querySelector<HTMLElement>('.wave-event-select[aria-pressed="true"]');
  (selected?.getClientRects().length ? selected : layout?.querySelector<HTMLElement>('.workbench-inspector'))?.focus();
}
function backdrop(event: MouseEvent) {
  if (event.target !== dialog.value) return;
  const box = dialog.value.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dismiss();
}
function position() {
  if (!trigger.value || !dialog.value) return;
  const box = trigger.value.getBoundingClientRect();
  const below = window.innerHeight - box.bottom - 14;
  const above = box.top - 14;
  const down = below >= 340 || below >= above;
  const style = dialog.value.style;
  style.setProperty('--picker-left', Math.max(8, Math.min(box.right - dialog.value.offsetWidth, window.innerWidth - dialog.value.offsetWidth - 8)) + 'px');
  style.setProperty('--picker-top', down ? box.bottom + 6 + 'px' : 'auto');
  style.setProperty('--picker-bottom', down ? 'auto' : window.innerHeight - box.top + 6 + 'px');
  style.setProperty('--picker-room', Math.max(120, down ? below : above) + 'px');
}
watch(() => props.open, (open, _, cleanup) => {
  if (!open) { dialog.value?.close(); return; }
  query.value = '';
  dialog.value?.showModal();
  position();
  search.value?.focus();
  window.addEventListener('resize', position);
  window.addEventListener('scroll', position, true);
  cleanup(() => {
    window.removeEventListener('resize', position);
    window.removeEventListener('scroll', position, true);
  });
}, { flush: 'post' });
</script>
