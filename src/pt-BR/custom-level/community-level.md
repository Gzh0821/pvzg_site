---
title: Community Level
index: true
order: 3
icon: feather-pointed
pageInfo: false
comment: false
---

<script setup>
    import LevelList from '@source/components/level-list/App.vue';
    import { provide } from 'vue';
    provide("i18nLanguage",'pt-BR');
</script>

<LevelList authorGroup = "custom"/>
