---
title: Mods de ejemplo oficiales
icon: toolbox
pageInfo: false
index: true
order: 13
---

## Descargar e instalar

Para el juego **0.15.0** y GP-Next **1.5.1**. Instala los tres paquetes:

| Descarga | Función |
| --- | --- |
| [pvzge.entities.zip](/downloads/mods/pvzge.entities.zip) | Recursos y registro de entidades nativas |
| [example.entity-framework.zip](/downloads/mods/example.entity-framework.zip) | Comportamientos de la planta y el zombi de ejemplo |
| [example.entity-content.zip](/downloads/mods/example.entity-content.zip) | Pulse triangle y Diamond walker, con imágenes, animaciones y sonidos propios |

Importa los tres ZIP en Mods, activa JavaScript desde la [consola](./gp-next-console.md), habilita los paquetes y reinicia cuando se indique. Busca las entidades en el almanaque y el modo sandbox. El paquete de contenido no contiene JS, pero sus dependencias sí lo necesitan.

## Crear contenido propio

Descomprime el paquete de contenido y edita `feature`, `properties`, los textos del almanaque y las referencias de recursos en `content/entities.json`. Al sustituir PNG, esqueletos y atlas DragonBones 5.5 o WAV, conserva las rutas declaradas.

Para una obra independiente cambia el uuid de `pack.json`. Al actualizar la misma obra, conserva uuid e IDs de entidades y aumenta la versión. Las propiedades y recetas no necesitan JS adicional; cambia `scripts/main.js` del paquete de comportamiento solo para nuevos comportamientos. Comprime con `pack.json` en la raíz, importa de nuevo y reinicia.

El formato `content/entities.json` pertenece a este framework, no es obligatorio para todos los mods. Haz una copia antes de desactivar o eliminar contenido: los guardados que lo usan necesitan su paquete.

[Recetas de fusión](./gp-next-fusion.md) · [Recursos y registro de inicio (inglés)](/en/guide/mod/gp-next-resources.md)

