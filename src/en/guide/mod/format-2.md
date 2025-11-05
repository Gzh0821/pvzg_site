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
> Attributes marked in _italics_ are not recommended for modification, as changes may cause game crashes or instability.

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-7637695321442015"
     data-ad-slot="7113006248"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

## Plant Attributes

The following describes the base attributes and almanac information for plants, using Grapeshot as an example.

Multi-language fields must retain their structure and cannot be deleted or extended. Example format:

```json
{
  "en": "English",
  "zh": "中文"
}
```

### Base Information

| Attribute          | Example Value                             | Description                                                                                            |
| ------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **ID**             | 74                                        | Unique in-game ID for the plant.                                                                       |
| **NAME**           | `{ "en": "Grapeshot", "zh": "爆裂葡萄" }` | Multi-language name. `en` for English, `zh` for Chinese.                                               |
| _\_CARDSPRITENAME_ | "grapeshot"                               | Card icon resource name (corresponds to game asset files).                                             |
| _CODENAME_         | "grapeshot"                               | Unique identifier for GE Patcher merging.                                                              |
| _TYPE_             | `["plant", "lastStandDisallowed"]`        | Plant type:<br>- `plant`: Standard plant<br>- `lastStandDisallowed`: Not allowed in "Last Stand" mode. |
| **OBTAINWORLD**    | "market"                                  | World theme for the plant's background.                                                                |
| **ZENGARDEN**      | `{ "PlantPlace": "dirt" }`                | Zen Garden planting location:<br>- `dirt`: Regular soil.                                               |
| _COSTUME_          | 2                                         | Number of available costumes.                                                                          |

### Almanac Information (ALMANAC)

The following content is a sub-attribute of the plant's `ALMANAC`, containing the plant's encyclopedia information:

| Field                 | Value/Content                                                                                                                                                   | Description                                    |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| _Elements_            | Attributes displayed in almanac:<br>- `SUNCOST`: Sun cost<br>- `RECHARGE`: Cooldown<br>- `DAMAGE`: Damage (1800)<br>- `AREA`: Range (3x3)<br>- `FAMILY`: Family | Key attributes shown in the almanac.           |
| **Introduction**      | `{ "en": "...", "zh": "爆炸后向 8 个方向发射弹性葡萄子弹" }`                                                                                                    | Multi-language functional description.         |
| _Special_             | `{ "NAME": {"en":"...","zh":"..."}, "DESCRIPTION": {"en":"...","zh":"..."} }`                                                                                   | Special mechanics explanation.                 |
| **Chat**              | `{"en":"...","zh":"..."}`                                                                                                                                       | Multi-language personality quotes.             |
| **BriefIntroduction** | `{ "en": "Explodes...", "zh": "爆炸并发射弹射子弹" }`                                                                                                           | Short multi-language summary of functionality. |
| **DisplayOffset**     | `{ "x": 0, "y": 0 }`                                                                                                                                            | Position offset for almanac display.           |

### Gameplay Data (objdata)

The following content is a sub-attribute of the plant's `objdata`, containing the game mechanics data of the plant. For valid objdata of each plant, please refer to the [Almanac](../../almanac/):

| Attribute                     | Value/Example | Description                                                     |
| ----------------------------- | ------------- | --------------------------------------------------------------- |
| **CannotBeSheepenedByWizard** | true          | Immune to Wizard Zombie's "Sheepify" ability.                   |
| **Damage**                    | 1800          | Base damage value.                                              |
| **Cooldown**                  | 35            | Cooldown time (seconds).                                        |
| **CooldownFrom**              | 1             | Initial cooldown value.                                         |
| **SunCost**                   | 150           | Sun cost to plant.                                              |
| **Toughness**                 | 300           | Base health.                                                    |
| **Family**                    | "Explosive"   | Family affiliation (affects family-based buffs).                |
| **ImmuneToIceblock**          | true          | Immune to freezing effects (e.g., Ice Weasel Zombie's attacks). |

### Original JSON for Grapeshot

```json
{
  "ID": 74,
  "NAME": {
    "en": "Grapeshot",
    "zh": "爆裂葡萄"
  },
  "_CARDSPRITENAME": "grapeshot",
  "CODENAME": "grapeshot",
  "TYPE": ["plant", "lastStandDisallowed"],
  "OBTAINWORLD": "market",
  "ZENGARDEN": {
    "PlantPlace": "dirt"
  },
  "COSTUME": 2,
  "ALMANAC": {
    "Elements": [
      {
        "TYPE": "SUNCOST"
      },
      {
        "TYPE": "RECHARGE"
      },
      {
        "TYPE": "DAMAGE",
        "VALUE": 1800
      },
      {
        "TYPE": "AREA",
        "SORT": {
          "en": "3x3",
          "zh": "3x3范围"
        }
      },
      {
        "TYPE": "FAMILY"
      }
    ],
    "Introduction": {
      "en": "Grapeshots explode and scatter bouncing projectiles in eight directions.",
      "zh": "爆裂葡萄爆炸后向 8 个方向发射弹性葡萄子弹。"
    },
    "Special": [
      {
        "NAME": {
          "en": "Usage",
          "zh": "用途"
        },
        "DESCRIPTION": {
          "en": "single use, instant",
          "zh": "一次性使用，立刻触发"
        }
      }
    ],
    "Chat": {
      "en": "\"Spa-BOOM!\" enthuses Grapeshot. \"You liked that? I got a million of 'em! Wa-POW! Buh-BLAM! Za-... um... Ker-... hmmm... Okay, I guess I've only got the three.\"",
      "zh": "“唏——啪——！”爆裂葡萄激情地吼道。“你喜欢吗？我还有上万种这样的声音呢。哇——噗——！啪——砰——！咂——……！额……，轰——……！嗯嗯……，好吧，我想就这三种了。”"
    },
    "BriefIntroduction": {
      "en": "Explodes and scatters bouncing projectiles",
      "zh": "爆炸并发射弹射子弹"
    },
    "DisplayOffset": {
      "x": 0,
      "y": 0
    }
  },
  "objdata": {
    "CannotBeSheepenedByWizard": true,
    "Damage": 1800,
    "Cooldown": 35,
    "CooldownFrom": 1,
    "SunCost": 150,
    "Toughness": 300,
    "Family": "Explosive",
    "ImmuneToIceblock": true
  }
}
```

## Store Attributes

### Plant Commodities

| Field                | Type   | Description                      |
| -------------------- | ------ | -------------------------------- |
| _CommodityType_      | string | Fixed value: "plant".            |
| **CommodityName**    | string | Plant's CODENAME.                |
| **CurrencyType**     | string | Currency type ("gem" or "coin"). |
| **CurrencyRequired** | number | Required currency amount.        |
| _UnlockLevel_        | string | Unlock level requirement.        |

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

| Field                | Type   | Description                      |
| -------------------- | ------ | -------------------------------- |
| _CommodityType_      | string | Fixed value: "upgrade".          |
| **CommodityName**    | string | Upgrade's CODENAME.              |
| **CurrencyType**     | string | Currency type ("gem" or "coin"). |
| **CurrencyRequired** | number | Required currency amount.        |

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

| Field                    | Description                      |
| ------------------------ | -------------------------------- |
| _CommodityType_          | Fixed value: "gem".              |
| CommodityCount           | Number of gems obtained.         |
| **CurrencyType**         | Currency type ("gem" or "coin"). |
| CurrencyRequired         | Required currency amount.        |
| _StackLevel_             | Bundle tier.                     |
| **CommodityDisplayName** | Multi-language display name.     |

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

| Field                    | Description                      |
| ------------------------ | -------------------------------- |
| _CommodityType_          | Fixed value: "coin".             |
| CommodityCount           | Number of coins obtained.        |
| **CurrencyType**         | Currency type ("gem" or "coin"). |
| CurrencyRequired         | Required currency amount.        |
| _StackLevel_             | Bundle tier.                     |
| **CommodityDisplayName** | Multi-language display name.     |
