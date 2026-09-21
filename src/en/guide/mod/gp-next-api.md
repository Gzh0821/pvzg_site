---
title: JavaScript API guide
icon: toolbox
pageInfo: false
index: true
order: 10
---

# JavaScript mod API

API version **2**. `ctx` is provided to `setup(ctx)` inside your mod; these examples cannot be pasted into the console without a mod context.

[Complete parameters, callbacks and return types](./gp-next-api-reference.md) · [Download type declarations](/downloads/mods/gp-next-api.d.ts)

| Task | API |
| --- | --- |
| Mod identity and compatibility | `meta`, `compat` |
| Timers and cleanup | `runtime`, `clock` |
| Player options and buttons | `settings`, `controls` |
| Persistent progress | `storage` |
| Packaged and dependency files | `files` |
| Communication | `events`, `services` |
| Board, entities and teams | `board`, `entities`, `teams` |
| Damage, healing, effects and impacts | `actions`, `combat`, `status`, `impacts` |
| Spawning | `spawns` |
| Game state and saves | `scenes`, `game`, `player`, `levels`, `garden` |
| Game data | `content`, entity data domains, `worldMap`, `localization` |
| Messages | `ui`, `log` |
| Startup content | `startup(ctx)`: [assets guide](./gp-next-resources.md) |

## Results and lifetimes

Check `supports()` or `getCapabilities()` before assuming an action is available. For `{ ok, reason }` results, branch on `ok`; `required: true` requests an exception where supported. Getter results are snapshots: editing them does not edit the game.

Entities can disappear. Check `isAlive()` before delayed work. Subscriptions normally return a cancellation function and stop when the mod unloads. Supported options accept `{ signal, label }`; an entity's `signal` cancels work when that entity disappears.

## Timers

`runtime.sleep/setTimeout/setInterval` use real milliseconds. `clock.sleep/setTimeout/setInterval` use game seconds and follow pause/speed. `clock.onTick` reports game time updates. Use `runtime.onDispose` for your cleanup, `signal` for cancellation, `track` for asynchronous work and `guard` for callbacks that must stop with the mod.

```js
ctx.clock.setInterval(() => ctx.log.info(ctx.game.getState().phase), 1)
```

## Settings and controls

`settings.defineSchema({ fields })` supports toggle, number, slider, select and text fields. Read with `get/getAll`, write with `set/reset/import`, export with `export`. See `SettingField` in the reference.

`onChange` receives successful changes with `previous`, `values`, `operation`, `namespace`. `onApply` handles a player's settings application; use the provided `values` rather than reading the old values during the callback. Changes that cannot be applied immediately require restart.

`controls.definePanel({ title, groups })` supports action, toggle, select, number, text and readonly items. Actions use `onClick`; value controls use `getValue/setValue`. `clear()` removes your panel. See the [working button example](./gp-next-js.md).

## Storage

```js
const history = await ctx.storage.open({
  scope: 'global', version: 1, defaults: { launches: 0 },
  validate: value => Number.isSafeInteger(value?.launches)
})
await history.update(value => ({ launches: value.launches + 1 }))
const saved = await history.read()
```

Use global for data intentionally shared across local saves; use save for progress belonging to the loaded player. Reopen after switching saves. Store JSON values only, not undefined, functions or game objects. Schema changes require an increased positive integer version and `migrate(value, oldVersion, newVersion)`. Validation must return true. Unloading does not erase committed data. Native save export/cloud sync does not automatically include mod-owned data.

## Files and dependencies

```js
const own = ctx.files.own()
const paths = own.listPaths()
const text = await own.readText('data/options.json')
const bytes = await own.readBytes('assets/icon.png')
```

Missing files return null. Paths are relative to the pack root; absolute paths and parent traversal are rejected. `files.from('author.library')` needs that direct dependency in depends or optionalDepends. `contributions()` lets a framework read compatible data-only content packs that depend on it. Reading arbitrary installed mods or player files is not allowed.

## Board and entities

Rows and columns start at zero. `board.getCell/listCells/getNeighbors` query actual cells; do not assume every level is 5×9. `resolveCell` finds a subject's cell and `distance` supports euclidean, manhattan and chebyshev grid distance.

`entities.list/findNearest/listInLane/listInCell` return handles. Queries support kind, laneIndex, columnIndex, codename, team, targetTeam, capabilities and filter. Use `watch` for presence/changes and `watchHealth` for health changes.

```js
for (const plant of ctx.entities.list({ kind: 'plant', alive: true, capabilities: ['heal'] })) {
  const hp = plant.getHealth()
  if (hp?.max != null && hp.current < hp.max) {
    const result = plant.heal(25)
    if (!result.ok) ctx.log.warn(result.reason)
  }
}
```

Health has primary current/max and optional secondary armor/shell health. Unknown maxima are null. Handle actions include damage, heal, eliminate, collect and moveToCell. `teams.getState` distinguishes allegiance from targeting side; querying does not change kind.

## Combat, status and impacts

Damage/healing `ok` reports a successful call; `accepted` and `appliedAmount` describe the observed change. `combat` exposes damage requests and modifiers; see `CombatApi` and its modifier definitions for matching and priorities.

Use `status.supports` before applying a status descriptor. `status.layers` owns timed/stacked effects per mod. Available descriptors and rules are listed in the reference; effects do not all share one stacking behavior.

`impacts.watch` observes supported projectile contacts, including source, target and before/after snapshots. Check capabilities first; special or delayed attacks are not all observable.

## Spawn

```js
const result = await ctx.spawns.spawn({
  kind: 'resource', type: 'sun.small', at: { laneIndex: 2, columnIndex: 2 }
})
if (result.ok) {
  ctx.log.info(result.entities[0].snapshot())
  // When no longer needed: await result.dispose()
} else ctx.log.warn(result.reason)
```

Supported kinds are plant, zombie, tomb, tile-liquid, projectile and resource; check current support. Types must already exist, including new types registered by content frameworks. Projectile descriptors additionally require targetSide and linear motion, with velocity in columns/lanes per game second. See `SpawnDescriptor`.

Common resources include sun.tiny/small/mid/large, coin.silver/gold, gem, sprout and plant-food. Results provide an entities array and dispose(). Disposal is cleanup, not a player kill or reward collection.

## Game and data

`game.getState/watchState` expose outside, preparing, running, paused, waiting, won, lost and ended phases. `setSpeedUp` uses the native 1×/1.5× toggle. `scenes.getName/is` identifies scenes.

`player` modifies properties, currency, sun and related values; some writes persist and are not undone by unloading. See `levels` and `garden` for their supported operations.

`content` reads, queries, exports and mutates data. Use mutate APIs for writes, not getter snapshots. plants/zombies include features, props, types and almanac; projectiles/armors/dinosaurs include features, props and types. Other domains cover tiles, tileLiquids, tombs, lawns, levelModules, shop, upgrades, trophies and gameMetadata. worldMap covers world data; localization covers translations and language.

Prefer JSON patches for fixed changes. Data edits may require a new level or restart to affect existing objects.

## Events and services

Use events.on/once to subscribe and emit/emitAsync for custom events. Names without mod: are private to the mod; use a shared mod:protocol:event name for shared messages. Built-in game events cannot be forged.

`services.provide({ id, version, api })` exposes an object of functions. `resolve(id, { minVersion, maxVersion, capabilities, required })` returns a result; check ok before using service.api. Handles expire when either mod stops and must be reacquired.

## Messages and advanced access

Use ui.toast for brief feedback and log.info/warn/error for diagnostics. compat checks features and versions. gpn.reload is not a promise of arbitrary asset hot replacement.

advanced and unsafe access version-dependent game objects. Method hooks use `unsafe.hooks.wrapMethod({ target, methodName, handler, priority })`; handlers receive args, thisArg, callNext and callBase. callNext preserves other hooks, while callBase skips them. wrapProperty, wrapModuleExport and defineCleanup are also available. Unloading removes registered hooks, not arbitrary persistent changes. Test these mods against each supported game version.

## Practical patterns

- [A setting controls periodic healing](./gp-next-api-reference.md#settingsapi)
- [Observe new entities](./gp-next-api-reference.md#entitiesapi)
- [Remove only your own slow effect](./gp-next-api-reference.md#statuslayerapi)
- [Read JSON from your package](./gp-next-api-reference.md#packfilesapi)
- [Persist and migrate mod data](./gp-next-api-reference.md#modstorageapi)
- [Share a versioned service](./gp-next-api-reference.md#servicesapi)
- [Call a dependency service](./gp-next-api-reference.md#servicesapi)
- [Understand Hook chaining](./gp-next-api-reference.md#modcontext)
