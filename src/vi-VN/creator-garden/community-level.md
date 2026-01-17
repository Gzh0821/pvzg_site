---
title: Level Cộng Đồng
index: true
order: 23
icon: feather-pointed
pageInfo: false
comment: false
---

<script setup>
    import LevelList from '@source/components/level-list/App.vue';
    import { provide } from 'vue';
    provide("i18nLanguage",'vi');
</script>

<LevelList authorGroup = "custom"/>
