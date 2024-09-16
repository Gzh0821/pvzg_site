---
title: альманах растений
index: false
icon: book-open
pageInfo: false
breadcrumb: false
sidebar: false
comment: false
toc: false
watermark: true
---

<script setup>
    import { createApp,provide } from 'vue';
    import Almanac from '@source/components/wiki/App.vue';
    provide("i18nLanguage",'en');
</script>

<Almanac />
