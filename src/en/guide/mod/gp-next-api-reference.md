---
title: API parameters and return types
icon: toolbox
pageInfo: false
index: true
order: 11
---

# API parameters and return types

Use alongside the [API guide](./gp-next-api.md). `?` marks optional fields; await a `Promise<T>`; string unions list accepted values. Start with ModContext for runtime domains or StartupContext for startup registration.

[Download declarations](/downloads/mods/gp-next-api.d.ts)

## Find an API by task

Start with the [author guide](./gp-next-js.md). These declarations are a reference, not a reading checklist.

| Task | Reference |
| --- | --- |
| Settings, buttons, persistence | [SettingsApi](#settingsapi), [ControlsApi](#controlsapi), [ModStorageApi](#modstorageapi) |
| Find and act on entities | [EntityQuery](#entityquery), [EntitiesApi](#entitiesapi), [ActionResult](#actionresult) |
| Spawning, damage, effects | [SpawnsApi](#spawnsapi), [CombatApi](#combatapi), [StatusApi](#statusapi) |
| Timing and cleanup | [RuntimeApi](#runtimeapi), [GameClockApi](#gameclockapi) |
| Data, files, dependencies | [ContentApi](#contentapi), [PackFilesApi](#packfilesapi), [ServicesApi](#servicesapi) |
| Startup content | [StartupRegistration](#startupregistration), [StartupContext](#startupcontext) |

### Reading a signature

`heal(amount: number, options?: HealOptions): HealActionResult` takes a number, optional options, and returns a result object. Readonly means read-only; null means absent/unavailable; unknown promises no concrete shape. `() => boolean` is a returned function: call it to cancel, rather than treating the function itself as success. Await a `Promise<T>` to obtain T.

Grid coordinates start at zero. Wall-clock timing uses milliseconds and gameplay timing uses seconds unless a field says otherwise.

## MaybePromise

A callback may return a value immediately or a Promise. Use `async` / `await` for resource loading and storage.

```ts
export type MaybePromise<T> = T | Promise<T>
```

## SubscriptionOptions

`label` identifies the task in logs. Aborting `signal` cancels it; mod shutdown still cleans it up when no signal is supplied. For an entity-bound task, use a non-null `entity.signal`.

```ts
export interface SubscriptionOptions {
    label?: string
    signal?: AbortSignal
}
```

## EntityKind

`kind` is an object category, not a plant or zombie variety; filter varieties by `codename`. A true capability means the current object supports that action. Category alone is not enough.

```ts
export type EntityKind = 'plant' | 'zombie' | 'projectile' | 'resource' | 'armor' | 'tomb' | 'tile-liquid' | 'dinosaur' | 'entity' | string
```

## EntityAction

Field meanings and usage: [EntityKind](#entitykind).

```ts
export type EntityAction = 'inspect' | 'damage' | 'heal' | 'eliminate' | 'moveToCell' | 'collect'
```

## Team

`team` is current allegiance; `targetTeam` is the side being targeted. Neither must match `kind`: a converted zombie is still a zombie. `identity` checks allegiance and `targeting` checks target allegiance. Unavailable or `unknown` is not neutral. These APIs only read allegiance.

```ts
export type Team = 'plant' | 'zombie' | 'neutral' | 'unknown'
```

## TeamFacet

Field meanings and usage: [Team](#team).

```ts
export type TeamFacet = 'identity' | 'targeting'
```

## TeamState

Field meanings and usage: [Team](#team).

```ts
export interface TeamState {
    readonly team: Team
    readonly targetTeam: Team
}
```

## TeamFacetCapability

Field meanings and usage: [Team](#team).

```ts
export interface TeamFacetCapability {
    readonly available: boolean
    readonly adapters: readonly string[]
    readonly teams: readonly Team[]
    readonly reason: string | null
}
```

## TeamCapabilities

Field meanings and usage: [Team](#team).

```ts
export interface TeamCapabilities {
    readonly identity: TeamFacetCapability
    readonly targeting: TeamFacetCapability
}
```

## TeamsApi

Field meanings and usage: [Team](#team).

```ts
export interface TeamsApi {
    getState(target: EntityHandle): TeamState
    getCapabilities(target: EntityHandle): TeamCapabilities
    supports(target: EntityHandle, facet: TeamFacet | string): boolean
}
```

## EntityHealthLayer

`current/max` are health and its limit; `ratio` is their ratio. Armor or shell health is in `secondary`; totals combine both layers. A null value means unknown or absent, not zero health.

```ts
export interface EntityHealthLayer {
    current: number
    max: number | null
    ratio: number | null
}
```

## EntityHealth

Field meanings and usage: [EntityHealthLayer](#entityhealthlayer).

```ts
export interface EntityHealth extends EntityHealthLayer {
    secondary: EntityHealthLayer | null
    totalCurrent: number
    totalMax: number | null
}
```

## EntityCapabilities

Field meanings and usage: [EntityKind](#entitykind).

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

`laneIndex` and `columnIndex` are zero-based row and column indexes. A snapshot may have null grid coordinates. `position` uses game coordinates, not grid indexes. A `BoardSubject` accepts a cell, handle, or snapshot. Snapshots do not update themselves.

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

Field meanings and usage: [EntitySnapshot](#entitysnapshot).

```ts
export interface BoardCell {
    readonly laneIndex: number
    readonly columnIndex: number
}
```

## ActionOptions

Without `required: true`, inspect `ok/reason` on failure. With it, failed actions throw. Use this for essential steps, not best-effort batches.

```ts
export interface ActionOptions {
    required?: boolean
}
```

## DamageOptions

Pass the amount to the damage method; these options describe type, source, and presentation. `source` is an entity handle and `tags` are author-defined labels for damage rules. Damage types, armor, and audiovisual options depend on target support; omit them unless needed.

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

Field meanings and usage: [ActionOptions](#actionoptions).

```ts
export interface HealOptions {
    required?: boolean
}
```

## ActionResult

`ok` means the action call succeeded, not that it changed anything. For damage/healing inspect `accepted` and `appliedAmount`; for collection inspect `accepted/collected`. Requested, modified, and observed amounts can differ. `reason/error` explain failures. Delayed damage is not included in the synchronous observation.

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

Field meanings and usage: [ActionResult](#actionresult).

```ts
export interface CollectActionResult<T = unknown> extends ActionResult<T> {
    
    accepted: boolean
    
    collected: boolean
}
```

## ObservedAmountActionResult

Field meanings and usage: [ActionResult](#actionresult).

```ts
export interface ObservedAmountActionResult<T = unknown> extends ActionResult<T> {
    
    accepted: boolean
    
    appliedAmount: number
}
```

## DamageActionResult

Field meanings and usage: [ActionResult](#actionresult).

```ts
export interface DamageActionResult<T = unknown> extends ObservedAmountActionResult<T> {
    
    finalAmount: number
    combat: CombatDamageRequest
}
```

## HealActionResult

Field meanings and usage: [ActionResult](#actionresult).

```ts
export interface HealActionResult<T = unknown> extends ObservedAmountActionResult<T> {}
```

## EntityHealthChangeKind

`coreDelta/secondaryDelta/totalDelta` are after minus before; a loss is negative. `amount` describes the change and can be null when unknown. `redistribution` means layers changed without a net total change. Observations do not identify every attack or its source.

```ts
export type EntityHealthChangeKind = 'damage' | 'healing' | 'redistribution' | 'unchanged'
```

## EntityHealthChange

Field meanings and usage: [EntityHealthChangeKind](#entityhealthchangekind).

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

Field meanings and usage: [EntityHealthChangeKind](#entityhealthchangekind).

```ts
export interface EntityHealthObservation extends EntityHealthChange {
    before: { alive: boolean; health: EntityHealth | null }
    after: { alive: boolean; health: EntityHealth | null }
}
```

## EntityInactiveEvent

Field meanings and usage: [EntityHandle](#entityhandle).

```ts
export interface EntityInactiveEvent {
    readonly type: 'disposed' | 'retired'
    readonly reason: string
    readonly entity: EntityHandle
}
```

## EntityHandle

Obtain handles from `entities` or `spawns`; do not construct them yourself. Recheck `isAlive()` before delayed actions. Once the object disappears or is recycled, discard the old handle. Snapshot and health methods read; action methods modify. `onInactive` returns an unsubscribe function. Elimination does not guarantee normal kill rewards.

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

Field meanings and usage: [EntitySnapshot](#entitysnapshot).

```ts
export type BoardSubject = BoardCell | EntityHandle | EntitySnapshot
```

## EntityQuery

Omitted fields impose no filter. Use `kind` for category, `codename` for variety, indexes for position, capabilities for supported actions, and `filter` for additional conditions. Pick one spelling of a singular/plural alias. Display names are not codenames.

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

List methods return matching handles or `[]`. `findNearest` returns null when nothing matches. Watch callbacks distinguish added/changed/removed; removed events have a null current snapshot. `intervalMs` uses real milliseconds and `fields` narrows observed changes. `watchHealth` observes health differences. Watches return unsubscribe functions and stop on mod shutdown.

```ts
export interface EntityWatchEventBase {
    changes: ReadonlyArray<'presence' | 'generation' | 'identity' | 'grid' | 'position' | 'health' | 'alive' | 'team' | 'capabilities' | string>
    handle: EntityHandle
    sceneName: string | null
    timestamp: number
}
```

## EntityWatchEvent

Field meanings and usage: [EntityWatchEventBase](#entitywatcheventbase).

```ts
export type EntityWatchEvent = EntityWatchEventBase & (
    | { type: 'added'; previous: null; current: EntitySnapshot }
    | { type: 'changed'; previous: EntitySnapshot; current: EntitySnapshot }
    | { type: 'removed'; previous: EntitySnapshot; current: null }
)
```

## EntityWatchOptions

Field meanings and usage: [EntityWatchEventBase](#entitywatcheventbase).

```ts
export interface EntityWatchOptions extends SubscriptionOptions {
    intervalMs?: number
    emitInitial?: boolean
    emitRemoved?: boolean
    fields?: Array<'identity' | 'grid' | 'position' | 'health' | 'alive' | 'team' | 'capabilities'>
}
```

## EntityHealthWatchEvent

Field meanings and usage: [EntityHealthChangeKind](#entityhealthchangekind).

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

Field meanings and usage: [EntityWatchEventBase](#entitywatcheventbase).

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

### Observe new entities

Use this block as scripts/main.js; see the [manifest guide](./gp-next-js.md).

A complete entry. Fields narrow observed changes; emitInitial disables initial reports for existing entities. Do not register the same task on every changed event.

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

These mirror handle actions, with an explicit `target` first argument. Amounts use game units; movement uses zero-based grid indexes and returns a success boolean. Check capabilities before the action and its result afterward.

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

`id` names a rule within this mod. Source rules run before target rules; higher priority runs first within a phase. `subject` binds a rule to one entity. `match` filters source, target, type, or tags. Add adds a value, multiply scales, clamp bounds, and block prevents damage; supply fields for the chosen operation.

```ts
export type CombatModifierPhase = 'source' | 'target'
```

## CombatModifierOperation

Field meanings and usage: [CombatModifierPhase](#combatmodifierphase).

```ts
export type CombatModifierOperation = 'add' | 'multiply' | 'clamp' | 'block'
```

## CombatMatchValue

Field meanings and usage: [CombatModifierPhase](#combatmodifierphase).

```ts
export type CombatMatchValue<T> = T | readonly T[]
```

## CombatModifierMatch

Field meanings and usage: [CombatModifierPhase](#combatmodifierphase).

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

Field meanings and usage: [CombatModifierPhase](#combatmodifierphase).

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

Field meanings and usage: [CombatModifierPhase](#combatmodifierphase).

```ts
export type CombatModifierDefinition =
    | (CombatModifierDefinitionBase & { operation: 'add'; value: number })
    | (CombatModifierDefinitionBase & { operation: 'multiply'; value: number })
    | (CombatModifierDefinitionBase & { operation: 'clamp'; min?: number; max?: number })
    | (CombatModifierDefinitionBase & { operation: 'block'; reason?: string })
```

## NormalizedCombatModifierMatch

Field meanings and usage: [CombatModifierHandle](#combatmodifierhandle).

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

Field meanings and usage: [CombatModifierHandle](#combatmodifierhandle).

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

Field meanings and usage: [CombatModifierHandle](#combatmodifierhandle).

```ts
export interface CombatModifierState extends CombatModifierMetadata {
    readonly active: boolean
    readonly state: 'active' | 'disposed' | string
    readonly stateReason: string | null
}
```

## CombatModifierHandle

`owner` identifies the providing mod; active state indicates whether the rule still applies. `dispose(reason?)` removes it early; disabling its provider also removes it. Metadata and normalized matching arrays are read-only snapshots, not an editing interface.

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

`applications` records each applied rule and before/after amounts in order. Blocking fields explain prevented damage. Source may be null. Whether health actually changed is reported by `result.accepted/appliedAmount`.

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

Field meanings and usage: [CombatModifierApplication](#combatmodifierapplication).

```ts
export interface CombatEntityIdentitySnapshot {
    readonly kind: EntityKind
    readonly codename: string | null
    readonly team: Team
}
```

## CombatDamageRequest

Field meanings and usage: [CombatModifierApplication](#combatmodifierapplication).

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

Field meanings and usage: [CombatModifierApplication](#combatmodifierapplication).

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

**Coverage: damage initiated through the API only.** `modifiers.add` returns a rule handle with `dispose()`, `list` shows rules, and `watchDamage` reports their damage results. These do not intercept all native attacks or implement a global damage multiplier.

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

Field meanings and usage: [CombatCapabilities](#combatcapabilities).

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

`spawn` needs a category, an existing or registered type identifier, and a cell. Projectiles additionally require `targetSide` and `motion`. Check category support, await spawning, then inspect `ok`; category support does not validate every type name.

```ts
export type SpawnKind = 'plant' | 'zombie' | 'projectile' | 'resource' | 'tomb' | 'tile-liquid'
```

## CellSpawnKind

Field meanings and usage: [SpawnKind](#spawnkind).

```ts
export type CellSpawnKind = Exclude<SpawnKind, 'projectile'>
```

## ProjectileTargetSide

Field meanings and usage: [SpawnKind](#spawnkind).

```ts
export type ProjectileTargetSide = Exclude<Team, 'neutral' | 'unknown'>
```

## LinearProjectileMotion

Velocity uses cells per gameplay second: positive columns move right and positive lanes move toward increasing row indexes. Negative values reverse direction. Initial height is in cell heights and defaults to 0.5. Only linear motion is currently stable.

```ts
export interface LinearProjectileMotion {
    kind: 'linear'
    
    velocity: { columnsPerSecond: number; lanesPerSecond: number }
    
    heightInCells?: number
}
```

## SpawnDescriptorBase

Field meanings and usage: [SpawnKind](#spawnkind).

```ts
export interface SpawnDescriptorBase<K extends SpawnKind = SpawnKind> {
    kind: K
    type: string
    at: BoardCell
    
    required?: boolean
}
```

## CellSpawnDescriptor

Field meanings and usage: [SpawnKind](#spawnkind).

```ts
export interface CellSpawnDescriptor extends SpawnDescriptorBase<CellSpawnKind> {
    targetSide?: never
    motion?: never
}
```

## ProjectileSpawnDescriptor

Field meanings and usage: [SpawnKind](#spawnkind).

```ts
export interface ProjectileSpawnDescriptor extends SpawnDescriptorBase<'projectile'> {
    
    targetSide: ProjectileTargetSide
    
    motion: LinearProjectileMotion
}
```

## SpawnDescriptor

Field meanings and usage: [SpawnKind](#spawnkind).

```ts
export type SpawnDescriptor = CellSpawnDescriptor | ProjectileSpawnDescriptor
```

## SpawnCapability

A successful spawn returns at least one handle, possibly several. Failure returns an empty list and a reason/message. Await `dispose()` to remove this spawn. An empty capability type list can mean types come from game data, not that no types exist.

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

Field meanings and usage: [SpawnCapability](#spawncapability).

```ts
export interface SpawnDisposeResult {
    ok: boolean
    disposed: boolean
    results: readonly unknown[]
}
```

## SpawnResult

Field meanings and usage: [SpawnCapability](#spawncapability).

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

Field meanings and usage: [SpawnKind](#spawnkind).

```ts
export interface SpawnsApi {
    getCapabilities(): Readonly<Record<SpawnKind, SpawnCapability>>
    supports(kind: string): kind is SpawnKind
    spawn<D extends SpawnDescriptor>(descriptor: D): Promise<SpawnResult<D['kind']>>
}
```

## StatusEffect

`duration` uses gameplay seconds, following pause and speed. Poison additionally needs damage per gameplay second; contact propagation spreads on contact. Check target support and effect clearability. Ordinary clear methods can affect other sources; prefer layers to remove only your own effects.

```ts
export type StatusEffect = 'stun' | 'chill' | 'freeze' | 'butter' | 'dark-matter' | 'perfume' | 'chili-stun' | 'glittering' | 'sap' | 'poison'
```

## DurationStatusEffect

Field meanings and usage: [StatusEffect](#statuseffect).

```ts
export type DurationStatusEffect = Exclude<StatusEffect, 'poison'>
```

## DurationStatusDescriptor

Field meanings and usage: [StatusEffect](#statuseffect).

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

Field meanings and usage: [StatusEffect](#statuseffect).

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

Field meanings and usage: [StatusEffect](#statuseffect).

```ts
export type StatusDescriptor = DurationStatusDescriptor | PoisonStatusDescriptor
```

## StatusEffectCapability

Available support and active effect state are different. Remaining time uses gameplay seconds or null when unknown. Clearability indicates safe effect-specific removal; target activity indicates a valid handle.

```ts
export interface StatusEffectCapability {
    effect: StatusEffect
    available: boolean
    adapter: string | null
    
    clearable: boolean
}
```

## StatusEffectState

Field meanings and usage: [StatusEffectCapability](#statuseffectcapability).

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

Field meanings and usage: [StatusEffectCapability](#statuseffectcapability).

```ts
export interface StatusSnapshot {
    effects: Readonly<Record<string, StatusEffectState>>
    clearAll: boolean
    
    targetActive: boolean
}
```

## StatusTransitionChange

After checking `ok`, inspect the applied effect, extension, or cleared status. Before/after are snapshots and changes include synchronous side effects on other effects. Reason/message explain failure.

```ts
export type StatusTransitionChange = 'activated' | 'deactivated' | 'extended' | 'shortened' | 'adapter' | 'details'
```

## StatusEffectTransition

Field meanings and usage: [StatusTransitionChange](#statustransitionchange).

```ts
export interface StatusEffectTransition {
    effect: StatusEffect
    changes: readonly StatusTransitionChange[]
    before: StatusEffectState
    after: StatusEffectState
}
```

## StatusApplyResult

Field meanings and usage: [StatusTransitionChange](#statustransitionchange).

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

Field meanings and usage: [StatusTransitionChange](#statustransitionchange).

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

Field meanings and usage: [StatusTransitionChange](#statustransitionchange).

```ts
export interface StatusEffectClearResult extends StatusClearResult {
    effect: StatusEffect
    adapter: string | null
    cleared: boolean
}
```

## StatusWatchEventType

Watch events are started/ended/updated. Limit them with effects; emitInitial reports existing effects. Polling uses real milliseconds, defaults to 100, and is limited to 50–10000. Expired-or-cleared does not distinguish expiry from removal.

```ts
export type StatusWatchEventType = 'started' | 'ended' | 'updated'
```

## StatusWatchChange

Field meanings and usage: [StatusWatchEventType](#statuswatcheventtype).

```ts
export type StatusWatchChange = 'initial' | 'active' | 'adapter' | 'details' | 'remaining'
```

## StatusWatchReason

Field meanings and usage: [StatusWatchEventType](#statuswatcheventtype).

```ts
export type StatusWatchReason = 'initial' | 'activated' | 'expired-or-cleared' | 'target-inactive' | 'extended-or-updated'
```

## StatusWatchEvent

Field meanings and usage: [StatusWatchEventType](#statuswatcheventtype).

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

Field meanings and usage: [StatusWatchEventType](#statuswatcheventtype).

```ts
export interface StatusWatchOptions extends SubscriptionOptions {
    
    effects?: readonly StatusEffect[]
    
    intervalMs?: number
    
    emitInitial?: boolean
}
```

## StatusLayerEffect

Owned layers currently support poison and speed-multiplier. Duration uses gameplay seconds. Poison takes damage per second; speed takes a factor from 0–10, with 0.5 meaning half speed. Check layers.supports separately from ordinary status support.

```ts
export type StatusLayerEffect = 'poison' | 'speed-multiplier'
```

## PoisonStatusLayerDetails

Field meanings and usage: [StatusLayerEffect](#statuslayereffect).

```ts
export interface PoisonStatusLayerDetails {
    damagePerSecond: number
}
```

## SpeedMultiplierStatusLayerDetails

Field meanings and usage: [StatusLayerEffect](#statuslayereffect).

```ts
export interface SpeedMultiplierStatusLayerDetails {
    multiplier: number
}
```

## StatusLayerDetailsByEffect

Field meanings and usage: [StatusLayerEffect](#statuslayereffect).

```ts
export interface StatusLayerDetailsByEffect {
    poison: PoisonStatusLayerDetails
    'speed-multiplier': SpeedMultiplierStatusLayerDetails
}
```

## StatusLayerCapability

Only successful application returns a layer. Disposing it removes this layer, not other sources. Expiry and mod shutdown also clean it up. Get its state for remaining time and parameters; sourceOwned indicates this ownership-aware removal capability.

```ts
export interface StatusLayerCapability {
    effect: StatusLayerEffect
    available: boolean
    adapter: string | null
    
    sourceOwned: boolean
}
```

## StatusLayerState

Field meanings and usage: [StatusLayerCapability](#statuslayercapability).

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

Field meanings and usage: [StatusLayerCapability](#statuslayercapability).

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

Field meanings and usage: [StatusLayerCapability](#statuslayercapability).

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

Field meanings and usage: [StatusLayerEffect](#statuslayereffect).

```ts
export interface PoisonStatusLayerDescriptor {
    effect: 'poison'
    duration: number
    damagePerSecond: number
    required?: boolean
}
```

## SpeedMultiplierStatusLayerDescriptor

Field meanings and usage: [StatusLayerEffect](#statuslayereffect).

```ts
export interface SpeedMultiplierStatusLayerDescriptor {
    effect: 'speed-multiplier'
    duration: number
    
    multiplier: number
    required?: boolean
}
```

## StatusLayerDescriptor

Field meanings and usage: [StatusLayerEffect](#statuslayereffect).

```ts
export type StatusLayerDescriptor = PoisonStatusLayerDescriptor | SpeedMultiplierStatusLayerDescriptor
```

## StatusLayerApplyResult

Field meanings and usage: [StatusLayerCapability](#statuslayercapability).

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

Field meanings and usage: [StatusLayerEffect](#statuslayereffect).

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

### Remove only your own slow effect

Use this block as scripts/main.js; see the [manifest guide](./gp-next-js.md).

A complete entry. On click, apply a 3-second half-speed layer to the first supported zombie. Log failures. Call the returned layer.dispose() for early removal.

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

Field meanings and usage: [StatusEffect](#statuseffect).

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

Observe supported projectile impacts, not all damage. Source is the projectile and target is the hit entity. Kinds distinguish direct, splash, and unclassified hits. Filter by source types, target kinds, and impact kinds. Partial or unknown coverage is not complete coverage.

```ts
export type ProjectileImpactKind = 'direct' | 'splash' | 'unclassified'
```

## ProjectileImpactEvent

Field meanings and usage: [ProjectileImpactKind](#projectileimpactkind).

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

Field meanings and usage: [ProjectileImpactKind](#projectileimpactkind).

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

Field meanings and usage: [ProjectileImpactKind](#projectileimpactkind).

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

Field meanings and usage: [ProjectileImpactKind](#projectileimpactkind).

```ts
export interface ImpactsApi {
    getCapabilities(): ProjectileImpactCapabilities
    supports(targetKind: 'plant' | 'zombie' | 'tomb', impactKind?: ProjectileImpactKind): boolean
    watch(listener: (event: ProjectileImpactEvent) => MaybePromise<void>, options?: ProjectileImpactWatchOptions): () => boolean
}
```

## RuntimeApi

| Method | Parameters and result |
| --- | --- |
| `sleep(ms)` | Await real milliseconds; cancellation rejects |
| `setTimeout/setInterval` | Callback, real milliseconds, optional signal/label; returns cancel function |
| `onDispose(cleanup)` | Runs cleanup on shutdown; return value only unregisters cleanup |
| `guard(callback)` | Returns a callback wrapper that stops invoking after shutdown |
| `track(promise)` | Tracks work/errors; cannot make arbitrary external work cancellable |
| `isActive/assertActive` | Query activity or throw when stopped |

Pass runtime.signal to an external operation's cancellation parameter if it supports one.

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

This clock uses **gameplay seconds**. Pause stops gameplay time and speed-up accelerates it. Tick deltaSeconds is already the elapsed gameplay time; do not multiply it by scale again. Check availability; outside a level it is not a wall clock. Timers return cancel functions and sleep returns a Promise.

```ts
export interface GameClockState {
    readonly available: boolean
    readonly scale: number | null
    readonly paused: boolean
}
```

## GameClockTick

Field meanings and usage: [GameClockState](#gameclockstate).

```ts
export interface GameClockTick {
    readonly deltaSeconds: number
    readonly scale: number | null
    readonly paused: boolean
    readonly frame: number
}
```

## GameClockTaskOptions

Field meanings and usage: [SubscriptionOptions](#subscriptionoptions).

```ts
export interface GameClockTaskOptions {
    label?: string
    signal?: AbortSignal
}
```

## GameClockApi

Field meanings and usage: [GameClockState](#gameclockstate).

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

Await schema definition before reading settings. Keep saved keys stable across versions; labels are player-facing and defaults must match field types. Number/slider bounds constrain input; select values are stored and labels displayed. onChange reports writes; onApply receives applied values. Export returns JSON text and import accepts that text or an object.

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

Field meanings and usage: [SettingField](#settingfield).

```ts
export interface SettingsChangeEvent {
    readonly namespace: string
    readonly operation: 'set' | 'reset' | 'import'
    readonly previous: Record<string, unknown>
    readonly values: Record<string, unknown>
}
```

## SettingsApi

Field meanings and usage: [SettingField](#settingfield).

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

### A setting controls periodic healing

Use this block as scripts/main.js; see the [manifest guide](./gp-next-js.md).

A complete entry. The toggle is saved in mod settings. Every 2 gameplay seconds, heal supported plants by 10. No action is taken outside active gameplay; disabling the mod stops the timer.

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

Use unique control keys within a panel. Actions use onClick; editable controls synchronously read getValue and may asynchronously write setValue. Never return a Promise from getValue. Visibility and disabled state may be computed. Controls do not persist automatically; write through settings/storage as needed. Clear removes this mod’s panel.

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

Field meanings and usage: [ControlItemBase](#controlitembase).

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

Field meanings and usage: [ControlItemBase](#controlitembase).

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

on/once return unsubscribe functions; once fires once. Await emitAsync when listeners may be asynchronous. Plain event names belong to the current mod; `mod:protocol:event` names support shared protocols. Producers and consumers must agree on payload shape.

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

| Method / parameter | Meaning |
| --- | --- |
| `listTypes/listTypeInfos` | Discover data types; use the returned type names |
| `listEntries/getEntry` | List first, then use a returned id; missing entries may be null |
| `getCurrent/getOriginal` | Current or original-backup snapshots |
| `mutate(type, callback)` | Edit synchronously or return a replacement; do not use async callbacks |
| `meta.current/original/info` | Current data, original backup, and type information |
| `export` | Export current/original data with optional save prompt; not persistent gameplay mutation |
| `restore` | Restore a whole type; consider other mods’ changes |
| `setObjectsData` | Modify property data using an alias and field name or patch object |

useOriginal chooses the backup; autoDownload controls the export save action. Null can mean data is not loaded. Editing snapshots has no effect, and editing data does not rebuild existing entities.

```ts
export interface DataTypeInfo {
    type: string
    kind: 'features' | 'objects' | 'lang' | 'unknown'
    category: string
}
```

## DataEntrySummary

Field meanings and usage: [DataTypeInfo](#datatypeinfo).

```ts
export interface DataEntrySummary {
    id: string
    label: string
    name?: string
    aliases?: readonly string[]
}
```

## DataMutationMeta

Field meanings and usage: [DataTypeInfo](#datatypeinfo).

```ts
export interface DataMutationMeta<T = unknown> {
    type: string
    current: T
    original: T | null
    info: DataTypeInfo
}
```

## ModServiceMethod

Provide a named function object with an id/version and optional capability names. Resolve is synchronous; failure has a null service, success exposes service.api. Version bounds apply to the service, not the game. Provider shutdown aborts the signal and invalidates old handles; resolve again instead of caching forever.

```ts
export type ModServiceMethod = (...args: any[]) => any
```

## ModServiceApiShape

Field meanings and usage: [ModServiceMethod](#modservicemethod).

```ts
export type ModServiceApiShape = Record<string, ModServiceMethod>
```

## ModServiceSnapshot

Field meanings and usage: [ModServiceMethod](#modservicemethod).

```ts
export interface ModServiceSnapshot {
    readonly id: string
    readonly version: string
    readonly provider: string
    readonly capabilities: readonly string[]
}
```

## ModServiceDefinition

Field meanings and usage: [ModServiceMethod](#modservicemethod).

```ts
export interface ModServiceDefinition<TApi extends ModServiceApiShape> {
    id: string
    version: string
    capabilities?: readonly string[]
    api: TApi
}
```

## ModServiceRegistration

Field meanings and usage: [ModServiceMethod](#modservicemethod).

```ts
export interface ModServiceRegistration extends ModServiceSnapshot {
    readonly signal: AbortSignal
    isActive(): boolean
    dispose(reason?: string): boolean
}
```

## ModServiceHandle

Field meanings and usage: [ModServiceMethod](#modservicemethod).

```ts
export interface ModServiceHandle<TApi extends ModServiceApiShape = ModServiceApiShape> extends ModServiceSnapshot {
    readonly signal: AbortSignal
    readonly api: Readonly<TApi>
    isActive(): boolean
}
```

## ModServiceRequirements

Field meanings and usage: [ModServiceMethod](#modservicemethod).

```ts
export interface ModServiceRequirements {
    minVersion?: string
    maxVersion?: string
    capabilities?: readonly string[]
    required?: boolean
}
```

## ModServiceResolveResult

Field meanings and usage: [ModServiceMethod](#modservicemethod).

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

Field meanings and usage: [ModServiceMethod](#modservicemethod).

```ts
export interface ServicesApi {
    provide<TApi extends ModServiceApiShape>(definition: ModServiceDefinition<TApi>): ModServiceRegistration
    resolve<TApi extends ModServiceApiShape = ModServiceApiShape>(id: string, requirements?: ModServiceRequirements): ModServiceResolveResult<TApi>
    list(): readonly ModServiceSnapshot[]
}
```

### Share a versioned service

Use this block as scripts/main.js; see the [manifest guide](./gp-next-js.md).

This is the provider’s complete entry. The consumer must declare the provider UUID in pack.json depends. The service ID is an agreed protocol name, not a file path.

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

### Call a dependency service

Use this block as scripts/main.js; see the [manifest guide](./gp-next-js.md).

This is the consumer entry. Do not access result.service before checking ok: missing or incompatible services return null. Resolve immediately before use instead of keeping a stale handle.

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

Field meanings and usage: [DataTypeInfo](#datatypeinfo).

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

Field meanings and usage: [DataTypeInfo](#datatypeinfo).

```ts
export interface DataQuery {
    useOriginal?: boolean
    autoDownload?: boolean
}
```

## SingleTypeDataDomain

These are domain-specific content entry points with the same snapshot and synchronous-mutation rules. Features, props, types, and almanac data are separate. List entry IDs before querying them. Shop queries use sections; lawns expose grid maps and upgrades expose routes. Generic T describes the shape expected by the author; it does not validate arbitrary game JSON.

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

Field meanings and usage: [SingleTypeDataDomain](#singletypedatadomain).

```ts
export interface PropsDataDomain extends SingleTypeDataDomain {
    getPropsData<T = unknown>(query?: DataQuery): T | null
    mutateProps<T = unknown>(mutator: (data: T) => void): unknown
}
```

## LawnDataDomain

Field meanings and usage: [SingleTypeDataDomain](#singletypedatadomain).

```ts
export interface LawnDataDomain extends PropsDataDomain {
    getBoardGridMaps<T = unknown>(query?: DataQuery): T | null
    mutateBoardGridMaps<T = unknown>(mutator: (data: T) => void): unknown
}
```

## ShopDataDomain

Field meanings and usage: [SingleTypeDataDomain](#singletypedatadomain).

```ts
export interface ShopDataDomain extends SingleTypeDataDomain {
    getCommodities<T = unknown>(section: string, query?: DataQuery): T[]
    getCommodity<T = unknown>(section: string, id: string, query?: DataQuery): T | null
}
```

## UpgradeDataDomain

Field meanings and usage: [SingleTypeDataDomain](#singletypedatadomain).

```ts
export interface UpgradeDataDomain extends SingleTypeDataDomain {
    getRoutes<T = unknown>(query?: DataQuery): T | null
    mutateRoutes<T = unknown>(mutator: (data: T) => void): unknown
}
```

## GardenApi

Currencies are coins, gems, and sprouts. Set replaces a value; add changes it. Sun and plant food belong to gameplay state. Generic property/class names must exist in the target game. Garden reads, mutates, or finishes growth. Player and garden changes may persist in the save and are not undone on disabling a mod.

```ts
export interface GardenApi {
    getState<T = unknown>(): T | null
    mutateState<T = unknown>(mutator: (data: T) => void): unknown
    finishAllGrowth(): unknown
}
```

## PlayerCurrency

Field meanings and usage: [GardenApi](#gardenapi).

```ts
export type PlayerCurrency = 'coin' | 'gem' | 'sprout'
```

## PlayerApi

Field meanings and usage: [GardenApi](#gardenapi).

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

Levels default to the current level and may return null outside a level or before loading. Changing definitions does not rebuild a running level. World IDs and lists use the game’s actual data shape; replacement methods replace complete lists. Localization uses numeric language indexes, not locale strings, and setting returns an index or null.

```ts
export interface LevelLoadedEvent {
    sceneName: string | null
    levelName: string | null
}
```

## LevelsApi

Field meanings and usage: [LevelLoadedEvent](#levelloadedevent).

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

Field meanings and usage: [LevelLoadedEvent](#levelloadedevent).

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

Field meanings and usage: [LevelLoadedEvent](#levelloadedevent).

```ts
export interface LocalizationApi {
    getLyrics<T = Record<string, unknown>>(): T | null
    getCurrentLanguage(): number
    setCurrentLanguage(next: number): number | null
    export(useOriginal?: boolean, autoDownload?: boolean): unknown
}
```

## BoardCellQuery

GetCell returns null for a nonexistent cell; list and neighbor methods return valid cells. Neighbor radius is an integer from 1–64; diagonals are included by default. Distances use cells, not pixels: Euclidean straight-line, Manhattan horizontal plus vertical, Chebyshev the larger difference. Unresolvable positions return null.

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

Field meanings and usage: [BoardCellQuery](#boardcellquery).

```ts
export interface BoardNeighborOptions {
    
    distance?: number
    
    diagonals?: boolean
    includeSelf?: boolean
}
```

## BoardDistanceMetric

Field meanings and usage: [BoardCellQuery](#boardcellquery).

```ts
export type BoardDistanceMetric = 'euclidean' | 'manhattan' | 'chebyshev'
```

## BoardApi

Field meanings and usage: [BoardCellQuery](#boardcellquery).

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

State availability means a level state can be read; running means gameplay is advancing. Phase distinguishes outside, preparation, running, pause, waiting, and outcomes. Waiting is not victory. State watches return unsubscribe functions and report before/after and changed fields. Speed-up only switches 1×/1.5×. Frame rate reads the configured target, not measured FPS.

```ts
export interface ScenesApi {
    getName(): string | null
    is(name: string): boolean
}
```

## GameplayPhase

Field meanings and usage: [ScenesApi](#scenesapi).

```ts
export type GameplayPhase = 'outside' | 'preparing' | 'running' | 'paused' | 'waiting' | 'won' | 'lost' | 'ended'
```

## GameplayOutcome

Field meanings and usage: [ScenesApi](#scenesapi).

```ts
export type GameplayOutcome = 'won' | 'lost' | null
```

## GameplayState

Field meanings and usage: [ScenesApi](#scenesapi).

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

Field meanings and usage: [ScenesApi](#scenesapi).

```ts
export type GameplayStateField = keyof GameplayState
```

## GameplayStateEvent

Field meanings and usage: [ScenesApi](#scenesapi).

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

Field meanings and usage: [ScenesApi](#scenesapi).

```ts
export interface GameplayWatchOptions extends SubscriptionOptions {
    intervalMs?: number
    emitInitial?: boolean
}
```

## GameApi

Field meanings and usage: [ScenesApi](#scenesapi).

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

Field meanings and usage: [SingleTypeDataDomain](#singletypedatadomain).

```ts
export interface GameMetadataApi {
    readonly propertySheets: SingleTypeDataDomain
    readonly narrative: SingleTypeDataDomain
}
```

## EntityDataDomain

Field meanings and usage: [SingleTypeDataDomain](#singletypedatadomain).

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

Field meanings and usage: [SingleTypeDataDomain](#singletypedatadomain).

```ts
export interface AlmanacEntityDataDomain extends EntityDataDomain {
    listAlmanacEntries(query?: Pick<DataQuery, 'useOriginal'>): DataEntrySummary[]
    getAlmanac<T = unknown>(id: string, query?: Pick<DataQuery, 'useOriginal'>): T | null
    getAlmanacData<T = unknown>(query?: Pick<DataQuery, 'useOriginal'>): T | null
    mutateAlmanac<T = unknown>(mutator: (data: T, meta: DataMutationMeta<T>) => T | void): T | null
}
```

## PackFileReader

| Method / field | Meaning |
| --- | --- |
| `own()` | Read-only snapshot of this mod |
| `from(namespace)` | Direct dependency UUID declared in depends/optionalDepends |
| `contributions()` | Accepted data-only packs directly depending on this framework |
| `listPaths()` | Actual package paths, using `/` |
| `readText/readBytes` | Await text/Uint8Array; absent files return null |
| `version/contentDigest` | Snapshot identity; importing new files does not alter an old reader |

Paths are relative to the package root; absolute paths and `..` are forbidden. Invalid paths or unauthorized dependencies throw/reject instead of returning null. Reading an asset does not register it with the game.

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

Field meanings and usage: [PackFileReader](#packfilereader).

```ts
export interface PackFilesApi {
    own(): PackFileReader
    from(namespace: string): PackFileReader
    
    contributions(): PackFileReader[]
}
```

### Read JSON from your package

Use this block as scripts/main.js; see the [manifest guide](./gp-next-js.md).

A complete entry. Add data/options.json yourself, for example `{"message":"Hello"}`. A missing file returns null, while malformed JSON throws during parsing. Validate the fields you intend to use.

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

Open requires scope, a positive version, JSON defaults, and validation. Global storage is shared between local players; save storage is tied to the current save and must be reopened after switching players. Read returns a snapshot. Update returns the complete new value, optionally asynchronously. Migrate older versions before validation. Await and handle rejected reads/writes.

```ts
export interface ModStorageHandle<T> {
    read(): Promise<T>
    update(transform: (value: T) => T | Promise<T>): Promise<T>
}
```

## ModStorageApi

Field meanings and usage: [ModStorageHandle](#modstoragehandle).

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

### Persist and migrate mod data

Use this block as scripts/main.js; see the [manifest guide](./gp-next-js.md).

A complete entry. Version 1 had count; version 2 adds enabled. Migration returns the complete new shape. Global scope shares this data across local players. Update returns the complete stored value.

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

This is the setup argument, not a console global. Use the task index to choose a domain. Meta describes the manifest. Compat checks platform features; hasDeclaredFeature only checks what the mod declares. Toasts are player-facing and log writes diagnostics. Reload cannot hot-update every resource. Advanced/unsafe APIs depend on the target game version.

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

### Understand Hook chaining

Use this block as scripts/main.js; see the [manifest guide](./gp-next-js.md).

This complete entry wraps a mod-owned object to explain arguments and return values; it does not promise a particular game method. Target must be an actual object and methodName must exist. Verify native targets for the game version. Return callNext(...args) to preserve the chain and result; callBase skips other wrappers. Do not make a synchronous method async merely to log it.

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

| Entry / field | Timing and result |
| --- | --- |
| `startup(ctx)` | With startup declared, register before the first scene; may be async |
| `setup(ctx)` | Required runtime entry; may be async and return shutdown cleanup |
| `dispose(ctx)` | Optional shutdown callback; does not make published startup content hot-unloadable |
| `registry.provide/resolve` | Share during startup collection; provider is a direct dependency UUID; missing entries throw |
| `registrations.add(id, registration)` | Unique mod-local id with preparation, publication, and rollback callbacks |
| `prepare(input)` | May await resources and return identities; input supplies previous/current identities |
| `publish()` | Must be synchronous; publish only prepared content |
| registration `dispose()` | Roll back prepared resources; never hot-unload published content |
| `getResources()` | Optional resource status list |

Native plant/zombie identities use stable id, kind, codename, and numeric engineId. Registration does not automatically import arbitrary assets. Registry access is collection-only; engine access is collection/preparation-only. Publish uses objects obtained earlier. Replacing published content generally requires restart.

```ts
export interface NativeContentIdentity {
    id: string
    kind: 'plant' | 'zombie'
    codename: string
    engineId: number
}
```

## StartupRegistration

Field meanings and usage: [NativeContentIdentity](#nativecontentidentity).

```ts
export interface StartupRegistration {
    prepare(input: { previousIdentities: NativeContentIdentity[]; identities: NativeContentIdentity[] }): MaybePromise<void | { identities?: NativeContentIdentity[] }>
    
    publish(): void
    
    dispose(): MaybePromise<void>
    getResources?(): unknown[]
}
```

## StartupContext

Field meanings and usage: [NativeContentIdentity](#nativecontentidentity).

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

Field meanings and usage: [NativeContentIdentity](#nativecontentidentity).

```ts
export interface ModModule {
    startup?(ctx: StartupContext): MaybePromise<void | (() => MaybePromise<void>)>
    setup(ctx: ModContext): MaybePromise<void | (() => MaybePromise<void>)>
    dispose?(ctx: ModContext): MaybePromise<void>
}
```
