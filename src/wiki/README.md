---
title: 图鉴
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
> 图鉴功能正在测试阶段
>
> 使用浏览器的CTRL+F搜索功能快速查找植物

<script setup>
    import { createApp,provide } from 'vue';
    import Wiki from '@source/components/wiki/App.vue';
    const wiki = createApp(Wiki);
    provide("i18nLanguage",'zh');
</script>

<wiki />
