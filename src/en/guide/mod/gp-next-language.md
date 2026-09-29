---
title: Language Packs
icon: language
pageInfo: false
index: true
order: 5
---

Create `jsons/lang/lang.json` or `.json5` in a datapack. Use text node keys from the original language table and supply the language fields you want to override.

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

`_languages` registers additional languages: `code` is the language code, `name` is shown in game settings, and `isCJK` controls text-width handling. Omit it when only editing existing languages.

Objects deep-merge; arrays are replaced. The example replaces the `LoadingTips` list, so include other entries you want to keep. Localized names and Almanac fields can also be edited in their Features or Almanac patches.

[Install and apply](./gp-next.md) the pack, then change language in the game's own settings. GP-Next's panel language is separate. Export original text and keys from [game data](./gp-next-json.md).
