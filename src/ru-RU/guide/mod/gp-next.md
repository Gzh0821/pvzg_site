---
title: Руководство по GP-Next
icon: toolbox
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

> [!tip]
> Это руководство подходит для версии игры `0.7.1` и выше.

GP-Next - это встроенный в PvZ2 Gardendless инструмент нового поколения для изменения данных игры. Он поддерживает модификацию растений, зомби, grid items, улучшений, магазина, уровней и другого через JSON-файлы. Также есть Trainer (Cheats) и браузер данных для ручных правок в реальном времени.

Версия, опубликованная на сайте, уже содержит GP-Next (в облачной версии его пока нет). Нажмите `F10` в игре или кнопку в левом верхнем углу, чтобы открыть панель GP-Next.

## Предварительные требования

1. JSON-редактор (рекомендуется VSCode / Notepad++).
2. Версия игры >= 0.7.1.
3. Базовое понимание структуры JSON. См. [Справочник свойств](format.md).

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-7637695321442015"
     data-ad-slot="7113006248"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

## Структура каталогов и приоритет

GP-Next загружает патчи из папки `gp-next` внутри директории данных игры. Путь можно открыть через **Open Folder** во вкладке Patcher инструмента GP-Next.

Приоритет загрузки (поздний шаг имеет больший приоритет):

1. **Каталог packs/ (Datapacks)**: сюда помещаются полноценные модпаки (папка или `.zip`). Порядок определяется полем `priority` в `pack.json`.
2. **Каталог patches/ (одиночные патчи)**: JSON-файлы здесь работают как старый gePatcher. Их приоритет выше, чем у packs.
3. **Ручные правки (вкладка Data)**: изменения из вкладки **Data** сохраняются как `__gpn_edits` и **всегда** перекрывают остальные источники.

```text
com.pvzge.app/
└── gp-next/
    ├── packs/
    │   ├── MyPack/         ← Datapack в виде папки
    │   │   ├── pack.json   ← Обязательный манифест
    │   │   └── jsons/
    │   │       ├── features/
    │   │       ├── lang/
    │   │       ├── objects/
    │   │       └── levels/
    │   └── AnotherPack.zip ← Datapack в ZIP
    └── patches/            ← Одиночные патчи
        └── jsons/
            ├── features/
            ├── lang/
            ├── objects/
            └── levels/
```

### Назначение каталогов

- **`features/`**: `PlantFeatures.json`, `ZombieFeatures.json`, `StoreCommodityFeatures.json`, `MintObtainRoute.json`, `WorldmapFeatures.json` и т.д. Здесь хранятся метаданные сущностей.
- **`lang/`**: сюда помещаются `lang.json` или `lang.json5` с многоязычными текстами для регистрации дополнительных языков и переопределения переводов мода.
- **`objects/`**: `PlantProps.json`, `ZombieProps.json`, `PlantAlmanac.json` и т.д. Здесь редактируются боевые значения (HP, damage, cooldown) и тексты альманаха.
- **`levels/`**: кастомные уровни. Имя файла должно точно совпадать с ID уровня в игре (например `egypt1.json`).

## Логика JSON merge

GP-Next использует глубокое слияние. **Нужно указывать только те поля, которые вы меняете**, остальные поля сохраняются.

- Массивы в патче **полностью заменяют** целевой массив.
- Если меняете массив (например `Basic_Zombie` или `PLANTS`), передавайте полный новый массив.

Правила по типам файлов:

- **Features** (`PlantFeatures`, `ZombieFeatures`, `StoreCommodityFeatures` и др.): сопоставление по идентификатору (`CODENAME`, в ряде секций `CommodityName`, в `MintObtainRoute` - `Family`).
- **Objects** (`PlantProps`, `PlantAlmanac` и др.): сопоставление по первому элементу `aliases`.
- **Levels** (`levels/*.json`): файл **заменяется полностью**.

**Пример: изменить только SunCost и Cooldown у peashooter**
`PlantProps.json`:
```json
{
  "objects": [
    {
      "aliases": ["peashooter"],
      "objclass": "PlantProperties",
      "objdata": {
        "SunCost": 50,
        "Cooldown": 2
      }
    }
  ]
}
```

## Datapacks (`pack.json`)

Чтобы создать datapack, сделайте папку внутри `packs/` и добавьте в корень `pack.json`.

**Формат pack.json:**
```json
{
  "uuid": "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
  "name": "My Custom Mod",
  "version": "1.0.0",
  "priority": 100,
  "description": "Optional description for your mod.",
  "author": "Your Name",
  "formatVersion": 1,
  "gameVersion": "0.7.1",
  "gpNextVersion": ">=1.0.0"
}
```

- **uuid**: обязательный уникальный идентификатор.
- **name**: отображаемое имя мода.
- **version**: версия мода.
- **priority**: порядок загрузки (меньше число - раньше загрузка).
- **description**: краткое описание.
- **author**: автор.
- **formatVersion**: версия формата datapack (сейчас 1).
- **gameVersion**: целевая версия игры.
- **gpNextVersion**: минимальная требуемая версия GP-Next.
- **thumbnail.png / thumbnail.ico**: квадратная обложка (< 128x128) в корне datapack.

### Шаги создания datapack

1. Создайте папку в `packs/`, например `MyFirstMod`.
2. Создайте `pack.json` в `MyFirstMod`.
3. Создайте `jsons/features`, `jsons/objects` или `jsons/levels` по необходимости.
4. Запишите JSON с учетом правил глубокого слияния.
5. (Опционально) Добавьте `thumbnail.png` или `thumbnail.ico`.
6. (Опционально) Сожмите в `MyFirstMod.zip` и поделитесь.

## Настройка нескольких языков (Language Pack)

Если вы хотите, чтобы один мод поддерживал несколько языков (например, китайский, английский, испанский и русский), добавьте в datapack файл `jsons/lang/lang.json` (или `lang.json5`).

### Расположение файлов

```text
MyFirstMod/
├── pack.json
└── jsons/
    └── lang/
        └── lang.json
```

### Минимальный пример

```json
{
  "_languages": [
    { "code": "es", "name": "Español", "isCJK": false },
    { "code": "ru", "name": "Русский", "isCJK": false }
  ],
  "LoadingTips": [
    {
      "en": "Sun is your core resource.",
      "zh": "阳光是你的核心资源。",
      "es": "El sol es tu recurso principal.",
      "ru": "Солнце - ваш основной ресурс."
    }
  ]
}
```

- `_languages`: необязательное поле. Регистрирует дополнительные языки в настройках игры (помимо стандартных `en` / `zh`).
- Текстовые узлы: в одной записи указывайте поля `en`, `zh`, `es`, `ru` и т.д.
- Коды языков: используйте стандартные коды, например `es`, `ru`, `ja`.

### Как применить

1. Поместите datapack с `jsons/lang/lang.json` в `gp-next/packs/`.
2. Откройте панель GP-Next в игре, перейдите во вкладку **Patcher** и нажмите **Save & Reload** (или перезапустите игру).
3. В настройках игры переключите язык на один из языков, объявленных в `_languages`.
4. Вернитесь в игру и проверьте отображение текста.

> [!tip]
> `lang.json` использует такое же глубокое слияние, как и другие патчи. Достаточно указывать только те текстовые узлы, которые вы хотите переопределить.

> [!note]
> Это не ограничивается только `jsons/lang/lang.json`. Если в других patch JSON уже есть многоязычные текстовые узлы (например тексты записей в `objects/PlantAlmanac.json`), вы также можете добавить туда поля дополнительных языков (`es`, `ru`, `ja` и т.д.) для перевода.

## Ручные правки и вкладка Data

Во вкладке **Data** можно просматривать и редактировать данные игры в реальном времени.

Такие изменения сохраняются как `__gpn_edits` и сохраняются между сессиями.

> [!important]
> Ручные правки удобны для быстрого тюнинга и отладки. Для стабильных/публикуемых модов лучше использовать структурированный Datapack в `packs/`.

Удалить ручные правки можно через правый клик по элементу/типу во вкладке Data и выбор "Restore".

## Trainer (Cheats)

У GP-Next есть вкладка **Trainer**. Перед использованием включите "Cheat" в настройках игры.

- **Сцена боя**: изменение Sun, скорости, No Cooldown / Instant Win / Invincibility и т.д.
- **Карта мира**: свободное изменение Coins и Gems.
- **Sandbox Mode**: синхронизирован с переключателями Trainer; часть функций может быть ограничена для стабильности.
