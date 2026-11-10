---
title: Community Levels
index: true
order: 23
icon: feather-pointed
pageInfo: false
comment: false
---

<script setup>
import CommunityLevel from '@source/components/community-level/App.vue';
import { provide } from 'vue';
provide('i18nLanguage', 'en');
</script>

Levels from the in-game GitHub community library, provided by their authors.

<CommunityLevel />
