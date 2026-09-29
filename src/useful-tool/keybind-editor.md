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
> 编辑前备份原配置，并使用当前游戏版本导出的文件。同一按键绑定多个功能可能冲突。

## 相关工具与教程

- 存档编辑与资源修改：[存档编辑器](./save-editor.md)
- 植物与僵尸 ID 查询：[在线图鉴](../almanac/)
- 补丁与数据包制作：[MOD 教程](../guide/mod/)

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-2336226859954206"
     data-ad-slot="1822530351"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

<Editor />
