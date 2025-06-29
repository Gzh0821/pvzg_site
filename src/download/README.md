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
> 本游戏的官网版本与 QQ 群/国内网盘版本使用了不同的打包方式，存档不会自动继承。

> [!warning]
> 请注意：本游戏仅供学习交流使用，不得用于商业用途。
>
> 下载或在线游玩表示您已阅读并同意以下协议和声明：
>
> - 《PvZ2 Gardendless》使用协议
> - 《PvZ2 Gardendless》免责声明
>
> 以上协议和声明的具体内容请查看[这里](../instructions/)

<span v-if="gameInfoData?.Version">当前最新的游戏版本为 {{ gameInfoData.Version }}</span>

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

## ::brands:windows:: Windows 平台

<template v-if="gameInfoData?.Download.Github">

### Github ::brands:github::

下载链接：<a :href="gameInfoData.Download.Github" target="_blank">点击进入</a>

</template>

<template v-if="gameInfoData?.Download.Storage">

### 本地下载 ::cloud-arrow-down::

下载链接：<a :href="gameInfoData.Download.Storage" target="_blank">点击进入</a>

</template>

<template v-if="gameInfoData?.Download.Baidu">

### 百度网盘 ::cloud::

下载链接：<a :href="gameInfoData.Download.Baidu" target="_blank">点击进入</a>

</template>

<template v-if="gameInfoData?.Download.Pan123" target="_blank">

### 123 网盘 ::cloud::

下载链接：<a :href="gameInfoData.Download.Pan123" target="_blank">点击进入</a>

</template>

<template v-if="gameInfoData?.Download.Quark">

### 夸克网盘 ::cloud::

下载链接：<a :href="gameInfoData.Download.Quark" target="_blank">点击进入</a>

</template>

## ::brands:linux:: Linux/其它平台

> [!info]
> 要在 x86_64(amd64)架构的 Linux 和其它系统上游玩，可以使用 Docker 镜像在本地部署 Web 版本。

### Docker Hub ::brands:docker::

镜像地址：<a href="https://hub.docker.com/r/gaozih/pvzge" target="_blank">点击进入</a>

## ::clock-rotate-left:: 历史版本/资源文件

所有历史版本和`JSON`资源文件均可在 [GE Drive](https://drive.pvzge.com/) 中下载
