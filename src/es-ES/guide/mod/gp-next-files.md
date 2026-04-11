---
title: Estructura
icon: folder-tree
pageInfo: false
index: true
order: 2
---

# Estructura y prioridad

Todos los archivos de mod relacionados con GP-Next se guardan en la carpeta `gp-next/` dentro del directorio de datos del juego.

Puedes abrir la pagina **Patcher** dentro del juego y pulsar "Open Folder" para ir alli directamente.

## Estructura de carpetas

```text
com.pvzge.app/
└── gp-next/
    ├── settings.json
    ├── packs/
    │   ├── MyPack/
    │   │   ├── pack.json
    │   │   └── jsons/
    │   │       ├── config/
    │   │       ├── features/
    │   │       ├── lang/
    │   │       ├── objects/
    │   │       ├── levels/
    │   │       └── worldmap/
    │   └── AnotherPack.zip
    ├── patches/
    │   └── jsons/
    │       ├── features/
    │       ├── lang/
    │       ├── objects/
    │       └── levels/
    └── __gpn_edits/
```

## Que hace cada carpeta

### `packs/`

Esta es la carpeta principal que deberias usar la mayor parte del tiempo.

- Puede contener carpetas completas de datapacks
- Tambien puede contener archivos `.zip`
- Sirve para mods completos, mantenimiento a largo plazo y contenido que quieras compartir

Si vas a hacer un reemplazo runtime del mapa mundial, tambien puedes tener:

- `jsons/worldmap/gpn-worldmap.json5`
- `jsons/config/patching.json`

Esto no es lo mismo que un parche normal `features/WorldmapFeatures.json5`. El primero cambia el grafo runtime del mapa; el segundo cambia los datos base del mundo.

`jsons/config/patching.json` es el archivo de configuracion del propio sistema de parches JSON. Ahora mismo se usa sobre todo para definir comportamiento de archivo completo `merge` / `replace` en tipos concretos de `features` y `objects`.

### `patches/`

Esta es la carpeta heredada para parches JSON sueltos.

- Existe sobre todo para flujos antiguos
- No requiere `pack.json`
- Tiene mayor prioridad que `packs/`

Si solo quieres probar rapidamente un JSON, esta carpeta resulta comoda. Si planeas mantener o compartir el mod, `packs/` es mejor.

### `__gpn_edits/`

Aqui se guardan las **ediciones manuales desde la pagina Data**.

- Los datos que cambias directamente en el juego se escriben aqui
- Tiene la prioridad mas alta
- Sirve para pruebas rapidas y ajustes finos
- No es un buen formato para publicar un mod completo

### `settings.json`

Este es el archivo de configuracion local de GP-Next.

Guarda sobre todo:

- el orden de los datapacks
- los packs desactivados
- otras opciones locales del panel

## Prioridad

El orden de sobrescritura en GP-Next se puede resumir asi:

1. `packs/`
2. `patches/`
3. `__gpn_edits/`

En otras palabras, las fuentes posteriores tienen mas prioridad.

## Reglas extra

### Dentro de `packs/`

Los datapacks dentro de `packs/` se cargan segun el orden guardado y su estado activado o desactivado. Dentro del mismo nivel, GP-Next tambien toma en cuenta el valor `priority` de `pack.json`.

Las dos reglas practicas son:

- un valor `priority` menor se carga antes
- el contenido cargado despues puede sobrescribir al contenido cargado antes

### `patches/`

`patches/` esta pensado para conservar flujos antiguos, por eso siempre sobrescribe a los datapacks normales.

### `__gpn_edits/`

Estas son las ediciones que hiciste directamente en la pagina Data, asi que el sistema las trata como la ultima capa de sobrescritura.

## Como repartir el contenido

### `packs/`

- mods que piensas mantener a largo plazo
- contenido que quieres compartir con otros jugadores
- mods completos con varios archivos, varios tipos, descripcion y miniatura

### `patches/`

- experimentos de un solo archivo
- contenido temporal al migrar desde un flujo antiguo de gePatcher

### `__gpn_edits/`

- pruebas rapidas de valores
- correcciones temporales
- comprobar si un campo hace el efecto esperado

## Siguiente

- [Reglas de fusion](./gp-next-merge.md)
- [Datapacks y `pack.json`](./gp-next-datapack.md)
- [Mapa](./gp-next-worldmap.md)
