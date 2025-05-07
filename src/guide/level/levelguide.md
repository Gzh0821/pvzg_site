---
title: 关卡文件
index: true
icon: file-pen
pageInfo: false
order: 1
---

> [!info]
> 前往[自定义关卡](../../custom-level/)页面下载示例关卡文件！

## 自定义关卡

《PvZ2 Gardendless》游戏的自定义关卡文件与原版类似，是一个以`.json`或`.json5`为后缀的 JSON/JSON5 文本文件，其中包含了关卡的所有信息，包括植物、僵尸、地形等。
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

> [!warning]
> JSON 文件不支持注释，在您使用本网站提供的 JSON 代码时，请使用下文提到的`JSON5`格式，或删除以 `//` 双斜杠开头的注释。

示例：

```json
{
  // 使用json时，删除此注释
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

## JSON5 文件

> [!important]
> 您可以在编写关卡文件时使用 JSON5 格式，请使用`.json5`作为关卡文件的后缀名以区分普通的`json`文件。

JSON5 是一种基于 JSON（JavaScript Object Notation）的扩展，它旨在增强 JSON 的可读性和可用性，同时保持与 JSON 的兼容性。JSON5 允许开发者在不违反现有 JSON 标准的前提下使用更宽松的语法，适应更多场景。

JSON5 引入了一些灵活性，使得配置文件或数据传输格式更易于书写和理解。以下是 JSON5 的主要特点：

### 灵活的对象键名

在标准 JSON 中，键名必须用双引号包裹，而在 JSON5 中，键名可以不加引号，甚至可以使用单引号。

```json5
{
  unquoted: 'This is allowed in JSON5',
  singleQuotes: 'This is also allowed'
}
```

### 行末尾的逗号

在 JSON5 中，可以在对象或数组的最后一项后面添加逗号，这在编辑时尤其方便。

```json5
{
  key: 'value',
  anotherKey: 42 // 允许行末逗号
}
```

### 支持注释

JSON5 支持单行和多行注释，类似于 JavaScript。标准的 JSON 不允许使用注释，而 JSON5 允许开发者在数据文件中添加额外的注解信息。

```json5
{
  // 这是一个单行注释
  key: 'value',

  /*
    这是一个多行注释
    可以解释复杂的配置
  */
  anotherKey: 42
}
```

### 灵活的字符串

JSON5 同时支持单引号和双引号字符串。

```json5
{
  singleQuotes: 'This is a string',
  doubleQuotes: 'This is also a string'
}
```

JSON5 允许在字符串中使用换行符，无需像 JSON 那样必须使用 `\n` 来表示换行，同时，还可以在字符串中使用转义字符。

```json5
{
  longString: 'This is a very long string that \
spans multiple lines\t'
}
```

### 额外的数据类型

JSON5 支持更多的数值格式，比如十六进制表示法和正负无穷大值（`Infinity`），以及 `NaN`（Not-a-Number）。

```json5
{
  decimal: 123,
  hexadecimal: 0x7b,
  infinity: Infinity,
  notANumber: NaN
}
```

### 更灵活的数值表示

可以省略整数部分的零或小数部分的零。

```json5
{
  fractional: 0.5, // 相当于 0.5
  trailing: 2 // 相当于 2.0
}
```

想了解更多 JSON5 的内容，可以参考[这里](https://json5.org/)。

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
  // 关卡名称
  "name": {
      "en": "SampleLevel I",
      "zh-CN": "示例关卡1"
  },
  // 关卡的作者
  "Author": "LMYY",
  // 可选，作者的链接
  "AuthorLink": "https://github.com/Gzh0821",
  // 关卡的描述
  "Introduction": {
      "en": "This is a sample level.",
      "zh-CN": "这是一个示例关卡。"
  },
  // 关卡支持的游戏版本
  "GameVersion": "0.1.1",
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
