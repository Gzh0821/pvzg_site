---
title: Save Editor
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
    provide("i18nLanguage",'en');

    onMounted(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    })
</script>

> [!warning]
> The save editor is in the testing phase. Using this tool may cause unknown problems in the save file. Please be sure to back up the original save file before using the save editor!
>
> To ensure the synchronization of the save version, please use the save file exported from the latest game version for editing. If you are using the save file of the old game version, please import it into the latest game version before exporting and editing.
>
> You can find the `plantID` for each plant in the [Almanac](../almanac/).
>
> The save editor will not modify the save data that does not appear below.

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-2336226859954206"
     data-ad-slot="6758794743"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

<Editor />
