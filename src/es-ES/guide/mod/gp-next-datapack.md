---
title: Archivos y pack.json
icon: toolbox
pageInfo: false
index: true
order: 4
---

Un mod JSON necesita `pack.json` en la raíz y sus parches en `jsons/features/`, `jsons/objects/`, `jsons/levels/` o `jsons/lang/`.

```json
{ "uuid": "yourname.balance", "name": "Mi mod", "version": "1.0.0", "packFormatVersion": 1 }
```

`uuid` es obligatorio y debe mantenerse al actualizar. `name` y `version` son recomendados; la versión por defecto es 1.0.0. Solo se admite `packFormatVersion: 1`, también usado por defecto.

Los mods JS requieren `apiVersion: 2` y una entrada `.js` o `.mjs` con `setup(ctx)`. Declárala con `js.entry`; `scripts/main.js` también se detecta automáticamente. Usa `depends` y `optionalDepends` como listas de uuid.

## Compatibilidad de versión de GP-Next

Usa un solo campo, por ejemplo `"gpNextVersion": "^1.5.0"`. Las mismas reglas se aplican a los mods de datos y JS.

| Expresión | Versiones estables |
| --- | --- |
| `^1.5.0` | `>=1.5.0 <2.0.0` |
| `~1.5.0` | `>=1.5.0 <1.6.0` |
| `>=1.5.0 <2.0.0` | Debe cumplir ambos límites |
| `1.5.x` | Cualquier versión estable `1.5` |
| `^1.5.0 \|\| ^2.0.0` | Cualquiera de los dos rangos |
| `>=1.5.0, <2.0.0, !=1.5.2` | Excluye una versión concreta |
| `==1.5.0` | Versión exacta |
| `~=1.5.0` / `~=1.5` | `>=1.5.0 <1.6.0` / `>=1.5.0 <2.0.0` |

Se admiten rangos npm SemVer y las comas (Y), `==`, `!=` y `~=` de estilo Python, pero no todo PEP 440: no se admiten epoch, `.dev`, `.post` ni `===`. `==1.5` significa exactamente `1.5.0`; el rango npm `1.5` significa `1.5.x`. `~=1.5` y `~1.5` tienen límites superiores distintos.

- Si existe `gpNextVersion`, se ignoran los antiguos `minGpNextVersion` y `maxGpNextVersion`. Solo se consultan si falta el nuevo campo. Si se omiten los tres, no hay aviso.
- Los campos antiguos aceptan números de versión sin operadores y sus límites son inclusivos.
- Una incompatibilidad, un campo nuevo vacío, un tipo incorrecto o una expresión no válida solo generan un aviso: no bloquean la instalación ni la carga. Un campo nuevo no válido tampoco hace que se usen los límites antiguos.
- Los rangos nuevos excluyen las versiones preliminares por defecto. `^1.5.0` no coincide con `1.6.0-pre.1`; `^1.5.0-pre.1` admite `1.5.0-pre.2`, pero no admite automáticamente `1.6.0-pre.1`. Los límites antiguos conservan su comparación inclusiva.

Por ejemplo, con `"gpNextVersion": "^1.5.0"` y `"maxGpNextVersion": "1.4.9"`, la versión actual `1.5.2` coincide con el campo nuevo sin aviso por el límite antiguo. Los avisos aparecen en la vista previa de importación y en los detalles del mod. La versión de API, el formato del manifiesto, las dependencias y las funciones obligatorias siguen validándose por separado.

Comprime los archivos en ZIP e impórtalos. JSON5 también está admitido. [Guía JS en inglés](/en/guide/mod/gp-next-js.md).

[Recetas de fusión de plantas](./gp-next-fusion.md) · [Mods de ejemplo oficiales](./gp-next-examples.md)

## Funciones necesarias

Decláralas con `requiredGpNextFeatures`, por ejemplo:

```json
{ "requiredGpNextFeatures": ["experimental.jsModding", "experimental.worldMapJson"] }
```

Los ID admitidos incluyen `experimental.jsModding`, `experimental.worldMapJson`, `experimental.plantLevelSystem`, `runtime.dynamicPlantRegistry`, `runtime.shopExtensions` y `runtime.scrollSensitivity`. Una función desactivada o desconocida bloquea la instalación/carga normal. El aviso permite abrir los ajustes de una función desactivada; los ID desconocidos deben corregirlos los autores. No se activan funciones automáticamente.

`depends` y `optionalDepends` son listas de uuid, no nombres npm ni rangos de versión. `gpNextVersion` corresponde a la plataforma. Usa `js.reloadable: false` solo junto a `js.startup: true`. El uuid no puede llevar espacios al inicio/final ni empezar por `legacy:`; para JS debe tener entre 3 y 128 letras, números, puntos, guiones o guiones bajos, empezando por letra o número.
