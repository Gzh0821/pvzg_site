import { computed, defineComponent, h, shallowRef } from 'vue';
import { BookOutlined } from '@ant-design/icons-vue';
import AssetQuickPreview from './AssetQuickPreview.vue';
import type { AssetOption } from '../../core/types';
import type { LevelEditorRuntime } from '../../app/use-level-editor';

type Bindings = Pick<LevelEditorRuntime,
  | 'language' | 'draft' | 'addZombieToTarget' | 't'
  | 'activeWorkspace' | 'assetTab' | 'objectCategory' | 'recentZombieCodes' | 'zombieOptions' | 'assetSearch'
  | 'currentAssetOptions' | 'visibleAssetOptions' | 'selectedAsset' | 'chooseAsset' | 'getObjectCategoryLabel'
  | 'showMoreAssets' | 'ASSET_PAGE_SIZE' | 'libraryTarget' | 'waveAssetTarget'
  | 'libraryAddDisabled'>;

export function createLibraryView(bindings: Bindings) {
  const {
    language, draft, addZombieToTarget, t,
    activeWorkspace, assetTab, objectCategory, recentZombieCodes, zombieOptions, assetSearch,
    currentAssetOptions, visibleAssetOptions, selectedAsset, chooseAsset, getObjectCategoryLabel,
    showMoreAssets, ASSET_PAGE_SIZE, libraryTarget, waveAssetTarget, libraryAddDisabled
  } = bindings;

  const AssetLibrary = defineComponent({
    setup() {
      const preview = shallowRef<{ asset: AssetOption; trigger: HTMLButtonElement } | null>(null);
      const heading = computed(() => {
        if (activeWorkspace.value === 'waves' && waveAssetTarget.value.kind !== 'select') return 'addZombie';
        return activeWorkspace.value === 'seed' ? 'addPlants' : 'chooseAsset';
      });
      return () =>
        h('section', { class: 'asset-library' }, [
          h('div', { class: 'panel-title' }, [
            h('span', t(heading.value)),
            h('span', { class: 'library-count' }, String(currentAssetOptions.value.length))
          ]),
          libraryTarget.value ? h('div', { class: 'library-target', role: 'status' }, libraryTarget.value) : null,
          ['board', 'assets'].includes(activeWorkspace.value) ? h('div', { class: 'segmented', role: 'group', 'aria-label': t('assetType') }, [
            h('button', { type: 'button', class: assetTab.value === 'plant' ? 'active' : '', 'aria-pressed': assetTab.value === 'plant', onClick: () => (assetTab.value = 'plant') }, t('plants')),
            h('button', { type: 'button', class: assetTab.value === 'zombie' ? 'active' : '', 'aria-pressed': assetTab.value === 'zombie', onClick: () => (assetTab.value = 'zombie') }, t('zombies')),
            h('button', { type: 'button', class: assetTab.value === 'object' ? 'active' : '', 'aria-pressed': assetTab.value === 'object', onClick: () => (assetTab.value = 'object') }, t('objects'))
          ]) : null,
          assetTab.value === 'object'
            ? h('div', { class: 'object-category-tabs', role: 'group', 'aria-label': t('objectCategory') }, [
              h('button', { type: 'button', class: objectCategory.value === 'all' ? 'active' : '', 'aria-pressed': objectCategory.value === 'all', onClick: () => (objectCategory.value = 'all') }, t('objectCategoryAll')),
              h('button', { type: 'button', class: objectCategory.value === 'tile' ? 'active' : '', 'aria-pressed': objectCategory.value === 'tile', onClick: () => (objectCategory.value = 'tile') }, t('objectCategoryTile')),
              h(
                'button',
                { type: 'button', class: objectCategory.value === 'obstacle' ? 'active' : '', 'aria-pressed': objectCategory.value === 'obstacle', onClick: () => (objectCategory.value = 'obstacle') },
                t('objectCategoryObstacle')
              ),
              h(
                'button',
                { type: 'button', class: objectCategory.value === 'tombstone' ? 'active' : '', 'aria-pressed': objectCategory.value === 'tombstone', onClick: () => (objectCategory.value = 'tombstone') },
                t('objectCategoryTombstone')
              )
            ])
            : null,
          activeWorkspace.value === 'waves' && recentZombieCodes.value.length
            ? h('div', { class: 'recent-zombies', role: 'group', 'aria-label': t('recentZombies') },
              recentZombieCodes.value.map((code, index) => {
                const zombie = zombieOptions.value.find((item) => item.code === code);
                return zombie ? h('button', {
                  type: 'button', title: `${zombie.name} · ${'1234567890QW'[index]}`,
                  'aria-label': t('quickAddZombie', { name: zombie.name, key: '1234567890QW'[index] }),
                  onClick: () => addZombieToTarget(zombie)
                }, [h('img', { src: zombie.image, alt: '' }), h('kbd', '1234567890QW'[index])]) : null;
              })) : null,
          h('input', {
            class: 'asset-search',
            placeholder: t('search'),
            'aria-label': t('search'),
            value: assetSearch.value,
            onInput: (event: Event) => {
              assetSearch.value = (event.target as HTMLInputElement).value;
            }
          }),
          h('div', { class: 'asset-list' }, currentAssetOptions.value.length ? visibleAssetOptions.value.map((asset) => {
            return h('div', { key: asset.kind + ':' + asset.code, class: ['asset-entry', selectedAsset.value?.kind === asset.kind && selectedAsset.value?.code === asset.code ? 'active' : ''] }, [
              h('button', { type: 'button', class: 'asset-row', title: asset.code, disabled: libraryAddDisabled.value, 'aria-pressed': selectedAsset.value?.kind === asset.kind && selectedAsset.value?.code === asset.code, onClick: () => chooseAsset(asset) }, [
                asset.image ? h('img', { src: asset.image, alt: '', loading: 'lazy' }) : h('span', { class: ['object-dot', asset.category || 'object'], 'aria-hidden': 'true' }),
                h('span', { class: 'asset-copy' }, [h('strong', asset.name), asset.local ? h('span', { class: 'asset-badge' }, t('workbenchLocal')) : null, asset.kind === 'object' ? h('span', { class: 'asset-meta-row' }, getObjectCategoryLabel(asset.category)) : null])
              ]),
              asset.kind !== 'object' ? h('button', {
                type: 'button', class: 'asset-book-button', 'aria-haspopup': 'dialog', title: t('viewAlmanac'),
                'aria-label': `${t('viewAlmanac')} · ${asset.name}`,
                onClick: (event: MouseEvent) => { preview.value = { asset, trigger: event.currentTarget as HTMLButtonElement }; }
              }, h(BookOutlined)) : null
            ]);
          }) : h('div', { class: 'asset-empty' }, t('noAssetResults'))),
          visibleAssetOptions.value.length < currentAssetOptions.value.length
            ? h(
              'button',
              { type: 'button', class: 'asset-load-more add-button', onClick: showMoreAssets },
              t('showMoreAssets', { count: Math.min(ASSET_PAGE_SIZE, currentAssetOptions.value.length - visibleAssetOptions.value.length) })
            )
            : null,
          preview.value ? h(AssetQuickPreview, {
            ...preview.value, objects: draft.value.unsupportedRawObjects, language: language.value, translate: t,
            onDismiss: () => { preview.value = null; }
          }) : null
        ]);
    }
  });

  return { AssetLibrary };
}
