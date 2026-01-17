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
> This reference applies to versions `0.3.X` - `0.6.X`.

This page documents all modifiable properties for plants, zombies, and store items. Use this as a reference when creating your mod files.

> [!important]
> Properties in *italics* are **dangerous to modify** - changing them may crash the game or cause unexpected behavior.

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-2336226859954206"
     data-ad-slot="6758794743"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

## Quick Reference

| File | What It Modifies | Match By |
|------|------------------|----------|
| `PlantFeatures.json` | Plant metadata, unlock order | `CODENAME` |
| `PlantProps.json` | Plant stats (damage, cost, cooldown) | `aliases` |
| `PlantAlmanac.json` | Almanac display text | `aliases` |
| `ZombieFeatures.json` | Zombie metadata | `CODENAME` |
| `ZombieProps.json` | Zombie stats | `aliases` |
| `ZombieAlmanac.json` | Almanac display text | `aliases` |
| `StoreCommodityFeatures.json` | Shop items and prices | category arrays |

---

## Plant Files

### PlantFeatures.json

Controls plant metadata and unlock order.

**Structure:**

```json
{
  "PLANTS": [
    { "CODENAME": "peashooter", ... }
  ],
  "SEEDCHOOSERDEFAULTORDER": ["peashooter", "sunflower"],
  "BASEUNLOCKLIST": ["peashooter", "sunflower"]
}
```

**PLANTS Array Properties:**

| Property | Example | Description | Safe to Modify? |
|----------|---------|-------------|-----------------|
| *ID* | `74` | Unique plant ID | ⚠️ No |
| **NAME** | `{"en": "Grapeshot", "zh": "爆裂葡萄"}` | Display name | ✅ Yes |
| *_CARDSPRITENAME* | `"grapeshot"` | Card sprite resource | ⚠️ No |
| *CODENAME* | `"grapeshot"` | Unique identifier | ⚠️ No |
| *TYPE* | `["plant", "lastStandDisallowed"]` | Plant type flags | ⚠️ Careful |
| **OBTAINWORLD** | `"market"` | Background image world | ✅ Yes |
| **ZENGARDEN** | `{"PlantPlace": "dirt"}` | Zen Garden placement | ✅ Yes |
| *COSTUME* | `2` | Number of costumes | ⚠️ Careful |

**Special Arrays:**

| Array | Purpose | Notes |
|-------|---------|-------|
| `SEEDCHOOSERDEFAULTORDER` | Order in seed chooser | Uses `CODENAME` values |
| `BASEUNLOCKLIST` | Plants unlocked for new players | Uses `CODENAME` values |

---

### PlantProps.json

Controls plant gameplay stats.

**Structure:**

```json
{
  "objects": [
    {
      "aliases": ["peashooter"],
      "objclass": "PlantProperties",
      "objdata": {
        "SunCost": 100,
        "Damage": 20
      }
    }
  ]
}
```

**Common Properties:**

| Property | Type | Example | Description |
|----------|------|---------|-------------|
| **SunCost** | number | `100` | Sun required to plant |
| **Damage** | number | `20` | Base damage per hit |
| **Cooldown** | number | `5` | Recharge time (seconds) |
| **CooldownFrom** | number | `1` | Initial cooldown value |
| **Toughness** | number | `300` | Plant health points |
| **Family** | string | `"Explosive"` | Plant family name |
| **ShootInterval** | number | `1.35` | Time between shots |
| **PlantfoodPeaCount** | number | `60` | Projectiles in plant food attack |

**Immunity Properties:**

| Property | Type | Description |
|----------|------|-------------|
| **CannotBeSheepenedByWizard** | boolean | Immune to Wizard transformation |
| **ImmuneToIceblock** | boolean | Immune to freezing |

> [!tip]
> Not all plants have all properties. Export original data to see which properties each plant uses:
> ```javascript
> gePatcher.exportJson('PlantProps', true)
> ```

---

### PlantAlmanac.json

Controls Almanac display information (cosmetic only - doesn't affect gameplay).

**Structure:**

```json
{
  "objects": [
    {
      "aliases": ["peashooter"],
      "objclass": "PlantAlmanacProperties",
      "objdata": {
        "Introduction": {"en": "...", "zh": "..."},
        "Chat": {"en": "...", "zh": "..."}
      }
    }
  ]
}
```

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| *Elements* | array | Stat tags shown in Almanac |
| **Introduction** | multilingual | Plant description |
| *Special* | object | Special ability description |
| **Chat** | multilingual | Plant personality quote |
| **BriefIntroduction** | multilingual | Short summary |
| **DisplayOffset** | `{x, y}` | Position adjustment in Almanac |

**Elements Array Types:**

| TYPE | Description |
|------|-------------|
| `SUNCOST` | Shows sun cost |
| `RECHARGE` | Shows cooldown |
| `DAMAGE` | Shows damage value |
| `AREA` | Shows attack range |
| `FAMILY` | Shows plant family |

---

## Zombie Files

### ZombieFeatures.json

Controls zombie metadata.

**Structure:**

```json
{
  "ZOMBIES": [
    { "CODENAME": "tutorial", ... }
  ]
}
```

Works the same as `PlantFeatures.json` but for zombies.

### ZombieProps.json

Controls zombie gameplay stats.

**Structure:**

```json
{
  "objects": [
    {
      "aliases": ["tutorial"],
      "objclass": "ZombieProperties",
      "objdata": {
        "Toughness": 200,
        "WalkSpeed": 0.5
      }
    }
  ]
}
```

---

## Store Files

### StoreCommodityFeatures.json

Controls shop items and prices.

**Structure:**

```json
{
  "Plants": [...],
  "Upgrade": [...],
  "Gem": [...],
  "Coin": [...]
}
```

Only include categories you want to modify.

### Plants Category

```json
{
  "CommodityType": "plant",
  "CommodityName": "snowpea",
  "CurrencyType": "gem",
  "CurrencyRequired": 25
}
```

| Property | Type | Description |
|----------|------|-------------|
| *CommodityType* | string | Always `"plant"` |
| **CommodityName** | string | Plant's CODENAME |
| **CurrencyType** | string | `"gem"` or `"coin"` |
| **CurrencyRequired** | number | Price |
| *UnlockLevel* | string | Level required to unlock |

### Upgrade Category

```json
{
  "CommodityType": "upgrade",
  "CommodityName": "upgrade_sunshovel_lvl3",
  "CurrencyType": "gem",
  "CurrencyRequired": 20
}
```

### Gem/Coin Categories

```json
{
  "CommodityType": "gem",
  "CommodityCount": 10,
  "CurrencyType": "coin",
  "CurrencyRequired": 300000,
  "StackLevel": 4,
  "CommodityDisplayName": {"en": "Gem Pack", "zh": "钻石包"}
}
```

---

## Multilingual Format

All text properties that support multiple languages use this format:

```json
{
  "en": "English text",
  "zh": "中文文本"
}
```

> [!warning]
> Do not add or remove language keys - only modify existing values.
