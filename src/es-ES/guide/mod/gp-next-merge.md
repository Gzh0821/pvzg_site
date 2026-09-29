---
title: Fusion
icon: code-merge
pageInfo: false
index: true
order: 3
---

`merge` cambia los campos indicados y sirve para ajustar valores o textos. `replace` sustituye el archivo completo del tipo; úsalo para rediseñarlo y mantener todos sus datos.

## Configuración

Crea `jsons/config/patching.json` o `.json5`:

```json
{
  "defaultMode": "merge",
  "features": {
    "StoreCommodityFeatures": { "mode": "replace" }
  }
}
```

Solo se sustituye `StoreCommodityFeatures`; los demás Features y Objects usan `merge`. Si omites `defaultMode`, se usa `merge`. Escribe los nombres de tipos bajo `features` u `objects`.

Esta configuración no controla niveles, idiomas ni mapas. Los niveles usan archivos completos, los idiomas se fusionan en profundidad y los mapas tienen [formato propio](./gp-next-worldmap.md).

## Identificación de entradas

| Datos | Clave |
| --- | --- |
| La mayoría de Features | `CODENAME` |
| `MintObtainRoute` | `Family` |
| `StoreCommodityFeatures.Plants` / `Upgrade` | `CommodityName` |
| Objects | `aliases[0]` |

Se fusionan los campos indicados de cada entrada. Los arrays internos se sustituyen completos, no se amplían. También debes proporcionar completos `SEEDCHOOSERDEFAULTORDER` y las secciones `Gem`, `Coin` y `Zen` de la tienda. No los confundas con las entradas superiores de Features identificadas por clave.

Compara los datos originales y actuales en Datos. Si varios mods cambian un campo, revisa el [orden de carga](./gp-next-files.md).
