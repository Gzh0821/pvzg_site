---
title: Paquetes de idioma
icon: language
pageInfo: false
index: true
order: 5
---

Crea `jsons/lang/lang.json` o `.json5` en un paquete. Usa las claves de la tabla original y los campos de idioma que quieras sustituir.

```json
{
  "_languages": [{ "code": "es", "name": "Español", "isCJK": false }],
  "LoadingTips": [{
    "en": "Sun is your core resource.",
    "zh": "阳光是你的核心资源。",
    "es": "El sol es tu recurso principal."
  }]
}
```

`_languages` registra idiomas adicionales: `code` es el código, `name` el nombre mostrado en ajustes del juego e `isCJK` controla el ancho del texto. Omítelo si solo cambias idiomas existentes.

Los objetos se fusionan en profundidad; los arrays se sustituyen. El ejemplo sustituye `LoadingTips`, así que incluye los demás textos que quieras conservar. Los nombres y textos del almanaque también pueden cambiarse en sus parches Features o Almanac.

[Instala y aplica](./gp-next.md) el paquete y cambia el idioma en los ajustes del juego. El idioma del panel GP-Next es independiente. Exporta claves y textos desde los [datos del juego](./gp-next-json.md).
