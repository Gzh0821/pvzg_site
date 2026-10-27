import { defineComponent, h, ref, type PropType } from 'vue';
import { Button, Select } from 'ant-design-vue';
import { ArrowUpOutlined, ArrowDownOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { ENDLESS_DESIGNER_CLASSES, resolveEndlessDesigner } from './endless-codec.mjs';

export default defineComponent({
  name: 'EndlessSettingsPanel',
  props: {
    module: { type: Object as PropType<any>, required: true },
    objects: { type: Array as PropType<any[]>, required: true },
    sharedObjects: { type: Array as PropType<any[]>, required: true },
    progressOptions: { type: Array as PropType<any[]>, required: true },
    plantOptions: { type: Array as PropType<any[]>, required: true },
    translate: { type: Function as PropType<(key: string, params?: Record<string, unknown>) => string>, required: true }
  },
  setup(props) {
    const chosen = ref<Record<string, string>>({ InitialPlants: '', ExcludePlants: '', designer: '' });
    const t = (key: string) => props.translate(key);
    const control = (label: string, content: any) => h('label', { class: 'field-row' }, [h('span', label), content]);
    const iconButton = (label: string, icon: any, run: () => void, disabled = false) => h(Button, {
      type: 'text', class: 'endless-icon-button', 'aria-label': label, title: label, disabled, onClick: run
    }, () => h(icon));
    const searchableSelect = (value: string, options: any[], label: string, select: (value: string) => void) => h(Select, {
      value: value || undefined, showSearch: true, options, placeholder: label, 'aria-label': label,
      popupClassName: 'level-editor-select-popup',
      onKeydown: (event: KeyboardEvent) => { if (event.key === 'Escape' && (event.target as HTMLElement).getAttribute('aria-expanded') === 'true') event.stopPropagation(); },
      filterOption: (input: string, option: any) => `${option.label} ${option.value}`.toLowerCase().includes(input.toLowerCase()),
      onChange: (value: any) => select(String(value))
    });
    const plantList = (key: string) => {
      const list = Array.isArray(props.module.objdata[key]) ? props.module.objdata[key] : [];
      return h('section', { class: 'endless-plant-section' }, [
        h('h3', t(`endlessField_${key}`)),
        h('div', { class: 'endless-plant-list' }, list.map((code: string, index: number) => {
          const plant = props.plantOptions.find((item) => item.code === code);
          return h('span', { class: 'endless-plant-chip' }, [plant?.image ? h('img', { src: plant.image, alt: '' }) : null,
            h('span', plant?.name || code), iconButton(`${t('remove')} ${plant?.name || code}`, DeleteOutlined, () => list.splice(index, 1))]);
        })),
        h('div', { class: 'endless-add-row' }, [
          searchableSelect(chosen.value[key], props.plantOptions.map((plant) => ({ value: plant.code, label: plant.name })),
            t(`endlessField_${key}`), (value) => { chosen.value[key] = value; }),
          h(Button, { 'aria-label': `${t('add')} ${t(`endlessField_${key}`)}`, disabled: !chosen.value[key], onClick: () => {
            if (!list.includes(chosen.value[key])) props.module.objdata[key] = [...list, chosen.value[key]];
            chosen.value[key] = '';
          } }, () => [h(PlusOutlined), t('add')])
        ])
      ]);
    };
    return () => {
      const data = props.module.objdata;
      if (!data || typeof data !== 'object' || Array.isArray(data)) return h('p', t('endlessInvalidConfig'));
      const mini = props.module.objclass === 'DangerRoomMiniGameModuleProperties';
      const worlds = props.progressOptions.filter((option) => option.mini === mini);
      const refs = Array.isArray(data.LevelDesigners) ? data.LevelDesigners : [];
      const name = (reference: string) => {
        const object = resolveEndlessDesigner(reference, props.objects, props.sharedObjects);
        const key = `endlessDesigner_${object?.objclass}`;
        return object && t(key) !== key ? t(key) : t('endlessCustomDesigner');
      };
      const alias = (reference: string) => /^RTID\((.+)@/.exec(reference)?.[1] || reference;
      const available = [
        ...props.objects.flatMap((object) => (object?.aliases || []).map((alias: string) => ({ object, reference: `RTID(${alias}@CurrentLevel)` }))),
        ...props.sharedObjects.flatMap((object) => (object?.aliases || []).map((alias: string) => ({ object, reference: `RTID(${alias}@LevelModules)` })))
      ].filter(({ object, reference }) => ENDLESS_DESIGNER_CLASSES.includes(object.objclass) &&
        object.objclass !== 'DangerRoomJitteredWaveGenerator' && !refs.includes(reference));
      return h('div', { class: 'endless-settings' }, [
        control(t('endlessField_WorldSpecificProperties'), h('select', { value: data.WorldSpecificProperties,
          'aria-label': t('endlessField_WorldSpecificProperties'), onChange: (event: Event) => { data.WorldSpecificProperties = (event.target as HTMLSelectElement).value; }
        }, [!worlds.some((option) => option.reference === data.WorldSpecificProperties)
          ? h('option', { value: data.WorldSpecificProperties || '' }, data.WorldSpecificProperties ? t('endlessCustomProgress') : t('endlessChooseWorld')) : null,
          ...worlds.map((option) => h('option', { value: option.reference }, t(`endlessWorld_${option.world}`)))])),
        h('p', { class: 'endless-progress-notice' }, t('endlessSharedProgress')),
        control(t('endlessField_MaxFlagWave'), h('input', { type: 'number', min: 1, step: 1, value: data.MaxFlagWave ?? (mini ? 2 : 4),
          onInput: (event: Event) => { data.MaxFlagWave = Math.max(1, Math.round(Number((event.target as HTMLInputElement).value)) || 1); }
        })),
        h('label', { class: 'check-row' }, [h('input', { type: 'checkbox', checked: data.SuppressMiniGameMusic === true,
          onChange: (event: Event) => { data.SuppressMiniGameMusic = (event.target as HTMLInputElement).checked; }
        }), t('endlessField_SuppressMiniGameMusic')]),
        !mini ? plantList('InitialPlants') : null,
        !mini ? plantList('ExcludePlants') : null,
        h('section', { class: 'endless-designer-section' }, [
          h('h3', t('endlessField_LevelDesigners')),
          h('ol', { class: 'endless-designer-list' }, refs.map((reference: string, index: number) => {
            const main = resolveEndlessDesigner(reference, props.objects, props.sharedObjects)?.objclass === 'DangerRoomJitteredWaveGenerator';
            const previousMain = index > 0 && resolveEndlessDesigner(refs[index - 1], props.objects, props.sharedObjects)?.objclass === 'DangerRoomJitteredWaveGenerator';
            const nextMain = index + 1 < refs.length && resolveEndlessDesigner(refs[index + 1], props.objects, props.sharedObjects)?.objclass === 'DangerRoomJitteredWaveGenerator';
            return h('li', [h('div', [h('strong', name(reference)), h('code', alias(reference))]),
              !main ? h('div', { class: 'endless-rule-actions' }, [
                iconButton(t('endlessMoveEarlier'), ArrowUpOutlined, () => { [refs[index - 1], refs[index]] = [refs[index], refs[index - 1]]; }, index === 0 || previousMain),
                iconButton(t('endlessMoveLater'), ArrowDownOutlined, () => { [refs[index + 1], refs[index]] = [refs[index], refs[index + 1]]; }, index === refs.length - 1 || nextMain),
                iconButton(t('remove'), DeleteOutlined, () => refs.splice(index, 1))
              ]) : null]);
          })),
          available.length ? h('div', { class: 'endless-add-row' }, [
            searchableSelect(chosen.value.designer, available.map(({ reference }) => ({ value: reference, label: `${name(reference)} · ${alias(reference)}` })),
              t('endlessAddDesigner'), (value) => { chosen.value.designer = value; }),
            h(Button, { 'aria-label': t('endlessAddDesigner'), disabled: !chosen.value.designer, onClick: () => {
              data.LevelDesigners = [...refs, chosen.value.designer]; chosen.value.designer = '';
            } }, () => [h(PlusOutlined), t('add')])
          ]) : null
        ])
      ]);
    };
  }
});
