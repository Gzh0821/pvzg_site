---
title: Mapa
icon: map-location-dot
pageInfo: false
index: true
order: 6
---

> [!warning]
> Esta funcion sigue clasificada en la pestaña **Experimental** de GP-Next.  
> Antes de usarla, activa `worldmap-json` en la pagina **Experimental** dentro del juego.
> Las funciones experimentales pueden cambiar en cualquier momento, asi que haz una copia de tu partida antes de usarlas.

Si quieres personalizar el mapa mundial, puedes usar:

```text
jsons/worldmap/gpn-worldmap.json
```

## Estructura de carpetas

```text
MyPack/
├── pack.json
└── jsons/
    ├── features/
    ├── levels/
    └── worldmap/
        └── gpn-worldmap.json
```

Tambien puedes usar `gpn-worldmap.json5`.

## Ejemplo minimo

El formato actual requiere `apiVersion` en la raiz, y por ahora solo acepta la version `1`:

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

`$schema` puede ayudarte a obtener autocompletado y validacion en tu editor, por ejemplo `vscode`. Puedes usar cualquiera de estas direcciones:

```text
https://raw.githubusercontent.com/Gzh0821/pvzg_site/refs/heads/main/src/.vuepress/public/jsons/schema/gpn-worldmap.schema.json

https://pvzge.com/jsons/schema/gpn-worldmap.schema.json
```

El nombre del archivo puede ser:

- `gpn-worldmap.json`
- `gpn-worldmap.json5`

## Forma recomendada

En el modo `replace`, la estructura recomendada actual es:

- `mainline`: escribir la linea principal en un arreglo separado
- `branches`: escribir las ramas en un arreglo separado

El orden principal lo determina el orden del arreglo `mainline`, y las ramas se determinan mediante la propiedad `children` de los nodos de la linea principal.

Ejemplo:

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

## Modo `replace`

Cuando `map.mode` es `replace`:

- los nodos del mapa principal quedan totalmente definidos por `mainline` y `branches`
- el orden del arreglo `mainline` es el orden de progresion principal
- los nodos dentro de `branches` no aparecen automaticamente en la linea principal; deben conectarse de forma explicita mediante `children` de un nodo principal
- `children` se usa sobre todo para "conexiones de rama adicionales"
- los nodos originales del mapa principal se eliminan
- las islas endless siguen siendo vanilla y no se personalizan aqui

## Posicion de los nodos

Puedes usar `position` o `relativePosition` para controlar la posicion de un nodo en el mapa.  
`position` es una coordenada absoluta, y `relativePosition` es un desplazamiento relativo al nodo padre.

Si un nodo no declara una posicion de forma explicita:

- los nodos principales intentaran reutilizar primero la posicion vanilla de la linea principal segun el **indice del arreglo**
- si no hay una posicion reutilizable, se usara el auto-layout

Para los nodos de rama sigue siendo mas recomendable usar:

- `relativePosition`

Es decir, un desplazamiento relativo al nodo padre, que normalmente es mas comodo que escribir coordenadas absolutas a mano.

## Tipos de nodos

Los `type` actuales son:

- `level`
- `plant`
- `giftBox`
- `upgrade`
- `epicPortal`

### `level`

Las fases normales y las fases de boss, incluidas las fases de boss pequeno, pertenecen al tipo `level`.

Valores comunes de `appearance`:

- `normal`
- `gargantuar`
- `zomboss`

Por ejemplo:

- la apariencia del nivel 8 vanilla de Egypt puede usar `appearance: 'gargantuar'`
- la apariencia de isla Zomboss del Egypt vanilla 25 / 35 puede usar `appearance: 'zomboss'`

Ten en cuenta:

- para fases de boss y boss pequeno, usa el id del nivel vanilla para anclar la plantilla; de lo contrario puede haber problemas de apariencia o distribucion

Por ejemplo, Egypt nivel 8:

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

### Otros nodos

Estos tipos de nodo necesitan declarar la plantilla de forma explicita:

```json5
template: { type: 'plant' }
template: { type: 'upgrade' }
template: { type: 'giftBox' }
template: { type: 'epicPortal' }
```

A continuacion se muestran algunos ejemplos. Nodo de planta:

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

Nodo de mejora:

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

Nodo de recompensa:

```json5
{
  "id": "gift-main",
  "type": "giftBox",
  "template": {
    "type": "giftBox"
  }
},
```

Nodo de portal:

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

Estos nodos estan limitados por las posiciones de los nodos especiales vanilla, asi que evita insertar demasiados de este tipo.

## Datos de mundo `data`

Ademas de `map`, tambien puedes modificar los datos de mundo de cada mundo:

- `levels`
- `plants`
- `startingLevels`
- `epicTarget`
- `intro`

El mas comun es:

- `epicTarget`: a que mundo epico conduce finalmente el portal epico

Si omites `levels / plants / startingLevels` en el modo `replace`, GP-Next tambien intentara deducirlos automaticamente a partir de la lista de nodos.

## Metodo de depuracion recomendado

Si el mapa no se muestra como esperabas despues de escribirlo, revisa primero:

1. Confirma que `worldmap-json` esta activado en la pagina **Experimental**
2. Confirma que el nombre del archivo es `gpn-worldmap.json5` o `gpn-worldmap.json`
3. Confirma que en la raiz existe `apiVersion: 1`
4. Confirma que la clave bajo `worlds` es el `CODENAME` correcto del mundo
5. Si es una isla especial, intenta usar un anclaje `template` mas preciso

## Siguiente paso

- Si primero quieres ver la carpeta del datapack: lee [Datapacks y `pack.json`](./gp-next-datapack.md)
- Si quieres revisar las reglas normales de los parches JSON: lee [Reglas de fusion](./gp-next-merge.md)
- Si quieres inspeccionar primero los datos originales: lee [Datos originales](./gp-next-json.md)
