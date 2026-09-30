---
title: Using GP-Next
icon: toolbox
pageInfo: false
index: true
order: 1
---

Press **F9** or click the top-left button to open the game sidebar. Change the shortcut in Settings.

| Tab | Use |
| --- | --- |
| Mods | Import, enable, disable, update, reorder and configure mods |
| Tools | Trainer, health display and cloud saves; availability depends on the scene |
| Data | Search, compare, export and edit game data |
| Performance | Measure actual FPS and save reports |
| Diagnostics | Mod errors, logs, reports, restart |
| Settings | Panel language, shortcut, scrolling and website help |
| Experimental | Frame scheduling, world maps and plant-level options |

## Install and update

1. Download the mod ZIP. Players do not need a compiler or programming tools.
2. Choose **Mods → Import ZIP**, select the file and confirm its name and version.
3. Enable it, save the selection and apply. If prompted to restart, finish playing first.
4. Select the mod name to see its settings, controls or error details.

For a folder, import the directory containing `pack.json`. Install and enable all required dependencies. To update, import the new ZIP with the same mod ID; editing the original folder does not update an installed copy.

Disable a mod by clearing its checkbox, saving and applying. New entities and resources usually require a restart. If a save still needs mod content, follow the recovery prompt instead of deleting the save.

## JavaScript mods

JavaScript is off by default. Enable Experimental → JS Modding after reading and confirming one risk notice; no console is needed. After disabling it, restart as prompted: script mods and their required dependents are suspended while their selection is retained. Re-enabling still runs normal checks. JSON-only packs need no JS unless they depend on a script mod.

Only install scripts you trust. Updating a script package with changed content requires a new trust confirmation. Importing a ZIP never enables JS Modding automatically.

## Troubleshooting

Install missing dependencies and check their versions. After a failed startup, use the recovery screen to return to the previous configuration. Unexpected values may come from another mod or manual Data edits. Report the game version, mod versions, steps and relevant logs.

[JSON mods](./gp-next-datapack.md) · [JavaScript guide](./gp-next-js.md) · [API](./gp-next-api.md)

[Diagnostics and startup recovery](./gp-next-recovery.md) · [Official example mods](./gp-next-examples.md)

## Requirements, updates and uninstalling

Mod details and import previews show dependency and required-feature status. Import and enable missing dependencies first. For a disabled built-in feature, follow the settings link, enable it and retry. Unknown feature IDs need correction by the author; features are never enabled automatically. A GP-Next version-range warning alone does not block loading.

Enable JS Modding before importing script packages. Changed script-package content requires renewed trust when updating, even if its name or version is unchanged. ZIP and folder imports are supported; extract RAR files before importing the folder.

Choose Uninstall in mod details, confirm, then apply or restart as prompted. Only mods imported by the new manager support uninstall; migrated legacy entries do not. Resolve enabled dependent mods first. Uninstall removes the mod from configuration; it does not erase saves, mod-owned data or all stored snapshots. Save-content dependencies still need checking.
