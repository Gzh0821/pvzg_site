---
title: GP-Next
icon: toolbox
pageInfo: false
index: true
order: 1
---

Abre la barra lateral con **F9** o el botón de la esquina superior izquierda.

- **Mods**: importar, activar, actualizar y configurar mods.
- **Herramientas**: trucos, salud y guardados en la nube.
- **Datos**: buscar, comparar, exportar y editar datos.
- **Rendimiento**: mediciones reales de FPS e informes.
- **Diagnóstico**: errores de mods, registro, informes, reinicio.
- **Ajustes**: idioma del panel, atajo y desplazamiento.
- **Experimental**: planificador de FPS, mapas y niveles de plantas.

En Mods, importa el ZIP, confirma la instalación, activa el mod y guarda la selección. Aplica los cambios o reinicia cuando se indique. Instala también todas las dependencias. Los jugadores no necesitan herramientas de programación.

Para actualizar, importa el nuevo ZIP con el mismo uuid. Editar la carpeta original no cambia la copia instalada. Para desactivar, desmarca el mod, guarda y aplica. Si falla el inicio, recupera la configuración anterior desde la pantalla de recuperación.

JavaScript está desactivado por defecto. Actívalo en Experimental → JS Modding tras leer y confirmar un aviso de riesgo; no necesitas la consola. Al desactivarlo, reinicia cuando se indique: los mods JS y los paquetes que dependen obligatoriamente de ellos quedan suspendidos, conservando su selección. Al reactivarlo se repiten las comprobaciones. Un paquete JSON solo necesita JS si depende de un mod con scripts.

[Archivos del mod](./gp-next-datapack.md) · [API y ejemplos en inglés](/en/guide/mod/gp-next-api.md)

[Diagnóstico y recuperación](./gp-next-recovery.md) · [Mods de ejemplo oficiales](./gp-next-examples.md)

## Requisitos, actualizaciones y desinstalación

Los detalles y la vista previa muestran el estado de las dependencias y funciones necesarias. Importa y activa primero las dependencias que faltan. Si una función integrada está desactivada, abre sus ajustes desde el aviso, actívala y vuelve a intentarlo. El autor debe corregir los identificadores desconocidos; ninguna función se activa automáticamente. Una advertencia sobre la versión de GP-Next por sí sola no bloquea la carga.

Activa JS Modding antes de importar scripts. Actualizar un paquete de scripts cuyo contenido cambió exige confirmar de nuevo la confianza, aunque conserve nombre o versión. Se admiten ZIP y carpetas; extrae los RAR antes de importar la carpeta.

Selecciona Desinstalar en los detalles, confirma y aplica o reinicia. Solo pueden desinstalarse los mods importados con el nuevo gestor, no los migrados del directorio antiguo. Antes debes resolver los mods activados que dependan de él. La desinstalación retira el mod de la configuración; no borra guardados, datos propios del mod ni todas las copias almacenadas. Se siguen comprobando las dependencias del guardado.

## Obtener contenido de Gardenest

Explora paquetes de datos y mods en [Gardenest (Beta)](https://nest.pvzge.com/discover). En Descargas, selecciona una versión y comprueba la compatibilidad y las dependencias obligatorias/opcionales antes de descargar el ZIP e importarlo siguiendo los pasos anteriores. Gardenest también ofrece niveles y herramientas/plugins; los ZIP de herramientas no son mods de GP-Next.

Los clientes de escritorio compatibles con el protocolo Nest pueden usar “Importar al juego”. Los paquetes importados quedan desactivados, también al actualizarse, y no se aplican automáticamente. Se mantienen las comprobaciones de dependencias y confianza de scripts. Esta integración sigue en pruebas Beta; usa la descarga manual si el cliente no es compatible o no se abre. Consulta la [guía de Gardenest](../gardenest.md).
