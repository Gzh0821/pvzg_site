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
  })
})
onMounted(() => {
  (adsbygoogle = window.adsbygoogle || []).push({});
})
</script>

> [!important]
> For FAQs related to downloading and playing, please see [here](../guide/FAQ.md), and for system requirements and recommended configurations, please see [here](../guide/requirement.md)

> [!warning]
> Please note: The download link provided on this page is for learning and communication purposes only and may not be used for commercial purposes.
>
> Downloading or playing online means that you have read and agreed to the following agreements and statements:
>
> - "PvZ2 Gardendless" Usage Agreement
> - Disclaimer and Copyright Notice for "PvZ2 Gardendless"
>
> For the details of the above agreement and statement, please see [here](../instructions/)

This site only provides the latest official version download link<span v-if="gameInfoData?.Version">, The latest game version is {{ gameInfoData.Version }}</span>.

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

<template v-if="gameInfoData?.Download.Github">

## Github <Badge text="No login required" type="info" /><Badge text="high-speed" type="tip" /><Badge text="global" type="warning" />

Download Link: <a :href="gameInfoData.Download.Github">click to enter</a>

</template>

<template v-if="gameInfoData?.Download.Onedrive">

## Onedrive Link <Badge text="No login required" type="info" /><Badge text="high-speed" type="tip" /><Badge text="global" type="warning" />

Download Link: <a :href="gameInfoData.Download.Onedrive">click to enter</a>

</template>

<template v-if="gameInfoData?.Download.Baidu">

## Baidu Netdisk<Badge text="Only in Chinese" type="danger" />

Download Link: <a :href="gameInfoData.Download.Baidu">click to enter</a>

</template>

<template v-if="gameInfoData?.Download.Pan123">

## 123Pan <Badge text="Only in Chinese" type="danger" />

Download Link: <a :href="gameInfoData.Download.Pan123">click to enter</a>

</template>

<template v-if="gameInfoData?.Download.Quark">

## Quark <Badge text="Only in Chinese" type="danger" />

Download Link: <a :href="gameInfoData.Download.Quark">click to enter</a>

</template>
