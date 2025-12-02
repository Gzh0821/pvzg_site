---
title: Keybind Editor
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
    provide("i18nLanguage",'en');

    onMounted(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    })
</script>

> [!warning]
> The key binder is in the testing phase. Using this tool may cause unknown problems with the key configuration. Please be sure to back up the original key configuration before using it!
>
> Please use the archive exported from the latest game version for editing.
>
> You can bind multiple functions to the same key, but please note that some functions may conflict or not work properly.

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-2336226859954206"
     data-ad-slot="6758794743"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

<Editor />
