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
> El editor de niveles personalizados está en fase temprana de prueba. Prueba los archivos exportados localmente antes de compartirlos.
>
> La primera versión admite principalmente tableros estándar, bancos de semillas y oleadas normales. Los módulos no compatibles de niveles complejos importados se muestran en la validación.

## Herramientas y guías relacionadas

- Conceptos básicos de archivos de nivel: [Guía de niveles](../guide/level/levelguide.md)
- Referencia de niveles oficiales: [Niveles oficiales](../creator-garden/official-level.md)
- Paquetes de datos y parches: [Guía MOD](../guide/mod/)

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-7637695321442015"
     data-ad-slot="7113006248"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

<Editor />
