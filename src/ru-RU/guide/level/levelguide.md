---
title: Файлы Уровней
index: true
icon: feather
pageInfo: false
order: 1
---

> [!info]
> Перейдите на страницу [Пользовательский уровень](../../creator-garden/), чтобы скачать пример файлов уровней!

## Пользовательские уровни

Файл пользовательского уровня игры "PvZ2 Gardendless" похож на оригинальную версию. Это текстовый файл в формате JSON/JSON5 с расширением `.json` или `json5`, который содержит всю информацию об уровне, включая растения, зомби, местность и т.д.

По сравнению с оригинальной версией, файл уровня "PvZ2 Gardendless" добавляет несколько новых полей для описания основной информации уровня.

## JSON и JSON5

Объекты записываются в `{}`, массивы в `[]`, поля — парами ключ–значение. В `.json` нужны двойные кавычки; комментарии и завершающие запятые запрещены. Для них используйте `.json5`. Далее приведены поля уровня, заполняемые по данным игры.

## Структура файла уровня

Структура файла уровня "PvZ2 Gardendless" выглядит так:

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

\#comment — это название уровня. При написании уровня убедитесь, что название вашего уровня уникально и не повторяется. Поле `version` имеет фиксированное значение 1.
Подробное описание других полей приведено ниже.

## Поле Information

PvZ2 Gardendless добавляет поле верхнего уровня `Information` для описания основной информации об уровне.
Это поле не влияет на функциональность пользовательского уровня в игре, но оно может помочь игрокам быстро понять информацию об уровне, который вы написали.

Это поле содержит следующее:

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

`uuid` - уникальный идентификатор уровня, используемый для различения разных уровней. Пожалуйста, убедитесь в уникальности `uuid` вашего уровня.
Чтобы получить случайный `uuid`, можно воспользоваться онлайн-инструментом генерации, например [UUID Generator](https://www.uuidgenerator.net/).

## Поле objects

objects - это список, элементами которого являются все настройки конкретного уровня. В списке есть несколько objects, каждый из которых соответствует элементу конфигурации. Ниже приведен пример списка objects:

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
