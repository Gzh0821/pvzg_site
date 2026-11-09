---
title: Руководство по GP-Next и модам
icon: toolbox
pageInfo: false
index: true
order: 0
---

## Использование модов

- [Установка и обновление](./gp-next.md)
- [Инструменты и данные](./gp-next-tools.md)
- [Настройки](./gp-next-settings.md)
- [Диагностика и восстановление](./gp-next-recovery.md)
- [Файлы и копии](./gp-next-files.md)

## Создание модов

- [Пакеты и манифесты](./gp-next-datapack.md)
- [Официальные примеры](./gp-next-examples.md)
- [Объединение данных](./gp-next-merge.md)
- [Языки](./gp-next-language.md)
- [Рецепты слияния](./gp-next-fusion.md)
- [Карты](./gp-next-worldmap.md)
- [Уровни растений](./gp-next-plant-level.md)
- [Начало работы с JS (английский)](/en/guide/mod/gp-next-js.md)
- [Регистрация ресурсов (английский)](/en/guide/mod/gp-next-resources.md)

## API и поля

При обновлении мода проверьте [миграцию перехватчиков свойств (английский)](/en/guide/mod/gp-next-api.md#property-hooks-and-migration). Начиная с GP-Next 1.5.6 геттеры используют `callNext()` вместо поля `value`; возвращаемое сеттером значение не выполняет запись. `apiVersion: 2` не восстанавливает прежнее поведение.

- [Руководство API (английский)](/en/guide/mod/gp-next-api.md)
- [Типы API (английский)](/en/guide/mod/gp-next-api-reference.md)
- [Исходные данные](./gp-next-json.md)
- [Поля](./format.md)
- [Консоль](./gp-next-console.md)
