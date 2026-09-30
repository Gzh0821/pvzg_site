---
title: Settings
icon: toolbox
pageInfo: false
index: true
order: 7
---

Use Settings for the panel language, shortcut and scrolling. The default shortcut is F9. The game text language is selected in the game's own settings, independently of the panel language.

Continuous scrolling changes list speed. The discrete selection interval helps prevent trackpad input from skipping worlds or sandbox cards.

Set FPS only in **Experimental**: enable the experimental scheduler, then select its target (initially 120 FPS). With the scheduler off, the game controls frame rate. Performance is read-only and reports measured engine frame intervals, which may differ from the target. Configure plant, zombie and tomb health display in **Tools**. An additional health line may represent armor or a shell.

Open a mod's details to change its settings, then apply or restart as prompted. Enable map or plant-level options when a mod requires them; experimental frame scheduling can be enabled separately. JavaScript is off by default. Enable Experimental → JS Modding after reading and confirming one risk notice; no console is needed. After disabling it, restart as prompted: script mods and their required dependents are suspended while their selection is retained. Re-enabling still runs normal checks. JSON-only packs need no JS unless they depend on a script mod.

## Import and export preferences

Export GP-Next preferences as JSON in Settings. Review the import preview before applying and restarting. This transfers preferences such as language, shortcut, scrolling and health display, not game saves, enabled-mod selection, mod-owned settings or experimental options.

[Diagnostics and startup recovery](./gp-next-recovery.md)

When tabs do not fit, use the mouse wheel, horizontal trackpad/touch gestures, or hold the left mouse button and drag. Dragging does not select a tab. Selecting a tab reveals it and part of its neighbours when space permits. Arrow keys and Home/End also switch tabs; there is no overflow dropdown.

## Script permissions

JS Modding runs trusted code, not a sandbox. Mods share the game page and can access page storage and the native capabilities granted to that window. Do not run unknown scripts.

The Content Security Policy (CSP) restricts script/resource sources and network destinations. Bundled entries, package resources and dependency APIs remain usable; arbitrary remote code or network hosts are not guaranteed to work. Tauri's default file read/write scope is limited to required GP-Next and patch directories; file-dialog selections grant access for the relevant import/export operation. This is not per-mod isolation.

Use `ctx.files` for your package or declared direct dependencies, and `ctx.storage` for mod data. Share runtime logic through `ctx.services` and startup logic through `ctx.registry`; do not construct cross-package ESM imports or bypass file permissions.
