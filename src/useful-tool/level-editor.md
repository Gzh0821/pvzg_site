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
> 编辑器仍处于测试阶段。导出后请先在本地测试；导入的复杂对象会保留并列入校验。

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-2336226859954206"
     data-ad-slot="1822530351"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

<Editor />

## 相关工具与教程

- 本地关卡导入流程：[本地关卡导入](../guide/seo/level-import.md)
- 每日关卡参考：[每日关卡](../creator-garden/daily-level.md)
- 补丁与数据包制作：[MOD 教程](../guide/mod/)
