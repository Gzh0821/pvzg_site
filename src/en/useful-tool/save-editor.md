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
> Back up the original save and use a file exported by the current game version. Only fields exposed by the tool are edited; find plant IDs in the [Almanac](../almanac/).

## Related Tools and Guides

- Adjust key configuration: [Keybind Editor](./keybind-editor.md)
- Check plant and zombie IDs: [Online Almanac](../almanac/)
- Learn datapacks and patching: [MOD Guide](../guide/mod/)

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-2336226859954206"
     data-ad-slot="1822530351"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

<Editor />
