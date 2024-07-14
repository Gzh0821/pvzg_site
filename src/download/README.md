---
title: 下载链接
index: false
icon: download
pageInfo: false
breadcrumb: false
sidebar: false

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

const data = ref(null);

onBeforeMount(() => {
  axios.get('/jsons/gameinfo.json').then(res => {
    data.value = res.data;
  })
})

</script>

> [!warning]
> 请注意：本页面提供的下载链接仅供学习交流使用，不得用于商业用途，请于下载后 24 小时内删除。
>
> 下载或在线游玩表示您已阅读并同意以下协议和声明：
>
> - 《PvZ2 Gardendless》使用协议
> - 《PvZ2 Gardendless》免责声明
>
> 以上协议和声明的具体内容请查看[这里](../instructions/)。

当前游戏有两种游玩方式：

- 下载游戏客户端压缩包游玩，仅支持 `Windows 10/11`系统。
- 在线游玩：[点击进入](https://pvz2-test.gaozih.com)

> [!info]
> 由于游戏资源文件较多，在线游玩可能会有加载速度较慢及卡顿现象，若需要快速加载，请选择下载游戏客户端压缩包游玩。
>
> 推荐使用 Onedrive 和 Github 下载方式，下载速度较快，且不需要网盘客户端。
>
> Onedrive 和 Github 下载方式可能由于网络环境问题无法访问，请自行搜索解决。

本站只提供最新正式版本的下载链接<span v-if="data?.Version">，当前最新的游戏版本为 {{ data.Version }}</span>。

## Onedrive 链接 <Badge text="推荐" type="tip" />

下载链接：<span v-if="data?.Download.Onedrive">
<a :href="data.Download.Onedrive">点击进入</a>
</span><span v-else>暂无</span>

## 百度网盘

下载链接：<span v-if="data?.Download.Baidu">
<a :href="data.Download.Baidu">点击进入</a>
</span><span v-else>暂无</span>

## 123 网盘链接

下载链接：<span v-if="data?.Download.Pan123">
<a :href="data.Download.Pan123">点击进入</a>
</span><span v-else>暂无</span>

## 夸克网盘链接

下载链接：<span v-if="data?.Download.Quark">
<a :href="data.Download.Quark">点击进入</a>
</span><span v-else>暂无</span>

## Github 链接

下载链接：<span v-if="data?.Download.Github">
<a :href="data.Download.Github">点击进入</a>
</span><span v-else>暂无</span>
