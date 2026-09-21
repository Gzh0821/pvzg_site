---
title: 模组文件与清单
icon: toolbox
pageInfo: false
index: true
order: 4
---

# 模组文件与清单

## 只修改数据

```text
my-mod/
├── pack.json
└── jsons/
    └── features/
        └── PlantFeatures.json
```

`pack.json`：

```json
{
  "uuid": "yourname.balance",
  "name": "我的数值调整",
  "version": "1.0.0",
  "packFormatVersion": 1
}
```

`jsons/features/PlantFeatures.json`：

```json
{
  "PLANTS": [
    { "CODENAME": "peashooter", "BOOST": 3 }
  ]
}
```

将 `pack.json` 和 `jsons` 一起压缩为 ZIP，导入游戏即可。只创建用到的目录；先从一项修改开始，在“数据”页确认结果。

## 文件位置

| 内容 | 包内位置 |
| --- | --- |
| 特征数据 | `jsons/features/类型名.json` |
| 属性和对象数据 | `jsons/objects/类型名.json` |
| 关卡 | `jsons/levels/关卡名.json` |
| 翻译 | `jsons/lang/lang.json` |
| 文件合并方式 | `jsons/config/patching.json` |
| 实验性地图 | `jsons/worldmap/gpn-worldmap.json` |
| 实验性植物等级 | `jsons/extensions/plant-levels.json` |
| JS 入口 | `scripts/main.js`，或 `js.entry` 指定的位置 |
| 封面 | 根目录 `thumbnail.png` 或 `thumbnail.ico` |

数据补丁也可使用 `.json5`。资源文件的目录由模组作者或其前置约定。

## 清单字段

| 字段 | 要求／用途 |
| --- | --- |
| `uuid` | 必填，模组唯一标识，更新时保持不变；不能有首尾空格或以 `legacy:` 开头。JS 模组使用 3–128 位字母、数字、点、下划线、连字符，首位为字母或数字 |
| `name` | 建议填写，玩家看到的名称 |
| `version` | 建议填写模组版本，省略默认 `1.0.0`；预发布建议 `1.0.0-pre.1` |
| `packFormatVersion` | 当前只支持 `1`，省略默认 `1`，建议明确填写 |
| `apiVersion` | JS 模组必填 `2`；纯 JSON 不需要 |
| `js.entry` | 单个 `.js`／`.mjs` 入口；存在 `scripts/main.js` 时可自动识别 |
| `js.startup` | 启动注册模组设为 `true` |
| `js.reloadable` | 需要重启的模组建议设为 `false` |
| `depends` | 必需前置的 uuid 字符串数组 |
| `optionalDepends` | 可选前置的 uuid 字符串数组 |
| `minGpNextVersion` / `maxGpNextVersion` | GP-Next 最低／最高版本，填写版本号，不写 `>=` 等表达式 |
| `author` / `description` | 作者与简短用途说明，可省略 |
| `priority` | 未指定用户排序时的初始顺序，可省略 |

例如依赖两个前置：`"depends": ["author.library", "author.behavior"]`。使用预发布功能时，最低版本写 `1.5.0-pre.1`；写 `1.5.0` 会要求正式版。

旧示例中的 `gameVersion`、`gpNextVersion` 不是上述兼容性限制字段，不要用它们替代 `minGpNextVersion`。

[合并规则](./gp-next-merge.md) · [字段参考](./format.md) · [JS 模组](./gp-next-js.md)
