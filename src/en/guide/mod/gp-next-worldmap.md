---
title: World Map
icon: map-location-dot
pageInfo: false
index: true
order: 6
---

Enable scripts in **Settings → Experimental features → JS Modding**, install and enable [World Map](https://nest.pvzge.com/projects/gp-extension-worldmap) and the map pack, then restart the game. Open **Extensions** to view installed extensions.

Add `"gp-extension.worldmap"` to the `depends` array in the map pack’s `pack.json`.

If you want to customize the world map, you can use:

```text
jsons/worldmap/gpn-worldmap.json
```

## Folder Layout

```text
MyPack/
├── pack.json
└── jsons/
    ├── features/
    ├── levels/
    └── worldmap/
        └── gpn-worldmap.json
```

You can also use `gpn-worldmap.json5`.

## Minimal Example

The current format requires a top-level `apiVersion`, and currently only version `1` is accepted:

```json
{
  "$schema": "https://raw.githubusercontent.com/Gzh0821/pvzg_site/refs/heads/main/src/.vuepress/public/jsons/schema/gpn-worldmap.schema.json",
  "apiVersion": 1,
  "worlds": {
    "egypt": {
      "map": {
        "mode": "replace",
        "mainline": [{ "id": "start", "type": "level", "levels": ["egypt1"] }]
      }
    }
  }
}
```

`$schema` can help your editor, such as `vscode`, provide field completion and validation. You can use either of the following URLs:

```text
https://raw.githubusercontent.com/Gzh0821/pvzg_site/refs/heads/main/src/.vuepress/public/jsons/schema/gpn-worldmap.schema.json

https://pvzge.com/jsons/schema/gpn-worldmap.schema.json
```

The filename can be:

- `gpn-worldmap.json`
- `gpn-worldmap.json5`

## Recommended Style

In the current `replace` mode, the recommended structure is:

- `mainline`: write the main progression as a separate array
- `branches`: write side branches as a separate array

The main progression order is determined by the order of the `mainline` array, and branches are determined by the `children` property of mainline nodes.

Example:

```json5
{
  apiVersion: 1,
  worlds: {
    egypt: {
      data: {
        epicTarget: 'epic_egypt',
      },
      map: {
        mode: 'replace',
        reuseOriginalPositions: true,
        mainline: [
          {
            id: 'lvl-1',
            type: 'level',
            appearance: 'normal',
            levels: ['egypt1'],
            title: '1',
          },
          {
            id: 'plant-a',
            type: 'plant',
            template: { type: 'plant' },
            plantReward: 'repeater',
          },
          {
            id: 'lvl-2',
            type: 'level',
            appearance: 'normal',
            levels: ['egypt2'],
            title: '2',
            children: ['branch-2-1'],
          },
        ],
        branches: [
          {
            id: 'branch-2-1',
            type: 'level',
            appearance: 'normal',
            levels: ['egypt20_1'],
            title: '2-1',
            relativePosition: { x: 220, y: 180 },
          },
        ],
      },
    },
  },
}
```

## `replace` Mode

When `map.mode` is `replace`:

- the main-map nodes are fully determined by the declared `mainline` and `branches`
- the order of the `mainline` array is the main progression order
- nodes inside `branches` do not automatically appear on the mainline; they must be explicitly connected through a mainline node's `children`
- `children` mainly handles "extra branch connections"
- vanilla main-map nodes are removed
- Endless entrances keep their original positions by default. Under the world’s `endlessLayout.placements`, use the entrance level ID to set a `position` or specify `follow` with an optional `offset`. For a replacement map, list the entrances to retain in `endlessLayout.keep`.

For a partial edit, omit `map` and use `nodes`, `addNodes` or `removeNodes` on the world to edit, add or remove individual nodes.

## Node Position

You can use `position` or `relativePosition` to control where a node appears on the map.  
`position` is an absolute coordinate, while `relativePosition` is an offset relative to the parent node.

If a node does not explicitly declare a position:

- mainline nodes will first try to reuse the original vanilla mainline position by **array index**
- if no reusable position exists, it falls back to auto-layout

For branch nodes, it is still recommended to write:

- `relativePosition`

That is, an offset relative to the parent node, which is usually easier than writing absolute coordinates by hand.

## Node Types

The current `type` values are:

- `level`
- `plant`
- `giftBox`
- `upgrade`
- `epicPortal`

### `level`

Ordinary stages and boss stages, including smaller boss stages, all belong to the `level` type.

Common `appearance` values:

- `normal`
- `gargantuar`
- `zomboss`

For example:

- the appearance of vanilla Egypt level 8 can use `appearance: 'gargantuar'`
- the Zomboss-island appearance of vanilla Egypt 25 / 35 can use `appearance: 'zomboss'`

Please note:

- for boss stages and smaller boss stages, use a vanilla level id to anchor the template, otherwise the appearance or layout may become incorrect

For example, Egypt level 8:

```json5
{
  "id": "mini-boss-main",
  "type": "level",
  "appearance": "gargantuar",
  "template": {
    "levelId": "egypt8"
  },
  "levels": [
    "egypt8"
  ],
  "title": "8"
},
```

### Other Node Types

These node types need an explicit template declaration:

```json5
template: { type: 'plant' }
template: { type: 'upgrade' }
template: { type: 'giftBox' }
template: { type: 'epicPortal' }
```

Below are some examples. Plant node:

```json5
{
  "id": "plant-a",
  "type": "plant",
  "template": {
    "type": "plant"
  },
  "plantReward": "repeater"
}
```

Upgrade node:

```json5
{
  "id": "upgrade-main",
  "type": "upgrade",
  "template": {
    "type": "upgrade"
  },
  "upgradeReward": "upgrade_starting_sun_lvl2"
}
```

Reward node:

```json5
{
  "id": "gift-main",
  "type": "giftBox",
  "template": {
    "type": "giftBox"
  }
},
```

Portal node:

```json5
{
  "id": "portal-main",
  "type": "epicPortal",
  "template": {
    "type": "epicPortal"
  },
  "portalLevels": [
    "squash1",
    "squash2"
  ]
},
```

Gift boxes and portals need a matching template in the current world. Use level IDs from the destination world in `portalLevels`.

## World-Level `data`

In addition to `map`, you can also modify world-level data for each world:

- `levels`
- `plants`
- `startingLevels`
- `epicTarget`
- `intro`

The most common one is:

- `epicTarget`: which epic world the epic portal finally leads to

If you omit `levels / plants / startingLevels` in `replace` mode, GP-Next will also try to derive them automatically from the node list.

## Recommended Debugging Checklist

If the map does not display as expected after you finish writing it, check these first:

1. Check that World Map and the map pack are enabled and that the pack declares `gp-extension.worldmap` as a dependency
2. Confirm that the filename is `gpn-worldmap.json5` or `gpn-worldmap.json`
3. Confirm that the top level contains `apiVersion: 1`
4. Confirm that the key under `worlds` is the correct world `CODENAME`
5. If it is a special island, prefer using a precise `template` anchor

## Next

- Want to review the datapack folder first: read [Datapacks and `pack.json`](./gp-next-datapack.md)
- Want to review ordinary JSON patch rules: read [Merge Rules](./gp-next-merge.md)
- Want to inspect original data first: read [Source Data](./gp-next-json.md)
