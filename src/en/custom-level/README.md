---
title: Custom Level
index: false
icon: feather
pageInfo: false
breadcrumb: false
sidebar: false
comment: false
---

<script setup>
    import LevelList from '@source/components/level-list/App.vue';
    import { provide } from 'vue';
    provide("i18nLanguage",'en');
</script>

> [!info]
> This page is a list of custom levels. Click on the card to download the level file. Click `Play Local Level` in the game settings to import it and play. If the list is empty, please wait or try to refresh the page.
>
> For tutorials on writing custom levels, see [Custom Level Guide](/en/guide/level/)

<LevelList authorGroup = "official"/>
