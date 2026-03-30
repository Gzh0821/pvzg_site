---
title: 控制台 API
icon: terminal
pageInfo: false
index: true
order: 8
---

# 控制台 API

GP-Next 在游戏运行时会暴露一个全局对象：

```js
window.gpNext
```

你可以在开发者控制台中直接调用它。

> [!tip]
> 如果你不确定现在有哪些命令，最先执行：
>
> ```js
> gpNext.help()
> ```

## 使用前提

- 游戏已经加载完成
- GP-Next 已正常初始化
- 你打开了开发者控制台

如果你是想先拿到游戏本体里的 `Features`、`Props` 或语言表原始 JSON，再去写补丁，可以先看 [导出游戏数据参考](./gp-next-json.md)。

## 面板

### `gpNext.toggle()`

切换 GP-Next 面板显示/隐藏。

无参数。

### 示例

```js
gpNext.toggle()
```

### `gpNext.show()`

显示面板。

### `gpNext.hide()`

隐藏面板。

### `gpNext.help()`

在控制台打印命令帮助。

---

## 补丁与状态

### `gpNext.init()`

重新执行补丁加载流程。

### 返回

通常返回当前补丁加载结果。

### `gpNext.reload()`

从磁盘重新读取并重新应用补丁。

这是平时最常用的命令之一。

### 示例

```js
await gpNext.reload()
```

### `gpNext.status()`

查看当前补丁器状态。

### 主要返回字段

- `loaded`：已加载的类型列表
- `skipped`：跳过的类型
- `errors`：错误列表
- `packs`：当前识别到的数据包
- `disabledPacks`：被禁用的数据包
- `singleFile`：单文件补丁信息
- `editsPack`：手动编辑包信息
- `editsCount`：手动编辑数量
- `extraLanguages`：当前注册的额外语言
- `plantRegistry`：动态植物注册表调试信息

### 示例

```js
const status = gpNext.status()
console.log(status.packs)
console.log(status.errors)
```

---

## 数据修改

### `gpNext.setObjectsData(type, alias, key, value)`

修改某个 Objects 类型条目中的单个字段。

### 参数

- `type`：对象类型名，例如 `PlantProps`
- `alias`：目标条目的主别名，例如 `peashooter`
- `key`：要修改的字段名
- `value`：新值

### 示例

```js
gpNext.setObjectsData('PlantProps', 'peashooter', 'SunCost', 50)
```

### `gpNext.setObjectsData(type, alias, patchObject)`

把一个对象合并进目标条目的 `objdata`。

### 参数

- `type`：对象类型名
- `alias`：目标条目的主别名
- `patchObject`：要合并进去的对象

### 示例

```js
gpNext.setObjectsData('PlantProps', 'peashooter', {
  SunCost: 50,
  Cooldown: 2
})
```

> [!warning]
> 这个命令是运行时修改。它适合调试和快速验证，不等于自动帮你生成正式 Datapack。

---

## 导出与还原

### `gpNext.exportJson(type, useOriginal = false, autoDownload = true)`

导出某个类型的 JSON。

### 参数

- `type`：类型名，例如 `PlantFeatures`
- `useOriginal`：`true` 导出原始数据，`false` 导出当前运行中的数据
- `autoDownload`：`true` 时打开保存对话框，`false` 时输出到控制台

### 示例

```js
await gpNext.exportJson('PlantProps')
await gpNext.exportJson('PlantProps', true)
await gpNext.exportJson('PlantProps', false, false)
```

### `gpNext.exportLang(useOriginal = false, autoDownload = true)`

导出当前语言表 `MultiLanguage.lyrics`。

### 适合场景

- 检查语言包是否生效
- 对照当前语言扩展结果
- 导出原始语言表做比较

### 示例

```js
await gpNext.exportLang()
await gpNext.exportLang(true)
```

### `gpNext.restoreOriginal(type)`

把某个类型恢复成原始数据。

### 示例

```js
gpNext.restoreOriginal('PlantFeatures')
```

### `gpNext.restoreAll()`

恢复所有已备份类型。

### `gpNext.listOrigins()`

列出当前有哪些类型存在原始备份。

### `gpNext.hasOrigin(type)`

检查某个类型是否有原始备份。

---

## 游戏

### `gpNext.setFrameRate(fps)`

设置游戏帧率。

### 参数

- `fps`：数字，例如 `30`、`60`

### 示例

```js
gpNext.setFrameRate(60)
```

### `gpNext.setGameSpeed(multiplier)`

直接修改底层时间缩放。

### 参数

- `multiplier`：倍率，例如 `1`、`1.5`

### 示例

```js
gpNext.setGameSpeed(1)
gpNext.setGameSpeed(1.5)
```

> [!warning]
> 这个命令虽然存在，但它走的是底层 `_timeScale` 路径，不如 Trainer 页里的原生 `1x / 1.5x` 安全。  
> 一般更推荐在 UI 里切换游戏速度，而不是长期依赖这个命令。

---

## Cheats

### `gpNext.cheats.setSun(value)`

直接设置当前阳光数值。

### 示例

```js
gpNext.cheats.setSun(9999)
```

### `gpNext.cheats.addSun(value = 1000)`

增加阳光。

### 示例

```js
gpNext.cheats.addSun()
gpNext.cheats.addSun(500)
```

### `gpNext.cheats.winLevel()`

直接触发当前关卡胜利。

> [!warning]
> 在某些测试或沙盒场景中，不建议把它当作稳定工作流的一部分。

---

## 调试

### `gpNext.debug.getPlantRegistry()`

查看动态植物注册表的调试信息。

### 适合场景

- 新增植物
- 克隆植物
- 排查植物身份映射异常

### 示例

```js
const info = gpNext.debug.getPlantRegistry()
console.log(info)
```

---

## 其它

### `gpNext.version`

当前 GP-Next 版本号。

### 示例

```js
gpNext.version
```

### `gpNext.debug`

这是调试命名空间，不是单纯的布尔值开关。

目前最常用的是：

```js
gpNext.debug.getPlantRegistry()
```

## 示例

### 重新加载补丁后查看状态

```js
await gpNext.reload()
console.log(gpNext.status())
```

### 快速验证植物数值

```js
gpNext.setObjectsData('PlantProps', 'peashooter', {
  SunCost: 50,
  Cooldown: 2
})
```

### 导出当前数据到控制台

```js
await gpNext.exportJson('PlantProps', false, false)
```

### 导出原始语言表

```js
await gpNext.exportLang(true)
```
