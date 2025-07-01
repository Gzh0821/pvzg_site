---
title: 僵尸图鉴
icon: book-open
pageInfo: false
comment: false
toc: false
watermark: true
sidebar: false
order: 3
---

<script setup>
    import { createApp,provide } from 'vue';
    import Almanac from '@source/components/zombiesAlmanac/App.vue';
    provide("i18nLanguage",'en');
</script>

<Almanac />
