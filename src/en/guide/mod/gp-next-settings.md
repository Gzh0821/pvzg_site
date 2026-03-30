---
title: Settings & Extensions
icon: gear
pageInfo: false
index: true
order: 7
---

# Settings and Extensions

Besides ordinary toggles, the Settings page also hosts some runtime features managed by GP-Next.

## Basic Settings

Common basic settings currently include:

- panel language
- frame rate
- debug mode

## Scroll Tweaks

This is one of the runtime features GP-Next recently started handling.

At the moment it mainly has two parts:

### 1. Continuous Scroll Sensitivity

This affects scenes such as:

- settings page scrolling
- almanac and similar scrollable pages
- other continuous wheel / scroll scenes

### 2. Minimum Interval for Discrete Selectors

This affects scenes such as:

- world selector
- sandbox plant list
- sandbox zombie list
- some sandbox wheel-switch inputs

The goal of this setting is not simply "scroll faster". It is meant to reduce accidental jumps and over-scrolling from touchpads or high-sensitivity inputs.

## Runtime Extensions

The most important one right now is:

- `Dynamic Plant Registry`

It is used to:

- take over part of the plant identity mapping logic
- make datapacks with "new plants / cloned plants" more stable at runtime

### When To Keep It Enabled

If your datapack:

- adds new plants
- clones existing plants
- changes logic related to plant identity or mapping

then you should generally keep it enabled.

### How It Takes Effect

These settings usually:

- **start working after reloading patches**
- do not always require a full game restart

## HP Overlay

This is the in-battle HP display feature.

It can currently show:

- plant HP
- zombie HP
- HP for Tomb-style map objects

For units with an extra damage-taking layer, it also shows a second HP line in addition to the main one.

## About, Log, and Update Check

### About

Used to view the GP-Next introduction and console command documentation.

### Log

Used to inspect GP-Next runtime logs and check:

- whether patches were loaded
- where a failure happened
- whether a runtime extension was applied

### Footer Update Check

The footer shows:

- the current GP-Next version
- whether a new version was found

If an update is available, you can jump directly to the official download page.

## Next

- [Console API](./gp-next-console.md)
