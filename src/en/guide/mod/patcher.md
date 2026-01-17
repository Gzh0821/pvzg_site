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
> This tutorial applies to versions `0.3.X` - `0.6.X`.

GE Patcher is the built-in modding tool for PvZ2 Gardendless. It allows you to customize plants, zombies, projectiles, upgrades, store items, and levels by editing JSON files.

## Prerequisites

Before you start:

- **JSON Editor**: [VS Code](https://code.visualstudio.com/) (recommended) or Notepad++
- **Game Version**: 0.3.0 or higher
- **Basic JSON knowledge**: Understanding of JSON syntax (objects, arrays, key-value pairs)

<ins class="adsbygoogle"
style="display:block"
data-ad-client="ca-pub-2336226859954206"
data-ad-slot="6758794743"
data-ad-format="auto"
data-full-width-responsive="true">
</ins>

## Step 1: Find Your Patch Directory

1. Launch the game
2. Press **F12** to open Developer Console
3. Look for this line:

```text
[GE Patcher] BaseDir: C:\Users\YourName\AppData\Local\com.pvzge.app
```

4. Run `gePatcher.help()` for more info and to confirm the patches directory

> [!tip]
> **Common Locations:**
> - Windows: `C:\Users\YourName\AppData\Local\com.pvzge.app`
> - Mac (Docker): Check Docker container logs
> - Linux (Docker): Check Docker container logs

## Step 2: Create Folder Structure

Navigate to your BaseDir and create this structure:

```
com.pvzge.app/
└── patches/
    └── jsons/
        ├── features/           ← Entity metadata (plants, zombies, etc.)
        │   ├── PlantFeatures.json
        │   ├── PlantProps.json
        │   ├── PlantAlmanac.json
        │   ├── ZombieFeatures.json
        │   ├── ZombieProps.json
        │   └── ... (more files)
        └── levels/             ← Custom level files
            └── egypt1.json     ← Filename = level ID
```

> [!important]
> Only create files you need to modify. Empty or unchanged files are not required.

## Step 3: Load and Apply Patches

After the game **fully loads** (you see the main menu), run commands in the console:

```javascript
// Option 1: Load everything at once (recommended)
gePatcher.init()

// Option 2: Load in steps
gePatcher.initBase()    // Load base assets first
gePatcher.initPatchs()  // Then load your patches
```

> [!warning]
> Always wait for the game to fully load before running these commands. Running too early will cause errors.

## Step 4: Reload After Changes

After editing your JSON files:

```javascript
// Reload patches without restarting the game
gePatcher.initPatchs()
```

## Useful Commands Reference

### View Available Data

```javascript
// List all level IDs in the game
gePatcher.showLevels()

// List saved original JSON data
gePatcher.listOrigins()
```

### Export Original Data (for reference)

```javascript
// Export to console (view structure)
gePatcher.exportJson('PlantProps', true)

// Export and download as file
gePatcher.exportJson('PlantProps', true, true)

// Available data types:
// PlantFeatures, PlantProps, PlantAlmanac, PlantTypes
// ZombieFeatures, ZombieProps, ZombieAlmanac, ZombieTypes
// ProjectileProps, ProjectileTypes, UpgradeFeatures
// StoreCommodityFeatures, NarrativeList, PropertySheets
```

### Quick Modifications (without JSON files)

```javascript
// Modify a single property
gePatcher.setPropsData('PlantProps', 'peashooter', 'SunCost', 50)

// Modify multiple properties at once
gePatcher.setPropsData('PlantProps', 'peashooter', {
  SunCost: 50,
  Damage: 40,
  Cooldown: 3
})
```

### Restore Original Data

```javascript
// Restore a specific data type
gePatcher.restoreOriginal('PlantFeatures')

// Restore everything to original
gePatcher.restoreAll()
```

### Advanced

```javascript
// Set custom frame rate (use with caution!)
gePatcher.setFrameRate(30)
```

## File Types Explained

| File | Purpose | Key Field |
|------|---------|-----------|
| `*Features.json` | Entity metadata, unlock order | `CODENAME` |
| `*Props.json` | Gameplay stats (damage, cost, etc.) | `aliases` |
| `*Almanac.json` | Almanac display info | `aliases` |
| `*Types.json` | Type definitions | varies |
| `levels/*.json` | Level wave data | filename |

## Example: Modify Peashooter

### Goal: Make Peashooter cheaper and stronger

**File: `patches/jsons/features/PlantProps.json`**

```json
{
  "objects": [
    {
      "aliases": ["peashooter"],
      "objclass": "PlantProperties",
      "objdata": {
        "SunCost": 50,
        "Damage": 40,
        "Cooldown": 3,
        "Toughness": 600
      }
    }
  ]
}
```

**What this does:**
- Sun cost: 100 → 50
- Damage: 20 → 40 (double damage)
- Cooldown: 5s → 3s (faster recharge)
- Health: 300 → 600 (survives longer)

## Example: Change Store Prices

**File: `patches/jsons/features/StoreCommodityFeatures.json`**

```json
{
  "Plants": [
    {
      "CommodityType": "plant",
      "CommodityName": "snowpea",
      "CurrencyType": "coin",
      "CurrencyRequired": 1000
    }
  ]
}
```

**What this does:**
- Snow Pea now costs 1000 coins instead of gems

## Merging Rules

GE Patcher uses **smart merging** - you only need to specify what you want to change:

| Data Type | Merge Behavior |
|-----------|----------------|
| Primitives (string, number) | Replaced entirely |
| Objects | Merged recursively |
| Arrays | Merged by index (first element matches first element) |
| Top-level arrays (`SEEDCHOOSERDEFAULTORDER`, etc.) | Replaced entirely |

> [!important]
> **Limitations:**
> - GE Patcher only **modifies existing entities** - you cannot add new plants/zombies
> - Avoid changing key identifiers (`ID`, `_CARDSPRITENAME`, `CODENAME`)

## Troubleshooting

### "Failed to load..." error

**Cause:** JSON syntax error

**Fix:**
1. Validate your JSON at [jsonlint.com](https://jsonlint.com/)
2. Check for missing commas, brackets, or quotes
3. Ensure proper escaping of special characters

### "Level file not found" error

**Cause:** Filename doesn't match level ID

**Fix:**
1. Run `gePatcher.showLevels()` to see valid level IDs
2. Rename your file to match exactly (e.g., `egypt1.json`, not `Egypt1.json`)

### Changes don't appear in-game

**Cause:** Patches not reloaded

**Fix:**
1. Run `gePatcher.initPatchs()` after saving changes
2. Check console for error messages
3. Verify file is in correct directory (`patches/jsons/features/`)

### Game crashes after applying patch

**Cause:** Invalid data structure or values

**Fix:**
1. Remove your patch files
2. Run `gePatcher.restoreAll()`
3. Export original data: `gePatcher.exportJson('PlantProps', true)`
4. Compare your JSON structure with the original
5. Start with minimal changes and test incrementally

### Properties not listed in documentation

**Fix:** Export original data to discover all available properties:

```javascript
gePatcher.exportJson('PlantProps', true)
gePatcher.exportJson('ZombieProps', true)
```

## Next Steps

- See [Properties Reference](format.md) for complete property documentation
- Check the [Almanac](../../almanac/) for valid property values per plant
- Join the [Discord](https://discord.gg/m84nmRMFuf) for modding help

