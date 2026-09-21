---
title: Console commands
icon: toolbox
pageInfo: false
index: true
order: 8
---

# Console commands

After the game loads, press F12 and select Console. JSON-only mod installation does not need console commands.

Enable JavaScript mods:

```js
await gpNext.mods.enableJsModding()
```

Apply or restart as prompted. Disable with `await gpNext.mods.disableJsModding()`.

| Command | Purpose |
| --- | --- |
| `gpNext.help()` | List available commands |
| `gpNext.version` | GP-Next version |
| `gpNext.show()` / `hide()` / `toggle()` | Show, hide or toggle the sidebar |
| `gpNext.status()` | Patch status |
| `gpNext.mods.status()` | Script mod status |
| `await gpNext.reload()` | Check and apply configuration; follow restart instructions |
| `gpNext.exportJson('PlantFeatures', true)` | Export original plant features |
| `await gpNext.exportLevel('level-id')` | Export a level |
| `gpNext.exportLang(true)` | Export original language data |
| `gpNext.setFrameRate(30)` | Set target FPS |

The old `gpNext.setGameSpeed()` command is unavailable. Use Tools for 1× / 1.5×. Mod authors should use the `ctx` passed to setup: [API guide](./gp-next-api.md).
