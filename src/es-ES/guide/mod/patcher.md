---
title: Tutorial de GE Patcher (formato antiguo)
icon: wrench
pageInfo: false
index: true
order: 3
---

<script setup>
    import { onMounted } from 'vue';
    onMounted(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    })
</script>

> [!warning]
> El gePatcher de este tutorial aplica solo a versiones `0.3.X`-`0.7.1`. Para version `0.7.1` o superior, usa `GP-Next`. Consulta [aqui](gp-next.md).

GE Patcher es una herramienta para modificar datos de PvZ2 Gardendless. Permite personalizar plantas, zombis, grid items (GridItem), proyectiles (Projectile), mejoras, tienda y niveles.

Se recomienda usar la version integrada de GE Patcher (incluida en la version oficial).

## Requisitos previos

1. Editor JSON (recomendado VSCode/Notepad++).
2. Version del juego >= 0.3.0.
3. Para estructuras JSON de plantas, zombis, etc., consulta [Referencia de propiedades](format.md).

<ins class="adsbygoogle"
style="display:block"
data-ad-client="ca-pub-7637695321442015"
data-ad-slot="7113006248"
data-ad-format="auto"
data-full-width-responsive="true">
</ins>

## Conceptos basicos de GE Patcher

Abre la interfaz de desarrollador con `F12` al iniciar el juego. En la pestana Console veras algo similar a:

```text
[GE Patcher] BaseDir: C:\Users\admin\AppData\Local\com.pvzge.app
```

La ruta anterior es el directorio principal de GE Patcher (ejemplo). Ejecuta este comando para ver ayuda y la ruta de parches:

```javascript
gePatcher.help()
```

GE Patcher tambien carga automaticamente el modulo de guardado en la nube (`window.cloudSaver`).

Cuando el juego termine de cargar, usa estos comandos para cargar/aplicar parches:

```javascript
// Carga recursos base, no carga archivos de parche
gePatcher.initBase()

// Despues de initBase(), usa initPatchs() para cargar archivos de parche
// Vuelve a ejecutar tras modificar JSON para aplicar cambios
gePatcher.initPatchs()

// Carga recursos base y parches; equivalente a las dos llamadas anteriores
gePatcher.init()
```

Otros ejemplos utiles:

```javascript
// Lista IDs de niveles originales
gePatcher.showLevels()

// Fija FPS personalizados (operacion peligrosa)
gePatcher.setFrameRate(30)

// Modifica una propiedad de una entidad
gePatcher.setPropsData('PlantProps', 'peashooter', 'ShootInterval', 1.2)

// Fusiona varias propiedades
gePatcher.setPropsData('PlantProps', 'peashooter', { ShootInterval: 1.2, SunCost: 75 })

// Gestion y exportacion de datos
gePatcher.listOrigins()             // Lista JSON originales guardados
gePatcher.exportJson('PlantFeatures', false) // Exporta PlantFeatures actual
gePatcher.restoreOriginal('PlantFeatures')   // Restaura PlantFeatures original
gePatcher.restoreAll()              // Restaura todo
```

## Estructura de archivos

Crea una carpeta `patches` dentro de `com.pvzge.app` con esta estructura:

```text
patches/
└── jsons/
    ├── features/
    │   ├── PlantFeatures.json
    │   ├── PlantProps.json
    │   ├── PlantAlmanac.json
    │   ├── PlantTypes.json
    │   ├── ZombieFeatures.json
    │   ├── ZombieProps.json
    │   ├── ZombieAlmanac.json
    │   ├── ZombieTypes.json
    │   ├── BoardGridMaps.json
    │   ├── ProjectileProps.json
    │   ├── ProjectileTypes.json
    │   ├── UpgradeFeatures.json
    │   ├── PropertySheets.json
    │   ├── NarrativeList.json
    │   └── StoreCommodityFeatures.json
    └── levels/
        └── [LevelName].json
```

Descripcion:

- El directorio `features` contiene archivos Features/Props/Types/Almanac para modificar metadatos y comportamiento.
- No es necesario crear archivos para contenido que no modifiques.

## Archivos Features

Los archivos Features se usan para fusionar metadatos de entidades (plantas, zombis, grid items, mejoras, etc.).

### Ejemplos de Features

**PlantFeatures.json** (ejemplo):

```json
{
  "PLANTS": [
    {
      "CODENAME": "peashooter"
    }
  ],
  "SEEDCHOOSERDEFAULTORDER": ["peashooter", "sunflower"],
  "BASEUNLOCKLIST": ["peashooter", "sunflower"]
}
```

**ZombieFeatures.json** (ejemplo):

```json
{
  "ZOMBIES": [
    {
      "CODENAME": "tutorial"
    }
  ]
}
```

**UpgradeFeatures.json** (ejemplo):

```json
{
  "UPGRADES": [
    {
      "CODENAME": "upgrade_starting_sun_lvl1"
    }
  ]
}
```

`GridItemFeatures.json` / `StoreCommodityFeatures.json` y similares usan una estructura parecida.

### Reglas de merge para Features (resumen)

- Se busca cada entidad por `CODENAME` (o identificador equivalente) y se fusiona con el objeto original.
- Campos primitivos se sobreescriben directamente.
- Objetos se fusionan recursivamente.
- Arrays se fusionan por orden de elementos (si son primitivos, se sobreescriben).
- Arrays de nivel superior como `SEEDCHOOSERDEFAULTORDER` y `BASEUNLOCKLIST` se reemplazan por completo.

Importante: GE Patcher solo modifica entidades existentes; no crea entidades nuevas. Evita cambiar identificadores clave (como `ID`, `_CARDSPRITENAME`, etc.).

## Archivos Props / Almanac / Types

Estos archivos se usan para modificar valores numericos, informacion de almanaque o tablas de tipos:

- `PlantProps.json` / `ZombieProps.json`: propiedades numericas (`PlantProperties` / `ZombieProperties`).
- `PlantAlmanac.json` / `ZombieAlmanac.json`: informacion de visualizacion del almanaque.
- `PlantTypes.json` / `ZombieTypes.json`: datos de tipos.
- `ProjectileProps.json` / `ProjectileTypes.json`: propiedades y tipos de proyectiles.
- `NarrativeList.json`: listas de dialogos.
- `PropertySheets.json`: sobrescribe/complementa hojas de propiedades.

### Ejemplo de Props (PlantProps.json)

```json
{
  "objects": [
    {
      "aliases": ["peashooter"],
      "objclass": "PlantProperties",
      "objdata": {
        "ShootInterval": 1.35,
        "ShootIntervalAdditional": 0.15,
        "PlantfoodPeaCount": 60,
        "Cooldown": 5,
        "SunCost": 100,
        "Toughness": 300
      }
    }
  ]
}
```

### Ejemplo de Almanac (PlantAlmanac.json)

```json
{
  "objects": [
    {
      "aliases": ["peashooter"],
      "objclass": "PlantAlmanacProperties",
      "objdata": {
        "Elements": [
          { "TYPE": "SUNCOST" },
          { "TYPE": "DAMAGE", "VALUE": 20 }
        ],
        "Introduction": { "en": "Peashooters are...", "zh": "豌豆射手是..." }
      }
    }
  ]
}
```

### Reglas de merge

- Igual que en Features: se encuentra la entidad por `aliases` (primer elemento), y luego se fusiona `objdata` de forma recursiva. Si solo quieres modificar algunos campos, incluye solo esos campos.

## Archivos de nivel

Los niveles personalizados van en `patches/jsons/levels/[LevelName].json`.

- El nombre del archivo debe coincidir con el ID de nivel del juego (por ejemplo, `egypt1.json`).
- Usa `gePatcher.showLevels()` para listar IDs disponibles (requiere inicializar GE Patcher antes).

## Archivos de tienda

`StoreCommodityFeatures.json` se usa para reemplazar/modificar categorias de la tienda:

```json
{
  "Plants": [],
  "Upgrade": [],
  "Gem": [],
  "Coin": []
}
```

Las categorias que no modifiques pueden omitirse.

## Depuracion y solucion de problemas

1. Revisa errores en la consola (F12).
2. Errores comunes:
   - ❌ `Failed to load...`: suele ser error de sintaxis JSON.
   - ❌ `Level file not found`: nombre de archivo o ruta no coinciden.
3. Verifica JSON con [JSONLint](https://jsonlint.com/) o validacion JSON de VSCode.
4. Referencia de estructura: usa `gePatcher.exportJson('PlantProps', true)` para exportar datos originales y comparar.

Sugerencias:

- Ejecuta `gePatcher.help()` para ver el directorio base de parches y confirmar rutas.
- Ejecuta `gePatcher.init()` solo cuando los recursos del juego hayan terminado de cargar.
- Si los cambios no se aplican, vuelve a ejecutar `gePatcher.init()` o `gePatcher.initPatchs()` y revisa la salida en consola.
