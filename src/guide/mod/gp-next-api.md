---
title: JavaScript API 用法
icon: toolbox
pageInfo: false
index: true
order: 10
---

# JavaScript 模组 API

API 版本为 **2**。以下 `ctx` 来自 `setup(ctx)`。从控制台输入这些示例时没有 `ctx`；请把代码放进自己的模组入口。

[完整参数、回调和返回类型](./gp-next-api-reference.md) · [下载类型声明](/downloads/mods/gp-next-api.d.ts)

## 先选需要的接口

| 需求 | 接口 |
| --- | --- |
| 模组名称、版本、功能检查 | `meta`、`compat` |
| 定时执行、停止任务 | `runtime`、`clock` |
| 玩家设置、操作按钮 | `settings`、`controls` |
| 保存模组进度 | `storage` |
| 读取自己的资源或前置文件 | `files` |
| 模组之间通信 | `events`、`services` |
| 棋盘和实体查询 | `board`、`entities`、`teams` |
| 伤害、治疗、收集、效果和命中 | `actions`、`combat`、`status`、`impacts` |
| 生成植物、僵尸或收集物 | `spawns` |
| 当前关卡、场景、玩家和游戏状态 | `levels`、`scenes`、`player`、`game` |
| 游戏数据、图鉴、商店、地图和翻译 | `content`、各数据分类、`worldMap`、`localization` |
| 提示和日志 | `ui`、`log` |
| 启动时注册资源或扩展 | `startup(ctx)`，见[资源与前置](./gp-next-resources.md) |

## 返回值和取消

先检查 `supports()` / `getCapabilities()`，不要假定所有对象都能执行所有动作。返回 `{ ok, reason }` 的操作要先判断 `ok`；失败时向日志写入 `reason`。只有声明了 `required` 参数的操作才可用 `required: true` 将失败改为异常。

实体可能消失；延迟操作前检查 `isAlive()`。`snapshot()` 和数据读取结果是快照，修改它们不会修改游戏。

订阅和定时器通常返回取消函数，并随模组停用自动停止。支持的选项中可传 `{ signal, label }`；传入实体的 `signal` 可在实体消失时停止相关任务。

## 时间与清理

- `runtime.sleep(ms)`、`setTimeout(fn, ms)`、`setInterval(fn, ms)` 使用真实毫秒。
- `clock.sleep(seconds)`、`setTimeout`、`setInterval` 使用游戏秒，跟随暂停与加速。
- `clock.onTick(fn)` 接收 `deltaSeconds` 等当前时间信息。
- `runtime.onDispose(fn)` 登记停用时的清理；`runtime.signal` 用于取消异步工作。
- `runtime.track(promise)` 跟踪异步任务；`guard(fn)` 避免停止后继续调用。

```js
ctx.clock.setInterval(() => {
  ctx.log.info(ctx.game.getState().phase)
}, 1)
```

用 `runtime` 的真实时间处理界面超时，用 `clock` 的游戏时间处理玩法。自己创建的外部资源仍要主动清理。

## 设置和按钮

`settings.defineSchema({ fields })` 支持 `toggle`、`number`、`slider`、`select`、`text`。使用 `get/getAll` 读取，`set/reset/import` 修改，`export` 导出。完整字段形状见 `SettingField`。

`settings.onChange(fn)` 接收成功写入后的 `{ previous, values, operation, namespace }`。`onApply(fn)` 处理玩家应用设置，使用回调中的 `values` 更新玩法；无法立即应用的设置让玩家按提示重启。

`controls.definePanel({ title, groups })` 支持 `action`、`toggle`、`select`、`number`、`text`、`readonly`。使用短标签；按钮例子见[作者入门](./gp-next-js.md)。`controls.clear()` 清除本模组面板。

## 持久存储

```js
const history = await ctx.storage.open({
  scope: 'global', version: 1, defaults: { launches: 0 },
  validate: value => Number.isSafeInteger(value?.launches)
})
await history.update(value => ({ launches: value.launches + 1 }))
const saved = await history.read()
```

`scope: 'global'` 在本机玩家存档间共享；`scope: 'save'` 属于当前已加载的游戏存档。切换存档后重新打开存储，不要复用旧句柄。

只能保存 JSON 值，不可保存 `undefined`、函数或游戏对象。升级数据结构时增加正整数 `version`，提供 `migrate(value, oldVersion, newVersion)`；`validate` 必须返回 true。停用模组不会删除已保存数据。原生存档导出和云存档不会自动包含这些额外文件。

## 包内文件

```js
const own = ctx.files.own()
const paths = own.listPaths()
const text = await own.readText('data/options.json')
const imageBytes = await own.readBytes('assets/icon.png')
```

`readText` 返回文本或 `null`；`readBytes` 返回 `Uint8Array` 或 `null`。路径相对包根目录，不可用绝对路径或 `..`。

`files.from('author.library')` 读取已声明的直接前置；在清单的 `depends` 或 `optionalDepends` 中填写其 uuid。不能随意读取所有模组或玩家文件。`files.contributions()` 用于框架读取依赖自己的纯数据内容包。

## 棋盘与实体

行列从 **0** 开始。`board.getCell`、`listCells`、`getNeighbors` 查询真实存在的格子；不要固定假设每关都是 5×9。`resolveCell` 取得实体所在格，`distance` 支持欧氏、曼哈顿或切比雪夫距离。

```js
const plants = ctx.entities.list({ kind: 'plant', alive: true, capabilities: ['heal'] })
for (const plant of plants) {
  const hp = plant.getHealth()
  if (hp?.max != null && hp.current < hp.max) {
    const result = plant.heal(25)
    if (!result.ok) ctx.log.warn(result.reason)
  }
}
```

实体查询还支持 `laneIndex`、`columnIndex`、`codename`、`team`、`targetTeam`、`filter` 等，完整组合见 `EntityQuery`。`findNearest` 找最近对象，`listInLane/listInCell` 按行或格查询。

`getHealth()` 的 `current/max` 是主体血量，`secondary` 是可用的护甲或外壳血量；未知上限为 `null`。`damage/heal/collect/eliminate/moveToCell` 只对具备相应能力的实体使用。

`entities.watch` 观察出现、变化和消失；`watchHealth` 观察生命变化。`teams.getState` 区分当前阵营与攻击目标阵营，查询阵营不会改变实体类别。

## 伤害、效果与命中

`actions` 提供伤害、治疗、消除和收集；实体句柄也提供这些操作。`damage/heal` 的 `ok` 表示调用成功，`accepted`、`appliedAmount` 才说明是否真的改变血量及改变量。

`combat` 用于查询或处理伤害请求、登记伤害修正。它只处理通过 API 发起的伤害，不会拦截全部原版攻击。修正定义、优先级和匹配条件见 `CombatApi`、`CombatModifierDefinition`。不要把“成功调用”当成目标一定受到伤害。

`status` 查询和施加支持的状态，先用 `supports` 检查；可用效果及字段见 `StatusDescriptor`。`status.layers` 维护模组拥有的效果层，便于按来源、时长与叠加方式清理。它不会把不同效果的叠加规则强行变成同一种。

`impacts.watch` 观察支持的投射物命中，事件含来源、目标和伤害前后快照。先检查 `impacts.getCapabilities()`；它不保证捕获每种特殊攻击或延迟伤害。

## 生成对象

```js
const result = await ctx.spawns.spawn({
  kind: 'resource', type: 'sun.small',
  at: { laneIndex: 2, columnIndex: 2 }
})
if (result.ok) {
  ctx.log.info(result.entities[0].snapshot())
  // 不需要时：await result.dispose()
} else {
  ctx.log.warn(result.reason)
}
```

支持的类别为 `plant`、`zombie`、`tomb`、`tile-liquid`、`projectile`、`resource`，仍须检查当前环境的 `supports(kind)`。植物等使用当前游戏中存在的类型名称；新类型需要先由相应资源／内容模组注册。

投射物还需 `targetSide: 'plant' | 'zombie'` 和 `motion`，当前支持直线运动：

```js
const shot = await ctx.spawns.spawn({
  kind: 'projectile', type: 'cabbage',
  at: { laneIndex: 2, columnIndex: 1 }, targetSide: 'zombie',
  motion: { kind: 'linear', velocity: { columnsPerSecond: 7, lanesPerSecond: 0 }, heightInCells: 0.55 }
})
```

普通收集物包括 `sun.tiny/small/mid/large`、`coin.silver/gold`、`gem`、`sprout`、`plant-food`。伤害等配置来自对应游戏数据；不支持的生成会返回失败原因。成功结果返回 `entities` 数组和 `dispose()`；主动销毁不等于玩家击杀或领取奖励。

## 游戏、玩家与数据

- `scenes.getName/is`：判断当前场景。
- `game.getState/watchState`：查看 `outside/preparing/running/paused/waiting/won/lost/ended` 阶段；`setSpeedUp` 切换原生 1×／1.5×。
- `player`：读写玩家属性、货币、阳光等。这些操作可能保存到存档，停用模组不等于撤销。
- `levels`、`garden`：关卡与禅境花园的可用操作，见完整参数表。
- `content`：按类型读取、查询、导出或修改数据。写入使用 `mutate` 等方法，不能修改 getter 返回的快照来生效。
- `plants/zombies`：特征、属性、类型和图鉴；`projectiles/armors/dinosaurs`：特征、属性和类型。
- `tiles/tileLiquids/tombs/lawns/levelModules/shop/upgrades/trophies/gameMetadata`：相应的数据分类。
- `worldMap`：地图数据；`localization`：翻译数据与当前语言。

只需固定修改数值时，用 JSON 补丁更方便分享。数据改变不一定影响已经创建的对象，按界面提示重启或重新进入关卡。

## 事件和共享服务

`events.on/once` 订阅，`emit/emitAsync` 发送自定义事件。未带 `mod:` 前缀的名称属于当前模组；共享事件可用 `mod:协议名:事件名`。游戏提供的事件不能由模组伪造。

`services.provide({ id, version, api })` 注册共享服务，`api` 是函数组成的对象。使用 `resolve(id, { minVersion, maxVersion, capabilities, required })` 查找；先检查 `result.ok`，再调用 `result.service.api`。提供方停用后旧服务失效，需要重新获取。

## 提示、版本与高级接口

`ui.toast(message, type)` 显示简短提示；`log.info/warn/error` 写日志。`compat.hasFeature` 查询功能，`getPlatformVersion/getApiVersion` 查询版本。`gpn.reload` 可能需要重启，不能当作任意资源的热更新命令。

优先使用上述接口。`advanced` 和 `unsafe` 用于必须接触游戏对象的作者；它们依赖具体游戏版本，需要作者自行测试。

`unsafe.hooks.wrapMethod({ target, methodName, handler, priority })` 的 handler 接收 `args`、`thisArg`、`callNext`、`callBase`。一般调用 `callNext()` 保留其他模组的修改；`callBase()` 会跳过其他包装。还提供 `wrapProperty`、`wrapModuleExport` 和 `defineCleanup`。停止模组会撤销登记的包装，但不自动撤销已写入的存档或任意外部变化。

## 可直接使用的写法

- [设置控制定时治疗](./gp-next-api-reference.md#settingsapi)
- [只监听新增对象](./gp-next-api-reference.md#entitiesapi)
- [只撤销自己施加的减速](./gp-next-api-reference.md#statuslayerapi)
- [读取包内 JSON](./gp-next-api-reference.md#packfilesapi)
- [保存并升级模组数据](./gp-next-api-reference.md#modstorageapi)
- [共享一个有版本的服务](./gp-next-api-reference.md#servicesapi)
- [调用前置服务](./gp-next-api-reference.md#servicesapi)
- [理解 Hook 的执行顺序](./gp-next-api-reference.md#modcontext)
