---
title: GE Patcher 使用教程
icon: wrench
pageInfo: false
comment: false
index: true
order: 1
---

<script setup>
    import { onMounted } from 'vue';
    onMounted(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    })
</script>

游戏内置了 GE Patcher 工具，可以通过该工具加载一些自定义的 JSON 资源和关卡。

## 准备工作

1. 安装任意 JSON 编辑器(推荐 VSCode/Notepad++)
2. 确保游戏版本 ≥ 0.2.8.1
3. 了解 JSON 基础知识，如 JSON 语法、数据类型等
4. 了解植物、僵尸等在 JSON 中的属性结构 (可参考[这里](format.md))

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-7637695321442015"
     data-ad-slot="3900516289"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

## GE Patcher 基本教程

在启动游戏时，按`F12`打开开发者界面，在控制台一栏可以看到类似如下格式的输出:

```
[GE Patcher] BaseDir: C:\Users\admin\AppData\Local\com.pvzge.app
```

输入以下命令查看游戏内帮助，包括各个自定义 JSON 文件具体的路径:

```javascript
gePatcher.help()
```

等待游戏加载完后，输入以下命令以加载所有自定义 JSON 文件:

```javascript
gePatcher.init()
```

每次修改完 JSON 文件后都需要重新执行该命令以使修改生效。

## 文件路径

在 `com.pvzge.app` 中创建 `patches` 文件夹放置自定义 JSON 文件，其结构类似:

```
patches/
└── jsons/
    ├── features/
    │   ├── PlantFeatures.json
    │   ├── ZombieFeatures.json
    │   ├── UpgradeFeatures.json
    │   └── StoreCommodityFeatures.json
    └── levels/
        └── [关卡名].json
```

若无需修改某类属性，则忽略对应的文件。

## 文件结构

`PlantFeatures.json`:植物属性，结构如下:

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

- `ZombieFeatures.json`:僵尸属性，结构如下:

```json
{
  "ZOMBIES": [
    {
      "CODENAME": "tutorial"
    }
  ]
}
```

- `UpgradeFeatures.json`:升级属性，结构如下:

```json
{
  "UPGRADES": [
    {
      "CODENAME": "upgrade_starting_sun_lvl1"
    }
  ]
}
```

- `StoreCommodityFeatures.json`:商店物品属性

#### 要点:

PlantFeatures.json 和 ZombieFeatures.json 中的 `PLANTS` 和 `ZOMBIES` 数组为植物和僵尸的列表。

植物属性中，`SEEDCHOOSERDEFAULTORDER`数组为植物在图鉴/选择界面的默认顺序，`BASEUNLOCKLIST`数组为初始解锁的植物。

UpgradeFeatures.json 中的 `UPGRADES` 数组为升级的列表。

## 植物/僵尸/升级修改

对于`PlantFeatures`,`ZombieFeatures`,`UpgradeFeatures`，GE Patcher 采用以下规则进行处理。

`PLANTS`(或`ZOMBIES`,`UPGRADES`) 数组内的每个对象通过 `CODENAME` 字段匹配后合并至原始 JSON 中，合并规则如下:

- **数组元素**:如果属性的类型为数组，则会按照数组内元素的顺序合并数组内的每个值，若数组的值为对象，则进行递归的合并，若数组的值为基本类型，则直接覆盖原始 JSON 中的值
- **对象合并**:如果属性的类型为对象，进行递归合并，若对象内有相同键的属性，则直接覆盖原始 JSON 中的值
- **同名属性**:对于相同键的属性，直接覆盖，即替换原始 JSON 中的值

对于其它字段，如`SEEDCHOOSERDEFAULTORDER`/`BASEUNLOCKLIST`等，直接替换原数组。

因此，对于任何想要修改的植物/僵尸，都需要在自定义 JSON 文件中的 `PLANTS`(`ZOMBIES`) 数组内添加一个对象，且该对象的 `CODENAME` 字段必须与原始 JSON 中的植物名称一致。

对于不需要修改的植物/僵尸，可以不添加该对象。

单个植物/僵尸对象中，只有`CODENAME`是必需的，其它字段若不填写则保持不变，若需更改则需要增加该字段。

> [!important]
> 请避免修改某些关键属性，如`ID`，`_CARDSPRITENAME`等，可能会导致游戏崩溃或无法正常运行。
>
> 本工具无法创建新的植物/僵尸，只能修改已有的植物/僵尸。

比如，想要修改豌豆射手的家族为火焰，并将其背景改为史诗背景，以及将向日葵的阳光消耗调整至 25 点，并将其冷却变为 1 秒，则自定义的`PlantFeatures.json`文件应如下:

```json
{
  "PLANTS": [
    {
      "CODENAME": "peashooter",
      "OBTAINWORLD": "epic",
      "objdata": {
        "Family": "Fire"
      }
    },
    {
      "CODENAME": "sunflower",
      "objdata": {
        "SunCost": 25,
        "Cooldown": 1
      }
    }
  ]
}
```

每个植物/僵尸的 `objdata` 字段为植物和僵尸的部分属性数据，包含了植物和僵尸一些可修改属性。可以在[图鉴](../almanac/)中查找原始值。

## 关卡修改

将所有自定义关卡放入`patches/jsons/levels/[关卡名].json`目录中，以替换游戏内原始的关卡。

- 文件名必须与游戏内关卡 ID 一致，且后缀名必须为 `.json`，如 `egypt1.json`，不区分大小写
- 查看原始的各个关卡 ID 可使用 `gePatcher.showLevels()` 命令(需要先初始化 GE Patcher)，如果关卡 ID 已经以`.json`结尾，则不需添加重复的后缀名

## 商店修改

商店包含四大商品分类：

```json
{
  "Plants": [], // 植物
  "Upgrade": [], // 升级项
  "Gem": [], // 钻石商品（金币购买钻石）
  "Coin": [] // 金币商品（钻石购买金币）
}
```

GE Patcher 会使用自定义 JSON 文件`StoreCommodityFeatures.json`中的四个商品的数组替换原始数组。若自定义 JSON 文件中不包含某一商品分类，则该分类的商品将不会被替换。

## 调试与排错

1. 经常查看控制台的加载日志，并检查是否有错误消息
2. 常见错误:
   - ❌ `Failed to load...`:JSON 语法错误
   - ❌ `Level file not found`:文件名不匹配
3. 使用校验工具检查 JSON 格式(推荐[JSONLint](https://jsonlint.com/))
