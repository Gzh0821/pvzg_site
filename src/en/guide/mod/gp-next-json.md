---
title: Source Data
icon: file-export
pageInfo: false
index: true
order: 5
---

## Download source data

The [game 0.15.0 JSON archive](/resources/game-json-0.15.0.zip) contains Features, Objects, levels and language data. Sources and checksums are in `MANIFEST.json`. This is reference material, not an installable mod.

## Export from the game

In GP-Next Data, select a type and export original or current data. Original data is a patch reference; current data includes applied mod changes and helps diagnose conflicts.

You can also use the [console](./gp-next-console.md). These commands export original plant properties, current plant properties and the original language table:

```js
await gpNext.exportJson('PlantProps', true)
await gpNext.exportJson('PlantProps')
await gpNext.exportLang(true)
```

In `exportJson(type, useOriginal, autoDownload)`, the last two arguments default to `false` and `true`. Set `autoDownload` to false to return data without a save dialog.

## Choose a data type

| Content | Reference |
| --- | --- |
| Names, order, card assets | `Features` |
| Health, damage, cost, cooldown | `Props` |
| Almanac text | `Almanac` |
| Store items | `StoreCommodityFeatures` |
| General interface text | Language table |

Use the [pack layout](./gp-next-datapack.md) to build a patch and check the [merge rules](./gp-next-merge.md).
