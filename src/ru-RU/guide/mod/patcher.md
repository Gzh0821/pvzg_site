---
title: Руководство по GE Patcher (последняя версия)
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
> Это руководство работает только для версий `0.3.X`.

GE Patcher - это инструмент для изменения данных игры Plants vs. Zombies 2 Gardendless, поддерживающий пользовательские модификации растений, зомби, улучшений, магазина, уровней и многого другого.

В версии, представленной на сайте, инструмент GE Patcher встроен в сборку для ПК.

## Что нужно подготовить

1. Редактор JSON (рекомендуется VSCode/Notepad++)
2. Версия игры ≥ 0.3.0
3. [Руководство по Свойствам](format.md).

<ins class="adsbygoogle"
style="display:block"
data-ad-client="ca-pub-7637695321442015"
data-ad-slot="3900516289"
data-ad-format="auto"
data-full-width-responsive="true"> </ins>

## Основы

Нажмите `F12` при запуске игры, чтобы открыть консоль разработчика. На вкладке "Консоль" вы должны увидеть что-то вроде этого:

```
[GE Patcher] BaseDir: C:\Users\admin\AppData\Local\com.pvzge.app
```

Этот путь - основной каталог GE Patcher, из которого загружаются файлы патчей. Если вы хотите увидеть, откуда _именно_ загружаются файлы, введите команду `gePatcher.help()`.

Как только вы увидите титульный экран, вы можете загрузить свой патч. \*\* Введя в консоль `gePatcher.init()`, вы загрузите свои пользовательские файлы.\*\*

После изменения JSON-файла, пожалуйста, **запустите эту команду снова, чтобы применить изменения**.

## Структура Файлов

Чтобы запустить свой патч, создайте папку `patches` внутри `com.pvzge.app` со следующей структурой (не все файлы обязаны присутствовать):

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
        └── [LevelName].json (does not support JSON5)
```

Каталог `features` содержит файлы `Features`, `Props` и `Almanac` для модификации растений, зомби, улучшений, магазина и т.д.

Файлы в каталоге `levels` используются для замены уровней. Если вы хотите получить оригинальные уровни, попробуйте найти похожие в ванильной PvZ2 (извлечение файлов PvZ2 выходит за рамки данного руководства).

Все, что вы не измените, по умолчанию будет иметь свойства базовой игры.

## Файлы-Характеристики

### Структура Файлов Характеристик

Файлы характеристик содержат основные свойства растений, зомби и улучшений. Структура файлов выглядит следующим образом:

**PlantFeatures.json**

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

**ZombieFeatures.json**

```json
{
  "ZOMBIES": [
    {
      "CODENAME": "tutorial"
    }
  ]
}
```

**UpgradeFeatures.json**

```json
{
  "UPGRADES": [
    {
      "CODENAME": "upgrade_starting_sun_lvl1"
    }
  ]
}
```

**Ключевые заметки**

- Массивы `PLANTS`, `ZOMBIES` и `UPGRADES` определяют модификации существующих сущностей.
- `SEEDCHOOSERDEFAULTORDER` устанавливает порядок растений. Порядок массива - это порядок, в котором они появляются в альманахе, выборе семян и т.д.
- `BASEUNLOCKLIST` определяет растения, разблокированные по умолчанию в новых профилях игроков.

### Правила Модификаций Характеристик

Правила модификаций характеристик применяются к файлам `PlantFeatures`, `ZombieFeatures` и `UpgradeFeatures`.

Каждый объект в массиве `PLANTS` (или `ZOMBIES`, `UPGRADES`) будет объединен в исходный JSON после сопоставления по полю `CODENAME`. Правила объединения следующие:

- **Элементы Массива**: Если тип свойства - массив, каждое значение в массиве будет объединено в соответствии с порядком элементов. Если значение в массиве является объектом, оно будет объединено рекурсивно. Если значение в массиве относится к примитивному типу, оно напрямую перезапишет значение в исходном JSON.
- **Слияние Объектов**: Если тип свойства является объектом, он будет объединен рекурсивно. Если в объекте есть атрибуты с одинаковым ключом, значение в исходном JSON будет напрямую перезаписано.
- **Примитивные Атрибуты**: Для примитивных атрибутов с одинаковым ключом они напрямую перезаписываются, т.е. заменяют значение в исходном JSON.

Для других свойств, таких как `SEEDCHOOSERDEFAULTORDER`/`BASEUNLOCKLIST`, исходный массив просто заменяется.

Поэтому для любого растения/зомби, требующего модификации, вы должны добавить объект в массив `PLANTS` (или `ZOMBIES`), а поле `CODENAME` этого объекта должно соответствовать исходному растению/зомби в JSON. Для растений/зомби, которые не нуждаются в модификации, этот объект добавлять не нужно.

В пределах одного объекта растения/зомби необходимо заполнить только `CODENAME`. Другие незаполненные поля останутся без изменений. Если необходимо внести изменения, следует добавить соответствующие поля.

> [!important]
>
> - Избегайте изменения таких критических свойств, как `ID` или `_CARDSPRITENAME`, чтобы избежать сбоев или других нежелательных ошибок.
> - **GE Patcher не может создавать новые растения, зомби или что-то подобное; он только изменяет существующие сущности**.

**Пример**

Чтобы изменить фон Горохострела на "epic", а имя Подсолнуха на "Happy Flower":

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

## Файлы Props/Almanac

### Структура Файлов Props

Файлы Props содержат игровые свойства растений и зомби. Структура файлов выглядит следующим образом:

**PlantProps.json**

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

**ZombieProps.json**

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

**Ключевые заметки**

- Массив `objects` определяет объекты, которые изменяют существующие растения/зомби.
- Массив `aliases` указывает, к какому растению/зомби принадлежит объект. Сейчас GE Patcher считывает только первый элемент этого массива.
- Класс `objclass` указывает на тип объекта, и его значение должно быть `PlantProperties` или `ZombieProperties` в зависимости от того, что вы изменяете.
- `objdata` содержит игровые свойства растения/зомби.

### Структура Файлов Almanac

Файлы Almanac содержат информацию Альманаха для растений и зомби. Структура файлов выглядит следующим образом:

**PlantAlmanac.json**

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

**ZombieAlmanac.json**

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

### Правила Модификаций Props/Almanac

Правила модификации Props применяются к файлам `PlantProps` и `ZombieProps`. Правила модификации Almanac применяются к файлам `PlantAlmanac` и `ZombieAlmanac`.

Каждый объект в массиве `objects` объединяется с исходным JSON после сопоставления с полем `aliases`, используя те же правила, что и для файлов `Features`.

+Для каждого растения/зомби, которое вы хотите изменить, вы должны добавить объект в массив `objects`. У этого объекта должно быть свойство `aliases` с кодовым именем растения/зомби, которое вы хотите изменить.
+**Примечание:** Только первый элемент массива `aliases` используется для подбора растения/зомби для модификации.
+Для растений/зомби, которые вы не хотите изменять, вам не нужно ничего делать - по умолчанию будут установлены ванильные свойства.

Внутри одного объекта `objdata` содержит игровые свойства или информацию Альманаха о растении/зомби. Добавлять следует только те свойства, которые необходимо изменить. Если свойства не добавлены, по умолчанию будут использоваться ванильные свойства.

> [!important]
>
> - Файлы `Almanac` используются только для изменения информации Альманаха растений/зомби и не влияют на реальную статистику растений в игре.
> - Атрибуты массива в `objdata`, такие как `Elements` в файлах `Almanac`, будут объединены в соответствии с порядком элементов. Чтобы изменить значение элемента в исходном массиве, необходимо произвести модификацию в той же позиции массива.

## Файлы Уровней

Поместите файлы пользовательских уровней в `patches/jsons/levels/[LevelName].json`.

- Имена файлов должны соответствовать внутриигровому ID уровня (например, `egypt1.json`).
- Используйте `gePatcher.showLevels()` для просмотра оригинальных ID уровней (для этого требуется сначала инициализировать GE Patcher).
- Уровни JSON5 не поддерживаются и не будут загружены.

## Файлы Магазина

`StoreCommodityFeatures.json` заменяет категории внутриигрового магазина:

```json
{
  "Plants": [], // Plants
  "Upgrade": [], // Upgrades
  "Gem": [], // Gem items (purchased with coins)
  "Coin": [] // Coin items (purchased with gems)
}
```

_Примечание: комментарии поддерживаются в JSON._

Опустите категории, которые вы не будете изменять.

## Отладка

1. Проверьте консоль на наличие ошибок во время загрузки.
2. Распространенные ошибки:
  - ❌ `Failed to load...`: JSON syntax error. (ошибка синтаксиса)
  - ❌ `Level file not found`: Filename mismatch. (несоответствие имени файла)
3. Проверяйте JSON с помощью таких инструментов, как [JSONLint](https://jsonlint.com/).
