---
title: Plant Levels
icon: seedling
pageInfo: false
index: true
order: 7.5
---

# Plant Levels

GP-Next now includes an experimental plant-level system.

The core idea is not to mutate the vanilla plant directly. Instead, you:

- choose one **base plant**
- prepare one **clone plant** for each level
- bind `base plant ↔ level clones` through `jsons/gp-next/plant-levels.json`

This is useful because:

- each level can have its own `PlantProps / PlantAlmanac / PlantTypes`
- badges, almanac level pages, and runtime card replacement all use the same mapping
- no modification of game build output is required

## What Stage It Is In

The current version is best suited for:

- level data registration
- level badge display
- almanac level-page viewing
- replacing the base plant entry with the selected level clone at runtime

You should not treat it as a full recreation of the original PvZ2 upgrade economy yet.

In particular, these parts are still evolving:

- upgrade resource sources
- full upgrade economy loop
- more complete progression UI

## What To Enable First

In the game, open the GP-Next panel:

1. go to `Experimental`
2. enable `plant-level-system`

You should also usually keep this enabled in `Settings -> Runtime Extensions`:

- `Dynamic Plant Registry`

This is especially important if your level line uses added plants or cloned plants.

## File Layout

A common setup looks like this:

```text
MyPack/
├── pack.json
└── jsons/
    ├── gp-next/
    │   └── plant-levels.json
    ├── features/
    │   └── PlantFeatures.json5
    └── objects/
        ├── PlantTypes.json5
        ├── PlantProps.json5
        └── PlantAlmanac.json5
```

If you only bind existing plants, sometimes `plant-levels.json` is enough.  
But if any level uses your own clone identity, you will usually need at least:

- `PlantFeatures`
- `PlantTypes`
- `PlantProps`
- `PlantAlmanac`

## Basic `plant-levels.json` Shape

The recommended structure is:

```json5
{
  "plants": {
    "peashooter": {
      "levels": {
        "1": {
          "cloneCodename": "peashooter",
          "icon": "wood"
        },
        "2": {
          "cloneCodename": "peashooter_lvl2",
          "icon": "silver",
          "displayName": "LV2"
        },
        "3": {
          "cloneCodename": "peashooter_lvl3",
          "icon": "gold",
          "displayName": "LV3"
        }
      }
    }
  }
}
```

Meaning:

- `peashooter`: the base plant codename
- `levels`: which plant identity each level should use
- `cloneCodename`: the real codename used by that level
- `icon`: badge style
- `displayName`: optional custom level text

## What `displayName` Can Be

`displayName` supports two forms:

### 1. Plain string

```json5
"displayName": "LV2"
```

### 2. Localized object

```json5
"displayName": {
  "en": "Level 2",
  "zh": "2级",
  "es": "Nivel 2"
}
```

If your own language pack adds more language codes, you can also add matching fields here.

## Supported `icon` Values

Currently available level badge icons are:

- `wood`
- `silver`
- `gold`
- `star`

If omitted, the default is `wood`.

## Recommended Clone Strategy

The safest pattern is:

- keep the base plant as the base entry
- create your own clone codenames for higher levels
- let each level point to your own clone identity

For example:

- `sunflower`
- `sunflower_lvl2`
- `sunflower_lvl3`

instead of pointing a level directly at some other vanilla plant.

### Why Not Bind Directly To Another Vanilla Plant

For example, if your level-3 sunflower behaves like `twinsunflower`, it is still better to do this:

- create `sunflower_lvl3`
- let that clone use `PlantBasedOn: "twinsunflower"`

rather than binding level 3 directly to the vanilla `twinsunflower`.

This is more stable because:

- the level system stays bound to **your own plant identity**
- it does not hijack the vanilla card directly
- runtime mapping stays clearer

## What JSONs Must Exist

If you add a clone such as `peashooter_lvl2`, make sure it exists in:

- `PlantFeatures`
- `PlantTypes`
- `PlantProps`
- `PlantAlmanac`

Otherwise GP-Next will not register it into the level mapping.

In practice:

- `PlantFeatures` says what it is
- `PlantTypes` gives the runtime type
- `PlantProps` gives the stats
- `PlantAlmanac` gives the almanac presentation

## What You Will See In The Almanac

After enabling the system, the plant almanac page gets an extra `Level` subpage.

At the moment it mainly shows:

- highest level
- current level
- unlocked max level
- current level codename
- short description for the current level

So think of it as a compact level overview page, not a full upgrade shop.

## What Happens At Runtime

Two runtime behaviors matter most right now:

### 1. The base plant entry resolves to the selected level

If the base plant is `peashooter` and the selected level is 3, the base entry resolves to:

- `peashooter_lvl3`

### 2. Explicit clone entries can still be kept during development

You can keep explicit clone cards visible while testing. This is useful for:

- checking badge mapping
- checking almanac registration
- checking runtime identity behavior

## How It Differs From A Full Upgrade System

Right now this system is mainly:

- a level identity mapping layer
- a badge and almanac presentation layer
- a runtime entry replacement layer

It is not yet a full original-style upgrade economy.

So when building a pack, focus first on:

- whether each plant identity is stable
- whether level stats are really separate
- whether almanac display works
- whether the selected level resolves correctly at runtime

## One Practical Tip

Do not hide all clone entries immediately.

A better debugging flow is:

1. keep the base plant and all level clones visible first
2. verify almanac, badges, and runtime mapping
3. only hide entries later if the whole chain is already stable

That makes problems much easier to diagnose.

## Related Pages

- [Datapacks and `pack.json`](./gp-next-datapack.md)
- [Source Data](./gp-next-json.md)
- [Types & Fields](./format.md)
- [Settings & Extensions](./gp-next-settings.md)
