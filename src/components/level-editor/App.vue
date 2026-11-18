<template>
  <a-config-provider
    :theme="{
      token: { colorPrimary: $isDarkMode ? '#a2d7b3' : '#206b4f', borderRadius: 7, controlHeight: 36 },
      algorithm: $isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm
    }"
  >
    <section id="level-editor-workspace" class="level-editor-shell">
      <header class="editor-topbar">
        <div class="title-block">
          <div class="title-row">
            <WorkbenchIcon name="file" /><h1 class="editor-title">{{ draft.name || t('title') }}</h1>
          </div>
        </div>
        <div class="top-actions">
          <div class="top-action-row action-row-primary">
            <button
              v-if="validationItems.length"
              type="button"
              class="validation-summary-control"
              :class="validationState"
              @click="openValidation"
            >
              <span class="validation-status-dot" aria-hidden="true"></span>
              {{ t('errors', { count: validationSummary.errors }) }} / {{ t('warnings', { count: validationSummary.warnings }) }}
            </button>
            <div v-else class="validation-summary-control success" role="status">
              <span class="validation-status-dot" aria-hidden="true"></span>
              {{ t('validationPassed') }}
            </div>
            <label class="expert-mode-toggle">
              <input v-model="expertMode" type="checkbox" :aria-label="t('expertMode')" />
              <span class="expert-mode-switch" aria-hidden="true"></span>
              <span class="expert-mode-label">{{ t('expertMode') }}</span>
            </label>
            <details class="project-menu">
              <summary>{{ t('projectMenu') }}</summary>
              <div class="project-menu-content" @click="closeProjectMenu">
                <a-upload :before-upload="handleUpload" accept=".json,.json5" :show-upload-list="false">
                  <a-button>{{ t('importLevel') }}</a-button>
                </a-upload>
                <a-button @click="exportProject">{{ t('backupProject') }}</a-button>
                <a-button @click="confirmResetDraft">{{ t('newLevel') }}</a-button>
                <a-button :loading="endlessCatalogLoading" @click="openEndlessTemplate">{{ t('endlessCreate') }}</a-button>
                <a-button :loading="specialTemplatesLoading" @click="openSpecialTemplate('boss')">{{ t('specialCreate_boss') }}</a-button>
                <a-button :loading="specialTemplatesLoading" @click="openSpecialTemplate('airRaid')">{{ t('specialCreate_airRaid') }}</a-button>
              </div>
            </details>
          </div>
          <div class="top-action-row action-row-export">
            <a-button :aria-label="t('undo')" :disabled="!canUndo" :title="`${t('undo')} · ⌘/Ctrl Z`" @click="restoreHistory(-1)">
              <template #icon><undo-outlined /></template>{{ t('undo') }}
            </a-button>
            <a-button :aria-label="t('redo')" :disabled="!canRedo" :title="`${t('redo')} · ⌘/Ctrl ⇧ Z`" @click="restoreHistory(1)">
              <template #icon><redo-outlined /></template>{{ t('redo') }}
            </a-button>
            <a-button v-if="hasLibrary || hasInspector" class="focus-control" :aria-label="t('workbenchFocus')" :title="t('workbenchFocus')" :aria-pressed="focused" @click="activePane = 'editor'; focused = !focused"><template #icon><WorkbenchIcon :name="focused ? 'unfocus' : 'focus'" /></template>{{ t('workbenchFocus') }}</a-button>
            <a-button :aria-label="t('previewJson')" @click="openPreview">
              <template #icon><eye-outlined /></template>
              {{ t('previewJson') }}
            </a-button>
            <a-button type="primary" :aria-label="t('exportLevel')" @click="exportLevel">
              <template #icon><download-outlined /></template>
              {{ t('exportLevel') }}
            </a-button>
          </div>
        </div>
      </header>

      <nav class="workspace-nav" role="tablist" :aria-label="t('workspaceNavigation')">
        <button v-for="view in workspaceViews" :id="`level-tab-${view.id}`" :key="view.id"
          type="button" role="tab" :aria-selected="activeWorkspace === view.id"
          :aria-controls="`level-workspace-${view.id}`" :tabindex="activeWorkspace === view.id ? 0 : -1"
          :class="{ active: activeWorkspace === view.id }" @click="switchWorkspace(view.id)"
          @keydown="handleWorkspaceKeydown($event, view.id)"><WorkbenchIcon :name="view.icon" />{{ t(view.label) }}</button>
      </nav>

      <div v-if="workspaceSpecialKinds.length" class="special-mode-shortcuts">
        <button v-for="kind in workspaceSpecialKinds" :key="kind" type="button" class="text-button"
          :aria-pressed="specialModeEditorOpen && specialModeState.kind === kind" @click="openSpecialMode(kind)">{{ t(`specialKind_${kind}`) }}</button>
      </div>

      <div v-if="importCapability?.preservedObjects || (draft.preserveGeneratorWaves && !isEndlessMode)" class="import-capability-strip" role="status">
        <span v-if="draft.preserveGeneratorWaves && !isEndlessMode">{{ t('importGeneratorWaves') }}</span>
        <span v-if="importCapability?.preservedObjects">{{ t('importPreservedObjects', { count: importCapability.preservedObjects }) }}</span>
      </div>
      <div v-if="draftSaveError || draftRestoreError" class="project-save-error" role="alert">
        {{ t(draftRestoreError ? 'draftRestoreFailed' : 'draftSaveFailed') }}
        <button type="button" @click="exportProject">{{ t('backupProject') }}</button>
      </div>

      <section :id="`level-workspace-${activeWorkspace}`" class="workspace-content" role="tabpanel"
        :aria-labelledby="`level-tab-${activeWorkspace}`">
        <WorkbenchLayout :library="hasLibrary" :inspector="hasInspector"
          :focused="focused" v-model:expanded="expandedEvent" v-model:pane="activePane" :translate="t">
          <template #library><AssetLibrary /></template>
          <component :is="activeDefinition.main" />
          <template #inspector>
            <div v-if="inspectorTabs.length > 1" class="inspector-tabs" role="group" :aria-label="t('workbenchProperties')">
              <button v-for="tab in inspectorTabs" :key="tab.id" type="button" :aria-pressed="inspectorTab === tab.id" @click="inspectorTab = tab.id">{{ t(tab.label) }}</button>
            </div>
            <component v-if="inspectorTab === 'edit'" :is="activeDefinition.inspector" />
            <AssetInspector v-else :tab="inspectorTab" />
          </template>
        </WorkbenchLayout>
      </section>
      <footer class="workbench-status">
        <span>{{ t('summaryPlacements', { count: draft.boardItems.length }) }} · {{ isEndlessMode ? t('endlessAutomaticWaves') : t('summaryWaves', { count: draft.waves.length }) }}</span>
      </footer>

      <a-modal v-model:open="validationOpen" :title="t('validation')" :footer="null"
        width="min(720px, 96vw)" wrap-class-name="level-editor-modal-root">
        <ValidationPanel />
      </a-modal>

      <a-modal
        v-model:open="previewOpen"
        :title="`${draft.name || 'custom_level'}.json`"
        width="min(920px, 96vw)"
        wrap-class-name="level-editor-modal-root"
        :footer="null"
      >
        <div class="preview-actions">
          <a-button size="small" @click="copyPreview">
            <template #icon><copy-outlined /></template>
            {{ t('copyJson') }}
          </a-button>
        </div>
        <pre class="json-preview">{{ previewJson }}</pre>
      </a-modal>

      <a-modal v-model:open="endlessTemplateOpen" :title="t('endlessCreate')" :ok-text="t('endlessCreate')"
        :cancel-text="t('cancel')" wrap-class-name="level-editor-modal-root" @ok="createEndlessDraft">
        <label class="field-row endless-template-field">
          <span>{{ t('endlessTemplateWorld') }}</span>
          <select v-model="newEndlessWorld" :aria-label="t('endlessTemplateWorld')">
            <option v-for="world in endlessWorldOptions" :key="world" :value="world">{{ t(`endlessWorld_${world}`) }}</option>
          </select>
        </label>
        <p>{{ t('endlessTemplateNotice') }}</p>
      </a-modal>
      <a-modal v-model:open="specialTemplateOpen" :title="t(`specialCreate_${newSpecialKind}`)"
        :ok-text="t(`specialCreate_${newSpecialKind}`)" :cancel-text="t('cancel')" wrap-class-name="level-editor-modal-root" @ok="createSpecialDraft">
        <label class="field-row special-template-field"><span>{{ t('specialTemplate') }}</span>
          <select v-model="newSpecialTemplateId" :aria-label="t('specialTemplate')">
            <option v-for="template in specialTemplates.filter(item => item.kind === newSpecialKind)" :key="template.id" :value="template.id">{{ specialTemplateLabel(template) }}</option>
          </select>
        </label>
        <p>{{ t('specialTemplateNotice') }}</p>
      </a-modal>
      <a-drawer v-model:open="specialModeEditorOpen" :title="t(`specialKind_${specialModeState.kind}`)" placement="right"
        :mask="false" width="min(640px, 96vw)" root-class-name="level-editor-drawer-root">
        <SpecialModePanel v-if="specialModeEditorOpen" :bindings="specialBindings" :objects="draft.unsupportedRawObjects"
          :options="specialModeOptions" :state="specialModeState" :plant-options="plantOptions" :zombie-options="zombieOptions"
          :translate="t" @localize="localizeSpecial" @remove="removeSpecialMode" />
      </a-drawer>
      <a-drawer v-model:open="endlessSettingsOpen" :title="t('endlessSettings')" placement="right"
        :mask="false" width="min(560px, 96vw)" root-class-name="level-editor-drawer-root">
        <EndlessSettingsPanel v-if="endlessSettingsOpen && activeEndlessModule" :module="activeEndlessModule"
          :objects="draft.unsupportedRawObjects" :shared-objects="endlessSharedObjects"
          :progress-options="endlessProgressOptions" :plant-options="plantOptions" :zombie-options="zombieOptions"
          :object-options="objectOptions" :reserved-aliases="boardReservedAliases" :translate="t"
          :preview-floor="endlessPreviewFloor" @floor-change="endlessPreviewFloor = $event" />
      </a-drawer>

      <a-drawer
        :open="conveyorEditorOpen"
        :title="conveyorEditorTitle"
        placement="right"
        :mask="false"
        width="min(720px, 96vw)"
        root-class-name="level-editor-drawer-root"
        :body-style="{ padding: 0 }"
        @close="closeConveyorEditor"
      >
        <ConveyorEditorPanel />
      </a-drawer>
    </section>
  </a-config-provider>
</template>

<script setup lang="ts">
import { theme as antdTheme } from 'ant-design-vue';
import { computed, defineComponent, h, ref, watch } from 'vue';
import WorkbenchLayout from './ui/WorkbenchLayout.vue';
import WorkbenchIcon from './ui/WorkbenchIcon';
import { createWorkspaceRegistry } from './app/workspace-definitions';
import { createAssetViews } from './features/assets/asset-views';
import { CopyOutlined, DownloadOutlined, EyeOutlined, UndoOutlined, RedoOutlined } from '@ant-design/icons-vue';
import { useLevelEditor } from './app/use-level-editor';
import { createBasicView } from './features/level/basic-view';
import { createLibraryView } from './features/assets/library-view';
import { createBoardView } from './features/board/board-view';
import { createSeedView } from './features/seed/seed-view';
import { createFieldRenderers } from './ui/field-renderers';
import { createWaveView } from './features/waves/wave-view';
import { createValidationView } from './features/validation/validation-view';
const editor = useLevelEditor();
const fields = createFieldRenderers(editor);
const basic = createBasicView(editor);
const library = createLibraryView(editor);
const board = createBoardView(editor);
const seed = createSeedView({ ...editor, ...fields });
const expandedEvent = ref(false);
const waves = createWaveView({ ...editor, ...fields }, expandedEvent);
watch([editor.activeWorkspace, editor.selectedWaveId, editor.expandedWaveActionKey, editor.inspectorTab, editor.generatorEditorOpen, editor.isEndlessMode, editor.focused], () => { expandedEvent.value = false; });
const validation = createValidationView(editor);
const { BasicForm } = basic;
const { AssetLibrary } = library;
const { BoardEditor, BoardInspector } = board;
const { PropertyPanel, ConveyorEditorPanel } = seed;
const { WaveTimeline, WaveInspector } = waves;
const { ValidationPanel } = validation;
const {
  activePane, focused, inspectorTab, previewOpen, workspaceViews, activeWorkspace,
  validationOpen, draftSaveError, draftRestoreError, expertMode,
  selectedAsset, sharedNarrativeCatalog, endlessTemplateOpen, endlessSettingsOpen,
  endlessCatalogLoading, newEndlessWorld, endlessWorldOptions, endlessSharedObjects,
  endlessProgressOptions, endlessPreviewFloor, specialModeEditorOpen, specialModeState,
  specialTemplateOpen, specialTemplatesLoading, specialTemplates, newSpecialKind,
  newSpecialTemplateId, importCapability, objectOptions, draft, canUndo, canRedo,
  restoreHistory, language, plantOptions, zombieOptions, conveyorEditorOpen,
  narrativeReservedAliases, boardReservedAliases, specialBindings, specialKinds, isEndlessMode,
  activeEndlessModule, validationItems, validationSummary, validationState, previewJson, t,
  openEndlessTemplate, createEndlessDraft, openSpecialMode, localizeSpecial, removeSpecialMode,
  openSpecialTemplate, specialTemplateLabel, createSpecialDraft, confirmResetDraft,
  openValidation, switchWorkspace, handleWorkspaceKeydown, editObjectiveOnBoard, exportProject,
  closeProjectMenu, closeConveyorEditor, conveyorEditorTitle, handleUpload, exportLevel,
  openPreview, copyPreview
} = editor;

import EndlessSettingsPanel from './endless-settings-panel';
import SpecialModePanel from './special-mode-panel';
import ObjectivesPanel from './objectives-panel';
import { defineAsyncComponent } from 'vue';
const NarrativePanel = defineAsyncComponent(() => import('./narrative-panel'));
const { AssetInspector, LevelAssets } = createAssetViews(editor);
const registry = createWorkspaceRegistry({
  basic: { main: defineComponent({ setup: () => () => h('div', { class: 'basic-workspace' }, [h(BasicForm), h(ObjectivesPanel, { system: draft.value.objectives, plantOptions: plantOptions.value, resolveMoldLocations: resolveBoardGridMapSquares, expertMode: expertMode.value, translate: t, reservedAliases: boardReservedAliases.value, onEditBoard: editObjectiveOnBoard })]) }) },
  narrative: { main: defineComponent({ setup: () => () => h('div', { class: 'basic-workspace' }, [h(NarrativePanel, { objects: draft.value.unsupportedRawObjects, definition: draft.value.levelExtra, language: language.value, reservedAliases: narrativeReservedAliases.value, translate: t, onCatalogReady: (catalog) => { sharedNarrativeCatalog.value = catalog; } })]) }) },
  board: { main: BoardEditor, inspector: defineComponent({ setup: () => () => editor.selectedCell.value || !['select', 'place'].includes(editor.boardTool.value) ? h(BoardInspector) : h(AssetInspector) }) },
  waves: { main: WaveTimeline, inspector: defineComponent({ setup: () => () => editor.generatorEditorOpen.value || editor.isEndlessMode.value ? h(AssetInspector, { tab: 'edit' }) : h(WaveInspector) }) },
  seed: { main: PropertyPanel, inspector: AssetInspector },
  assets: { main: LevelAssets, inspector: AssetInspector }
});
const activeDefinition = computed(() => registry.get(activeWorkspace.value));
const hasWaveTarget = computed(() => activeWorkspace.value !== 'waves' || (
  editor.generatorEditorOpen.value || isEndlessMode.value ? !!editor.selectedGenerator.value : !!editor.selectedWave.value
));
const hasLibrary = computed(() => activeDefinition.value.assets && hasWaveTarget.value);
const hasInspector = computed(() => !!activeDefinition.value.inspector && hasWaveTarget.value);
const workspaceSpecialKinds = computed(() => specialKinds.value.filter(kind => activeWorkspace.value === 'basic'
  || (kind === 'boss' ? activeWorkspace.value === 'board' : activeWorkspace.value === 'waves')));
const inspectorTabs = computed(() => [
  { id: 'edit' as const, label: 'workbenchProperties' },
  ...(selectedAsset.value && selectedAsset.value.kind !== 'object' ? [{ id: 'almanac' as const, label: 'viewAlmanac' }] : []),
  ...(expertMode.value && selectedAsset.value ? [{ id: 'data' as const, label: 'workbenchData' }] : [])
]);
watch(inspectorTabs, tabs => {
  if (!tabs.some(tab => tab.id === inspectorTab.value)) inspectorTab.value = 'edit';
});
watch(activePane, pane => { if (pane !== 'editor') focused.value = false; });
watch(hasWaveTarget, available => { if (!available) activePane.value = 'editor'; });
import { resolveBoardGridMapSquares } from '../game-data/board-grid-maps';
import { specialModeOptions } from '../game-data/special-modes';
</script>

<style src="./ui/legacy-controls.css"></style>
<style src="./ui/feature-controls.css"></style>
<style src="./workspace.css"></style>
