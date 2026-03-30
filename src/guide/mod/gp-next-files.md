---
title: 目录
icon: folder-tree
pageInfo: false
index: true
order: 2
---

# 目录与优先级

GP-Next 的所有模组相关文件，都放在游戏数据目录下的 `gp-next/` 文件夹中。

你可以在游戏里打开 **Patcher** 页，然后点击“打开目录”直接跳转过去。

## 目录结构

```text
com.pvzge.app/
└── gp-next/
    ├── settings.json
    ├── packs/
    │   ├── MyPack/
    │   │   ├── pack.json
    │   │   └── jsons/
    │   │       ├── features/
    │   │       ├── lang/
    │   │       ├── objects/
    │   │       └── levels/
    │   └── AnotherPack.zip
    ├── patches/
    │   └── jsons/
    │       ├── features/
    │       ├── lang/
    │       ├── objects/
    │       └── levels/
    └── __gpn_edits/
```

## 目录说明

### `packs/`

这是最推荐使用的主目录。

- 可以放完整数据包文件夹
- 也可以直接放 `.zip` 包
- 适合做正式模组、分享给别人、长期维护

### `patches/`

这是旧式“散装 JSON 补丁”目录。

- 主要用于兼容历史工作流
- 不需要写 `pack.json`
- 优先级高于 `packs/`

如果你只是临时测试一个单独 JSON，这里会更快；如果准备长期维护或分享给别人，更适合放进 `packs/`。

### `__gpn_edits/`

这是 **Data 页手动编辑** 的保存位置。

- 你在游戏里直接改的数据，最终会写到这里
- 它的优先级最高
- 适合快速试错和微调
- 不适合当作正式对外发布的模组结构

### `settings.json`

这是 GP-Next 自己的本地设置文件。

它主要保存：

- 数据包顺序
- 哪些包被禁用
- 其它和面板相关的本地配置

## 优先级

GP-Next 的覆盖顺序可以概括为：

1. `packs/`
2. `patches/`
3. `__gpn_edits/`

也就是说，越往后优先级越高。

## 补充规则

### `packs/` 内部

`packs/` 里的多个数据包，会先根据保存的排序与启用状态加载；同层比较时，会参考 `pack.json` 里的 `priority`。

一般来说你只需要记住：

- **较小的 `priority` 更早加载**
- **后加载的内容可以覆盖先加载的内容**

### `patches/`

`patches/` 的设计目标是“兼容旧流程”，所以它天然高于普通数据包。

### `__gpn_edits/`

这是“你在 Data 页亲手改过的东西”，系统默认认为它应该盖过前面所有来源。

## 怎么分

### `packs/`

- 你打算长期维护的模组
- 你要分享给其他玩家的内容
- 多文件、多类型、带说明和封面的完整模组

### `patches/`

- 单文件试验
- 从旧 gePatcher 工作流迁移时的过渡内容

### `__gpn_edits/`

- 快速试数值
- 临时修错
- 验证某个字段有没有效果

## 下一步

- [JSON 合并规则](./gp-next-merge.md)
- [Datapack 与 `pack.json`](./gp-next-datapack.md)
