---
title: 每日关卡详情
index: false
article: false
pageInfo: false
comment: false
---

<script setup>
import DailyLevel from '@source/components/daily-level/App.vue';
import { provide, onMounted } from 'vue';

provide("i18nLanguage", "zh");

onMounted(() => {
  (window.adsbygoogle = window.adsbygoogle || []).push({});
})
</script>

> [!important]
> 声明：本页的“每日关卡”来自于社区提交。Gardendless 开发团队不对关卡内容负责，并保留删除、撤回或处理关卡内容的所有权利。

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-2336226859954206"
     data-ad-slot="1822530351"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

<DailyLevel mode="detail" detail-path="/creator-garden/daily-level/detail.html" back-path="/creator-garden/daily-level.html" />
