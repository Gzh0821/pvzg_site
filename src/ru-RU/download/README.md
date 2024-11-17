---
title: Скачивание
index: false
icon: download
pageInfo: false
breadcrumb: false
sidebar: false
comment: false

category:
  - Скачивание
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
> Ответы на часто задаваемые вопросы, связанные со скачиванием и запуском, пожалуйста, смотрите [здесь](../guide/FAQ.md), а информацию о системных требованиях и рекомендуемых конфигурациях смотрите [тут](../guide/requirement.md)

> [!warning]
> Пожалуйста, обратите внимание: ссылка на скачивание, указанная на этой странице, предназначена только для ознакомления и коммуникации и не может быть использована в коммерческих целях.
>
> Загрузка или воспроизведение онлайн означает, что вы прочитали и согласились со следующими соглашениями и заявлениями:
>
> - Пользовательское соглашение "PvZ2 Gardendless"
> - Отказ от ответственности и уведомление об авторских правах для "PvZ2 Gardendless"
>
> Для получения подробной информации о вышеуказанном соглашении и заявлении, пожалуйста, ознакомьтесь с [этим](../instructions/)

<!-- 当前游戏有两种游玩方式：

- 下载游戏客户端压缩包游玩，仅支持 `Windows 10/11`系统。
- 在线游玩：[点击进入](https://pvz2-test.gaozih.com)

> [!info]
> 由于游戏资源文件较多，在线游玩可能会有加载速度较慢及卡顿现象，若需要快速加载，请选择下载游戏客户端压缩包游玩。 -->

Этот сайт предоставляет ссылку для скачивания только последней официальной версии<span v-if="gameInfoData?.Version">, Последняя версия игры - это {{ gameInfoData.Version }}</span>.

<span v-if="gameInfoData?.Name"> Название версии игры: {{ gameInfoData.Name }}</span>

<span v-if="gameInfoData?.Hash?.MD5">MD5: <code>{{ gameInfoData?.Hash?.MD5 }}</code></span>

<span v-if="gameInfoData?.Hash?.SHA256">SHA256: <code>{{ gameInfoData?.Hash?.SHA256 }}</code></span>

## Журнал изменений

<template v-if="gameInfoData?.EnNewFeatures">

- <li v-for="(item, index) in gameInfoData.EnNewFeatures" :key="index">{{ item }}</li>

</template>

<template v-else>None</template>

<template v-if="gameInfoData?.Download.Github">

## Github <Badge text="не требует входа" type="info" /><Badge text="Высокая скорость" type="tip" /><Badge text="Доступен для всех" type="warning" />

Ссылка для скачивания: <a :href="gameInfoData.Download.Github">нажмите чтобы открыть</a>

</template>

<template v-if="gameInfoData?.Download.Onedrive">

## Ссылка Onedrive <Badge text="не требует входа" type="info" /><Badge text="Высокая скорость" type="tip" /><Badge text="Доступен для всех" type="warning" />

Ссылка для скачивания: <a :href="gameInfoData.Download.Onedrive">нажмите чтобы открыть</a>

</template>

<template v-if="gameInfoData?.Download.Mega">

## Cсылка MEGA <Badge text="не требует входа" type="info" /><Badge text="Высокая скорость" type="tip" /><Badge text="Доступен для всех" type="warning" />

Ссылка для скачивания: <a :href="gameInfoData.Download.Mega">нажмите чтобы открыть</a>

</template>

<template v-if="gameInfoData?.Download.TmpLink">

## TmpLink <Badge text="Только в Китае" type="danger" /><Badge text="не требует входа" type="info" /><Badge text="Высокая скорость" type="tip" />

Ссылка для скачивание: <a :href="gameInfoData.Download.TmpLink">нажмите чтобы открыть</a>

</template>

<template v-if="gameInfoData?.Download.Baidu">

## Baidu Netdisk<Badge text="Только в Китае" type="danger" />

Ссылка для скачивания: <a :href="gameInfoData.Download.Baidu">нажмите чтобы открыть</a>

</template>

<template v-if="gameInfoData?.Download.Pan123">

## 123Pan <Badge text="Только в Китае" type="danger" />

Ссылка для скачивания: <a :href="gameInfoData.Download.Pan123">нажмите чтобы открыть</a>

</template>

<template v-if="gameInfoData?.Download.Quark">

## Quark <Badge text="Только в Китае" type="danger" />

Ссылка для скачивания: <a :href="gameInfoData.Download.Quark">нажмите чтобы открыть</a>

</template>

<template v-if="gameInfoData?.Download.Feijipan">

## LittlePlane <Badge text="Только в Китае" type="danger" /><Badge text="не требует входа" type="info" />

Ссылка для скачивания: <a :href="gameInfoData.Download.Feijipan">нажмите чтобы открыть</a>

</template>
