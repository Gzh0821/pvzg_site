---
title: GP-Next 简介
icon: toolbox
pageInfo: false
index: true
order: 1
---

> [!tip]
> 本页适用于 官网发布(非网盘链接)的 `0.7.1` 及以上版本。

# GP-Next

GP-Next 是 PvZ2 Gardendless 当前内置的模组、调试与运行时辅助工具，以下能力统一集成在同一个面板中：

- **Patcher**：管理 `packs/`、`patches/`、手动编辑与补丁重载
- **Data**：浏览、对比、导出、还原和编辑游戏内数据
- **Trainer**：在战斗、世界地图和沙盒场景中提供修改器功能
- **Cloud**：云存档上传、下载、比较
- **Settings**：语言、帧率、滚动优化、Runtime Extensions、HP Overlay 等设置
- **Guide / About / Log**：内置文档、控制台命令说明、运行日志

如果你安装的是官网发布版，GP-Next 已经内置在游戏里。进入游戏后按 `F10`，或点击左上角按钮即可打开面板。

## 前提

1. 一个 JSON 编辑器，推荐 VSCode / Notepad++
2. 一点基础 JSON 结构知识

如果你准备修改植物、僵尸、商店或语言，最好同时打开这两页：

- [导出游戏数据参考](./gp-next-json.md)
- [类型与字段参考](./format.md)

## 快速开始

### 1. 打开面板

- 进入游戏
- 按 `F10`
- 打开 **Patcher** 页

### 2. 打开目录

在 **Patcher** 页点击“打开目录”，进入游戏数据目录下的 `gp-next/` 文件夹。

### 3. 创建数据包

最推荐的方式是把修改写进 `packs/你的模组名/pack.json` 和 `jsons/` 目录，而不是直接堆散装 JSON。

### 4. 重载补丁

回到游戏中的 **Patcher** 页，点击 **Save & Reload**，或者重启游戏。

### 5. 验证结果

如果你不确定补丁有没有生效，可以打开 **Data** 页，找到对应条目，直接看当前运行中的数据。

## 接下来读什么

GP-Next 文档已经按主题拆开：

- 先理解 [目录结构与加载优先级](./gp-next-files.md)
- 再理解 [JSON 合并规则](./gp-next-merge.md)
- 然后阅读 [Datapack 与 `pack.json`](./gp-next-datapack.md)

如果你要做翻译包，继续看 [多语言与 `lang.json`](./gp-next-language.md)。

如果你要改世界地图的节点顺序、支线、礼盒、传送门或主图结构，继续看 [地图](./gp-next-worldmap.md)。

如果你更关注游戏内操作而不是文件结构，可以直接阅读：

- [数据面板、手动编辑与 Trainer](./gp-next-tools.md)
- [设置、Runtime Extensions 与辅助功能](./gp-next-settings.md)
- [控制台命令 / API](./gp-next-console.md)

## 关键点

- `packs/` 支持 **文件夹** 和 **`.zip`**
- `patches/` 仍然保留，主要用于兼容旧式单文件补丁
- Data 页的手动修改会写到 `__gpn_edits/`，并且优先级最高
- 数组字段在 GP-Next 中默认是**整体替换**，不是按索引合并
- `reloadPatches()` 通常足够让大多数运行时扩展重新生效，不一定必须重启
- 页脚会显示 GP-Next 版本，并能检查官网是否有更新

如果你还不知道某个类型的原始 JSON 长什么样，先去看 [导出游戏数据参考](./gp-next-json.md)。那一页更适合在动手前先查结构，再回来看具体字段。

## 下一步

- [目录结构与加载优先级](./gp-next-files.md)
- [JSON 合并规则](./gp-next-merge.md)
- [Datapack 与 `pack.json`](./gp-next-datapack.md)
- [地图](./gp-next-worldmap.md)
