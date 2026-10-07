---
title: Редактор Сохранений
index: true
order: 2
icon: floppy-disk
pageInfo: false
comment: false
toc: false
prev: false
next: false
---

<script setup>
    import Editor from '@source/components/save-editor/App.vue';
    import { provide } from 'vue';
    import { onMounted } from 'vue';
    provide("i18nLanguage",'ru');

    onMounted(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    })
</script>

> [!warning]
> Сделайте копию исходного сохранения и используйте экспорт текущей версии игры. Меняются только поля, доступные в инструменте; ID растений смотрите в [альманахе](../almanac/).

<Editor />

## Связанные инструменты и гайды

- Настройка клавиш: [Редактор Клавиш](./keybind-editor.md)
- Поиск ID растений и зомби: [Онлайн-альманах](../almanac/)
- Патчи и datapack: [Гайд по MOD](../guide/mod/)

<ins class="adsbygoogle"
style="display:block"
data-ad-client="ca-pub-2336226859954206"
data-ad-slot="1822530351"
data-ad-format="auto"
data-full-width-responsive="true"> </ins>
