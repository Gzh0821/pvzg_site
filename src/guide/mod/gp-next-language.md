---
title: 语言包
icon: language
pageInfo: false
index: true
order: 5
---

在数据包中创建 `jsons/lang/lang.json` 或 `.json5`，以原始语言表中的文本节点为键，提供需要覆盖的语言字段。

```json
{
  "_languages": [{ "code": "es", "name": "Español", "isCJK": false }],
  "LoadingTips": [{
    "en": "Sun is your core resource.",
    "zh": "阳光是你的核心资源。",
    "es": "El sol es tu recurso principal."
  }]
}
```

`_languages` 用于注册额外语言：`code` 是语言代码，`name` 是游戏设置中显示的名称，`isCJK` 控制文本宽度规则。只修改已有语言时可省略它。

语言对象深度合并，数组整体替换；示例中的 `LoadingTips` 会替换该提示列表，实际使用时应保留需要的其他条目。名称或图鉴中的多语言字段也可在对应 Features、Almanac 补丁中修改。

按[模组安装流程](./gp-next.md)导入并应用，然后在游戏自己的设置中切换语言。GP-Next 面板语言与游戏文字语言分别设置。原始文本和键名可从[游戏数据](./gp-next-json.md)导出。
