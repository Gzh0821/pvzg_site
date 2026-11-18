import { defineComponent, h } from 'vue';
import type { LevelEditorRuntime } from '../../app/use-level-editor';

type Bindings = {
  expertMode: LevelEditorRuntime['expertMode'];
  opaqueRawObjects: LevelEditorRuntime['opaqueRawObjects'];
  t: LevelEditorRuntime['t'];
  validationItems: LevelEditorRuntime['validationItems'];
};

export function createValidationView(bindings: Bindings) {
  const { expertMode, opaqueRawObjects, t, validationItems } = bindings;

  function renderUnsupportedObjectsSummary() {
    if (!expertMode.value || !opaqueRawObjects.value.length) return null;

    return h('details', { class: 'unsupported-summary' }, [
      h('summary', `${t('unsupported')}: ${opaqueRawObjects.value.length}`),
      h(
        'div',
        { class: 'unsupported-object-list' },
        opaqueRawObjects.value.map((object: any, index) => {
          const aliases = Array.isArray(object?.aliases) ? object.aliases.join(', ') : '';
          return h('div', { class: 'unsupported-object-card' }, [
            h('strong', object?.objclass || t('unknownObjclass')),
            h('small', aliases ? `${t('unsupportedAlias')}: ${aliases}` : t('unsupportedNoAlias')),
            h('code', `#${index + 1}`)
          ]);
        })
      )
    ]);
  }

  const ValidationPanel = defineComponent({
    props: { compact: Boolean },
    setup(props) {
      return () =>
        h('section', { class: ['validation-panel', props.compact ? 'compact' : ''], 'aria-live': 'polite' }, [
          h('div', { class: 'panel-title' }, t('validation')),
          validationItems.value.length
            ? h(
              'div',
              { class: 'issue-list' },
              validationItems.value.map((item) => h('div', { class: ['issue', item.type] }, item.text))
            )
            : h('div', { class: 'issue ok' }, t('noIssues')),
          renderUnsupportedObjectsSummary()
        ]);
    }
  });

  return { ValidationPanel };
}
