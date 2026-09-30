---
title: 官方示例模组
icon: toolbox
pageInfo: false
index: true
order: 13
---

## 下载与安装

适用于游戏 **0.15.0** 和 GP-Next **1.5.2**。下载并安装全部三个包：

| 下载 | 用途 |
| --- | --- |
| [pvzge.entities.zip](/downloads/mods/pvzge.entities.zip) | 官方实体框架，负责资源读取与原生类型注册 |
| [example.entity-framework.zip](/downloads/mods/example.entity-framework.zip) | 示例植物和僵尸的行为 |
| [example.entity-content.zip](/downloads/mods/example.entity-content.zip) | 脉冲三角、菱形行者及独立图片、动画和声音 |

先在“实验性 → JS Modding”确认风险并开启 JavaScript，再在“模组”依次导入框架、行为、内容三个 ZIP，启用全部三个包，再按提示重启。可在图鉴和沙盒中找到脉冲三角与菱形行者。内容包本身不含 JS，但依赖的框架和行为包需要 JS。

## 从示例制作自己的内容

解压内容包，在 `content/entities.json` 修改实体的 `feature`、`properties`、图鉴和资源引用。替换 PNG、DragonBones 5.5 骨骼与贴图描述或 WAV 时，同时保持描述中的路径一致。

发布独立作品时更换 `pack.json` 的 `uuid`；更新同一作品时保留 `uuid` 和实体 `id`，增加版本号。只改属性或融合配方不需要新增 JS；改变行为时再修改行为包的 `scripts/main.js`。重新压缩时让 `pack.json` 位于 ZIP 根目录，重新导入并按提示重启。

这套框架使用自己的 `content/entities.json` 格式，不是所有 GP-Next 模组都必须采用的格式。卸载或停用前先备份；存档引用这些植物或僵尸时，需要恢复相应内容包才能正常读取。

[植物融合配方](./gp-next-fusion.md) · [资源与启动注册](./gp-next-resources.md)

