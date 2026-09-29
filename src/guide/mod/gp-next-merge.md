---
title: 合并
icon: code-merge
pageInfo: false
index: true
order: 3
---

`merge` 只覆盖指定字段，适合调整数值或文字；`replace` 替换整个类型文件，适合完整重做该类型，并需要自行维护完整数据。

## 配置

在 `jsons/config/patching.json`（或 `.json5`）中配置：

```json
{
  "defaultMode": "merge",
  "features": {
    "StoreCommodityFeatures": { "mode": "replace" }
  }
}
```

该配置只将 `StoreCommodityFeatures` 整体替换；其他 Features、Objects 使用 `merge`。省略 `defaultMode` 时默认为 `merge`。类型名写在对应的 `features` 或 `objects` 下。

此配置不控制关卡、语言和地图。关卡使用完整文件；语言补丁深度合并；地图使用[独立格式](./gp-next-worldmap.md)。

## 合并时如何匹配

| 数据 | 条目标识 |
| --- | --- |
| 大多数 Features | `CODENAME` |
| `MintObtainRoute` | `Family` |
| `StoreCommodityFeatures.Plants` / `Upgrade` | `CommodityName` |
| Objects | `aliases[0]` |

匹配后只合并条目内提供的字段。条目内的数组整体替换，不逐项追加；`SEEDCHOOSERDEFAULTORDER` 以及商店的 `Gem`、`Coin`、`Zen` 等整段数组也需提供完整新内容。不要把 Features 按标识匹配的顶层条目数组，与这些字段数组混为一谈。

在“数据”中比较原始值与当前值，确认补丁结果。多个模组修改同一字段时，还需检查[加载顺序](./gp-next-files.md)。
