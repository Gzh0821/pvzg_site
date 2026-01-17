---
title: Chỉnh sửa Save
index: true
order: 2
icon: floppy-disk
pageInfo: false
comment: false
toc: false
prev: false
next: false
---

<script setup>
    import Editor from '@source/components/save-editor/App.vue';
    import { provide } from 'vue';
    import { onMounted } from 'vue';
    provide("i18nLanguage",'en');

    onMounted(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    })
</script>

> [!warning]
> Công cụ chỉnh sửa save đang trong giai đoạn thử nghiệm. Sử dụng có thể gây ra lỗi không mong muốn trong file save. Hãy **backup file save gốc** trước khi dùng nhé!
>
> Để đảm bảo đồng bộ phiên bản save, vui lòng sử dụng file save được xuất từ phiên bản game mới nhất. Nếu bạn đang dùng save từ phiên bản cũ, hãy import vào game mới nhất rồi xuất ra trước khi chỉnh sửa.
>
> Bạn có thể tìm `plantID` của từng cây trong [Almanac](../almanac/).
>
> Công cụ này sẽ không chỉnh sửa dữ liệu save không xuất hiện bên dưới.

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-2336226859954206"
     data-ad-slot="6758794743"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

<Editor />
