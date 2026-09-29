---
title: Редактор Клавиш
index: true
order: 3
icon: keyboard
pageInfo: false
comment: false
toc: false
prev: false
next: false
---

<script setup>
    import Editor from '@source/components/keybind-editor/App.vue';
    import { provide } from 'vue';
    import { onMounted } from 'vue';
    provide("i18nLanguage",'ru');

    onMounted(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    })
</script>

> [!warning]
> Сделайте копию настроек и используйте экспорт текущей версии игры. Несколько действий на одной клавише могут конфликтовать.

## Связанные инструменты и гайды

- Редактирование сохранений: [Редактор Сохранений](./save-editor.md)
- Поиск ID растений и зомби: [Онлайн-альманах](../almanac/)
- Патчи и datapack: [Гайд по MOD](../guide/mod/)

<ins class="adsbygoogle"
style="display:block"
data-ad-client="ca-pub-2336226859954206"
data-ad-slot="1822530351"
data-ad-format="auto"
data-full-width-responsive="true"> </ins>

<Editor />
