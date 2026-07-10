---
title: Редактор уровней
index: true
order: 4
icon: pen-to-square
pageInfo: false
comment: false
toc: false
prev: false
next: false
sidebar: false
---

<script setup>
    import Editor from '@source/components/level-editor/App.vue';
    import { provide } from 'vue';
    import { onMounted } from 'vue';
    provide("i18nLanguage",'ru');

    onMounted(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    })
</script>

> [!warning]
> Редактор все еще тестируется. Проверяйте экспорт локально; сложные импортированные объекты сохраняются и отображаются при проверке.

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-2336226859954206"
     data-ad-slot="1822530351"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

<Editor />

## Связанные инструменты и руководства

- Основы файлов уровней: [Руководство по уровням](../guide/level/levelguide.md)
- Daily level reference: [Daily Level](../creator-garden/daily-level.md)
- Датапаки и патчи: [MOD-руководство](../guide/mod/)
