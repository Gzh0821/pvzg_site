---
title: 存档编辑器
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
    provide("i18nLanguage",'zh');

    onMounted(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    })
</script>

> [!warning]
> 存档编辑器正在测试阶段，使用该工具可能会导致存档出现未知问题，请在使用存档编辑器前务必备份原存档文件！
>
> 为了保证存档版本的同步，请使用最新游戏版本导出的存档进行编辑，若使用的是旧游戏版本存档，请将其导入到最新游戏版本后再进行导出和编辑。
>
> 您可以在[在线图鉴](../almanac/)中找到每种植物的 `plantID`。
>
> 存档编辑器不会修改未在下方出现的存档数据。

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-7637695321442015"
     data-ad-slot="7113006248"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

<Editor />
