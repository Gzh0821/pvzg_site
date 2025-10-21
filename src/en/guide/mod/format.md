---
title: Properties Reference (latest)
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
> The following tutorial only works for versions `0.3.X`-`0.5.X`.

> [!important]
> In the tables, properties in _italics_ are properties that you probably shouldn't modify. Modifying them may cause the game to crash or bug out.

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-2336226859954206"
     data-ad-slot="6758794743"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

## Plant Files

Below is the format of the plant JSON files, using Grapeshot as an example.

Properties with multilingual values cannot be deleted or have extra fields added. The format must be as follows:

```json
{
  "en": "English",
  "zh": "中文"
}
```

### PlantFeatures.json

The PlantFeatures.json file contains the basic characteristics of plants.

Each plant in the `PLANTS` array includes the following properties:

| Property           | Example Content                           | Description                                                                                            |
| ------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **ID**             | 74                                        | Unique ID value of the plant in the game                                                               |
| **NAME**           | `{ "en": "Grapeshot", "zh": "爆裂葡萄" }` | Multilingual name, `en` for English name, `zh` for Chinese name                                        |
| _\_CARDSPRITENAME_ | "grapeshot"                               | Card icon resource name (corresponding to game resource files)                                         |
| _CODENAME_         | "grapeshot"                               | Unique identifier for the plant (critical field, used for GE Patcher merging)                          |
| _TYPE_             | `["plant", "lastStandDisallowed"]`        | Plant type:<br>- `plant`: Normal plant<br>- `lastStandDisallowed`: Cannot be used in "Last Stand" mode |
| **OBTAINWORLD**    | "market"                                  | The world where the background image is located                                                        |
| **ZENGARDEN**      | `{ "PlantPlace": "dirt" }`                | Zen Garden planting location:<br>- `dirt`: Normal soil                                                 |
| _COSTUME_          | 2                                         | Number of costumes                                                                                     |

The `SEEDCHOOSERDEFAULTORDER` array is used to specify the default order of plants in the selection interface. It should only have plants' `CODENAME` and the order they are in the array is the order they will appear in the almanac, seed chooser, etc.

The `BASEUNLOCKLIST` array contains plants newly created player profiles have by default. It also uses plants' `CODENAME`.

### PlantAlmanac.json

The PlantAlmanac.json file contains the Almanac information for plants.

Each item in the `objects` array should include `aliases`, `objclass`, and `objdata`, or else it may not change in-game.

The `aliases` array contains the plant's `CODENAME`, used to indicate the corresponding plant for this object. Only the first item is read from at the moment. The value of `objclass` is `PlantAlmanacProperties`, indicating that this object modifies a plant almanac entry.

`objdata` includes the following Almanac properties:

| Property              | Value/Content                                                                                                                                                     | Description                                              |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| _Elements_            | Contains multiple properties:<br>- `SUNCOST`:Sun cost<br>- `RECHARGE`:Cooldown<br>- `DAMAGE`:Damage value (1800)<br>- `AREA`:Range (3x3)<br>- `FAMILY`:Family | Key property  tags shown in Almanac                      |
| **Introduction**      | `{ "en": "...", "zh": "爆炸后向 8 个方向发射弹性葡萄子弹" }`                                                                                                      | Multilingual description of plant function               |
| _Special_             | `{ "NAME": {"en":"...","zh":"..."}, "DESCRIPTION": {"en":"...","zh":"..."} }`                                                                                     | Special mechanism description                            |
| **Chat**              | `{"en":"...","zh":"..."}`                                                                                                                                         | Multilingual, plant's personality lines                  |
| **BriefIntroduction** | `{ "en": "Explodes...", "zh": "爆炸并发射弹射子弹" }`                                                                                                             | Multilingual, brief function summary                     |
| **DisplayOffset**     | `{ "x": 0, "y": 0 }`                                                                                                                                              | Display position offset (adjusts coordinates in Almanac) |

### PlantProps.json

The PlantProps.json file contains gameplay properties of plants.

Each item in the `objects` array includes `aliases`, `objclass`, and `objdata`, just like in `PlantAlmanac.json`.

The `aliases` array contains the plant's `CODENAME`, used to indicate the corresponding plant for this object. Again, only the first entry is read. The value of `objclass` is `PlantProperties`, indicating that this object modifies a plant's gameplay properties.

`objdata` includes the following properties, but some plants have properties others don't. Valid properties for each plant can be viewed in the [Almanac](../../almanac/).

| Property                      | Value/Content | Description                                             |
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

| Property             | Type   | Description                     |
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

| Property             | Type   | Description                     |
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

| Property                 | Description                           |
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

| Property                 | Description                           |
| ------------------------ | ------------------------------------- |
| _CommodityType_          | Fixed value "coin"                    |
| CommodityCount           | Amount of Coins obtained              |
| **CurrencyType**         | Currency type ("gem" or "coin")       |
| CurrencyRequired         | Amount of currency required           |
| _StackLevel_             | Commodity pack level                  |
| **CommodityDisplayName** | Commodity display name (multilingual) |
