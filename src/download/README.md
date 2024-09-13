---
title: 下载链接
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
import { ref, onBeforeMount } from 'vue';

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
> 下载游玩时的相关问题 FAQ 请查看[这里](../guide/FAQ.md)，系统要求和推荐配置请查看[这里](../guide/requirement.md)

> [!warning]
> 请注意：本页面提供的下载链接仅供学习交流使用，不得用于商业用途，请于下载后 24 小时内删除。
>
> 下载或在线游玩表示您已阅读并同意以下协议和声明：
>
> - 《PvZ2 Gardendless》使用协议
> - 《PvZ2 Gardendless》免责声明
>
> 以上协议和声明的具体内容请查看[这里](../instructions/)

<!-- 当前游戏有两种游玩方式：

- 下载游戏客户端压缩包游玩，仅支持 `Windows 10/11`系统。
- 在线游玩：[点击进入](https://pvz2-test.gaozih.com)

> [!info]
> 由于游戏资源文件较多，在线游玩可能会有加载速度较慢及卡顿现象，若需要快速加载，请选择下载游戏客户端压缩包游玩。 -->

本站只提供最新正式版本的下载链接<span v-if="gameInfoData?.Version">，当前最新的游戏版本为 {{ gameInfoData.Version }}</span>

<span v-if="gameInfoData?.Name">该游戏版本名称: {{ gameInfoData.Name }}</span>

<span v-if="gameInfoData?.Hash?.MD5">MD5: <code>{{ gameInfoData?.Hash?.MD5 }}</code></span>

<span v-if="gameInfoData?.Hash?.SHA256">SHA256: <code>{{ gameInfoData?.Hash?.SHA256 }}</code></span>

## 更新日志

<template v-if="gameInfoData?.NewFeatures">

- <li v-for="(item, index) in gameInfoData.NewFeatures" :key="index">{{ item }}</li>

</template>

<template v-else>暂无</template>

<template v-if="gameInfoData?.Download.Github">

## Github <Badge text="无需登录" type="info" /><Badge text="高速" type="tip" /><Badge text="海外" type="warning" />

下载链接：<a :href="gameInfoData.Download.Github">点击进入</a>

</template>

<template v-if="gameInfoData?.Download.Onedrive">

## Onedrive 链接 <Badge text="无需登录" type="info" /><Badge text="高速" type="tip" /><Badge text="海外" type="warning" />

下载链接：<a :href="gameInfoData.Download.Onedrive">点击进入</a>

</template>

<template v-if="gameInfoData?.Download.TmpLink">

## 钛盘链接 <Badge text="无需登录" type="info" /><Badge text="高速" type="tip" />

下载链接：<a :href="gameInfoData.Download.TmpLink">点击进入</a>

</template>

<template v-if="gameInfoData?.Download.Baidu">

## 百度网盘

下载链接：<a :href="gameInfoData.Download.Baidu">点击进入</a>

</template>

<template v-if="gameInfoData?.Download.Pan123">

## 123 网盘

下载链接：<a :href="gameInfoData.Download.Pan123">点击进入</a>

</template>

<template v-if="gameInfoData?.Download.Quark">

## 夸克网盘

下载链接：<a :href="gameInfoData.Download.Quark">点击进入</a>

</template>

<template v-if="gameInfoData?.Download.Mega">

## MEGA 网盘 <Badge text="无需登录" type="info" /><Badge text="高速" type="tip" /><Badge text="海外" type="warning" />

下载链接：<a :href="gameInfoData.Download.Mega">点击进入</a>

</template>

<template v-if="gameInfoData?.Download.Feijipan">

## 小飞机网盘 <Badge text="无需登录" type="info" />

下载链接：<a :href="gameInfoData.Download.Feijipan">点击进入</a>

</template>