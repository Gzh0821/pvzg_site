---
title: GE Patcher 使用教程(latest)
icon: wrench
pageInfo: false
index: true
order: 1
---

<script setup>
    import { onMounted } from 'vue';
    onMounted(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    })
</script>

> [!warning]
> 以下教程仅适用于`0.3.X`-`0.6.X`版本。

GE Patcher 是一个用于修改 PvZ2 Gardendless 游戏数据的工具，支持对植物、僵尸、格子道具（GridItem）、弹道（Projectile）、升级、商店和关卡等内容的自定义修改。

推荐使用内置版本的 GE Patcher（官网发行版已包含）。

## 前提条件

1. JSON 编辑器（推荐使用 VSCode/Notepad++）
2. 游戏版本 ≥ 0.3.0
3. 植物、僵尸等元素的 JSON 属性结构，请参阅[属性参考](format.md)

<ins class="adsbygoogle"
style="display:block"
data-ad-client="ca-pub-2336226859954206"
data-ad-slot="6758794743"
data-ad-format="auto"
data-full-width-responsive="true">
</ins>

## GE Patcher 基础知识

在游戏启动时按“F12”打开开发者界面。在控制台选项卡中，会出现类似以下内容的输出：

```text
[GE Patcher] BaseDir: C:\Users\admin\AppData\Local\com.pvzge.app
```

上述路径即为 GE Patcher 的主目录（示例）。运行以下命令可以在控制台查看帮助信息并输出补丁目录：

```javascript
gePatcher.help()
```

GE Patcher 还会自动加载云存档模块（`window.cloudSaver`）。

游戏加载完成后可以运行以下命令加载/应用补丁：

```javascript
// 加载基础资源，不会加载补丁文件
gePatcher.initBase()

// 在调用 initBase 后，可以调用 initPatchs() 加载补丁文件
// 在你更改 JSON 文件后，重新调用此函数以应用更改
gePatcher.initPatchs()

// 同时加载基础资源和补丁文件，等同于上面两步骤的组合
gePatcher.init()
```

其他常用函数示例：

```javascript
// 列出游戏内原始关卡 ID
gePatcher.showLevels()

// 设置自定义帧率（危险操作，可能导致崩溃或性能问题）
gePatcher.setFrameRate(30)

// 修改单个实体的单个属性（示例）
gePatcher.setPropsData('PlantProps', 'peashooter', 'ShootInterval', 1.2)

// 合并多个属性（传入对象）
gePatcher.setPropsData('PlantProps', 'peashooter', { ShootInterval: 1.2, SunCost: 75 })

// 数据管理与导出
gePatcher.listOrigins()             // 列出已保存的原版JSON数据
gePatcher.exportJson('PlantFeatures', false) // 导出当前 PlantFeatures 数据（第二个参数为 true 则导出原版JSON数据，第三个参数为true则下载对应文件，为false则仅在控制台输出）
gePatcher.restoreOriginal('PlantFeatures')   // 还原 PlantFeatures 为原版JSON数据
gePatcher.restoreAll()              // 还原所有数据
```

## 文件结构

在 `com.pvzge.app` 下创建 `patches` 文件夹，其结构如下：

```
patches/
└── jsons/
    ├── features/
    │   ├── PlantFeatures.json
    │   ├── PlantProps.json
    │   ├── PlantAlmanac.json
    │   ├── PlantTypes.json
    │   ├── ZombieFeatures.json
    │   ├── ZombieProps.json
    │   ├── ZombieAlmanac.json
    │   ├── ZombieTypes.json
    │   ├── BoardGridMaps.json
    │   ├── ProjectileProps.json
    │   ├── ProjectileTypes.json
    │   ├── UpgradeFeatures.json
    │   ├── PropertySheets.json
    │   ├── NarrativeList.json
    │   └── StoreCommodityFeatures.json
    └── levels/
        └── [关卡名].json
```

说明：

- `features` 目录包含各种 Features/Props/Types/Almanac 文件，用于修改游戏实体的元数据和行为。
- 未修改原版内容的文件无需创建。

## Features 文件

Features 文件用于对实体（植物、僵尸、格子道具、升级等）的元数据进行合并修改。

### 常见 Features 示例

**PlantFeatures.json**（示例）：

```json
{
  "PLANTS": [
    {
      "CODENAME": "peashooter"
    }
  ],
  "SEEDCHOOSERDEFAULTORDER": ["peashooter", "sunflower"],
  "BASEUNLOCKLIST": ["peashooter", "sunflower"]
}
```

**ZombieFeatures.json**（示例）：

```json
{
  "ZOMBIES": [
    {
      "CODENAME": "tutorial"
    }
  ]
}
```

**UpgradeFeatures.json**（示例）：

```json
{
  "UPGRADES": [
    {
      "CODENAME": "upgrade_starting_sun_lvl1"
    }
  ]
}
```

**GridItemFeatures.json / StoreCommodityFeatures.json** 等结构与上述类似，按游戏原始结构提供要修改条目的 CODENAME/标识。

### Features 合并规则（摘要）

- 按 CODENAME（或相应标识）匹配已有实体，找到后将用户提供的对象与原始对象合并。
- 基本类型字段直接覆盖；对象类型递归合并；数组类型按元素顺序合并（若数组元素为基本类型则覆盖）。
- 对于 `SEEDCHOOSERDEFAULTORDER`、`BASEUNLOCKLIST` 等顶级数组字段，会直接替换原数组。

重要提示：GE Patcher 仅修改已存在的实体，不会创建全新的实体条目。尽量避免修改关键标识（例如 `ID`、`_CARDSPRITENAME` 等）。

## Props / Almanac / Types 文件

这些文件用于修改实体的具体数值、图鉴信息或类型表：

- `PlantProps.json` / `ZombieProps.json`：修改数值属性（`PlantProperties` / `ZombieProperties`）。
- `PlantAlmanac.json` / `ZombieAlmanac.json`：修改图鉴显示信息（不会改变实际战斗数值）。
- `PlantTypes.json` / `ZombieTypes.json`：定义植物/僵尸的类型数据。
- `ProjectileProps.json` / `ProjectileTypes.json`：弹道/子弹相关属性与类型定义。
- `NarrativeList.json`：修改剧情对话列表。
- `PropertySheets.json`：覆盖或补充某些属性表。

### Props 文件示例（PlantProps.json）

```json
{
  "objects": [
    {
      "aliases": ["peashooter"],
      "objclass": "PlantProperties",
      "objdata": {
        "ShootInterval": 1.35,
        "ShootIntervalAdditional": 0.15,
        "PlantfoodPeaCount": 60,
        "Cooldown": 5,
        "SunCost": 100,
        "Toughness": 300
      }
    }
  ]
}
```

### Almanac 示例（PlantAlmanac.json）

```json
{
  "objects": [
    {
      "aliases": ["peashooter"],
      "objclass": "PlantAlmanacProperties",
      "objdata": {
        "Elements": [
          { "TYPE": "SUNCOST" },
          { "TYPE": "DAMAGE", "VALUE": 20 }
        ],
        "Introduction": { "en": "Peashooters are...", "zh": "豌豆射手是..." }
      }
    }
  ]
}
```

### 合并规则

- 与 Features 相同：按 `aliases`（数组第一项）匹配目标实体，找到后对 `objdata` 进行递归合并。若只想修改部分字段，仅提供需要修改的属性。

## 关卡文件

自定义关卡放在 `patches/jsons/levels/[LevelName].json`。

- 文件名必须与游戏内关卡 ID 匹配（例如 `egypt1.json`）。
- 使用 `gePatcher.showLevels()` 在控制台查看可用关卡 ID（需先初始化 GE Patcher）。

## 商店文件

`StoreCommodityFeatures.json` 用于替换/修改商店商品分类：

```json
{
  "Plants": [],
  "Upgrade": [],
  "Gem": [],
  "Coin": []
}
```

可省略不需要修改的类别。

## 调试与常见故障排查

1. 检查控制台（F12）中的错误日志。
2. 常见错误：
   - ❌ `Failed to load...`：通常为 JSON 语法错误。
   - ❌ `Level file not found`：文件名或路径不匹配。
3. 验证 JSON：使用 [JSONLint](https://jsonlint.com/) 或 VSCode JSON 校验插件。
4. 获取参考：使用 `gePatcher.exportJson('PlantProps', true)` 等命令导出游戏原版数据，对比结构差异。

排查建议：

- 先在控制台运行 `gePatcher.help()`，它会输出补丁基础目录（示例：`C:\Users\admin\AppData\Local\com.pvzge.app\patches`）以及支持的路径清单，确保文件放在正确位置。
- 在游戏资源完全加载后再运行 `gePatcher.init()` 或先运行 `gePatcher.initBase()` 并等待加载完成（脚本会检查资源数量，提示未加载完）。
- 若更改未生效，确认已重新执行 `gePatcher.init()` 或 `gePatcher.initPatchs()` 并查看控制台输出以定位错误。
