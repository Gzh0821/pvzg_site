---
title: Using GP-Next
icon: toolbox
pageInfo: false
index: true
order: 1
---

# GP-Next

Press **F9** or click the top-left button to open the game sidebar. Change the shortcut in Settings.

| Tab | Use |
| --- | --- |
| Mods | Import, enable, disable, update, reorder and configure mods |
| Tools | Trainer, health display and cloud saves; availability depends on the scene |
| Data | Search, compare, export and edit game data |
| Performance | Set the target FPS, measure actual FPS and save reports |
| Log | Filter and copy messages when reporting a problem |
| Settings | Panel language, shortcut, scrolling and website help |
| Experimental | Features specifically required by a mod |

## Install and update

1. Download the mod ZIP. Players do not need a compiler or programming tools.
2. Choose **Mods → Import ZIP**, select the file and confirm its name and version.
3. Enable it, save the selection and apply. If prompted to restart, finish playing first.
4. Select the mod name to see its settings, controls or error details.

For a folder, import the directory containing `pack.json`. Install and enable all required dependencies. To update, import the new ZIP with the same mod ID; editing the original folder does not update an installed copy.

Disable a mod by clearing its checkbox, saving and applying. New entities and resources usually require a restart. If a save still needs mod content, follow the recovery prompt instead of deleting the save.

## JavaScript mods

JSON-only mods work without JavaScript. JavaScript execution is off by default and can only be enabled from the developer console. Press F12, select Console and run:

```js
await gpNext.mods.enableJsModding()
```

Apply or restart when prompted. Only use JavaScript mods from sources you trust. Importing a ZIP does not enable this switch.

## Troubleshooting

Install missing dependencies and check their versions. After a failed startup, use the recovery screen to return to the previous configuration. Unexpected values may come from another mod or manual Data edits. Report the game version, mod versions, steps and relevant logs.

[JSON mods](./gp-next-datapack.md) · [JavaScript guide](./gp-next-js.md) · [API](./gp-next-api.md)
