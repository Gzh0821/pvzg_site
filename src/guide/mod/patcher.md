---
title: GE Patcher 使用教程(latest)
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
> 以下教程仅适用于`0.3.X`版本。

GE Patcher 是一个用于修改 PvZ2 Gardendless 游戏数据的工具，支持对植物、僵尸、升级、商店和关卡等内容的自定义修改。

官网提供的版本已经内置了 GE Patcher 工具。

## 前提条件

1. JSON 编辑器（推荐使用 VSCode/Notepad++）
2. 游戏版本 ≥ 0.3.0
3. 植物、僵尸等元素的 JSON 属性结构，请参阅[属性参考](format.md)

<ins class="adsbygoogle"
style="display:block"
data-ad-client="ca-pub-7637695321442015"
data-ad-slot="3900516289"
data-ad-format="auto"
data-full-width-responsive="true">
</ins>

## GE Patcher 基础知识

在游戏启动时按“F12”打开开发者界面。在控制台选项卡中，会出现类似以下内容的输出：

```
[GE Patcher] BaseDir: C:\Users\admin\AppData\Local\com.pvzge.app
```

给出的路径是 GE Patcher 的主目录。

输入以下命令查看游戏内帮助，包括自定义 JSON 文件的路径：

```javascript
gePatcher.help()
```

游戏加载完成后，运行以下命令加载所有自定义 JSON 文件：

```javascript
gePatcher.init()
```

**修改 JSON 文件后，请重新执行此命令以应用更改。**

## 文件结构

在 `com.pvzge.app` 中创建一个 `patches` 文件夹，其结构如下：

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
        └── [关卡名].json
```

`features` 目录下包含 `Features` 文件，`Props` 文件和 `Almanac` 文件，用于修改植物、僵尸、升级和商店等内容。

`levels` 目录下的文件用于修改关卡。

未修改原版内容的文件无需创建。

## Features 文件

### Features 文件结构

Features 文件包含植物、僵尸和升级的基本属性。文件结构如下：

**PlantFeatures.json**：植物基本特性（结构示例）

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

**ZombieFeatures.json**：僵尸基本特性（结构示例）

```json
{
  "ZOMBIES": [
    {
      "CODENAME": "tutorial"
    }
  ]
}
```

**UpgradeFeatures.json**：升级属性（结构示例）

```json
{
  "UPGRADES": [
    {
      "CODENAME": "upgrade_starting_sun_lvl1"
    }
  ]
}
```

**重点说明**

- `PLANTS`、`ZOMBIES` 和 `UPGRADES` 数组定义对现有实体的修改。
- `SEEDCHOOSERDEFAULTORDER` 设置种子选择器中的默认植物顺序。
- `BASEUNLOCKLIST` 定义初始解锁的植物。

### Features 修改规则

Features 修改规则适用于 `PlantFeatures`、`ZombieFeatures` 和 `UpgradeFeatures` 文件。

`PLANTS`（或 `ZOMBIES`、`UPGRADES`）数组中的每个对象在通过 `CODENAME` 字段匹配后，都会合并到原始 JSON 中。合并规则如下：

- **数组元素**：如果属性类型为数组，则数组中每个值将按元素顺序合并。如果数组中的值是对象，则将递归合并。如果数组中的值是基本类型，则直接覆盖原始 JSON 中的值。
- **对象合并**：如果属性类型为对象，则将进行递归合并。如果对象中存在具有相同键的属性，则直接覆盖原始 JSON 中的值。
- **基本属性**：对于具有相同键的基本属性，直接覆盖，即替换原始 JSON 中的值。

对于其他字段，例如 `SEEDCHOOSERDEFAULTORDER`/`BASEUNLOCKLIST` 等，则直接替换原始数组。

因此，对于任何需要修改的植物/僵尸，需要在 `PLANTS` (`ZOMBIES`) 数组中添加一个对象，并且该对象的 `CODENAME` 字段必须与 JSON 中的原始植物/僵尸一致。
对于不需要修改的植物/僵尸，则无需添加此对象。

在单个植物/僵尸对象中，只需填写 `CODENAME`。其他字段未填写则保持不变。如果需要修改，则必须添加相应的字段。

> [!important]
>
> - 避免修改 `ID` 或 `_CARDSPRITENAME` 等关键字段，以防止崩溃。
> - **GE Patcher 无法创建新实体；它只会修改现有的。**

**示例**

要将豌豆射手的背景改为“史诗”，将向日葵的名称改为“Happy Flower”：

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

## Props/Almanac 文件

### Props 文件结构

Props 文件包含植物和僵尸的数值属性。文件结构如下：

**PlantProps.json**：植物数值属性（结构示例）

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

**ZombieProps.json**：僵尸数值属性（结构示例）

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

**重点说明**

- `objects` 数组定义对现有植物/僵尸的修改。
- `aliases` 数组表示该对象属于哪个植物/僵尸，目前 GE Patcher 仅读取该数组的第一项。
- `objclass` 表示该对象的类型，值必须为 `PlantProperties` 或 `ZombieProperties`。
- `objdata` 包含植物/僵尸的数值属性。

### Almanac 文件结构

Almanac 文件包含植物和僵尸的图鉴信息。文件结构如下：

**PlantAlmanac.json**：植物图鉴信息（结构示例）

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

**ZombieAlmanac.json**：僵尸图鉴信息（结构示例）

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

### Props/Almanac 修改规则

Props 修改规则适用于 `PlantProps` 和 `ZombieProps` 文件。Almanac 修改规则适用于 `PlantAlmanac` 和 `ZombieAlmanac` 文件。

`objects` 数组中的每个对象通过 `aliases` 字段匹配后合并至原始 JSON 中，规则与 `Features` 文件相同。

对于任何需要修改的植物/僵尸，需要在 `objects` 数组中添加一个对象，并且该对象的 `aliases` 数组的第一项必须是对应植物/僵尸的 `CODENAME`。
对于不需要修改的植物/僵尸，则无需添加此对象。

在单个对象中，`objdata` 包含植物/僵尸的数值属性或图鉴信息。只需要填写需要修改的属性，未填写的属性将保持不变。

> [!important]
>
> - `Almanac` 文件仅仅用于修改植物/僵尸的图鉴信息，不会影响植物的实际属性。
> - `objdata` 中的数组属性，如 `Almanac` 文件中的 `Elements`，将按元素顺序合并。若需修改原始数组中的某项的值，则需要在数组相同位置的值上进行修改。

## 关卡文件

将自定义关卡文件放置在 `patches/jsons/levels/[LevelName].json` 中。

- 文件名必须与游戏内关卡 ID 匹配（例如，`egypt1.json`）。
- 使用 `gePatcher.showLevels()` 查看原始关卡 ID（需要先初始化 GE Patcher）。

## 商店文件

`StoreCommodityFeatures.json` 替换游戏内商店类别：

```json
{
  "Plants": [], // 植物
  "Upgrade": [], // 升级
  "Gem": [], // 宝石物品（使用金币购买）
  "Coin": [] // 金币物品（使用宝石购买）
}
```

省略不需要修改的类别。

## 调试

1. 检查控制台加载过程中的错误。
2. 常见错误：
   - ❌ `Failed to load...`：JSON 语法错误。
   - ❌ `Level file not found`：文件名不匹配。
3. 使用 [JSONLint](https://jsonlint.com/) 等工具验证 JSON。
