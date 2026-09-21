---
title: API 参数与返回类型
icon: toolbox
pageInfo: false
index: true
order: 11
---

# API 参数与返回类型

配合 [API 用法](./gp-next-api.md) 查阅。`?` 表示可省略，`Promise<T>` 需要等待，联合类型中的字符串是允许的选项。先查 `ModContext` 选择领域，再查对应接口；启动入口查 `StartupContext`。

[下载类型声明](/downloads/mods/gp-next-api.d.ts)

## 按任务查阅

第一次编写模组先看[作者入门](./gp-next-js.md)，下面的类型声明是查阅用，不需要逐个学习。

| 要做什么 | 查这里 |
| --- | --- |
| 设置、按钮与保存 | [SettingsApi](#settingsapi)、[ControlsApi](#controlsapi)、[ModStorageApi](#modstorageapi) |
| 找植物／僵尸并操作 | [EntityQuery](#entityquery)、[EntitiesApi](#entitiesapi)、[ActionResult](#actionresult) |
| 生成、伤害、状态效果 | [SpawnsApi](#spawnsapi)、[CombatApi](#combatapi)、[StatusApi](#statusapi) |
| 定时与清理 | [RuntimeApi](#runtimeapi)、[GameClockApi](#gameclockapi) |
| 数据、文件与前置服务 | [ContentApi](#contentapi)、[PackFilesApi](#packfilesapi)、[ServicesApi](#servicesapi) |
| 启动资源与内容 | [StartupRegistration](#startupregistration)、[StartupContext](#startupcontext) |

### 先读懂签名

`heal(amount: number, options?: HealOptions): HealActionResult` 表示传入数值 amount，可省略 options，得到一个结果对象。`readonly` 表示只能读；`null` 表示没有或不可用；`unknown` 表示没有承诺具体结构，不能直接猜字段。`() => boolean` 是返回的函数，需要调用才会取消任务，它本身不是成功标志。`Promise<T>` 要 await 后才得到 T。

文中的坐标以格子为单位、从 0 开始；现实计时用毫秒，玩法计时用秒。具体字段说明优先于这一约定。

## MaybePromise

回调可以直接返回结果，也可以返回 Promise。加载资源、读写存储时使用 `async` / `await`。

```ts
export type MaybePromise<T> = T | Promise<T>
```

## SubscriptionOptions

`label` 用于在日志中识别任务。`signal` 中止时取消该订阅或任务；省略时仍会随模组停用清理。实体相关任务可传 `entity.signal`，但要先排除 `null`。

```ts
export interface SubscriptionOptions {
    label?: string
    signal?: AbortSignal
}
```

## EntityKind

`kind` 是对象类别，不是植物或僵尸的品种名；品种用 `codename` 筛选。能力值为 true 才表示当前对象支持对应操作，不能只凭类别判断。

```ts
export type EntityKind = 'plant' | 'zombie' | 'projectile' | 'resource' | 'armor' | 'tomb' | 'tile-liquid' | 'dinosaur' | 'entity' | string
```

## EntityAction

字段含义与用法见 [EntityKind](#entitykind)。

```ts
export type EntityAction = 'inspect' | 'damage' | 'heal' | 'eliminate' | 'moveToCell' | 'collect'
```

## Team

`team` 是当前所属阵营，`targetTeam` 是攻击指向的阵营；二者不一定与 `kind` 一致，例如被魅惑的僵尸仍是僵尸。`identity` 查询所属阵营，`targeting` 查询攻击阵营；`available: false` 或 `unknown` 表示无法可靠判断，不能当作中立。此组接口只查询，不改变阵营。

```ts
export type Team = 'plant' | 'zombie' | 'neutral' | 'unknown'
```

## TeamFacet

字段含义与用法见 [Team](#team)。

```ts
export type TeamFacet = 'identity' | 'targeting'
```

## TeamState

字段含义与用法见 [Team](#team)。

```ts
export interface TeamState {
    readonly team: Team
    readonly targetTeam: Team
}
```

## TeamFacetCapability

字段含义与用法见 [Team](#team)。

```ts
export interface TeamFacetCapability {
    readonly available: boolean
    readonly adapters: readonly string[]
    readonly teams: readonly Team[]
    readonly reason: string | null
}
```

## TeamCapabilities

字段含义与用法见 [Team](#team)。

```ts
export interface TeamCapabilities {
    readonly identity: TeamFacetCapability
    readonly targeting: TeamFacetCapability
}
```

## TeamsApi

字段含义与用法见 [Team](#team)。

```ts
export interface TeamsApi {
    getState(target: EntityHandle): TeamState
    getCapabilities(target: EntityHandle): TeamCapabilities
    supports(target: EntityHandle, facet: TeamFacet | string): boolean
}
```

## EntityHealthLayer

`current/max` 是当前值和上限，`ratio` 是当前值与上限的比值。主体以外的护甲／外壳位于 `secondary`；`totalCurrent/totalMax` 合计两层。`null` 表示未知或没有该层，不能作为 0 血量处理。

```ts
export interface EntityHealthLayer {
    current: number
    max: number | null
    ratio: number | null
}
```

## EntityHealth

字段含义与用法见 [EntityHealthLayer](#entityhealthlayer)。

```ts
export interface EntityHealth extends EntityHealthLayer {
    secondary: EntityHealthLayer | null
    totalCurrent: number
    totalMax: number | null
}
```

## EntityCapabilities

字段含义与用法见 [EntityKind](#entitykind)。

```ts
export interface EntityCapabilities {
    inspect: boolean
    damage: boolean
    heal: boolean
    eliminate: boolean
    moveToCell: boolean
    collect: boolean
}
```

## EntitySnapshot

`laneIndex` 是行，`columnIndex` 是列，均从 0 开始。快照可能没有格子坐标，此时为 `null`；`position` 是游戏坐标，不能当作行列。`BoardSubject` 可传格子、实体句柄或快照。快照不会随游戏更新。

```ts
export interface EntitySnapshot {
    id: string
    kind: EntityKind
    className: string
    codename: string | null
    nodeName: string
    numericId: number | null
    laneIndex: number | null
    columnIndex: number | null
    position: { x: number; y: number; z: number } | null
    alive: boolean
    health: EntityHealth | null
    
    team: Team
    
    targetTeam: Team
    capabilities: EntityCapabilities
}
```

## BoardCell

字段含义与用法见 [EntitySnapshot](#entitysnapshot)。

```ts
export interface BoardCell {
    readonly laneIndex: number
    readonly columnIndex: number
}
```

## ActionOptions

`required` 默认不启用：动作失败时检查结果中的 `ok/reason`。设为 true 后，动作失败会抛异常，适合无法继续执行的必需步骤，不适合忽略失败的批量操作。

```ts
export interface ActionOptions {
    required?: boolean
}
```

## DamageOptions

`amount` 在调用伤害方法时传入；这里配置伤害类型、来源和表现。`source` 是实体句柄，`tags` 是作者自定的伤害标签，供伤害规则匹配。`damageType`、护甲和音效选项依赖目标支持情况；不需要改变原生行为时省略。

```ts
export interface DamageOptions extends ActionOptions {
    damageType?: string | number
    
    source?: EntityHandle
    
    tags?: readonly string[]
    armorProtection?: boolean
    armorKnockSound?: boolean
    bodyKnockSound?: boolean
    direction?: unknown
    flash?: boolean
    armorAlsoDamagedWhenNotProtecting?: boolean
}
```

## HealOptions

字段含义与用法见 [ActionOptions](#actionoptions)。

```ts
export interface HealOptions {
    required?: boolean
}
```

## ActionResult

`ok` 表示动作调用是否成功，不保证造成了变化。伤害／治疗看 `accepted` 和 `appliedAmount`；收集看 `accepted/collected`。`requestedAmount` 是请求值，`finalAmount` 是修正后提交值，`appliedAmount` 是同步观察到的实际变化。`reason/error` 用于失败诊断。延迟伤害不会自动计入本次同步结果。

```ts
export interface ActionResult<T = unknown> {
    ok: boolean
    methodName: string | null
    value: T | undefined
    reason: 'method-not-found' | 'method-threw' | 'damage-adapter-unavailable' | string | null
    error?: unknown
    requestedAmount?: number
    observed?: EntityHealthObservation
}
```

## CollectActionResult

字段含义与用法见 [ActionResult](#actionresult)。

```ts
export interface CollectActionResult<T = unknown> extends ActionResult<T> {
    
    accepted: boolean
    
    collected: boolean
}
```

## ObservedAmountActionResult

字段含义与用法见 [ActionResult](#actionresult)。

```ts
export interface ObservedAmountActionResult<T = unknown> extends ActionResult<T> {
    
    accepted: boolean
    
    appliedAmount: number
}
```

## DamageActionResult

字段含义与用法见 [ActionResult](#actionresult)。

```ts
export interface DamageActionResult<T = unknown> extends ObservedAmountActionResult<T> {
    
    finalAmount: number
    combat: CombatDamageRequest
}
```

## HealActionResult

字段含义与用法见 [ActionResult](#actionresult)。

```ts
export interface HealActionResult<T = unknown> extends ObservedAmountActionResult<T> {}
```

## EntityHealthChangeKind

`coreDelta/secondaryDelta/totalDelta` 为变化后减变化前，减少时为负。`amount` 描述变化量；未知时可为 null。`redistribution` 表示各层发生变化但总量未增减。观察事件说明前后差异，不保证能识别每次攻击及其来源。

```ts
export type EntityHealthChangeKind = 'damage' | 'healing' | 'redistribution' | 'unchanged'
```

## EntityHealthChange

字段含义与用法见 [EntityHealthChangeKind](#entityhealthchangekind)。

```ts
export interface EntityHealthChange {
    change: EntityHealthChangeKind
    amount: number | null
    totalDelta: number | null
    coreDelta: number | null
    secondaryDelta: number | null
    affectedLayers: ReadonlyArray<'core' | 'secondary'>
    depleted: boolean
}
```

## EntityHealthObservation

字段含义与用法见 [EntityHealthChangeKind](#entityhealthchangekind)。

```ts
export interface EntityHealthObservation extends EntityHealthChange {
    before: { alive: boolean; health: EntityHealth | null }
    after: { alive: boolean; health: EntityHealth | null }
}
```

## EntityInactiveEvent

字段含义与用法见 [EntityHandle](#entityhandle)。

```ts
export interface EntityInactiveEvent {
    readonly type: 'disposed' | 'retired'
    readonly reason: string
    readonly entity: EntityHandle
}
```

## EntityHandle

句柄由 `entities` 查询或 `spawns` 返回，不要自行构造。延迟操作前重新检查 `isAlive()`；对象消失或被游戏回收后，旧句柄不应继续使用。`snapshot/getHealth` 只读；`damage/heal/collect/eliminate` 执行动作。`onInactive` 返回取消监听函数。`eliminate` 是移除操作，不保证等同于正常击杀与奖励。

```ts
export interface EntityHandle {
    readonly id: string
    readonly kind: EntityKind
    readonly className: string
    readonly codename: string | null
    readonly signal: AbortSignal | null
    onInactive(listener: (event: EntityInactiveEvent) => MaybePromise<void>, options?: SubscriptionOptions): () => boolean
    snapshot(): EntitySnapshot
    getHealth(): EntityHealth | null
    getCapabilities(): EntityCapabilities
    supports(action: EntityAction | string): boolean
    isAlive(): boolean
    damage(amount: number, options?: DamageOptions): DamageActionResult
    heal(amount: number, options?: HealOptions): HealActionResult
    eliminate(options?: ActionOptions): ActionResult
    collect(options?: ActionOptions): CollectActionResult
    moveToCell(laneIndex: number, columnIndex: number): boolean
}
```

## BoardSubject

字段含义与用法见 [EntitySnapshot](#entitysnapshot)。

```ts
export type BoardSubject = BoardCell | EntityHandle | EntitySnapshot
```

## EntityQuery

省略条件表示不按该项筛选。用 `kind` 选类别，`codename` 选品种，行列选位置，`capabilities` 要求对象支持指定动作，`filter` 处理自己的额外条件。同一条件的单复数写法选一种即可；不要把显示名称当作 `codename`。

```ts
export interface EntityQuery {
    kind?: EntityKind | EntityKind[]
    kinds?: EntityKind | EntityKind[]
    laneIndex?: number
    columnIndex?: number
    around?: BoardSubject
    center?: BoardSubject
    alive?: boolean
    team?: Team | Team[]
    teams?: Team | Team[]
    targetTeam?: Team | Team[]
    targetTeams?: Team | Team[]
    codename?: string | string[]
    codenames?: string | string[]
    capability?: EntityAction | EntityAction[]
    capabilities?: EntityAction | EntityAction[]
    filter?: (handle: EntityHandle) => boolean
}
```

## EntityWatchEventBase

`list/listInLane/listInCell` 返回当前匹配的句柄数组；无匹配为 `[]`。`findNearest` 无结果返回 null。`watch` 回调区分 added/changed/removed，removed 的 `current` 为 null。`intervalMs` 是真实毫秒；`fields` 可缩小变化监听范围。`watchHealth` 观察血量差异。监听方法返回取消函数，模组停用也会清理。

```ts
export interface EntityWatchEventBase {
    changes: ReadonlyArray<'presence' | 'generation' | 'identity' | 'grid' | 'position' | 'health' | 'alive' | 'team' | 'capabilities' | string>
    handle: EntityHandle
    sceneName: string | null
    timestamp: number
}
```

## EntityWatchEvent

字段含义与用法见 [EntityWatchEventBase](#entitywatcheventbase)。

```ts
export type EntityWatchEvent = EntityWatchEventBase & (
    | { type: 'added'; previous: null; current: EntitySnapshot }
    | { type: 'changed'; previous: EntitySnapshot; current: EntitySnapshot }
    | { type: 'removed'; previous: EntitySnapshot; current: null }
)
```

## EntityWatchOptions

字段含义与用法见 [EntityWatchEventBase](#entitywatcheventbase)。

```ts
export interface EntityWatchOptions extends SubscriptionOptions {
    intervalMs?: number
    emitInitial?: boolean
    emitRemoved?: boolean
    fields?: Array<'identity' | 'grid' | 'position' | 'health' | 'alive' | 'team' | 'capabilities'>
}
```

## EntityHealthWatchEvent

字段含义与用法见 [EntityHealthChangeKind](#entityhealthchangekind)。

```ts
export interface EntityHealthWatchEvent extends EntityHealthChange {
    type: 'health-changed'
    handle: EntityHandle
    before: EntityHealth | null
    after: EntityHealth | null
    previous: EntitySnapshot
    current: EntitySnapshot
    sceneName: string | null
    timestamp: number
}
```

## EntitiesApi

字段含义与用法见 [EntityWatchEventBase](#entitywatcheventbase)。

```ts
export interface EntitiesApi {
    list(query?: EntityQuery): EntityHandle[]
    findNearest(subject: EntityHandle | EntitySnapshot, query?: EntityQuery): EntityHandle | null
    describe(subject: EntityHandle | EntitySnapshot): EntitySnapshot | null
    listInLane(laneIndex: number, kind?: EntityKind): EntityHandle[]
    listInCell(laneIndex: number, columnIndex: number, query?: EntityQuery): EntityHandle[]
    listInCell(subject: BoardSubject, query?: EntityQuery): EntityHandle[]
    watch(query: EntityQuery, listener: (event: EntityWatchEvent) => MaybePromise<void>, options?: EntityWatchOptions): () => boolean
    watchHealth(query: EntityQuery, listener: (event: EntityHealthWatchEvent) => MaybePromise<void>, options?: Omit<EntityWatchOptions, 'fields' | 'emitInitial' | 'emitRemoved'>): () => boolean
    getCapabilities(target: EntityHandle): EntityCapabilities
    supports(target: EntityHandle, action: EntityAction | string): boolean
    isAlive(target: EntityHandle): boolean
}
```

### 只监听新增对象

以下代码单独作为 `scripts/main.js`；清单见[作者入门](./gp-next-js.md)。

完整入口。fields 限制观察的变化范围，emitInitial 关闭已有对象的初始通知。不要在每次 changed 回调中反复注册相同任务。

```js
export default {
  setup(ctx) {
    ctx.entities.watch({ kind: 'zombie', alive: true }, event => {
      if (event.type !== 'added') return
      ctx.log.info(event.current.codename ?? event.current.className)
    }, { emitInitial: false, fields: ['identity'] })
  }
}
```

## ActionsApi

这里的方法与实体句柄上的动作对应，但第一个参数显式传入 `target`。数量使用游戏自身数值单位；移动使用从 0 开始的行列，返回 boolean 表示是否成功。行动前检查能力，行动后检查返回结果，二者不能互相替代。

```ts
export interface ActionsApi {
    getCapabilities(target: EntityHandle): EntityCapabilities
    supports(target: EntityHandle, action: EntityAction | string): boolean
    damage(target: EntityHandle, amount: number, options?: DamageOptions): DamageActionResult
    heal(target: EntityHandle, amount: number, options?: HealOptions): HealActionResult
    eliminate(target: EntityHandle, options?: ActionOptions): ActionResult
    collect(target: EntityHandle, options?: ActionOptions): CollectActionResult
    moveToCell(target: EntityHandle, laneIndex: number, columnIndex: number): boolean
    isAlive(target: EntityHandle): boolean
}
```

## CombatModifierPhase

`id` 是本模组内的规则名。先执行 source 阶段，再执行 target 阶段；同阶段 priority 较大的先执行。`subject` 将规则绑定到一个具体实体。`match` 按来源、目标、类型或标签筛选。add 加数值，multiply 乘倍率，clamp 限上下界，block 阻止；填写对应操作要求的字段。

```ts
export type CombatModifierPhase = 'source' | 'target'
```

## CombatModifierOperation

字段含义与用法见 [CombatModifierPhase](#combatmodifierphase)。

```ts
export type CombatModifierOperation = 'add' | 'multiply' | 'clamp' | 'block'
```

## CombatMatchValue

字段含义与用法见 [CombatModifierPhase](#combatmodifierphase)。

```ts
export type CombatMatchValue<T> = T | readonly T[]
```

## CombatModifierMatch

字段含义与用法见 [CombatModifierPhase](#combatmodifierphase)。

```ts
export interface CombatModifierMatch {
    damageType?: CombatMatchValue<string | number>
    damageTypes?: CombatMatchValue<string | number>
    tagsAll?: CombatMatchValue<string>
    tagsAny?: CombatMatchValue<string>
    sourceKind?: CombatMatchValue<EntityKind>
    sourceKinds?: CombatMatchValue<EntityKind>
    sourceCodename?: CombatMatchValue<string>
    sourceCodenames?: CombatMatchValue<string>
    sourceTeam?: CombatMatchValue<Team>
    sourceTeams?: CombatMatchValue<Team>
    targetKind?: CombatMatchValue<EntityKind>
    targetKinds?: CombatMatchValue<EntityKind>
    targetCodename?: CombatMatchValue<string>
    targetCodenames?: CombatMatchValue<string>
    targetTeam?: CombatMatchValue<Team>
    targetTeams?: CombatMatchValue<Team>
}
```

## CombatModifierDefinitionBase

字段含义与用法见 [CombatModifierPhase](#combatmodifierphase)。

```ts
export interface CombatModifierDefinitionBase {
    id: string
    phase: CombatModifierPhase
    priority?: number
    
    subject?: EntityHandle
    match?: CombatModifierMatch
}
```

## CombatModifierDefinition

字段含义与用法见 [CombatModifierPhase](#combatmodifierphase)。

```ts
export type CombatModifierDefinition =
    | (CombatModifierDefinitionBase & { operation: 'add'; value: number })
    | (CombatModifierDefinitionBase & { operation: 'multiply'; value: number })
    | (CombatModifierDefinitionBase & { operation: 'clamp'; min?: number; max?: number })
    | (CombatModifierDefinitionBase & { operation: 'block'; reason?: string })
```

## NormalizedCombatModifierMatch

字段含义与用法见 [CombatModifierHandle](#combatmodifierhandle)。

```ts
export interface NormalizedCombatModifierMatch {
    readonly damageTypes: readonly string[]
    readonly tagsAll: readonly string[]
    readonly tagsAny: readonly string[]
    readonly sourceKinds: readonly string[]
    readonly sourceCodenames: readonly string[]
    readonly sourceTeams: readonly Team[]
    readonly targetKinds: readonly string[]
    readonly targetCodenames: readonly string[]
    readonly targetTeams: readonly Team[]
}
```

## CombatModifierMetadata

字段含义与用法见 [CombatModifierHandle](#combatmodifierhandle)。

```ts
export interface CombatModifierMetadata {
    readonly id: string
    readonly owner: string
    readonly phase: CombatModifierPhase
    readonly priority: number
    readonly operation: CombatModifierOperation
    readonly value: number | null
    readonly min: number | null
    readonly max: number | null
    readonly reason: string | null
    readonly subjectScoped: boolean
    readonly match: NormalizedCombatModifierMatch
}
```

## CombatModifierState

字段含义与用法见 [CombatModifierHandle](#combatmodifierhandle)。

```ts
export interface CombatModifierState extends CombatModifierMetadata {
    readonly active: boolean
    readonly state: 'active' | 'disposed' | string
    readonly stateReason: string | null
}
```

## CombatModifierHandle

`owner` 标识提供规则的模组，`active/isActive()` 表示仍在生效。`dispose(reason?)` 提前移除本规则；停用提供方也会移除。返回的规则快照和标准化匹配数组只用于查看，不可通过修改它们来更新规则。

```ts
export interface CombatModifierHandle {
    readonly id: string
    readonly owner: string
    readonly phase: CombatModifierPhase
    readonly signal: AbortSignal
    isActive(): boolean
    snapshot(): CombatModifierState
    dispose(reason?: string): boolean
}
```

## CombatModifierApplication

`applications` 按实际顺序记录每条规则处理前后的数值；`blocked/blockReason` 解释为何被拦截。`source` 可以为 null，不要假定每次都有攻击者。最终是否扣血仍看事件 `result.accepted/appliedAmount`。

```ts
export interface CombatModifierApplication {
    readonly id: string
    readonly owner: string
    readonly phase: CombatModifierPhase
    readonly operation: CombatModifierOperation
    readonly before: number
    readonly after: number
    readonly blocked: boolean
    readonly reason: string | null
}
```

## CombatEntityIdentitySnapshot

字段含义与用法见 [CombatModifierApplication](#combatmodifierapplication)。

```ts
export interface CombatEntityIdentitySnapshot {
    readonly kind: EntityKind
    readonly codename: string | null
    readonly team: Team
}
```

## CombatDamageRequest

字段含义与用法见 [CombatModifierApplication](#combatmodifierapplication)。

```ts
export interface CombatDamageRequest {
    readonly source: EntityHandle | null
    readonly target: EntityHandle | null
    readonly sourceSnapshot: CombatEntityIdentitySnapshot | null
    readonly targetSnapshot: CombatEntityIdentitySnapshot | null
    readonly requestedAmount: number
    readonly amount: number
    readonly damageType: string
    readonly tags: readonly string[]
    readonly blocked: boolean
    readonly blockReason: string | null
    readonly applications: readonly CombatModifierApplication[]
}
```

## CombatDamageResolvedEvent

字段含义与用法见 [CombatModifierApplication](#combatmodifierapplication)。

```ts
export interface CombatDamageResolvedEvent {
    readonly type: 'damage-resolved'
    readonly request: CombatDamageRequest
    readonly result: Readonly<{
        ok: boolean
        accepted: boolean
        reason: string | null
        requestedAmount: number
        finalAmount: number
        appliedAmount: number
        observed?: EntityHealthObservation
    }>
    readonly timestamp: number
}
```

## CombatCapabilities

**范围：只处理通过 API 发起的伤害。** `modifiers.add` 返回可用 `dispose()` 移除的规则句柄；`list` 查看规则，`watchDamage` 监听这类伤害的处理结果。它们不拦截全部原版攻击，不能直接用来实现全局伤害倍率。

```ts
export interface CombatCapabilities {
    readonly available: true
    readonly coverage: 'api-actions-only'
    readonly nativeInterception: false
    readonly sourceAttribution: true
    readonly typedDamage: true
    readonly operations: readonly CombatModifierOperation[]
}
```

## CombatApi

字段含义与用法见 [CombatCapabilities](#combatcapabilities)。

```ts
export interface CombatApi {
    getCapabilities(): CombatCapabilities
    readonly modifiers: {
        add(definition: CombatModifierDefinition): CombatModifierHandle
        list(): readonly CombatModifierMetadata[]
    }
    watchDamage(listener: (event: CombatDamageResolvedEvent) => MaybePromise<void>, options?: SubscriptionOptions): () => boolean
}
```

## SpawnKind

`spawn` 需要 `kind`（类别）、`type`（已存在或已注册的类型标识）和 `at`（格子）。投射物还必须提供 `targetSide` 与 `motion`。先检查 `supports(kind)`，再 await 生成并判断 `ok`；支持类别不保证任意类型名称都有效。

```ts
export type SpawnKind = 'plant' | 'zombie' | 'projectile' | 'resource' | 'tomb' | 'tile-liquid'
```

## CellSpawnKind

字段含义与用法见 [SpawnKind](#spawnkind)。

```ts
export type CellSpawnKind = Exclude<SpawnKind, 'projectile'>
```

## ProjectileTargetSide

字段含义与用法见 [SpawnKind](#spawnkind)。

```ts
export type ProjectileTargetSide = Exclude<Team, 'neutral' | 'unknown'>
```

## LinearProjectileMotion

`columnsPerSecond` 为每游戏秒向右移动的格数，负数向左；`lanesPerSecond` 按行号递增方向为正。`heightInCells` 是以格子高度计的初始高度，默认 0.5。当前稳定运动形式只有 linear。

```ts
export interface LinearProjectileMotion {
    kind: 'linear'
    
    velocity: { columnsPerSecond: number; lanesPerSecond: number }
    
    heightInCells?: number
}
```

## SpawnDescriptorBase

字段含义与用法见 [SpawnKind](#spawnkind)。

```ts
export interface SpawnDescriptorBase<K extends SpawnKind = SpawnKind> {
    kind: K
    type: string
    at: BoardCell
    
    required?: boolean
}
```

## CellSpawnDescriptor

字段含义与用法见 [SpawnKind](#spawnkind)。

```ts
export interface CellSpawnDescriptor extends SpawnDescriptorBase<CellSpawnKind> {
    targetSide?: never
    motion?: never
}
```

## ProjectileSpawnDescriptor

字段含义与用法见 [SpawnKind](#spawnkind)。

```ts
export interface ProjectileSpawnDescriptor extends SpawnDescriptorBase<'projectile'> {
    
    targetSide: ProjectileTargetSide
    
    motion: LinearProjectileMotion
}
```

## SpawnDescriptor

字段含义与用法见 [SpawnKind](#spawnkind)。

```ts
export type SpawnDescriptor = CellSpawnDescriptor | ProjectileSpawnDescriptor
```

## SpawnCapability

成功时 `entities` 至少有一个句柄，不要假定永远只有一个。失败时数组为空，读取 `reason/message`。`dispose()` 异步清理这次生成的对象；`disposed` 表示已清理。能力的 `types: []` 可能表示类型来自游戏数据，不是一定无可用类型。

```ts
export interface SpawnCapability<K extends SpawnKind = SpawnKind> {
    kind: K
    adapter: string | null
    native: boolean
    available: boolean
    reason: string | null
    placements: readonly string[]
    motionKinds: readonly string[]
    targetSides: readonly ProjectileTargetSide[]
    
    types: readonly string[]
    message: string | null
}
```

## SpawnDisposeResult

字段含义与用法见 [SpawnCapability](#spawncapability)。

```ts
export interface SpawnDisposeResult {
    ok: boolean
    disposed: boolean
    results: readonly unknown[]
}
```

## SpawnResult

字段含义与用法见 [SpawnCapability](#spawncapability)。

```ts
export type SpawnResult<K extends SpawnKind = SpawnKind> =
    | {
        readonly ok: true
        readonly kind: K
        readonly type: string
        readonly adapter: string
        readonly native: boolean
        readonly entities: readonly [EntityHandle, ...EntityHandle[]]
        readonly reason: null
        readonly message: null
        readonly disposed: boolean
        dispose(reason?: string): Promise<SpawnDisposeResult>
    }
    | {
        readonly ok: false
        readonly kind: K
        readonly type: string
        readonly adapter: string | null
        readonly native: boolean
        readonly entities: readonly []
        readonly reason: string
        readonly message: string | null
        readonly disposed: true
        dispose(reason?: string): Promise<SpawnDisposeResult>
    }
```

## SpawnsApi

字段含义与用法见 [SpawnKind](#spawnkind)。

```ts
export interface SpawnsApi {
    getCapabilities(): Readonly<Record<SpawnKind, SpawnCapability>>
    supports(kind: string): kind is SpawnKind
    spawn<D extends SpawnDescriptor>(descriptor: D): Promise<SpawnResult<D['kind']>>
}
```

## StatusEffect

`duration` 使用游戏秒，跟随暂停和加速。普通效果提供 effect/duration；poison 还需 `damagePerSecond`，`propagation: contact` 表示接触传播。先检查目标是否 supports；清除单个效果还要检查 clearable。普通 `clear/clearAll` 操作目标状态，可能涉及别的来源；只撤销自己的效果应优先使用 layers。

```ts
export type StatusEffect = 'stun' | 'chill' | 'freeze' | 'butter' | 'dark-matter' | 'perfume' | 'chili-stun' | 'glittering' | 'sap' | 'poison'
```

## DurationStatusEffect

字段含义与用法见 [StatusEffect](#statuseffect)。

```ts
export type DurationStatusEffect = Exclude<StatusEffect, 'poison'>
```

## DurationStatusDescriptor

字段含义与用法见 [StatusEffect](#statuseffect)。

```ts
export interface DurationStatusDescriptor {
    effect: DurationStatusEffect
    duration: number
    damagePerSecond?: never
    propagation?: never
    required?: boolean
}
```

## PoisonStatusDescriptor

字段含义与用法见 [StatusEffect](#statuseffect)。

```ts
export interface PoisonStatusDescriptor {
    effect: 'poison'
    duration: number
    
    damagePerSecond: number
    
    propagation?: 'none' | 'contact'
    required?: boolean
}
```

## StatusDescriptor

字段含义与用法见 [StatusEffect](#statuseffect)。

```ts
export type StatusDescriptor = DurationStatusDescriptor | PoisonStatusDescriptor
```

## StatusEffectCapability

`available` 是支持读取或操作，`active` 是效果正在生效，二者不同。`remaining` 为剩余游戏秒，未知为 null。`clearable` 表示可安全清除该效果，`targetActive` 表示目标句柄仍有效。

```ts
export interface StatusEffectCapability {
    effect: StatusEffect
    available: boolean
    adapter: string | null
    
    clearable: boolean
}
```

## StatusEffectState

字段含义与用法见 [StatusEffectCapability](#statuseffectcapability)。

```ts
export interface StatusEffectState {
    effect: StatusEffect
    available: boolean
    adapter: string | null
    active: boolean
    
    remaining: number | null
    
    details: Readonly<Record<string, unknown>> | null
}
```

## StatusSnapshot

字段含义与用法见 [StatusEffectCapability](#statuseffectcapability)。

```ts
export interface StatusSnapshot {
    effects: Readonly<Record<string, StatusEffectState>>
    clearAll: boolean
    
    targetActive: boolean
}
```

## StatusTransitionChange

检查 `ok` 后，再看实际 `appliedEffect`、`extended` 或 `cleared`。`before/after` 是状态快照，`changes` 包含该操作同时改变的其他效果；不是保证只改变请求的一个字段。失败原因在 `reason/message`。

```ts
export type StatusTransitionChange = 'activated' | 'deactivated' | 'extended' | 'shortened' | 'adapter' | 'details'
```

## StatusEffectTransition

字段含义与用法见 [StatusTransitionChange](#statustransitionchange)。

```ts
export interface StatusEffectTransition {
    effect: StatusEffect
    changes: readonly StatusTransitionChange[]
    before: StatusEffectState
    after: StatusEffectState
}
```

## StatusApplyResult

字段含义与用法见 [StatusTransitionChange](#statustransitionchange)。

```ts
export interface StatusApplyResult {
    ok: boolean
    effect: StatusEffect
    appliedEffect: StatusEffect | null
    adapter: string | null
    methodName: string | null
    requestedDuration: number | null
    extended: boolean
    before: StatusSnapshot | null
    after: StatusSnapshot | null
    
    changes: readonly StatusEffectTransition[]
    reason: string | null
    message: string | null
}
```

## StatusClearResult

字段含义与用法见 [StatusTransitionChange](#statustransitionchange)。

```ts
export interface StatusClearResult {
    ok: boolean
    methodName: string | null
    before: StatusSnapshot | null
    after: StatusSnapshot | null
    changes: readonly StatusEffectTransition[]
    reason: string | null
    message: string | null
}
```

## StatusEffectClearResult

字段含义与用法见 [StatusTransitionChange](#statustransitionchange)。

```ts
export interface StatusEffectClearResult extends StatusClearResult {
    effect: StatusEffect
    adapter: string | null
    cleared: boolean
}
```

## StatusWatchEventType

watch 事件为 started/ended/updated。`effects` 限制关注的效果；`emitInitial` 可为已有状态发送初始事件。`intervalMs` 默认 100，范围 50–10000，单位真实毫秒。`expired-or-cleared` 不区分自然结束和被清除。

```ts
export type StatusWatchEventType = 'started' | 'ended' | 'updated'
```

## StatusWatchChange

字段含义与用法见 [StatusWatchEventType](#statuswatcheventtype)。

```ts
export type StatusWatchChange = 'initial' | 'active' | 'adapter' | 'details' | 'remaining'
```

## StatusWatchReason

字段含义与用法见 [StatusWatchEventType](#statuswatcheventtype)。

```ts
export type StatusWatchReason = 'initial' | 'activated' | 'expired-or-cleared' | 'target-inactive' | 'extended-or-updated'
```

## StatusWatchEvent

字段含义与用法见 [StatusWatchEventType](#statuswatcheventtype)。

```ts
export interface StatusWatchEvent {
    type: StatusWatchEventType
    effect: StatusEffect
    target: EntityHandle
    previous: StatusEffectState | null
    current: StatusEffectState
    changes: readonly StatusWatchChange[]
    reason: StatusWatchReason
    timestamp: number
}
```

## StatusWatchOptions

字段含义与用法见 [StatusWatchEventType](#statuswatcheventtype)。

```ts
export interface StatusWatchOptions extends SubscriptionOptions {
    
    effects?: readonly StatusEffect[]
    
    intervalMs?: number
    
    emitInitial?: boolean
}
```

## StatusLayerEffect

独立效果层当前支持 poison 和 speed-multiplier。两者的 duration 都是游戏秒；前者填写每秒伤害，后者填写 0–10 的速度倍率（0.5 为半速）。用 `layers.supports` 检查；普通 status 支持某效果不代表独立层也支持。

```ts
export type StatusLayerEffect = 'poison' | 'speed-multiplier'
```

## PoisonStatusLayerDetails

字段含义与用法见 [StatusLayerEffect](#statuslayereffect)。

```ts
export interface PoisonStatusLayerDetails {
    damagePerSecond: number
}
```

## SpeedMultiplierStatusLayerDetails

字段含义与用法见 [StatusLayerEffect](#statuslayereffect)。

```ts
export interface SpeedMultiplierStatusLayerDetails {
    multiplier: number
}
```

## StatusLayerDetailsByEffect

字段含义与用法见 [StatusLayerEffect](#statuslayereffect)。

```ts
export interface StatusLayerDetailsByEffect {
    poison: PoisonStatusLayerDetails
    'speed-multiplier': SpeedMultiplierStatusLayerDetails
}
```

## StatusLayerCapability

apply 成功才有 `layer`。`layer.dispose()` 仅移除本次创建的效果层，不清除其他来源。过期或模组停用也会清理；`getState()` 可读剩余时间和效果参数。`sourceOwned` 表示支持这种按来源清理的能力。

```ts
export interface StatusLayerCapability {
    effect: StatusLayerEffect
    available: boolean
    adapter: string | null
    
    sourceOwned: boolean
}
```

## StatusLayerState

字段含义与用法见 [StatusLayerCapability](#statuslayercapability)。

```ts
export type StatusLayerState<E extends StatusLayerEffect = StatusLayerEffect> = {
    [K in E]: {
        effect: K
        active: boolean
        
        remaining: number
        details: Readonly<StatusLayerDetailsByEffect[K]>
        reason: string | null
    }
}[E]
```

## StatusLayerDisposeResult

字段含义与用法见 [StatusLayerCapability](#statuslayercapability)。

```ts
export interface StatusLayerDisposeResult<E extends StatusLayerEffect = StatusLayerEffect> {
    ok: boolean
    disposed: boolean
    before: StatusLayerState<E>
    after: StatusLayerState<E>
    reason: string | null
}
```

## StatusLayerHandle

字段含义与用法见 [StatusLayerCapability](#statuslayercapability)。

```ts
export interface StatusLayerHandle<E extends StatusLayerEffect = StatusLayerEffect> {
    readonly effect: E
    readonly target: EntityHandle
    isActive(): boolean
    getState(): StatusLayerState<E>
    
    dispose(): StatusLayerDisposeResult<E>
}
```

## PoisonStatusLayerDescriptor

字段含义与用法见 [StatusLayerEffect](#statuslayereffect)。

```ts
export interface PoisonStatusLayerDescriptor {
    effect: 'poison'
    duration: number
    damagePerSecond: number
    required?: boolean
}
```

## SpeedMultiplierStatusLayerDescriptor

字段含义与用法见 [StatusLayerEffect](#statuslayereffect)。

```ts
export interface SpeedMultiplierStatusLayerDescriptor {
    effect: 'speed-multiplier'
    duration: number
    
    multiplier: number
    required?: boolean
}
```

## StatusLayerDescriptor

字段含义与用法见 [StatusLayerEffect](#statuslayereffect)。

```ts
export type StatusLayerDescriptor = PoisonStatusLayerDescriptor | SpeedMultiplierStatusLayerDescriptor
```

## StatusLayerApplyResult

字段含义与用法见 [StatusLayerCapability](#statuslayercapability)。

```ts
export type StatusLayerApplyResult<E extends StatusLayerEffect = StatusLayerEffect> =
    | {
        ok: true
        effect: E
        adapter: string
        layer: StatusLayerHandle<E>
        state: StatusLayerState<E>
        reason: null
        message: null
    }
    | {
        ok: false
        effect: E
        adapter: string | null
        layer: null
        state: null
        reason: string
        message: string | null
    }
```

## StatusLayerApi

字段含义与用法见 [StatusLayerEffect](#statuslayereffect)。

```ts
export interface StatusLayerApi {
    getCapabilities(target: EntityHandle): {
        effects: Readonly<Record<string, StatusLayerCapability>>
    }
    supports(target: EntityHandle, effect: string): effect is StatusLayerEffect
    apply(target: EntityHandle, descriptor: PoisonStatusLayerDescriptor): StatusLayerApplyResult<'poison'>
    apply(target: EntityHandle, descriptor: SpeedMultiplierStatusLayerDescriptor): StatusLayerApplyResult<'speed-multiplier'>
}
```

### 只撤销自己施加的减速

以下代码单独作为 `scripts/main.js`；清单见[作者入门](./gp-next-js.md)。

完整入口。玩家点击按钮，对当前第一个支持独立减速层的僵尸施加 3 秒半速。失败时记录原因；需要提前取消时调用返回的 layer.dispose()。

```js
export default {
  setup(ctx) {
    ctx.controls.definePanel({ title: 'Effects', groups: [{ title: 'Actions', items: [{
      key: 'slow', type: 'action', label: 'Slow a zombie',
      onClick() {
        const target = ctx.entities.list({ kind: 'zombie', alive: true })
          .find(entity => ctx.status.layers.supports(entity, 'speed-multiplier'))
        if (!target) return
        const result = ctx.status.layers.apply(target, {
          effect: 'speed-multiplier', duration: 3, multiplier: 0.5
        })
        if (!result.ok) ctx.log.warn(result.reason)
      }
    }] }] })
  }
}
```

## StatusApi

字段含义与用法见 [StatusEffect](#statuseffect)。

```ts
export interface StatusApi {
    
    readonly layers: StatusLayerApi
    getCapabilities(target: EntityHandle): {
        effects: Readonly<Record<string, StatusEffectCapability>>
        clearAll: boolean
    }
    getState(target: EntityHandle): StatusSnapshot
    supports(target: EntityHandle, effect: string): effect is StatusEffect
    apply(target: EntityHandle, descriptor: StatusDescriptor): StatusApplyResult
    clear(target: EntityHandle, effect: StatusEffect, options?: { required?: boolean }): StatusEffectClearResult
    clearAll(target: EntityHandle, options?: { required?: boolean }): StatusClearResult
    watch(target: EntityHandle, listener: (event: StatusWatchEvent) => MaybePromise<void>, options?: StatusWatchOptions): () => boolean
}
```

## ProjectileImpactKind

监听受支持的投射物命中，不是监听所有伤害。`source` 为投射物，`target` 为命中对象；direct 是直接命中，splash 是范围命中，unclassified 是未分类。`sourceTypes/targetKinds/impactKinds` 缩小监听范围。能力显示 partial/unknown 时不能当作完整覆盖。

```ts
export type ProjectileImpactKind = 'direct' | 'splash' | 'unclassified'
```

## ProjectileImpactEvent

字段含义与用法见 [ProjectileImpactKind](#projectileimpactkind)。

```ts
export interface ProjectileImpactEvent {
    type: 'projectile-impact'
    impactKind: ProjectileImpactKind
    targetKind: 'plant' | 'zombie' | 'tomb'
    accepted: boolean
    source: EntityHandle
    target: EntityHandle
    sourceBefore: EntitySnapshot
    sourceSnapshot: EntitySnapshot
    targetBefore: EntitySnapshot
    targetAfter: EntitySnapshot
    health: EntityHealthChange
    sceneName: string | null
    timestamp: number
}
```

## ProjectileImpactCapabilities

字段含义与用法见 [ProjectileImpactKind](#projectileimpactkind)。

```ts
export interface ProjectileImpactCapabilities {
    available: boolean
    adapter: string | null
    sourceKinds: readonly ['projectile']
    sourceDomains: readonly string[]
    overrideAudit: Readonly<{
        available: boolean
        complete: boolean
        coverage: 'audited' | 'partial' | 'unknown'
        scannedModules: number
        discoveredOverrideClasses: number
        
        uncovered: readonly Readonly<{
            modulePath: string
            exportName: string
            className: string
            methods: readonly string[]
        }>[]
    }>
    targetKinds: Readonly<Record<'plant' | 'zombie' | 'tomb', Readonly<{
        direct: boolean
        splash: boolean
        unclassified: boolean
    }>>>
    reason: string | null
}
```

## ProjectileImpactWatchOptions

字段含义与用法见 [ProjectileImpactKind](#projectileimpactkind)。

```ts
export interface ProjectileImpactWatchOptions extends SubscriptionOptions {
    sourceType?: string | string[]
    sourceTypes?: string | string[]
    targetKind?: 'plant' | 'zombie' | 'tomb'
    targetKinds?: Array<'plant' | 'zombie' | 'tomb'>
    impactKind?: ProjectileImpactKind
    impactKinds?: ProjectileImpactKind[]
    filter?: (event: ProjectileImpactEvent) => boolean
    priority?: number
}
```

## ImpactsApi

字段含义与用法见 [ProjectileImpactKind](#projectileimpactkind)。

```ts
export interface ImpactsApi {
    getCapabilities(): ProjectileImpactCapabilities
    supports(targetKind: 'plant' | 'zombie' | 'tomb', impactKind?: ProjectileImpactKind): boolean
    watch(listener: (event: ProjectileImpactEvent) => MaybePromise<void>, options?: ProjectileImpactWatchOptions): () => boolean
}
```

## RuntimeApi

| 方法 | 参数与结果 |
| --- | --- |
| `sleep(ms)` | 等待真实毫秒；需 await；取消会拒绝 Promise |
| `setTimeout/setInterval` | 回调、真实毫秒、可选 signal/label；返回取消函数 |
| `onDispose(cleanup)` | 停用时执行清理；返回值只注销清理，不会提前执行它 |
| `guard(callback)` | 返回停用后不再调用原回调的包装函数 |
| `track(promise)` | 跟踪任务及错误；不会使任意外部请求自动支持取消 |
| `isActive/assertActive` | 查询仍在运行，或在已停止时抛异常 |

外部请求如需取消，应把 `runtime.signal` 传给它支持的取消参数。

```ts
export interface RuntimeApi {
    readonly signal: AbortSignal
    isActive(): boolean
    assertActive(action?: string): void
    onDispose(cleanup: () => MaybePromise<void>, label?: string): () => void
    guard<T extends (...args: any[]) => any>(callback: T, options?: { label?: string }): T
    track<T>(promise: Promise<T>, options?: { label?: string }): Promise<T>
    sleep(ms: number, options?: { label?: string; signal?: AbortSignal }): Promise<void>
    setTimeout(callback: () => MaybePromise<void>, ms: number, options?: { label?: string; signal?: AbortSignal }): () => boolean
    setInterval(callback: () => MaybePromise<void>, ms: number, options?: { label?: string; signal?: AbortSignal }): () => boolean
}
```

## GameClockState

这组计时使用**游戏秒**；暂停时不消耗玩法时间，加速时跟随游戏。`onTick` 的 `deltaSeconds` 是本次推进量；不要再乘一次 scale。先检查 isAvailable；关卡外不要把时钟当作一直运行的现实时间计时器。定时方法返回取消函数，sleep 返回 Promise。

```ts
export interface GameClockState {
    readonly available: boolean
    readonly scale: number | null
    readonly paused: boolean
}
```

## GameClockTick

字段含义与用法见 [GameClockState](#gameclockstate)。

```ts
export interface GameClockTick {
    readonly deltaSeconds: number
    readonly scale: number | null
    readonly paused: boolean
    readonly frame: number
}
```

## GameClockTaskOptions

字段含义与用法见 [SubscriptionOptions](#subscriptionoptions)。

```ts
export interface GameClockTaskOptions {
    label?: string
    signal?: AbortSignal
}
```

## GameClockApi

字段含义与用法见 [GameClockState](#gameclockstate)。

```ts
export interface GameClockApi {
    isAvailable(): boolean
    getState(): GameClockState
    onTick(callback: (tick: GameClockTick) => MaybePromise<void>, options?: GameClockTaskOptions): () => boolean
    sleep(seconds: number, options?: GameClockTaskOptions): Promise<void>
    setTimeout(callback: (tick: GameClockTick) => MaybePromise<void>, seconds: number, options?: GameClockTaskOptions): () => boolean
    setInterval(callback: (tick: GameClockTick) => MaybePromise<void>, seconds: number, options?: GameClockTaskOptions): () => boolean
}
```

## SettingField

先 await `defineSchema({ fields })`，再 await get/getAll 读取。`key` 是保存用标识，更新模组时保持稳定；`label` 给玩家看；default 应匹配字段类型。number/slider 的 min/max/step 限定输入；select 的 value 是保存值，label 是显示名。`onChange` 通知写入，`onApply` 接收应用后的 values；回调支持异步。export 返回 JSON 文本，import 接受该文本或对象。

```ts
export type SettingField = {
    key: string
    label?: string
    description?: string
    default?: unknown
} & (
    | { type: 'toggle' }
    | { type: 'number' | 'slider'; min?: number; max?: number; step?: number }
    | { type: 'select'; options: Array<{ label: string; value: string }> }
    | { type: 'text' }
)
```

## SettingsChangeEvent

字段含义与用法见 [SettingField](#settingfield)。

```ts
export interface SettingsChangeEvent {
    readonly namespace: string
    readonly operation: 'set' | 'reset' | 'import'
    readonly previous: Record<string, unknown>
    readonly values: Record<string, unknown>
}
```

## SettingsApi

字段含义与用法见 [SettingField](#settingfield)。

```ts
export interface SettingsApi {
    onApply(handler: (event: { readonly namespace: string; readonly previous: Record<string, unknown>; readonly values: Record<string, unknown> }) => MaybePromise<void>, options?: SubscriptionOptions): () => boolean
    onChange(listener: (event: SettingsChangeEvent) => MaybePromise<void>, options?: SubscriptionOptions): () => boolean
    defineSchema(definition: {
        title?: string
        description?: string
        schemaVersion?: number
        fields: SettingField[]
    }): Promise<unknown>
    get<T = unknown>(key: string): Promise<T>
    getAll(): Promise<Record<string, unknown>>
    set<T = unknown>(key: string, value: T): Promise<unknown>
    reset(): Promise<unknown>
    export(): Promise<string>
    import(raw: string | object): Promise<unknown>
}
```

### 设置控制定时治疗

以下代码单独作为 `scripts/main.js`；清单见[作者入门](./gp-next-js.md)。

完整入口。开关保存在模组设置中；每 2 个游戏秒为可治疗的植物恢复 10 点生命。退出关卡时不处理，停用模组后计时器自动停止。

```js
export default {
  async setup(ctx) {
    await ctx.settings.defineSchema({
      fields: [{ key: 'healing', type: 'toggle', label: 'Healing', default: false }]
    })
    let enabled = await ctx.settings.get('healing') === true
    ctx.settings.onApply(({ values }) => { enabled = values.healing === true })
    ctx.clock.setInterval(() => {
      if (!enabled || !ctx.game.getState().running) return
      for (const plant of ctx.entities.list({ kind: 'plant', alive: true, capabilities: ['heal'] })) {
        const result = plant.heal(10)
        if (!result.ok) ctx.log.warn(result.reason)
      }
    }, 2)
  }
}
```

## ControlItemBase

面板中的 key 在本面板内唯一。action 使用 onClick；可编辑控件通过 getValue 同步读取显示值，setValue 可异步写入。不要把 Promise 从 getValue 返回。`visible/disabled` 可按当前状态计算；readonly 只展示。控件本身不保证保存，需由 setValue 调用 settings/storage 等写入。clear 清除本模组面板。

```ts
export interface ControlItemBase {
    disabled?: boolean | (() => boolean)
    visible?: boolean | (() => boolean)
    key: string
    label: string
    description?: string
}
```

## ControlItem

字段含义与用法见 [ControlItemBase](#controlitembase)。

```ts
export type ControlItem =
    | (ControlItemBase & { type: 'action'; variant?: string; onClick: () => MaybePromise<void> })
    | (ControlItemBase & { type: 'toggle'; getValue: () => boolean; setValue: (value: boolean) => MaybePromise<void> })
    | (ControlItemBase & { type: 'select'; getValue: () => string; options: Array<{ label: string; value: string }>; setValue: (value: string) => MaybePromise<void> })
    | (ControlItemBase & { type: 'number'; getValue: () => number; min?: number; max?: number; step?: number; setValue: (value: number) => MaybePromise<void> })
    | (ControlItemBase & { type: 'text'; getValue: () => string; setValue: (value: string) => MaybePromise<void> })
    | (ControlItemBase & { type: 'readonly' } & ({ value: unknown; getValue?: () => unknown } | { getValue: () => unknown }))
```

## ControlsApi

字段含义与用法见 [ControlItemBase](#controlitembase)。

```ts
export interface ControlsApi {
    definePanel(definition: {
        title: string
        description?: string
        groups: Array<{ title: string; description?: string; items: ControlItem[] }>
    }): unknown
    clear(): void
}
```

## EventsApi

on/once 返回取消函数，once 只接收一次。emitAsync 可等待异步监听器，emit 不应被当作异步完成保证。普通名称限定在当前模组；`mod:协议名:事件名` 用于跨模组协议。事件参数由发布者与使用者约定，不同模组必须采用同一格式。

```ts
export interface EventsApi {
    on(name: string, listener: (...args: any[]) => any, options?: SubscriptionOptions): () => boolean
    once(name: string, listener: (...args: any[]) => any, options?: SubscriptionOptions): () => boolean
    emit(name: string, ...args: any[]): unknown
    emitAsync(name: string, ...args: any[]): Promise<unknown>
    onDispose(cleanup: () => MaybePromise<void>, label?: string): () => void
}
```

## DataTypeInfo

| 方法／参数 | 用法 |
| --- | --- |
| `listTypes/listTypeInfos` | 查可用数据类别；type 使用返回的名称 |
| `listEntries/getEntry` | 先列条目，再用返回的 id 查询；缺失可返回 null |
| `getCurrent/getOriginal` | 当前数据／原始备份的快照 |
| `mutate(type, callback)` | 同步修改回调里的数据，或返回替换数据；不可传 async 回调 |
| `meta.current/original/info` | 回调可查询的当前数据、原始备份和类别信息 |
| `export` | 可指定原始数据及是否弹出保存；不是持久保存玩法修改 |
| `restore` | 按数据类别恢复备份；使用前考虑其他模组的修改 |
| `setObjectsData` | 用对象别名与字段名或补丁对象修改属性数据 |

`useOriginal` 选择原始备份；`autoDownload` 控制导出时保存动作。读取到 null 时先确认该数据是否已加载。改快照不会生效；改数据也不保证重建已出生的实体。

```ts
export interface DataTypeInfo {
    type: string
    kind: 'features' | 'objects' | 'lang' | 'unknown'
    category: string
}
```

## DataEntrySummary

字段含义与用法见 [DataTypeInfo](#datatypeinfo)。

```ts
export interface DataEntrySummary {
    id: string
    label: string
    name?: string
    aliases?: readonly string[]
}
```

## DataMutationMeta

字段含义与用法见 [DataTypeInfo](#datatypeinfo)。

```ts
export interface DataMutationMeta<T = unknown> {
    type: string
    current: T
    original: T | null
    info: DataTypeInfo
}
```

## ModServiceMethod

provide 的 api 是具名函数对象，id/version 用于识别协议与版本，capabilities 是提供方声明的能力名。resolve 是同步查询，失败时 service 为 null；成功后通过 service.api 调用。min/max 限定服务版本，不是游戏版本。提供方停用时 signal 中止，旧句柄失效，不能缓存后永久使用。

```ts
export type ModServiceMethod = (...args: any[]) => any
```

## ModServiceApiShape

字段含义与用法见 [ModServiceMethod](#modservicemethod)。

```ts
export type ModServiceApiShape = Record<string, ModServiceMethod>
```

## ModServiceSnapshot

字段含义与用法见 [ModServiceMethod](#modservicemethod)。

```ts
export interface ModServiceSnapshot {
    readonly id: string
    readonly version: string
    readonly provider: string
    readonly capabilities: readonly string[]
}
```

## ModServiceDefinition

字段含义与用法见 [ModServiceMethod](#modservicemethod)。

```ts
export interface ModServiceDefinition<TApi extends ModServiceApiShape> {
    id: string
    version: string
    capabilities?: readonly string[]
    api: TApi
}
```

## ModServiceRegistration

字段含义与用法见 [ModServiceMethod](#modservicemethod)。

```ts
export interface ModServiceRegistration extends ModServiceSnapshot {
    readonly signal: AbortSignal
    isActive(): boolean
    dispose(reason?: string): boolean
}
```

## ModServiceHandle

字段含义与用法见 [ModServiceMethod](#modservicemethod)。

```ts
export interface ModServiceHandle<TApi extends ModServiceApiShape = ModServiceApiShape> extends ModServiceSnapshot {
    readonly signal: AbortSignal
    readonly api: Readonly<TApi>
    isActive(): boolean
}
```

## ModServiceRequirements

字段含义与用法见 [ModServiceMethod](#modservicemethod)。

```ts
export interface ModServiceRequirements {
    minVersion?: string
    maxVersion?: string
    capabilities?: readonly string[]
    required?: boolean
}
```

## ModServiceResolveResult

字段含义与用法见 [ModServiceMethod](#modservicemethod)。

```ts
export type ModServiceResolveResult<TApi extends ModServiceApiShape = ModServiceApiShape> =
    | {
        readonly ok: true
        readonly reason: null
        readonly id: string
        readonly service: ModServiceHandle<TApi>
    }
    | {
        readonly ok: false
        readonly reason: 'not-found' | 'version-too-low' | 'version-too-high' | 'missing-capabilities' | 'provider-retiring' | string
        readonly id: string
        readonly service: null
        readonly available?: ModServiceSnapshot
        readonly missingCapabilities?: readonly string[]
    }
```

## ServicesApi

字段含义与用法见 [ModServiceMethod](#modservicemethod)。

```ts
export interface ServicesApi {
    provide<TApi extends ModServiceApiShape>(definition: ModServiceDefinition<TApi>): ModServiceRegistration
    resolve<TApi extends ModServiceApiShape = ModServiceApiShape>(id: string, requirements?: ModServiceRequirements): ModServiceResolveResult<TApi>
    list(): readonly ModServiceSnapshot[]
}
```

### 共享一个有版本的服务

以下代码单独作为 `scripts/main.js`；清单见[作者入门](./gp-next-js.md)。

以下为提供方的完整入口。使用方需要在 pack.json 的 depends 中声明提供方 uuid；服务 id 是双方约定的协议名，不是文件路径。

```js
export default {
  setup(ctx) {
    ctx.services.provide({
      id: 'yourname.text', version: '1.0.0', capabilities: ['greeting'],
      api: { greeting: name => `Hello, ${name}!` }
    })
  }
}
```

### 调用前置服务

以下代码单独作为 `scripts/main.js`；清单见[作者入门](./gp-next-js.md)。

以下是使用方入口。不要直接访问 result.service；缺少服务或版本不满足时，它是 null。示例直接在使用前查询，避免长期保留失效句柄。

```js
export default {
  setup(ctx) {
    const result = ctx.services.resolve('yourname.text', {
      minVersion: '1.0.0', capabilities: ['greeting']
    })
    if (!result.ok) throw new Error(result.reason)
    ctx.ui.toast(result.service.api.greeting('Player'))
  }
}
```

## ContentApi

字段含义与用法见 [DataTypeInfo](#datatypeinfo)。

```ts
export interface ContentApi {
    listTypes(): string[]
    listTypeInfos(): DataTypeInfo[]
    getTypeInfo(type: string): DataTypeInfo
    getCurrent<T = unknown>(type: string): T | null
    getOriginal<T = unknown>(type: string): T | null
    listEntries(type: string, query?: Pick<DataQuery, 'useOriginal'>): DataEntrySummary[]
    getEntry<T = unknown>(type: string, id: string, query?: Pick<DataQuery, 'useOriginal'>): T | null
    mutate<T = unknown>(type: string, mutator: (data: T, meta: DataMutationMeta<T>) => T | void): T | null
    hasBackup(type: string): boolean
    listBackups(): string[]
    restore(type: string): unknown
    export(type: string, useOriginal?: boolean, autoDownload?: boolean): unknown
    setObjectsData(type: string, alias: string, keyOrPatch: string | object, value?: unknown): unknown
}
```

## DataQuery

字段含义与用法见 [DataTypeInfo](#datatypeinfo)。

```ts
export interface DataQuery {
    useOriginal?: boolean
    autoDownload?: boolean
}
```

## SingleTypeDataDomain

这些是 content 的分类入口，沿用同一套只读快照／同步 mutate 规则。Features 为特征，Props 为数值属性，Type 为类型关系，Almanac 为图鉴。先用 list…Entries 获取实际 id，再 get… 查询。商店按 section 查询商品；草坪额外提供格子地图，升级额外提供路线。泛型 T 只是作者声明的数据形状，不会自动验证任意游戏 JSON。

```ts
export interface SingleTypeDataDomain {
    readonly type: string
    getData<T = unknown>(query?: DataQuery): T | null
    listEntries(query?: DataQuery): DataEntrySummary[]
    getEntry<T = unknown>(id: string, query?: DataQuery): T | null
    mutate<T = unknown>(mutator: (data: T, meta: DataMutationMeta<T>) => T | void): T | null
    export(query?: DataQuery): unknown
}
```

## PropsDataDomain

字段含义与用法见 [SingleTypeDataDomain](#singletypedatadomain)。

```ts
export interface PropsDataDomain extends SingleTypeDataDomain {
    getPropsData<T = unknown>(query?: DataQuery): T | null
    mutateProps<T = unknown>(mutator: (data: T) => void): unknown
}
```

## LawnDataDomain

字段含义与用法见 [SingleTypeDataDomain](#singletypedatadomain)。

```ts
export interface LawnDataDomain extends PropsDataDomain {
    getBoardGridMaps<T = unknown>(query?: DataQuery): T | null
    mutateBoardGridMaps<T = unknown>(mutator: (data: T) => void): unknown
}
```

## ShopDataDomain

字段含义与用法见 [SingleTypeDataDomain](#singletypedatadomain)。

```ts
export interface ShopDataDomain extends SingleTypeDataDomain {
    getCommodities<T = unknown>(section: string, query?: DataQuery): T[]
    getCommodity<T = unknown>(section: string, id: string, query?: DataQuery): T | null
}
```

## UpgradeDataDomain

字段含义与用法见 [SingleTypeDataDomain](#singletypedatadomain)。

```ts
export interface UpgradeDataDomain extends SingleTypeDataDomain {
    getRoutes<T = unknown>(query?: DataQuery): T | null
    mutateRoutes<T = unknown>(mutator: (data: T) => void): unknown
}
```

## GardenApi

coin/gem/sprout 分别为金币、钻石、幼苗。set 覆盖值，add 增减值；阳光与能量豆属于当前玩法状态。getProperty/setProperty 的 property/className 必须是当前游戏真实支持的名称，不能自行发明。花园 getState 读取、mutateState 修改、finishAllGrowth 完成生长。玩家属性和花园改动可能写入存档，停用模组不会自动撤销。

```ts
export interface GardenApi {
    getState<T = unknown>(): T | null
    mutateState<T = unknown>(mutator: (data: T) => void): unknown
    finishAllGrowth(): unknown
}
```

## PlayerCurrency

字段含义与用法见 [GardenApi](#gardenapi)。

```ts
export type PlayerCurrency = 'coin' | 'gem' | 'sprout'
```

## PlayerApi

字段含义与用法见 [GardenApi](#gardenapi)。

```ts
export interface PlayerApi {
    getProperty<T = unknown>(property: string, className?: string): T
    setProperty<T = unknown>(property: string, value: T, className?: string): T
    addProperty(property: string, amount: number, className?: string): number
    getCurrency(kind: PlayerCurrency): number
    setCurrency(kind: PlayerCurrency, value: number): number
    addCurrency(kind: PlayerCurrency, amount: number): number
    addSun(amount: number): unknown
    setSun(value: number): unknown
    addPlantFood(amount?: number): unknown
    setPlantFood(value: number): unknown
}
```

## LevelLoadedEvent

levels 省略关卡名时使用当前关卡；不在关卡或数据未加载时可能为 null。修改定义不保证重建正在运行的关卡。地图 id、关卡与植物列表采用游戏数据的真实结构；replace 方法替换整份列表。localization 的语言参数是数字索引，不是 `zh-CN` 这样的代码，set 后返回索引或 null。

```ts
export interface LevelLoadedEvent {
    sceneName: string | null
    levelName: string | null
}
```

## LevelsApi

字段含义与用法见 [LevelLoadedEvent](#levelloadedevent)。

```ts
export interface LevelsApi {
    getCurrentLevelName(): string | null
    getDefinition<T = unknown>(levelName?: string | null): T | null
    getOriginalDefinition<T = unknown>(levelName?: string | null): T | null
    mutateDefinition<T = unknown>(mutator: (data: T, meta: DataMutationMeta<T>) => T | void): T | null
    mutateDefinition<T = unknown>(levelName: string | null | undefined, mutator: (data: T, meta: DataMutationMeta<T>) => T | void): T | null
    getModulesData<T = unknown>(query?: Pick<DataQuery, 'useOriginal'>): T | null
    mutateModules<T = unknown>(mutator: (data: T, meta: DataMutationMeta<T>) => T | void): T | null
    onLevelLoaded(listener: (event: LevelLoadedEvent) => void): () => void
}
```

## WorldMapApi

字段含义与用法见 [LevelLoadedEvent](#levelloadedevent)。

```ts
export interface WorldMapApi extends Omit<SingleTypeDataDomain, 'type'> {
    getWorlds<T = unknown>(query?: Pick<DataQuery, 'useOriginal'>): T[]
    getWorld<T = unknown>(id: string | number, query?: Pick<DataQuery, 'useOriginal'>): T | null
    mutateWorlds<T = unknown>(mutator: (worlds: T[], meta: DataMutationMeta<unknown>) => T[] | void, query?: Pick<DataQuery, 'useOriginal'>): unknown
    patchWorld<T = unknown>(id: string | number, mutator: (world: T, context: { world: T; worlds: T[]; options: object }) => T | void, options?: object): unknown
    replaceWorldLevels(id: string | number, levels?: readonly unknown[]): unknown
    replaceWorldPlants(id: string | number, plants?: readonly unknown[]): unknown
}
```

## LocalizationApi

字段含义与用法见 [LevelLoadedEvent](#levelloadedevent)。

```ts
export interface LocalizationApi {
    getLyrics<T = Record<string, unknown>>(): T | null
    getCurrentLanguage(): number
    setCurrentLanguage(next: number): number | null
    export(useOriginal?: boolean, autoDownload?: boolean): unknown
}
```

## BoardCellQuery

getCell 对不存在的格子返回 null；listCells/getNeighbors 只返回有效格子。邻居 distance 是整数格数，范围 1–64；diagonals 默认包含斜角。距离单位是格子，不是像素：euclidean 为直线距离，manhattan 为横竖步数之和，chebyshev 为横竖差的较大值。无法定位对象时 distance 返回 null。

```ts
export interface BoardCellQuery {
    laneIndex?: number
    laneIndexes?: readonly number[]
    columnIndex?: number
    columnIndexes?: readonly number[]
    filter?: (cell: BoardCell) => boolean
}
```

## BoardNeighborOptions

字段含义与用法见 [BoardCellQuery](#boardcellquery)。

```ts
export interface BoardNeighborOptions {
    
    distance?: number
    
    diagonals?: boolean
    includeSelf?: boolean
}
```

## BoardDistanceMetric

字段含义与用法见 [BoardCellQuery](#boardcellquery)。

```ts
export type BoardDistanceMetric = 'euclidean' | 'manhattan' | 'chebyshev'
```

## BoardApi

字段含义与用法见 [BoardCellQuery](#boardcellquery)。

```ts
export interface BoardApi {
    getCell(laneIndex: number, columnIndex: number): BoardCell | null
    resolveCell(subject: BoardSubject): BoardCell | null
    listCells(query?: BoardCellQuery): readonly BoardCell[]
    getNeighbors(subject: BoardSubject, options?: BoardNeighborOptions): readonly BoardCell[]
    isSameCell(first: BoardSubject, second: BoardSubject): boolean
    
    distance(first: BoardSubject, second: BoardSubject, metric?: BoardDistanceMetric): number | null
}
```

## ScenesApi

getState 的 available 表示能否读取当前关卡状态；running 表示战斗正在推进。phase 区分关卡外、准备、运行、暂停、等待及结局；不要把 waiting 当作获胜。watchState 返回取消函数，事件含前后状态和 changes。setSpeedUp 仅切换 1×/1.5×；getFrameRate 是设置的目标帧率，不是实时测量值。

```ts
export interface ScenesApi {
    getName(): string | null
    is(name: string): boolean
}
```

## GameplayPhase

字段含义与用法见 [ScenesApi](#scenesapi)。

```ts
export type GameplayPhase = 'outside' | 'preparing' | 'running' | 'paused' | 'waiting' | 'won' | 'lost' | 'ended'
```

## GameplayOutcome

字段含义与用法见 [ScenesApi](#scenesapi)。

```ts
export type GameplayOutcome = 'won' | 'lost' | null
```

## GameplayState

字段含义与用法见 [ScenesApi](#scenesapi)。

```ts
export interface GameplayState {
    readonly available: boolean
    readonly sceneName: string | null
    readonly levelName: string | null
    readonly phase: GameplayPhase
    readonly started: boolean
    readonly running: boolean
    readonly paused: boolean
    readonly ended: boolean
    readonly outcome: GameplayOutcome
}
```

## GameplayStateField

字段含义与用法见 [ScenesApi](#scenesapi)。

```ts
export type GameplayStateField = keyof GameplayState
```

## GameplayStateEvent

字段含义与用法见 [ScenesApi](#scenesapi)。

```ts
export interface GameplayStateEvent {
    readonly type: 'initial' | 'changed'
    readonly changes: readonly GameplayStateField[]
    readonly previous: GameplayState | null
    readonly current: GameplayState
    readonly timestamp: number
}
```

## GameplayWatchOptions

字段含义与用法见 [ScenesApi](#scenesapi)。

```ts
export interface GameplayWatchOptions extends SubscriptionOptions {
    intervalMs?: number
    emitInitial?: boolean
}
```

## GameApi

字段含义与用法见 [ScenesApi](#scenesapi)。

```ts
export interface GameApi {
    setSpeedUp(enabled: boolean): unknown
    getFrameRate(): number | null
    setFrameRate(fps: number): unknown
    getState(): GameplayState
    watchState(
        listener: (event: GameplayStateEvent) => MaybePromise<void>,
        options?: GameplayWatchOptions,
    ): () => boolean
}
```

## GameMetadataApi

字段含义与用法见 [SingleTypeDataDomain](#singletypedatadomain)。

```ts
export interface GameMetadataApi {
    readonly propertySheets: SingleTypeDataDomain
    readonly narrative: SingleTypeDataDomain
}
```

## EntityDataDomain

字段含义与用法见 [SingleTypeDataDomain](#singletypedatadomain)。

```ts
export interface EntityDataDomain {
    listFeatureEntries(query?: Pick<DataQuery, 'useOriginal'>): DataEntrySummary[]
    getFeature<T = unknown>(id: string, query?: Pick<DataQuery, 'useOriginal'>): T | null
    getFeatureData<T = unknown>(query?: Pick<DataQuery, 'useOriginal'>): T | null
    mutateFeatures<T = unknown>(mutator: (data: T, meta: DataMutationMeta<T>) => T | void): T | null
    listPropsEntries(query?: Pick<DataQuery, 'useOriginal'>): DataEntrySummary[]
    getProps<T = unknown>(id: string, query?: Pick<DataQuery, 'useOriginal'>): T | null
    getPropsData<T = unknown>(query?: Pick<DataQuery, 'useOriginal'>): T | null
    mutateProps<T = unknown>(mutator: (data: T, meta: DataMutationMeta<T>) => T | void): T | null
    listTypeEntries(query?: Pick<DataQuery, 'useOriginal'>): DataEntrySummary[]
    getType<T = unknown>(id: string, query?: Pick<DataQuery, 'useOriginal'>): T | null
    getTypeData<T = unknown>(query?: Pick<DataQuery, 'useOriginal'>): T | null
    mutateType<T = unknown>(mutator: (data: T, meta: DataMutationMeta<T>) => T | void): T | null
    getBundle<T = Record<string, unknown>>(query?: Pick<DataQuery, 'useOriginal'>): T
}
```

## AlmanacEntityDataDomain

字段含义与用法见 [SingleTypeDataDomain](#singletypedatadomain)。

```ts
export interface AlmanacEntityDataDomain extends EntityDataDomain {
    listAlmanacEntries(query?: Pick<DataQuery, 'useOriginal'>): DataEntrySummary[]
    getAlmanac<T = unknown>(id: string, query?: Pick<DataQuery, 'useOriginal'>): T | null
    getAlmanacData<T = unknown>(query?: Pick<DataQuery, 'useOriginal'>): T | null
    mutateAlmanac<T = unknown>(mutator: (data: T, meta: DataMutationMeta<T>) => T | void): T | null
}
```

## PackFileReader

| 方法／字段 | 用法 |
| --- | --- |
| `own()` | 获取本模组的只读文件快照 |
| `from(namespace)` | namespace 是直接前置的 uuid；须先在 depends/optionalDepends 中声明 |
| `contributions()` | 返回直接依赖本框架、已被接受的纯数据内容包 |
| `listPaths()` | 查看包内实际路径，用 `/` 分隔 |
| `readText/readBytes` | await 后得到文本／Uint8Array；文件不存在为 null |
| `version/contentDigest` | 标识此次快照；新导入的文件不会悄悄改变旧 reader |

路径相对包根目录，禁止绝对路径和 `..`。无前置授权、无效路径等错误会抛出或拒绝 Promise，不是全部返回 null。读取文件不等于已将资源注册进游戏。

```ts
export interface PackFileReader {
    readonly namespace: string
    readonly version: string
    readonly contentDigest: string
    listPaths(): string[]
    readText(relativePath: string): Promise<string | null>
    readBytes(relativePath: string): Promise<Uint8Array | null>
}
```

## PackFilesApi

字段含义与用法见 [PackFileReader](#packfilereader)。

```ts
export interface PackFilesApi {
    own(): PackFileReader
    from(namespace: string): PackFileReader
    
    contributions(): PackFileReader[]
}
```

### 读取包内 JSON

以下代码单独作为 `scripts/main.js`；清单见[作者入门](./gp-next-js.md)。

完整入口。自行在包内加入 data/options.json，例如 `{"message":"Hello"}`。文件缺失返回 null，JSON 语法错误则由 JSON.parse 抛出。读取成功后仍要检查自己需要的字段。

```js
export default {
  async setup(ctx) {
    const text = await ctx.files.own().readText('data/options.json')
    if (text === null) throw new Error('Missing data/options.json')
    const options = JSON.parse(text)
    if (typeof options.message !== 'string') throw new Error('message must be a string')
    ctx.ui.toast(options.message)
  }
}
```

## ModStorageHandle

open 必须指定 scope、正整数 version、JSON 默认值和 validate。global 在本机玩家间共享；save 绑定当前存档，切换玩家后重新 open。read 返回数据快照；update 接收旧值并返回完整的新值，可异步。增加 version 时用 migrate 处理旧数据；它返回升级后的值，再经 validate 检查。读写失败会拒绝 Promise，应 await 并处理错误。

```ts
export interface ModStorageHandle<T> {
    read(): Promise<T>
    update(transform: (value: T) => T | Promise<T>): Promise<T>
}
```

## ModStorageApi

字段含义与用法见 [ModStorageHandle](#modstoragehandle)。

```ts
export interface ModStorageApi {
    
    open<T>(definition: {
        scope: 'global' | 'save'
        version: number
        defaults: T
        validate(value: unknown): boolean | Promise<boolean>
        migrate?(value: unknown, fromVersion: number, toVersion: number): T | Promise<T>
    }): Promise<ModStorageHandle<T>>
}
```

### 保存并升级模组数据

以下代码单独作为 `scripts/main.js`；清单见[作者入门](./gp-next-js.md)。

完整入口。旧版只有 count，新版增加 enabled；migrate 返回完整新结构。这里选择 global，不会因玩家切换而更换数据。update 的返回值就是写入后的完整数据。

```js
export default {
  async setup(ctx) {
    const progress = await ctx.storage.open({
      scope: 'global', version: 2, defaults: { count: 0, enabled: true },
      validate: value => value !== null && typeof value === 'object'
        && 'count' in value && typeof value.count === 'number'
        && Number.isSafeInteger(value.count) && value.count >= 0
        && 'enabled' in value && typeof value.enabled === 'boolean',
      migrate(value, fromVersion) {
        if (fromVersion !== 1 || value === null || typeof value !== 'object'
          || !('count' in value) || typeof value.count !== 'number'
          || !Number.isSafeInteger(value.count)) {
          throw new Error('Unsupported saved data')
        }
        return { count: value.count, enabled: true }
      }
    })
    const saved = await progress.update(value => ({ ...value, count: value.count + 1 }))
    ctx.log.info(saved.count)
  }
}
```

## ModContext

这是 setup 的参数，不是控制台全局变量。按上方任务索引选择领域。meta 是清单信息；compat 查询平台能力，hasDeclaredFeature 只查询模组是否声明该能力。ui.toast 给玩家提示，log 写日志。gpn.reload 不保证热更新任意资源。advanced/unsafe 接触版本相关对象，使用前需确认当前游戏支持。

```ts
export interface ModContext {
    readonly meta: {
        namespace: string
        id: string
        name: string
        version: string
        packFormatVersion: number
        apiVersion: number
        capabilities: readonly string[]
        depends: readonly string[]
        optionalDepends: readonly string[]
    }
    readonly compat: {
        getApiVersion(): number
        getPlatformVersion(): string
        getPackFormatVersion(): number
        hasFeature(id: string): boolean
        hasDeclaredFeature(id: string): boolean
        markDegraded(reason: string): void
        warnDeprecated(message: string): void
    }
    readonly runtime: RuntimeApi
    readonly clock: GameClockApi
    readonly storage: ModStorageApi
    readonly settings: SettingsApi
    readonly controls: ControlsApi
    readonly events: EventsApi
    readonly services: ServicesApi
    readonly files: PackFilesApi
    readonly board: BoardApi
    readonly entities: EntitiesApi
    readonly teams: TeamsApi
    readonly combat: CombatApi
    readonly actions: ActionsApi
    readonly spawns: SpawnsApi
    readonly status: StatusApi
    readonly impacts: ImpactsApi
    readonly content: ContentApi
    readonly scenes: ScenesApi
    readonly game: GameApi
    readonly player: PlayerApi
    readonly levels: LevelsApi
    readonly worldMap: WorldMapApi
    readonly localization: LocalizationApi
    readonly plants: AlmanacEntityDataDomain
    readonly zombies: AlmanacEntityDataDomain
    readonly projectiles: EntityDataDomain
    readonly armors: EntityDataDomain
    readonly dinosaurs: EntityDataDomain
    readonly tiles: PropsDataDomain
    readonly tileLiquids: PropsDataDomain
    readonly tombs: PropsDataDomain
    readonly lawns: LawnDataDomain
    readonly levelModules: SingleTypeDataDomain
    readonly shop: ShopDataDomain
    readonly upgrades: UpgradeDataDomain
    readonly trophies: SingleTypeDataDomain
    readonly garden: GardenApi
    readonly gameMetadata: GameMetadataApi
    readonly ui: { toast(message: string, type?: 'info' | 'success' | 'warning' | 'error' | string): void }
    readonly gpn: { reload(): Promise<unknown>; status(): unknown; getOriginalData(type: string): unknown }
    readonly log: { info(message: unknown): void; warn(message: unknown): void; error(message: unknown): void }
    
    readonly advanced: Record<string, unknown>
    
    readonly unsafe: Record<string, unknown>
}
```

### 理解 Hook 的执行顺序

以下代码单独作为 `scripts/main.js`；清单见[作者入门](./gp-next-js.md)。

这个完整入口只包装模组自己创建的对象，用来说明参数和返回值；不是对某个游戏函数的承诺。target 是实际对象，methodName 必须存在。真实游戏 Hook 需先确认目标版本的方法。一般调用并返回 callNext(...args)，保留其他包装和原返回值；callBase 会绕过其他包装。不要为了打印日志把原本同步的方法改成 async。

```js
export default {
  setup(ctx) {
    const counter = { add(a, b) { return a + b } }
    ctx.unsafe.hooks.wrapMethod({
      target: counter, methodName: 'add',
      handler({ args, callNext }) {
        const result = callNext(...args)
        ctx.log.info(result)
        return result
      }
    })
    counter.add(2, 3) // 5
  }
}
```

## NativeContentIdentity

| 入口／字段 | 何时使用与结果 |
| --- | --- |
| `startup(ctx)` | 清单声明 startup 后，在首场景前登记资源；可异步 |
| `setup(ctx)` | 必需的运行期入口；可 async，可返回停用清理函数 |
| `dispose(ctx)` | 可选停用回调，不等于可以热卸载启动时发布的内容 |
| `registry.provide/resolve` | startup 收集阶段共享能力；resolve 的 provider 是直接前置 uuid，找不到会抛异常 |
| `registrations.add(id, registration)` | id 为本模组内唯一名称；登记准备／发布／回滚流程 |
| `prepare(input)` | 可异步；准备资源，可返回 identities。input 含已有和历史身份供检查 |
| `publish()` | 必须同步；仅发布已经准备好的内容 |
| `dispose()`（注册对象） | 回收未发布的准备资源；不会用于热卸载已发布内容 |
| `getResources()` | 可选，返回资源状态列表 |

原生植物／僵尸身份包含稳定的 id、kind、codename、数字 engineId。身份登记不是任意资源的自动导入器。registry 只用于收集阶段；engine 访问限收集与准备阶段，publish 中使用 prepare 已取得的对象。发布后的内容更换通常需要重启。

```ts
export interface NativeContentIdentity {
    id: string
    kind: 'plant' | 'zombie'
    codename: string
    engineId: number
}
```

## StartupRegistration

字段含义与用法见 [NativeContentIdentity](#nativecontentidentity)。

```ts
export interface StartupRegistration {
    prepare(input: { previousIdentities: NativeContentIdentity[]; identities: NativeContentIdentity[] }): MaybePromise<void | { identities?: NativeContentIdentity[] }>
    
    publish(): void
    
    dispose(): MaybePromise<void>
    getResources?(): unknown[]
}
```

## StartupContext

字段含义与用法见 [NativeContentIdentity](#nativecontentidentity)。

```ts
export interface StartupContext {
    readonly meta: { readonly namespace: string; readonly version: string }
    readonly files: PackFilesApi
    readonly runtime: RuntimeApi
    readonly log: ModContext['log']
    readonly engine: {
        getCc(): any
        getClassByName(name: string): any
        getSystemModule(path: string): any
        getModuleExport(path: string, name: string): any
    }
    readonly registry: {
        provide(id: string, value: unknown): void
        resolve<T = unknown>(provider: string, id: string): T
    }
    readonly registrations: { add(id: string, registration: StartupRegistration): void }
}
```

## ModModule

字段含义与用法见 [NativeContentIdentity](#nativecontentidentity)。

```ts
export interface ModModule {
    startup?(ctx: StartupContext): MaybePromise<void | (() => MaybePromise<void>)>
    setup(ctx: ModContext): MaybePromise<void | (() => MaybePromise<void>)>
    dispose?(ctx: ModContext): MaybePromise<void>
}
```
