---
title: 控制台命令
icon: toolbox
pageInfo: false
index: true
order: 8
---

# 控制台命令

游戏加载完成后按 **F12**，切换到开发者工具的 **Console**。只需要安装纯 JSON 模组的玩家不用执行命令。

## JavaScript 模组开关

```js
await gpNext.mods.enableJsModding()
```

开启后按提示应用或重启。关闭：

```js
await gpNext.mods.disableJsModding()
```

只运行可信来源的模组。JS 不会因为导入一个 ZIP 就自动开启。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `gpNext.help()` | 列出当前可用命令 |
| `gpNext.version` | 查看 GP-Next 版本 |
| `gpNext.show()` / `gpNext.hide()` / `gpNext.toggle()` | 打开、关闭或切换侧栏 |
| `gpNext.status()` | 查看补丁状态 |
| `gpNext.mods.status()` | 查看脚本模组状态 |
| `await gpNext.reload()` | 检查并重新应用配置；按返回提示处理重启 |
| `gpNext.exportJson('PlantFeatures', true)` | 导出原始植物特征数据 |
| `await gpNext.exportLevel('关卡编号')` | 导出指定关卡 |
| `gpNext.exportLang(true)` | 导出原始语言数据 |
| `gpNext.setFrameRate(30)` | 设置目标帧率 |

旧版指南中的 `gpNext.setGameSpeed()` 当前不可用。加速请使用“工具”中的 1×／1.5×。

编写模组时使用传入 `setup(ctx)` 的 API，见[作者入门](./gp-next-js.md)和[API 文档](./gp-next-api.md)。
