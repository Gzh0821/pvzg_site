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
> Back up the original configuration and use an export from the current game version. Binding several actions to one key may cause conflicts.

## Related Tools and Guides

- Edit save and progression data: [Save Editor](./save-editor.md)
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
