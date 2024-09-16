---
title: Almanac
index: false
icon: book-open
pageInfo: false
breadcrumb: false
sidebar: false
comment: false
toc: false
watermark: true
---

> [!warning]
> Almanac function is in the testing stage
>
> Use your browser's CTRL+F search function to quickly find plants

<script setup>
    import { createApp,provide } from 'vue';
    import Wiki from '@source/components/wiki/App.vue';
    const wiki = createApp(Wiki);
    provide("i18nLanguage",'en');
</script>

<wiki />