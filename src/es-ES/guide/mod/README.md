---
title: Guía de GP-Next y mods
icon: toolbox
pageInfo: false
index: true
order: 0
---

## Usar mods

- [Instalar y actualizar](./gp-next.md)
- [Herramientas y datos](./gp-next-tools.md)
- [Ajustes](./gp-next-settings.md)
- [Diagnóstico y recuperación](./gp-next-recovery.md)
- [Archivos y copias](./gp-next-files.md)

## Crear mods

- [Paquetes y manifiestos](./gp-next-datapack.md)
- [Ejemplos oficiales](./gp-next-examples.md)
- [Fusión de datos](./gp-next-merge.md)
- [Idiomas](./gp-next-language.md)
- [Recetas de fusión](./gp-next-fusion.md)
- [Mapas](./gp-next-worldmap.md)
- [Niveles de plantas](./gp-next-plant-level.md)
- [Inicio de JavaScript (inglés)](/en/guide/mod/gp-next-js.md)
- [Registro de recursos (inglés)](/en/guide/mod/gp-next-resources.md)

## API y campos

Al actualizar un mod, revisa la [migración de hooks de propiedades (inglés)](/en/guide/mod/gp-next-api.md#property-hooks-and-migration). Desde GP-Next 1.5.6 los getters usan `callNext()` en lugar del campo `value`; devolver un valor desde un setter no realiza la escritura. `apiVersion: 2` no restaura el comportamiento anterior.

- [Guía API (inglés)](/en/guide/mod/gp-next-api.md)
- [Tipos API (inglés)](/en/guide/mod/gp-next-api-reference.md)
- [Datos originales](./gp-next-json.md)
- [Campos](./format.md)
- [Consola](./gp-next-console.md)
