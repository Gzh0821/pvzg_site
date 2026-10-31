import { defineComponent, h, ref, watch, type PropType } from 'vue';
import { Select } from 'ant-design-vue';
import { PlusOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons-vue';
import { ENDLESS_RULE_FIELDS, setEndlessRuleNumber, getEndlessBoundValue } from './endless-rule-codec.mjs';

export default defineComponent({
  name: 'EndlessRulePanel',
  props: {
    object: { type: Object as PropType<any>, required: true },
    shared: Boolean,
    previewFloor: { type: Number, required: true },
    objects: { type: Array as PropType<any[]>, required: true },
    sharedObjects: { type: Array as PropType<any[]>, required: true },
    plantOptions: { type: Array as PropType<any[]>, required: true },
    zombieOptions: { type: Array as PropType<any[]>, required: true },
    objectOptions: { type: Array as PropType<any[]>, required: true },
    translate: { type: Function as PropType<(key: string, params?: Record<string, unknown>) => string>, required: true }
  },
  emits: ['back', 'localize', 'floor-change'],
  setup(props, { emit }) {
    const layoutIndex = ref<Record<string, number>>({}), chosen = ref<Record<string, string>>({});
    watch(() => props.object, () => { layoutIndex.value = {}; chosen.value = {}; });
    const t = (key: string, params?: Record<string, unknown>) => props.translate(key, params);
    const label = (key: string) => t(`endlessRuleField_${key}`);
    const field = (name: string, node: any) => h('label', { class: 'field-row' }, [h('span', name), node]);
    const button = (name: string, run: () => void, icon?: any, disabled = false) => h('button', {
      type: 'button', class: 'endless-rule-button', onClick: run, disabled, 'aria-label': name
    }, [icon ? h(icon) : null, name]);
    const number = (data: any, path: string, name: string, offset = 0, placeholder = '') => {
      const value = path.split('.').reduce((value, key) => value?.[key], data);
      return h('input', { type: 'number', step: 'any', value: value == null ? '' : Number(value) + offset,
        placeholder, 'aria-label': name, onChange: (event: Event) => setEndlessRuleNumber(data, path, (event.target as HTMLInputElement).value, offset)
      });
    };
    const optionsFor = (kind: string) => {
      const plants = kind === 'plants' || kind === 'plant';
      const assets = plants ? props.plantOptions : kind.startsWith('grid') ? props.objectOptions : props.zombieOptions;
      const localClass = plants ? 'PlantType' : 'ZombieType';
      const options = assets.map(item => ({ value: kind === 'zombieRef' ? `RTID(${item.code}@ZombieTypes)` : item.code, label: item.name }));
      if (!kind.startsWith('grid')) for (const object of props.objects.filter(item => item.objclass === localClass)) {
        for (const alias of object.aliases || []) {
          const base = object.objdata?.[plants ? 'PlantBasedOn' : 'ZombieBasedOn'];
          const asset = assets.find(item => item.code === base);
          options.unshift({ value: kind === 'zombieRef' ? `RTID(${alias}@CurrentLevel)` : alias, label: `${asset?.name || alias} · ${alias}` });
        }
      }
      return options.filter((item, i, all) => all.findIndex(other => other.value === item.value) === i);
    };
    const search = (name: string, value: string, choices: any[], change: (value: string) => void, clear = false) => h(Select, {
      value: value || undefined, options: value && !choices.some(item => item.value === value) ? [{ value, label: value }, ...choices] : choices,
      showSearch: true, allowClear: clear, disabled: props.shared, placeholder: name, 'aria-label': name, popupClassName: 'level-editor-select-popup',
      filterOption: (input: string, option: any) => `${option.label} ${option.value}`.toLowerCase().includes(input.toLowerCase()),
      onKeydown: (event: KeyboardEvent) => { if (event.key === 'Escape' && (event.target as HTMLElement).getAttribute('aria-expanded') === 'true') event.stopPropagation(); },
      onChange: (value: any) => change(value == null ? '' : String(value))
    });
    const references = (kind: string) => kind === 'portals' ? [...new Set([...props.objects, ...props.sharedObjects].flatMap(object => object.objdata?.PortalOptions || []))].map(value => ({ value, label: value })) : [...props.objects.map(object => ({ object, namespace: 'CurrentLevel' })), ...props.sharedObjects.map(object => ({ object, namespace: 'LevelModules' }))]
      .filter(({ object }) => kind === 'portals' ? object.objclass === 'PortalType' : object.objclass === 'InitialGridItemProperties')
      .flatMap(({ object, namespace }) => (object.aliases || []).map((alias: string) => ({ value: kind === 'portals' ? alias : `RTID(${alias}@${namespace})`, label: alias })));
    const valueList = (data: any, spec: any) => {
      const values = Array.isArray(data[spec.key]) ? data[spec.key] : [];
      const choices = ['patterns', 'portals'].includes(spec.kind) ? references(spec.kind) : optionsFor(spec.kind);
      return h('section', { class: 'endless-rule-section' }, [h('h3', label(spec.key)),
        ...values.map((value: string, index: number) => h('div', { class: 'endless-rule-list-row' }, [
          typeof value === 'string' ? search(`${label(spec.key)} ${index + 1}`, value, choices, next => { values[index] = next; }) : h('p', t('endlessInvalidConfig')),
          button(t('remove'), () => values.splice(index, 1), DeleteOutlined)
        ])),
        h('div', { class: 'endless-add-row' }, [search(label(spec.key), chosen.value[spec.key], choices, value => { chosen.value[spec.key] = value; }),
          button(t('add'), () => { data[spec.key] = [...values, chosen.value[spec.key]]; chosen.value[spec.key] = ''; }, PlusOutlined, !chosen.value[spec.key])])
      ]);
    };
    const boundTable = (data: any, rows: { path: string; name: string; minimum?: number }[], name: string) => h('div', { class: 'endless-bound-table', role: 'group', 'aria-label': name }, [
      h('div', { class: 'endless-bound-head', 'aria-hidden': 'true' }, [h('span'), ...['YIntercept', 'SlopeCoefficient', 'LowerLimit', 'UpperLimit'].map(key => h('span', label(key)))]),
      ...rows.map(row => h('div', { class: 'endless-bound-row' }, [h('strong', row.name),
        ...['YIntercept', 'SlopeCoefficient', 'LowerLimit.Value', 'UpperLimit.Value'].map(key => {
          const name = `${row.name} · ${label(key.split('.')[0])}`;
          return field(label(key.split('.')[0]), number(data, `${row.path}.${key}`, name, /LilypadColumn/.test(row.path) && key !== 'SlopeCoefficient' ? 1 : 0,
            key === 'UpperLimit.Value' ? /LilypadColumn/.test(row.path) ? '9' : /TideLevel|TideDelta|RecedeAmount/.test(row.path) ? '9' : t('endlessRuleNoLimit') : String(key === 'LowerLimit.Value' ? (row.minimum || 0) + (/LilypadColumn/.test(row.path) ? 1 : 0) : /LilypadColumn/.test(row.path) && key === 'YIntercept' ? 1 : 0)));
        })
      ]))
    ]);
    const layoutEditor = (data: any, spec: any) => {
      const layouts = Array.isArray(data[spec.key]) ? data[spec.key] : [];
      const index = Math.max(0, Math.min(layoutIndex.value[spec.key] || 0, layouts.length - 1)), current = layouts[index];
      const slider = spec.kind === 'sliderLayouts', tile = spec.kind === 'tileLayouts';
      const rows = slider ? 5 : tile && Array.isArray(current) ? current.length : 5;
      const columns = slider ? 9 : tile && typeof current?.[0] === 'string' ? current[0].length : 1;
      const usable = slider ? Array.isArray(current?.Layout) : tile ? Array.isArray(current) && current.every((row: any) => typeof row === 'string') : typeof current === 'string';
      const layoutValue = (row: number, col: number) => slider ? current?.Layout?.find((cell: any) => cell && cell.GridX === col && cell.GridY === row)?.TypeName || ''
        : tile ? current?.[row]?.[col] || '0' : current?.[row] || '0';
      const toggle = (row: number, col: number) => {
        if (slider) {
          const cells = current.Layout;
          const i = cells.findIndex((cell: any) => cell && cell.GridX === col && cell.GridY === row);
          if (i < 0) cells.push({ GridX: col, GridY: row, TypeName: 'slider_up' });
          else if (cells[i].TypeName === 'slider_up') cells[i].TypeName = 'slider_down';
          else cells.splice(i, 1);
        } else {
          const max = spec.kind === 'railLayouts' ? 9 : 1;
          const value = String((Number(layoutValue(row, col)) + 1) % (max + 1));
          if (tile) current[row] = current[row].slice(0, col) + value + current[row].slice(col + 1);
          else layouts[index] = current.slice(0, row) + value + current.slice(row + 1);
        }
      };
      return h('section', { class: 'endless-rule-section' }, [h('h3', label(spec.key)),
        h('div', { class: 'endless-rule-layout-toolbar' }, [
          field(t('endlessRuleLayout'), h('select', { value: index, 'aria-label': t('endlessRuleLayout'), onChange: (event: Event) => { layoutIndex.value[spec.key] = Number((event.target as HTMLSelectElement).value); }
          }, layouts.map((_: any, i: number) => h('option', { value: i }, t('endlessRuleLayoutNumber', { count: i + 1 }))))),
          button(t('add'), () => { data[spec.key] = [...layouts, slider ? { Layout: [] } : tile ? ['11'] : '00000']; layoutIndex.value[spec.key] = layouts.length; }, PlusOutlined),
          button(t('remove'), () => { layouts.splice(index, 1); layoutIndex.value[spec.key] = Math.max(0, index - 1); }, DeleteOutlined, !layouts.length)
        ]),
        layouts.length && usable ? h('div', { class: 'endless-rule-layout-viewport' }, h('div', { class: ['endless-rule-layout', slider ? 'endless-rule-slider-grid' : ''], style: { gridTemplateColumns: `repeat(${columns}, minmax(44px, 1fr))` }, 'aria-label': label(spec.key) },
          Array.from({ length: rows * columns }, (_, cell) => {
            const row = Math.floor(cell / columns), col = cell % columns, value = layoutValue(row, col);
            const name = t('endlessRuleCell', { row: row + 1, col: col + 1 });
            return h('button', { type: 'button', 'aria-label': `${name} · ${slider ? t(value ? `endlessRule_${value}` : 'endlessRuleEmpty') : value}`,
              'aria-pressed': !!value && value !== '0', onClick: () => toggle(row, col) }, slider ? value ? t(`endlessRule_${value}`) : '' : value === '0' ? '' : value);
          }))) : null,
        slider && current && Array.isArray(current.Layout) ? h('div', { class: 'endless-rule-slider-mobile' }, [
          ...current.Layout.map((cell: any, i: number) => !cell || typeof cell !== 'object' || Array.isArray(cell) ? h('div', { class: 'endless-rule-list-row' }, [h('p', t('endlessInvalidConfig')), button(t('remove'), () => current.Layout.splice(i, 1), DeleteOutlined)]) : h('div', { class: 'endless-rule-slider-cell' }, [
            ...['GridY', 'GridX'].map(key => field(t(key === 'GridY' ? 'endlessRuleRow' : 'column'), number(cell, key, `${t(key === 'GridY' ? 'endlessRuleRow' : 'column')} ${i + 1}`, 1))),
            field(t('endlessRuleDirection'), h('select', { value: cell.TypeName, 'aria-label': `${t('endlessRuleDirection')} ${i + 1}`, onChange: (event: Event) => { cell.TypeName = (event.target as HTMLSelectElement).value; } },
              ['slider_up', 'slider_down'].map(value => h('option', { value }, t(`endlessRule_${value}`))))),
            button(t('remove'), () => current.Layout.splice(i, 1), DeleteOutlined)
          ])),
          button(t('endlessRuleAddPosition'), () => { const used = new Set(current.Layout.filter((cell: any) => cell && typeof cell === 'object').map((cell: any) => `${cell.GridX}:${cell.GridY}`)); const next = Array.from({ length: 45 }, (_, n) => ({ GridX: n % 9, GridY: Math.floor(n / 9), TypeName: 'slider_up' })).find(cell => !used.has(`${cell.GridX}:${cell.GridY}`)); if (next) current.Layout.push(next); }, PlusOutlined, current.Layout.length >= 45)
        ]) : null,
        tile && layouts.length && usable ? h('div', { class: 'endless-rule-layout-size' }, [
          ...['rows', 'columns'].map(key => field(t(`endlessRule_${key}`), h('input', { type: 'number', min: 1, max: key === 'rows' ? 5 : 9, step: 1, value: key === 'rows' ? rows : columns, 'aria-label': t(`endlessRule_${key}`),
            onChange: (event: Event) => {
              const count = Number((event.target as HTMLInputElement).value);
              if (!Number.isInteger(count) || count < 1 || count > (key === 'rows' ? 5 : 9)) return;
              if (key === 'rows') layouts[index] = Array.from({ length: count }, (_, i) => current[i] || '0'.repeat(columns));
              else layouts[index] = current.map((row: string) => row.padEnd(count, '0').slice(0, count));
            }
          })))
        ]) : null,
        h('p', { class: ['endless-rule-notice', slider ? 'endless-rule-slider-hint' : ''] }, t(slider ? 'endlessRuleSliderHint' : spec.kind === 'railLayouts' ? 'endlessRuleRailHint' : 'endlessRuleLayoutHint'))
      ]);
    };
    const conveyor = (data: any, spec: any) => {
      const plants = Array.isArray(data.InitialPlantList) ? data.InitialPlantList : [];
      const index = Math.max(0, Math.min(layoutIndex.value.InitialPlantList || 0, plants.length - 1)), plant = plants[index];
      const editablePlant = plant && typeof plant === 'object' && !Array.isArray(plant);
      const choices = optionsFor('plants');
      return h('section', { class: 'endless-rule-section' }, [h('h3', label(spec.key)),
        h('div', { class: 'endless-rule-layout-toolbar' }, [field(t('endlessRuleEntry'), h('select', { value: index, 'aria-label': t('endlessRuleEntry'),
          onChange: (event: Event) => { layoutIndex.value.InitialPlantList = Number((event.target as HTMLSelectElement).value); }
        }, plants.map((plant: any, i: number) => h('option', { value: i }, `${i + 1}. ${choices.find(item => item.value === plant?.PlantType)?.label || plant?.PlantType || t('endlessInvalidConfig')}`)))),
          button(t('add'), () => { data.InitialPlantList = [...plants, { PlantType: choices[0]?.value || 'peashooter', Weight: { YIntercept: 100 } }]; layoutIndex.value.InitialPlantList = plants.length; }, PlusOutlined),
          button(t('remove'), () => { plants.splice(index, 1); layoutIndex.value.InitialPlantList = Math.max(0, index - 1); }, DeleteOutlined, !plants.length)]),
        editablePlant ? field(t('endlessRulePlantType'), search(t('endlessRulePlantType'), plant.PlantType, choices, value => { plant.PlantType = value; })) : null,
        editablePlant ? h('h4', { class: 'endless-rule-effective-title' }, t('endlessRuleAtFloor', { floor: props.previewFloor })) : null,
        editablePlant ? h('dl', { class: 'endless-rule-effective' }, ['Weight', 'MinCount', 'MaxCount', 'MinWeightFactor', 'MaxWeightFactor'].flatMap(key => [h('dt', label(key)), h('dd', String(Math.round(getEndlessBoundValue(plant[key], props.previewFloor, Infinity, key === 'MinWeightFactor' ? 1 : 0))))])) : null,
        editablePlant ? boundTable(plant, ['Weight', 'MinCount', 'MaxCount', 'MinWeightFactor', 'MaxWeightFactor'].map(path => ({ path, name: label(path), minimum: path === 'MinWeightFactor' ? 1 : 0 })), label(spec.key)) : null
      ]);
    };
    const curvePreview = (data: any, spec: any) => {
      const range = data[spec.key.startsWith('JamZombies') ? 'ZombieAddLevelRange' : 'LevelRange'];
      const progress = Math.max(0, Math.min(1, (props.previewFloor - range?.Min) / (range?.Max - range?.Min)));
      const value = Number(data[spec.key]?.Min) + progress * (Number(data[spec.key]?.Max) - Number(data[spec.key]?.Min)) + (spec.offset || 0);
      return h('output', { 'aria-label': `${label(spec.key)} · ${t('endlessRuleAtFloor', { floor: props.previewFloor })}` }, [
        h('span', { class: 'endless-rule-preview-label' }, `${t('endlessRuleAtFloor', { floor: props.previewFloor })}: `),
        Number.isFinite(value) ? Number(value.toFixed(3)) : t('endlessInvalidConfig')
      ]);
    };
    return () => {
      const data = props.object.objdata;
      const fields: any[] = ENDLESS_RULE_FIELDS[props.object.objclass] || [];
      const title = t(`endlessDesigner_${props.object.objclass}`);
      return h('div', { class: 'endless-rule-editor' }, [
        button(t('endlessRuleBack'), () => emit('back'), ArrowLeftOutlined),
        h('div', { class: 'endless-rule-title' }, [h('h3', title), props.shared ? button(t('specialLocalize'), () => emit('localize')) : null]),
        fields.some(spec => ['curve', 'bounds', 'conveyor'].includes(spec.kind)) ? field(t('endlessPreviewFloor'), h('input', { type: 'number', min: 1, step: 1, value: props.previewFloor, 'aria-label': t('endlessPreviewFloor'), onChange: (event: Event) => { const floor = Number((event.target as HTMLInputElement).value); if (Number.isInteger(floor) && floor >= 1) emit('floor-change', floor); } })) : null,
        props.shared ? h('p', { class: 'endless-rule-notice' }, t('endlessRuleShared')) : null,
        !data || typeof data !== 'object' || Array.isArray(data) ? h('p', t('endlessInvalidConfig')) : h('fieldset', { disabled: props.shared, class: 'endless-rule-fields' }, [
          h('div', { class: 'endless-rule-number-grid' }, fields.filter(spec => ['number', 'text', 'grid', 'zombie', 'zombieRef', 'range'].includes(spec.kind)).map(spec => {
            const name = label(spec.key);
            if (spec.kind === 'number') return field(name, number(data, spec.key, name, spec.offset));
            if (spec.kind === 'text') return field(name, h('input', { value: data[spec.key] || '', 'aria-label': name, onChange: (event: Event) => { data[spec.key] = (event.target as HTMLInputElement).value; } }));
            if (spec.kind === 'range') return h('div', { class: 'endless-rule-range', role: 'group', 'aria-label': name }, [h('strong', name), ...['Min', 'Max'].map(key => field(t(`endlessRule_${key}`), number(data, `${spec.key}.${key}`, `${name} · ${t(`endlessRule_${key}`)}`)))]);
            return field(name, search(name, data[spec.key], optionsFor(spec.kind), value => { if (value) data[spec.key] = value; else delete data[spec.key]; }, true));
          })),
          fields.some(spec => spec.kind === 'curve') ? h('section', { class: 'endless-rule-section' }, [
            h('div', { class: 'endless-rule-curve-heading', 'aria-hidden': 'true' }, [h('span'), h('span', t('endlessRuleAtStart')), h('span', t('endlessRuleAtEnd')), h('span', t('endlessRuleAtFloor', { floor: props.previewFloor }))]),
            ...fields.filter(spec => spec.kind === 'curve').map(spec => h('div', { class: 'endless-rule-curve-row' }, [h('strong', label(spec.key)),
              ...['Min', 'Max'].map(key => field(t(key === 'Min' ? 'endlessRuleAtStart' : 'endlessRuleAtEnd'), number(data, `${spec.key}.${key}`, `${label(spec.key)} · ${t(key === 'Min' ? 'endlessRuleAtStart' : 'endlessRuleAtEnd')}`, spec.offset))),
              curvePreview(data, spec)
            ]))
          ]) : null,
          ...fields.filter(spec => spec.kind === 'bounds').map(spec => h('section', { class: 'endless-rule-section' }, [h('div', { class: 'endless-rule-title' }, [h('h3', label(spec.key)), h('output', t('endlessRuleBoundPreview', { floor: props.previewFloor, min: getEndlessBoundValue(data[spec.key]?.LowerBound, props.previewFloor, /LilypadColumn/.test(spec.key) ? 8 : /TideLevel|TideDelta|RecedeAmount/.test(spec.key) ? 9 : Infinity) + (/LilypadColumn/.test(spec.key) ? 1 : 0), max: getEndlessBoundValue(data[spec.key]?.UpperBound, props.previewFloor, /LilypadColumn/.test(spec.key) ? 8 : /TideLevel|TideDelta|RecedeAmount/.test(spec.key) ? 9 : Infinity) + (/LilypadColumn/.test(spec.key) ? 1 : 0) }))]), boundTable(data, ['LowerBound', 'UpperBound'].map(key => ({ path: `${spec.key}.${key}`, name: t(`endlessRule_${key}`) })), label(spec.key))])),
          ...fields.filter(spec => ['plants', 'zombies', 'grids', 'patterns', 'portals'].includes(spec.kind)).map(spec => valueList(data, spec)),
          ...fields.filter(spec => ['laneLayouts', 'railLayouts', 'tileLayouts', 'sliderLayouts'].includes(spec.kind)).map(spec => layoutEditor(data, spec)),
          ...fields.filter(spec => spec.kind === 'conveyor').map(spec => conveyor(data, spec))
        ])
      ]);
    };
  }
});
