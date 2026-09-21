---
title: Writing JavaScript mods
icon: toolbox
pageInfo: false
index: true
order: 9
---

# Writing JavaScript mods

Use JSON for fixed data or translation changes. Use JavaScript for gameplay behavior, controls and reading custom assets.

Create `pack.json` and `scripts/main.js`:

```json
{
  "uuid": "yourname.hello", "name": "Hello mod", "version": "1.0.0",
  "packFormatVersion": 1, "apiVersion": 2,
  "minGpNextVersion": "1.5.0-pre.1", "js": { "entry": "scripts/main.js" }
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

ZIP both files with their directories, import, enable JavaScript through the console and apply. Open the mod's details to use its button. Keep the same uuid and increase the mod version for updates.

Value controls use `getValue()` / `setValue(value)`, not `value/onChange`. Use settings for player options, storage for progress, and files to read packaged assets. Disabling a mod does not undo committed progress or currency changes.

A single self-contained JS entry needs no special build tools. Authors using TypeScript, multiple source modules or npm libraries must bundle them into one ES module before distributing the ZIP. Players need no build tools.

[API guide](./gp-next-api.md) · [Full reference](./gp-next-api-reference.md) · [Assets and startup](./gp-next-resources.md)
