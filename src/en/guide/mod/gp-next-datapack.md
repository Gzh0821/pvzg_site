---
title: Datapacks
icon: box-archive
pageInfo: false
index: true
order: 4
---

# Datapacks and `pack.json`

If you want your changes to look and behave like a proper mod instead of a few loose JSON files, the recommended way is to use a datapack.

## Minimal Structure

```text
MyFirstMod/
├── pack.json
└── jsons/
    ├── features/
    ├── lang/
    ├── objects/
    ├── levels/
    └── worldmap/
```

Here, `pack.json` is required.

## `pack.json` Template

```json
{
  "uuid": "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
  "name": "My Custom Mod",
  "version": "1.0.0",
  "priority": 100,
  "description": "Description of the mod",
  "author": "Your name",
  "formatVersion": 1,
  "gameVersion": "0.7.1",
  "gpNextVersion": ">=1.0.0"
}
```

## Field Reference

### `uuid`

The unique identifier.

It matters because GP-Next uses it to remember:

- whether the pack is enabled
- where the pack appears in the load order

You can generate one directly from the **Guide** page in game.

### `name`

The name shown in Patcher.

### `version`

The version number of your own mod.

### `priority`

Default load priority. Smaller numbers load earlier.

### `description`

Short description of the mod.

### `author`

Author name.

### `formatVersion`

For now, just write `1`.

### `gameVersion`

The game version your mod targets.

### `gpNextVersion`

The minimum GP-Next version required by your mod.

## Thumbnail

You can place these files next to `pack.json`:

- `thumbnail.png`
- `thumbnail.ico`

Requirements:

- square image
- smaller than `128x128`

Patcher will then show it as the pack cover image.

## Folder and ZIP Support

`packs/` supports both:

- folders
- `.zip` files

## Basic Workflow

1. Create a new folder under `packs/`
2. Write `pack.json`
3. Create `jsons/` and its subfolders
4. Put your patch JSON files inside
5. Go back to the game and click **Save & Reload**

## What `worldmap/` Is For

If you want to change the runtime world-map node graph rather than ordinary `WorldmapFeatures` raw data, you will also use:

```text
jsons/worldmap/gpn-worldmap.json5
```

This feature is currently still classified as **Experimental** inside GP-Next, so you need to enable it first on that page.  
For the actual format, see [World Map](./gp-next-worldmap.md).

## Sharing

The most common way to share a datapack is as a ZIP file.

The ZIP should look like this:

```text
MyFirstMod.zip
├── pack.json
└── jsons/
```

not like this:

```text
MyFirstMod.zip
└── MyFirstMod/
    ├── pack.json
    └── jsons/
```

## Things To Watch in `pack.json`

- once a `uuid` is generated, do not change it casually
- `name` is player-facing, so keep it clear
- `description` should explain what the pack changes
- update `version` when you publish important changes

## Next

- [Language Packs and `lang.json`](./gp-next-language.md)
- [Data and Trainer](./gp-next-tools.md)
