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

### Directory Roles

- **`features/` directory**: Put files like `PlantFeatures.json`, `ZombieFeatures.json`, etc., here. These usually handle metadata like families, base unlocks, etc.
- **`objects/` directory**: Put files like `PlantProps.json`, `ZombieProps.json`, `PlantAlmanac.json`, `StoreCommodityFeatures.json`, etc., here. These files usually handle actual combat values (HP, damage, cooldown), almanac descriptions, and store lists.
- **`levels/` directory**: Put custom levels here. The filename must match the in-game level ID exactly (e.g., `egypt1.json`).

## JSON Merge Logic

Some developers are accustomed to copying the *entire* source file content, which can easily lead to the loss of other fields due to game updates.

GP-Next uses a deep merge mechanism. **You only need to write the fields you want to modify in the JSON (for some fields with list values, you may need to provide the complete list for correct overwriting)**, and the remaining unmentioned fields will remain unchanged.

- **For Features (`PlantFeatures`, `ZombieFeatures`, etc.)**: Entities are matched by `CODENAME`. Only the properties you provide will overwrite the vanilla ones.
- **For Objects (`PlantProps`, `PlantAlmanac`, etc.)**: Entities are matched by the first entry in their `aliases` array. Only the properties you provide inside `objdata` will overwrite the vanilla ones.
- **For the Store (`StoreCommodityFeatures`)**: This uses a shallow merge to replace the store category arrays.
- **For Levels (`levels/*.json`)**: This is the exception. Level files are always **completely replaced**.

**Example: Safely modifying Peashooter's SunCost and Cooldown only**
`PlantProps.json`:
```json
{
  "objects": [
    {
      "aliases": ["peashooter"],
      "objclass": "PlantProperties",
      "objdata": {
        "SunCost": 50,
        "Cooldown": 2
      }
    }
  ]
}
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

### Step-by-Step: Creating a Datapack

If you want to package your mod to share with others, follow these simple steps:

1. **Create the Mod Folder**: Go to the GP-Next `packs/` directory and create a new folder, e.g., `MyFirstMod`.
2. **Create `pack.json`**: Make a `pack.json` file inside `MyFirstMod`. Copy the template shown above and fill in your `name` and `author`. Generate a unique `uuid` using the UUID Generator in the GP-Next **Guide** tab in the game.
3. **Structure Your Mod**: Create a `jsons` folder inside `MyFirstMod`. Then create `features`, `objects`, or `levels` subfolders inside `jsons` based on what you are changing.
4. **Write the Data**: Create your JSON files (e.g., `PlantProps.json` inside the `objects` folder). Remember the deep merge rule: **only write the specific entity and the exact fields you want to change**.
5. **Add a Cover Image (Optional)**: Put a square image under 128x128 named `thumbnail.png` (or `thumbnail.ico`) inside the `MyFirstMod` folder next to `pack.json`.
6. **Zip and Share (Optional)**: Right-click the `MyFirstMod` folder and compress it into `MyFirstMod.zip` (Ensure the zip directly contains `pack.json` without nested root folders). You can now share this `.zip` file, and other players just need to put the zip into their `packs/` directory.

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
