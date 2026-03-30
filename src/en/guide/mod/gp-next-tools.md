---
title: Built-in Tools
icon: sliders
pageInfo: false
index: true
order: 6
---

# Data and Trainer

GP-Next is not only a patch loader. It also includes several in-game tools for development and debugging.

## Data

The Data page lets you browse live game data directly, for example:

- `PlantProps`
- `ZombieProps`
- `PlantAlmanac`
- `StoreCommodityFeatures`

Inside the page you can:

- search entries
- open the detail drawer
- compare current values with original values
- export current JSON or original JSON
- edit values manually
- restore a single entry or a whole type

## Manual Editing

Manual edits made in the Data page are not only temporary changes for the current session.

They are saved to:

```text
gp-next/__gpn_edits/
```

That means:

- they remain after closing the game
- they remain after reloading patches
- they have the highest priority

If you only want to confirm whether a field actually works, the Data page is usually the fastest entry point.

## When It Fits Well

- quickly testing a value
- checking whether a field has an effect
- fixing an obvious issue in your own pack

## When It Fits Less Well

- maintaining a full mod structure for long-term use
- sharing it directly as a finished mod package

If you decide to keep a change permanently, it is better to move it back into `packs/`.

## Trainer

Trainer is the in-game modifier page.

It is not just for cheating. During mod development it is also useful because it speeds up testing.

## Requirement

You need to enable this first in the game's native settings:

- `Allow Cheat`

If this switch is off, Trainer will not be fully available.

## Common Uses

### Battle Scenes

- change sun
- auto collect drops
- no cooldown / free planting
- invincible plants
- native 1x / 1.5x speed
- instant win

### World Map

- change coins
- change gems

### Sandbox

Trainer has dedicated synchronization logic for sandbox mode.

That means some toggles connect to the sandbox's native capabilities instead of simply forcing raw runtime values.

## A Common Workflow

1. Find the target entry in the Data page
2. Change a small number of fields to verify the effect
3. Use Trainer to enter a faster testing state
4. Once confirmed, move the change into a proper datapack

## Next

- [Settings & Extensions](./gp-next-settings.md)
- [Console API](./gp-next-console.md)
