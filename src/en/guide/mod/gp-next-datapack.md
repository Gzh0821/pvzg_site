---
title: Mod files and manifest
icon: toolbox
pageInfo: false
index: true
order: 4
---

# Mod files and manifest

A JSON mod needs `pack.json` at the root and its patches under `jsons/`:

```json
{
  "uuid": "yourname.balance",
  "name": "Balance changes",
  "version": "1.0.0",
  "packFormatVersion": 1
}
```

For example, save this as `jsons/features/PlantFeatures.json`:

```json
{ "PLANTS": [{ "CODENAME": "peashooter", "BOOST": 3 }] }
```

ZIP the manifest and `jsons` together, then import the ZIP. No build tools are needed.

| Field | Requirement |
| --- | --- |
| `uuid` | Required, unique and stable across updates; no surrounding spaces or reserved `legacy:` prefix. JS IDs use 3–128 letters, digits, dots, underscores or hyphens, starting with a letter or digit |
| `name` / `version` | Recommended; version defaults to `1.0.0` |
| `packFormatVersion` | Only `1` is supported; defaults to `1`, explicit is recommended |
| `apiVersion` | Required for JS: `2` |
| `js.entry` | One `.js`/`.mjs` entry; `scripts/main.js` can be detected automatically |
| `js.startup` | Set to true for startup registration |
| `js.reloadable` | Use false for mods that need a restart |
| `depends` / `optionalDepends` | Arrays of required/optional mod IDs |
| `minGpNextVersion` / `maxGpNextVersion` | Plain minimum/maximum version, without range operators |
| `author` / `description` / `priority` | Optional author, purpose and initial ordering |

For preview features, use `minGpNextVersion: "1.5.0-pre.1"`. A minimum of `1.5.0` requires the final release. The old example fields `gameVersion` and `gpNextVersion` do not replace these compatibility fields.

| Content | Path |
| --- | --- |
| Features | `jsons/features/TypeName.json` |
| Objects and properties | `jsons/objects/TypeName.json` |
| Levels | `jsons/levels/LevelName.json` |
| Language | `jsons/lang/lang.json` |
| Merge options | `jsons/config/patching.json` |
| Experimental world map | `jsons/worldmap/gpn-worldmap.json` |
| Experimental plant levels | `jsons/extensions/plant-levels.json` |
| Cover | `thumbnail.png` or `thumbnail.ico` at the root |

JSON5 is also supported for patches. Asset paths and formats are defined by the mod or its framework. [Merge rules](./gp-next-merge.md) · [JavaScript](./gp-next-js.md)
