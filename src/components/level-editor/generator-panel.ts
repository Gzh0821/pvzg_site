import { defineComponent, h, type PropType } from 'vue';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { getGeneratorObjects } from './authored-content-codec.mjs';

export default defineComponent({
  name: 'GeneratorPanel',
  props: {
    objects: { type: Array as PropType<any[]>, required: true },
    selectedAlias: { type: String, required: true },
    poolTarget: { type: String, required: true },
    zombieOptions: { type: Array as PropType<any[]>, required: true },
    translate: { type: Function as PropType<(key: string, params?: Record<string, unknown>) => string>, required: true }
  },
  emits: ['select', 'pool-target', 'create'],
  setup(props, { emit }) {
    const t = (key: string) => props.translate(key);
    return () => {
      const generators = getGeneratorObjects(props.objects);
      const selected = generators.find((object: any) => object.aliases?.includes(props.selectedAlias));
      const data = selected?.objdata;
      const endless = selected?.objclass === 'DangerRoomJitteredWaveGenerator';
      const fields = endless ? ['StartingPoints', 'BasePointIncrementPerWave', 'BasePointIncrementPerLevel', 'MinDynamicZombieType', 'MaxDynamicZombieType', 'MaxPointPerWave']
        : ['StartingPoints', 'PointIncrementPerWave', 'PlantfoodToSpawnCount'];
      const pools = endless ? ['ZombiePool', 'MustContainZombie'] : ['ZombiePool'];
      const poolKey = pools.includes(props.poolTarget) ? props.poolTarget : 'ZombiePool';
      const pool = data && Array.isArray(data[poolKey]) ? data[poolKey] : [];
      return h('section', { class: 'generator-editor' }, [
        h('div', { class: 'generator-toolbar' }, [h('h3', t(selected ? endless ? 'generatorEndless' : 'generatorPoints' : 'waveGenerators')),
          generators.length > 1 ? h('select', { value: props.selectedAlias, 'aria-label': t('generatorSelect'),
            onChange: (event: Event) => emit('select', (event.target as HTMLSelectElement).value)
          }, generators.map((object: any, index: number) => h('option', { value: object.aliases?.[0] }, `${t(object.objclass === 'LevelOfTheDayModuleProperties' ? 'generatorPoints' : 'generatorEndless')} #${index + 1}`))) : null,
          h('button', { type: 'button', class: 'add-button', onClick: () => emit('create') }, [h(PlusOutlined), t('generatorCreate')])
        ]),
        data ? h('div', { class: 'generator-fields' }, fields.map((key) => h('label', { class: 'field-row' }, [
          h('span', t(`generatorField_${key}`)), h('input', { type: 'number', value: data[key] ?? '',
            'aria-label': t(`generatorField_${key}`),
            onInput: (event: Event) => {
              const value = (event.target as HTMLInputElement).value;
              if (value === '') delete data[key]; else data[key] = Number(value);
            }
          })
        ]))) : h('p', { class: 'editor-empty-action' }, t('generatorChoose')),
        data && pools.length > 1 ? h('div', { class: 'generator-pool-targets' }, pools.map((key) => h('button', { type: 'button',
          'aria-pressed': poolKey === key, onClick: () => emit('pool-target', key)
        }, t(`generatorField_${key}`)))) : data ? h('h4', t('generatorField_ZombiePool')) : null,
        data ? h('div', { class: 'generator-pool' }, pool.map((reference: string, index: number) => {
          const code = /^RTID\((.+)@ZombieTypes\)$/.exec(reference)?.[1] || reference;
          const zombie = props.zombieOptions.find((item) => item.code === code);
          return h('div', { class: 'generator-pool-row' }, [
            zombie?.image ? h('img', { src: zombie.image, alt: '' }) : null,
            h('strong', zombie?.name || code),
            h('button', { type: 'button', class: 'text-button', 'aria-label': t('remove'), onClick: () => pool.splice(index, 1) }, h(DeleteOutlined))
          ]);
        })) : null,
        data && !pool.length ? h('p', { class: 'editor-empty-action' }, t('generatorAddZombies')) : null,
        endless ? h('label', { class: 'check-row' }, [h('input', { type: 'checkbox', checked: data.SuppressPlantfood === true,
          onChange: (event: Event) => { data.SuppressPlantfood = (event.target as HTMLInputElement).checked; }
        }), t('generatorSuppressPlantfood')]) : null
      ]);
    };
  }
});
