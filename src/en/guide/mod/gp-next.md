---
title: GP-Next Overview
icon: toolbox
pageInfo: false
index: true
order: 1
---

> [!tip]
> This page applies to official releases starting from version `0.7.1`.

# GP-Next

GP-Next is the built-in modding, debugging, and runtime utility panel in PvZ2 Gardendless. The following features are integrated into the same interface:

- **Patcher**: manages `packs/`, `patches/`, manual edits, and patch reloads
- **Data**: browses, compares, exports, restores, and edits live game data
- **Trainer**: provides modifier features in battle, world map, and sandbox scenes
- **Cloud**: uploads, downloads, and compares cloud saves
- **Settings**: includes language, frame rate, scroll tweaks, Runtime Extensions, HP Overlay, and more
- **Guide / About / Log**: built-in docs, console command references, and runtime logs

If you installed an official release, GP-Next is already included. In game, press `F10` or click the top-left button to open the panel.

## What You Need

1. A JSON editor, such as VSCode or Notepad++
2. Basic familiarity with JSON structure

If you plan to edit plants, zombies, store data, or language content, it is useful to keep these two pages open:

- [Source Data](./gp-next-json.md)
- [Types & Fields](./format.md)

## Quick Start

### 1. Open the Panel

- enter the game
- press `F10`
- open the **Patcher** page

### 2. Open the Folder

In the **Patcher** page, click "Open Folder" to enter the `gp-next/` folder inside the game data directory.

### 3. Create a Datapack

The recommended workflow is to put your changes into `packs/your-mod-name/pack.json` and `jsons/`, instead of scattering loose JSON files everywhere.

### 4. Reload Patches

Go back to the in-game **Patcher** page and click **Save & Reload**, or restart the game.

### 5. Verify the Result

If you are not sure whether the patch worked, open the **Data** page, locate the target entry, and inspect the current runtime data directly.

## What To Read Next

The GP-Next docs are split by topic:

- first read [Structure and Priority](./gp-next-files.md)
- then read [Merge Rules](./gp-next-merge.md)
- then read [Datapacks and `pack.json`](./gp-next-datapack.md)

If you are building a translation pack, continue with [Language Packs and `lang.json`](./gp-next-language.md).

If you are building plant level lines, level badges, or almanac level pages, continue with [Plant Levels](./gp-next-plant-level.md).

If you want to change world-map node order, branches, gift boxes, portals, or the overall runtime map structure, continue with [World Map](./gp-next-worldmap.md).

If you care more about in-game operations than file structure, go directly to:

- [Data and Trainer](./gp-next-tools.md)
- [Settings & Extensions](./gp-next-settings.md)
- [Console API](./gp-next-console.md)

## Key Points

- `packs/` supports both **folders** and **`.zip`**
- `patches/` still exists mainly for compatibility with older single-file workflows
- manual edits from the Data page are written into `__gpn_edits/`, which has the highest priority
- arrays in GP-Next are **replaced as a whole** by default, not merged by index
- `reloadPatches()` is often enough for many runtime extensions; a full restart is not always required
- the footer shows the GP-Next version and can check for updates from the official site

If you still do not know what the original JSON of a type looks like, read [Source Data](./gp-next-json.md) first. That page is the best place to inspect structure before coming back for field details.

## Next

- [Structure and Priority](./gp-next-files.md)
- [Merge Rules](./gp-next-merge.md)
- [Datapacks and `pack.json`](./gp-next-datapack.md)
- [Plant Levels](./gp-next-plant-level.md)
- [World Map](./gp-next-worldmap.md)
