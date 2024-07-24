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
import { ref, onBeforeMount } from 'vue'

// const dataFormat = {
//     "Version": "",
//     "InsideVersion": "",
//     "Download": {
//         "Baidu": "",
//         "Pan123": "",
//         "Quark": "",
//         "Github": "",
//         "Onedrive": "",
//         "OnedriveOrigin": ""
//     }
// }

const gameInfoData = ref(null);

onBeforeMount(() => {
  axios.get('/jsons/gameinfo.json').then(res => {
    gameInfoData.value = res.data;
  })
})

</script>

> [!important]
> For FAQs related to downloading and playing, please see [here](../guide/FAQ.md), and for system requirements and recommended configurations, please see [here](../guide/requirement.md)

> [!warning]
> Please note: The download link provided on this page is for learning and communication purposes only and may not be used for commercial purposes. Please delete it within 24 hours after downloading.
>
> Downloading or playing online means that you have read and agreed to the following agreements and statements:
>
> - "PvZ2 Gardendless" Usage Agreement
> - Disclaimer and Copyright Notice for "PvZ2 Gardendless"
>
> For the details of the above agreement and statement, please see [here](../instructions/)

<!-- 当前游戏有两种游玩方式：

- 下载游戏客户端压缩包游玩，仅支持 `Windows 10/11`系统。
- 在线游玩：[点击进入](https://pvz2-test.gaozih.com)

> [!info]
> 由于游戏资源文件较多，在线游玩可能会有加载速度较慢及卡顿现象，若需要快速加载，请选择下载游戏客户端压缩包游玩。 -->

This site only provides the latest official version download link<span v-if="gameInfoData?.Version">, The latest game version is {{ gameInfoData.Version }}</span>.

<span v-if="gameInfoData?.Name">The game version name: {{ gameInfoData.Name }}</span>

## Changelog

<template v-if="gameInfoData?.NewFeatures">

- <li v-for="(item, index) in gameInfoData.NewFeatures" :key="index">{{ item }}</li>

</template>

<template v-else>None</template>

<template v-if="gameInfoData?.Download.Onedrive">

## Onedrive Link <Badge text="No login required" type="info" /><Badge text="high-speed" type="tip" /><Badge text="global" type="warning" />

Download Link: <a :href="gameInfoData.Download.Onedrive">click to enter</a>

</template>

<template v-if="gameInfoData?.Download.Mega">

## MEGA Link <Badge text="No login required" type="info" /><Badge text="high-speed" type="tip" /><Badge text="global" type="warning" />

Download Link: <a :href="gameInfoData.Download.Mega">click to enter</a>

</template>

<template v-if="gameInfoData?.Download.TmpLink">

## TmpLink <Badge text="Only in Chinese" type="danger" /><Badge text="No login required" type="info" /><Badge text="high-speed" type="tip" />

Download Link: <a :href="gameInfoData.Download.TmpLink">click to enter</a>

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

<template v-if="gameInfoData?.Download.Feijipan">

## LittlePlane <Badge text="Only in Chinese" type="danger" /><Badge text="No login required" type="info" />

Download Link: <a :href="gameInfoData.Download.Feijipan">click to enter</a>

</template>

<template v-if="gameInfoData?.Download.Github">

## Github

Download Link: <a :href="gameInfoData.Download.Github">click to enter</a>

</template>
