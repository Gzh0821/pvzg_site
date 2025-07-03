---
title: Файлы Уровней
index: true
icon: feather
pageInfo: false
order: 1
---

> [!info]
> Перейдите на страницу [Пользовательский уровень](../../custom-level/), чтобы скачать пример файлов уровней!

## Пользовательские уровни

Файл пользовательского уровня игры "PvZ2 Gardendless" похож на оригинальную версию. Это текстовый файл в формате JSON/JSON5 с расширением `.json` или `json5`, который содержит всю информацию об уровне, включая растения, зомби, местность и т.д.

По сравнению с оригинальной версией, файл уровня "PvZ2 Gardendless" добавляет несколько новых полей для описания основной информации уровня.

## Файл JSON

Если вы уже знакомы с форматом файлов JSON, этот раздел можно сразу пропустить.

JSON (JavaScript Object Notation) - это легкий формат обмена данными, который легко читать и писать. Он использует пары ключ-значение для представления данных и обычно применяется для передачи данных между клиентами и серверами. Структуры данных в JSON включают объекты, массивы, строки, числа, булевы значения и null.

- Объекты: обернутые в `{}`, содержащие пары ключ-значение.

- Массивы: обернутые в `[]`, содержащие несколько значений.

- Строки: обернуты в `""` двойные кавычки.

- Булевы значения: `true` или `false`.

- Число: целое число или число с плавающей точкой.

- null: представляет собой нулевое значение.

> [!warning]
> Файлы JSON не поддерживают комментарии. При использовании JSON-кода, представленного на этом сайте, пожалуйста, используйте формат `JSON5`, указанный ниже, или удалите комментарии, начинающиеся с двойных слешей `//`.

Пример:

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

В данном примере:

`name` - строковый тип, а `age` - числовой тип. `isStudent` - булево значение. `skills` - это массив строк. `address` - это объект, содержащий город и почтовый индекс.

Для более детального изучения формата JSON смотрите [здесь](https://www.json.org/json-en.html).

## Файл JSON5

> [!important]
> При написании файлов уровней можно использовать формат JSON5. Пожалуйста, используйте расширение `.json5`, чтобы отличать его от обычного `json`.

JSON5 - это расширение, основанное на JSON (JavaScript Object Notation). Его цель - улучшить читаемость и удобство использования JSON, сохранив при этом совместимость с JSON. JSON5 позволяет использовать более гибкий синтаксис, не нарушая стандарт JSON.

JSON5 добавляет гибкость и упрощает написание конфигурационных файлов или форматов обмена данными. Вот его основные возможности:

### Гибкие имена ключей

В стандартном JSON имена ключей должны быть заключены в двойные кавычки, в то время как в JSON5 имена ключей могут быть без кавычек или даже с одинарными кавычками.

```json5
{
  unquoted: 'This is allowed in JSON5',
  singleQuotes: 'This is also allowed'
}
```

### Запятая в конце строки

В JSON5 можно добавить запятую после последнего элемента объекта или массива, что особенно удобно при редактировании.

```json5
{
  key: 'value',
  anotherKey: 42 // Allow end of line comma
}
```

### Поддержка комментариев

JSON5 поддерживает однострочные и многострочные комментарии, как и JavaScript. Стандартный JSON не допускает комментариев, в то время как JSON5 позволяет разработчикам добавлять дополнительную аннотационную информацию в файлы данных.

```json5
{
  // This is a single-line comment
  key: 'value',

  /*
  This is a multi-line comment
  Can explain complex configuration
  */
  anotherKey: 42
}
```

### Гибкие строки

JSON5 поддерживает строки как с одинарными, так и с двойными кавычками.

```json5
{
  singleQuotes: 'This is a string',
  doubleQuotes: 'This is also a string'
}
```

JSON5 позволяет использовать переносы строк внутри строк. В отличие от JSON, он не требует использования `\n` для представления новых строк. В то же время в строках можно использовать и управляющие символы.

```json5
{
  longString: 'This is a very long string that \
  spans multiple lines\t'
}
```

### Дополнительные типы данных

JSON5 поддерживает больше числовых форматов, таких как шестнадцатеричная нотация, положительные и отрицательные значения бесконечности (`Infinity`), а также `NaN` (Not-a-Number).

```json5
{
  decimal: 123,
  hexadecimal: 0x7b,
  infinity: Infinity,
  notANumber: NaN
}
```

### Более гибкое представление чисел

Вы можете опустить нули в целой или дробной части.

```json5
{
  fractional: 0.5, // equivalent to 0.5
  trailing: 2 // equivalent to 2.0
}
```

Подробнее о JSON5 читайте [здесь](https://json5.org/).

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
