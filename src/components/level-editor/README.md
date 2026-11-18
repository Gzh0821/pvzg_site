# Level editor workbench

`App.vue` assembles the official editor. It keeps the locale providers and existing import, export, template, validation and advanced drawers. Advertisements remain owned by the surrounding website pages.

## Module boundaries

| Location | Owns |
| --- | --- |
| `app/use-level-editor.ts` | One editor instance: document state, project persistence, domain composition and existing editing operations |
| `app/workspace-definitions.ts` | The six fixed workspace contributions; main and inspector views are supplied at composition time |
| `core/use-editor-selection.ts` | Selection, active workspace/pane and other temporary UI state |
| `core/feature-registry.mjs` | Contribution identity and unique native-class ownership; no document mutation |
| `core/edit-commands.mjs` | Synchronous compound edits, rollback on failure and instance-scoped change subscriptions |
| `core/edit-history.mjs` | Bounded document snapshots, undo/redo and redo-branch invalidation |
| `features/document/document-codec.ts` | Native import/export orchestration, original snapshot handling and object reconciliation |
| `features/board/board-editing.ts` | Board tools and placement commands |
| `features/waves/event-definitions.mjs` | Native wave-event classes, labels and creation defaults |
| `features/waves/event-editors.ts` | Native-class editor registration, including scheduler children |
| `features/{level,board,waves,seed,assets,validation}/` | Feature views and feature-specific logic |
| `features/assets/catalog.ts` | Shared type/property/almanac resolution through `game-data` entry modules |
| `features/assets/local-assets-codec.mjs` | Native local types, cloned properties and collision-free aliases |
| `ui/WorkbenchLayout.vue` | Desktop columns, narrow-screen pane switching and focus layout |
| `workspace.css` | Shared workbench tokens, layout and control presentation |
| `ui/{legacy-controls,feature-controls}.css` | Existing specialized controls retained during the shell migration |

The existing root `*-codec.mjs` modules remain the stable native-data boundaries. Moving the UI does not replace their preservation rules.

## Three separate mechanisms

- **Registration** describes a workspace or a native event editor. Add a workspace definition and its main/inspector adapters at the composition root. Add an event definition and its `objclass` editor contribution in the waves feature. Duplicate IDs or native-class owners fail immediately.
- **Document edits** go through `runEdit(id, operation)` for compound operations. Nested commands commit once; a thrown operation restores the previous document. Direct form fields retain the existing deep-watch history and autosave behavior. UI selections do not create document history.
- **Game events** are native JSON objects and references. They are not browser timers or editor notification events. Schedulers retain their native child references and unknown fields.

`editCommands.subscribe(listener)` returns an unsubscribe function. Notifications belong to one editor instance and are disposed when it unmounts. There is no global mutation event bus.

The library shows the destination of an add operation. In waves this follows the selected row, event pool, scheduler child, difficulty or generator pool. In seed banks it follows the active list or deck. The library opens almanac previews beside the source row or in a narrow-screen sheet. Closing returns focus to that row. Preview data comes from the inspected type and its native properties, independently of the active editor selection. The board, wave and seed views expose their workspace components; their field renderers remain internal.

## Native assets and fidelity

A local variant contains a native `PlantType` / `ZombieType` and a complete cloned property object in `CurrentLevel`. Shared catalogs are never edited. Bare plant and placement aliases and zombie RTIDs keep the representation required by their native fields. Creating a variant reserves core, wave, rule, objective and opaque-object aliases. Imported variants that use shared properties remain read-only until explicit localization is implemented.

Import snapshots retain unknown fields, object envelopes, array order and unresolved references. Unchanged export returns the imported document; editing a known domain reconciles that domain while retaining other native objects. JSON whitespace and JSON5 source formatting are not retained.

## Validation

Run directly, without adding package script aliases:

```sh
node --test src/components/level-editor/*.test.mjs src/components/level-editor/core/*.test.mjs src/components/level-editor/features/*/*.test.mjs
node scripts/check-level-editor-wave-roundtrip.mjs
pnpm docs:build
```

The workbench migration was also checked through the actual Vue editor against all 1,332 official level files: unchanged import/export and name-only edits both preserved every other value. Browser checks cover board placement, undo/redo, native events, local variants, narrow layouts and four locales.

Two pre-existing template-freshness tests currently compare template metadata `0.16.26` against shared tool metadata `0.16.24`. They are unrelated to workbench rendering and must not be hidden by weakening tests or silently changing versions.
