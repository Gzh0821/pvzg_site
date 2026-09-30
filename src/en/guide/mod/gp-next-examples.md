---
title: Official example mods
icon: toolbox
pageInfo: false
index: true
order: 13
---

## Download and install

For game **0.15.0** and GP-Next **1.5.2**. Install all three packages:

| Download | Purpose |
| --- | --- |
| [pvzge.entities.zip](/downloads/mods/pvzge.entities.zip) | Official asset loading and native entity registration framework |
| [example.entity-framework.zip](/downloads/mods/example.entity-framework.zip) | Example plant and zombie behaviors |
| [example.entity-content.zip](/downloads/mods/example.entity-content.zip) | Pulse triangle and Diamond walker with their own images, animations and sounds |

First enable Experimental → JS Modding after confirming the risk notice, then import the framework, behavior and content ZIPs in that order in Mods and enable all packages and restart as prompted. Find Pulse triangle and Diamond walker in the Almanac and sandbox. The content package has no JS of its own; its framework and behavior dependencies require JS.

## Make your own content

Extract the content package. Edit `feature`, `properties`, Almanac text and resource references in `content/entities.json`. When replacing PNG, DragonBones 5.5 skeleton/atlas data or WAV files, keep the declared paths consistent.

Use a new `pack.json` uuid for a separate project. For updates to the same project, retain its uuid and entity IDs and increase its version. Property and fusion recipe changes need no new JS; change the behavior package's `scripts/main.js` only for new behavior. Repack with `pack.json` at the ZIP root, import again and restart as prompted.

This framework defines its own `content/entities.json` format; it is not mandatory for every GP-Next mod. Back up before disabling or removing content. Saves that reference these entities require their content package.

[Fusion recipes](./gp-next-fusion.md) · [Assets and startup registration](./gp-next-resources.md)

