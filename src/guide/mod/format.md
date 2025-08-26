---
title: 属性参考(latest)
icon: file-invoice
pageInfo: false
index: true
order: 2
---

<script setup>
    import { onMounted } from 'vue';
    onMounted(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    })
</script>

> [!warning]
> 以下教程仅适用于`0.3.X`-`0.4.X`版本。

> [!important]
> 表格中，斜体的属性为不建议修改的字段，修改后可能会导致游戏崩溃或无法正常运行。

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-7637695321442015"
     data-ad-slot="3900516289"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

## 植物文件

以下是植物 JSON 文件的格式，此处以爆裂葡萄为例。

多语言的属性不能删除或添加额外字段，格式必须如下:

```json
{
  "en": "English",
  "zh": "中文"
}
```

### PlantFeatures.json

PlantFeatures.json 文件包含植物的基本特性。

`PLANTS` 数组中的每个植物都包含以下基本特性字段:

| 属性               | 示例内容                                  | 说明                                                                                  |
| ------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------- |
| **ID**             | 74                                        | 植物在游戏内的唯一 id 值                                                              |
| **NAME**           | `{ "en": "Grapeshot", "zh": "爆裂葡萄" }` | 多语言名称，`en`为英文名，`zh`为中文名                                                |
| _\_CARDSPRITENAME_ | "grapeshot"                               | 卡牌图标资源名称(对应游戏资源文件)                                                    |
| _CODENAME_         | "grapeshot"                               | 植物的唯一标识符(关键字段，用于 GE Patcher 合并)                                      |
| _TYPE_             | `["plant", "lastStandDisallowed"]`        | 植物类型:<br>- `plant`:普通植物<br>- `lastStandDisallowed`:不可在"最终防线"模式中使用 |
| **OBTAINWORLD**    | "market"                                  | 背景图片所在的世界                                                                    |
| **ZENGARDEN**      | `{ "PlantPlace": "dirt" }`                | 禅境花园种植位置:<br>- `dirt`:普通土地                                                |
| _COSTUME_          | 2                                         | 皮肤数量                                                                              |

`SEEDCHOOSERDEFAULTORDER` 数组用于指定植物在选择界面中的默认顺序，每一项的值均为植物的`CODENAME`。

`BASEUNLOCKLIST` 数组包含所有指定初始解锁的植物，每一项的值均为植物的`CODENAME`。

### PlantAlmanac.json

PlantAlmanac.json 文件包含植物的图鉴信息。

`objects` 数组中的每一项都包含 `aliases`, `objclass` 和 `objdata`。

其中，`aliases` 数组包含植物的 `CODENAME` ，用于表示该项对应的植物。`objclass` 的值为 `PlantAlmanacProperties`， 表示该项为植物图鉴属性。

`objdata` 包含以下图鉴信息字段:

| 字段                  | 值/内容                                                                                                                                    | 说明                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| _Elements_            | 包含多个属性标签:<br>- `SUNCOST`:阳光消耗<br>- `RECHARGE`:冷却时间<br>- `DAMAGE`:伤害值(1800)<br>- `AREA`:范围(3x3)<br>- `FAMILY`:所属家族 | 图鉴中展示的关键属性标签         |
| **Introduction**      | `{ "en": "...", "zh": "爆炸后向 8 个方向发射弹性葡萄子弹" }`                                                                               | 植物功能的多语言描述             |
| _Special_             | `{ "NAME": {"en":"...","zh":"..."}, "DESCRIPTION": {"en":"...","zh":"..."} }`                                                              | 特殊机制说明                     |
| **Chat**              | `{"en":"...","zh":"..."}`                                                                                                                  | 多语言，植物的个性台词           |
| **BriefIntroduction** | `{ "en": "Explodes...", "zh": "爆炸并发射弹射子弹" }`                                                                                      | 多语言，简短的功能摘要           |
| **DisplayOffset**     | `{ "x": 0, "y": 0 }`                                                                                                                       | 显示位置偏移量(调整图鉴中的坐标) |

### PlantProps.json

PlantProps.json 文件包含植物的数值属性。

`objects` 数组中的每一项都包含 `aliases`, `objclass` 和 `objdata`。

其中，`aliases` 数组包含植物的 `CODENAME` ，用于表示该项对应的植物。`objclass` 的值为 `PlantProperties`， 表示该项为植物数值属性。

`objdata` 包含以下数值属性字段，各个植物有效的 Props 可查看[图鉴](../../almanac/):

| 属性                          | 值/内容     | 说明                               |
| ----------------------------- | ----------- | ---------------------------------- |
| **CannotBeSheepenedByWizard** | true        | 免疫巫师僵尸的"变羊"技能           |
| **Damage**                    | 1800        | 基础伤害值                         |
| **Cooldown**                  | 35          | 冷却时间(单位:秒)                  |
| **CooldownFrom**              | 1           | 冷却开始时间(表示初始的冷却值)     |
| **SunCost**                   | 150         | 种植所需阳光                       |
| **Toughness**                 | 300         | 植物基础生命值                     |
| **Family**                    | "Explosive" | 所属家族(可能影响家族增益效果)     |
| **ImmuneToIceblock**          | true        | 免疫冰冻效果(如冰鼬僵尸的冰冻攻击) |

## 商店文件

`StoreCommodityFeatures.json` 文件包含商店的商品信息，有`Plants`、`Upgrade`、`Gem` 和 `Coin` 四个数组，表示不同类型的商品信息。

### Plants

`Plants` 数组包含植物商品的信息。

| 字段                 | 类型   | 说明                    |
| -------------------- | ------ | ----------------------- |
| _CommodityType_      | string | 固定值"plant"           |
| **CommodityName**    | string | 植物的 CODENAME         |
| **CurrencyType**     | string | 货币类型("gem"或"coin") |
| **CurrencyRequired** | number | 需要支付的货币数量      |
| _UnlockLevel_        | string | 在某个关卡解锁          |

**示例:寒冰射手商品**

```json
{
  "CommodityType": "plant",
  "CommodityName": "snowpea",
  "CurrencyType": "gem",
  "CurrencyRequired": 25
}
```

### Upgrade

`Upgrade` 数组包含植物升级商品的信息。

| 字段                 | 类型   | 说明                    |
| -------------------- | ------ | ----------------------- |
| _CommodityType_      | string | 固定值"upgrade"         |
| **CommodityName**    | string | 升级项的 CODENAME       |
| **CurrencyType**     | string | 货币类型("gem"或"coin") |
| **CurrencyRequired** | number | 需要支付的货币数量      |

**示例:铲子升级**

```json
{
  "CommodityType": "upgrade",
  "CommodityName": "upgrade_sunshovel_lvl3",
  "CurrencyType": "gem",
  "CurrencyRequired": 20
}
```

### Gem

`Gem` 数组包含钻石商品的信息。

| 字段                     | 说明                    |
| ------------------------ | ----------------------- |
| _CommodityType_          | 固定值"gem"             |
| CommodityCount           | 获得的钻石数量          |
| **CurrencyType**         | 货币类型("gem"或"coin") |
| CurrencyRequired         | 需要支付的货币数量      |
| _StackLevel_             | 商品包等级              |
| **CommodityDisplayName** | 商品显示名称(多语言)    |

**示例:调整钻石包**

```json
{
  "CommodityType": "gem",
  "CommodityCount": 10,
  "CurrencyType": "coin",
  "CurrencyRequired": 300000,
  "StackLevel": 4,
  "CommodityDisplayName": {
    "en": "Ultimate Gem Pack!",
    "zh": "终极钻石包！"
  }
}
```

### Coin

`Coin` 数组包含金币商品的信息。

| 字段                     | 说明                    |
| ------------------------ | ----------------------- |
| _CommodityType_          | 固定值"coin"            |
| CommodityCount           | 获得的金币数量          |
| **CurrencyType**         | 货币类型("gem"或"coin") |
| CurrencyRequired         | 需要支付的货币数量      |
| _StackLevel_             | 商品包等级              |
| **CommodityDisplayName** | 商品显示名称(多语言)    |
