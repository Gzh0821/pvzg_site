import { defineComponent, h } from 'vue';
import type { LevelEditorRuntime } from '../../app/use-level-editor';

type Bindings = {
  t: LevelEditorRuntime['t'];
  draft: LevelEditorRuntime['draft'];
  availableStageOptions: LevelEditorRuntime['availableStageOptions'];
  expertMode: LevelEditorRuntime['expertMode'];
  mowerOptions: LevelEditorRuntime['mowerOptions'];
  STAGE_DEFAULT_MOWER: LevelEditorRuntime['STAGE_DEFAULT_MOWER'];
  sunDropperOptions: LevelEditorRuntime['sunDropperOptions'];
  NO_MODULE: LevelEditorRuntime['NO_MODULE'];
};

export function createBasicView(bindings: Bindings) {
  const {
    t, draft, availableStageOptions, expertMode, mowerOptions, STAGE_DEFAULT_MOWER,
    sunDropperOptions, NO_MODULE
  } = bindings;

  const BasicForm = defineComponent({
    setup() {
      return () =>
        h('div', { class: 'basic-form', id: 'editor-basic' }, [
          h('div', { class: 'field-row' }, [
            h('label', t('levelName')),
            h('input', {
              'aria-label': t('levelName'),
              value: draft.value.name,
              onInput: (event: Event) => {
                draft.value.name = (event.target as HTMLInputElement).value;
              }
            })
          ]),
          h('div', { class: 'field-row' }, [
            h('label', t('author')),
            h('input', {
              'aria-label': t('author'),
              value: draft.value.author,
              onInput: (event: Event) => {
                draft.value.author = (event.target as HTMLInputElement).value;
              }
            })
          ]),
          h('div', { class: 'field-row wide' }, [
            h('label', t('description')),
            h('input', {
              'aria-label': t('description'),
              value: draft.value.description,
              onInput: (event: Event) => {
                draft.value.description = (event.target as HTMLInputElement).value;
              }
            })
          ]),
          h('div', { class: 'field-row' }, [
            h('label', t('stage')),
            h(
              'select',
              {
                'aria-label': t('stage'),
                value: draft.value.stage,
                onChange: (event: Event) => {
                  draft.value.stage = (event.target as HTMLSelectElement).value;
                  draft.value.stageSource = 'LevelModules';
                }
              },
              availableStageOptions.value.map((stage) => h('option', { value: stage.value }, stage.label))
            )
          ]),
          h('div', { class: 'field-row compact' }, [
            h('label', t('startingSun')),
            h('input', {
              type: 'number',
              min: 0,
              'aria-label': t('startingSun'),
              value: draft.value.startingSun,
              onInput: (event: Event) => {
                draft.value.startingSun = Number((event.target as HTMLInputElement).value);
              }
            })
          ]),
          expertMode.value
            ? h('section', { class: 'advanced-level-fields wide' }, [
              h('div', { class: 'advanced-grid' }, [
                h('div', { class: 'field-row' }, [
                  h('label', t('mower')),
                  h(
                    'select',
                    {
                      'aria-label': t('mower'),
                      value: draft.value.mower,
                      onChange: (event: Event) => {
                        draft.value.mower = (event.target as HTMLSelectElement).value;
                      }
                    },
                    mowerOptions.map((option) => h('option', { value: option.value }, option.value === STAGE_DEFAULT_MOWER ? t('stageDefault') : option.label))
                  )
                ]),
                h('div', { class: 'field-row' }, [
                  h('label', t('sunDropper')),
                  h(
                    'select',
                    {
                      'aria-label': t('sunDropper'),
                      value: draft.value.sunDropper,
                      onChange: (event: Event) => {
                        draft.value.sunDropper = (event.target as HTMLSelectElement).value;
                      }
                    },
                    sunDropperOptions.map((option) => h('option', { value: option.value }, option.value === NO_MODULE ? t('none') : option.label))
                  )
                ])
              ])
            ])
            : null
        ]);
    }
  });

  return { BasicForm };
}
