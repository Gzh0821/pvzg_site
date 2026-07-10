---
title: Editor de niveles
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
    provide("i18nLanguage",'es');

    onMounted(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    })
</script>

> [!warning]
> El editor sigue en fase de prueba. Prueba las exportaciones localmente; los objetos complejos importados se conservan y aparecen en la validación.

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-2336226859954206"
     data-ad-slot="1822530351"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

<Editor />

## Herramientas y guías relacionadas

- Conceptos básicos de archivos de nivel: [Guía de niveles](../guide/level/levelguide.md)
- Daily level reference: [Daily Level](../creator-garden/daily-level.md)
- Paquetes de datos y parches: [Guía MOD](../guide/mod/)
