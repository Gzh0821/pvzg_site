---
title: 植物图鉴
icon: book-open
pageInfo: false
comment: false
toc: false
watermark: true
sidebar: false
order: 2
---

<script setup>
    import { createApp,provide } from 'vue';
    import Almanac from '@source/components/plantsAlmanac/App.vue';
    provide("i18nLanguage",'en');
</script>

<Almanac />
