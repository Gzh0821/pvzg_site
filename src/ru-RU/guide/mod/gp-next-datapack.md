---
title: Файлы и pack.json
icon: toolbox
pageInfo: false
index: true
order: 4
---

JSON-моду нужен `pack.json` в корне и патчи в `jsons/features/`, `jsons/objects/`, `jsons/levels/` или `jsons/lang/`.

```json
{ "uuid": "yourname.balance", "name": "Мой мод", "version": "1.0.0", "packFormatVersion": 1 }
```

`uuid` обязателен и сохраняется при обновлениях. `name` и `version` рекомендуется указывать; версия по умолчанию — 1.0.0. Поддерживается только `packFormatVersion: 1`, это также значение по умолчанию.

Для JS обязательны `apiVersion: 2` и один файл `.js` или `.mjs` с `setup(ctx)`. Путь задаётся через `js.entry`; `scripts/main.js` распознаётся автоматически. `depends` и `optionalDepends` — списки uuid зависимостей.

Ограничения версии задаются через `minGpNextVersion` и `maxGpNextVersion` без операторов вроде >=. Для текущих API укажите минимальную версию `1.5.1`. Старые поля `gpNextVersion` и `gameVersion` не заменяют эти ограничения.

Упакуйте файлы в ZIP и импортируйте его. Поддерживается JSON5. [Руководство по JS на английском](/en/guide/mod/gp-next-js.md).

[Рецепты слияния растений](./gp-next-fusion.md) · [Официальные примеры модов](./gp-next-examples.md)
