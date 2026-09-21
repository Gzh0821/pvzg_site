---
title: GP-Next
icon: toolbox
pageInfo: false
index: true
order: 1
---

# GP-Next

Abre la barra lateral con **F9** o el botón de la esquina superior izquierda.

- **Mods**: importar, activar, actualizar y configurar mods.
- **Herramientas**: trucos, salud y guardados en la nube.
- **Datos**: buscar, comparar, exportar y editar datos.
- **Rendimiento**: límite de FPS y mediciones reales.
- **Registro**: mensajes y errores.
- **Ajustes**: idioma del panel, atajo y desplazamiento.
- **Experimental**: opciones que algunos mods necesitan.

En Mods, importa el ZIP, confirma la instalación, activa el mod y guarda la selección. Aplica los cambios o reinicia cuando se indique. Instala también todas las dependencias. Los jugadores no necesitan herramientas de programación.

Para actualizar, importa el nuevo ZIP con el mismo uuid. Editar la carpeta original no cambia la copia instalada. Para desactivar, desmarca el mod, guarda y aplica. Si falla el inicio, recupera la configuración anterior desde la pantalla de recuperación.

JavaScript está desactivado por defecto. Abre F12 → Console y ejecuta `await gpNext.mods.enableJsModding()`, después aplica o reinicia. Instala código solo de fuentes de confianza. Los mods JSON no necesitan este paso.

[Archivos del mod](./gp-next-datapack.md) · [API y ejemplos en inglés](/en/guide/mod/gp-next-api.md)
