---
title: Daily Level
index: true
order: 22
icon: calendar-days
pageInfo: false
comment: false
---

<script setup>
import DailyLevel from '@source/components/daily-level/App.vue';
import { provide } from 'vue';

provide("i18nLanguage", "en");
</script>

<DailyLevel />
