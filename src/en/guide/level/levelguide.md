---
title: Level Files
index: true
icon: feather
pageInfo: false
order: 1
---

> [!info]
> Go to the [Creator's Garden](../../creator-garden/) page to download sample level files!

## Custom Levels

The custom level file of the game "PvZ2 Gardendless" is similar to the original version. It is a JSON/JSON5 text file with the suffix `.json` or `json5`, which contains all the information of the level, including plants, zombies, terrain, etc.

Compared with the original version, the level file of "PvZ2 Gardendless" adds some new fields to describe the basic information of the level.

## JSON and JSON5

Objects use `{}`, arrays use `[]`, and fields are key-value pairs. `.json` requires double-quoted keys and strings and does not allow comments or trailing commas. Use `.json5` for those features. The following examples describe level fields; fill them using actual game data.

## Level file structure

The level file structure of "PvZ2 Gardendless" is as follows:

```json
{
  // Level title
  "#comment": "Sample Level",
  // Basic information of the level
  "Information": {},
  "objects": [
    // List of level settings
    {},
    {}
  ],
  "version": 1
}
```

The `#comment` field is the title of the level. When writing a level, please make sure that the title of your level is unique and not repeated.The `version` field is fixed to 1.
Detailed descriptions of other fields are given below.

## Information field

PvZ2 Gardendless adds the `Information` top-level field to describe basic information about the level.
This field does not affect the functionality of the custom level in the game, but it can help players quickly understand the information of the level you wrote.

This field contains the following:

```json
"Information": {
  // Level UUID
  "uuid": "c58a208a-a5e3-4cfa-9bc3-cc7fbb08c2e3",
  // Level name
  "name": {
      "en": "SampleLevel",
      "zh-CN": "示例关卡"
  },
  // Level author
  "Author": "LMYY",
  // Optional, author link
  "AuthorLink": "https://github.com/Gzh0821",
  // Level description
  "Introduction": {
      "en": "This is a sample level.",
      "zh-CN": "这是一个示例关卡。"
  },
  // Supported game version
  "GameVersion": "0.1.1",
  // Level version
  "Version": "1.0",
  // Level creation time
  "CreatedAt": "2022-03-08",
  // Level update time
  "UpdatedAt": "2022-03-08",
  // Level difficulty, optional values ​​are: Easy, Normal, Hard, Expert
  "Difficulty": "Easy",
  // Level category
  "Category": "Survival"
},
```

`uuid` is the unique identifier of the level, used to distinguish different levels. Please ensure the uniqueness of your level `uuid`.
To obtain a random `uuid`, you can use an online generation tool such as [UUID Generator](https://www.uuidgenerator.net/).

## objects field

objects is a list whose elements are each specific level setting. There are multiple objects in the list, each object corresponds to a configuration item. The following is an example of an objects list:

```json
"objects": [
  {
    // Configuration item: basic settings of the level
    "objclass": "LevelDefinition",
    // Basic settings of the level
    "objdata": {
      // Description of the level
      "Description": "~",
      // Level number, used in series of levels
      "LevelNumber": 1,
      // Keep the default
      "Loot": "RTID(DefaultLoot@LevelModules)",
      // Game mode of the level, the basic game mode is given
      "Modules": [
        "RTID(ZombiesDeadWinCon@LevelModules)",
        "RTID(DefaultZombieWinCondition@LevelModules)",
        "RTID(NewWaves@CurrentLevel)",
        "RTID(SeedBank@CurrentLevel)"
      ],
      // Level name displayed in the game
      "Name": "Bank theft 1",
      // Optional: multi-language support
      "NameMultiLanguage": {
        "en": "Bank theft I",
        "zh": "银行失窃I"
      },
      // Author, it is recommended to be consistent with Information.Author
      "WritenBy": "保罗_刘",
      // Currently useless: drop related
      "NormalPresentTable": "egypt_normal_01",
      "ShinyPresentTable": "egypt_shiny_01",
      // Level scene, format: RTID(world name Stage@LevelModules)
      "StageModule": "RTID(TutorialStage@LevelModules)"
    }
  },
  // Configuration for each gameplay mode:
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
