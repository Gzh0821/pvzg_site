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
> Редактор сохранений находится на стадии тестирования. Использование этого инструмента может вызвать неизвестные проблемы в файле сохранения. Перед использованием редактора сохранений обязательно сохраните резервную копию исходного файла сохранения!
>
> Чтобы обеспечить синхронизацию версии сохранения, используйте для редактирования файл сохранения, экспортированный из последней версии игры. Если вы используете файл сохранения старой версии игры, пожалуйста, импортируйте его в последнюю версию игры перед экспортом и редактированием.
>
> Вы можете найти `plantID` для каждого растения в [Альманахе](../almanac/).
>
> Редактор сохранений не будет изменять данные сохранения, которые не указаны ниже.

<ins class="adsbygoogle"
style="display:block"
data-ad-client="ca-pub-7637695321442015"
data-ad-slot="6758794743"
data-ad-format="auto"
data-full-width-responsive="true"> </ins>

<Editor />
