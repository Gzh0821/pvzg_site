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
> Редактор Клавиш находится на стадии тестирования. Использование этого инструмента может вызвать неизвестные проблемы с конфигурацией клавиш. Обязательно создайте резервную копию оригинальной конфигурации клавиш перед использованием!
>
> Пожалуйста, используйте архив, экспортированный из последней версии игры, для редактирования.
>
> Вы можете привязать несколько функций к одной клавише, однако учтите: некоторые из них могут конфликтовать или работать некорректно.

<ins class="adsbygoogle"
style="display:block"
data-ad-client="ca-pub-7637695321442015"
data-ad-slot="7113006248"
data-ad-format="auto"
data-full-width-responsive="true"> </ins>

<Editor />
