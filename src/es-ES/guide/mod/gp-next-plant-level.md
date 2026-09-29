---
title: Niveles de plantas
icon: seedling
pageInfo: false
index: true
order: 7.5
---

`jsons/extensions/plant-levels.json` o `.json5` relaciona una planta base con tipos de plantas por nivel. Ofrece insignias, página de niveles del almanaque y sustitución de cartas, no una economía completa de mejoras.

Haz una copia y activa los niveles de plantas en Experimental. Los clones nuevos también necesitan el registro dinámico de plantas.

## Configuración

```json
{
  "$schema": "https://pvzge.com/jsons/schema/gpn-plant-levels.schema.json",
  "plants": {
    "peashooter": {
      "levels": {
        "1": { "cloneCodename": "peashooter", "icon": "wood" },
        "2": { "cloneCodename": "peashooter_lvl2", "icon": "silver", "displayName": "LV2" }
      }
    }
  }
}
```

`peashooter_lvl2` necesita definiciones completas en `PlantFeatures`, `PlantTypes`, `PlantProps` y `PlantAlmanac`. Usa codenames propios para las mejoras, sin asignar la identidad de otra planta original.

| Campo | Significado |
| --- | --- |
| `cloneCodename` | Tipo usado para ese nivel |
| `icon` | `wood`, `silver`, `gold`, `star`; predeterminado `wood` |
| `displayName` | Texto opcional u objeto multilingüe, como `{ "es": "Nivel 2", "en": "Level 2" }` |
| `hideText` | Oculta el texto y conserva el icono |

`$schema` permite autocompletar y validar en el editor. Tras aplicar, comprueba el nivel elegido en el almanaque y la sustitución en combate. Mantén visibles las cartas de clones mientras verificas sus datos.

[Estructura del paquete](./gp-next-datapack.md) · [Campos](./format.md)
