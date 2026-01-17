---
title: Tải Xuống
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
  });
})
onMounted(() => {
  (window.adsbygoogle = window.adsbygoogle || []).push({});
})
</script>

> [!important]
> Các câu hỏi thường gặp về tải và chơi game xem [tại đây](../guide/FAQ.md). Cấu hình máy khuyến nghị xem [tại đây](../guide/requirement.md).
>
> Phiên bản website và phiên bản từ nhóm QQ/netdisk Trung Quốc dùng cách đóng gói khác nhau, file save sẽ KHÔNG tự động chuyển qua được nha.

> [!warning]
> **Lưu ý:** Link tải trên trang này chỉ dành cho mục đích học tập và giao lưu, KHÔNG được dùng cho mục đích thương mại.
>
> Việc tải xuống hoặc chơi online đồng nghĩa bạn đã đọc và đồng ý các điều khoản sau:
>
> - Thỏa thuận Người dùng và Tuyên bố Miễn trừ Trách nhiệm của "PvZ2 Gardendless"
>
> Chi tiết các điều khoản xem [tại đây](../instructions/)

<span v-if="gameInfoData?.Version">Phiên bản game mới nhất: {{ gameInfoData.Version }}</span>

<span v-if="gameInfoData?.Name">Tên phiên bản: {{ gameInfoData.Name }}</span>

<span v-if="gameInfoData?.Hash?.MD5">MD5: <code>{{ gameInfoData?.Hash?.MD5 }}</code></span>

<span v-if="gameInfoData?.Hash?.SHA256">SHA256: <code>{{ gameInfoData?.Hash?.SHA256 }}</code></span>

## Có gì mới

<template v-if="gameInfoData?.EnNewFeatures">

- <li v-for="(item, index) in gameInfoData.EnNewFeatures" :key="index">{{ item }}</li>

</template>

<template v-else>Chưa có</template>

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-2336226859954206"
     data-ad-slot="6758794743"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

## ::brands:windows:: Nền tảng Windows

<template v-if="gameInfoData?.Download.Github">

### Github ::brands:github::

Link tải: <a :href="gameInfoData.Download.Github" target="_blank">nhấn vào đây</a>

</template>

<template v-if="gameInfoData?.Download.Storage">

### Tải trực tiếp ::cloud-arrow-down::

Link tải: <a :href="gameInfoData.Download.Storage" target="_blank">nhấn vào đây</a>

</template>

<template v-if="gameInfoData?.Download.Baidu">

### Baidu Netdisk ::cloud::
Link tải: <a :href="gameInfoData.Download.Baidu" target="_blank">nhấn vào đây</a>

</template>

<template v-if="gameInfoData?.Download.Pan123">

### 123Pan ::cloud::

Link tải: <a :href="gameInfoData.Download.Pan123" target="_blank">nhấn vào đây</a>

</template>

<template v-if="gameInfoData?.Download.Quark">

### Quark ::cloud::

Link tải: <a :href="gameInfoData.Download.Quark" target="_blank">nhấn vào đây</a>

</template>

## ::brands:linux:: Linux và các nền tảng khác

> [!info]
> Để chơi trên Linux và các hệ thống x86_64 (amd64), bạn có thể dùng Docker image để deploy phiên bản web local.
>
> **Mẹo cho Linux users:** Cách ez nhất là dùng Docker, chạy một dòng lệnh là xong, không cần setup phức tạp!

### Docker Hub ::brands:docker::

Địa chỉ image: <a href="https://hub.docker.com/r/gaozih/pvzge" target="_blank">nhấn vào đây</a>

**Chạy nhanh:**
```bash
docker pull gaozih/pvzge:latest
docker run -d -p 8080:8080 gaozih/pvzge
# Mở trình duyệt tại http://localhost:8080
```

## ::clock-rotate-left:: Các phiên bản cũ

Tất cả phiên bản cũ có thể tải từ [Github Release](https://github.com/Gzh0821/pvzg_site/releases)
