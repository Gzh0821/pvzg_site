---
title: 数据包
icon: box-archive
pageInfo: false
index: true
order: 4
---

# 数据包与 `pack.json`

如果你希望把修改做成“像一个正式模组”的样子，而不是零散 JSON，最推荐的方式就是使用 Datapack。

## 最小结构

```text
MyFirstMod/
├── pack.json
└── jsons/
    ├── features/
    ├── lang/
    ├── objects/
    └── levels/
```

其中，`pack.json` 是必须的。

## `pack.json` 模板

```json
{
  "uuid": "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
  "name": "我的自定义模组",
  "version": "1.0.0",
  "priority": 100,
  "description": "模组的介绍信息",
  "author": "你的名字",
  "formatVersion": 1,
  "gameVersion": "0.7.1",
  "gpNextVersion": ">=1.0.0"
}
```

## 字段说明

### `uuid`

唯一标识符。

它非常重要，因为 GP-Next 需要靠它记住：

- 你的包是否被启用
- 你的包排在什么位置

建议直接去游戏里的 **Guide** 页生成。

### `name`

在 Patcher 里显示的名称。

### `version`

你这个模组自己的版本号。

### `priority`

默认加载优先级。数值越小，越早加载。

### `description`

模组描述信息。

### `author`

作者名。

### `formatVersion`

当前写 `1` 即可。

### `gameVersion`

你的模组面向的游戏版本。

### `gpNextVersion`

你的模组要求的最低 GP-Next 版本。

## 缩略图

你可以在 `pack.json` 同级放：

- `thumbnail.png`
- `thumbnail.ico`

要求：

- 正方形
- 小于 `128x128`

这样 Patcher 里的卡片会显示封面图。

## 文件夹与 ZIP

`packs/` 支持两种形式：

- 文件夹
- `.zip`

## 制作流程

1. 在 `packs/` 下创建一个新文件夹
2. 写好 `pack.json`
3. 创建 `jsons/` 及子目录
4. 放入你的补丁 JSON
5. 回到游戏点击 **Save & Reload**

## 打包分享

最常见的分享方式是压成 ZIP。

注意压缩后应该是：

```text
MyFirstMod.zip
├── pack.json
└── jsons/
```

而不是：

```text
MyFirstMod.zip
└── MyFirstMod/
    ├── pack.json
    └── jsons/
```

## 写 `pack.json` 时要注意的事

- `uuid` 一次生成后不要随便改
- `name` 是给玩家看的，尽量写清楚
- `description` 最好能直接说明这个包改了什么
- 每次重要更新记得同步修改 `version`

## 下一步

- [多语言与 `lang.json`](./gp-next-language.md)
- [数据面板、手动编辑与 Trainer](./gp-next-tools.md)
