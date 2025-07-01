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
> Редактор сохранений находится на фазе тестировки. Использование этого инструмента может привести к неизвестным проблемам в вашем файле сохранения. Пожалуйста, сохраните оригинальный файл сохранения перед тем, как использовать редактор сохранений!
>
> Чтобы обеспечить синхронизацию версии сохранения, пожалуйста используйте для редактирования файл сохранения, экспортированный из последней версии игры. Если вы используете файл сохранения старой версии игры, пожалуйста импортируйте его в последнюю версию игры перед экспортом и редактированием.
>
> Вы можете найти `plantID` каждого растения в [Альманахе](../almanac/).
>
> Редактор сохранений не будет модифицировать сохраненные данные, которые не отображаются ниже.

<ins class="adsbygoogle"
style="display:block"
data-ad-client="ca-pub-7637695321442015"
data-ad-slot="7113006248"
data-ad-format="auto"
data-full-width-responsive="true"> </ins>

<Editor />
