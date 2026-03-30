---
title: 原始数据
icon: file-export
pageInfo: false
index: true
order: 5
---

# 游戏数据

写补丁之前，最有用的一步通常不是先猜字段，而是先把游戏当前的原始 JSON 导出来看一眼。

这样你可以更快确认：

- 这个类型在游戏里到底叫 `Features` 还是 `Props`
- 某个对象实际有哪些字段
- 这些字段当前的默认值是什么
- 语言文本是不是放在独立语言表里，还是写在对象自己的多语言字段中

## 可以导出什么

最常见的几类参考数据有：

- `PlantFeatures`
- `PlantProps`
- `PlantAlmanac`
- `ZombieFeatures`
- `ZombieProps`
- `StoreCommodityFeatures`
- `LevelModules`
- 游戏语言表 `lang`

如果你不确定某个类型名，可以先在游戏里的 **Data** 页查看分类名称，或者执行：

```js
gpNext.status()
```

## 方法一：用 Data 页导出

这是最直观的方式。

1. 进入游戏并打开 GP-Next 面板
2. 切到 **Data** 页
3. 找到你想查看的类型，例如 `PlantProps`
4. 选择导出当前数据，或者导出原始数据

适合场景：

- 想快速看某个类型的整体结构
- 想对比“原始数据”和“当前运行中的数据”
- 不想手写控制台命令

## 方法二：用控制台 API 导出 `Features` / `Props`

如果你更习惯脚本化操作，可以直接在开发者控制台里调用：

```js
await gpNext.exportJson('PlantProps')
```

上面这条命令会导出当前运行中的 `PlantProps`。

如果你想导出原始数据，用第二个参数传 `true`：

```js
await gpNext.exportJson('PlantProps', true)
```

### 参数说明

- 第一个参数 `type`：类型名，例如 `PlantFeatures`、`PlantProps`
- 第二个参数 `useOriginal`：`true` 表示导出原始数据，`false` 表示导出当前运行中的数据
- 第三个参数 `autoDownload`：`true` 时弹出保存，`false` 时输出到控制台

### 例子

导出原始植物特性：

```js
await gpNext.exportJson('PlantFeatures', true)
```

导出当前运行中的僵尸数值，并打印到控制台：

```js
await gpNext.exportJson('ZombieProps', false, false)
```

## 方法三：导出语言表

游戏里的通用语言表也可以直接导出。

```js
await gpNext.exportLang()
```

如果你想拿到原始语言表：

```js
await gpNext.exportLang(true)
```

这份导出的内容适合用来：

- 查找某段现有文本的原始 key
- 对照语言包是否正确覆盖
- 给新语言做参考

## 如何判断该导出哪一类文件

可以先按你想改的内容来判断：

- 想改名称、排序、卡牌资源名：先看 `Features`
- 想改生命、伤害、冷却、阳光：先看 `Props`
- 想改图鉴简介、标签、聊天文本：先看 `Almanac`
- 想改商店项目：看 `StoreCommodityFeatures`
- 想改全局界面文本：看语言表

如果还是不确定，最稳妥的做法是同时导出相关的两个类型，对照着看。

## 导出后怎么继续

导出 JSON 之后，通常可以按这个顺序继续：

1. 在导出的文件里找到目标对象和字段
2. 回到 [类型与字段参考](./format.md) 对照字段作用
3. 再去写你的 `pack.json` 和补丁文件

如果你已经准备开始写包，可以继续看：

- [数据包与 `pack.json`](./gp-next-datapack.md)
- [JSON 合并规则](./gp-next-merge.md)
- [控制台 API](./gp-next-console.md)
