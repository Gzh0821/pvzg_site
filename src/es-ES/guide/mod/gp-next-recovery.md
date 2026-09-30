---
title: Diagnóstico y recuperación
icon: toolbox
pageInfo: false
index: true
order: 8
---

## Diagnóstico

Diagnóstico reúne errores de mods, hooks compartidos, reinicio, registros y exportación de informes. Filtra el registro por nivel o palabra clave.

Los informes ocultan detalles sensibles por defecto. Desactivar el filtro conserva mensajes completos que pueden incluir rutas o fragmentos de ajustes y guardados escritos por mods. Revisa antes de compartir. No se recopilan activamente los guardados completos.

## Fallo de inicio

La recuperación se abre automáticamente y copia los guardados y la configuración antes de permitir reparaciones. Sigue la acción recomendada; consulta el error original en sus detalles.

| Acción | Efecto |
| --- | --- |
| Restaurar configuración anterior | Recupera la última configuración de mods aplicada correctamente y conserva el guardado actual |
| Restablecer ajustes de GP-Next | Restablece preferencias y opciones experimentales; conserva guardados, archivos y selección de mods |
| Restaurar configuración y guardado | Solo con una copia válida correspondiente; retrocede el progreso de todos los jugadores y copia aparte el estado actual |
| Exportar guardado | Exporta los datos originales actuales, aunque estén dañados |
| Exportar diagnóstico | Exporta errores y datos de inicio, con filtro opcional |

Si falla la copia, no se permite restablecer ni restaurar. Reinstala los mods que necesite el guardado; no se eliminan automáticamente plantas o zombis desconocidos. La restauración no incluye archivos propios de los mods.

Las instantáneas están en `gp-next/save-backups/startup-recovery/` dentro de los datos de la aplicación. Reflejan el estado al entrar en recuperación, no necesariamente un estado anterior correcto. Las copias nativas están en `gp-next/save-backups/native-player/`. No reemplaces guardados manualmente mientras el juego está abierto.

## Reintentar y desactivar mods

Los mods relacionados muestran paquetes con errores de carga o validación y cambios posiblemente relacionados, junto con la evidencia. Una coincidencia posible no confirma la causa.

- **Reiniciar normalmente** vuelve a comprobar la selección actual. Un fallo anterior por sí solo no bloquea el siguiente inicio ni revierte la selección. Se muestra el error actual; vuelve a importar los paquetes editados.
- **Desactivar JS Modding** confirma y reinicia, suspendiendo scripts y paquetes que los necesitan, conservando selección, archivos y guardados. Los scripts ya ejecutados solo se detienen tras reiniciar.
- **Desactivar todos los mods** borra la selección de mods activados y apaga JS Modding. Conserva archivos, ajustes y guardados. Reactivar JS no restaura estas selecciones manualmente desactivadas; no incluye parches sueltos ni ediciones manuales de Datos.

## Intentar inicio forzado

Solo aparece cuando se permite intentarlo. Confirma el aviso sobre estabilidad y guardados; se crea una copia y se reinicia automáticamente. La autorización sirve solo para el inicio inmediatamente siguiente: omite comprobaciones de dependencias, funciones obligatorias distintas de JS, integridad de paquetes de datos, identificadores de entidades y referencias del guardado. Cambiar paquetes o configuración invalida la autorización; el siguiente reinicio normal restaura todas las comprobaciones.

Se mantienen el interruptor JS Modding, la confianza en scripts, los permisos de archivos y los errores reales de análisis o ejecución. No todos los fallos pueden omitirse. El intento puede escribir en guardados reales y no se registra como configuración verificada. Un fallo no provoca reintentos automáticos.
