---
title: GE Patcher Tutorial(0.2.X)
icon: wrench
pageInfo: false
comment: false
index: true
order: 1
---

<script setup>
    import { onMounted } from 'vue';
    onMounted(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    })
</script>

> [!caution]
> The following tutorial is only applicable to versions `0.2.8.1`-`0.2.9`.

The game includes the GE Patcher tool, which allows loading custom JSON resources and levels.

## Prerequisites

1. Install a JSON editor (recommended: VSCode/Notepad++).
2. Ensure the game version is ≥ 0.2.8.1.
3. Understand JSON basics, such as syntax and data types.
4. Familiarize yourself with the attribute structure of plants, zombies, etc., in JSON (refer to [Attribute Reference](format.md)).

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-7637695321442015"
     data-ad-slot="3900516289"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

## GE Patcher Basics

Press `F12` during game startup to open the developer interface. In the console tab, you will see output similar to:

```
[GE Patcher] BaseDir: C:\Users\admin\AppData\Local\com.pvzge.app
```

Enter the following command to view in-game help, including paths for custom JSON files:

```javascript
gePatcher.help()
```

After the game finishes loading, run this command to load all custom JSON files:

```javascript
gePatcher.init()
```

**Re-execute this command after modifying JSON files to apply changes.**

## File Structure

Create a `patches` folder in `com.pvzge.app` with the following structure:

```
patches/
└── jsons/
    ├── features/
    │   ├── PlantFeatures.json
    │   ├── ZombieFeatures.json
    │   ├── UpgradeFeatures.json
    │   └── StoreCommodityFeatures.json
    └── levels/
        └── [LevelName].json
```

Omit files for unmodified features.

## File Formats

**PlantFeatures.json**: Plant attributes (structure example):

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

**ZombieFeatures.json**: Zombie attributes (structure example):

```json
{
  "ZOMBIES": [
    {
      "CODENAME": "tutorial"
    }
  ]
}
```

**UpgradeFeatures.json**: Upgrade attributes (structure example):

```json
{
  "UPGRADES": [
    {
      "CODENAME": "upgrade_starting_sun_lvl1"
    }
  ]
}
```

**StoreCommodityFeatures.json**: Store item attributes.

#### Key Notes:

- `PLANTS`, `ZOMBIES`, and `UPGRADES` arrays define modifications for existing entities.
- `SEEDCHOOSERDEFAULTORDER` sets the default plant order in the seed selector.
- `BASEUNLOCKLIST` defines initially unlocked plants.

## Plants/Zombies/Upgrades Modifications

For `PlantFeatures`, `ZombieFeatures`, and `UpgradeFeatures`, GE Patcher follows the following rules for processing.

Each object within the `PLANTS` (or `ZOMBIES`, `UPGRADES`) array is merged into the original JSON after matching by the `CODENAME` field. The merging rules are as follows:

- **Array Elements**: If the type of the attribute is an array, each value within the array will be merged in the order of the elements. If the values in the array are objects, they will be merged recursively. If the values in the array are of basic types, they will directly overwrite the values in the original JSON.
- **Object Merging**: If the type of the attribute is an object, a recursive merge will be performed. If there are properties with the same key within the object, the values in the original JSON will be directly overwritten.
- **Basic Attributes**: For basic attributes with the same key, directly overwrite them, i.e., replace the value in the original JSON.

For other fields, such as `SEEDCHOOSERDEFAULTORDER`/`BASEUNLOCKLIST`, etc., directly replace the original array.

Therefore, for any plant/zombie that you want to modify, you need to add an object within the `PLANTS` (`ZOMBIES`) array in the custom JSON file, and the `CODENAME` field of this object must be consistent with the original plant name in the JSON.

For plants/zombies that do not require modification, there is no need to add this object.

In a single plant/zombie object, only `CODENAME` is required. If other fields are not filled in, they will remain unchanged. If they need to be modified, the corresponding fields must be added.

> [!important]
>
> - Avoid modifying critical fields like `ID` or `_CARDSPRITENAME` to prevent crashes.
> - **GE Patcher cannot create new entities; it only modifies existing ones.**

#### Example:

To modify Peashooter's family to "Fire", change its background to "epic", set Sunflower's cost to 25, and reduce cooldown to 1 second:

```json
{
  "PLANTS": [
    {
      "CODENAME": "peashooter",
      "OBTAINWORLD": "epic",
      "objdata": {
        "Family": "Fire"
      }
    },
    {
      "CODENAME": "sunflower",
      "objdata": {
        "SunCost": 25,
        "Cooldown": 1
      }
    }
  ]
}
```

## Level Modifications

Place custom level files in `patches/jsons/levels/[LevelName].json`.

- Filenames must match the in-game level ID (e.g., `egypt1.json`).
- Use `gePatcher.showLevels()` to view original level IDs (requires initializing GE Patcher first).

## Store Modifications

`StoreCommodityFeatures.json` replaces in-game store categories:

```json
{
  "Plants": [], // Plants
  "Upgrade": [], // Upgrades
  "Gem": [], // Gem items (purchased with coins)
  "Coin": [] // Coin items (purchased with gems)
}
```

Omit categories you do not modify.

## Debugging

1. Check the console for errors during loading.
2. Common errors:
   - ❌ `Failed to load...`: JSON syntax error.
   - ❌ `Level file not found`: Filename mismatch.
3. Validate JSON using tools like [JSONLint](https://jsonlint.com/).
