---
title: Diagnóstico y recuperación
icon: toolbox
pageInfo: false
index: true
order: 8
---

## Diagnóstico

Diagnóstico reúne errores de mods, hooks compartidos, reinicio, modo seguro, registros y exportación de informes. Filtra el registro por nivel o palabra clave.

Los informes ocultan detalles sensibles por defecto. Desactivar el filtro conserva mensajes completos que pueden incluir rutas o fragmentos de ajustes y guardados escritos por mods. Revisa antes de compartir. No se recopilan activamente los guardados completos.

## Modo seguro

Inicia sin mods con una copia temporal del guardado actual. El progreso de la sesión no se guarda. Reinicia normalmente para salir o vuelve a la página de recuperación.

## Fallo de inicio

La recuperación se abre automáticamente y copia los guardados y la configuración antes de permitir reparaciones. Sigue la acción recomendada; consulta el error original en sus detalles.

| Acción | Efecto |
| --- | --- |
| Iniciar en modo seguro | Copia temporal, sin mods ni progreso persistente |
| Restaurar configuración anterior | Recupera la última configuración de mods aplicada correctamente y conserva el guardado actual |
| Restablecer ajustes de GP-Next | Restablece preferencias y opciones experimentales; conserva guardados, archivos y selección de mods |
| Restaurar configuración y guardado | Solo con una copia válida correspondiente; retrocede el progreso de todos los jugadores y copia aparte el estado actual |
| Exportar guardado | Exporta los datos originales actuales, aunque estén dañados |
| Exportar diagnóstico | Exporta errores y datos de inicio, con filtro opcional |

Si falla la copia, no se permite restablecer ni restaurar. Reinstala los mods que necesite el guardado; no se eliminan automáticamente plantas o zombis desconocidos. La restauración no incluye archivos propios de los mods.

Las instantáneas están en `gp-next/save-backups/startup-recovery/` dentro de los datos de la aplicación. Reflejan el estado al entrar en recuperación, no necesariamente un estado anterior correcto. Las copias nativas están en `gp-next/save-backups/native-player/`. No reemplaces guardados manualmente mientras el juego está abierto.
