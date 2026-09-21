---
title: Consola
icon: toolbox
pageInfo: false
index: true
order: 8
---

# Consola

Después de cargar el juego, abre F12 → Console.

```js
await gpNext.mods.enableJsModding()
```

Aplica o reinicia cuando se indique. Para desactivar: `await gpNext.mods.disableJsModding()`.

`gpNext.help()` muestra comandos; `gpNext.version` muestra la versión; `gpNext.mods.status()` muestra los mods JS. `gpNext.exportJson('PlantFeatures', true)` exporta los datos originales.

`gpNext.setGameSpeed()` ya no está disponible. Usa Herramientas para 1× / 1.5×. [API para autores en inglés](/en/guide/mod/gp-next-api.md).
