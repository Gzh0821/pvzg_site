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
import { ref, onBeforeMount, onMounted } from 'vue';

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
> 下载游玩时的相关问题 FAQ 请查看[这里](../guide/FAQ.md)，系统要求和推荐配置请查看[这里](../guide/requirement.md)
>
> 想要一个全新的 json 游戏存档文件？点击此处[下载](https://github.com/Gzh0821/pvzg_site/releases/download/0.2.0/pp.json)

> [!warning]
> 请注意：本游戏仅供学习交流使用，不得用于商业用途。
>
> 下载或在线游玩表示您已阅读并同意以下协议和声明：
>
> - 《PvZ2 Gardendless》使用协议
> - 《PvZ2 Gardendless》免责声明
>
> 以上协议和声明的具体内容请查看[这里](../instructions/)

本站只提供最新正式版本的下载链接<span v-if="gameInfoData?.Version">，当前最新的游戏版本为 {{ gameInfoData.Version }}</span>

<span v-if="gameInfoData?.Name">该游戏版本名称: {{ gameInfoData.Name }}</span>

<span v-if="gameInfoData?.Hash?.MD5">MD5: <code>{{ gameInfoData?.Hash?.MD5 }}</code></span>

<span v-if="gameInfoData?.Hash?.SHA256">SHA256: <code>{{ gameInfoData?.Hash?.SHA256 }}</code></span>

## 更新日志

<template v-if="gameInfoData?.NewFeatures">

- <li v-for="(item, index) in gameInfoData.NewFeatures" :key="index">{{ item }}</li>

</template>

<template v-else>暂无</template>

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-7637695321442015"
     data-ad-slot="7113006248"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

<template v-if="gameInfoData?.Download.Github">

## Github <Badge text="无需登录" type="info" /><Badge text="高速" type="tip" /><Badge text="海外" type="warning" />

下载链接：<a :href="gameInfoData.Download.Github">点击进入</a>

</template>

<template v-if="gameInfoData?.Download.Onedrive">

## Onedrive 链接 <Badge text="无需登录" type="info" /><Badge text="高速" type="tip" /><Badge text="海外" type="warning" />

下载链接：<a :href="gameInfoData.Download.Onedrive">点击进入</a>

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
