---
title: 地图
icon: map-location-dot
pageInfo: false
index: true
order: 6
---

> [!warning]
> 这项能力目前仍归类在 GP-Next 的 **Experimental / 实验性** 页。  
> 使用前请先在游戏里的 **Experimental** 页启用 `worldmap-json`。
> 实验性功能可能随时变动，使用前请务必备份存档。

如果你想自定义世界地图，可以使用：

```text
jsons/worldmap/gpn-worldmap.json
```

## 目录

```text
MyPack/
├── pack.json
└── jsons/
    ├── features/
    ├── levels/
    └── worldmap/
        └── gpn-worldmap.json
```

也可以使用 gpn-worldmap.json5。

## 最小示例

当前格式要求顶层包含 `apiVersion`，并且目前只接受第 `1` 版：

```json
{
  "$schema": "https://raw.githubusercontent.com/Gzh0821/pvzg_site/refs/heads/main/src/.vuepress/public/jsons/schema/gpn-worldmap.schema.json",
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

`$schema` 可以帮助你在编辑器，如 `vscode` 中获得字段提示和校验支持，你可以使用下面任意一个地址：

```text
https://raw.githubusercontent.com/Gzh0821/pvzg_site/refs/heads/main/src/.vuepress/public/jsons/schema/gpn-worldmap.schema.json

https://pvzge.com/jsons/schema/gpn-worldmap.schema.json
```

文件名可以使用：

- `gpn-worldmap.json`
- `gpn-worldmap.json5`

## 推荐写法

当前 `replace` 模式推荐用：

- `mainline`：单独写主线数组
- `branches`：单独写支线数组

主线顺序由 `mainline` 的数组顺序决定，支线由主线节点的 `children` 属性决定。

示例：

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

## `replace` 模式

当 `map.mode` 为 `replace` 时：

- 主图节点由声明的 `mainline` 和 `branches` 完全决定
- `mainline` 数组顺序就是主线推进顺序
- `branches` 里的节点不会自动出现在主线里，必须通过主线节点的 `children` 显式连接
- `children` 主要只负责“额外的支线连接”
- 原版主图节点会被移除
- 无尽岛仍然保留原版，不由这里自定义

## 节点位置

你可以使用 `position` 或 `relativePosition` 来控制节点在地图上的位置。
`position` 是绝对坐标，`relativePosition` 是相对父节点的偏移。

如果节点没有显式声明位置：

- 主线节点会优先按 **数组下标** 复用原版主线位置
- 如果没有可复用位置，回退到自动布局

支线节点更推荐写：

- `relativePosition`

也就是“相对父节点偏移”，一般比手写绝对坐标更省心。

## 节点类型

当前 `type` 有：

- `level`
- `plant`
- `giftBox`
- `upgrade`
- `epicPortal`

### `level`

普通关卡及Boss关卡（小型Boss关卡）都属于 `level` 类型。

常见 `appearance`：

- `normal`
- `gargantuar`
- `zomboss`

例如：

- 原版埃及第 8 关的外观可以用 `appearance: 'gargantuar'`
- 原版埃及第 25 / 35 关的僵王岛外观可以用 `appearance: 'zomboss'`

需要注意：

- 对于Boss关卡（小型Boss关卡），请使用原版关卡 id 锚定模板，否则会有外观/布局错乱的问题。

例如，埃及第 8 关：

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

### 其它节点

此类节点需要显式声明模板：

```json5
template: { type: 'plant' }
template: { type: 'upgrade' }
template: { type: 'giftBox' }
template: { type: 'epicPortal' }
```

下面给出一些示例，植物节点：

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

升级节点：

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

奖励节点：
```json5
{
  "id": "gift-main",
  "type": "giftBox",
  "template": {
    "type": "giftBox"
  }
},
```

传送门节点：
```json5
{
  "id": "portal-main",
  "type": "epicPortal",
  "template": {
    "type": "epicPortal"
  },
  "portalLevels": [
    "egypt_epic_1",
    "egypt_epic_2"
  ]
},
```

这些节点受原版特殊节点位置的限制，因此，请避免插入过多此类节点。

## 世界级数据 `data`

除了 `map`，也可以修改每个世界的世界级数据：

- `levels`
- `plants`
- `startingLevels`
- `epicTarget`
- `intro`

最常见的是：

- `epicTarget`：史诗传送门最终通向哪个史诗世界

如果你在 `replace` 模式里省略 `levels / plants / startingLevels`，GP-Next 也会尝试从节点列表自动推导。

## 推荐调试方式

如果你写完后地图没有按预期显示，优先排查：

1. 确认 **Experimental** 页已经启用 `worldmap-json`
2. 确认文件名是 `gpn-worldmap.json5` 或 `gpn-worldmap.json`
3. 确认顶层写了 `apiVersion: 1`
4. 确认 `worlds` 下的 key 是正确的世界 `CODENAME`
5. 如果是特殊岛，优先给 `template` 写精确锚点

## 下一步

- 想先看 datapack 目录：读 [数据包与 `pack.json`](./gp-next-datapack.md)
- 想查普通 JSON 补丁规则：读 [JSON 合并规则](./gp-next-merge.md)
- 想先导出原始数据对照：读 [游戏数据](./gp-next-json.md)
