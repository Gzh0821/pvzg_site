---
title: Attribute Reference(0.2.X)
icon: file-invoice
pageInfo: false
index: true
order: 12
---

<script setup>
    import { onMounted } from 'vue';
    onMounted(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    })
</script>

> [!caution]
> The following tutorial is only applicable to versions `0.2.8.1`-`0.2.9`.

> [!important]
> 表格中，斜体的属性为不建议修改的字段，修改后可能会导致游戏崩溃或无法正常运行。

<ins class="adsbygoogle"
  style="display:block"
  data-ad-client="ca-pub-7637695321442015"
  data-ad-slot="3900516289"
  data-ad-format="auto"
  data-full-width-responsive="true"> </ins>

## 植物数据格式

The following describes the base attributes and almanac information for plants, using Grapeshot as an example.

Multi-language fields must retain their structure and cannot be deleted or extended. Example format:

```json
{
  "en": "English",
  "zh": "中文"
}
```

### Base Information

| Attribute     | Example Value                                | Description                                      |
| ------------- | -------------------------------------------- | ------------------------------------------------ |
| `ID`          | 1                                            | Unique in-game ID for the plant. |
| _COSTUME_     | "grapeshot"                                  | `{ "PlantPlace": "dirt" }`                       |
| **ID**        | `{ "en": "Explodes...", "zh": "爆炸并发射弹射子弹" }` | 植物的多语言名称                                         |
| `OBTAINWORLD` | "market"                                     | 植物的获取背景                                          |
| _TYPE_        | `["plant", "lastStandDisallowed"]`           | Plant Attributes                                 |

### 图鉴信息

| _\_CARDSPRITENAME_ | Value/Content                         | Description                                          |
| ---------------------------------------- | ------------------------------------- | ---------------------------------------------------- |
| `ALMANAC`                                | `{"en":"...","zh":"..."}`             | 植物的图鉴信息                                              |
| _Elements_                               | `["SUNCOST", "RECHARGE"]`             | Key attributes shown in the almanac. |
| `Introduction`                           | `{ "en": "Grapeshot", "zh": "爆裂葡萄" }` | 图鉴中的功能描述                                             |

### Gameplay Data (objdata)

| Field     | Value/Example                      | Description |
| --------- | ---------------------------------- | ----------- |
| `objdata` | `{ "SUNCOST": 100, "DAMAGE": 20 }` | 游戏中的数值属性    |

## 僵尸数据格式

与植物数据格式类似，僵尸数据包含以下主要字段：

- `ID`
- _CODENAME_
- **NAME**
- `ALMANAC`
- `objdata`

## 示例

以下是一个植物数据的完整示例：

```json
{
  "ID": 1,
  "CODENAME": "peashooter",
  "NAME": {
    "en": "Peashooter",
    "zh": "豌豆射手"
  },
  "OBTAINWORLD": "market",
  "TYPE": ["plant"],
  "ALMANAC": {
    "Elements": [
      { "TYPE": "SUNCOST", "VALUE": 100 },
      { "TYPE": "RECHARGE", "VALUE": 5 }
    ],
    "Introduction": {
      "en": "Shoots peas",
      "zh": "发射豌豆"
    }
  },
  "objdata": {
    "SUNCOST": 100,
    "DAMAGE": 20
  }
}
```

## Store Attributes

### Plant Commodities

| Field                | Type   | Description                                                         |
| -------------------- | ------ | ------------------------------------------------------------------- |
| _CommodityType_      | string | Fixed value: "plant".               |
| **CommodityName**    | string | Plant's CODENAME.                                   |
| **CurrencyType**     | string | Currency type ("gem" or "coin"). |
| **CurrencyRequired** | number | Required currency amount.                           |
| _UnlockLevel_        | string | 在某个关卡解锁                                                             |

#### Example: Snow Pea Commodity

```json
{
  "CommodityType": "plant",
  "CommodityName": "snowpea",
  "CurrencyType": "gem",
  "CurrencyRequired": 25
}
```

### Upgrade Commodities

| Field                | Type   | Description                                                         |
| -------------------- | ------ | ------------------------------------------------------------------- |
| _CommodityType_      | string | Fixed value: "upgrade".             |
| **CommodityName**    | string | Upgrade's CODENAME.                                 |
| **CurrencyType**     | string | Currency type ("gem" or "coin"). |
| **CurrencyRequired** | number | Required currency amount.                           |

#### Example: Shovel Upgrade

```json
{
  "CommodityType": "upgrade",
  "CommodityName": "upgrade_sunshovel_lvl3",
  "CurrencyType": "gem",
  "CurrencyRequired": 20
}
```

### Gem Commodities

| Field                    | Description                                                         |
| ------------------------ | ------------------------------------------------------------------- |
| _CommodityType_          | Fixed value: "gem".                 |
| CommodityCount           | Number of gems obtained.                            |
| **CurrencyType**         | Currency type ("gem" or "coin"). |
| CurrencyRequired         | Required currency amount.                           |
| _StackLevel_             | 商品包等级                                                               |
| **CommodityDisplayName** | Multi-language display name.                        |

#### Example: Gem Bundle

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

### Coin Commodities

| Field                    | Description                                                         |
| ------------------------ | ------------------------------------------------------------------- |
| _CommodityType_          | Fixed value: "coin".                |
| CommodityCount           | Number of coins obtained.                           |
| **CurrencyType**         | Currency type ("gem" or "coin"). |
| CurrencyRequired         | Required currency amount.                           |
| _StackLevel_             | 商品包等级                                                               |
| **CommodityDisplayName** | Multi-language display name.                        |
