---
title: Source Data
icon: file-export
pageInfo: false
index: true
order: 5
---

# Game Data

Before writing a patch, the most useful step is often not guessing field names but exporting the current original JSON and checking it first.

This helps you confirm:

- whether the type is called `Features` or `Props`
- which fields an object actually contains
- what the current default values are
- whether text is stored in the main language table or directly inside multilingual object fields

## What You Can Export

Common reference types include:

- `PlantFeatures`
- `PlantProps`
- `PlantAlmanac`
- `ZombieFeatures`
- `ZombieProps`
- `StoreCommodityFeatures`
- `LevelModules`
- the game's `lang` table

If you are not sure about a type name, check the category names in the **Data** page or run:

```js
gpNext.status()
```

## Method 1: Export From the Data Page

This is the most direct method.

1. Enter the game and open the GP-Next panel
2. Switch to the **Data** page
3. Find the type you want to inspect, such as `PlantProps`
4. Export either the current data or the original data

Useful when:

- you want to inspect the full structure of a type
- you want to compare original data with the current runtime data
- you do not want to type console commands

## Method 2: Export `Features` / `Props` With the Console API

If you prefer a scripted workflow, call this in the developer console:

```js
await gpNext.exportJson('PlantProps')
```

This exports the current runtime `PlantProps`.

If you want the original data instead, pass `true` as the second argument:

```js
await gpNext.exportJson('PlantProps', true)
```

### Parameters

- first parameter `type`: type name, such as `PlantFeatures` or `PlantProps`
- second parameter `useOriginal`: `true` for original data, `false` for current runtime data
- third parameter `autoDownload`: `true` to open a save dialog, `false` to print to the console

### Examples

Export original plant features:

```js
await gpNext.exportJson('PlantFeatures', true)
```

Export current zombie stats and print them to the console:

```js
await gpNext.exportJson('ZombieProps', false, false)
```

## Method 3: Export the Language Table

The game's shared language table can also be exported directly.

```js
await gpNext.exportLang()
```

If you want the original language table:

```js
await gpNext.exportLang(true)
```

This is useful when you want to:

- find the original key of an existing text
- confirm whether a language pack is applied correctly
- use the current table as reference for a new language

## How To Decide What To Export

You can start with the kind of change you want to make:

- changing names, order, or card resource names: check `Features`
- changing health, damage, cooldown, or sun cost: check `Props`
- changing almanac descriptions, tags, or chat text: check `Almanac`
- changing store entries: check `StoreCommodityFeatures`
- changing global interface text: check the language table

If you are still unsure, the safest method is to export both related types and compare them.

## What To Do Next

After exporting the JSON, the usual workflow is:

1. find the target object and field in the exported file
2. compare the field with [Types & Fields](./format.md)
3. then write your `pack.json` and patch files

If you are ready to build the pack, continue with:

- [Datapacks and `pack.json`](./gp-next-datapack.md)
- [Merge Rules](./gp-next-merge.md)
- [Console API](./gp-next-console.md)
