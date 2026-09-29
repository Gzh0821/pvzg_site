---
title: Diagnostics and startup recovery
icon: toolbox
pageInfo: false
index: true
order: 8
---

## Diagnostics

Diagnostics brings together mod errors, shared hooks, restart, safe-mode restart, logs and report export. Filter logs by severity or keyword.

Reports hide sensitive details by default. Turning filtering off preserves full error messages, which may contain paths or settings/save fragments written by mods. Review before sharing. Reports do not actively collect complete game saves.

## Safe mode

Starts without mods using a temporary copy of your current save. Progress in this session is discarded. Restart normally to leave, or return to the recovery page.

## Startup failure

The recovery page opens automatically and backs up current saves and configuration before enabling repairs. Follow its suggested action; raw errors are available in Error details.

| Action | Effect |
| --- | --- |
| Start in safe mode | Temporary save, no mods, session progress discarded |
| Restore previous configuration | Restores the last successfully applied mod configuration and keeps the current save |
| Reset GP-Next settings | Resets preferences and experimental options; retains saves, mod files and enabled-mod selection |
| Restore configuration and save | Available only with a matching valid backup; rolls back all players and separately backs up current saves |
| Export save | Exports raw current game saves, even if their contents are damaged |
| Export diagnostics | Exports startup and error information with optional filtering |

Failed backups block reset and restore operations. Restore missing mods when a save depends on them; recovery never automatically removes unknown plants or zombies. Save rollback does not restore mod-owned files.

Recovery snapshots are in the app data directory under `gp-next/save-backups/startup-recovery/`. They capture data on entering recovery, not necessarily a healthy pre-failure state. Native save backups are under `gp-next/save-backups/native-player/`. Do not manually replace saves while the game is running.
