---
title: Datos originales
icon: file-export
pageInfo: false
index: true
order: 5
---

## Descargar datos originales

El [archivo JSON del juego 0.15.0](/resources/game-json-0.15.0.zip) incluye Features, Objects, niveles e idiomas. Consulta fuentes y sumas de verificación en `MANIFEST.json`. Es material de referencia, no un mod instalable.

## Exportar desde el juego

En Datos de GP-Next, selecciona un tipo y exporta los datos originales o actuales. Los originales sirven de referencia; los actuales incluyen cambios de mods y permiten detectar conflictos.

También puedes usar la [consola](./gp-next-console.md). Estos comandos exportan propiedades originales, propiedades actuales y la tabla original de idiomas:

```js
await gpNext.exportJson('PlantProps', true)
await gpNext.exportJson('PlantProps')
await gpNext.exportLang(true)
```

En `exportJson(type, useOriginal, autoDownload)`, los dos últimos parámetros son `false` y `true` por defecto. Desactiva `autoDownload` para recibir datos sin abrir el diálogo de guardado.

| Contenido | Tipo |
| --- | --- |
| Nombres, orden, recursos de cartas | `Features` |
| Salud, daño, coste, recarga | `Props` |
| Textos del almanaque | `Almanac` |
| Tienda | `StoreCommodityFeatures` |
| Interfaz general | Tabla de idiomas |

Continúa con la [estructura del paquete](./gp-next-datapack.md) y las [reglas de fusión de datos](./gp-next-merge.md).
