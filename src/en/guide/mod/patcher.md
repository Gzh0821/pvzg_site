---
title: GE Patcher Tutorial (latest)
icon: wrench
pageInfo: false
index: true
order: 1
---

<script setup>
    import { onMounted } from 'vue';
    onMounted(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    })
</script>

> [!warning]
> This tutorial is only works for versions `0.3.X`-`0.6.X`.

GE Patcher is a tool for modifying PvZ2 Gardendless game data, supporting custom changes to plants, zombies, grid items (GridItem), projectiles, upgrades, shop, levels, and more.

It is recommended to use the official build with GE Patcher already included.

## Prerequisites

1. JSON editor (VSCode/Notepad++ recommended)
2. Game version ≥ 0.3.0
3. [Property Reference](format.md).

<ins class="adsbygoogle"
style="display:block"
data-ad-client="ca-pub-2336226859954206"
data-ad-slot="6758794743"
data-ad-format="auto"
data-full-width-responsive="true">
</ins>

## GE Patcher Basics

Press `F12` when the game starts to open the developer console. In the Console tab, you should see output like:

```text
[GE Patcher] BaseDir: C:\Users\admin\AppData\Local\com.pvzge.app
```

This is the main directory for GE Patcher. Run the following command to view help and see the patch directory:

```javascript
gePatcher.help()
```

After the game loads, use these commands to load/apply patches:

```javascript
// Load game resources only (does not apply patches)
gePatcher.initBase()

// After initBase, load patch files
gePatcher.initPatchs()

// Load both resources and patch files (combines above steps)
gePatcher.init()
```

After modifying JSON files, rerun the above commands to apply changes (`init()` includes base check).

Other useful functions:

```javascript
// List original level IDs
gePatcher.showLevels()

// Set custom framerate (dangerous, may cause crashes)
gePatcher.setFrameRate(30)

// Modify a single property of an entity
gePatcher.setPropsData('PlantProps', 'peashooter', 'ShootInterval', 1.2)

// Merge multiple properties (pass an object)
gePatcher.setPropsData('PlantProps', 'peashooter', { ShootInterval: 1.2, SunCost: 75 })
```

## File Structure

Create a `patches` folder under `com.pvzge.app` with the following structure:

```
patches/
└── jsons/
    ├── features/
    │   ├── PlantFeatures.json
    │   ├── PlantProps.json
    │   ├── PlantAlmanac.json
    │   ├── ZombieFeatures.json
    │   ├── ZombieProps.json
    │   ├── ZombieAlmanac.json
    │   ├── GridItemFeatures.json
    │   ├── GridItemProps.json
    │   ├── GridItemTypes.json
    │   ├── ProjectileProps.json
    │   ├── ProjectileTypes.json
    │   ├── UpgradeFeatures.json
    │   ├── PropertySheets.json
    │   └── StoreCommodityFeatures.json
    └── levels/
        └── [LevelName].json
```

Notes:
- The `features` directory contains Features/Props/Types/Almanac files for modifying entities.
- New patcher versions support GridItem and Projectile Props/Types, and `PropertySheets.json` for property sheets.
- You do not need to create files for content you do not modify.

## Features Files

Features files are used to merge/modify metadata for entities (plants, zombies, grid items, upgrades, etc).

### Example Features Files

**PlantFeatures.json**

```json
{
  "PLANTS": [
    {
      "CODENAME": "peashooter"
    }
  ],
  "SEEDCHOOSERDEFAULTORDER": ["peashooter", "sunflower"],
  "BASEUNLOCKLIST": ["peashooter", "sunflower"]
}
```

**ZombieFeatures.json**

```json
{
  "ZOMBIES": [
    {
      "CODENAME": "tutorial"
    }
  ]
}
```

**UpgradeFeatures.json**

```json
{
  "UPGRADES": [
    {
      "CODENAME": "upgrade_starting_sun_lvl1"
    }
  ]
}
```

**GridItemFeatures.json / StoreCommodityFeatures.json** follow similar structure, using the original game's codename/identifier.

### Features Merge Rules (Summary)

- Match by CODENAME (or identifier), then merge user object into the original entity.
- Primitive fields overwrite; objects are merged recursively; arrays are merged by element order (primitive arrays overwrite).
- Top-level arrays like `SEEDCHOOSERDEFAULTORDER`/`BASEUNLOCKLIST` are replaced entirely.

**Important:** GE Patcher only modifies existing entities; it cannot create new ones. Avoid changing critical identifiers (e.g. `ID`, `_CARDSPRITENAME`).

## Props / Almanac / Types Files

These files modify entity stats, Almanac info, or type tables:

- `PlantProps.json` / `ZombieProps.json`: gameplay stats (`PlantProperties` / `ZombieProperties`).
- `PlantAlmanac.json` / `ZombieAlmanac.json`: Almanac display info (does not affect gameplay stats).
- `GridItemProps.json` / `GridItemTypes.json`: grid item properties/types.
- `ProjectileProps.json` / `ProjectileTypes.json`: projectile properties/types.
- `PropertySheets.json`: override or supplement property sheets.

### Example Props File (PlantProps.json)

```json
{
  "objects": [
    {
      "aliases": ["peashooter"],
      "objclass": "PlantProperties",
      "objdata": {
        "ShootInterval": 1.35,
        "ShootIntervalAdditional": 0.15,
        "PlantfoodPeaCount": 60,
        "Cooldown": 5,
        "SunCost": 100,
        "Toughness": 300
      }
    }
  ]
}
```

### Example Almanac File (PlantAlmanac.json)

```json
{
  "objects": [
    {
      "aliases": ["peashooter"],
      "objclass": "PlantAlmanacProperties",
      "objdata": {
        "Elements": [
          { "TYPE": "SUNCOST" },
          { "TYPE": "DAMAGE", "VALUE": 20 }
        ],
        "Introduction": { "en": "Peashooters are...", "zh": "豌豆射手是..." }
      }
    }
  ]
}
```

### Merge Rules

- Same as Features: match by `aliases` (first item), then merge `objdata` recursively. Only provide fields you want to change.

## Level Files

Custom levels go in `patches/jsons/levels/[LevelName].json`.

- Filenames must match the in-game level ID (e.g. `egypt1.json`).
- Use `gePatcher.showLevels()` to view available level IDs (after initializing GE Patcher).

## Store Files

`StoreCommodityFeatures.json` is used to replace/modify shop categories:

```json
{
  "Plants": [],
  "Upgrade": [],
  "Gem": [],
  "Coin": []
}
```

You can omit categories you do not modify.

## Debugging & Troubleshooting

1. Check the console (F12) for error logs.
2. Common errors:
   - ❌ `Failed to load...`: usually a JSON syntax error.
   - ❌ `Level file not found`: filename or path mismatch.
3. Validate JSON files with [JSONLint](https://jsonlint.com/) or VSCode JSON plugins.

Tips:
- Run `gePatcher.help()` in the console to print the patch base directory (e.g. `C:\Users\admin\AppData\Local\com.pvzge.app\patches`) and supported paths.
- Make sure to run `gePatcher.init()` or at least `gePatcher.initBase()` after resources are fully loaded (the script checks asset count).
- If changes do not apply, rerun `gePatcher.init()` or `gePatcher.initPatchs()` and check the console for errors.

