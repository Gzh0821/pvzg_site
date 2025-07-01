---
title: GE Patcher Tutorial(latest)
icon: wrench
pageInfo: false
index: true
order: 1
---

<script setup>
    import { onMounted } from 'vue';
    onMounted(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    })
</script>

> [!warning]
> This tutorial is only applicable to version `0.3.X`.

GE Patcher is a tool used to modify Plants vs. Zombies 2 Gardendless game data, supporting custom modifications to plants, zombies, upgrades, the shop, levels, and more.

The version provided on the website has the GE Patcher tool built-in.

## Prerequisites

1. JSON editor (VSCode/Notepad++ recommended)
2. Game version ≥ 0.3.0
3. JSON attribute structures for elements like plants and zombies. Please refer to [Attribute Reference](format.md).

<ins class="adsbygoogle"
style="display:block"
data-ad-client="ca-pub-7637695321442015"
data-ad-slot="3900516289"
data-ad-format="auto"
data-full-width-responsive="true"> </ins>

## GE Patcher Basics

Press "F12" when the game starts to open the developer console. In the Console tab, output similar to the following will appear:在控制台选项卡中，会出现类似以下内容的输出：

```
[GE Patcher] BaseDir: C:\Users\admin\AppData\Local\com.pvzge.app
```

The path provided is the GE Patcher's main directory.

Enter the following command to view in-game help, including the paths for custom JSON files:

```javascript
gePatcher.help()
```

After the game finishes loading, run the following command to load all custom JSON files:

```javascript
gePatcher.init()
```

**After modifying a JSON file, please re-execute this command to apply the changes.**\*\*

## File Structure

Create a `patches` folder within `com.pvzge.app` with the following structure:

```
patches/
└── jsons/
    ├── features/
    │   ├── PlantFeatures.json
    │   ├── PlantProps.json
    │   ├── PlantAlmanac.json
    │   ├── ZombieFeatures.json
    │   ├── ZombieProps.json
    │   ├── ZombieAlmanac.json
    │   ├── UpgradeFeatures.json
    │   └── StoreCommodityFeatures.json
    └── levels/
        └── [LevelName].json
```

The `features` directory contains `Features`, `Props`, and `Almanac` files for modifying plants, zombies, upgrades, the shop, etc.

Files under the `levels` directory are used to modify levels.

Files for original content that are not modified do not need to be created.

## Features Files

### Features File Structure

Features files contain the basic attributes of plants, zombies, and upgrades. The file structure is as follows:文件结构如下：

**PlantFeatures.json**：Plant basic characteristics (structure example)

```json
{
  "PLANTS": [
    {
      "CODENAME": "peashooter"
    }
  ],
  "SEEDCHOOSERDEFAULTORDER": ["peashooter", "sunflower"],
  "BASEUNLOCKLIST": ["peashooter", "sunflower"]
}
```

**ZombieFeatures.json**：Zombie basic characteristics (structure example)

```json
{
  "ZOMBIES": [
    {
      "CODENAME": "tutorial"
    }
  ]
}
```

**UpgradeFeatures.json**：Upgrade attributes (structure example)

```json
{
  "UPGRADES": [
    {
      "CODENAME": "upgrade_starting_sun_lvl1"
    }
  ]
}
```

**Key Notes**

- The `PLANTS`、`ZOMBIES` and `UPGRADES` arrays define modifications to existing entities.
- `SEEDCHOOSERDEFAULTORDER` sets the default plant order in the seed chooser.
- `BASEUNLOCKLIST` defines initially unlocked plants.

### Features Modification Rules

Features modification rules apply to `PlantFeatures`、`ZombieFeatures` and `UpgradeFeatures` files。

Each object in the `PLANTS` (or `ZOMBIES`, `UPGRADES`) array will be merged into the original JSON after matching by the `CODENAME` field. The merging rules are as follows:合并规则如下：

- **Array Elements**: If the attribute type is an array, each value in the array will be merged according to element order. If a value in the array is an object, it will be merged recursively. If a value in the array is a primitive type, it will directly overwrite the value in the original JSON.如果数组中的值是对象，则将递归合并。如果数组中的值是基本类型，则直接覆盖原始 JSON 中的值。
- **对象合并**：如果属性类型为对象，则将进行递归合并。**Object Merging**: If the attribute type is an object, it will be merged recursively. If there are attributes with the same key within the object, the value in the original JSON will be directly overwritten.
- **Primitive Attributes**: For primitive attributes with the same key, they are directly overwritten, i.e., replacing the value in the original JSON.

For other fields, such as `SEEDCHOOSERDEFAULTORDER`/`BASEUNLOCKLIST`, the original array is directly replaced.

Therefore, for any plant/zombie that needs modification, you must add an object to the `PLANTS` (`ZOMBIES`) array, and the `CODENAME` field of this object must match the original plant/zombie in the JSON. For plants/zombies that do not need modification, this object does not need to be added.
对于不需要修改的植物/僵尸，则无需添加此对象。

在单个植物/僵尸对象中，只需填写 `CODENAME`。其他字段未填写则保持不变。如果需要修改，则必须添加相应的字段。

> [!important]
>
> - Avoid modifying critical fields like `ID` or `_CARDSPRITENAME` to prevent crashes.。
> - **GE Patcher cannot create new entities; it only modifies existing ones.**\*\*

**Example**

To change the Peashooter's background to "epic" and the Sunflower's name to "Happy Flower":

```json
{
  "PLANTS": [
    {
      "CODENAME": "peashooter",
      "OBTAINWORLD": "epic"
    },
    {
      "CODENAME": "sunflower",
      "NAME": {
        "en": "Happy Flower",
        "zh": "快乐花"
      }
    }
  ]
}
```

## Props/Almanac Files

### Props File Structure

Props files contain the numerical attributes of plants and zombies. The file structure is as follows:文件结构如下：

**PlantProps.json**：Plant numerical attributes (structure example)

```json
{
  "objects": [
    {
      "aliases": ["peashooter"],
      "objclass": "PlantProperties",
      "objdata": {
        "ShootInterval": 1.35,
        "ShootIntervalAdditional": 0.15,
        "PlantfoodPeaCount": 60,
        "Cooldown": 5,
        "CooldownFrom": 1,
        "SunCost": 100,
        "Toughness": 300,
        "Family": "Peashooter"
      }
    }
  ]
}
```

**ZombieProps.json**：Zombie numerical attributes (structure example)

```json
{
  "objects": [
    {
      "aliases": ["tutorial"],
      "objclass": "ZombieProperties",
      "objdata": {
        "ZombieSort": "Normal",
        "CannotBeTossedByCitron": false,
        "WalkSPS": 0.185,
        "Toughness": 190,
        "EatDPS": 100
      }
    }
  ]
}
```

**Key Notes**

- The `objects` array defines modifications to existing plants/zombies.
- The `aliases` array indicates which plant/zombie the object belongs to. Currently, GE Patcher only reads the first item of this array.
- The `objclass` indicates the type of the object, and its value must be `PlantProperties` or `ZombieProperties`.
- `objdata` contains the numerical attributes of the plant/zombie.

### Almanac File Structure

Almanac files contain the Almanac information for plants and zombies. The file structure is as follows:文件结构如下：

**PlantAlmanac.json**：Plant Almanac information (structure example)

```json
{
  "objects": [
    {
      "aliases": ["peashooter"],
      "objclass": "PlantAlmanacProperties",
      "objdata": {
        "Elements": [
          {
            "TYPE": "SUNCOST"
          },
          {
            "TYPE": "RECHARGE"
          },
          {
            "TYPE": "TOUGHNESS"
          },
          {
            "TYPE": "DAMAGE",
            "VALUE": 20
          },
          {
            "TYPE": "RANGE",
            "SORT": {
              "en": "Straight",
              "zh": "直线"
            }
          },
          {
            "TYPE": "FAMILY"
          }
        ],
        "Introduction": {
          "en": "Peashooters are your first line of defence. They shoot peas at attacking zombies",
          "zh": "豌豆射手是你的第一道防线。他们会向僵尸发射豌豆。"
        },
        "Special": [],
        "Chat": {
          "en": "\"What is it like being famous?\"asked Peashooter while sipping his bottled water,\"I can't talk right now, I'm finishing my merchandising deal. Hold my fir coat.\"",
          "zh": "“成为名人是什么感觉？”豌豆射手问了一句，抿了一口自己的瓶装水，“我现在没法说话，我正在完成我的销售项目，帮我拿一下我的毛皮大衣。”"
        },
        "DisplayOffset": {
          "x": 0,
          "y": 0
        },
        "BriefIntroduction": {
          "en": "Shoots peas at the enemies",
          "zh": "向僵尸发射豌豆子弹"
        }
      }
    }
  ]
}
```

**ZombieAlmanac.json**：Zombie Almanac information (structure example)

```json
{
   "//": "basic",
   "aliases": [
      "tutorial"
   ],
   "objclass": "ZombieAlmanacProperties",
   "objdata": {
      "Elements": [
         {
            "TYPE": "TOUGHNESS",
            "SORT": {
               "en": "Average",
               "zh": "一般"
            },
            "PROGRESS": 0.25
         },
         {
            "TYPE": "SPEED",
            "SORT": {
               "en": "Basic",
               "zh": "普通"
            },
            "PROGRESS": 0.5
         }
      ],
      "Introduction": {
         "en": "Regular Garden-variety zombie.",
         "zh": "普普通通的前院僵尸。"
      },
      "Special": [],
      "Chat": {
         "en": "Basic Zombie hates the term \"Basic\". He doesn't consider himself some generic foe or common corpse. He's individual, darn it, and he's going to make a difference even if it kills you.",
         "zh": "普通僵尸讨厌被称作“普通”。他不认为自己只是一个平凡的敌对者，甚至只是个随处可见的死尸。他可是很独立的，该死的，而且在你死之前他都会对局面造成影响。"
      },
      "DisplayOffset": {
         "x": 0,
         "y": 0
      },
      "DisplayScale": {
         "x": 1,
         "y": 1
      }
   }
},
```

### Props/Almanac Modification Rules

Props 修改规则适用于 `PlantProps` 和 `ZombieProps` 文件。Props modification rules apply to `PlantProps` and `ZombieProps` files. Almanac modification rules apply to `PlantAlmanac` and `ZombieAlmanac` files.

Each object in the `objects` array is merged into the original JSON after being matched by the `aliases` field, using the same rules as for `Features` files.

For any plant/zombie that needs modification, you must add an object to the `objects` array, and the first item of that object's `aliases` array must be the `CODENAME` of the corresponding plant/zombie.
For plants/zombies that do not need modification, this object does not need to be added.
对于不需要修改的植物/僵尸，则无需添加此对象。

Within a single object, `objdata` contains the numerical attributes or Almanac information of the plant/zombie. Only the attributes that need to be modified should be filled. Attributes not filled will remain unchanged.只需要填写需要修改的属性，未填写的属性将保持不变。

> [!important]
>
> - `Almanac` files are only used to modify the Almanac information of plants/zombies and do not affect the actual attributes of the plants.
> - Array attributes in `objdata`, such as `Elements` in `Almanac` files, will be merged according to element order. To modify the value of an item in the original array, you need to make the modification at the same position in the array.若需修改原始数组中的某项的值，则需要在数组相同位置的值上进行修改。

## 关卡文件

Place custom level files in `patches/jsons/levels/[LevelName].json`.

- Filenames must match the in-game level ID (e.g., `egypt1.json`).
- Use `gePatcher.showLevels()` to view original level IDs (requires initializing GE Patcher first).

## Store Files

`StoreCommodityFeatures.json` replaces in-game store categories:

```json
{
  "Plants": [], // Plants
  "Upgrade": [], // Upgrades
  "Gem": [], // Gem items (purchased with coins)
  "Coin": [] // Coin items (purchased with gems)
}
```

Omit categories you do not modify.

## 调试

1. Check the console for errors during loading.
2. Common errors:
  - ❌ `Failed to load...`: JSON syntax error.
  - ❌ `Level file not found`: Filename mismatch.
3. Validate JSON using tools like [JSONLint](https://jsonlint.com/).
