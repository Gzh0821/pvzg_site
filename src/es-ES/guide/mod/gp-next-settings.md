---
title: Ajustes
icon: toolbox
pageInfo: false
index: true
order: 7
---

En Ajustes cambia el idioma del panel, el atajo F9 y el desplazamiento. El idioma del juego se elige en los ajustes del propio juego.

Configura los FPS solo en **Experimental**: activa el planificador experimental y elige su objetivo, inicialmente 120 FPS. Al desactivarlo, el juego controla la frecuencia. Rendimiento es de solo lectura y mide los intervalos de fotogramas del motor; el resultado puede diferir del objetivo. La salud de plantas, zombis y tumbas se configura en **Herramientas**. Dos líneas de salud pueden indicar cuerpo y armadura.

Abre los detalles de cada mod para cambiar sus opciones; guarda y aplica o reinicia cuando se indique. Activa mapas y niveles de plantas según los requisitos del mod; el planificador de FPS se puede activar por separado. JavaScript está desactivado por defecto. Actívalo en Experimental → JS Modding tras leer y confirmar un aviso de riesgo; no necesitas la consola. Al desactivarlo, reinicia cuando se indique: los mods JS y los paquetes que dependen obligatoriamente de ellos quedan suspendidos, conservando su selección. Al reactivarlo se repiten las comprobaciones. Un paquete JSON solo necesita JS si depende de un mod con scripts.

## Importar y exportar preferencias

Exporta las preferencias de GP-Next como JSON en Ajustes. Revisa la vista previa antes de aplicar y reiniciar. Incluye idioma, atajo, desplazamiento y salud; no incluye guardados, selección de mods, ajustes propios de mods ni opciones experimentales.

[Diagnóstico y recuperación](./gp-next-recovery.md)

Si las pestañas no caben, usa la rueda, un gesto horizontal del panel táctil/pantalla o mantén pulsado el botón izquierdo y arrastra. Arrastrar no selecciona pestañas. Al seleccionar una, se muestra completa y se deja ver parte de las vecinas si hay espacio. También puedes usar las flechas y Home/End; no hay menú desplegable.

## Permisos de scripts

JS Modding ejecuta código de confianza, no un entorno aislado. Los mods comparten la página del juego y pueden acceder a su almacenamiento y a las capacidades nativas autorizadas para esa ventana. No ejecutes scripts desconocidos.

CSP limita los orígenes de scripts/recursos y los destinos de red. Las entradas empaquetadas, los recursos del paquete y las API de dependencias siguen disponibles; no se garantiza acceso a código remoto ni a cualquier servidor. Tauri limita por defecto la lectura/escritura a los directorios necesarios de GP-Next y parches; las rutas elegidas en diálogos se autorizan para la importación/exportación correspondiente. Esto no aísla cada mod.

Usa `ctx.files` para tu paquete y dependencias directas declaradas, y `ctx.storage` para datos. Comparte lógica con `ctx.services` en ejecución y `ctx.registry` al arrancar; no construyas imports ESM entre rutas de paquetes ni eludas permisos.
