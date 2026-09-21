---
title: Консоль
icon: toolbox
pageInfo: false
index: true
order: 8
---

# Консоль

После загрузки игры откройте F12 → Console.

```js
await gpNext.mods.enableJsModding()
```

Примените изменения или перезапустите игру по подсказке. Выключение: `await gpNext.mods.disableJsModding()`.

`gpNext.help()` показывает команды; `gpNext.version` — версию; `gpNext.mods.status()` — состояние JS-модов. `gpNext.exportJson('PlantFeatures', true)` экспортирует исходные данные.

`gpNext.setGameSpeed()` больше не доступна. Для 1× / 1.5× используйте Инструменты. [API для авторов на английском](/en/guide/mod/gp-next-api.md).
