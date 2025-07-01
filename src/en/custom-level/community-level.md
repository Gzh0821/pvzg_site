---
title: Community Level
index: true
order: 0
icon: ""
pageInfo: false
comment: false
---

<script setup>
    import LevelList from '@source/components/level-list/App.vue';
    import { provide } from 'vue';
    provide("i18nLanguage",'en');
</script>

<LevelList authorGroup = "custom"/>
