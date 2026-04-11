---
title: 合并
icon: code-merge
pageInfo: false
index: true
order: 3
---

# `merge / replace`

GP-Next 的普通 JSON 补丁，现在可以分成两种文件级模式：

- `merge`
- `replace`

如果你只记一句话：

- `merge`：只写你想改的部分
- `replace`：你接管这个类型的整份 JSON

这页专门讲这两个模式怎么区别、怎么配置、什么时候该用哪一个。

## 默认行为

默认情况下，GP-Next 对普通 JSON 补丁的处理是：

- `features` / `objects`：按 `merge`
- `levels`：按整文件替换理解
- `lang`：继续深度合并到 `MultiLanguage.lyrics`
- `worldmap`：属于 GP-Next 自己的运行时系统，不走这里这套规则

所以这页主要讨论的是：

- `jsons/features/*.json`
- `jsons/objects/*.json`

## `merge` 是什么

`merge` 是 GP-Next 原本的默认思路。

它的目标是：

- 尽量保留游戏原始 JSON
- 只覆盖你明确写出来的字段
- 让补丁尽量短，也更容易兼容后续游戏更新

例如你只想改一个植物的数值，就应该优先用 `merge`。

```json
{
  "objects": [
    {
      "aliases": ["peashooter"],
      "objclass": "PlantProperties",
      "objdata": {
        "SunCost": 50,
        "Cooldown": 2
      }
    }
  ]
}
```

这个补丁不会重写整份 `PlantProps`，只会改 `peashooter` 的这两个字段。

## `replace` 是什么

`replace` 表示：

- 不再按 GP-Next 的普通合并规则处理这个类型
- 直接用你的补丁文件，替换游戏原始的整份该类型 JSON

它适合这些场景：

- 你想完全重做商店内容
- 你想明确移除原版的大量条目
- 你不想保留这个类型里任何原版旧内容

也就是说，`replace` 不是“只覆盖得更狠一点”，而是“这个类型现在由你的文件整体接管”。

## 怎么配置

文件放在：

```text
jsons/config/patching.json
```

最小示例：

```json
{
  "defaultMode": "merge",
  "features": {
    "StoreCommodityFeatures": { "mode": "replace" }
  },
  "objects": {
    "PlantProps": { "mode": "replace" }
  }
}
```

含义是：

- 未写到的类型默认按 `merge`
- `StoreCommodityFeatures` 整份按 `replace`
- `PlantProps` 整份按 `replace`

## 当前支持范围

当前这套配置只作用于：

- `features`
- `objects`

也就是说：

- `features/PlantFeatures.json`
- `features/StoreCommodityFeatures.json`
- `objects/PlantProps.json`
- `objects/ZombieProps.json`

这些可以通过 `patching.json` 指定 `merge / replace`。

而下面这些不在这套规则里：

- `levels`
- `lang`
- `worldmap`

## 配置规则

当前规则很简单：

- `features` 和 `objects` 下按“类型名”写
- 未列出的类型使用 `defaultMode`
- 不写 `defaultMode` 时，默认值是 `merge`
- 目前只支持 `merge` 和 `replace`

例如：

```json
{
  "features": {
    "StoreCommodityFeatures": { "mode": "replace" }
  }
}
```

这表示只把 `StoreCommodityFeatures` 切到 `replace`，其它类型继续走默认行为。

## `merge` 时 GP-Next 在做什么

### Features

Features 文件不是按数组下标合并，而是按标识字段找条目。

常见情况：

- 大多数 Features：`CODENAME`
- `MintObtainRoute`：`Family`
- `StoreCommodityFeatures.Plants / Upgrade`：`CommodityName`

### Objects

Objects 文件通常在 `objects` 数组里，按：

- `aliases[0]`

来定位目标条目。

所以你要改某个植物或僵尸，通常是写它的第一个 alias。

## 数组要特别注意

即使在 `merge` 模式里，数组也不是按索引逐项合并。

**GP-Next 里的数组默认仍然是整体替换。**

例如这些内容，通常都要写完整新数组：

- 僵尸池
- `PLANTS`
- `SEEDCHOOSERDEFAULTORDER`
- 某些整段商店列表

所以“`merge`”不等于“所有东西都自动聪明追加”。  
它只是对象字段按规则合并，而数组仍然以替换为主。

## 特别注意 `StoreCommodityFeatures`

`StoreCommodityFeatures` 不是单一数组，而是多个并列区段：

- `Plants`
- `Upgrade`
- `Gem`
- `Coin`
- `Zen`

在普通 `merge` 里：

- `Plants` / `Upgrade`：按 `CommodityName` 合并条目
- `Gem` / `Coin` / `Zen`：通常按整个数组替换

如果你想“整个商店完全按你自己的版本来”，那 `replace` 往往比继续和原版混合更清楚。

## 什么时候该选 `merge`

更适合 `merge` 的情况：

- 只改个别植物 / 僵尸数值
- 只改少量图鉴文本或描述
- 只改个别商店商品价格
- 希望尽量兼容以后游戏更新新增的字段

一句话：

**能只改局部，就优先用 `merge`。**

## 什么时候该选 `replace`

更适合 `replace` 的情况：

- 你要彻底重做某个类型
- 你明确希望删除大量原版内容
- 你不想让原版同类型 JSON 继续参与结果
- 你已经准备好维护这一整份类型数据

一句话：

**当你要“接管整个类型”时，再用 `replace`。**

## 一个实用判断法

可以这样快速判断：

1. 你只是想改少量字段吗？
2. 你希望原版未来新增字段尽量自动保留吗？
3. 你不想维护整份 JSON 吗？

如果这三题大多是“是”，那就用 `merge`。

反过来：

1. 你已经准备好自己维护整份类型文件了吗？
2. 你希望原版旧内容不要再混进来吗？
3. 你就是想整体重做这一类内容吗？

如果这三题大多是“是”，那就用 `replace`。

## 推荐工作流

1. 先在 **Data** 页确认目标条目的真实结构
2. 先默认按 `merge` 写最小补丁
3. 如果发现需求本质上是“整类接管”，再切到 `replace`
4. 重载后回 **Data** 页确认最终结果

## 下一步

- [目录与优先级](./gp-next-files.md)
- [Datapack 与 `pack.json`](./gp-next-datapack.md)
- [多语言与 `lang.json`](./gp-next-language.md)
- [类型与字段参考](./format.md)
