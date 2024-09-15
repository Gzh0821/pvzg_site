---
title: альманах
index: false
icon: book
pageInfo: false
breadcrumb: false
sidebar: false
comment: false
toc: false
watermark: true
---

> [!warning]
> Функция альманаха находится на стадии тестирования.
> Русский язык в настоящее время недоступен.

<script setup>
    import { createApp,provide } from 'vue';
    import Wiki from '@source/components/wiki/App.vue';
    const wiki = createApp(Wiki);
    provide("i18nLanguage",'en');
</script>

<wiki />
