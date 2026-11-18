<template>
  <div ref="layout" class="workbench-layout" :class="{ 'event-expanded': expanded, 'has-library': library, 'has-inspector': inspector, focused }" :data-pane="pane" @keydown.esc="escapeExpanded">
    <dialog ref="mobileDialog" class="expanded-event-sheet" :aria-label="translate('expandEvent')" @cancel.prevent="collapse" />
    <Teleport :to="mobileDialog || 'body'" :disabled="!mobileExpanded">
      <div v-if="library || inspector" class="workbench-pane-switch" role="group" :aria-label="translate('workspaceNavigation')">
        <button v-for="item in panes" :key="item.id" type="button" :aria-pressed="pane === item.id" @click="$emit('update:pane', item.id)">
          <WorkbenchIcon :name="item.icon" />{{ translate(item.label) }}
        </button>
        <button v-if="mobileExpanded" type="button" @click="collapse"><WorkbenchIcon name="unfocus" />{{ translate('collapseEvent') }}</button>
      </div>
      <div class="workbench-columns">
        <aside v-if="library" class="workbench-library" :aria-label="translate('workbenchLibrary')">
          <button class="workbench-skip" type="button" @click="skipLibrary">{{ translate(expanded ? 'workbenchProperties' : 'skipToEditor') }}</button>
          <slot name="library" />
        </aside>
        <section ref="editorPane" class="workbench-editor" tabindex="-1" :aria-label="translate('workbenchEdit')"><slot /></section>
        <aside v-if="inspector" tabindex="-1" class="workbench-inspector" :aria-label="translate('workbenchProperties')"><slot name="inspector" /></aside>
      </div>
    </Teleport>
  </div>
</template>
<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import WorkbenchIcon from './WorkbenchIcon';
const props = defineProps<{ library: boolean; inspector: boolean; focused: boolean; expanded: boolean; pane: string; translate: (key: string) => string }>();
const emit = defineEmits<{ 'update:pane': [pane: 'library' | 'editor' | 'properties']; 'update:expanded': [expanded: boolean] }>();
const layout = ref<HTMLElement>();
const editorPane = ref<HTMLElement>();
const mobileDialog = ref<HTMLDialogElement>();
const narrow = ref(false);
const mobileExpanded = computed(() => props.expanded && narrow.value && !!mobileDialog.value);
let viewport: MediaQueryList;
function updateWidth() { narrow.value = viewport.matches; }
onMounted(() => {
  viewport = window.matchMedia('(max-width: 1000px)');
  updateWidth();
  viewport.addEventListener('change', updateWidth);
});
onBeforeUnmount(() => viewport?.removeEventListener('change', updateWidth));
watch(mobileExpanded, open => {
  if (open) mobileDialog.value?.showModal();
  else mobileDialog.value?.close();
}, { flush: 'post' });
async function collapse() {
  emit('update:pane', 'properties');
  emit('update:expanded', false);
  await nextTick();
  layout.value?.querySelector<HTMLElement>('.wave-expand-control')?.focus();
}
function escapeExpanded(event: KeyboardEvent) {
  if (!props.expanded || event.defaultPrevented) return;
  event.preventDefault();
  event.stopPropagation();
  collapse();
}
async function skipLibrary() {
  emit('update:pane', props.expanded ? 'properties' : 'editor');
  await nextTick();
  (props.expanded ? layout.value?.querySelector<HTMLElement>('.workbench-inspector') : editorPane.value)?.focus();
}
watch(() => props.pane, async pane => {
  const origin = document.activeElement;
  if (!origin || !layout.value?.contains(origin)) return;
  await nextTick();
  if (origin.isConnected && origin.getClientRects().length && pane !== 'library') return;
  const destination = pane === 'library' ? '.asset-search' : pane === 'properties' ? '.workbench-inspector' : '.workbench-editor';
  layout.value?.querySelector<HTMLElement>(destination)?.focus();
});
const panes = computed(() => [
  ...(props.library ? [{ id: 'library' as const, icon: 'assets', label: 'workbenchLibrary' }] : []),
  ...(!props.expanded ? [{ id: 'editor' as const, icon: 'editor', label: 'workbenchEdit' }] : []),
  ...(props.inspector ? [{ id: 'properties' as const, icon: 'properties', label: 'workbenchProperties' }] : [])
]);
</script>
