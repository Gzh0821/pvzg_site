---
title: Merge Rules
icon: code-merge
pageInfo: false
index: true
order: 3
---

`merge` overrides supplied fields and suits stat or text changes. `replace` replaces the entire type file; use it for a complete redesign and maintain the full data yourself.

## Configuration

Use `jsons/config/patching.json` or `.json5`:

```json
{
  "defaultMode": "merge",
  "features": {
    "StoreCommodityFeatures": { "mode": "replace" }
  }
}
```

Only `StoreCommodityFeatures` is replaced here; other Features and Objects use `merge`. The default is `merge` when `defaultMode` is omitted. Put type names under `features` or `objects`.

This config does not control levels, language or maps. Levels use complete files, language patches deep-merge, and maps have a [separate format](./gp-next-worldmap.md).

## Entry matching

| Data | Entry key |
| --- | --- |
| Most Features | `CODENAME` |
| `MintObtainRoute` | `Family` |
| `StoreCommodityFeatures.Plants` / `Upgrade` | `CommodityName` |
| Objects | `aliases[0]` |

Only supplied fields are merged into matched entries. Arrays inside entries are replaced, not appended. Whole sections such as `SEEDCHOOSERDEFAULTORDER` and the store's `Gem`, `Coin` and `Zen` also need complete replacement contents. These differ from the top-level Features entries matched by ID.

Compare original and current values in Data. If several mods change the same field, check [load order](./gp-next-files.md).
