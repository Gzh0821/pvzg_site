---
title: Fusion
icon: code-merge
pageInfo: false
index: true
order: 3
---

# `merge / replace`

GP-Next ahora tiene dos modos a nivel de archivo para los parches JSON normales:

- `merge`
- `replace`

Si solo quieres recordar una frase:

- `merge`: escribe solo las partes que quieres cambiar
- `replace`: pasas a controlar todo el JSON de ese tipo

Esta pagina esta dedicada a explicar la diferencia entre esos dos modos, como configurarlos y cuando conviene usar cada uno.

## Comportamiento por defecto

Por defecto, GP-Next trata los parches JSON normales asi:

- `features` / `objects`: `merge`
- `levels`: en la practica, reemplazo de archivo completo
- `lang`: sigue fusionandose en profundidad en `MultiLanguage.lyrics`
- `worldmap`: usa el sistema runtime propio de GP-Next, no las reglas de esta pagina

Por eso esta pagina se centra sobre todo en:

- `jsons/features/*.json`
- `jsons/objects/*.json`

## Que significa `merge`

`merge` es el enfoque original y por defecto de GP-Next.

Su objetivo es:

- conservar la mayor parte posible del JSON original del juego
- sobrescribir solo los campos que escribes de forma explicita
- mantener los parches pequenos y mas compatibles con futuras actualizaciones

Por ejemplo, si solo quieres cambiar las estadisticas de una planta, `merge` suele ser la mejor primera opcion.

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

Este parche no reemplaza todo `PlantProps`. Solo cambia esos dos campos de `peashooter`.

## Que significa `replace`

`replace` significa:

- GP-Next deja de usar las reglas normales de fusion para ese tipo
- tu archivo de parche reemplaza directamente todo el JSON original de ese tipo

Es util cuando:

- quieres rehacer por completo el contenido de la tienda
- quieres eliminar con claridad una gran cantidad de datos vanilla
- no quieres que siga quedando nada del contenido original de ese tipo

Asi que `replace` no es solo "una sobrescritura mas fuerte". Significa "este tipo completo ahora lo controla mi archivo".

## Como configurarlo

Pon el archivo de configuracion aqui:

```text
jsons/config/patching.json
```

Ejemplo minimo:

```json
{
  "defaultMode": "merge",
  "features": {
    "StoreCommodityFeatures": { "mode": "replace" }
  },
  "objects": {
    "PlantProps": { "mode": "replace" }
  }
}
```

Esto significa:

- los tipos no listados siguen usando `merge`
- `StoreCommodityFeatures` usa `replace` completo
- `PlantProps` usa `replace` completo

## Alcance actual

Ahora mismo esta configuracion solo afecta a:

- `features`
- `objects`

Eso significa que archivos como:

- `features/PlantFeatures.json`
- `features/StoreCommodityFeatures.json`
- `objects/PlantProps.json`
- `objects/ZombieProps.json`

pueden cambiarse entre `merge` y `replace` mediante `patching.json`.

Estas categorias no usan las reglas de esta pagina:

- `levels`
- `lang`
- `worldmap`

## Reglas de configuracion

Las reglas actuales son simples:

- escribe los nombres de tipo dentro de `features` y `objects`
- los tipos no listados usan `defaultMode`
- si omites `defaultMode`, se usa `merge`
- por ahora solo se admiten `merge` y `replace`

Por ejemplo:

```json
{
  "features": {
    "StoreCommodityFeatures": { "mode": "replace" }
  }
}
```

Esto cambia solo `StoreCommodityFeatures` a `replace`. Todo lo demas mantiene el comportamiento por defecto.

## Que hace GP-Next en `merge`

### Features

Los archivos Features no se fusionan por indice del array. Se emparejan mediante campos identificadores.

Casos comunes:

- la mayoria de archivos Features: `CODENAME`
- `MintObtainRoute`: `Family`
- `StoreCommodityFeatures.Plants / Upgrade`: `CommodityName`

### Objects

Los archivos Objects suelen localizar las entradas dentro del array `objects` por:

- `aliases[0]`

Asi que si editas una planta o un zombi, normalmente escribes su primer alias.

## Los arrays requieren cuidado extra

Incluso en `merge`, los arrays no se fusionan elemento por elemento por indice.

**En GP-Next, los arrays siguen reemplazandose completos por defecto.**

Esto suele aplicarse a cosas como:

- pools de zombis
- `PLANTS`
- `SEEDCHOOSERDEFAULTORDER`
- ciertas listas completas de la tienda

Asi que `merge` no significa "todo se anade automaticamente de forma inteligente".
Significa sobre todo que los campos de objeto se fusionan por regla, mientras que los arrays siguen tendiendo al reemplazo.

## Nota especial sobre `StoreCommodityFeatures`

`StoreCommodityFeatures` no es un unico array. Contiene varias secciones paralelas:

- `Plants`
- `Upgrade`
- `Gem`
- `Coin`
- `Zen`

En el `merge` normal:

- `Plants` / `Upgrade`: se fusionan por `CommodityName`
- `Gem` / `Coin` / `Zen`: normalmente se reemplazan como arrays completos

Si tu objetivo es "toda la tienda debe seguir mi propia version", `replace` suele ser mas claro que seguir mezclando con datos vanilla.

## Cuando elegir `merge`

`merge` suele ser mejor cuando:

- solo quieres cambiar unas pocas estadisticas de plantas o zombis
- solo quieres editar unas pocas descripciones o textos del almanaque
- solo quieres ajustar algunos precios de tienda
- quieres mejor compatibilidad con futuras actualizaciones y nuevos campos

Version corta:

**Si basta con un cambio local, elige `merge`.**

## Cuando elegir `replace`

`replace` suele ser mejor cuando:

- quieres rehacer por completo un tipo
- quieres quitar claramente una gran cantidad de contenido vanilla
- no quieres que el JSON original de ese tipo siga participando en el resultado
- estas dispuesto a mantener por tu cuenta todo ese archivo de tipo

Version corta:

**Usa `replace` cuando quieras tomar control de todo el tipo.**

## Una prueba rapida para decidir

Preguntate:

1. Estoy cambiando solo unos pocos campos?
2. Quiero que futuros campos vanilla se mantengan siempre que sea posible?
3. Quiero evitar mantener un archivo completo de tipo?

Si la mayoria de respuestas es si, usa `merge`.

Por otro lado:

1. Estoy listo para mantener yo mismo el archivo completo del tipo?
2. Quiero que el contenido vanilla antiguo deje de mezclarse?
3. Estoy rehaciendo esta categoria de forma intencionada?

Si la mayoria de respuestas es si, usa `replace`.

## Flujo de trabajo recomendado

1. Revisa primero la estructura real en la pagina **Data**
2. Empieza con el parche `merge` mas pequeno posible
3. Cambia a `replace` solo si la necesidad real es "controlar todo el tipo"
4. Recarga y vuelve a confirmar el resultado en la pagina **Data**

## Siguiente

- [Estructura y prioridad](./gp-next-files.md)
- [Datapacks y `pack.json`](./gp-next-datapack.md)
- [Paquetes de idioma y `lang.json`](./gp-next-language.md)
- [Tipos y campos](./format.md)
