---
title: MOD Tutorial
index: true
icon: toolbox
pageInfo: false
comment: false
dir:
  order: 6
---

<script>
import { onMounted } from 'vue'
onMounted(() => {
  (window.adsbygoogle = window.adsbygoogle || []).push({});
})
</script>

## Overview

Starting from version `0.2.8.1`, PvZ2 Gardendless supports modding through **GE Patcher** - a built-in tool that lets you customize the game by modifying JSON files.

> [!warning]
> Modding is only available in the **desktop version** (Windows/Linux/Mac via Docker). The online web version does not support mods.

## What Can You Mod?

| Category | Examples | Difficulty |
|----------|----------|------------|
| **Plant Stats** | Sun cost, damage, cooldown, health | Easy |
| **Zombie Stats** | Health, speed, damage | Easy |
| **Store Items** | Prices, currency type, unlock requirements | Easy |
| **Levels** | Zombie waves, sun production, layout | Medium |
| **Almanac** | Descriptions, display info | Easy |
| **Projectiles** | Damage, behavior | Medium |

## What You CANNOT Mod

- ❌ Add new plants or zombies
- ❌ Add new worlds
- ❌ Modify core game mechanics
- ❌ Change graphics/sprites
- ❌ Add new music/sounds

## Quick Start

### Step 1: Find Your Game Directory

Open the game, press **F12** to open Developer Console, and look for:

```text
[GE Patcher] BaseDir: C:\Users\YourName\AppData\Local\com.pvzge.app
```

### Step 2: Create Patches Folder

Navigate to that directory and create this structure:

```
com.pvzge.app/
└── patches/
    └── jsons/
        ├── features/      ← Plant/zombie modifications
        └── levels/        ← Level modifications
```

### Step 3: Create Your First Mod

Create `patches/jsons/features/PlantProps.json`:

```json
{
  "objects": [
    {
      "aliases": ["peashooter"],
      "objclass": "PlantProperties",
      "objdata": {
        "SunCost": 50,
        "Damage": 40
      }
    }
  ]
}
```

This makes Peashooter cost 50 sun and deal double damage.

### Step 4: Load Your Mod

In the game console (F12), run:

```javascript
gePatcher.init()
```

Your mod is now active!

## Tutorials

<Catalog />

## Troubleshooting

### Mod not loading?

1. Check file path is correct (must be in `patches/jsons/`)
2. Validate JSON syntax at [jsonlint.com](https://jsonlint.com/)
3. Run `gePatcher.help()` to verify patch directory
4. Make sure game is fully loaded before running `gePatcher.init()`

### Changes not appearing?

Run `gePatcher.initPatchs()` again after editing JSON files.

### Game crashes after mod?

1. Remove your mod files
2. Run `gePatcher.restoreAll()` in console
3. Check console (F12) for error messages
4. Verify your JSON structure matches the expected format

### Need reference data?

Export original game data to see the correct format:

```javascript
gePatcher.exportJson('PlantProps', true)
```

> [!tip]
> The development team does not guarantee modding support in future versions. Mods may break after game updates.
