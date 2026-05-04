---
title: 自定义关卡编辑器
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
    provide("i18nLanguage",'zh');

    onMounted(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    })
</script>

> [!warning]
> 自定义关卡编辑器处于早期测试阶段。导出的关卡文件请先在本地测试，再分享给其他玩家。
>
> 第一版主要支持标准草坪、种子栏和普通波次。导入复杂官方关卡时，暂未可视化支持的模块会显示在校验区域。

## 相关工具与教程

- 本地关卡导入流程：[本地关卡导入](../guide/seo/level-import.md)
- 官方关卡参考：[官方关卡](../creator-garden/official-level.md)
- 补丁与数据包制作：[MOD 教程](../guide/mod/)

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-7637695321442015"
     data-ad-slot="7113006248"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

<Editor />
