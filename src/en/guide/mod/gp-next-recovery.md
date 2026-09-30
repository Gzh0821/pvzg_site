---
title: Diagnostics and startup recovery
icon: toolbox
pageInfo: false
index: true
order: 8
---

## Diagnostics

Diagnostics brings together mod errors, shared hooks, restart, logs and report export. Filter logs by severity or keyword.

Reports hide sensitive details by default. Turning filtering off preserves full error messages, which may contain paths or settings/save fragments written by mods. Review before sharing. Reports do not actively collect complete game saves.

## Startup failure

The recovery page opens automatically and backs up current saves and configuration before enabling repairs. Follow its suggested action; raw errors are available in Error details.

| Action | Effect |
| --- | --- |
| Restore previous configuration | Restores the last successfully applied mod configuration and keeps the current save |
| Reset GP-Next settings | Resets preferences and experimental options; retains saves, mod files and enabled-mod selection |
| Restore configuration and save | Available only with a matching valid backup; rolls back all players and separately backs up current saves |
| Export save | Exports raw current game saves, even if their contents are damaged |
| Export diagnostics | Exports startup and error information with optional filtering |

Failed backups block reset and restore operations. Restore missing mods when a save depends on them; recovery never automatically removes unknown plants or zombies. Save rollback does not restore mod-owned files.

Recovery snapshots are in the app data directory under `gp-next/save-backups/startup-recovery/`. They capture data on entering recovery, not necessarily a healthy pre-failure state. Native save backups are under `gp-next/save-backups/native-player/`. Do not manually replace saves while the game is running.

## Retrying and disabling mods

Related mods lists packages with loading/preflight errors and possibly related changed packages, with the evidence for each. A possible match is not a confirmed cause.

- **Restart normally** checks the current selection again. A previous failure alone never blocks the next launch or automatically undoes that selection. Remaining faults show their current error; reimport edited packages.
- **Disable JS Modding** confirms and restarts, suspending scripts and packages that require them while retaining their selection, files and saves. Already running scripts stop only after restart.
- **Disable all mods** clears the enabled selection for installed mods and turns JS Modding off. Files, settings and saves remain. Turning JS back on does not restore manually disabled selections. Loose patches and manual Data edits are outside this action.

## Try force start

Offered only when an attempt is allowed. Confirm the stability and save-data warning; the game backs up and restarts automatically. Authorization applies only to the immediately following launch, skipping platform checks for dependencies, non-JS required features, data-package digests, entity IDs/mappings and save-content references. Configuration or package changes invalidate authorization. The next ordinary restart restores full checks.

The JS Modding switch, script trust, file permissions and actual script parsing/execution errors still apply; not every failure can be bypassed. The attempt can still write real saves and is not recorded as a verified configuration. Failure does not trigger an automatic retry loop.
