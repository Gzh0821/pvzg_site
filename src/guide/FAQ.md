---
title: 常见问题FAQ
icon: question
pageInfo: false
index: true
order: 2
---

<script setup>
    import { onMounted } from 'vue';
    onMounted(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    })
</script>

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-2336226859954206"
     data-ad-slot="1822530351"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

## 下载与更新

从[下载页](../download/)选择平台和版本；运行环境见[系统要求](./requirement.md)。更新前先导出存档，确认新版本进度正常后再删除旧包。

## 存档如何备份和迁移？

游戏主菜单点击玩家名称，可导出存档。不同平台或打包渠道可能使用不同数据目录，不应假定会自动继承；模组自己的数据也需单独保留。详见[文件与备份](./mod/gp-next-files.md)。

## 无法启动、闪退或卡顿怎么办？

先核对安装包和系统要求。若出现 GP-Next 恢复页，按[诊断与恢复](./mod/gp-next-recovery.md)检查；能进入游戏时，可停用可疑模组并按提示重启，导出报告；恢复页也可关闭 JS Modding 或禁用所有模组。卡顿本身不能证明设备不受支持。

## 如何安装模组或制作内容？

玩家从[模组使用指南](./mod/gp-next.md)开始；作者从[数据包](./mod/gp-next-datapack.md)或[官方示例](./mod/gp-next-examples.md)开始。接口与字段见[文档目录](./mod/)。

## 如何导入自定义关卡？

在游戏设置中选择 `Play Local Level` 并打开关卡 JSON。下载与排错见[关卡导入](./seo/level-import.md)；制作关卡见[关卡指南](./level/)。

## 去哪里查植物、僵尸或编辑存档？

使用[在线图鉴](../almanac/)和[实用工具](../useful-tool/)。编辑前备份，并使用当前游戏版本导出的存档。
