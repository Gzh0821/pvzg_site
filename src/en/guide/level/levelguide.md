---
title: Level Files
index: true
icon: feather
pageInfo: false
comment: false
order: 1
---

## Custom Levels

The custom level file of the game "PvZ2 Gardendless" is similar to the original version. It is a text file with the suffix `.json`, which contains all the information of the level, including plants, zombies, terrain, etc.

Compared with the original version, the level file of "PvZ2 Gardendless" adds some new fields to describe the basic information of the level.

## JSON File

If you are already familiar with the JSON file format, you can skip this section directly.

JSON (JavaScript Object Notation) is a lightweight data exchange format that is easy to read and write. It uses key-value pairs to represent data and is usually used to transmit data between clients and servers. The data structures in JSON include objects, arrays, strings, numbers, Boolean values, and null.

- Objects: wrapped in `{}`, containing key-value pairs.

- Arrays: wrapped in `[]`, containing multiple values.

- Strings: wrapped in `""` double quotes.

- Boolean values: `true` or `false`.
- Number: integer or floating point number.
- null: represents a null value.

> [!info]
> JSON files do not support comments. When you use the JSON code provided by this website, please delete the comments starting with `//` double slashes.

Example:

```json
{
  // Delete this comment when using the JSON code
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

In this example:

`name` is a string type, and `age` is a number type. `isStudent` is a Boolean type. `skills` is an array of strings. `address` is an object containing city and zipCode.

For a more in-depth understanding of the JSON format, you can refer to [here](https://www.json.org/json-en.html).

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
  // Level author
  "Author": "LMYY",
  // Optional, author link
  "AuthorLink": "https://github.com/Gzh0821",
  // Level description
  "Introduction": "A level that is easy to play, but hard to win.",
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