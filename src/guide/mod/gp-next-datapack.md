---
title: 模组文件与清单
icon: toolbox
pageInfo: false
index: true
order: 4
---

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
| `gpNextVersion` | 推荐的 GP-Next 兼容范围，可省略；如 `^1.5.0` |
| `minGpNextVersion` / `maxGpNextVersion` | 旧的包含端点的版本边界；仅在没有 `gpNextVersion` 时使用 |
| `author` / `description` | 作者与简短用途说明，可省略 |
| `priority` | 未指定用户排序时的初始顺序，可省略 |

例如依赖两个前置：`"depends": ["author.library", "author.behavior"]`。

## GP-Next 版本兼容性

推荐使用单个字段，例如 `"gpNextVersion": "^1.5.0"`。数据包和 JS 模组使用相同规则。

| 写法 | 正式版范围 |
| --- | --- |
| `^1.5.0` | `>=1.5.0 <2.0.0` |
| `~1.5.0` | `>=1.5.0 <1.6.0` |
| `>=1.5.0 <2.0.0` | 同时满足上下界 |
| `1.5.x` | 任意 `1.5` 正式版 |
| `^1.5.0 \|\| ^2.0.0` | 满足任一范围 |
| `>=1.5.0, <2.0.0, !=1.5.2` | 排除指定版本 |
| `==1.5.0` | 精确版本 |
| `~=1.5.0` / `~=1.5` | `>=1.5.0 <1.6.0` / `>=1.5.0 <2.0.0` |

支持 npm SemVer 范围和 Python 风格的逗号（且）、`==`、`!=`、`~=`，不是完整 PEP 440；不支持 epoch、`.dev`、`.post` 或 `===`。`==1.5` 表示精确 `1.5.0`，而 npm 裸范围 `1.5` 表示 `1.5.x`。注意 `~=1.5` 与 `~1.5` 的上界不同。

- 清单中只要存在 `gpNextVersion`，就忽略旧 min/max；没有新字段时才检查旧边界。都省略则不提示。
- 旧 min/max 填纯版本号，包含上下界，不填写范围表达式。
- 不匹配、空的新字段、错误类型或无效表达式都只提示“可能不兼容”，不会阻止安装或加载；新字段无效也不回退到旧字段。
- 新范围默认不接纳预发布版。例如 `^1.5.0` 不匹配 `1.6.0-pre.1`；`^1.5.0-pre.1` 可匹配 `1.5.0-pre.2`，但不自动接纳 `1.6.0-pre.1`。旧 min/max 保留原有的包含端点比较规则。

例如同时填写 `"gpNextVersion": "^1.5.0"` 与 `"maxGpNextVersion": "1.4.9"`，当前 `1.5.1` 按新字段匹配，不会因旧上限警告。版本警告可在导入预览和模组详情中查看；API 版本、清单格式、依赖及必需功能仍分别校验。

[合并规则](./gp-next-merge.md) · [字段参考](./format.md) · [JS 模组](./gp-next-js.md) · [植物融合配方](./gp-next-fusion.md) · [官方示例模组](./gp-next-examples.md)
