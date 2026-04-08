---
title: Mapa
icon: map-location-dot
pageInfo: false
index: true
order: 6
---

# Mapa mundial y `gpn-worldmap.json5`

> [!warning]
> Esta funcion sigue estando en la pestaña **Experimental** de GP-Next.  
> Antes de usarla, activa `worldmap-json` en la pagina **Experimental** dentro del juego.

Si quieres cambiar los nodos, conexiones, ramas y el orden de los puntos de recompensa que el jugador ve realmente en el mapa mundial, no basta con editar `WorldmapFeatures`. Debes usar:

```text
jsons/worldmap/gpn-worldmap.json5
```

Esto es muy diferente de un parche de datos normal:

- `features/WorldmapFeatures.json5`: cambia los datos base del mundo, como `LEVELS`, `PLANTS`, `STARTINGLEVELS` y `EPIC_TARGET`
- `worldmap/gpn-worldmap.json5`: cambia el grafo de islas en tiempo de ejecucion que el mapa realmente dibuja

En resumen:

- si quieres cambiar que niveles, plantas o introduccion tiene un mundo, empieza por `WorldmapFeatures`
- si quieres insertar una planta despues del nivel 1, mover una caja de regalo a la linea principal o rehacer las ramas, usa `gpn-worldmap`

## Archivo minimo

El formato actual requiere un `apiVersion` en la raiz, y por ahora solo acepta la version `1`:

```json
{
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

Nombre de archivo recomendado:

- `gpn-worldmap.json5`

Si prefieres JSON puro en lugar de JSON5, tambien puedes usar:

- `gpn-worldmap.json`

## Donde va

Dentro de un datapack, la estructura suele ser:

```text
MyWorldmapPack/
├── pack.json
└── jsons/
    ├── features/
    ├── levels/
    └── worldmap/
        └── gpn-worldmap.json5
```

## Forma recomendada

La estructura recomendada actual para `replace` es:

- `mainline`: un arreglo separado para la linea principal
- `branches`: un arreglo separado para las ramas

El orden de progresion principal viene directamente del orden de `mainline`. No hace falta poner el siguiente nodo principal dentro de `children`.

Ejemplo minimo:

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

## Que hace `replace`

Cuando `map.mode` es `replace`:

- el grafo principal visible queda definido totalmente por `mainline` y `branches`
- el orden del arreglo `mainline` define la progresion
- `children` se usa sobre todo para conexiones laterales extra
- las islas principales originales del mapa vanilla se eliminan
- las islas endless siguen siendo vanilla y no se definen aqui

Por eso ahora se recomienda la estructura con `mainline` separado.  
Evita el problema antiguo en el que insertar nodos de planta o recompensa desordenaba tanto la progresion como las posiciones reutilizadas.

## Reglas de posicion

Si un nodo no define `position` explicitamente:

- los nodos de `mainline` intentan reutilizar primero las posiciones vanilla segun el **indice del arreglo principal**
- si no hay una posicion reutilizable, GP-Next usa el diseno automatico

Para nodos de rama, normalmente es mejor usar `relativePosition`.

## Tipos de nodo comunes

Valores comunes de `type`:

- `level`
- `plant`
- `giftBox`
- `upgrade`
- `epicPortal`

### `level`

Las fases normales, los bosses y las islas mini-boss siguen siendo `type: 'level'`. La diferencia principal esta en la apariencia.

Valores comunes de `appearance`:

- `normal`
- `gargantuar`
- `zomboss`

Por ejemplo:

- la isla tipo "mini boss" del nivel 8 de Egypt usa la familia `gargantuar`
- las islas Zomboss de Egypt 25 / 35 usan `zomboss`

Punto importante:

- `appearance` solo es una familia visual amplia, no una identidad de plantilla unica
- si un mundo tiene varias islas del mismo grupo general pero con diseno distinto, conviene anclar la plantilla con un id real de nivel vanilla

Ejemplos mas seguros en Egypt:

```json5
template: { levelId: 'egypt8' }
template: { levelId: 'egypt35' }
```

### `giftBox` y `epicPortal`

Estos dos tipos ya se muestran correctamente, pero a diferencia de un `level` normal, normalmente conviene declarar una plantilla explicita:

```json5
template: { type: 'giftBox' }
template: { type: 'epicPortal' }
```

Ahora GP-Next limita estos selectores a candidatos especiales reales del juego vanilla, en lugar de emparejarlos de forma laxa con islas sin relacion.

## `data` a nivel de mundo

Ademas de `map`, puedes sobrescribir algunos campos del mundo:

- `levels`
- `plants`
- `startingLevels`
- `epicTarget`
- `intro`

Los mas comunes son:

- `epicTarget`: a que mundo epico conduce finalmente un portal epico
- `intro`: la clave de introduccion del mundo

Si omites `levels / plants / startingLevels` en modo `replace`, GP-Next intentara derivarlos de la lista de nodos.

## Limitaciones conocidas actuales

### 1. No personalices todavia las islas endless

Por ahora las islas endless siguen siendo vanilla.

El problema no es solo "no se encontro la plantilla". Internamente, las islas endless siguen siendo nodos `level`, pero ademas dependen de:

- `EndlessZoneEntrance.levelsID`
- plantillas de islas grandes especificas de cada mundo

Si intentas reemplazarlas como si fueran nodos normales, es facil provocar:

- varias islas endless superpuestas
- nodos azules extra de fases normales
- entradas endless conectadas a la isla equivocada

Asi que por ahora la recomendacion es simple:

- puedes personalizar el mapa principal
- deja las islas endless en vanilla

### 2. Las recompensas de `giftBox` todavia no se pueden configurar aqui con precision

Las recompensas de las cajas de regalo del mapa mundial no usan la misma cadena que las recompensas normales al completar niveles.  
Por eso no es algo que se controle de forma fiable solo editando JSON de niveles.

Por ahora no inventes campos como:

```json
{
  "giftReward": "..."
}
```

GP-Next todavia no expone control determinista de recompensas de `giftBox` mediante `gpn-worldmap.json5`.

## Cuando usar `WorldmapFeatures` y cuando usar `gpn-worldmap`

Regla practica:

- si quieres cambiar que niveles, plantas o destino epico tiene un mundo, usa `WorldmapFeatures`
- si quieres cambiar el orden de nodos, la estructura principal/ramas, o donde aparecen cajas y portales, usa `gpn-worldmap`

Muchos mods de mapa mundial acabaran usando ambos:

- un parche para `WorldmapFeatures`
- un parche para `gpn-worldmap`

## Lista recomendada de depuracion

Si el mapa no aparece como esperas, revisa primero:

1. confirma que `worldmap-json` esta activado en la pestaña **Experimental**
2. confirma que el nombre del archivo es `gpn-worldmap.json5` o `gpn-worldmap.json`
3. confirma que existe `apiVersion: 1` en la raiz
4. confirma que la clave bajo `worlds` es el `CODENAME` correcto del mundo
5. si una isla especial se ve mal, prueba un anclaje `template` mas preciso

## Siguiente paso

- Si quieres repasar primero la carpeta del datapack: lee [Datapacks y `pack.json`](./gp-next-datapack.md)
- Si quieres las reglas normales de parcheo JSON: lee [Reglas de fusion](./gp-next-merge.md)
- Si quieres inspeccionar los datos originales antes de escribir parches: lee [Datos originales](./gp-next-json.md)
