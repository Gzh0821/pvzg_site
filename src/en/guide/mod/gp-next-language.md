---
title: Language Packs
icon: language
pageInfo: false
index: true
order: 5
---

# Language Packs and `lang.json`

If you want one mod to support Chinese, English, Spanish, Russian, or other languages at the same time, you can use a language pack.

## Folder

```text
MyFirstMod/
├── pack.json
└── jsons/
    └── lang/
        └── lang.json
```

You can also use `lang.json5`.

## Minimal Example

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

This is an optional field used to register extra languages in the game.

Each item usually contains:

- `code`: language code, such as `es`, `ru`, or `ja`
- `name`: the name shown in the settings page
- `isCJK`: whether the language should follow CJK width rules

## Text Entries

Inside a single text entry, just place multiple language fields side by side, such as:

- `en`
- `zh`
- `es`
- `ru`

## How To Apply It

1. Put the language pack into `gp-next/packs/`
2. Open **Patcher** in game
3. Click **Save & Reload**
4. Switch language in the game settings
5. Return to the target screen and verify the text

## Relationship With Other Patches

Like other patch files, `lang.json` also supports deep merge.

That means:

- you do not need to copy the entire language table
- you only need to provide the text nodes you want to override

## Other Places You Can Translate

Some patch JSON files already contain multilingual structures, for example:

- `PlantAlmanac`
- certain store display names
- some name fields in Features files

In those cases, you can add more language fields directly inside those files as well.

## Things To Watch When Writing a Language Pack

- use standard language codes whenever possible
- first make sure the default `en` / `zh` values are correct
- when adding a new language, start by testing a small amount of text

## Next

- [Data and Trainer](./gp-next-tools.md)
- [Settings & Extensions](./gp-next-settings.md)
