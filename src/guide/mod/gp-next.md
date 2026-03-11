---
title: GP-Next 使用教程
icon: toolbox
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

> [!tip]
> 以下教程适用于 `0.7.1` 及以上版本的游戏。对于更早的版本，请参考 gePatcher 教程。

GP-Next 是 PvZ2 Gardendless 游戏内置的全新强大的数据调试与 Mod 工具。它支持通过 JSON 对植物、僵尸、地图、商店商品和关卡等游戏资源进行模块化定制。相比旧版的 gePatcher，它带来了数据包管理（Datapacks）、内置修改器（Trainer）和实时数据编辑（Data Browser）等高级功能。

## 前提条件

1. JSON 编辑器（推荐使用 VSCode/Notepad++）
2. 游戏版本 ≥ 0.7.1
3. 理解基本的 JSON 数据结构。有关植物和僵尸的具体可用属性参考，请查阅[属性参考](format.md)。

<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-7637695321442015"
     data-ad-slot="7113006248"
     data-ad-format="auto"
     data-full-width-responsive="true">
</ins>

## 目录结构与合并优先级

GP-Next 的模组目录统一放置在游戏数据目录的 `gp-next` 文件夹下。你可以在游戏的 GP-Next 面板按 **"打开目录"** 直接定位到该路径。

GP-Next 的文件合并按照以下优先级顺序进行（编号越后优先级越高，即后续覆盖前面）：

1. **packs/ 目录（数据包 Datapacks）**：这里存放文件夹或 `.zip` 格式的完整模组包。各个包之间会根据各自清单中定义的 `priority`（优先级数值，越小越先加载）进行升序加载。
2. **patches/ 目录（单文件补丁）**：类似于旧版的 gePatcher，直接存在此目录的散装 JSON 拥有比所有数据包更高的优先级，起到向下兼容的作用。
3. **手动编辑（数据面板）**：你在游戏内 GP-Next 【数据】面板中手动执行的各项数值修改会归档为 `__gpn_edits`，它们拥有**最高优先级**，永远覆盖所有的 packs 和 patches。

```text
com.pvzge.app/
└── gp-next/
    ├── packs/
    │   ├── MyPack/         ← 文件夹格式的数据包
    │   │   ├── pack.json   ← 必须存在的描述清单
    │   │   └── jsons/
    │   │       ├── features/
    │   │       ├── objects/
    │   │       └── levels/
    │   └── AnotherPack.zip ← ZIP 格式的数据包
    └── patches/            ← 单文件旧式补丁
        └── jsons/
            ├── features/
            └── levels/
```

## 数据包规范 (`pack.json`)

制作一个数据包，你只需在 `packs/` 下新建一个文件夹，并在其根目录提供 `pack.json`，它的格式如下：

```json
{
  "uuid": "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
  "name": "我的自定义模组",
  "version": "1.0.0",
  "priority": 100,
  "description": "模组的介绍信息",
  "author": "你的名字",
  "formatVersion": 1,
  "gameVersion": "0.7.1",
  "gpNextVersion": ">=1.0.0"
}
```

- **uuid**: 必须提供唯一的标识符（用于记忆你在控制面板中保存的配置与排序状态）。你可以前往游戏内的 GP-Next 指南面板中一键生成 uuid 并复制。
- **name**: 模组在管理器内显示的名称。
- **version**: 模组的版本号。
- **priority**: 加载的默认优先级（越小越优先加载）。
- **description**: 模组的详细介绍信息。
- **author**: 模组作者的名字。
- **formatVersion**: 数据包格式版本（当前规范为 1）。
- **gameVersion**: 该模组指定兼容的游戏版本号（如：`0.7.1`）。
- **gpNextVersion**: 该模组所需兼容的最低 GP-Next 版本限制（如：`>=1.0.0`）。
- **thumbnail.png / thumbnail.ico**: 你可以在包名同级目录下放一张 1:1（正方形）的图片作为模组的封面展示。图片尺寸必须小于 128x128，支持 `.png` 和 `.ico` 格式。

## 手动编辑与数据层管理

GP-Next 提供了一个强大的**数据（Data）**面板。通过它，你可以在游戏运行时实时查阅所有的游戏内部数据结构（例如 `PlantProps`、`ZombieProps`），甚至可以直接点击编辑。

所有在数据面板进行的临时调整，都会被系统持久化保存，并且永久覆盖其他 Mod 包的定义！
> [!important]
> 手动编辑的设计初衷是用于**快速微调和测试纠错**。如果你打算制作一个完整稳定的修改内容或需要分享给他人，请务必将其封装为 `packs/` 下的独立数据包。

如果你需要撤销这些临时修改，只需在数据面板中对应条目的右侧菜单点击“还原（Restore）”即可。

## 修改器与沙盒 (Trainer)

通过游戏内菜单打开“允许作弊（Cheat）”后，GP-Next 将激活专门的修改器功能。

- **关卡内模式**：支持修改阳光数量、随时调整游戏速度、开启植物无敌/无冷却/免费种植、一键过关等实用功能，也可自动收集掉落物。
- **世界地图模式**：允许你自由写入金币和钻石。
- **沙盒互动**：修改器的功能与游戏原生的“沙盒模式”深度绑定。在沙盒模式下，修改器的操作会与沙盒指令互相映射与同步（同时，类似一键过关类的功能在沙盒模式下将被锁定禁用以保证稳定性）。
