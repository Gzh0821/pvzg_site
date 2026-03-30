---
title: Datos originales
icon: file-export
pageInfo: false
index: true
order: 5
---

# Datos del juego

Antes de escribir un parche, el paso mas util no suele ser adivinar nombres de campos, sino exportar primero el JSON original actual y revisarlo.

Eso te ayuda a confirmar:

- si el tipo se llama `Features` o `Props`
- que campos contiene realmente un objeto
- cuales son sus valores por defecto
- si el texto se guarda en la tabla principal de idioma o dentro de campos multilingues del propio objeto

## Que puedes exportar

Algunos tipos de referencia comunes son:

- `PlantFeatures`
- `PlantProps`
- `PlantAlmanac`
- `ZombieFeatures`
- `ZombieProps`
- `StoreCommodityFeatures`
- `LevelModules`
- la tabla `lang` del juego

Si no estas seguro del nombre de un tipo, revisa los nombres de categoria en la pagina **Data** o ejecuta:

```js
gpNext.status()
```

## Metodo 1: exportar desde la pagina Data

Es el metodo mas directo.

1. Entra al juego y abre el panel de GP-Next
2. Cambia a la pagina **Data**
3. Busca el tipo que quieras inspeccionar, por ejemplo `PlantProps`
4. Exporta los datos actuales o los originales

Resulta util cuando:

- quieres revisar la estructura completa de un tipo
- quieres comparar datos originales con datos actuales en ejecucion
- no quieres escribir comandos en la consola

## Metodo 2: exportar `Features` / `Props` con la API de consola

Si prefieres un flujo con scripts, llama esto en la consola de desarrollador:

```js
await gpNext.exportJson('PlantProps')
```

Esto exporta `PlantProps` actual en ejecucion.

Si quieres los datos originales, pasa `true` como segundo parametro:

```js
await gpNext.exportJson('PlantProps', true)
```

### Parametros

- primer parametro `type`: nombre del tipo, como `PlantFeatures` o `PlantProps`
- segundo parametro `useOriginal`: `true` para datos originales, `false` para datos actuales en ejecucion
- tercer parametro `autoDownload`: `true` para abrir un dialogo de guardado, `false` para imprimir en consola

### Ejemplos

Exportar las features originales de plantas:

```js
await gpNext.exportJson('PlantFeatures', true)
```

Exportar las stats actuales de zombis e imprimirlas en consola:

```js
await gpNext.exportJson('ZombieProps', false, false)
```

## Metodo 3: exportar la tabla de idioma

La tabla compartida de idioma del juego tambien puede exportarse directamente.

```js
await gpNext.exportLang()
```

Si quieres la tabla de idioma original:

```js
await gpNext.exportLang(true)
```

Esto resulta util para:

- encontrar la clave original de un texto existente
- confirmar si un paquete de idioma se aplico correctamente
- usar la tabla actual como referencia para un idioma nuevo

## Como decidir que exportar

Puedes empezar por el tipo de cambio que quieres hacer:

- cambiar nombres, orden o nombres de recursos de cartas: mira `Features`
- cambiar vida, dano, enfriamiento o coste de sol: mira `Props`
- cambiar descripciones, etiquetas o textos del almanaque: mira `Almanac`
- cambiar elementos de tienda: mira `StoreCommodityFeatures`
- cambiar textos globales de interfaz: mira la tabla de idioma

Si aun no estas seguro, la opcion mas segura es exportar los dos tipos relacionados y compararlos.

## Que hacer despues

Despues de exportar el JSON, el flujo habitual es:

1. buscar el objeto y el campo objetivo dentro del archivo exportado
2. comparar ese campo con [Tipos y campos](./format.md)
3. luego escribir tu `pack.json` y tus archivos de parche

Si ya estas listo para construir el pack, sigue con:

- [Datapacks y `pack.json`](./gp-next-datapack.md)
- [Reglas de fusion](./gp-next-merge.md)
- [API de consola](./gp-next-console.md)
