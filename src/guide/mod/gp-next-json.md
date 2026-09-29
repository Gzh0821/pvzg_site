---
title: 原始数据
icon: file-export
pageInfo: false
index: true
order: 5
---

## 下载原始数据

[游戏 0.15.0 JSON 资源包](/resources/game-json-0.15.0.zip)包含 Features、Objects、关卡和语言数据，来源与校验值见包内 `MANIFEST.json`。这是参考资料，不能作为模组直接安装。

## 从游戏导出

打开 GP-Next 的“数据”，选择类型，再导出原始数据或当前数据。原始数据用于制作补丁；当前数据包含已生效的模组修改，可用于排错。

也可在[控制台](./gp-next-console.md)导出。以下依次导出原始植物属性、当前植物属性和原始语言表：

```js
await gpNext.exportJson('PlantProps', true)
await gpNext.exportJson('PlantProps')
await gpNext.exportLang(true)
```

`exportJson(type, useOriginal, autoDownload)` 的后两个参数默认为 `false`、`true`；关闭 `autoDownload` 可取得返回数据而不弹出保存。

## 选择数据类型

| 要修改的内容 | 参考类型 |
| --- | --- |
| 名称、顺序、卡牌资源 | `Features` |
| 生命、伤害、费用、冷却 | `Props` |
| 图鉴说明 | `Almanac` |
| 商品 | `StoreCommodityFeatures` |
| 通用界面文字 | 语言表 |

找到字段后，按[清单与目录](./gp-next-datapack.md)制作补丁；合并行为见[合并规则](./gp-next-merge.md)。
