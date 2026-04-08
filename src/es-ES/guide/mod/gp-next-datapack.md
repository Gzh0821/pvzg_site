---
title: Datapacks
icon: box-archive
pageInfo: false
index: true
order: 4
---

# Datapacks y `pack.json`

Si quieres que tus cambios se vean y funcionen como un mod completo, en lugar de unos pocos JSON sueltos, la forma recomendada es usar un datapack.

## Estructura minima

```text
MyFirstMod/
├── pack.json
└── jsons/
    ├── features/
    ├── lang/
    ├── objects/
    ├── levels/
    └── worldmap/
```

Aqui, `pack.json` es obligatorio.

## Plantilla de `pack.json`

```json
{
  "uuid": "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
  "name": "Mi mod personalizado",
  "version": "1.0.0",
  "priority": 100,
  "description": "Descripcion del mod",
  "author": "Tu nombre",
  "formatVersion": 1,
  "gameVersion": "0.7.1",
  "gpNextVersion": ">=1.0.0"
}
```

## Referencia de campos

### `uuid`

Es el identificador unico.

Es importante porque GP-Next lo usa para recordar:

- si el pack esta activado
- donde aparece el pack en el orden de carga

Puedes generarlo directamente desde la pagina **Guide** dentro del juego.

### `name`

El nombre que se muestra en Patcher.

### `version`

La version de tu propio mod.

### `priority`

Prioridad de carga por defecto. Los valores mas pequenos se cargan antes.

### `description`

Descripcion corta del mod.

### `author`

Nombre del autor.

### `formatVersion`

Por ahora, basta con escribir `1`.

### `gameVersion`

La version del juego para la que esta pensado el mod.

### `gpNextVersion`

La version minima de GP-Next que requiere tu mod.

## Miniatura

Puedes poner estos archivos junto a `pack.json`:

- `thumbnail.png`
- `thumbnail.ico`

Requisitos:

- imagen cuadrada
- menor de `128x128`

Entonces Patcher mostrara esa imagen como portada del pack.

## Soporte para carpetas y ZIP

`packs/` admite:

- carpetas
- archivos `.zip`

## Flujo basico

1. Crea una carpeta nueva dentro de `packs/`
2. Escribe `pack.json`
3. Crea `jsons/` y sus subcarpetas
4. Coloca dentro tus archivos JSON de parche
5. Vuelve al juego y pulsa **Save & Reload**

## Para que sirve `worldmap/`

Si quieres cambiar el grafo runtime del mapa mundial en lugar de los datos base normales de `WorldmapFeatures`, tambien usaras:

```text
jsons/worldmap/gpn-worldmap.json5
```

Esta funcion sigue clasificada como **Experimental** dentro de GP-Next, asi que primero debes activarla en esa pagina.  
Para el formato concreto, consulta [Mapa](./gp-next-worldmap.md).

## Compartir

La forma mas comun de compartir un datapack es como archivo ZIP.

El ZIP debe verse asi:

```text
MyFirstMod.zip
├── pack.json
└── jsons/
```

y no asi:

```text
MyFirstMod.zip
└── MyFirstMod/
    ├── pack.json
    └── jsons/
```

## Cosas a cuidar en `pack.json`

- cuando generes un `uuid`, no lo cambies sin necesidad
- `name` es visible para el jugador, asi que conviene que sea claro
- `description` debe explicar que cambia el pack
- actualiza `version` cuando publiques cambios importantes

## Siguiente

- [Paquetes de idioma y `lang.json`](./gp-next-language.md)
- [Data y Trainer](./gp-next-tools.md)
