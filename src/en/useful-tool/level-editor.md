---
title: Custom Level Editor
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
    provide("i18nLanguage",'en');

    onMounted(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    })
</script>



<Editor />

<div class="level-editor-ad">
<span class="level-editor-ad-label">Advertisements</span>
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-2336226859954206"
     data-ad-slot="1822530351"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>
</div>

## Related Tools and Guides

- Level file basics: [Level Guide](../guide/level/levelguide.md)
- Daily level reference: [Daily Level](../creator-garden/daily-level.md)
- Datapacks and patching: [MOD Guide](../guide/mod/)
