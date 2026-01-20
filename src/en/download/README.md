---
title: Download
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
> For FAQs related to downloading and playing, please see [here](../guide/FAQ.md), and for system requirements and recommended configurations, please see [here](../guide/requirement.md)
>
> The website version and QQ group/Chinese netdisk version of this game use different packaging methods, and the archive files will not be automatically inherited.

> [!warning]
> Please note: The download link provided on this page is for learning and communication purposes only and may not be used for commercial purposes.
>
> Downloading or playing online means that you have read and agreed to the following agreements and statements:
>
> - "PvZ2 Gardendless" User Agreement and Disclaimer
>
> For the details of the above agreement and statement, please see [here](../instructions/)

<span v-if="gameInfoData?.Version">The latest game version is {{ gameInfoData.Version }}.</span>

<span v-if="gameInfoData?.Name">The game version name: {{ gameInfoData.Name }}</span>

<span v-if="gameInfoData?.Hash?.MD5">MD5: <code>{{ gameInfoData?.Hash?.MD5 }}</code></span>

<span v-if="gameInfoData?.Hash?.SHA256">SHA256: <code>{{ gameInfoData?.Hash?.SHA256 }}</code></span>

## Changelog

<template v-if="gameInfoData?.EnNewFeatures">

- <li v-for="(item, index) in gameInfoData.EnNewFeatures" :key="index">{{ item }}</li>

</template>

<template v-else>None</template>

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-7637695321442015"
     data-ad-slot="7113006248"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

## ::brands:windows:: Windows platform

<template v-if="gameInfoData?.Download.Github">

### Github ::brands:github::

Download Link: <a :href="gameInfoData.Download.Github" target="_blank">click to enter</a>

</template>

<template v-if="gameInfoData?.Download.Storage">

### Local Download ::cloud-arrow-down::

Download Link: <a :href="gameInfoData.Download.Storage" target="_blank">click to enter</a>

</template>

<template v-if="gameInfoData?.Download.Baidu">

### Baidu Netdisk ::cloud::
Download Link: <a :href="gameInfoData.Download.Baidu" target="_blank">click to enter</a>

</template>

<template v-if="gameInfoData?.Download.Pan123">

### 123Pan ::cloud::

Download Link: <a :href="gameInfoData.Download.Pan123" target="_blank">click to enter</a>

</template>

<template v-if="gameInfoData?.Download.Quark">

### Quark ::cloud::

Download Link: <a :href="gameInfoData.Download.Quark" target="_blank">click to enter</a>

</template>

## ::brands:linux:: Linux/Other platforms

> [!info]
> To play on Linux and other systems with x86_64 (amd64) architecture, you can use Docker images to deploy the web version locally.

### Docker Hub ::brands:docker::

Image address: <a href="https://hub.docker.com/r/gaozih/pvzge" target="_blank">click to enter</a>

## ::clock-rotate-left:: Historical Versions

All historical versions can be downloaded from [Github Release](https://github.com/Gzh0821/pvzg_site/releases)
