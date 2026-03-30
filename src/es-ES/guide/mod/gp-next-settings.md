---
title: Ajustes y extensiones
icon: gear
pageInfo: false
index: true
order: 7
---

# Ajustes y extensiones

Ademas de los interruptores normales, la pagina Settings tambien incluye algunas funciones en tiempo de ejecucion gestionadas por GP-Next.

## Ajustes basicos

Los ajustes basicos mas comunes ahora mismo incluyen:

- idioma del panel
- tasa de frames
- modo depuracion

## Ajustes de scroll

Esta es una de las funciones en tiempo de ejecucion que GP-Next empezo a manejar recientemente.

Por ahora tiene dos partes principales:

### 1. Sensibilidad de scroll continuo

Esto afecta escenas como:

- el scroll de la pagina de ajustes
- el almanaque y otras paginas desplazables parecidas
- otras escenas con wheel / scroll continuo

### 2. Intervalo minimo para selectores discretos

Esto afecta escenas como:

- selector de mundos
- lista de plantas en sandbox
- lista de zombis en sandbox
- algunas entradas de cambio con rueda dentro del sandbox

El objetivo de este ajuste no es solo "desplazar mas rapido". Su intencion es reducir saltos accidentales y desplazamientos excesivos causados por touchpads o entradas muy sensibles.

## Runtime Extensions

La mas importante en este momento es:

- `Dynamic Plant Registry`

Se usa para:

- hacerse cargo de parte de la logica de mapeo de identidad de plantas
- hacer que los datapacks con "plantas nuevas / plantas clonadas" sean mas estables en tiempo de ejecucion

### Cuando conviene mantenerla activada

Si tu datapack:

- anade plantas nuevas
- clona plantas existentes
- cambia logica relacionada con identidad o mapeo de plantas

entonces normalmente deberias mantenerla activada.

### Como entra en efecto

Estos ajustes normalmente:

- **empiezan a funcionar despues de recargar los parches**
- no siempre requieren reiniciar todo el juego

## HP Overlay

Esta es la funcion de mostrar HP durante el combate.

Actualmente puede mostrar:

- HP de plantas
- HP de zombis
- HP de objetos del mapa tipo Tomb

En unidades con una capa extra de dano, tambien muestra una segunda linea de HP ademas de la principal.

## About, Log y comprobacion de actualizaciones

### About

Se usa para ver la introduccion de GP-Next y la documentacion de comandos de consola.

### Log

Se usa para revisar los logs de ejecucion de GP-Next y comprobar:

- si los parches se cargaron
- en que parte ocurrio un fallo
- si se aplico una extension en tiempo de ejecucion

### Comprobacion de actualizacion en el pie

El pie de pagina muestra:

- la version actual de GP-Next
- si se encontro una version nueva

Si hay una actualizacion disponible, puedes saltar directamente a la pagina oficial de descarga.

## Siguiente

- [API de consola](./gp-next-console.md)
