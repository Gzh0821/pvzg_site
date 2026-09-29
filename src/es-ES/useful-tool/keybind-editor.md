---
title: Editor de teclas
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
    provide("i18nLanguage",'es');

    onMounted(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    })
</script>

> [!warning]
> Haz una copia de la configuración y usa una exportación de la versión actual. Varias acciones en una tecla pueden entrar en conflicto.

## Herramientas y guias relacionadas

- Editar progreso y guardado: [Editor de guardado](./save-editor.md)
- Consultar IDs de plantas y zombis: [Almanaque en linea](../almanac/)
- Aprender parches y datapacks: [Guia de MOD](../guide/mod/)

<ins class="adsbygoogle"
  style="display:block"
  data-ad-client="ca-pub-2336226859954206"
  data-ad-slot="1822530351"
  data-ad-format="auto"
  data-full-width-responsive="true"> </ins>

<Editor />
