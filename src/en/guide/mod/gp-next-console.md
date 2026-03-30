---
title: Console API
icon: terminal
pageInfo: false
index: true
order: 8
---

# Console API

When the game is running, GP-Next exposes a global object:

```js
window.gpNext
```

You can call it directly from the developer console.

> [!tip]
> If you are not sure which commands are available, start with:
>
> ```js
> gpNext.help()
> ```

## Before You Use It

- the game has finished loading
- GP-Next has initialized successfully
- you have opened the developer console

If you want to export original `Features`, `Props`, or language JSON before writing a patch, start with [Source Data](./gp-next-json.md).

## Panel

### `gpNext.toggle()`

Shows or hides the GP-Next panel.

No parameters.

### Example

```js
gpNext.toggle()
```

### `gpNext.show()`

Shows the panel.

### `gpNext.hide()`

Hides the panel.

### `gpNext.help()`

Prints command help in the console.

---

## Patches and Status

### `gpNext.init()`

Runs the patch loading process again.

### Return Value

Usually returns the current patch loading result.

### `gpNext.reload()`

Reads patch files from disk again and reapplies them.

This is one of the most commonly used commands.

### Example

```js
await gpNext.reload()
```

### `gpNext.status()`

Shows the current patcher status.

### Main Return Fields

- `loaded`: list of loaded types
- `skipped`: types that were skipped
- `errors`: error list
- `packs`: currently detected datapacks
- `disabledPacks`: disabled datapacks
- `singleFile`: single-file patch information
- `editsPack`: manual edits pack information
- `editsCount`: number of manual edits
- `extraLanguages`: currently registered extra languages
- `plantRegistry`: debug information for the dynamic plant registry

### Example

```js
const status = gpNext.status()
console.log(status.packs)
console.log(status.errors)
```

---

## Data Editing

### `gpNext.setObjectsData(type, alias, key, value)`

Edits a single field in an Objects-type entry.

### Parameters

- `type`: object type name, for example `PlantProps`
- `alias`: primary alias of the target entry, for example `peashooter`
- `key`: field name to edit
- `value`: new value

### Example

```js
gpNext.setObjectsData('PlantProps', 'peashooter', 'SunCost', 50)
```

### `gpNext.setObjectsData(type, alias, patchObject)`

Merges an object into the target entry's `objdata`.

### Parameters

- `type`: object type name
- `alias`: primary alias of the target entry
- `patchObject`: object to merge into the entry

### Example

```js
gpNext.setObjectsData('PlantProps', 'peashooter', {
  SunCost: 50,
  Cooldown: 2
})
```

> [!warning]
> This is a runtime edit. It is good for debugging and quick verification, but it does not automatically create a proper datapack for you.

---

## Export and Restore

### `gpNext.exportJson(type, useOriginal = false, autoDownload = true)`

Exports a JSON type.

### Parameters

- `type`: type name, for example `PlantFeatures`
- `useOriginal`: `true` exports original data, `false` exports current runtime data
- `autoDownload`: `true` opens a save dialog, `false` prints the result to the console

### Example

```js
await gpNext.exportJson('PlantProps')
await gpNext.exportJson('PlantProps', true)
await gpNext.exportJson('PlantProps', false, false)
```

### `gpNext.exportLang(useOriginal = false, autoDownload = true)`

Exports the current language table `MultiLanguage.lyrics`.

### Good Uses

- checking whether a language pack has taken effect
- comparing the current extended language result
- exporting the original language table for comparison

### Example

```js
await gpNext.exportLang()
await gpNext.exportLang(true)
```

### `gpNext.restoreOriginal(type)`

Restores one type back to the original data.

### Example

```js
gpNext.restoreOriginal('PlantFeatures')
```

### `gpNext.restoreAll()`

Restores all backed-up types.

### `gpNext.listOrigins()`

Lists all types that currently have original backups.

### `gpNext.hasOrigin(type)`

Checks whether a type has an original backup.

---

## Game

### `gpNext.setFrameRate(fps)`

Sets the game's frame rate.

### Parameters

- `fps`: number such as `30` or `60`

### Example

```js
gpNext.setFrameRate(60)
```

### `gpNext.setGameSpeed(multiplier)`

Directly changes the underlying time scale.

### Parameters

- `multiplier`: speed value such as `1` or `1.5`

### Example

```js
gpNext.setGameSpeed(1)
gpNext.setGameSpeed(1.5)
```

> [!warning]
> This command exists, but it uses the low-level `_timeScale` path and is not as safe as the native `1x / 1.5x` options in the Trainer page.
> In most cases it is better to switch game speed from the UI.

---

## Cheats

### `gpNext.cheats.setSun(value)`

Directly sets the current sun amount.

### Example

```js
gpNext.cheats.setSun(9999)
```

### `gpNext.cheats.addSun(value = 1000)`

Adds sun.

### Example

```js
gpNext.cheats.addSun()
gpNext.cheats.addSun(500)
```

### `gpNext.cheats.winLevel()`

Triggers an instant win for the current level.

> [!warning]
> In some testing or sandbox scenes, this is better treated as a temporary shortcut than as part of a stable workflow.

---

## Debug

### `gpNext.debug.getPlantRegistry()`

Shows debug information for the dynamic plant registry.

### Useful For

- adding new plants
- cloning plants
- troubleshooting plant identity mapping

### Example

```js
const info = gpNext.debug.getPlantRegistry()
console.log(info)
```

---

## Other

### `gpNext.version`

Current GP-Next version.

### Example

```js
gpNext.version
```

### `gpNext.debug`

This is a debug namespace, not just a boolean switch.

The most commonly used method right now is:

```js
gpNext.debug.getPlantRegistry()
```

## Examples

### Reload patches and inspect status

```js
await gpNext.reload()
console.log(gpNext.status())
```

### Quickly verify plant values

```js
gpNext.setObjectsData('PlantProps', 'peashooter', {
  SunCost: 50,
  Cooldown: 2
})
```

### Export current data to the console

```js
await gpNext.exportJson('PlantProps', false, false)
```

### Export the original language table

```js
await gpNext.exportLang(true)
```
