---
title: World Map
icon: map-location-dot
pageInfo: false
index: true
order: 6
---

# World Map and `gpn-worldmap.json5`

> [!warning]
> This feature is currently still listed under the **Experimental** tab in GP-Next.  
> Before using it, enable `worldmap-json` in the in-game **Experimental** page.

If you want to change the nodes, links, branches, and reward-point order that players actually see on the world map, editing ordinary `WorldmapFeatures` is not enough. You should use:

```text
jsons/worldmap/gpn-worldmap.json5
```

This is very different from normal data patches:

- `features/WorldmapFeatures.json5`: changes raw world data such as `LEVELS`, `PLANTS`, `STARTINGLEVELS`, and `EPIC_TARGET`
- `worldmap/gpn-worldmap.json5`: changes the runtime island graph that the world map actually renders

In simple terms:

- if you want to change which levels, plants, or intro data a world has, start with `WorldmapFeatures`
- if you want to insert a plant node after level 1, move a gift box onto the mainline, or rebuild branch structure, use `gpn-worldmap`

## Minimal File

The current format requires a top-level `apiVersion`, and right now only version `1` is accepted:

```json
{
  "apiVersion": 1,
  "worlds": {
    "egypt": {
      "map": {
        "mode": "replace",
        "mainline": []
      }
    }
  }
}
```

Preferred filename:

- `gpn-worldmap.json5`

If you want plain JSON instead of JSON5, you can also use:

- `gpn-worldmap.json`

## Where It Goes

Inside a datapack, the layout usually looks like this:

```text
MyWorldmapPack/
├── pack.json
└── jsons/
    ├── features/
    ├── levels/
    └── worldmap/
        └── gpn-worldmap.json5
```

## Recommended Shape

The current recommended `replace` shape is:

- `mainline`: a separate main progression array
- `branches`: a separate branch array

The main progression order comes directly from the order of `mainline`. You do not need to put the next mainline node into `children`.

Minimal example:

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

## What `replace` Does

When `map.mode` is `replace`:

- the visible main graph is fully defined by your `mainline` and `branches`
- `mainline` array order defines progression order
- `children` is mainly for extra side links
- the original vanilla main-map islands are removed
- endless islands are still kept vanilla and are not authored here

This is why the separate `mainline` array is now the preferred structure.  
It avoids the old problem where inserting plant or reward nodes could scramble both progression order and reused positions.

## Position Rules

If a node does not explicitly define `position`:

- mainline nodes first try to reuse vanilla mainline positions by **mainline array index**
- if no reusable original position exists, GP-Next falls back to auto layout

For branch nodes, `relativePosition` is usually the better choice.

## Common Node Types

Common `type` values:

- `level`
- `plant`
- `giftBox`
- `upgrade`
- `epicPortal`

### `level`

Ordinary stages, bosses, and mini-boss islands are all still `type: 'level'`. The difference is mainly their appearance.

Common `appearance` values:

- `normal`
- `gargantuar`
- `zomboss`

For example:

- the vanilla Egypt level 8 "small boss" island uses the `gargantuar` family
- the vanilla Egypt level 25 / 35 Zomboss islands use `zomboss`

Important lesson:

- `appearance` is only a broad visual family, not a unique template identity
- if a world has multiple islands of the same broad family with different layouts, anchor the template by a real vanilla level id

Safer Egypt examples:

```json5
template: { levelId: 'egypt8' }
template: { levelId: 'egypt35' }
```

### `giftBox` and `epicPortal`

These two node types now render correctly, but unlike ordinary `level` nodes, they should usually declare an explicit template:

```json5
template: { type: 'giftBox' }
template: { type: 'epicPortal' }
```

GP-Next now restricts these selectors to real vanilla special-node candidates, instead of loosely matching unrelated runtime islands.

## World-Level `data`

Besides `map`, you can also override some world-level fields:

- `levels`
- `plants`
- `startingLevels`
- `epicTarget`
- `intro`

The most common ones are:

- `epicTarget`: which epic world an epic portal finally leads to
- `intro`: the intro feature key for the world

If you omit `levels / plants / startingLevels` in `replace` mode, GP-Next will try to derive them from the node list.

## Current Known Limits

### 1. Do not customize endless islands yet

Endless islands are still kept vanilla for now.

The issue is not just "template not found". Endless islands are still `level` islands internally, but also depend on:

- `EndlessZoneEntrance.levelsID`
- world-specific large-island templates

If you try to replace them like ordinary nodes, you can easily get:

- multiple endless islands overlapping
- extra blue normal-stage nodes appearing
- endless entrances attached to the wrong island

So the current advice is simple:

- you can customize the main map
- leave endless islands vanilla for now

### 2. `giftBox` rewards cannot be precisely configured here yet

World-map gift-box rewards are not on the same chain as ordinary level-clear rewards.  
So this is not something reliably controlled by simply editing level JSON.

For now, do not invent fields like:

```json
{
  "giftReward": "..."
}
```

GP-Next does not currently expose deterministic gift-box reward control through `gpn-worldmap.json5`.

## When To Use `WorldmapFeatures` vs `gpn-worldmap`

A practical rule:

- if you want to change which levels, plants, or epic target a world has, look at `WorldmapFeatures`
- if you want to change node order, mainline/branch structure, or where gift boxes and portals appear, use `gpn-worldmap`

Many world-map mods will end up using both:

- one patch for `WorldmapFeatures`
- one patch for `gpn-worldmap`

## Recommended Debug Checklist

If the map does not show what you expect, check these first:

1. confirm `worldmap-json` is enabled in the **Experimental** tab
2. confirm the filename is `gpn-worldmap.json5` or `gpn-worldmap.json`
3. confirm the top-level `apiVersion: 1` is present
4. confirm the key under `worlds` is the correct world `CODENAME`
5. if a special island looks wrong, try a more precise `template` anchor

## Next

- Want the datapack folder basics first: read [Datapacks and `pack.json`](./gp-next-datapack.md)
- Want ordinary JSON patch rules: read [Merge Rules](./gp-next-merge.md)
- Want to inspect original data before writing patches: read [Source Data](./gp-next-json.md)
