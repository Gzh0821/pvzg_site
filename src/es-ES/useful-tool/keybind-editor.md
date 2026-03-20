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
    provide("i18nLanguage",'en');

    onMounted(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    })
</script>

> [!warning]
> El editor de teclas esta en fase de pruebas. Usar esta herramienta puede causar problemas desconocidos en la configuracion de teclas. Asegurate de hacer una copia de seguridad de la configuracion original antes de usarla.
>
> Usa para editar el archivo exportado desde la version mas reciente del juego.
>
> Puedes asignar varias funciones a la misma tecla, pero ten en cuenta que algunas funciones pueden entrar en conflicto o no funcionar correctamente.

## Herramientas y guias relacionadas

- Editar progreso y guardado: [Editor de guardado](./save-editor.md)
- Consultar IDs de plantas y zombis: [Almanaque en linea](../almanac/)
- Aprender parches y datapacks: [Guia de MOD](../guide/mod/)

<ins class="adsbygoogle"
  style="display:block"
  data-ad-client="ca-pub-7637695321442015"
  data-ad-slot="7113006248"
  data-ad-format="auto"
  data-full-width-responsive="true"> </ins>

<Editor />
