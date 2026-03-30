---
title: Fusion
icon: code-merge
pageInfo: false
index: true
order: 3
---

# Reglas de fusion

Uno de los errores mas comunes al empezar es copiar todo el JSON original y cambiar solo unas pocas lineas.

En GP-Next eso no suele ser lo mejor, porque despues de una actualizacion del juego tu copia antigua puede sobrescribir campos nuevos anadidos por el juego.

## Regla principal

**Escribe solo los campos que realmente quieres cambiar.**

GP-Next fusiona en profundidad tu JSON con los datos originales del juego.
Los campos que no menciones se conservan, siempre que sea posible.

## Tipos

## Features

Por ejemplo:

- `PlantFeatures`
- `ZombieFeatures`
- `StoreCommodityFeatures`
- `WorldmapFeatures`
- `MintObtainRoute`

Estos archivos no se fusionan por indice del array. GP-Next encuentra cada entrada mediante campos identificadores.

### Campos identificadores comunes

- la mayoria de archivos Features: `CODENAME`
- `MintObtainRoute`: `Family`
- `StoreCommodityFeatures.Plants / Upgrade`: `CommodityName`

### Nota especial sobre `StoreCommodityFeatures`

No es un unico array plano. Contiene varias secciones paralelas:

- `Plants`
- `Upgrade`
- `Gem`
- `Coin`
- `Zen`

Entre ellas:

- `Plants` / `Upgrade`: se fusionan entrada por entrada
- `Gem` / `Coin` / `Zen`: normalmente se reemplazan como arrays completos

## Objects

Por ejemplo:

- `PlantProps`
- `ZombieProps`
- `PlantAlmanac`
- `ZombieAlmanac`

Estos archivos suelen localizarse asi:

- entra en el array `objects`
- encuentra la entrada cuyo `aliases[0]` coincida con el alias que escribiste

Asi que si quieres editar una planta, normalmente escribes su primer alias.

## Levels

Los archivos de nivel son la excepcion.

`levels/*.json` suele tratarse como **reemplazo completo del archivo**, no como el flujo normal de "cambiar un campo y fusionar en profundidad".

## Arrays

Este es el punto mas facil para equivocarse:

**En GP-Next, los arrays se reemplazan completos por defecto. No se fusionan elemento por elemento por indice.**

Por ejemplo, si quieres editar:

- un pool de zombis como `Basic_Zombie`
- la lista de desbloqueo de plantas `PLANTS`
- `SEEDCHOOSERDEFAULTORDER`

entonces debes escribir el **array completo nuevo**, no solo el elemento extra que quieras anadir.

## Ejemplo

Cambiar solo el coste de sol y el enfriamiento de Peashooter:

```json
{
  "objects": [
    {
      "aliases": ["peashooter"],
      "objclass": "PlantProperties",
      "objdata": {
        "SunCost": 50,
        "Cooldown": 2
      }
    }
  ]
}
```

La ventaja de este formato es:

- no sobrescribe todo `PlantProps`
- solo afecta a `peashooter`
- solo cambia `SunCost` y `Cooldown`

## Buenos casos para reemplazo completo

El reemplazo completo suele ser correcto cuando:

- estas editando un array
- estas reemplazando un nivel entero
- estas cambiando algunas listas completas de la tienda

## Buenos casos para cambios parciales

Conviene mantener el parche lo mas pequeno posible al editar:

- las estadisticas de una sola planta
- las estadisticas de un solo zombi
- un texto del almanaque
- el precio de un solo objeto de tienda

## Un flujo practico

1. Revisa la estructura real de la entrada objetivo en la pagina **Data**
2. Extrae solo el conjunto minimo de campos que necesitas
3. Escribelo como un parche separado
4. Recarga y confirma el resultado en la pagina Data

## Siguiente

- [Datapacks y `pack.json`](./gp-next-datapack.md)
- [Paquetes de idioma y `lang.json`](./gp-next-language.md)
- [Tipos y campos](./format.md)
