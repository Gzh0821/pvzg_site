---
title: Types & Fields
icon: file-invoice
pageInfo: false
index: true
order: 4
---

<script setup>
    import { onMounted } from 'vue';
    onMounted(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    })
</script>

> [!important]
> Italicized properties in the tables below are fields you generally should not modify. Changing them may cause crashes or other unexpected behavior.

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-7637695321442015"
     data-ad-slot="7113006248"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

## How To Use This Page

This is not an introduction to building a mod from scratch. It is a field reference page.
It is most useful when:

- you already know what kind of data you want to edit, but do not know the field name
- you have exported a JSON file from the game and want to check what each field does
- you want to see which fields usually appear in common `Features` or `Props` files

If you have not exported the original JSON yet, start with [Source Data](./gp-next-json.md).

## Plant-Related Files

The following examples use Grapeshot to explain the structure of plant JSON files.

Multilingual fields should not remove required language keys or add unrelated extra structure. The format should look like this:

```json
{
  "en": "English",
  "zh": "中文"
}
```

### PlantFeatures.json

`PlantFeatures.json` contains a plant's basic feature data.

Each plant in the `PLANTS` array usually contains fields like these:

| Property           | Example                                   | Description                                                      |
| ------------------ | ----------------------------------------- | ---------------------------------------------------------------- |
| **ID**             | 74                                        | Unique in-game plant id                                          |
| **NAME**           | `{ "en": "Grapeshot", "zh": "爆裂葡萄" }` | Multilingual name                                                |
| _\_CARDSPRITENAME_ | "grapeshot"                               | Card icon resource name                                          |
| _CODENAME_         | "grapeshot"                               | Unique plant identifier used by GP-Next for matching and merging |
| _TYPE_             | `["plant", "lastStandDisallowed"]`        | Plant type tags                                                  |
| **OBTAINWORLD**    | "market"                                  | World used for the background image                              |
| **ZENGARDEN**      | `{ "PlantPlace": "dirt" }`                | Zen Garden placement configuration                               |
| _COSTUME_          | 2                                         | Number of costumes                                               |

The `SEEDCHOOSERDEFAULTORDER` array defines the default order of plants in the selection interface. Each item is a plant `CODENAME`.

The `BASEUNLOCKLIST` array contains plants that are unlocked by default. Each item is a plant `CODENAME`.

### PlantAlmanac.json

`PlantAlmanac.json` contains plant almanac information.

Each item inside the `objects` array contains `aliases`, `objclass`, and `objdata`.

The `aliases` array contains the plant `CODENAME`, which identifies the target plant. The `objclass` value is `PlantAlmanacProperties`.

`objdata` may contain fields such as:

| Field                 | Example / Content                                                                                                              | Description                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| _Elements_            | Multiple stat tags such as `SUNCOST`, `RECHARGE`, `DAMAGE`, `AREA`, `FAMILY`                                                  | Key tags shown in the almanac  |
| **Introduction**      | `{ "en": "...", "zh": "爆炸后向 8 个方向发射弹性葡萄子弹" }`                                                                   | Multilingual gameplay intro    |
| _Special_             | `{ "NAME": {"en":"...","zh":"..."}, "DESCRIPTION": {"en":"...","zh":"..."} }`                                                 | Special mechanic description   |
| **Chat**              | `{"en":"...","zh":"..."}`                                                                                                      | Multilingual personality line  |
| **BriefIntroduction** | `{ "en": "Explodes...", "zh": "爆炸并发射弹射子弹" }`                                                                          | Short summary text             |
| **DisplayOffset**     | `{ "x": 0, "y": 0 }`                                                                                                           | Position offset in almanac     |

### PlantProps.json

`PlantProps.json` contains plant property values.

Each item inside the `objects` array contains `aliases`, `objclass`, and `objdata`.

The `aliases` array contains the plant `CODENAME`, which identifies the target plant. The `objclass` value is `PlantProperties`.

`objdata` may contain fields like the following. The effective Props used by a plant can also be checked in the [Almanac](../../almanac/):

| Property                      | Example     | Description                        |
| ----------------------------- | ----------- | ---------------------------------- |
| **CannotBeSheepenedByWizard** | true        | Immunity to wizard sheep effect    |
| **Damage**                    | 1800        | Base damage                        |
| **Cooldown**                  | 35          | Cooldown in seconds                |
| **CooldownFrom**              | 1           | Initial cooldown start value       |
| **SunCost**                   | 150         | Sun cost                           |
| **Toughness**                 | 300         | Base HP                            |
| **Family**                    | "Explosive" | Family tag                         |
| **ImmuneToIceblock**          | true        | Immunity to freezing / ice effects |

## Store-Related Files

`StoreCommodityFeatures.json` contains store commodity information. It includes five arrays: `Plants`, `Upgrade`, `Gem`, `Coin`, and `Zen`.

### Plants

The `Plants` array contains plant commodity entries.

| Field                | Type   | Description                       |
| -------------------- | ------ | --------------------------------- |
| _CommodityType_      | string | Fixed value `"plant"`             |
| **CommodityName**    | string | Plant `CODENAME`                  |
| **CurrencyType**     | string | Currency type (`gem` or `coin`)   |
| **CurrencyRequired** | number | Required currency amount          |
| _UnlockLevel_        | string | Unlock level                      |

**Example: Snow Pea commodity**

```json
{
  "CommodityType": "plant",
  "CommodityName": "snowpea",
  "CurrencyType": "gem",
  "CurrencyRequired": 25
}
```

### Upgrade

The `Upgrade` array contains plant upgrade commodity entries.

| Field                | Type   | Description                       |
| -------------------- | ------ | --------------------------------- |
| _CommodityType_      | string | Fixed value `"upgrade"`           |
| **CommodityName**    | string | Upgrade `CODENAME`                |
| **CurrencyType**     | string | Currency type (`gem` or `coin`)   |
| **CurrencyRequired** | number | Required currency amount          |

**Example: Shovel upgrade**

```json
{
  "CommodityType": "upgrade",
  "CommodityName": "upgrade_sunshovel_lvl3",
  "CurrencyType": "gem",
  "CurrencyRequired": 20
}
```

### Gem

The `Gem` array contains gem commodity entries.

| Field                    | Description                         |
| ------------------------ | ----------------------------------- |
| _CommodityType_          | Fixed value `"gem"`                 |
| CommodityCount           | Number of gems granted              |
| **CurrencyType**         | Currency type (`gem` or `coin`)     |
| CurrencyRequired         | Required currency amount            |
| _StackLevel_             | Bundle level                        |
| **CommodityDisplayName** | Display name (multilingual)         |

**Example: Custom gem bundle**

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

The `Coin` array contains coin commodity entries.

| Field                    | Description                         |
| ------------------------ | ----------------------------------- |
| _CommodityType_          | Fixed value `"coin"`                |
| CommodityCount           | Number of coins granted             |
| **CurrencyType**         | Currency type (`gem` or `coin`)     |
| CurrencyRequired         | Required currency amount            |
| _StackLevel_             | Bundle level                        |
| **CommodityDisplayName** | Display name (multilingual)         |

### Zen

The `Zen` array contains Zen Garden commodity entries and has the same structure as `Gem` / `Coin`.

| Field                    | Description                          |
| ------------------------ | ------------------------------------ |
| _CommodityType_          | Fixed value `"zen"`                  |
| CommodityCount           | Amount of Zen Garden resource        |
| **CurrencyType**         | Currency type (`gem` or `coin`)      |
| CurrencyRequired         | Required currency amount             |
| _StackLevel_             | Bundle level                         |
| **CommodityDisplayName** | Display name (multilingual)          |
