---
title: New plants, zombies and assets
icon: toolbox
pageInfo: false
index: true
order: 12
---

# New plants, zombies and assets

## Installing content mods

Install the content mod and every framework listed by its author. Enable JavaScript if required, then restart when prompted. Installing an image or animation file alone does not add a playable entity. Players do not need a compiler or programming tools.

## Authoring assets

GP-Next does not require every mod to use a universal entity JSON format. A framework can define its own content files and read them through `files`.

Assets must match the formats and versions supported by the chosen framework. Placing images, sounds or animation files in a ZIP does not register them automatically; the mod must provide the required loading and registration. Renaming a file extension does not convert an incompatible animation.

## Startup API

Set `js.startup: true`, normally with `js.reloadable: false`, and provide both `startup(ctx)` and `setup(ctx)`. Startup runs before the first scene, when game objects are available.

- `files`: own and declared dependency files.
- `registry.provide(id, value)` / `resolve(provider, id)`: startup framework capabilities; direct dependencies are required.
- `registrations.add(id, { prepare, publish, dispose, getResources? })`: prepare resources asynchronously, publish prepared content synchronously, clean up unpublished work on failure.
- `engine.getCc/getClassByName/getSystemModule/getModuleExport`: version-dependent game objects for advanced authors.
- `runtime` / `log`: tasks, cleanup and messages.

`prepare` receives `previousIdentities` and `identities` and can return `{ identities }`. Plant/zombie identity entries use `id`, `kind`, `codename`, `engineId`. Keep existing content identities stable across upgrades. This does not migrate arbitrary custom save formats.

A startup mod's JS dependencies must also opt into startup. Runtime service sharing uses `ctx.services`. Published new types and assets require a restart when changed or disabled. [Complete startup signatures](./gp-next-api-reference.md#startupcontext).

## Preparation, publication, and rollback

This entry reads data/options.json (for example `{"message":"Ready"}`) and publishes it to the mod’s own variable after preparation. It illustrates timing only; it does not add a plant or import skeletal animation. Prepare real assets through your chosen framework, register synchronously during publish, and release temporary resources in dispose.

```js
let options
export default {
  startup(ctx) {
    const files = ctx.files.own()
    let prepared
    ctx.registrations.add('options', {
      async prepare() {
        const text = await files.readText('data/options.json')
        if (text === null) throw new Error('Missing data/options.json')
        prepared = JSON.parse(text)
        if (typeof prepared.message !== 'string') throw new Error('message must be a string')
      },
      publish() { options = prepared },
      dispose() { prepared = undefined }
    })
  },
  setup(ctx) { ctx.ui.toast(options.message) }
}
```

Do not await file reads or call ctx.engine/ctx.registry during publish. Obtain native objects during startup/preparation and dependency services during startup collection. After publication, follow restart prompts for updates or disabling.
