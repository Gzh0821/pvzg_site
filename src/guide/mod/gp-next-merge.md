---
title: 合并
icon: code-merge
pageInfo: false
index: true
order: 3
---

# 合并规则

很多新手第一次写补丁时，最容易犯的错是：  
把原始 JSON 整份复制出来再改一点点。

这在 GP-Next 里通常不是最好的做法，因为游戏更新后，你整份复制的旧数据很容易把新的字段覆盖掉。

## 原则

**只写你真的想改的字段。**

GP-Next 会把你的 JSON 和游戏原始数据做深度合并。  
没有提到的字段，会尽量保持原样。

## 类型

## Features

例如：

- `PlantFeatures`
- `ZombieFeatures`
- `StoreCommodityFeatures`
- `WorldmapFeatures`
- `MintObtainRoute`

这些文件不是靠数组下标合并，而是靠“标识字段”定位条目。

### 常见标识字段

- 大多数 Features：`CODENAME`
- `MintObtainRoute`：`Family`
- `StoreCommodityFeatures.Plants / Upgrade`：`CommodityName`

### 特别注意 `StoreCommodityFeatures`

它不是一个简单数组，而是多个并列区段：

- `Plants`
- `Upgrade`
- `Gem`
- `Coin`
- `Zen`

其中：

- `Plants` / `Upgrade`：按条目合并
- `Gem` / `Coin` / `Zen`：通常按整个数组替换

## Objects

例如：

- `PlantProps`
- `ZombieProps`
- `PlantAlmanac`
- `ZombieAlmanac`

这类文件的定位方式通常是：

- 进入 `objects` 数组
- 找到 `aliases[0]` 与你填写的别名一致的条目

也就是说，你要改某个植物，通常写的是它的第一个 `aliases`。

## Levels

关卡文件是例外。

`levels/*.json` 一般按**整文件替换**处理，不走常规的“只改一个字段就深度合并”的思路。

## 数组

这是最容易踩坑的地方：

**GP-Next 里数组默认是整体替换，不是按索引逐项合并。**

例如你要改：

- 僵尸池 `Basic_Zombie`
- 植物解锁列表 `PLANTS`
- `SEEDCHOOSERDEFAULTORDER`

那就应该写出**完整的新数组**，而不是只写你想追加的一项。

## 示例

只改豌豆射手的阳光和冷却：

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

这个写法的优点是：

- 不会覆盖整个 `PlantProps`
- 只会影响 `peashooter`
- 只会改 `SunCost` 和 `Cooldown`

## 适合整体替换的情况

下面这些情况，通常就应该接受“整体替换”：

- 你在改数组
- 你在改整张关卡
- 你在改商店某些整体列表

## 适合局部修改的情况

下面这些情况，应该尽量只写局部字段：

- 单个植物数值
- 单个僵尸数值
- 单条图鉴文本
- 单个商店商品的价格

## 写补丁时可以这样做

1. 先在 **Data** 页确认目标条目的真实结构
2. 只提取你需要的最小字段
3. 写成单独 patch
4. 重载后再回 Data 页确认

## 下一步

- [Datapack 与 `pack.json`](./gp-next-datapack.md)
- [多语言与 `lang.json`](./gp-next-language.md)
- [类型与字段参考](./format.md)
