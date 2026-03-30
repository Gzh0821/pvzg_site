---
title: Paquetes de idioma
icon: language
pageInfo: false
index: true
order: 5
---

# Paquetes de idioma y `lang.json`

Si quieres que un mod soporte chino, ingles, espanol, ruso u otros idiomas al mismo tiempo, puedes usar un paquete de idioma.

## Carpeta

```text
MyFirstMod/
├── pack.json
└── jsons/
    └── lang/
        └── lang.json
```

Tambien puedes usar `lang.json5`.

## Ejemplo minimo

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

## `_languages`

Es un campo opcional que sirve para registrar idiomas extra dentro del juego.

Cada entrada suele incluir:

- `code`: codigo de idioma, como `es`, `ru` o `ja`
- `name`: nombre mostrado en la pagina de ajustes
- `isCJK`: si el idioma debe seguir reglas de ancho CJK

## Entradas de texto

Dentro de una misma entrada de texto, solo tienes que colocar varios campos de idioma uno al lado del otro, por ejemplo:

- `en`
- `zh`
- `es`
- `ru`

## Como aplicarlo

1. Coloca el paquete de idioma en `gp-next/packs/`
2. Abre **Patcher** dentro del juego
3. Pulsa **Save & Reload**
4. Cambia el idioma en los ajustes del juego
5. Vuelve a la pantalla correspondiente y comprueba el texto

## Relacion con otros parches

Igual que otros archivos de parche, `lang.json` tambien admite fusion profunda.

Eso significa que:

- no necesitas copiar toda la tabla de idiomas
- solo necesitas proporcionar los nodos de texto que quieres sobrescribir

## Otros lugares que puedes traducir

Algunos JSON de parche ya contienen estructuras multilingues, por ejemplo:

- `PlantAlmanac`
- algunos nombres visibles de la tienda
- algunos campos de nombre en archivos Features

En esos casos, tambien puedes anadir mas campos de idioma directamente dentro de esos archivos.

## Cosas a cuidar al escribir un paquete de idioma

- usa codigos de idioma estandar siempre que puedas
- comprueba primero que los valores por defecto `en` / `zh` sean correctos
- cuando anadas un idioma nuevo, empieza probando una pequena cantidad de texto

## Siguiente

- [Data y Trainer](./gp-next-tools.md)
- [Ajustes y extensiones](./gp-next-settings.md)
