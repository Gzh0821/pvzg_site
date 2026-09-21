---
title: Files and backups
icon: toolbox
pageInfo: false
index: true
order: 2
---

# Files and backups

Choose **Mods → Open Folder** to find the data directory used by this edition. Standard and Lite may use different directories.

Install through Import ZIP or Import folder. Existing `packs/` files are discovered for migration; follow the migration prompt. To update an installed mod, import its new version.

| Directory | Content |
| --- | --- |
| `packs/` | Existing folder/ZIP mods to discover and migrate |
| `patches/` | Loose JSON patches |
| `__gpn_edits/` | Saved manual edits from Data |
| `mod-data/` | Mod-owned progress and data |
| `save-backups/` | Local save backups associated with mod operations |

Use the manager to change settings and ordering. Do not edit its installation records by hand. Mods are layered in their configured order; later changes to the same field take precedence. Loose patches and manual edits can override them. Restoring manual edits does not remove a mod's own changes.

Close the game before backing up its data directory. Native save exports and cloud saves do not automatically include mod-owned data. Keep `mod-data/` and the relevant mod configuration when moving progress to another computer. Check the player and backup date before restoring a save.
