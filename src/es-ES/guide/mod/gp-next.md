---
title: Introduccion a GP-Next
icon: toolbox
pageInfo: false
index: true
order: 1
---

> [!tip]
> Esta pagina se aplica a las versiones oficiales a partir de `0.7.1`.

# GP-Next

GP-Next es el panel integrado de modding, depuracion y utilidades en tiempo de ejecucion de PvZ2 Gardendless. Estas funciones estan reunidas en la misma interfaz:

- **Patcher**: gestiona `packs/`, `patches/`, ediciones manuales y recarga de parches
- **Data**: explora, compara, exporta, restaura y edita datos del juego en tiempo real
- **Trainer**: ofrece modificadores en combate, mapa del mundo y sandbox
- **Cloud**: sube, descarga y compara guardados en la nube
- **Settings**: incluye idioma, tasa de frames, ajustes de scroll, Runtime Extensions, HP Overlay y mas
- **Guide / About / Log**: documentacion integrada, referencia de comandos y registros de ejecucion

Si instalaste una version oficial, GP-Next ya viene incluido. En el juego, pulsa `F10` o haz clic en el boton de la esquina superior izquierda para abrir el panel.

## Que necesitas

1. Un editor JSON, como VSCode o Notepad++
2. Conocimientos basicos de la estructura JSON

Si planeas editar plantas, zombis, tienda o textos, conviene tener abiertas estas dos paginas:

- [Datos originales](./gp-next-json.md)
- [Tipos y campos](./format.md)

## Inicio rapido

### 1. Abrir el panel

- entra al juego
- pulsa `F10`
- abre la pestaña **Patcher**

### 2. Abrir la carpeta

En la pestaña **Patcher**, haz clic en "Open Folder" para abrir la carpeta `gp-next/` dentro del directorio de datos del juego.

### 3. Crear un datapack

La forma recomendada es guardar tus cambios en `packs/nombre-de-tu-mod/pack.json` y `jsons/`, en lugar de repartir JSON sueltos.

### 4. Recargar parches

Vuelve a la pestaña **Patcher** dentro del juego y pulsa **Save & Reload**, o reinicia el juego.

### 5. Verificar el resultado

Si no estas seguro de si el parche funciono, abre la pestaña **Data**, busca la entrada correspondiente y revisa directamente los datos actuales en ejecucion.

## Que leer despues

La documentacion de GP-Next esta dividida por temas:

- primero lee [Estructura y prioridad](./gp-next-files.md)
- luego [Reglas de fusion](./gp-next-merge.md)
- despues [Datapacks y `pack.json`](./gp-next-datapack.md)

Si estas creando un paquete de traduccion, sigue con [Paquetes de idioma y `lang.json`](./gp-next-language.md).

Si te interesan mas las operaciones dentro del juego que la estructura de archivos, ve directamente a:

- [Data y Trainer](./gp-next-tools.md)
- [Ajustes y extensiones](./gp-next-settings.md)
- [API de consola](./gp-next-console.md)

## Puntos clave

- `packs/` admite tanto **carpetas** como **`.zip`**
- `patches/` se mantiene principalmente por compatibilidad con flujos antiguos de un solo archivo
- las ediciones manuales desde la pagina Data se guardan en `__gpn_edits/` y tienen la prioridad mas alta
- los arrays en GP-Next se **reemplazan completos** por defecto, no se fusionan por indice
- `reloadPatches()` suele ser suficiente para muchas extensiones en tiempo de ejecucion; no siempre hace falta reiniciar todo el juego
- el pie de pagina muestra la version de GP-Next y puede comprobar actualizaciones del sitio oficial

Si aun no sabes como es el JSON original de un tipo, lee primero [Datos originales](./gp-next-json.md). Esa pagina es la mejor para revisar la estructura antes de volver a los detalles de campos.

## Siguiente

- [Estructura y prioridad](./gp-next-files.md)
- [Reglas de fusion](./gp-next-merge.md)
- [Datapacks y `pack.json`](./gp-next-datapack.md)
