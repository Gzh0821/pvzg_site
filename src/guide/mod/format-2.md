---
title: 属性参考(0.2.X)
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
> 以下教程仅适用于`0.2.8.1`-`0.2.9`版本。

> [!important]
> 表格中，斜体的属性为不建议修改的字段，修改后可能会导致游戏崩溃或无法正常运行。

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-7637695321442015"
     data-ad-slot="6758794743"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

## 植物数据格式

以下是植物的基本属性和图鉴信息，此处以爆裂葡萄为例。

多语言的属性不能删除或添加额外字段，格式必须如下:

```json
{
  "en": "English",
  "zh": "中文"
}
```

### 基本信息
| 字段名          | 示例值                                   | 说明                     |
| --------------- | ---------------------------------------- | ------------------------ |
| `ID`            | 1                                       | 植物的唯一标识符         |
| `CODENAME`      | `peashooter`                            | 植物的代码名称           |
| `NAME`          | `{ "en": "Peashooter", "zh": "豌豆射手" }` | 植物的多语言名称         |
| `OBTAINWORLD`   | `market`                                | 植物的获取背景           |
| `TYPE`          | `["plant"]`                           | 植物的类型               |

### 图鉴信息
| 字段名          | 示例值                                   | 说明                     |
| --------------- | ---------------------------------------- | ------------------------ |
| `ALMANAC`       | `{ "Elements": [...], "Introduction": {...} }` | 植物的图鉴信息           |
| `Elements`      | `["SUNCOST", "RECHARGE"]`            | 图鉴中显示的关键属性标签 |
| `Introduction`  | `{ "en": "Shoots peas", "zh": "发射豌豆" }` | 图鉴中的功能描述         |

### 游戏数据
| 字段名          | 示例值                                   | 说明                     |
| --------------- | ---------------------------------------- | ------------------------ |
| `objdata`       | `{ "SUNCOST": 100, "DAMAGE": 20 }`   | 游戏中的数值属性         |

## 僵尸数据格式
与植物数据格式类似，僵尸数据包含以下主要字段：
- `ID`
- `CODENAME`
- `NAME`
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

## 商店属性

### 植物商品

| 字段                 | 类型   | 说明                    |
| -------------------- | ------ | ----------------------- |
| _CommodityType_      | string | 固定值"plant"           |
| **CommodityName**    | string | 植物的 CODENAME         |
| **CurrencyType**     | string | 货币类型("gem"或"coin") |
| **CurrencyRequired** | number | 需要支付的货币数量      |
| _UnlockLevel_        | string | 在某个关卡解锁          |

#### 示例:寒冰射手商品

```json
{
  "CommodityType": "plant",
  "CommodityName": "snowpea",
  "CurrencyType": "gem",
  "CurrencyRequired": 25
}
```

### 升级项商品

| 字段                 | 类型   | 说明                    |
| -------------------- | ------ | ----------------------- |
| _CommodityType_      | string | 固定值"upgrade"         |
| **CommodityName**    | string | 升级项的 CODENAME       |
| **CurrencyType**     | string | 货币类型("gem"或"coin") |
| **CurrencyRequired** | number | 需要支付的货币数量      |

#### 示例:铲子升级

```json
{
  "CommodityType": "upgrade",
  "CommodityName": "upgrade_sunshovel_lvl3",
  "CurrencyType": "gem",
  "CurrencyRequired": 20
}
```

### 钻石商品(Gem)

| 字段                     | 说明                    |
| ------------------------ | ----------------------- |
| _CommodityType_          | 固定值"gem"             |
| CommodityCount           | 获得的钻石数量          |
| **CurrencyType**         | 货币类型("gem"或"coin") |
| CurrencyRequired         | 需要支付的货币数量      |
| _StackLevel_             | 商品包等级              |
| **CommodityDisplayName** | 商品显示名称(多语言)    |

#### 示例:调整钻石包

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

### 金币商品(Coin)

| 字段                     | 说明                    |
| ------------------------ | ----------------------- |
| _CommodityType_          | 固定值"coin"            |
| CommodityCount           | 获得的金币数量          |
| **CurrencyType**         | 货币类型("gem"或"coin") |
| CurrencyRequired         | 需要支付的货币数量      |
| _StackLevel_             | 商品包等级              |
| **CommodityDisplayName** | 商品显示名称(多语言)    |
