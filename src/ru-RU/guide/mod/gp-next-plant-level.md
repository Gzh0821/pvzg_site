---
title: Уровни растений
icon: seedling
pageInfo: false
index: true
order: 7.5
---

`jsons/extensions/plant-levels.json` или `.json5` связывает базовое растение с типами для разных уровней. Система даёт значки, страницу уровней в альманахе и замену карт, но не полную экономику улучшений.

Сделайте резервную копию и включите уровни растений в экспериментальном разделе. Новым клонам также нужна динамическая регистрация растений.

## Конфигурация

```json
{
  "$schema": "https://pvzge.com/jsons/schema/gpn-plant-levels.schema.json",
  "plants": {
    "peashooter": {
      "levels": {
        "1": { "cloneCodename": "peashooter", "icon": "wood" },
        "2": { "cloneCodename": "peashooter_lvl2", "icon": "silver", "displayName": "LV2" }
      }
    }
  }
}
```

Для `peashooter_lvl2` нужны полные записи `PlantFeatures`, `PlantTypes`, `PlantProps` и `PlantAlmanac`. Используйте отдельные codenames для улучшений, не присваивая уровню идентичность другого исходного растения.

| Поле | Значение |
| --- | --- |
| `cloneCodename` | Тип растения для уровня |
| `icon` | `wood`, `silver`, `gold`, `star`; по умолчанию `wood` |
| `displayName` | Текст или языковой объект, например `{ "ru": "Уровень 2", "en": "Level 2" }` |
| `hideText` | Скрывает текст, оставляя значок |

`$schema` включает подсказки и проверку в редакторе. После применения проверьте выбранный уровень в альманахе и замену растения в бою. Пока проверяете данные, оставьте карты клонов видимыми.

[Структура пакета](./gp-next-datapack.md) · [Поля](./format.md)
