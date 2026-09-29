---
title: 植物等级
icon: seedling
pageInfo: false
index: true
order: 7.5
---

植物等级通过 `jsons/extensions/plant-levels.json`（或 `.json5`）把基础植物映射到各级植物类型，提供等级徽标、图鉴等级页和选卡替换。它不提供完整的升级经济系统。

使用前备份存档，并在“实验性”开启植物等级。新增克隆植物时还需启用动态植物注册。

## 配置

```json
{
  "$schema": "https://pvzge.com/jsons/schema/gpn-plant-levels.schema.json",
  "plants": {
    "peashooter": {
      "levels": {
        "1": { "cloneCodename": "peashooter", "icon": "wood" },
        "2": { "cloneCodename": "peashooter_lvl2", "icon": "silver", "displayName": "LV2" }
      }
    }
  }
}
```

示例中的 `peashooter_lvl2` 需由数据包提供完整的 `PlantFeatures`、`PlantTypes`、`PlantProps` 和 `PlantAlmanac`。为升级后的植物使用独立 codename，避免把等级绑定到其他原版植物身份。

| 字段 | 含义 |
| --- | --- |
| `cloneCodename` | 该等级使用的植物类型 |
| `icon` | `wood`、`silver`、`gold`、`star`，默认 `wood` |
| `displayName` | 可选文字或多语言对象，如 `{ "zh": "2级", "en": "Level 2" }` |
| `hideText` | 隐藏文字，保留图标 |

配置中的 `$schema` 可用于编辑器补全与校验。应用后在图鉴确认当前等级，再进入关卡检查基础植物是否解析为对应等级；先保留克隆卡片可见，便于核对数据。

[数据包结构](./gp-next-datapack.md) · [字段参考](./format.md)
