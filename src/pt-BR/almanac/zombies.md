---
title: Zombie Almanac
icon: book-open
pageInfo: false
comment: false
toc: false
sidebar: false
watermark: true
order: 3
---
<script setup>
    import { createApp,provide } from 'vue';
    import Almanac from '@source/components/zombiesAlmanac/App.vue';
    provide("i18nLanguage",'en');
</script>

<Almanac />
