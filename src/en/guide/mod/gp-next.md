---
title: GP-Next Usage Guide
icon: toolbox
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

> [!tip]
> This guide applies to game version `0.7.1` and above.

GP-Next is a powerful, next-generation tool built into PvZ2 Gardendless for modifying game data. It supports modifying plants, zombies, grid items, upgrades, store items, levels, and more using JSON files. It also offers an in-game Trainer (Cheats) and a Data Browser for on-the-fly manual tweaks.

## Prerequisites

1. JSON Editor (VSCode / Notepad++ recommended).
2. Game Version ≥ 0.7.1.
3. Basic understanding of JSON structures. See [Property Reference](format.md) for details on attributes.

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-7637695321442015"
     data-ad-slot="7113006248"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

## Directory Structure and Priority

GP-Next loads patches from the `gp-next` folder inside the game's data directory. You can find this directory by clicking **Open Folder** in the GP-Next Patcher tab.

The loading priority is as follows (highest number / last step wins):

1. **packs/ Directory (Datapacks)**: You can place complete mod packs here (either as folders or `.zip` files). Datapacks are applied in ascending order of their `priority` defined in their `pack.json`.
2. **patches/ Directory (Single-file patches)**: Directly placing JSON files here works like the older gePatcher. These have a higher priority than packs and act as a compatibility layer.
3. **Manual Edits (Data Tab)**: Any real-time modifications made via the GP-Next **Data** tab are saved as `__gpn_edits` and will **always** override all other packs and patches.

```text
com.pvzge.app/
└── gp-next/
    ├── packs/
    │   ├── MyPack/         ← Folder format datapack
    │   │   ├── pack.json   ← Required manifest file
    │   │   └── jsons/
    │   │       ├── features/
    │   │       ├── objects/
    │   │       └── levels/
    │   └── AnotherPack.zip ← ZIP format datapack
    └── patches/            ← Single file patches
        └── jsons/
            ├── features/
            └── levels/
```

## Datapacks (`pack.json`)

To create a datapack, place a folder inside `packs/` and include a `pack.json` file at its root. 

**pack.json format:**
```json
{
  "uuid": "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
  "name": "My Custom Mod",
  "version": "1.0.0",
  "priority": 100,
  "description": "Optional description for your mod.",
  "author": "Your Name",
  "formatVersion": 1,
  "gameVersion": "0.7.1",
  "gpNextVersion": ">=1.0.0"
}
```

- **uuid**: A required unique identifier (used to persist your loaded mods list and order). You can generate one from the GP-Next **Guide** tab in the game.
- **name**: Display name of your mod.
- **version**: Version string of your mod.
- **priority**: Determines load order (lower numbers = loaded first).
- **description**: A short description of the mod.
- **author**: Author's name.
- **formatVersion**: The format version of the datapack. (Currently 1).
- **gameVersion**: Targeted compatible game version (e.g., `0.7.1`).
- **gpNextVersion**: Required GP-Next version to run the mod (e.g., `>=1.0.0`).
- **thumbnail.png / thumbnail.ico**: Placing a 1:1 (square) image in the root directory will display it as the mod's cover image. The size must be less than 128x128. Both `.png` and `.ico` formats are supported.

## Manual Edits and The Data Tab

GP-Next includes a **Data** tab that allows you to browse all in-game data (such as `PlantProps`, `ZombieProps`, etc.) in real-time. 

You can make direct modifications to any entity directly from this menu. These modifications are recorded as "Manual Edits" (`__gpn_edits`) and will persist across game sessions.

> [!important]
> Manual edits are intended for **quick tweaking and debugging**. If you are building a stable or shareable mod, it is highly recommended to package your changes into a structured Datapack inside the `packs/` folder instead.

If you wish to remove your manual edits, you can do so by right-clicking the item or type in the Data tab and selecting "Restore".

## Trainer (Cheats)

GP-Next offers an in-game **Trainer** tab. To use it, you must first enable "Cheat" in the standard in-game Settings menu.

- **In-Game Scene**: Modify Sun, toggle Game Speed, enable No Cooldown / Instant Win / Invincibility, etc. Free Plant/Buy functions and auto-collection are also supported.
- **World Map Scheme**: Modify Coins and Gems freely.
- **Sandbox Mode**: Sandbox Mode settings are fully synced with the Trainer toggles. Note that in Sandbox Mode, certain functions (like Instant Win) are locked to maintain stability.
