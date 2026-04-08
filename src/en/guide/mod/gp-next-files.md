---
title: Structure
icon: folder-tree
pageInfo: false
index: true
order: 2
---

# Structure and Priority

All GP-Next mod files are stored in the `gp-next/` folder inside the game's data directory.

You can open the **Patcher** page in game and click "Open Folder" to jump there directly.

## Folder Layout

```text
com.pvzge.app/
└── gp-next/
    ├── settings.json
    ├── packs/
    │   ├── MyPack/
    │   │   ├── pack.json
    │   │   └── jsons/
    │   │       ├── features/
    │   │       ├── lang/
    │   │       ├── objects/
    │   │       ├── levels/
    │   │       └── worldmap/
    │   └── AnotherPack.zip
    ├── patches/
    │   └── jsons/
    │       ├── features/
    │       ├── lang/
    │       ├── objects/
    │       └── levels/
    └── __gpn_edits/
```

## What Each Folder Does

### `packs/`

This is the main folder you should use most of the time.

- It can contain full datapack folders
- It can also contain `.zip` packs directly
- It is suitable for complete mods, long-term maintenance, and sharing with other players

If you are making a runtime world-map replacement, you may also have:

- `jsons/worldmap/gpn-worldmap.json5`

This is not the same as a normal `features/WorldmapFeatures.json5` patch. The former changes the runtime map graph, while the latter changes raw world data.

### `patches/`

This is the legacy folder for loose JSON patches.

- It mainly exists for older workflows
- It does not require a `pack.json`
- It has higher priority than `packs/`

If you only want to test a single JSON file quickly, this folder is convenient. If you plan to maintain or share the mod, `packs/` is the better place.

### `__gpn_edits/`

This is where **manual edits from the Data page** are saved.

- Data changed directly in game will be written here
- It has the highest priority
- It is useful for quick experiments and fine-tuning
- It is not a good format for publishing a complete mod

### `settings.json`

This is GP-Next's local settings file.

It mainly stores:

- datapack order
- disabled packs
- other local UI-related settings

## Priority

The override order in GP-Next can be summarized like this:

1. `packs/`
2. `patches/`
3. `__gpn_edits/`

In other words, later sources have higher priority.

## Extra Rules

### Inside `packs/`

Multiple datapacks in `packs/` are loaded according to the saved order and enabled state. Within the same layer, GP-Next also checks the `priority` value in `pack.json`.

In practice, the two rules to remember are:

- smaller `priority` values load earlier
- content loaded later can override content loaded earlier

### `patches/`

`patches/` is designed to preserve older workflows, so it always overrides regular datapacks.

### `__gpn_edits/`

These are edits you made directly in the Data page, so the system treats them as the final override layer.

## How To Split Things

### `packs/`

- mods you plan to maintain long term
- content you want to share with other players
- complete mods with multiple files, multiple types, descriptions, and thumbnails

### `patches/`

- single-file experiments
- temporary content while migrating from an old gePatcher workflow

### `__gpn_edits/`

- quick value tests
- temporary fixes
- checking whether a field has the effect you expect

## Next

- [Merge Rules](./gp-next-merge.md)
- [Datapacks and `pack.json`](./gp-next-datapack.md)
- [World Map](./gp-next-worldmap.md)
