---
title: Слияние
icon: code-merge
pageInfo: false
index: true
order: 3
---

`merge` изменяет указанные поля и подходит для чисел и текста. `replace` заменяет весь файл типа; используйте его для полной переработки и поддерживайте все данные самостоятельно.

## Конфигурация

Создайте `jsons/config/patching.json` или `.json5`:

```json
{
  "defaultMode": "merge",
  "features": {
    "StoreCommodityFeatures": { "mode": "replace" }
  }
}
```

Здесь заменяется только `StoreCommodityFeatures`; остальные Features и Objects используют `merge`. Без `defaultMode` применяется `merge`. Имена типов указываются в `features` или `objects`.

Эта настройка не управляет уровнями, языками и картами. Уровни задаются полными файлами, языковые патчи объединяются рекурсивно, карты используют [отдельный формат](./gp-next-worldmap.md).

## Сопоставление записей

| Данные | Ключ |
| --- | --- |
| Большинство Features | `CODENAME` |
| `MintObtainRoute` | `Family` |
| `StoreCommodityFeatures.Plants` / `Upgrade` | `CommodityName` |
| Objects | `aliases[0]` |

В найденной записи объединяются только указанные поля. Вложенные массивы заменяются целиком, а не дополняются. Полные новые массивы нужны и для `SEEDCHOOSERDEFAULTORDER`, а также `Gem`, `Coin`, `Zen` магазина. Это не то же самое, что записи верхнего уровня Features, сопоставляемые по ключу.

Сравните исходные и текущие значения в Данных. Если поле меняют несколько модов, проверьте [порядок загрузки](./gp-next-files.md).
