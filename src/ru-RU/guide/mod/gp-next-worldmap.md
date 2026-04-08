---
title: Карта
icon: map-location-dot
pageInfo: false
index: true
order: 6
---

> [!warning]
> Эта возможность по-прежнему относится к вкладке **Experimental** в GP-Next.  
> Перед использованием включите `worldmap-json` на внутриигровой странице **Experimental**.
> Экспериментальные функции могут измениться в любой момент, поэтому обязательно сделайте резервную копию сохранения перед использованием.

Если вы хотите настраивать карту мира, можно использовать:

```text
jsons/worldmap/gpn-worldmap.json
```

## Структура каталогов

```text
MyPack/
├── pack.json
└── jsons/
    ├── features/
    ├── levels/
    └── worldmap/
        └── gpn-worldmap.json
```

Также можно использовать `gpn-worldmap.json5`.

## Минимальный пример

Текущий формат требует корневое поле `apiVersion`, и сейчас принимается только версия `1`:

```json
{
  "$schema": "https://raw.githubusercontent.com/Gzh0821/pvzg_site/refs/heads/main/src/.vuepress/public/jsons/schema/gpn-worldmap.schema.json",
  "apiVersion": 1,
  "worlds": {
    "egypt": {
      "map": {
        "mode": "replace",
        "mainline": []
      }
    }
  }
}
```

`$schema` поможет редактору, например `vscode`, показывать подсказки по полям и выполнять проверку. Можно использовать любой из этих адресов:

```text
https://raw.githubusercontent.com/Gzh0821/pvzg_site/refs/heads/main/src/.vuepress/public/jsons/schema/gpn-worldmap.schema.json

https://pvzge.com/jsons/schema/gpn-worldmap.schema.json
```

Имя файла может быть таким:

- `gpn-worldmap.json`
- `gpn-worldmap.json5`

## Рекомендуемый стиль

В текущем режиме `replace` рекомендуется использовать:

- `mainline`: отдельный массив для основной линии
- `branches`: отдельный массив для боковых веток

Порядок основной линии определяется порядком массива `mainline`, а ветки задаются свойством `children` у узлов основной линии.

Пример:

```json5
{
  apiVersion: 1,
  worlds: {
    egypt: {
      data: {
        epicTarget: 'epic_egypt',
      },
      map: {
        mode: 'replace',
        reuseOriginalPositions: true,
        mainline: [
          {
            id: 'lvl-1',
            type: 'level',
            appearance: 'normal',
            levels: ['egypt1'],
            title: '1',
          },
          {
            id: 'plant-a',
            type: 'plant',
            template: { type: 'plant' },
            plantReward: 'repeater',
          },
          {
            id: 'lvl-2',
            type: 'level',
            appearance: 'normal',
            levels: ['egypt2'],
            title: '2',
            children: ['branch-2-1'],
          },
        ],
        branches: [
          {
            id: 'branch-2-1',
            type: 'level',
            appearance: 'normal',
            levels: ['egypt20_1'],
            title: '2-1',
            relativePosition: { x: 220, y: 180 },
          },
        ],
      },
    },
  },
}
```

## Режим `replace`

Когда `map.mode` равно `replace`:

- узлы основной карты полностью определяются объявленными `mainline` и `branches`
- порядок массива `mainline` и есть порядок основной прогрессии
- узлы внутри `branches` не появляются на основной линии автоматически; их нужно явно подключать через `children` узлов основной линии
- `children` в основном отвечает только за "дополнительные боковые соединения"
- оригинальные vanilla-узлы основной карты удаляются
- endless-острова по-прежнему остаются vanilla и не настраиваются здесь

## Позиция узлов

Вы можете использовать `position` или `relativePosition`, чтобы управлять положением узла на карте.  
`position` — это абсолютные координаты, а `relativePosition` — смещение относительно родительского узла.

Если позиция у узла не указана явно:

- узлы основной линии сначала пытаются переиспользовать vanilla-позиции основной линии по **индексу массива**
- если подходящей позиции нет, используется автокомпоновка

Для узлов веток по-прежнему лучше писать:

- `relativePosition`

То есть смещение относительно родительского узла, что обычно удобнее, чем вручную писать абсолютные координаты.

## Типы узлов

Сейчас доступны такие значения `type`:

- `level`
- `plant`
- `giftBox`
- `upgrade`
- `epicPortal`

### `level`

Обычные уровни и boss-уровни, включая небольшие boss-уровни, относятся к типу `level`.

Частые значения `appearance`:

- `normal`
- `gargantuar`
- `zomboss`

Например:

- для внешнего вида vanilla Egypt 8 можно использовать `appearance: 'gargantuar'`
- для внешнего вида островов Зомбосса vanilla Egypt 25 / 35 можно использовать `appearance: 'zomboss'`

Важно помнить:

- для boss-уровней и небольших boss-уровней используйте vanilla id уровня для привязки шаблона, иначе могут возникнуть проблемы с внешним видом или компоновкой

Например, Egypt 8:

```json5
{
  "id": "mini-boss-main",
  "type": "level",
  "appearance": "gargantuar",
  "template": {
    "levelId": "egypt8"
  },
  "levels": [
    "egypt8"
  ],
  "title": "8"
},
```

### Другие узлы

Для таких узлов нужно явно указывать шаблон:

```json5
template: { type: 'plant' }
template: { type: 'upgrade' }
template: { type: 'giftBox' }
template: { type: 'epicPortal' }
```

Ниже несколько примеров. Узел растения:

```json5
{
  "id": "plant-a",
  "type": "plant",
  "template": {
    "type": "plant"
  },
  "plantReward": "repeater"
}
```

Узел улучшения:

```json5
{
  "id": "upgrade-main",
  "type": "upgrade",
  "template": {
    "type": "upgrade"
  },
  "upgradeReward": "upgrade_starting_sun_lvl2"
}
```

Узел награды:

```json5
{
  "id": "gift-main",
  "type": "giftBox",
  "template": {
    "type": "giftBox"
  }
},
```

Узел портала:

```json5
{
  "id": "portal-main",
  "type": "epicPortal",
  "template": {
    "type": "epicPortal"
  },
  "portalLevels": [
    "egypt_epic_1",
    "egypt_epic_2"
  ]
},
```

Такие узлы ограничены позициями vanilla-спецузлов, поэтому старайтесь не вставлять слишком много узлов этого типа.

## Данные мира `data`

Помимо `map`, можно также изменять данные уровня мира для каждого мира:

- `levels`
- `plants`
- `startingLevels`
- `epicTarget`
- `intro`

Чаще всего используется:

- `epicTarget`: в какой эпический мир в итоге ведёт эпический портал

Если в режиме `replace` вы опустите `levels / plants / startingLevels`, GP-Next тоже попытается автоматически вывести их из списка узлов.

## Рекомендуемый способ отладки

Если после написания карта отображается не так, как ожидалось, сначала проверьте:

1. Убедитесь, что `worldmap-json` включён на странице **Experimental**
2. Убедитесь, что имя файла — `gpn-worldmap.json5` или `gpn-worldmap.json`
3. Убедитесь, что в корне указано `apiVersion: 1`
4. Убедитесь, что ключ под `worlds` — это правильный `CODENAME` мира
5. Если это специальный остров, сначала попробуйте более точную привязку `template`

## Что дальше

- Если сначала хотите посмотреть структуру datapack: читайте [Datapacks и `pack.json`](./gp-next-datapack.md)
- Если хотите посмотреть обычные правила JSON-патчей: читайте [Правила слияния](./gp-next-merge.md)
- Если хотите сначала сравнить с исходными данными: читайте [Исходные данные](./gp-next-json.md)
