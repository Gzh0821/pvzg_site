---
title: Editor de guardado
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
    provide("i18nLanguage",'es');

    onMounted(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    })
</script>

> [!warning]
> Haz una copia del guardado y usa un archivo exportado por la versión actual. Solo se editan los campos disponibles en la herramienta; consulta los IDs en el [almanaque](../almanac/).

<Editor />

## Herramientas y guias relacionadas

- Ajustar teclas: [Editor de teclas](./keybind-editor.md)
- Consultar IDs de plantas y zombis: [Almanaque en linea](../almanac/)
- Aprender parches y datapacks: [Guia de MOD](../guide/mod/)

<ins class="adsbygoogle"
  style="display:block"
  data-ad-client="ca-pub-2336226859954206"
  data-ad-slot="1822530351"
  data-ad-format="auto"
  data-full-width-responsive="true"> </ins>
