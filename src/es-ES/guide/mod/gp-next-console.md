---
title: API de consola
icon: terminal
pageInfo: false
index: true
order: 8
---

# API de consola

Cuando el juego esta en ejecucion, GP-Next expone un objeto global:

```js
window.gpNext
```

Puedes llamarlo directamente desde la consola de desarrollador.

> [!tip]
> Si no estas seguro de que comandos hay disponibles, empieza con:
>
> ```js
> gpNext.help()
> ```

## Antes de usarla

- el juego ya termino de cargar
- GP-Next se inicializo correctamente
- tienes abierta la consola de desarrollador

Si quieres exportar JSON originales de `Features`, `Props` o idiomas antes de escribir un parche, empieza por [Datos originales](./gp-next-json.md).

## Panel

### `gpNext.toggle()`

Muestra u oculta el panel de GP-Next.

No tiene parametros.

### Ejemplo

```js
gpNext.toggle()
```

### `gpNext.show()`

Muestra el panel.

### `gpNext.hide()`

Oculta el panel.

### `gpNext.help()`

Imprime la ayuda de comandos en la consola.

---

## Parches y estado

### `gpNext.init()`

Vuelve a ejecutar el proceso de carga de parches.

### Valor de retorno

Normalmente devuelve el resultado actual de carga de parches.

### `gpNext.reload()`

Vuelve a leer los archivos de parche desde disco y los aplica otra vez.

Es uno de los comandos mas usados.

### Ejemplo

```js
await gpNext.reload()
```

### `gpNext.status()`

Muestra el estado actual del patcher.

### Campos principales del retorno

- `loaded`: lista de tipos cargados
- `skipped`: tipos omitidos
- `errors`: lista de errores
- `packs`: datapacks detectados actualmente
- `disabledPacks`: datapacks desactivados
- `singleFile`: informacion de parches de un solo archivo
- `editsPack`: informacion del pack de ediciones manuales
- `editsCount`: numero de ediciones manuales
- `extraLanguages`: idiomas extra registrados actualmente
- `plantRegistry`: informacion de depuracion del registro dinamico de plantas

### Ejemplo

```js
const status = gpNext.status()
console.log(status.packs)
console.log(status.errors)
```

---

## Edicion de datos

### `gpNext.setObjectsData(type, alias, key, value)`

Edita un solo campo dentro de una entrada de tipo Objects.

### Parametros

- `type`: nombre del tipo de objeto, por ejemplo `PlantProps`
- `alias`: alias principal de la entrada objetivo, por ejemplo `peashooter`
- `key`: nombre del campo a editar
- `value`: nuevo valor

### Ejemplo

```js
gpNext.setObjectsData('PlantProps', 'peashooter', 'SunCost', 50)
```

### `gpNext.setObjectsData(type, alias, patchObject)`

Fusiona un objeto dentro del `objdata` de la entrada objetivo.

### Parametros

- `type`: nombre del tipo de objeto
- `alias`: alias principal de la entrada objetivo
- `patchObject`: objeto que se fusionara en la entrada

### Ejemplo

```js
gpNext.setObjectsData('PlantProps', 'peashooter', {
  SunCost: 50,
  Cooldown: 2
})
```

> [!warning]
> Esto es una edicion en tiempo de ejecucion. Sirve para depurar y verificar rapido, pero no crea automaticamente un datapack formal.

---

## Exportar y restaurar

### `gpNext.exportJson(type, useOriginal = false, autoDownload = true)`

Exporta un tipo JSON.

### Parametros

- `type`: nombre del tipo, por ejemplo `PlantFeatures`
- `useOriginal`: `true` exporta datos originales, `false` exporta datos actuales en ejecucion
- `autoDownload`: `true` abre un cuadro de guardado, `false` imprime el resultado en consola

### Ejemplo

```js
await gpNext.exportJson('PlantProps')
await gpNext.exportJson('PlantProps', true)
await gpNext.exportJson('PlantProps', false, false)
```

### `gpNext.exportLang(useOriginal = false, autoDownload = true)`

Exporta la tabla de idioma actual `MultiLanguage.lyrics`.

### Casos utiles

- comprobar si un paquete de idioma surtio efecto
- comparar el resultado actual de idiomas extendidos
- exportar la tabla original para compararla

### Ejemplo

```js
await gpNext.exportLang()
await gpNext.exportLang(true)
```

### `gpNext.restoreOriginal(type)`

Restaura un tipo a sus datos originales.

### Ejemplo

```js
gpNext.restoreOriginal('PlantFeatures')
```

### `gpNext.restoreAll()`

Restaura todos los tipos respaldados.

### `gpNext.listOrigins()`

Lista todos los tipos que actualmente tienen copia original.

### `gpNext.hasOrigin(type)`

Comprueba si un tipo tiene copia original.

---

## Juego

### `gpNext.setFrameRate(fps)`

Ajusta la tasa de frames del juego.

### Parametros

- `fps`: numero como `30` o `60`

### Ejemplo

```js
gpNext.setFrameRate(60)
```

### `gpNext.setGameSpeed(multiplier)`

Cambia directamente la escala interna del tiempo.

### Parametros

- `multiplier`: valor de velocidad como `1` o `1.5`

### Ejemplo

```js
gpNext.setGameSpeed(1)
gpNext.setGameSpeed(1.5)
```

> [!warning]
> Este comando existe, pero usa la ruta de bajo nivel `_timeScale` y no es tan seguro como las opciones nativas `1x / 1.5x` de la pagina Trainer.
> En la mayoria de casos es mejor cambiar la velocidad desde la interfaz.

---

## Cheats

### `gpNext.cheats.setSun(value)`

Fija directamente la cantidad actual de sol.

### Ejemplo

```js
gpNext.cheats.setSun(9999)
```

### `gpNext.cheats.addSun(value = 1000)`

Anade sol.

### Ejemplo

```js
gpNext.cheats.addSun()
gpNext.cheats.addSun(500)
```

### `gpNext.cheats.winLevel()`

Activa una victoria instantanea para el nivel actual.

> [!warning]
> En algunas escenas de prueba o sandbox, es mejor tratarlo como un atajo temporal y no como parte de un flujo estable.

---

## Depuracion

### `gpNext.debug.getPlantRegistry()`

Muestra informacion de depuracion del registro dinamico de plantas.

### Util para

- anadir plantas nuevas
- clonar plantas
- resolver problemas de mapeo de identidad de plantas

### Ejemplo

```js
const info = gpNext.debug.getPlantRegistry()
console.log(info)
```

---

## Otros

### `gpNext.version`

Version actual de GP-Next.

### Ejemplo

```js
gpNext.version
```

### `gpNext.debug`

Este es un espacio de nombres de depuracion, no solo un interruptor booleano.

El metodo mas usado ahora mismo es:

```js
gpNext.debug.getPlantRegistry()
```

## Ejemplos

### Recargar parches y revisar estado

```js
await gpNext.reload()
console.log(gpNext.status())
```

### Verificar rapidamente valores de plantas

```js
gpNext.setObjectsData('PlantProps', 'peashooter', {
  SunCost: 50,
  Cooldown: 2
})
```

### Exportar datos actuales a la consola

```js
await gpNext.exportJson('PlantProps', false, false)
```

### Exportar la tabla original de idioma

```js
await gpNext.exportLang(true)
```
