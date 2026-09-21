---
title: Archivos y pack.json
icon: toolbox
pageInfo: false
index: true
order: 4
---

# Archivos y pack.json

Un mod JSON necesita `pack.json` en la raíz y sus parches en `jsons/features/`, `jsons/objects/`, `jsons/levels/` o `jsons/lang/`.

```json
{ "uuid": "yourname.balance", "name": "Mi mod", "version": "1.0.0", "packFormatVersion": 1 }
```

`uuid` es obligatorio y debe mantenerse al actualizar. `name` y `version` son recomendados; la versión por defecto es 1.0.0. Solo se admite `packFormatVersion: 1`, también usado por defecto.

Los mods JS requieren `apiVersion: 2` y una entrada `.js` o `.mjs` con `setup(ctx)`. Declárala con `js.entry`; `scripts/main.js` también se detecta automáticamente. Usa `depends` y `optionalDepends` como listas de uuid.

Los límites son `minGpNextVersion` y `maxGpNextVersion`, sin operadores como >=. Para esta versión preliminar usa `1.5.0-pre.1`; `1.5.0` exige la versión final. Los antiguos campos `gpNextVersion` y `gameVersion` no sustituyen estos límites.

Comprime los archivos en ZIP e impórtalos. JSON5 también está admitido. [Guía JS en inglés](/en/guide/mod/gp-next-js.md).
