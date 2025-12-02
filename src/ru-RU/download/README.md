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
  });
})
onMounted(() => {
  (window.adsbygoogle = window.adsbygoogle || []).push({});
})
</script>

> [!important]
> Ответы на часто задаваемые вопросы, связанные со скачиванием и запуском, пожалуйста, смотрите [здесь](../guide/FAQ.md), а информацию о системных требованиях и рекомендуемых конфигурациях смотрите [тут](../guide/requirement.md)
>
> Официальная версия на сайте и версия QQ group/китайский сетевой диск этой игры используют разные методы упаковки, и файлы сохранения не будут автоматически унаследованы.

> [!warning]
> Пожалуйста, обратите внимание: Эта игра предназначена только для изучения и общения, не должна использоваться в коммерческих целях.
>
> Загрузка или воспроизведение онлайн означает, что вы прочитали и согласились со следующими соглашениями и заявлениями:
>
> - Пользовательское соглашение "PvZ2 Gardendless"
> - Отказ от ответственности "PvZ2 Gardendless"
>
> Для получения подробной информации о вышеуказанном соглашении и заявлении, пожалуйста, ознакомьтесь с [этим](../instructions/)

<span v-if="gameInfoData?.Version">Текущая последняя версия игры {{ gameInfoData.Version }}</span>

<span v-if="gameInfoData?.Name">Название этой версии игры: {{ gameInfoData.Name }}</span>

<span v-if="gameInfoData?.Hash?.MD5">MD5: <code>{{ gameInfoData?.Hash?.MD5 }}</code></span>

<span v-if="gameInfoData?.Hash?.SHA256">SHA256: <code>{{ gameInfoData?.Hash?.SHA256 }}</code></span>

## Журнал обновлений

<template v-if="gameInfoData?.EnNewFeatures">

- <li v-for="(item, index) in gameInfoData.EnNewFeatures" :key="index">{{ item }}</li>

</template>

<template v-else>Временно недоступно</template>

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-2336226859954206"
     data-ad-slot="6758794743"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

## ::brands:windows:: Платформа Windows

<template v-if="gameInfoData?.Download.Github">

### Github ::brands:github::

Ссылка для скачивания: <a :href="gameInfoData.Download.Github" target="_blank">нажмите чтобы открыть</a>

</template>

<template v-if="gameInfoData?.Download.Storage">

### Локальная загрузка ::cloud-arrow-down::

Ссылка для скачивания: <a :href="gameInfoData.Download.Storage" target="_blank">нажмите чтобы открыть</a>

</template>

<template v-if="gameInfoData?.Download.Baidu">

### Baidu Netdisk ::cloud::

Ссылка для скачивания: <a :href="gameInfoData.Download.Baidu" target="_blank">нажмите чтобы открыть</a>

</template>

<template v-if="gameInfoData?.Download.Pan123">

### 123 Pan ::cloud::

Ссылка для скачивания: <a :href="gameInfoData.Download.Pan123" target="_blank">нажмите чтобы открыть</a>

</template>

<template v-if="gameInfoData?.Download.Quark">

### Quark Netdisk ::cloud::

Ссылка для скачивания: <a :href="gameInfoData.Download.Quark" target="_blank">нажмите чтобы открыть</a>

</template>

## ::brands:linux:: Linux/Другие платформы

> [!info]
> Для игры на Linux и других системах с архитектурой x86_64 (amd64) можно использовать образы Docker для локального развертывания веб-версии.

### Docker Hub ::brands:docker::

Адрес образа: <a href="https://hub.docker.com/r/gaozih/pvzge" target="_blank">нажмите для входа</a>

## ::clock-rotate-left:: Исторические версии/Файлы ресурсов

Все исторические версии и файлы ресурсов `JSON` можно загрузить с [GE Drive](https://drive.pvzge.com/)
