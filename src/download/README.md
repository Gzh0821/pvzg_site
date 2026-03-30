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
const gpNextInfoData = ref(null);
onBeforeMount(() => {
  axios.get('/jsons/gameinfo.json').then(res => {
    gameInfoData.value = res.data;
  });
  axios.get('/jsons/gp-next-info.json').then(res => {
    gpNextInfoData.value = res.data;
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
> - 《PvZ2 Gardendless》用户协议与免责声明
>
> 以上协议和声明的具体内容请查看[这里](../instructions/)

<span v-if="gameInfoData?.Version">当前最新的游戏版本为 {{ gameInfoData.Version }}</span>

<span v-if="gameInfoData?.Name">该游戏版本名称: {{ gameInfoData.Name }}</span>

<span v-if="gameInfoData?.Hash?.MD5">MD5: <code>{{ gameInfoData?.Hash?.MD5 }}</code></span>

<span v-if="gameInfoData?.Hash?.SHA256">SHA256: <code>{{ gameInfoData?.Hash?.SHA256 }}</code></span>

<span v-if="gpNextInfoData?.version">最新的 GP-Next 工具版本为 {{ gpNextInfoData.version }}</span>

## 下载后下一步推荐

- 新手问题排查：[FAQ](../guide/FAQ.md)
- 系统要求与推荐配置：[推荐配置](../guide/requirement.md)
- 查植物与僵尸信息：[在线图鉴](../almanac/)
- 学习打补丁与多语言：[MOD 教程](../guide/mod/)
- 下载社区/官方关卡：[创意花园](../creator-garden/)

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

## ::brands:apple:: macOS 平台

> [!warning]
> 该版本仅支持 Apple Silicon (arm64) 设备，且需要 macOS 11.0 及以上系统。如果 macOS 提示“XXX 已损坏，无法打开。您应该将它移到废纸篓。”，可按以下步骤处理：
>
> 1. 先在终端输入（不要立即执行）：<code>sudo xattr -r -d com.apple.quarantine </code>
> 2. 将游戏程序拖拽到终端窗口，让系统自动补全应用路径。
> 3. 确认路径无误后按回车执行。
>
> 若仍无法打开，可在“系统设置 > 隐私与安全性”中允许该应用后再试。

<template v-if="gameInfoData?.MacOSDownload?.Storage">

### 本地下载 ::cloud-arrow-down::

下载链接：<a :href="gameInfoData.MacOSDownload.Storage" target="_blank">点击进入</a>

</template>

## ::brands:linux:: Linux/其它平台

> [!info]
> 要在 x86_64(amd64)架构的 Linux 和其它系统上游玩，可以使用 Docker 镜像在本地部署 Web 版本。

### Docker Hub ::brands:docker::

镜像地址：<a href="https://hub.docker.com/r/gaozih/pvzge" target="_blank">点击进入</a>

## ::clock-rotate-left:: 历史版本

所有历史版本和`JSON`资源文件均可在 [Github Release](https://github.com/Gzh0821/pvzg_site/releases) 中下载
