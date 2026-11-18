import { computed, defineComponent, h, ref, watch } from 'vue';
import { BookOutlined, PlusOutlined } from '@ant-design/icons-vue';
import type { LevelEditorRuntime } from '../../app/use-level-editor';
import { almanacText, assetPropertyFields, resolveAssetData } from './catalog';
import { getCardDecks } from '../../card-deck-codec.mjs';
import { collectAssetReferences } from './asset-usage.mjs';
import { getLocalAssetDefinitions } from './local-assets-codec.mjs';
import type { AssetOption } from '../../core/types';

export function createAssetViews(editor: LevelEditorRuntime) {
  const {
    t, draft, selectedAsset, plantOptions, zombieOptions, objectOptions, language, expertMode,
    selectedAssetAlmanacPath, createAssetVariant, activePane, inspectorTab,
    runEdit
  } = editor;
  const selectedData = computed(() => resolveAssetData(selectedAsset.value, draft.value.unsupportedRawObjects));
  const rawText = ref('');
  const rawError = ref(false);
  watch(selectedData, (data) => { rawText.value = JSON.stringify(data?.properties?.objdata || {}, null, 2); rawError.value = false; }, { immediate: true });
  const displayText = (value: any) => almanacText(value, language.value);
  const AssetInspector = defineComponent({
    props: { tab: { type: String, default: 'edit' } },
    setup: (props) => () => {
      const asset = selectedAsset.value;
      const data = selectedData.value;
      if (!asset) return h('div', { class: 'workbench-empty' }, t('chooseAsset'));
      const editable = !!data?.local?.properties;
      return h('section', { class: 'asset-inspector-content' }, [
        h('div', { class: 'inspector-asset-heading' }, [asset.image ? h('img', { src: asset.image, alt: '' }) : null, h('div', [h('h3', asset.name), (asset.local ? asset.base : asset.code) !== asset.name ? h('code', asset.local ? asset.base : asset.code) : null])]),
        props.tab === 'data' && expertMode.value ? h('div', { class: 'asset-data-view' }, [
          editable ? h('textarea', { class: 'native-json-editor', rows: 18, value: rawText.value, 'aria-label': t('workbenchData'), onInput: (event: Event) => { rawText.value = (event.target as HTMLTextAreaElement).value; rawError.value = false; } }) : h('pre', JSON.stringify(data?.properties || asset, null, 2)),
          editable ? h('button', {
            type: 'button', class: 'add-button', onClick: () => {
              try {
                const value = JSON.parse(rawText.value);
                if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error();
                runEdit('assets.editProperties', () => { data!.local!.properties.objdata = value; });
                rawError.value = false;
              } catch { rawError.value = true; }
            }
          }, t('workbenchApply')) : null,
          rawError.value ? h('p', { role: 'alert', class: 'danger' }, t('workbenchInvalidData')) : null
        ]) : props.tab === 'almanac' ? h('div', { class: 'asset-almanac-content' }, [
          h('p', displayText(data?.almanac?.objdata?.Introduction) || t('workbenchNoAlmanac')),
          ...(data?.almanac?.objdata?.Special || []).map(displayText).filter(Boolean).map((text: string) => h('p', text)),
          selectedAssetAlmanacPath.value ? h('a', { href: selectedAssetAlmanacPath.value, target: '_blank', rel: 'noopener noreferrer', class: 'asset-almanac-link' }, [h(BookOutlined), t('viewAlmanac')]) : null
        ]) : [
          h('div', { class: 'asset-property-fields' }, assetPropertyFields.filter(([key]) => typeof data?.properties?.objdata?.[key] === 'number').map(([key, label]) => h('label', { class: 'field-row' }, [
            h('span', t(label)), editable ? h('input', {
              type: 'number', value: data!.properties!.objdata[key], 'aria-label': key, onChange: (event: Event) => {
                const value = Number((event.target as HTMLInputElement).value);
                if (Number.isFinite(value)) runEdit('assets.editProperty', () => { data!.properties!.objdata[key] = value; });
              }
            }) : h('output', String(data!.properties!.objdata[key]))
          ]))),
          !data?.local && data?.type && data?.properties ? h('button', { type: 'button', class: 'add-button', onClick: createAssetVariant }, [h(PlusOutlined), t('workbenchCreateVariant')]) : null,
          data?.local && !editable ? h('p', { class: 'editor-empty-action' }, t('workbenchSharedProperties')) : null
        ]
      ]);
    }
  });
  const usedAssets = computed(() => {
    const level = draft.value;
    const used = new Set<string>();
    const include = (kind: string, code: string) => used.add(`${kind}:${code}`);
    collectAssetReferences(editor.serializeLevel().objects, getLocalAssetDefinitions(level.unsupportedRawObjects))
      .forEach(ref => include(ref.kind, ref.code));
    level.boardItems.forEach(item => include(item.kind, item.code));
    level.waves.forEach(wave => wave.zombies.forEach(item => include('zombie', item.code)));
    for (const list of [level.seedPlants, level.includePlants, level.excludePlants]) list.forEach(code => include('plant', code));
    for (const kind of ['Recommended', 'Challenging']) {
      getCardDecks(level.seedBankExtra, kind).forEach(deck => {
        if (Array.isArray(deck?.Plants)) deck.Plants.forEach(code => include('plant', code));
      });
    }
    for (const entry of [...level.conveyor.initialPlants, ...level.conveyor.waveModifications]) include('plant', entry.PlantType);
    return [...plantOptions.value, ...zombieOptions.value, ...objectOptions].filter(item =>
      item.local || used.has(`${item.kind}:${item.code}`));
  });
  function inspect(asset: AssetOption) { selectedAsset.value = asset; inspectorTab.value = 'edit'; activePane.value = 'properties'; }
  const LevelAssets = defineComponent({
    setup: () => () => h('section', { class: 'level-assets-panel' }, [
      h('div', { class: 'panel-title' }, [h('strong', t('workbenchLocalAssets')), h('span', String(usedAssets.value.length))]),
      usedAssets.value.length ? h('div', { class: 'level-asset-list' }, usedAssets.value.map((asset) => h('button', {
        type: 'button', class: 'level-asset-row', 'aria-pressed': selectedAsset.value?.code === asset.code && selectedAsset.value?.kind === asset.kind, onClick: () => inspect(asset)
      }, [asset.image ? h('img', { src: asset.image, alt: '' }) : null, h('span', [h('strong', asset.name), (asset.local ? asset.base : asset.code) !== asset.name ? h('code', asset.local ? asset.base : asset.code) : null]), asset.local ? h('span', { class: 'asset-badge' }, t('workbenchLocal')) : null]))) : h('div', { class: 'workbench-empty' }, t('workbenchNoUsedAssets'))
    ])
  });
  return { AssetInspector, LevelAssets };
}
