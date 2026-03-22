---
title: Guia de uso de GP-Next
icon: toolbox
pageInfo: false
index: true
order: 1
---

<script setup>
    import { onMounted } from 'vue';
    onMounted(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    })
</script>

> [!tip]
> Esta guia aplica para la version del juego `0.7.1` o superior.

GP-Next es una herramienta de nueva generacion integrada en PvZ2 Gardendless para modificar datos del juego. Permite modificar plantas, zombis, grid items, mejoras, tienda, niveles y mas usando archivos JSON. Tambien incluye un Trainer (Cheats) y un navegador de datos para ajustes manuales en tiempo real.

La version publicada en el sitio ya incluye GP-Next (la version de nube aun no). Pulsa `F10` en el juego o haz clic en el boton de la esquina superior izquierda para abrir el panel de GP-Next.

## Requisitos previos

1. Editor JSON (recomendado VSCode / Notepad++).
2. Version del juego >= 0.7.1.
3. Conocimientos basicos de estructura JSON. Consulta [Referencia de propiedades](format.md).

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-7637695321442015"
     data-ad-slot="7113006248"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

## Estructura de directorios y prioridad

GP-Next carga parches desde la carpeta `gp-next` dentro del directorio de datos del juego. Puedes encontrarla pulsando **Open Folder** en la pestana Patcher de GP-Next.

La prioridad de carga es la siguiente (gana el ultimo paso):

1. **Directorio packs/ (Datapacks)**: Puedes colocar paquetes completos (como carpeta o `.zip`). Se aplican en orden ascendente de `priority` definido en `pack.json`.
2. **Directorio patches/ (Parches de archivo unico)**: Colocar JSON aqui funciona como el antiguo gePatcher. Tiene prioridad mas alta que packs y actua como capa de compatibilidad.
3. **Ediciones manuales (pestana Data)**: Las modificaciones en tiempo real de la pestana **Data** se guardan como `__gpn_edits` y **siempre** sobrescriben packs y patches.

```text
com.pvzge.app/
└── gp-next/
    ├── packs/
    │   ├── MyPack/         ← Datapack en carpeta
    │   │   ├── pack.json   ← Manifest obligatorio
    │   │   └── jsons/
    │   │       ├── features/
    │   │       ├── lang/
    │   │       ├── objects/
    │   │       └── levels/
    │   └── AnotherPack.zip ← Datapack en ZIP
    └── patches/            ← Parches de archivo unico
        └── jsons/
            ├── features/
            ├── lang/
            ├── objects/
            └── levels/
```

### Rol de cada directorio

- **`features/`**: Coloca `PlantFeatures.json`, `ZombieFeatures.json`, `StoreCommodityFeatures.json`, `MintObtainRoute.json`, `WorldmapFeatures.json`, etc. Maneja metadatos de entidades.
- **`lang/`**: Coloca `lang.json` o `lang.json5` para registrar idiomas adicionales y sobrescribir textos traducidos del mod.
- **`objects/`**: Coloca `PlantProps.json`, `ZombieProps.json`, `PlantAlmanac.json`, etc. Maneja valores de combate (HP, damage, cooldown) y descripciones del almanaque.
- **`levels/`**: Coloca niveles personalizados. El nombre del archivo debe coincidir exactamente con el ID del nivel (por ejemplo `egypt1.json`).

## Logica de merge JSON

GP-Next usa merge profundo. **Solo debes escribir los campos que quieres modificar**; los demas se mantienen.

- Los arrays en el parche **reemplazan completamente** el array de destino.
- Si modificas un array (por ejemplo `Basic_Zombie` o `PLANTS`), debes proporcionar el array completo nuevo.

Reglas por tipo de archivo:

- **Features** (`PlantFeatures`, `ZombieFeatures`, `StoreCommodityFeatures`, etc.): se empareja por identificador (generalmente `CODENAME`; en secciones de `StoreCommodityFeatures` puede ser `CommodityName`; `MintObtainRoute` usa `Family`).
- **Objects** (`PlantProps`, `PlantAlmanac`, etc.): se empareja por el primer elemento de `aliases`.
- **Levels** (`levels/*.json`): se **reemplazan completamente**.

**Ejemplo: cambiar solo SunCost y Cooldown de peashooter**
`PlantProps.json`:
```json
{
  "objects": [
    {
      "aliases": ["peashooter"],
      "objclass": "PlantProperties",
      "objdata": {
        "SunCost": 50,
        "Cooldown": 2
      }
    }
  ]
}
```

## Datapacks (`pack.json`)

Para crear un datapack, crea una carpeta dentro de `packs/` e incluye un `pack.json` en la raiz.

**Formato de pack.json:**
```json
{
  "uuid": "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
  "name": "My Custom Mod",
  "version": "1.0.0",
  "priority": 100,
  "description": "Optional description for your mod.",
  "author": "Your Name",
  "formatVersion": 1,
  "gameVersion": "0.7.1",
  "gpNextVersion": ">=1.0.0"
}
```

- **uuid**: identificador unico obligatorio.
- **name**: nombre mostrado del mod.
- **version**: version del mod.
- **priority**: orden de carga (numero menor = primero).
- **description**: descripcion corta del mod.
- **author**: autor.
- **formatVersion**: version de formato del datapack (actualmente 1).
- **gameVersion**: version de juego objetivo.
- **gpNextVersion**: version minima de GP-Next requerida.
- **thumbnail.png / thumbnail.ico**: imagen cuadrada de portada (< 128x128) en la raiz.

### Pasos para crear un datapack

1. Crea una carpeta en `packs/`, por ejemplo `MyFirstMod`.
2. Crea `pack.json` dentro de `MyFirstMod`.
3. Crea `jsons/features`, `jsons/objects` o `jsons/levels` segun corresponda.
4. Escribe tus JSON respetando la regla de merge profundo.
5. (Opcional) Agrega `thumbnail.png` o `thumbnail.ico`.
6. (Opcional) Comprime a `MyFirstMod.zip` y compartelo.

## Configurar varios idiomas (Language Pack)

Si quieres que un mismo mod incluya varios idiomas (por ejemplo chino, ingles, espanol y ruso), agrega `jsons/lang/lang.json` (o `lang.json5`) dentro del datapack.

### Ubicacion de archivos

```text
MyFirstMod/
├── pack.json
└── jsons/
    └── lang/
        └── lang.json
```

### Ejemplo minimo

```json
{
  "_languages": [
    { "code": "es", "name": "Español", "isCJK": false },
    { "code": "ru", "name": "Русский", "isCJK": false }
  ],
  "LoadingTips": [
    {
      "en": "Sun is your core resource.",
      "zh": "阳光是你的核心资源。",
      "es": "El sol es tu recurso principal.",
      "ru": "Солнце - ваш основной ресурс."
    }
  ]
}
```

- `_languages`: opcional. Registra idiomas adicionales en la configuracion del juego (ademas de `en` / `zh`).
- Nodos de texto: en la misma entrada, agrega campos `en`, `zh`, `es`, `ru`, etc.
- Codigo de idioma: usa codigos estandar como `es`, `ru`, `ja`.

### Pasos para aplicar

1. Coloca el datapack que contiene `jsons/lang/lang.json` dentro de `gp-next/packs/`.
2. Abre el panel GP-Next en el juego, ve a **Patcher** y pulsa **Save & Reload** (o reinicia el juego).
3. En los ajustes del juego, cambia el idioma a uno de los idiomas declarados en `_languages`.
4. Vuelve al juego y verifica la visualizacion del texto.

> [!tip]
> `lang.json` usa la misma logica de merge profundo que otros parches. Solo necesitas incluir los nodos de texto que quieras sobrescribir.

> [!note]
> Esto no se limita a `jsons/lang/lang.json`. Si otros patch JSON ya contienen nodos de texto multilingue (por ejemplo textos de entradas en `objects/PlantAlmanac.json`), tambien puedes agregar alli campos de idiomas adicionales (`es`, `ru`, `ja`, etc.) para traducir.

## Ediciones manuales y pestana Data

GP-Next incluye la pestana **Data** para explorar datos del juego en tiempo real.

Las modificaciones manuales se guardan como `__gpn_edits` y persisten entre sesiones.

> [!important]
> Las ediciones manuales estan pensadas para ajustes rapidos y depuracion. Para mods estables/compartibles, usa un Datapack estructurado en `packs/`.

Para eliminar ediciones manuales, haz clic derecho sobre el item o tipo en la pestana Data y selecciona "Restore".

## Trainer (Cheats)

GP-Next ofrece una pestana **Trainer**. Para usarla, primero habilita "Cheat" en los ajustes del juego.

- **Escena de partida**: modificar Sun, velocidad, No Cooldown / Instant Win / Invincibility, etc.
- **Mapa del mundo**: modificar libremente Coins y Gems.
- **Sandbox Mode**: sincronizado con toggles de Trainer; algunas funciones pueden bloquearse para estabilidad.
