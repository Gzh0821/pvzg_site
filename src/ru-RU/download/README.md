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

Этот сайт предоставляет ссылку для скачивания только последней официальной версии<span v-if="gameInfoData?.Version">, Последняя версия игры - это {{ gameInfoData.Version }}</span>.

<span v-if="gameInfoData?.Name"> Название версии игры: {{ gameInfoData.Name }}</span>

<span v-if="gameInfoData?.Hash?.MD5">MD5: <code>{{ gameInfoData?.Hash?.MD5 }}</code></span>

<span v-if="gameInfoData?.Hash?.SHA256">SHA256: <code>{{ gameInfoData?.Hash?.SHA256 }}</code></span>

## Журнал изменений

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

## Github <Badge text="не требует входа" type="info" /><Badge text="Высокая скорость" type="tip" /><Badge text="Доступен для всех" type="warning" />

Ссылка для скачивания: <a :href="gameInfoData.Download.Github">нажмите чтобы открыть</a>

</template>

<template v-if="gameInfoData?.Download.Onedrive">

## Ссылка Onedrive <Badge text="не требует входа" type="info" /><Badge text="Высокая скорость" type="tip" /><Badge text="Доступен для всех" type="warning" />

Ссылка для скачивания: <a :href="gameInfoData.Download.Onedrive">нажмите чтобы открыть</a>

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
