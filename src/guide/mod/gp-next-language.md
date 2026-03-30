---
title: 语言包
icon: language
pageInfo: false
index: true
order: 5
---

# 语言包与 `lang.json`

如果你希望一个模组同时支持中文、英文、西语、俄语或其他语言，可以使用语言包。

## 目录

```text
MyFirstMod/
├── pack.json
└── jsons/
    └── lang/
        └── lang.json
```

也可以使用 `lang.json5`。

## 最小示例

```json
{
  "_languages": [
    { "code": "es", "name": "Español", "isCJK": false },
    { "code": "ru", "name": "Русский", "isCJK": false }
  ],
  "LoadingTips": [
    {
      "en": "Sun is your core resource.",
      "zh": "阳光是你的核心资源。",
      "es": "El sol es tu recurso principal.",
      "ru": "Солнце - ваш основной ресурс."
    }
  ]
}
```

## `_languages`

这是一个可选字段，用来向游戏注册额外语言。

每一项通常包含：

- `code`：语言代码，例如 `es`、`ru`、`ja`
- `name`：在设置页显示的名字
- `isCJK`：是否按 CJK 文本宽度规则处理

## 文本节点

在同一个文本条目里并列写多个语言字段即可，例如：

- `en`
- `zh`
- `es`
- `ru`

## 生效步骤

1. 把语言包放进 `gp-next/packs/`
2. 回到游戏打开 **Patcher**
3. 点击 **Save & Reload**
4. 去游戏设置里切换语言
5. 回到对应界面验证文本

## 与其他补丁的关系

`lang.json` 和其它补丁一样，也支持深度合并。

这意味着：

- 你不需要复制整份语言表
- 只需要提供你想覆盖的文本节点

## 其他可翻译位置

如果别的 patch JSON 本身就包含多语言结构，例如：

- `PlantAlmanac`
- 某些商店显示名
- 某些 Features 名称字段

那你也可以直接在这些文件里加入更多语言字段。

## 写语言包时要注意的事

- 语言代码尽量使用标准代码
- 先确认默认 `en` / `zh` 没写错
- 新增语言时，先从少量文本开始测试

## 下一步

- [数据面板、手动编辑与 Trainer](./gp-next-tools.md)
- [设置、Runtime Extensions 与辅助功能](./gp-next-settings.md)
