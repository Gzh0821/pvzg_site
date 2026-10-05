---
title: Gardenest guide
icon: seedling
order: 2
pageInfo: false
comment: false
---

[Gardenest](https://nest.pvzge.com/) is the PvZ2 Gardendless community platform for levels, data packs, mods, and tools/plugins. **It is currently in Beta testing.**

## Browse and download

Public creations can be browsed without signing in. Use [Discover](https://nest.pvzge.com/discover) to filter by type, keywords, and compatibility. Recommended sorting is the default; you can change it. Project pages show descriptions, authors, dependencies, and versions.

In Downloads → Local download, select a version and check compatibility and required/optional dependencies before downloading. External versions use the author’s links. Follow the author’s instructions for tools/plugins; these are not GP-Next mods. Publication and basic checks do not mean a virus scan or in-game validation has passed; read the displayed check status.

| File | Manual use |
| --- | --- |
| Level JSON/JSON5 | Load it using the [custom level guide](./level/) |
| Data pack/mod ZIP | Import in [GP-Next](./mod/gp-next.md), choose whether to enable, then apply |
| Level ZIP or tool/plugin | Follow the author’s package and usage instructions |

### Play in game / Import into game

Desktop clients supporting the Nest protocol can be opened from the download area. Level JSON/JSON5 files are checked and played directly. Data pack/mod ZIPs require confirmation in the game and stay disabled; they are not applied automatically. Updates also stay disabled and do not immediately replace currently running content. Script settings, trust, and dependency checks still apply.

Level ZIPs, tools/plugins, and external-only versions have no import button. This integration is in Beta testing and requires a compatible client. Your system may ask to open an external app; if it cannot open or your version is unsupported, download manually.

## Sign in and secure your account

Use a method offered on the [sign-in page](https://nest.pvzge.com/login); new users create an account through the displayed flow; eligible verified email identities may also link to an existing account. Link additional platforms from Settings → Third-party accounts on your existing account. Account and security provides passkeys, an authenticator, two-factor authentication, and recovery codes. Two-factor authentication is mandatory for administrators.

Display names and usernames are separate. Ordinary accounts use their public UID as the default username; verified developers and above may choose a valid, unique username. Profiles show creations, level, and public information; users choose whether their saved collections are public.

## How to upload your creations

1. Sign in and open the [Creator Center](https://nest.pvzge.com/author) from the account menu. Select New project at the top right.
2. Enter a name, type, visibility, summary, and Markdown description. Dependencies are optional: match a project ID or add a brief description if no project is found.
3. Add links to a third-party platform or upload version files. You can use both options for the same project.
4. Save the project details. When uploading a version, add its version number, changelog, and compatibility information, then submit and review the check results. Ordinary users’ content changes require review; eligible verified developers and higher roles can bypass manual review. File, quota, and archive checks still apply.

### Use third-party platform links

If your creation is already hosted on GitHub, Google Drive, MEGA, Dropbox, or another platform, add download links in the project editor. Select the platform and enter a link name and a valid HTTPS URL. After saving, players can follow the links from the project page without you uploading another copy to Gardenest.

### Upload version files

Upload a file through the project's version management, enter the version number, changelog, and compatibility information, then submit. Levels accept JSON/JSON5 or ZIP; data packs and mods require ZIPs following GP-Next rules. Tools/plugins use ZIP and do not require a GP manifest or UUID. Once published, players can select a version under Downloads → Local download or Versions.

Manage collaborators and invitations in the Creator Center. Settings → Quota management shows current storage, daily upload, and project limits. Older versions and team uploads also count toward the relevant account; deleted file storage is released after cleanup completes.

## Tasks and notifications

The [Task Center](https://nest.pvzge.com/tasks) shows levels, experience, daily check-ins, and growth tasks. Refresh timestamps are displayed in your local time zone. Read [notifications](https://nest.pvzge.com/notifications) can be deleted for your account without changing anyone else’s state. See the [announcements page](https://nest.pvzge.com/announcements) for updates.

During Beta, report issues through [Feedback](../contribution/feedback.md) with steps, project/version IDs, and shareable errors. Never include passwords, recovery codes, or login credentials.
