---
title: Plant Levels
icon: seedling
pageInfo: false
index: true
order: 7.5
---

`jsons/extensions/plant-levels.json` or `.json5` maps a base plant to per-level plant types. It provides badges, an Almanac level page and card substitution, not a complete upgrade economy.

Back up first and enable plant levels in Experimental. New cloned plants also require dynamic plant registration.

## Configuration

```json
{
  "$schema": "https://pvzge.com/jsons/schema/gpn-plant-levels.schema.json",
  "plants": {
    "peashooter": {
      "levels": {
        "1": { "cloneCodename": "peashooter", "icon": "wood" },
        "2": { "cloneCodename": "peashooter_lvl2", "icon": "silver", "displayName": "LV2" }
      }
    }
  }
}
```

The example's `peashooter_lvl2` needs complete `PlantFeatures`, `PlantTypes`, `PlantProps` and `PlantAlmanac` definitions in the pack. Use distinct codenames for upgraded plants rather than assigning another native plant's identity to a level.

| Field | Meaning |
| --- | --- |
| `cloneCodename` | Plant type used for this level |
| `icon` | `wood`, `silver`, `gold`, `star`; default `wood` |
| `displayName` | Optional text or localized object, such as `{ "en": "Level 2", "zh": "2级" }` |
| `hideText` | Hides text while retaining the icon |

The `$schema` enables editor completion and validation. After applying, check the selected level in the Almanac and its plant substitution in a level. Keep clone cards visible while checking their data.

[Pack layout](./gp-next-datapack.md) · [Fields](./format.md)
