---
title: 键位绑定器
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
    provide("i18nLanguage",'zh');

    onMounted(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    })
</script>

> [!warning]
> 键位绑定器正在测试阶段，使用该工具可能会导致键位配置出现未知问题，请在使用前务必备份原键位配置！
>
> 请使用最新游戏版本导出的键位配置上传编辑。
>
> 您可以为同一个按键绑定多个功能，但请注意，某些功能可能会冲突或无法正常工作。

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-2336226859954206"
     data-ad-slot="6758794743"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

<Editor />
