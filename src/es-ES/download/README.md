---
title: Descargar
index: false
icon: download
pageInfo: false
breadcrumb: false
sidebar: false
comment: false

category:
  - Download
---

<script setup>
import axios from 'axios';
import { ref, onBeforeMount, onMounted } from 'vue'

const gameInfoData = ref(null);

onBeforeMount(() => {
  axios.get('/jsons/gameinfo.json').then(res => {
    gameInfoData.value = res.data;
  });
})
onMounted(() => {
  (window.adsbygoogle = window.adsbygoogle || []).push({});
})
</script>

> [!important]
> Para preguntas frecuentes relacionadas con la descarga y el juego, consulte [aquí](../guide/FAQ.md), y para los requisitos del sistema y configuraciones recomendadas, consulte [aquí](../guide/requirement.md)
>
> La versión oficial del sitio web y la versión del grupo QQ/discord de red chino de este juego utilizan diferentes métodos de empaque, y los archivos de guardado no se heredarán automáticamente.

> [!warning]
> Tenga en cuenta: Este juego es solo para uso de aprendizaje e intercambio, no debe utilizarse para fines comerciales.
>
> Descargar o jugar en línea significa que ha leído y aceptado los siguientes acuerdos y declaraciones:
>
> - Acuerdo de uso de "PvZ2 Gardendless"
> - Declaración de exención de responsabilidad de "PvZ2 Gardendless"
>
> Para el contenido específico de los acuerdos y declaraciones anteriores, consulte [aquí](../instructions/)

<span v-if="gameInfoData?.Version">La última versión del juego es la {{ gameInfoData.Version }}.</span>

<span v-if="gameInfoData?.Name">El nombre de la versión del juego: {{ gameInfoData.Name }}</span>

<span v-if="gameInfoData?.Hash?.MD5">MD5: <code>{{ gameInfoData?.Hash?.MD5 }}</code></span>

<span v-if="gameInfoData?.Hash?.SHA256">SHA256: <code>{{ gameInfoData?.Hash?.SHA256 }}</code></span>

## Registro de cambios

<template v-if="gameInfoData?.EnNewFeatures">

- <li v-for="(item, index) in gameInfoData.EnNewFeatures" :key="index">{{ item }}</li>

</template>

<template v-else>Ninguno</template>

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-7637695321442015"
     data-ad-slot="6758794743"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

## ::brands:windows:: Plataforma Windows

<template v-if="gameInfoData?.Download.Github">

### Github ::brands:github::

Enlace de descarga: <a :href="gameInfoData.Download.Github" target="_blank">haga clic para ingresar</a>

</template>

<template v-if="gameInfoData?.Download.Storage">

### Descarga local ::cloud-arrow-down::

Enlace de descarga: <a :href="gameInfoData.Download.Storage" target="_blank">haga clic para ingresar</a>

</template>

<template v-if="gameInfoData?.Download.Baidu">

### Baidu Netdisk ::cloud::

Enlace de descarga: <a :href="gameInfoData.Download.Baidu" target="_blank">haga clic para ingresar</a>

</template>

<template v-if="gameInfoData?.Download.Pan123">

### 123 Pan ::cloud::

Enlace de descarga: <a :href="gameInfoData.Download.Pan123" target="_blank">haga clic para ingresar</a>

</template>

<template v-if="gameInfoData?.Download.Quark">

### Quark Netdisk ::cloud::

Enlace de descarga: <a :href="gameInfoData.Download.Quark" target="_blank">haga clic para ingresar</a>

</template>

## ::brands:linux:: Linux/Otras plataformas

> [!info]
> Para jugar en Linux y otros sistemas con arquitectura x86_64 (amd64), puede usar imágenes Docker para implementar localmente la versión web.

### Docker Hub ::brands:docker::

Dirección de la imagen: <a href="https://hub.docker.com/r/gaozih/pvzge" target="_blank">haga clic para ingresar</a>

## ::clock-rotate-left:: Versiones históricas/Archivos de recursos

Todas las versiones históricas y archivos de recursos `JSON` se pueden descargar desde [GE Drive](https://drive.pvzge.com/)
