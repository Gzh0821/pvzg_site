---
title: Mod files and manifest
icon: toolbox
pageInfo: false
index: true
order: 4
---

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
| `gpNextVersion` | Recommended optional GP-Next range, such as `^1.5.0` |
| `minGpNextVersion` / `maxGpNextVersion` | Old inclusive version bounds, used only when `gpNextVersion` is absent |
| `author` / `description` / `priority` | Optional author, purpose and initial ordering |

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

## GP-Next version compatibility

Use one field, such as `"gpNextVersion": "^1.5.0"`. The same rules apply to data and JS mods.

| Expression | Stable releases |
| --- | --- |
| `^1.5.0` | `>=1.5.0 <2.0.0` |
| `~1.5.0` | `>=1.5.0 <1.6.0` |
| `>=1.5.0 <2.0.0` | Both bounds must match |
| `1.5.x` | Any stable `1.5` release |
| `^1.5.0 \|\| ^2.0.0` | Either range |
| `>=1.5.0, <2.0.0, !=1.5.2` | Exclude a specific version |
| `==1.5.0` | Exact version |
| `~=1.5.0` / `~=1.5` | `>=1.5.0 <1.6.0` / `>=1.5.0 <2.0.0` |

Supports npm SemVer ranges plus Python-style commas (AND), `==`, `!=` and `~=`. This is not full PEP 440: epochs, `.dev`, `.post` and `===` are unsupported. `==1.5` means exactly `1.5.0`, while the npm range `1.5` means `1.5.x`. Note that `~=1.5` and `~1.5` have different upper bounds.

- If `gpNextVersion` is present, old min/max fields are ignored. Only when it is absent are the old bounds checked. Omitting all three produces no warning.
- Old min/max fields take plain version numbers, with inclusive bounds, not range expressions.
- Mismatches, an empty new field, invalid types or invalid expressions only warn about possible incompatibility; they do not block installation or loading. An invalid new field does not fall back to old bounds.
- New ranges exclude prereleases by default. For example, `^1.5.0` does not match `1.6.0-pre.1`; `^1.5.0-pre.1` matches `1.5.0-pre.2`, but does not automatically admit `1.6.0-pre.1`. Old min/max fields retain their inclusive comparison rules.

For example, with both `"gpNextVersion": "^1.5.0"` and `"maxGpNextVersion": "1.4.9"`, the current version `1.5.2` matches the new field without an old-bound warning. Check warnings in the import preview and mod details. API versions, manifest formats, dependencies and required features are still validated separately.

JSON5 is also supported for patches. Asset paths and formats are defined by the mod or its framework. [Merge rules](./gp-next-merge.md) · [JavaScript](./gp-next-js.md) · [Plant fusion recipes](./gp-next-fusion.md) · [Official example mods](./gp-next-examples.md)

## Required features

Declare required platform features with `requiredGpNextFeatures`, for example:

```json
{ "requiredGpNextFeatures": ["experimental.jsModding", "experimental.worldMapJson"] }
```

Supported IDs include `experimental.jsModding`, `experimental.worldMapJson`, `experimental.plantLevelSystem`, `runtime.dynamicPlantRegistry`, `runtime.shopExtensions` and `runtime.scrollSensitivity`. Disabled or unknown requirements block normal installation/loading. A disabled feature offers a settings link; an unknown ID needs an author fix. Features are never enabled automatically.

`depends` and `optionalDepends` are arrays of mod UUID strings, not npm names or version expressions. `gpNextVersion` describes the platform version. Use `js.reloadable: false` only with `js.startup: true`.
