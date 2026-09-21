---
title: 植物等级
icon: seedling
pageInfo: false
index: true
order: 7.5
---

# 植物等级

> [!warning]
> 这项能力目前仍归类在 GP-Next 的 **Experimental / 实验性** 页。  
> 使用前请先在游戏里的 **Experimental** 页启用 `plant-level-system`。
> 实验性功能可能随时变动，使用前请务必备份存档。

GP-Next 现在已经有一套实验性的“植物等级”系统。

它的核心思路不是直接修改原版植物本体，而是：

- 选一个**基础植物**
- 为不同等级准备对应的**克隆植物**
- 用 `jsons/extensions/plant-levels.json` 把“基础植物 ↔ 各等级 clone”绑定起来

这样做的好处是：

- 每一级都可以有自己独立的 `PlantProps / PlantAlmanac / PlantTypes`
- 徽标、图鉴等级页、运行时选卡替换都能统一走同一套映射
- 不需要去改游戏构建产物

## 先看当前阶段

当前版本更适合做：

- 等级数据注册
- 等级徽标显示
- 图鉴中的等级页查看
- 基础植物入口按已选等级替换为对应 clone

目前还不建议把它理解成“完整原版 PvZ2 升级系统复刻”。

尤其是：

- 升级资源来源
- 完整的升级经济闭环
- 更复杂的成长界面

这些仍在继续完善。

## 使用前先开启哪些开关

在游戏中打开 GP-Next 面板后：

1. 进入 `Experimental`
2. 开启 `plant-level-system`

通常也建议在 `设置 -> 运行时扩展` 中保持：

- `Dynamic Plant Registry` 开启

如果你的等级线用到了新增植物或克隆植物，这一点尤其重要。

## 文件结构

最常见的文件组合是：

```text
MyPack/
├── pack.json
└── jsons/
    ├── extensions/
    │   └── plant-levels.json
    ├── features/
    │   └── PlantFeatures.json5
    └── objects/
        ├── PlantTypes.json5
        ├── PlantProps.json5
        └── PlantAlmanac.json5
```

如果只是绑定现有植物，也可以只写 `plant-levels.json`。  
但只要某一级是你自己的 clone，就通常至少要同时补：

- `PlantFeatures`
- `PlantTypes`
- `PlantProps`
- `PlantAlmanac`

## `plant-levels.json` 的基本写法

推荐使用当前 GP-Next 支持的包裹结构：

```json5
{
  "$schema": "https://raw.githubusercontent.com/Gzh0821/pvzg_site/refs/heads/main/src/.vuepress/public/jsons/schema/gpn-plant-levels.schema.json",
  "plants": {
    "peashooter": {
      "levels": {
        "1": {
          "cloneCodename": "peashooter",
          "icon": "wood"
        },
        "2": {
          "cloneCodename": "peashooter_lvl2",
          "icon": "silver",
          "displayName": "LV2"
        },
        "3": {
          "cloneCodename": "peashooter_lvl3",
          "icon": "gold",
          "displayName": "LV3"
        }
      }
    }
  }
}
```

含义：

- `peashooter`：基础植物 codename
- `levels`：每一级对应哪个植物身份
- `cloneCodename`：该等级真正使用的植物 codename
- `icon`：等级徽标样式
- `displayName`：可选，自定义等级文字
- `hideText`：可选，设为 `true` 时隐藏该等级的角标文字，但保留图标

## `displayName` 可以写什么

`displayName` 现在支持两种写法：

### 1. 直接写字符串

```json5
"displayName": "LV2"
```

### 2. 写多语言对象

```json5
"displayName": {
  "en": "Level 2",
  "zh": "2级",
  "es": "Nivel 2"
}
```

如果你自己又通过语言包扩展了更多语言字段，也可以继续加对应语言代码。

## JSON Schema 在哪里，怎么用

植物等级用的 schema 文件和 worldmap 的 schema 放在站点同一级目录：

```text
src/.vuepress/public/jsons/schema/gpn-plant-levels.schema.json
```

和 worldmap 一样，可以在 `plant-levels.json` 或 `plant-levels.json5` 顶层加上 `$schema`，让编辑器（例如 `vscode`）提供字段补全和校验：

```json5
{
  "$schema": "https://raw.githubusercontent.com/Gzh0821/pvzg_site/refs/heads/main/src/.vuepress/public/jsons/schema/gpn-plant-levels.schema.json",
  "plants": {}
}
```

你可以使用下面任意一个地址：

```text
https://raw.githubusercontent.com/Gzh0821/pvzg_site/refs/heads/main/src/.vuepress/public/jsons/schema/gpn-plant-levels.schema.json

https://pvzge.com/jsons/schema/gpn-plant-levels.schema.json
```

## `icon` 目前支持哪些值

当前可用的等级图标为：

- `wood`
- `silver`
- `gold`
- `star`

如果不写，默认使用 `wood`。

## clone 的推荐做法

最推荐的做法是：

- 把基础植物保留为基础入口
- 为更高等级创建你自己的 clone codename
- 让每个等级指向你自己的 clone

例如：

- `sunflower`
- `sunflower_lvl2`
- `sunflower_lvl3`

而不是直接把高等级绑到原版其他植物上。

### 为什么不建议直接绑定到原版别的植物

例如你想做三级向日葵，行为上接近 `twinsunflower`，也更建议这样做：

- 新建 `sunflower_lvl3`
- 在 clone 数据里让它 `PlantBasedOn: "twinsunflower"`

而不是直接把等级 3 写成原版 `twinsunflower`。

这样更稳定，因为：

- 等级系统绑定的是**你自己的植物身份**
- 不会直接劫持原版卡牌
- 运行时映射更清晰

## 还需要补哪些 JSON

如果你新增了 `peashooter_lvl2` 这样的 clone，至少要保证它在以下数据里都存在：

- `PlantFeatures`
- `PlantTypes`
- `PlantProps`
- `PlantAlmanac`

否则 GP-Next 不会为它注册等级映射。

简单理解就是：

- `PlantFeatures` 定义它是谁
- `PlantTypes` 定义运行时类型
- `PlantProps` 定义数值
- `PlantAlmanac` 定义图鉴展示

## 图鉴里会看到什么

启用后，图鉴植物页会多一个 `Level` 子页。

当前主要会显示：

- 最高等级
- 当前等级
- 已解锁上限
- 当前等级对应的 codename
- 当前等级的简要描述

它更像“等级概览页”，而不是完整升级商城。

## 运行时会发生什么

当前阶段最重要的运行时行为有两条：

### 1. 基础植物入口会按已选等级替换

如果基础植物是 `peashooter`，当前选择了 3 级，那么基础入口会解析到：

- `peashooter_lvl3`

### 2. 显式 clone 仍然可以保留

你也可以在调试期保留 clone 卡片本身，这有助于：

- 检查徽标有没有挂对
- 检查图鉴有没有收进来
- 检查运行时数据是否正确

## 目前和“完整升级系统”有什么区别

当前这套更像：

- 等级身份映射层
- 徽标与图鉴展示层
- 运行时入口替换层

而不是完整的原版升级经济系统。

所以做包时最好先把重点放在：

- 每一级植物身份是不是稳定
- 各级属性是不是独立
- 图鉴显示是不是正常
- 运行时选中的等级是不是正确生效

## 一个实用建议

刚开始做时，不要一上来就把 clone 全藏起来。

更适合的调试顺序是：

1. 先让基础植物和各级 clone 都能看到
2. 检查图鉴、徽标、运行时映射
3. 确认逻辑稳定后，再决定哪些入口要隐藏

这样更容易排查问题。

## 相关页面

- [Datapack 与 `pack.json`](./gp-next-datapack.md)
- [原始数据](./gp-next-json.md)
- [类型与字段](./format.md)
- [设置与扩展](./gp-next-settings.md)
