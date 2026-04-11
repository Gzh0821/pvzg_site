---
title: Merge Rules
icon: code-merge
pageInfo: false
index: true
order: 3
---

# `merge / replace`

GP-Next now has two file-level modes for ordinary JSON patching:

- `merge`
- `replace`

If you only remember one sentence:

- `merge`: write only the parts you want to change
- `replace`: you take over the whole JSON for that type

This page is dedicated to the difference between those two modes, how to configure them, and when each one makes sense.

## Default Behavior

By default, GP-Next treats ordinary JSON patches like this:

- `features` / `objects`: `merge`
- `levels`: effectively whole-file replacement
- `lang`: still deep-merged into `MultiLanguage.lyrics`
- `worldmap`: uses GP-Next's own runtime system, not the rules on this page

So this page mainly focuses on:

- `jsons/features/*.json`
- `jsons/objects/*.json`

## What `merge` Means

`merge` is GP-Next's original default approach.

Its goal is to:

- keep as much of the original game JSON as possible
- override only the fields you explicitly write
- keep patches small and more compatible with future game updates

For example, if you only want to change the stats of one plant, `merge` should usually be your first choice.

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

This patch does not replace all of `PlantProps`. It only changes those two fields on `peashooter`.

## What `replace` Means

`replace` means:

- GP-Next stops using the normal merge rules for that type
- your patch file directly replaces the whole original JSON of that type

It is useful when:

- you want to fully rebuild the store contents
- you want to clearly remove a large amount of vanilla data
- you do not want any old content from that original type to remain

So `replace` is not just "stronger override". It means "this whole type is now owned by your file".

## How To Configure It

Put the config file here:

```text
jsons/config/patching.json
```

Minimal example:

```json
{
  "defaultMode": "merge",
  "features": {
    "StoreCommodityFeatures": { "mode": "replace" }
  },
  "objects": {
    "PlantProps": { "mode": "replace" }
  }
}
```

This means:

- types not listed still use `merge`
- `StoreCommodityFeatures` uses full `replace`
- `PlantProps` uses full `replace`

## Current Scope

Right now this config only affects:

- `features`
- `objects`

That means files like:

- `features/PlantFeatures.json`
- `features/StoreCommodityFeatures.json`
- `objects/PlantProps.json`
- `objects/ZombieProps.json`

can be switched between `merge` and `replace` through `patching.json`.

These are not controlled by this page's rules:

- `levels`
- `lang`
- `worldmap`

## Config Rules

The current rules are simple:

- write type names under `features` and `objects`
- types not listed use `defaultMode`
- if `defaultMode` is omitted, it falls back to `merge`
- currently only `merge` and `replace` are supported

For example:

```json
{
  "features": {
    "StoreCommodityFeatures": { "mode": "replace" }
  }
}
```

This switches only `StoreCommodityFeatures` to `replace`. Everything else keeps the default behavior.

## What GP-Next Does in `merge`

### Features

Features files are not merged by array index. They are matched through identifier fields.

Common cases:

- most Features files: `CODENAME`
- `MintObtainRoute`: `Family`
- `StoreCommodityFeatures.Plants / Upgrade`: `CommodityName`

### Objects

Objects files usually locate entries inside the `objects` array by:

- `aliases[0]`

So if you are editing a plant or zombie, you usually write its first alias.

## Arrays Need Extra Care

Even in `merge`, arrays are not merged item by item by index.

**In GP-Next, arrays are still replaced as a whole by default.**

That usually applies to things like:

- zombie pools
- `PLANTS`
- `SEEDCHOOSERDEFAULTORDER`
- certain full store lists

So `merge` does not mean "everything is automatically appended in a smart way".
It mainly means object fields are merged by rule, while arrays still tend to replace.

## Special Note on `StoreCommodityFeatures`

`StoreCommodityFeatures` is not one single array. It contains several parallel sections:

- `Plants`
- `Upgrade`
- `Gem`
- `Coin`
- `Zen`

Under normal `merge`:

- `Plants` / `Upgrade`: merged by `CommodityName`
- `Gem` / `Coin` / `Zen`: usually replaced as whole arrays

If your goal is "the whole store should now follow my own version", `replace` is often clearer than continuing to mix with vanilla data.

## When To Choose `merge`

`merge` is usually better when:

- you only want to change a few plant or zombie stats
- you only want to edit a small number of almanac texts or descriptions
- you only want to adjust a few store prices
- you want better compatibility with future game updates and new fields

Short version:

**If a local change is enough, prefer `merge`.**

## When To Choose `replace`

`replace` is usually better when:

- you want to completely rebuild one type
- you clearly want to remove a large amount of vanilla content
- you do not want the original JSON of that type to participate anymore
- you are ready to maintain that entire type file yourself

Short version:

**Use `replace` when you want to take over the whole type.**

## A Quick Decision Test

Ask yourself:

1. Am I only changing a small number of fields?
2. Do I want future vanilla fields to stay whenever possible?
3. Do I want to avoid maintaining a whole type file?

If most answers are yes, use `merge`.

On the other hand:

1. Am I ready to maintain the full type file myself?
2. Do I want old vanilla content to stop mixing in?
3. Am I intentionally rebuilding this whole type?

If most answers are yes, use `replace`.

## Recommended Workflow

1. Inspect the real structure in the **Data** page first
2. Start with the smallest possible `merge` patch
3. Switch to `replace` only if the real need is "take over the whole type"
4. Reload and confirm the result again in the **Data** page

## Next

- [Structure and Priority](./gp-next-files.md)
- [Datapacks and `pack.json`](./gp-next-datapack.md)
- [Language Packs and `lang.json`](./gp-next-language.md)
- [Types & Fields](./format.md)
