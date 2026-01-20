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
> The following tutorial applies only to versions `0.3.X`-`0.6.X`.

GE Patcher is a tool used to modify game data for PvZ2 Gardendless, supporting custom modifications for plants, zombies, grid items (GridItem), projectiles (Projectile), upgrades, store commodities, and levels.

It is recommended to use the built-in version of GE Patcher (included in the official release).

## Prerequisites

1. JSON Editor (VSCode/Notepad++ recommended)
2. Game Version ≥ 0.3.0
3. For JSON property structures of plants, zombies, etc., please refer to [Property Reference](format.md)

<ins class="adsbygoogle"
style="display:block"
data-ad-client="ca-pub-7637695321442015"
data-ad-slot="7113006248"
data-ad-format="auto"
data-full-width-responsive="true">
</ins>

## GE Patcher Basics

Open the developer interface by pressing "F12" when the game starts. In the Console tab, you will see output similar to the following:

```text
[GE Patcher] BaseDir: C:\Users\admin\AppData\Local\com.pvzge.app
```

The path above is the main directory for GE Patcher (example). Run the following command in the console to view help information and output the patches directory:

```javascript
gePatcher.help()
```

GE Patcher also automatically loads the cloud save module (`window.cloudSaver`).

After the game finishes loading, run the following commands to load/apply patches:

```javascript
// Load base assets, does not load patch files
gePatcher.initBase()

// After calling initBase, you can call initPatchs() to load patch files
// Call this function again to apply changes after modifying JSON files
gePatcher.initPatchs()

// Load both base assets and patch files, equivalent to combining the two steps above
gePatcher.init()
```

Other common function examples:

```javascript
// List original level IDs in the game
gePatcher.showLevels()

// Set custom frame rate (dangerous operation, may cause crashes or performance issues)
gePatcher.setFrameRate(30)

// Modify a single property of a single entity (example)
gePatcher.setPropsData('PlantProps', 'peashooter', 'ShootInterval', 1.2)

// Merge multiple properties (pass an object)
gePatcher.setPropsData('PlantProps', 'peashooter', { ShootInterval: 1.2, SunCost: 75 })

// Data management and export
gePatcher.listOrigins()             // List saved original JSON data
gePatcher.exportJson('PlantFeatures', false) // Export current PlantFeatures data (second arg true exports original JSON, third arg true downloads file, false outputs to console)
gePatcher.restoreOriginal('PlantFeatures')   // Restore PlantFeatures to original JSON data
gePatcher.restoreAll()              // Restore all data
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
    │   ├── PlantTypes.json
    │   ├── ZombieFeatures.json
    │   ├── ZombieProps.json
    │   ├── ZombieAlmanac.json
    │   ├── ZombieTypes.json
    │   ├── BoardGridMaps.json
    │   ├── ProjectileProps.json
    │   ├── ProjectileTypes.json
    │   ├── UpgradeFeatures.json
    │   ├── PropertySheets.json
    │   ├── NarrativeList.json
    │   └── StoreCommodityFeatures.json
    └── levels/
        └── [LevelName].json
```

Description:

- The `features` directory contains various Features/Props/Types/Almanac files for modifying metadata and behavior of game entities.
- Files for modifying original content do not need to be created if unchanged.

## Features Files

Features files are used for merging metadata modifications for entities (plants, zombies, grid items, upgrades, etc.).

### Common Features Examples

**PlantFeatures.json** (Example):

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

**ZombieFeatures.json** (Example):

```json
{
  "ZOMBIES": [
    {
      "CODENAME": "tutorial"
    }
  ]
}
```

**UpgradeFeatures.json** (Example):

```json
{
  "UPGRADES": [
    {
      "CODENAME": "upgrade_starting_sun_lvl1"
    }
  ]
}
```

**GridItemFeatures.json / StoreCommodityFeatures.json**, etc., have similar structures, providing the CODENAME/Identifier of the item to be modified according to the original game structure.

### Features Merging Rules (Summary)

- Match existing entities by CODENAME (or corresponding identifier), then merge the user-provided object with the original object.
- Primitive type fields are overwritten directly; object types are merged recursively; array types are merged by element order (if array elements are primitive types, they are overwritten).
- For top-level array fields like `SEEDCHOOSERDEFAULTORDER`, `BASEUNLOCKLIST`, the original array will be replaced directly.

Important: GE Patcher only modifies existing entities and does not create brand new entity entries. Try to avoid modifying key identifiers (e.g., `ID`, `_CARDSPRITENAME`, etc.).

## Props / Almanac / Types Files

These files are used to modify specific numerical values, almanac information, or type tables for entities:

- `PlantProps.json` / `ZombieProps.json`: Modify numerical properties (`PlantProperties` / `ZombieProperties`).
- `PlantAlmanac.json` / `ZombieAlmanac.json`: Modify almanac display information (does not change actual combat stats).
- `PlantTypes.json` / `ZombieTypes.json`: Define type data for plants/zombies.
- `ProjectileProps.json` / `ProjectileTypes.json`: Projectile/bullet related properties and type definitions.
- `NarrativeList.json`: Modify storyline dialogue lists.
- `PropertySheets.json`: Overwrite or supplement certain property sheets.

### Props File Example (PlantProps.json)

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

### Almanac Example (PlantAlmanac.json)

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

### Merging Rules

- Same as Features: Match target entity by `aliases` (first item in array), then recursively merge `objdata`. If you only want to modify certain fields, provide only the properties that need modification.

## Level Files

Custom levels are placed in `patches/jsons/levels/[LevelName].json`.

- The filename must match the in-game level ID (e.g., `egypt1.json`).
- Use `gePatcher.showLevels()` in the console to view available level IDs (requires initializing GE Patcher first).

## Store Files

`StoreCommodityFeatures.json` is used to replace/modify store item categories:

```json
{
  "Plants": [],
  "Upgrade": [],
  "Gem": [],
  "Coin": []
}
```

Categories not needing modification can be omitted.

## Debugging and Common Troubleshooting

1. Check error logs in the console (F12).
2. Common errors:
   - ❌ `Failed to load...`: Usually a JSON syntax error.
   - ❌ `Level file not found`: Filename or path mismatch.
3. Verify JSON: Use [JSONLint](https://jsonlint.com/) or VSCode JSON validation plugin.
4. Get reference: Use commands like `gePatcher.exportJson('PlantProps', true)` to export original game data and compare structural differences.

Troubleshooting suggestions:

- First run `gePatcher.help()` in the console to output the base patch directory (example: `C:\Users\admin\AppData\Local\com.pvzge.app\patches`) and the list of supported paths to ensure files are in the correct location.
- Run `gePatcher.init()` only after game resources are fully loaded, or run `gePatcher.initBase()` first and wait for completion (the script checks resource count and warns if not loaded).
- If changes do not take effect, confirm that you have re-executed `gePatcher.init()` or `gePatcher.initPatchs()` and check console output to locate errors.

