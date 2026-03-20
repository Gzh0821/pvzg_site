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

## 相关工具与教程

- 存档编辑与资源修改：[存档编辑器](./save-editor.md)
- 植物与僵尸 ID 查询：[在线图鉴](../almanac/)
- 补丁与数据包制作：[MOD 教程](../guide/mod/)

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-7637695321442015"
     data-ad-slot="7113006248"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

<Editor />
