---
title: Уровни сообщества
index: true
order: 23
icon: feather-pointed
pageInfo: false
comment: false
---

<script setup>
import CommunityLevel from '@source/components/community-level/App.vue';
import { provide } from 'vue';
provide('i18nLanguage', 'ru');
</script>

Уровни из библиотеки GitHub в игре, предоставленные авторами.

<CommunityLevel />
