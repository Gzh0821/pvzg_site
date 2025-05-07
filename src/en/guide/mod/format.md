---
title: Attribute Reference(latest)
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
> The following tutorial is only applicable to version `0.3.X`.

> [!important]
> In the tables, attributes in _italics_ are fields that are not recommended to be modified. Modifying them may cause the game to crash or not run properly.

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-7637695321442015"
     data-ad-slot="3900516289"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

## Plant Files

Below is the format of the plant JSON files, using Grapeshot as an example.

Attributes with multilingual values cannot be deleted or have extra fields added. The format must be as follows:

```json
{
  "en": "English",
  "zh": "中文"
}
```

### PlantFeatures.json

The PlantFeatures.json file contains the basic characteristics of plants.

Each plant in the `PLANTS` array includes the following basic characteristics fields:

| Attribute          | Sample Content                            | Description                                                                                            |
| ------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **ID**             | 74                                        | Unique ID value of the plant in the game                                                               |
| **NAME**           | `{ "en": "Grapeshot", "zh": "爆裂葡萄" }` | Multilingual name, `en` for English name, `zh` for Chinese name                                        |
| _\_CARDSPRITENAME_ | "grapeshot"                               | Card icon resource name (corresponding to game resource files)                                         |
| _CODENAME_         | "grapeshot"                               | Unique identifier for the plant (critical field, used for GE Patcher merging)                          |
| _TYPE_             | `["plant", "lastStandDisallowed"]`        | Plant type:<br>- `plant`: Normal plant<br>- `lastStandDisallowed`: Cannot be used in "Last Stand" mode |
| **OBTAINWORLD**    | "market"                                  | The world where the background image is located                                                        |
| **ZENGARDEN**      | `{ "PlantPlace": "dirt" }`                | Zen Garden planting location:<br>- `dirt`: Normal soil                                                 |
| _COSTUME_          | 2                                         | Number of costumes                                                                                     |

The `SEEDCHOOSERDEFAULTORDER` array is used to specify the default order of plants in the selection interface. Each item's value is the plant's `CODENAME`.

The `BASEUNLOCKLIST` array contains all plants designated for initial unlock. Each item's value is the plant's `CODENAME`.

### PlantAlmanac.json

The PlantAlmanac.json file contains the Almanac information for plants.

Each item in the `objects` array includes `aliases`, `objclass`, and `objdata`.

The `aliases` array contains the plant's `CODENAME`, used to indicate the corresponding plant for this item. The value of `objclass` is `PlantAlmanacProperties`, indicating that this item is a plant almanac property.

`objdata` includes the following Almanac information fields:

| Field                 | Value/Content                                                                                                                                                     | Description                                              |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| _Elements_            | Contains multiple attribute tags:<br>- `SUNCOST`:Sun cost<br>- `RECHARGE`:Cooldown<br>- `DAMAGE`:Damage value (1800)<br>- `AREA`:Range (3x3)<br>- `FAMILY`:Family | Key attribute tags shown in Almanac                      |
| **Introduction**      | `{ "en": "...", "zh": "爆炸后向 8 个方向发射弹性葡萄子弹" }`                                                                                                      | Multilingual description of plant function               |
| _Special_             | `{ "NAME": {"en":"...","zh":"..."}, "DESCRIPTION": {"en":"...","zh":"..."} }`                                                                                     | Special mechanism description                            |
| **Chat**              | `{"en":"...","zh":"..."}`                                                                                                                                         | Multilingual, plant's personality lines                  |
| **BriefIntroduction** | `{ "en": "Explodes...", "zh": "爆炸并发射弹射子弹" }`                                                                                                             | Multilingual, brief function summary                     |
| **DisplayOffset**     | `{ "x": 0, "y": 0 }`                                                                                                                                              | Display position offset (adjusts coordinates in Almanac) |

### PlantProps.json

The PlantProps.json file contains the numerical attributes of plants.

Each item in the `objects` array includes `aliases`, `objclass`, and `objdata`.

The `aliases` array contains the plant's `CODENAME`, used to indicate the corresponding plant for this item. The value of `objclass` is `PlantProperties`, indicating that this item is a plant numerical property.

`objdata` includes the following numerical attribute fields. Valid Props for each plant can be viewed in the [Almanac](../../almanac/):

| Attribute                     | Value/Content | Description                                             |
| ----------------------------- | ------------- | ------------------------------------------------------- |
| **CannotBeSheepenedByWizard** | true          | Immune to Wizard Zombie's "sheep transformation" skill  |
| **Damage**                    | 1800          | Base damage value                                       |
| **Cooldown**                  | 35            | Cooldown time (unit: seconds)                           |
| **CooldownFrom**              | 1             | Cooldown start time (represents initial cooldown value) |
| **SunCost**                   | 150           | Sun required for planting                               |
| **Toughness**                 | 300           | Base plant health points                                |
| **Family**                    | "Explosive"   | Family (may affect family bonus effects)                |
| **ImmuneToIceblock**          | true          | Immune to freezing effects (e.g., Ice Weasel Zombie)    |

## Store Files

The `StoreCommodityFeatures.json` file contains store commodity information, including four arrays: `Plants`, `Upgrade`, `Gem`, and `Coin`, representing different types of commodity information.

### Plants

The `Plants` array contains information about plant commodities.

| Field                | Type   | Description                     |
| -------------------- | ------ | ------------------------------- |
| _CommodityType_      | string | Fixed value "plant"             |
| **CommodityName**    | string | Plant's CODENAME                |
| **CurrencyType**     | string | Currency type ("gem" or "coin") |
| **CurrencyRequired** | number | Amount of currency required     |
| _UnlockLevel_        | string | Unlocks at a certain level      |

**Example: Snow Pea Commodity**

```json
{
  "CommodityType": "plant",
  "CommodityName": "snowpea",
  "CurrencyType": "gem",
  "CurrencyRequired": 25
}
```

### Upgrade

The `Upgrade` array contains information about plant upgrade commodities.

| Field                | Type   | Description                     |
| -------------------- | ------ | ------------------------------- |
| _CommodityType_      | string | Fixed value "upgrade"           |
| **CommodityName**    | string | CODENAME of the upgrade item    |
| **CurrencyType**     | string | Currency type ("gem" or "coin") |
| **CurrencyRequired** | number | Amount of currency required     |

**Example: Shovel Upgrade**

```json
{
  "CommodityType": "upgrade",
  "CommodityName": "upgrade_sunshovel_lvl3",
  "CurrencyType": "gem",
  "CurrencyRequired": 20
}
```

### Gem

The `Gem` array contains information about Gem commodities.

| Field                    | Description                           |
| ------------------------ | ------------------------------------- |
| _CommodityType_          | Fixed value "gem"                     |
| CommodityCount           | Amount of Gems obtained               |
| **CurrencyType**         | Currency type ("gem" or "coin")       |
| CurrencyRequired         | Amount of currency required           |
| _StackLevel_             | Commodity pack level                  |
| **CommodityDisplayName** | Commodity display name (multilingual) |

**Example: Adjusting a Gem Pack**

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

The `Coin` array contains information about Coin commodities.

| Field                    | Description                           |
| ------------------------ | ------------------------------------- |
| _CommodityType_          | Fixed value "coin"                    |
| CommodityCount           | Amount of Coins obtained              |
| **CurrencyType**         | Currency type ("gem" or "coin")       |
| CurrencyRequired         | Amount of currency required           |
| _StackLevel_             | Commodity pack level                  |
| **CommodityDisplayName** | Commodity display name (multilingual) |
