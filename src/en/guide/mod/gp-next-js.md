---
title: Writing JavaScript mods
icon: toolbox
pageInfo: false
index: true
order: 9
---

Use JSON for fixed data or translation changes. Use JavaScript for gameplay behavior, controls and reading custom assets.

Create `pack.json` and `scripts/main.js`:

```json
{
  "uuid": "yourname.hello", "name": "Hello mod", "version": "1.0.0",
  "packFormatVersion": 1, "apiVersion": 2,
  "gpNextVersion": ">=1.5.2", "js": { "entry": "scripts/main.js" }
}
```

```js
export default {
  setup(ctx) {
    ctx.controls.definePanel({
      title: 'Hello', groups: [{ title: 'Actions', items: [{
        type: 'action', key: 'hello', label: 'Say hello',
        onClick: () => ctx.ui.toast('Hello!', 'success')
      }] }]
    })
  }
}
```

ZIP both files with their directories. First enable Experimental → JS Modding after confirming the risk notice, then import, enable the mod and apply. Open the mod's details to use its button. Keep the same uuid and increase the mod version for updates.

Value controls use `getValue()` / `setValue(value)`, not `value/onChange`. Use settings for player options, storage for progress, and files to read packaged assets. Disabling a mod does not undo committed progress or currency changes.

## Updating existing mods and checking types

Read the [property hook migration guide](./gp-next-api.md#property-hooks-and-migration) before updating an existing mod. GP-Next 1.5.6 no longer supplies a pre-read `value` to getters: call `callNext()` explicitly. Setter return values do not write. `apiVersion: 2` does not restore legacy behavior.

Download the [updated declarations](/downloads/mods/gp-next-api.d.ts) beside your entry file. JavaScript authors can enable `// @ts-check` and annotate the setup context so their editor checks callback arguments:

```js
// @ts-check
export default {
  /** @param {import('./gp-next-api').ModContext} ctx */
  setup(ctx) {
    ctx.ui.toast('Mod loaded', 'success')
  }
}
```

The declarations are for development, not a runtime module. Recheck source and rebuild the bundle after an upgrade; changing only the manifest version does not migrate API calls.

A single self-contained JS entry needs no special build tools. Authors using TypeScript, multiple source modules or npm libraries must bundle them into one ES module before distributing the ZIP. Players need no build tools.

[API guide](./gp-next-api.md) · [Full reference](./gp-next-api-reference.md) · [Assets and startup](./gp-next-resources.md)
