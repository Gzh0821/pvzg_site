---
title: Herramientas integradas
icon: sliders
pageInfo: false
index: true
order: 6
---

# Data y Trainer

GP-Next no es solo un cargador de parches. Tambien incluye varias herramientas dentro del juego para desarrollo y depuracion.

## Data

La pagina Data te permite explorar directamente los datos actuales del juego, por ejemplo:

- `PlantProps`
- `ZombieProps`
- `PlantAlmanac`
- `StoreCommodityFeatures`

Dentro de esta pagina puedes:

- buscar entradas
- abrir el panel de detalles
- comparar valores actuales con valores originales
- exportar JSON actual u original
- editar valores manualmente
- restaurar una sola entrada o un tipo completo

## Edicion manual

Las ediciones manuales realizadas en la pagina Data no son solo cambios temporales para la sesion actual.

Se guardan en:

```text
gp-next/__gpn_edits/
```

Eso significa que:

- siguen ahi al cerrar el juego
- siguen ahi al recargar parches
- tienen la prioridad mas alta

Si solo quieres comprobar si un campo realmente funciona, la pagina Data suele ser el punto de entrada mas rapido.

## Cuando encaja bien

- probar rapidamente un valor
- comprobar si un campo tiene efecto
- corregir un error evidente en tu propio pack

## Cuando encaja peor

- mantener una estructura completa de mod a largo plazo
- compartirlo directamente como paquete final de mod

Si decides conservar un cambio de forma permanente, es mejor moverlo de nuevo a `packs/`.

## Trainer

Trainer es la pagina de modificadores dentro del juego.

No sirve solo para hacer trampas. Durante el desarrollo de mods tambien es muy util porque acelera las pruebas.

## Requisito

Primero debes activar esto en los ajustes nativos del juego:

- `Allow Cheat`

Si esta opcion esta desactivada, Trainer no estara completamente disponible.

## Usos comunes

### Escenas de combate

- cambiar sol
- recoger automaticamente los objetos
- sin enfriamiento / plantacion gratis
- plantas invencibles
- velocidad nativa 1x / 1.5x
- victoria instantanea

### Mapa del mundo

- cambiar monedas
- cambiar gemas

### Sandbox

Trainer tiene una logica de sincronizacion dedicada para el modo sandbox.

Eso significa que algunos interruptores se conectan con capacidades nativas del sandbox en lugar de forzar valores crudos en tiempo de ejecucion.

## Un flujo comun

1. Busca la entrada objetivo en la pagina Data
2. Cambia un pequeno numero de campos para verificar el efecto
3. Usa Trainer para entrar en un estado de prueba mas rapido
4. Cuando lo confirmes, mueve el cambio a un datapack adecuado

## Siguiente

- [Ajustes y extensiones](./gp-next-settings.md)
- [API de consola](./gp-next-console.md)
