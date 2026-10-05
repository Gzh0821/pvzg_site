---
title: Guía de Gardenest
icon: seedling
order: 2
pageInfo: false
comment: false
---

[Gardenest](https://nest.pvzge.com/) es la plataforma de la comunidad de PvZ2 Gardendless para niveles, paquetes de datos, mods y herramientas/plugins. **Actualmente está en fase Beta.**

## Explorar y descargar

Puedes explorar contenido público sin iniciar sesión. En [Explorar](https://nest.pvzge.com/discover), filtra por tipo, palabras clave y compatibilidad. El orden recomendado es el predeterminado, pero puedes cambiarlo. Cada proyecto muestra su descripción, autores, dependencias y versiones.

En Descargas → Descarga local, selecciona una versión y comprueba la compatibilidad y las dependencias obligatorias/opcionales. Las versiones externas usan los enlaces del autor. Sigue las instrucciones del autor para herramientas/plugins; no son mods de GP-Next. Publicar y superar comprobaciones básicas no significa haber pasado un análisis antivirus o una prueba dentro del juego; consulta el estado mostrado.

| Archivo | Uso manual |
| --- | --- |
| Nivel JSON/JSON5 | Cargar siguiendo la [guía de niveles](./level/) |
| ZIP de paquete de datos/mod | Importar en [GP-Next](./mod/gp-next.md), elegir si se activa y aplicar |
| ZIP de nivel o herramienta/plugin | Seguir la estructura y las instrucciones del autor |

### Jugar / Importar al juego

Los clientes de escritorio compatibles con el protocolo Nest se pueden abrir desde Descargas. Los niveles JSON/JSON5 se verifican y se juegan directamente. Los ZIP de paquetes de datos/mods requieren confirmación en el juego y quedan desactivados; no se aplican automáticamente. También quedan desactivados al actualizarse y no sustituyen inmediatamente el contenido en ejecución. Se mantienen las comprobaciones de scripts, confianza y dependencias.

Los ZIP de niveles, las herramientas/plugins y las versiones solo externas no tienen este botón. La integración sigue en pruebas Beta y requiere un cliente compatible. El sistema puede pedir permiso para abrir otra aplicación; si no funciona o la versión no es compatible, descarga manualmente.

## Cuenta y seguridad

Usa una opción disponible en la [página de acceso](https://nest.pvzge.com/login). Los nuevos usuarios crean una cuenta según el flujo mostrado; las identidades que cumplen las reglas de correo verificado también pueden vincularse a una cuenta existente. Vincula otras plataformas desde Configuración → Cuentas externas en tu cuenta existente. Cuenta y seguridad permite configurar claves de acceso, un autenticador, doble factor y códigos de recuperación. El doble factor es obligatorio para administradores.

El apodo y el nombre de usuario son independientes. Las cuentas ordinarias usan su UID público como nombre predeterminado; los desarrolladores verificados y roles superiores pueden elegir uno válido y único. El perfil muestra proyectos, nivel y datos públicos; tú decides si tus favoritos son públicos.

## Crear y publicar

1. Inicia sesión y abre el [Centro de creación](https://nest.pvzge.com/author) desde el menú de cuenta. Pulsa Nuevo proyecto arriba a la derecha.
2. Introduce nombre, tipo, visibilidad, resumen y descripción Markdown. Las dependencias son opcionales: busca un ID de proyecto o añade información breve si no hay coincidencia.
3. Sube una versión. Los niveles aceptan JSON/JSON5 o ZIP; los paquetes de datos y mods usan ZIP según las reglas de GP-Next. Las herramientas/plugins usan ZIP sin manifiesto GP ni UUID obligatorio.
4. Añade versión y compatibilidad, envía y consulta las comprobaciones. Los cambios de usuarios ordinarios requieren revisión; desarrolladores verificados y superiores que cumplan las reglas pueden omitir la revisión manual. Se mantienen las comprobaciones de archivos, cuotas y archivos comprimidos.

Gestiona equipo e invitaciones en el Centro de creación. Configuración → Gestión de cuotas muestra almacenamiento, subidas diarias y límite de proyectos. Las versiones antiguas y subidas del equipo cuentan para la cuenta correspondiente; el espacio de archivos eliminados se libera al terminar su limpieza.

## Tareas y notificaciones

El [Centro de tareas](https://nest.pvzge.com/tasks) muestra nivel, experiencia, registro diario y tareas. Los días se calculan con la hora de Hong Kong; la próxima actualización se muestra en tu zona horaria. Puedes borrar [notificaciones](https://nest.pvzge.com/notifications) leídas solo para tu cuenta, sin cambiar el estado de otros usuarios. Consulta los [anuncios](https://nest.pvzge.com/announcements) para novedades.

Durante la Beta, envía problemas por [Comentarios](../contribution/feedback.md), con pasos, ID de proyecto/versión y errores que puedas compartir. No incluyas contraseñas, códigos de recuperación ni credenciales.
