---
title: Файлы и pack.json
icon: toolbox
pageInfo: false
index: true
order: 4
---

# Файлы и pack.json

JSON-моду нужен `pack.json` в корне и патчи в `jsons/features/`, `jsons/objects/`, `jsons/levels/` или `jsons/lang/`.

```json
{ "uuid": "yourname.balance", "name": "Мой мод", "version": "1.0.0", "packFormatVersion": 1 }
```

`uuid` обязателен и сохраняется при обновлениях. `name` и `version` рекомендуется указывать; версия по умолчанию — 1.0.0. Поддерживается только `packFormatVersion: 1`, это также значение по умолчанию.

Для JS обязательны `apiVersion: 2` и один файл `.js` или `.mjs` с `setup(ctx)`. Путь задаётся через `js.entry`; `scripts/main.js` распознаётся автоматически. `depends` и `optionalDepends` — списки uuid зависимостей.

Ограничения версии задаются через `minGpNextVersion` и `maxGpNextVersion` без операторов вроде >=. Для предварительной версии укажите `1.5.0-pre.1`; `1.5.0` требует финальный выпуск. Старые поля `gpNextVersion` и `gameVersion` не заменяют эти ограничения.

Упакуйте файлы в ZIP и импортируйте его. Поддерживается JSON5. [Руководство по JS на английском](/en/guide/mod/gp-next-js.md).
