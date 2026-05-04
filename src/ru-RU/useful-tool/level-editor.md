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
> Редактор пользовательских уровней находится на раннем этапе тестирования. Проверяйте экспортированные уровни локально перед публикацией.
>
> Сейчас в основном поддерживаются стандартное поле, панель семян и обычные волны. Неподдерживаемые модули сложных импортированных уровней показываются в проверке.

## Связанные инструменты и руководства

- Основы файлов уровней: [Руководство по уровням](../guide/level/levelguide.md)
- Справочник официальных уровней: [Официальные уровни](../creator-garden/official-level.md)
- Датапаки и патчи: [MOD-руководство](../guide/mod/)

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-7637695321442015"
     data-ad-slot="7113006248"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

<Editor />
