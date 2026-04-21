---
title: Niveles de plantas
icon: seedling
pageInfo: false
index: true
order: 7.5
---

# Niveles de plantas

GP-Next ya incluye un sistema experimental de niveles de plantas.

La idea principal no es modificar directamente la planta vanilla, sino:

- elegir una **planta base**
- preparar un **clon** para cada nivel
- enlazar `planta base ↔ clones por nivel` con `jsons/extensions/plant-levels.json`

Esto es util porque:

- cada nivel puede tener su propio `PlantProps / PlantAlmanac / PlantTypes`
- insignias, pagina de nivel del almanaque y reemplazo runtime de cartas usan el mismo mapeo
- no hace falta modificar la salida construida del juego

## En que fase esta

La version actual sirve sobre todo para:

- registrar datos de niveles
- mostrar insignias de nivel
- ver la pagina de nivel en el almanaque
- reemplazar en runtime la entrada de la planta base por el clon del nivel seleccionado

Todavia no conviene tratarlo como una recreacion completa de la economia de mejoras del PvZ2 original.

Todavia siguen evolucionando partes como:

- origen de recursos de mejora
- bucle economico completo
- interfaz de progresion mas completa

## Que debes activar primero

Dentro del juego, abre el panel de GP-Next:

1. ve a `Experimental`
2. activa `plant-level-system`

Normalmente tambien conviene mantener activado en `Settings -> Runtime Extensions`:

- `Dynamic Plant Registry`

Esto es especialmente importante si tu linea de niveles usa plantas nuevas o clonadas.

## Estructura de archivos

Una estructura habitual es:

```text
MyPack/
├── pack.json
└── jsons/
    ├── extensions/
    │   └── plant-levels.json
    ├── features/
    │   └── PlantFeatures.json5
    └── objects/
        ├── PlantTypes.json5
        ├── PlantProps.json5
        └── PlantAlmanac.json5
```

Si solo enlazas plantas ya existentes, a veces basta con `plant-levels.json`.  
Pero si algun nivel usa una identidad clon propia, normalmente tambien necesitaras:

- `PlantFeatures`
- `PlantTypes`
- `PlantProps`
- `PlantAlmanac`

## Forma basica de `plant-levels.json`

La estructura recomendada es:

```json5
{
  "plants": {
    "peashooter": {
      "levels": {
        "1": {
          "cloneCodename": "peashooter",
          "icon": "wood"
        },
        "2": {
          "cloneCodename": "peashooter_lvl2",
          "icon": "silver",
          "displayName": "LV2"
        },
        "3": {
          "cloneCodename": "peashooter_lvl3",
          "icon": "gold",
          "displayName": "LV3"
        }
      }
    }
  }
}
```

Significado:

- `peashooter`: codename de la planta base
- `levels`: que identidad de planta usa cada nivel
- `cloneCodename`: codename real usado por ese nivel
- `icon`: estilo de insignia
- `displayName`: texto personalizado opcional del nivel

## Que puede ser `displayName`

`displayName` admite dos formas:

### 1. Cadena simple

```json5
"displayName": "LV2"
```

### 2. Objeto localizado

```json5
"displayName": {
  "en": "Level 2",
  "zh": "2级",
  "es": "Nivel 2"
}
```

Si tu propio paquete de idioma añade mas codigos de idioma, tambien puedes poner esos campos aqui.

## Valores soportados para `icon`

Los iconos de insignia disponibles actualmente son:

- `wood`
- `silver`
- `gold`
- `star`

Si no lo escribes, el valor por defecto es `wood`.

## Estrategia recomendada para clones

El patron mas seguro es:

- mantener la planta base como entrada base
- crear tus propios codenames clon para niveles altos
- hacer que cada nivel apunte a tu propia identidad clonada

Por ejemplo:

- `sunflower`
- `sunflower_lvl2`
- `sunflower_lvl3`

en lugar de apuntar directamente a otra planta vanilla.

### Por que no conviene enlazar directamente a otra planta vanilla

Por ejemplo, si tu girasol de nivel 3 se comporta como `twinsunflower`, sigue siendo mejor hacer esto:

- crear `sunflower_lvl3`
- hacer que ese clon use `PlantBasedOn: "twinsunflower"`

y no enlazar el nivel 3 directamente al `twinsunflower` vanilla.

Es mas estable porque:

- el sistema de niveles queda ligado a **tu propia identidad de planta**
- no secuestra directamente la carta vanilla
- el mapeo runtime queda mas claro

## Que JSON deben existir

Si anades un clon como `peashooter_lvl2`, asegúrate de que exista en:

- `PlantFeatures`
- `PlantTypes`
- `PlantProps`
- `PlantAlmanac`

Si no, GP-Next no lo registrara dentro del mapeo de niveles.

En la practica:

- `PlantFeatures` dice que es
- `PlantTypes` le da el tipo runtime
- `PlantProps` le da las estadisticas
- `PlantAlmanac` le da la presentacion del almanaque

## Que veras en el almanaque

Despues de activar el sistema, la pagina del almanaque de plantas recibe una subpagina extra llamada `Level`.

Ahora mismo muestra sobre todo:

- nivel maximo
- nivel actual
- maximo desbloqueado
- codename del nivel actual
- descripcion breve del nivel actual

Piensalo como una pagina compacta de resumen de niveles, no como una tienda completa de mejoras.

## Que pasa en runtime

Hay dos comportamientos runtime especialmente importantes ahora mismo:

### 1. La entrada base de la planta se resuelve al nivel seleccionado

Si la planta base es `peashooter` y el nivel seleccionado es 3, la entrada base se resuelve como:

- `peashooter_lvl3`

### 2. Las entradas clon explicitas pueden mantenerse durante el desarrollo

Puedes dejar visibles las cartas clon explicitas mientras pruebas. Esto sirve para:

- comprobar el mapeo de insignias
- comprobar el registro en el almanaque
- comprobar el comportamiento runtime de la identidad

## En que se diferencia de un sistema completo de mejoras

Ahora mismo este sistema es sobre todo:

- una capa de mapeo de identidad por niveles
- una capa de insignias y presentacion en el almanaque
- una capa de reemplazo runtime de entradas

Todavia no es una economia completa de mejoras al estilo original.

Por eso, al crear un pack, conviene centrarse primero en:

- si cada identidad de planta es estable
- si las estadisticas por nivel son realmente independientes
- si la visualizacion en el almanaque funciona
- si el nivel seleccionado se aplica bien en runtime

## Un consejo practico

No escondas todos los clones desde el principio.

Un flujo de depuracion mejor es:

1. dejar visibles la planta base y todos los clones de nivel
2. comprobar almanaque, insignias y mapeo runtime
3. ocultar entradas mas tarde solo cuando toda la cadena ya sea estable

Asi es mucho mas facil localizar problemas.

## Paginas relacionadas

- [Datapacks y `pack.json`](./gp-next-datapack.md)
- [Datos originales](./gp-next-json.md)
- [Tipos y campos](./format.md)
- [Ajustes y extensiones](./gp-next-settings.md)
