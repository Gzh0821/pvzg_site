import { h } from 'vue';
import type { LevelEditorRuntime } from '../app/use-level-editor';

type Bindings = {
  t: LevelEditorRuntime['t'];
};

export function createFieldRenderers(bindings: Bindings) {
  const { t } = bindings;

  function renderActionNumberField(
    labelKey: string,
    value: unknown,
    onInput: (value: number) => void,
    min = 0,
    max?: number
  ) {
    return h('div', { class: 'field-row compact' }, [
      h('label', t(labelKey)),
      h('input', {
        type: 'number',
        'aria-label': t(labelKey),
        min,
        ...(max === undefined ? {} : { max }),
        value: value ?? '',
        onInput: (event: Event) => {
          const number = Number((event.target as HTMLInputElement).value);
          onInput(Number.isFinite(number) ? number : min);
        }
      })
    ]);
  }

  function renderActionRangeField(
    labelKey: string,
    value: Record<string, any> | undefined,
    onInput: (bound: 'Min' | 'Max', value: number) => void
  ) {
    return h('div', { class: 'action-range-field' }, [
      h('label', t(labelKey)),
      h('div', { class: 'action-range-inputs' }, [
        h('input', {
          type: 'number',
          min: 0,
          value: value?.Min ?? '',
          placeholder: t('minimum'),
          'aria-label': t('rangeMinimum', { label: t(labelKey) }),
          onInput: (event: Event) => onInput('Min', Number((event.target as HTMLInputElement).value) || 0)
        }),
        h('span', '–'),
        h('input', {
          type: 'number',
          min: 0,
          value: value?.Max ?? '',
          placeholder: t('maximum'),
          'aria-label': t('rangeMaximum', { label: t(labelKey) }),
          onInput: (event: Event) => onInput('Max', Number((event.target as HTMLInputElement).value) || 0)
        })
      ])
    ]);
  }

  return { renderActionNumberField, renderActionRangeField };
}
