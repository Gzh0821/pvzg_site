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
    provide("i18nLanguage",'en');

    onMounted(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    })
</script>

> [!warning]
> El editor de guardado esta en fase de pruebas. Usar esta herramienta puede causar problemas desconocidos en el archivo de guardado. Asegurate de hacer una copia de seguridad del archivo original antes de usar el editor.
>
> Para asegurar la sincronizacion de version del guardado, usa el archivo de guardado exportado desde la version mas reciente del juego. Si estas usando un guardado de una version antigua, importalo primero en la version mas reciente antes de exportar y editar.
>
> Puedes encontrar el `plantID` de cada planta en el [Almanaque](../almanac/).
>
> El editor de guardado no modificara los datos de guardado que no aparezcan abajo.

## Herramientas y guias relacionadas

- Ajustar teclas: [Editor de teclas](./keybind-editor.md)
- Consultar IDs de plantas y zombis: [Almanaque en linea](../almanac/)
- Aprender parches y datapacks: [Guia de MOD](../guide/mod/)

<ins class="adsbygoogle"
  style="display:block"
  data-ad-client="ca-pub-7637695321442015"
  data-ad-slot="7113006248"
  data-ad-format="auto"
  data-full-width-responsive="true"> </ins>

<Editor />
