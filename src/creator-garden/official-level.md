---
title: 官方关卡
index: true
order: 22
icon: pen-fancy
pageInfo: false
comment: false
---

<script setup>
    import LevelList from '@source/components/level-list/App.vue';
    import { provide } from 'vue';
    provide("i18nLanguage",'zh-CN');
</script>

<LevelList authorGroup = "official"/>
