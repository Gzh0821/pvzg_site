---
title: Merge Rules
icon: code-merge
pageInfo: false
index: true
order: 3
---

# Merge Rules

One of the most common beginner mistakes is copying the entire original JSON file and only changing a few lines.

That usually is not the best approach in GP-Next, because after a game update your copied old data may overwrite new fields added by the game.

## Core Rule

**Only write the fields you actually want to change.**

GP-Next deeply merges your JSON with the game's original data.
Fields you do not mention are kept as they are whenever possible.

## Types

## Features

For example:

- `PlantFeatures`
- `ZombieFeatures`
- `StoreCommodityFeatures`
- `WorldmapFeatures`
- `MintObtainRoute`

These files are not merged by array index. GP-Next finds entries through identifying fields.

### Common Identifier Fields

- most Features files: `CODENAME`
- `MintObtainRoute`: `Family`
- `StoreCommodityFeatures.Plants / Upgrade`: `CommodityName`

### Special Note on `StoreCommodityFeatures`

This is not a single flat array. It contains several parallel sections:

- `Plants`
- `Upgrade`
- `Gem`
- `Coin`
- `Zen`

Among them:

- `Plants` / `Upgrade`: merged entry by entry
- `Gem` / `Coin` / `Zen`: usually replaced as whole arrays

## Objects

For example:

- `PlantProps`
- `ZombieProps`
- `PlantAlmanac`
- `ZombieAlmanac`

These files are usually matched like this:

- enter the `objects` array
- find the entry whose `aliases[0]` matches the alias you wrote

So if you want to edit a plant, you usually write its first alias.

## Levels

Level files are the exception.

`levels/*.json` is generally handled as **whole-file replacement**, not as the usual "change one field and deep merge" workflow.

## Arrays

This is the easiest place to make mistakes:

**In GP-Next, arrays are replaced as a whole by default. They are not merged item by item by index.**

For example, if you want to edit:

- a zombie pool such as `Basic_Zombie`
- the plant unlock list `PLANTS`
- `SEEDCHOOSERDEFAULTORDER`

then you should write the **complete new array**, not only the extra item you want to add.

## Example

Only changing Peashooter's sun cost and cooldown:

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

The advantage of this format is:

- it does not overwrite the whole `PlantProps`
- it only affects `peashooter`
- it only changes `SunCost` and `Cooldown`

## Good Cases for Whole Replacement

Whole replacement is usually the right approach when:

- you are editing an array
- you are replacing a full level
- you are changing certain full store lists

## Good Cases for Partial Changes

You should keep the patch as small as possible when editing:

- a single plant's stats
- a single zombie's stats
- one almanac text entry
- the price of one store item

## A Practical Workflow

1. Check the real structure of the target entry in the **Data** page
2. Extract only the smallest set of fields you need
3. Write it as a separate patch
4. Reload and confirm the result in the Data page

## Next

- [Datapacks and `pack.json`](./gp-next-datapack.md)
- [Language Packs and `lang.json`](./gp-next-language.md)
- [Types & Fields](./format.md)
