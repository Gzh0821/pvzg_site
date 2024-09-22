---
title: 关卡文件
index: true
icon: file-pen
pageInfo: false
comment: false
order: 1
---

## 自定义关卡

《PvZ2 Gardendless》游戏的自定义关卡文件与原版类似，是一个以`.json`为后缀的文本文件，其中包含了关卡的所有信息，包括植物、僵尸、地形等。
相比原版，《PvZ2 Gardendless》的关卡文件增加了一些新的字段，来描述该关卡的基本信息。

## JSON 文件

若您已经熟悉 JSON 文件格式，可以直接跳过本章节。

JSON（JavaScript Object Notation）是一种轻量级的数据交换格式，易于阅读和编写。它使用键值对来表示数据，通常用于客户端与服务器之间传输数据。JSON 中的数据结构包括对象、数组、字符串、数字、布尔值和 null。

- 对象：使用 `{}` 包裹，包含键值对。
- 数组：使用 `[]` 包裹，包含多个值。
- 字符串：使用 `""` 双引号包裹。
- 布尔值：`true` 或 `false`。
- 数字：整数或浮点数。
- null：表示空值。

> [!info]
> JSON 文件不支持注释，在您使用本网站提供的 JSON 代码时，请删除以 `//` 双斜杠开头的注释。

示例：

```json
{
  // 使用时，删除此注释
  "name": "Alice",
  "age": 25,
  "isStudent": false,
  "skills": ["JavaScript", "Python", "HTML"],
  "address": {
    "city": "New York",
    "zipCode": "10001"
  }
}
```

在这个示例中：

`name` 是字符串类型，`age` 是数字类型。`isStudent` 是布尔类型。`skills` 是一个字符串数组。`address` 是一个对象，包含 city 和 zipCode。

想更深入的了解 JSON 格式，可以参考[这里](https://www.json.org/json-zh.html)。

## 关卡文件结构

《PvZ2 Gardendless》的关卡文件结构如下：

```json
{
  // 关卡的标题
  "#comment": "Sample Level",
  // 关卡的基本信息
  "Information": {},
  "objects": [
    // 关卡设置的列表
    {},
    {}
  ],
  "version": 1
}
```

`#comment`字段为关卡的标题，在编写关卡时，请确定您关卡的标题唯一且不重复。`version`字段固定为 1。
其它字段的详细说明见下文。

## Information 字段

《PvZ2 Gardendless》增加了`Information`顶级字段，用于描述关卡的基本信息。
该字段并不会影响自定义关卡在游戏内的功能，但能够帮助玩家快速了解您编写的关卡的信息。

这个字段包含了以下内容：

```json
"Information": {
  // 关卡的UUID
  "uuid": "c58a208a-a5e3-4cfa-9bc3-cc7fbb08c2e3",
  // 关卡的作者
  "Author": "LMYY",
  // 可选，作者的链接
  "AuthorLink": "https://github.com/Gzh0821",
  // 关卡的描述
  "Introduction": "A level that is easy to play, but hard to win.",
  // 关卡的版本
  "Version": "1.0",
  // 关卡的创建时间
  "CreatedAt": "2022-03-08",
  // 关卡的更新时间
  "UpdatedAt": "2022-03-08",
  // 关卡的难度，可选值有：Easy, Normal, Hard, Expert
  "Difficulty": "Easy",
  // 关卡的分类
  "Category": "Survival"
},
```

`uuid`是关卡的唯一标识，用于区分不同的关卡。请确保您的关卡`uuid`的唯一性。
要获取随机的`uuid`，可以使用在线生成工具，如[UUID Generator](https://www.uuidgenerator.net/)。

## objects 字段

objects 是一个列表，其元素为每一个具体的关卡设置。列表里面有多个对象，每个对象对应着一个配置项，下面是一个 objects 列表的示例：

```json
"objects": [
  {
    // 配置项：关卡的基本设置
    "objclass": "LevelDefinition",
    // 关卡的基本设置
    "objdata": {
      // 关卡的描述
      "Description": "~",
      // 关卡的编号，用于系列关卡中
      "LevelNumber": 1,
      // 保持默认即可
      "Loot": "RTID(DefaultLoot@LevelModules)",
      // 关卡的玩法模式，给出的是基本玩法模式。
      "Modules": [
        "RTID(ZombiesDeadWinCon@LevelModules)",
        "RTID(DefaultZombieWinCondition@LevelModules)",
        "RTID(NewWaves@CurrentLevel)",
        "RTID(SeedBank@CurrentLevel)"
      ],
      // 显示在游戏内的关卡名
      "Name": "Bank theft 1",
      // 可选：多语言支持
      "NameMultiLanguage": {
        "en": "Bank theft I",
        "zh": "银行失窃I"
      },
      // 作者，建议与Author一致
      "WritenBy": "保罗_刘",
      // 目前无用：掉落相关
      "NormalPresentTable": "egypt_normal_01",
      "ShinyPresentTable": "egypt_shiny_01",
      // 关卡的场景，格式为:RTID(世界名Stage@LevelModules)
      "StageModule": "RTID(TutorialStage@LevelModules)"
    }
  },
  // 每个玩法模式的配置:
  {
    "aliases": [
      "SeedBank"
    ],
    "objclass": "SeedBankProperties",
    "objdata": {
      "PresetPlantList": [
        {
          "Level": -1,
          "PlantType": "peashooter"
        }
      ],
      "SelectionMethod": "chooser"
    }
  },
  {
    "aliases": [
      "NewWaves"
    ],
    "objclass": "WaveManagerModuleProperties",
    "objdata": {
      "WaveManagerProps": "RTID(WaveManagerProps@CurrentLevel)"
    }
  },
  {
    "aliases": [
      "WaveManagerProps"
    ],
    "objclass": "WaveManagerProperties",
    "objdata": {
      "FlagWaveInterval": 1,
      "WaveCount": 1,
      "Waves": [
        [
          "RTID(Wave1@CurrentLevel)"
        ]
      ]
    }
  },
  {
    "aliases": [
      "Wave1"
    ],
    "objclass": "SpawnZombiesJitteredWaveActionProps",
    "objdata": {
      "AdditionalPlantfood": 0,
      "Zombies": [
        {
          "Type": "RTID(tutorial@ZombieTypes)"
        }
      ]
    }
  }
]
```
