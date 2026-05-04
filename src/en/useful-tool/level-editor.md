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

> [!warning]
> The custom level editor is in early testing. Test exported level files locally before sharing them with other players.
>
> Currently, it mainly supports standard boards, seed banks, and regular waves. Unsupported modules in imported complex levels are shown in the validation area.

## Related Tools and Guides

- Level file basics: [Level Guide](../guide/level/levelguide.md)
- Official level reference: [Official Levels](../creator-garden/official-level.md)
- Datapacks and patching: [MOD Guide](../guide/mod/)

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-7637695321442015"
     data-ad-slot="7113006248"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

<Editor />
