import { defineComponent, h, ref, type PropType } from 'vue';
import { ArrowUpOutlined, ArrowDownOutlined, CopyOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { narrativeObjects } from '../game-data/narratives';
import { NARRATIVE_SLOTS, NARRATIVE_CHARACTERS, findNarrative, createLocalNarrative, getNarrativeActions } from './narrative-codec.mjs';

const sharedByAlias = new Map(narrativeObjects.flatMap((object) => object.aliases.map((alias) => [alias, object] as const)));

export default defineComponent({
  name: 'NarrativePanel',
  props: {
    objects: { type: Array as PropType<any[]>, required: true },
    definition: { type: Object as PropType<Record<string, any>>, required: true },
    language: { type: String, required: true },
    reservedAliases: { type: Array as PropType<string[]>, default: () => [] },
    translate: { type: Function as PropType<(key: string, params?: Record<string, unknown>) => string>, required: true }
  },
  emits: ['catalog-ready'],
  setup(props, { emit }) {
    emit('catalog-ready', narrativeObjects);
    const slot = ref(NARRATIVE_SLOTS[0]);
    const textLanguage = ref(props.language);
    const t = (key: string, params?: Record<string, unknown>) => props.translate(key, params);
    const characterName = (value: string) => {
      const key = `narrativeCharacter_${value || 'scene'}`;
      return t(key) === key ? value : t(key);
    };
    const button = (label: string, icon: any, run: () => void, disabled = false) => h('button', {
      type: 'button', class: 'text-button', 'aria-label': label, title: label, disabled, onClick: run
    }, h(icon));
    const field = (label: string, control: any) => h('label', { class: 'field-row' }, [h('span', label), control]);
    return () => {
      const alias = props.definition[slot.value] || '';
      const local = findNarrative(props.objects, alias);
      const source = local || sharedByAlias.get(alias);
      const editable = !!local && Array.isArray(local.objdata?.Flow);
      const flow = Array.isArray(source?.objdata?.Flow) ? source.objdata.Flow : [];
      const candidates = [...new Set([...props.objects, ...narrativeObjects].filter((object) => object.objclass === 'NarrativeProperties')
        .flatMap((object) => object.aliases || []))];
      const select = (value: string, values: string[], label: string, change: (value: string) => void, text: (value: string) => string) => h('select', {
        value, disabled: !editable, 'aria-label': label, onChange: (event: Event) => change((event.target as HTMLSelectElement).value)
      }, [...new Set([value, ...values])].map((value) => h('option', { value }, text(value))));
      return h('section', { class: 'narrative-editor' }, [
        h('div', { class: 'narrative-toolbar' }, [h('h2', t('narrative')), field(t('narrativeLanguage'), h('select', {
          value: textLanguage.value, 'aria-label': t('narrativeLanguage'), onChange: (event: Event) => { textLanguage.value = (event.target as HTMLSelectElement).value; }
        }, [['zh', '中文'], ['en', 'English'], ['es', 'Español'], ['ru', 'Русский']].map(([value, label]) => h('option', { value }, label))))]),
        h('nav', { class: 'narrative-slots', 'aria-label': t('narrativeMoment') }, NARRATIVE_SLOTS.map((key) => h('button', {
          type: 'button', 'aria-pressed': slot.value === key, onClick: () => { slot.value = key; }
        }, t(`narrativeSlot_${key}`)))),
        h('div', { class: 'narrative-source-row' }, [
          field(t('narrativeSource'), h('input', { value: alias, list: 'level-narrative-sources', 'aria-label': t('narrativeSource'),
            onChange: (event: Event) => {
              const value = (event.target as HTMLInputElement).value.trim();
              if (value) props.definition[slot.value] = value; else delete props.definition[slot.value];
            }
          })),
          h('datalist', { id: 'level-narrative-sources' }, candidates.map((value) => {
            const object = findNarrative(props.objects, value) || sharedByAlias.get(value);
            const flow = object?.objdata?.Flow;
            const lines = Array.isArray(flow) ? flow.find((step: any) => step?.Lines)?.Lines : null;
            return h('option', { value, label: lines?.[textLanguage.value] || lines?.zh || lines?.en || value });
          })),
          h('button', { type: 'button', class: 'add-button', onClick: () => createLocalNarrative(props.objects, props.definition, slot.value, null, textLanguage.value, props.reservedAliases) }, [h(PlusOutlined), t('narrativeNew')]),
          !local && source ? h('button', { type: 'button', class: 'text-button', onClick: () => createLocalNarrative(props.objects, props.definition, slot.value, source, textLanguage.value, props.reservedAliases) }, [h(CopyOutlined), t('narrativeLocalCopy')]) : null,
          alias ? button(t('narrativeUnlink'), DeleteOutlined, () => { delete props.definition[slot.value]; }) : null
        ]),
        !source ? h('p', { class: 'editor-empty-action' }, t(alias ? 'narrativeMissing' : 'narrativeChoose')) : null,
        source && !editable ? h('p', { class: 'editor-empty-action' }, t(local ? 'narrativeInvalidFlow' : 'narrativeShared')) : null,
        h('ol', { class: 'narrative-flow' }, flow.map((step: any, index: number) => {
          if (!step || typeof step !== 'object' || Array.isArray(step)) return h('li', { class: 'narrative-step' }, [
            h('span', t('narrativeInvalidStep')),
            editable ? button(t('remove'), DeleteOutlined, () => flow.splice(index, 1)) : null
          ]);
          const actionName = (value: string) => {
            if (/^SPECIAL\d+$/.test(value)) return t('narrativeSpecial', { index: value.slice(7) });
            const key = `narrativeAction_${value}`;
            return t(key) === key ? value : t(key);
          };
          if (!editable) return h('li', { class: 'narrative-step narrative-preview-step' }, [
            h('div', [h('strong', characterName(step.Character)), h('span', actionName(step.Action))]),
            step.Lines ? h('p', step.Lines[textLanguage.value] || step.Lines.zh || step.Lines.en || '') : null
          ]);
          return h('li', { class: 'narrative-step' }, [
            h('div', { class: 'narrative-step-heading' }, [
              h('strong', String(index + 1)),
              field(t('narrativeCharacter'), select(step.Character, NARRATIVE_CHARACTERS, t('narrativeCharacter'), (value) => {
                step.Character = value;
                if (!getNarrativeActions(value).includes(step.Action)) step.Action = value ? 'SAY' : 'START_DIALOG_MUSIC';
              }, characterName)),
              field(t('narrativeAction'), select(step.Action, getNarrativeActions(step.Character), t('narrativeAction'), (value) => { step.Action = value; }, actionName)),
              editable ? h('div', { class: 'narrative-step-actions' }, [
                button(t('narrativeMoveEarlier'), ArrowUpOutlined, () => { [flow[index - 1], flow[index]] = [flow[index], flow[index - 1]]; }, index === 0),
                button(t('narrativeMoveLater'), ArrowDownOutlined, () => { [flow[index + 1], flow[index]] = [flow[index], flow[index + 1]]; }, index === flow.length - 1),
                button(t('duplicate'), CopyOutlined, () => flow.splice(index + 1, 0, JSON.parse(JSON.stringify(step)))),
                button(t('remove'), DeleteOutlined, () => flow.splice(index, 1))
              ]) : null
            ]),
            !['NPC_ENTER', 'NPC_EXIT', 'START_DIALOG_MUSIC', 'GIVE_GEM'].includes(step.Action) ? field(t('narrativeLines'), h('textarea', {
              value: step.Lines?.[textLanguage.value] ?? '', rows: 2, disabled: !editable, 'aria-label': t('narrativeLines'),
              onInput: (event: Event) => { step.Lines ??= {}; step.Lines[textLanguage.value] = (event.target as HTMLTextAreaElement).value; }
            })) : null,
            step.Action === 'GIVE_GEM' ? field(t('narrativeGemCount'), h('input', { type: 'number', value: step.Value, disabled: !editable,
              'aria-label': t('narrativeGemCount'), onInput: (event: Event) => { step.Value = Number((event.target as HTMLInputElement).value); }
            })) : null
          ]);
        })),
        editable ? h('button', { type: 'button', class: 'add-button', onClick: () => flow.push({ Character: 'crazydave', Action: 'SAY', Lines: { [textLanguage.value]: '' } }) }, [h(PlusOutlined), t('narrativeAddStep')]) : null
      ]);
    };
  }
});
