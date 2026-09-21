export type MaybePromise<T> = T | Promise<T>
export interface SubscriptionOptions {
    label?: string
    signal?: AbortSignal
}
export type EntityKind = 'plant' | 'zombie' | 'projectile' | 'resource' | 'armor' | 'tomb' | 'tile-liquid' | 'dinosaur' | 'entity' | string
export type EntityAction = 'inspect' | 'damage' | 'heal' | 'eliminate' | 'moveToCell' | 'collect'
export type Team = 'plant' | 'zombie' | 'neutral' | 'unknown'
export type TeamFacet = 'identity' | 'targeting'

export interface TeamState {
    readonly team: Team
    readonly targetTeam: Team
}

export interface TeamFacetCapability {
    readonly available: boolean
    readonly adapters: readonly string[]
    readonly teams: readonly Team[]
    readonly reason: string | null
}

export interface TeamCapabilities {
    readonly identity: TeamFacetCapability
    readonly targeting: TeamFacetCapability
}

export interface TeamsApi {
    getState(target: EntityHandle): TeamState
    getCapabilities(target: EntityHandle): TeamCapabilities
    supports(target: EntityHandle, facet: TeamFacet | string): boolean
}

export interface EntityHealthLayer {
    current: number
    max: number | null
    ratio: number | null
}

export interface EntityHealth extends EntityHealthLayer {
    secondary: EntityHealthLayer | null
    totalCurrent: number
    totalMax: number | null
}

export interface EntityCapabilities {
    inspect: boolean
    damage: boolean
    heal: boolean
    eliminate: boolean
    moveToCell: boolean
    collect: boolean
}

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

export interface BoardCell {
    readonly laneIndex: number
    readonly columnIndex: number
}

export interface ActionOptions {
    required?: boolean
}

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

export interface HealOptions {
    required?: boolean
}

export interface ActionResult<T = unknown> {
    ok: boolean
    methodName: string | null
    value: T | undefined
    reason: 'method-not-found' | 'method-threw' | 'damage-adapter-unavailable' | string | null
    error?: unknown
    requestedAmount?: number
    observed?: EntityHealthObservation
}

export interface CollectActionResult<T = unknown> extends ActionResult<T> {
    
    accepted: boolean
    
    collected: boolean
}

export interface ObservedAmountActionResult<T = unknown> extends ActionResult<T> {
    
    accepted: boolean
    
    appliedAmount: number
}

export interface DamageActionResult<T = unknown> extends ObservedAmountActionResult<T> {
    
    finalAmount: number
    combat: CombatDamageRequest
}

export interface HealActionResult<T = unknown> extends ObservedAmountActionResult<T> {}

export type EntityHealthChangeKind = 'damage' | 'healing' | 'redistribution' | 'unchanged'

export interface EntityHealthChange {
    change: EntityHealthChangeKind
    amount: number | null
    totalDelta: number | null
    coreDelta: number | null
    secondaryDelta: number | null
    affectedLayers: ReadonlyArray<'core' | 'secondary'>
    depleted: boolean
}

export interface EntityHealthObservation extends EntityHealthChange {
    before: { alive: boolean; health: EntityHealth | null }
    after: { alive: boolean; health: EntityHealth | null }
}

export interface EntityInactiveEvent {
    readonly type: 'disposed' | 'retired'
    readonly reason: string
    readonly entity: EntityHandle
}

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

export type BoardSubject = BoardCell | EntityHandle | EntitySnapshot

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

export interface EntityWatchEventBase {
    changes: ReadonlyArray<'presence' | 'generation' | 'identity' | 'grid' | 'position' | 'health' | 'alive' | 'team' | 'capabilities' | string>
    handle: EntityHandle
    sceneName: string | null
    timestamp: number
}

export type EntityWatchEvent = EntityWatchEventBase & (
    | { type: 'added'; previous: null; current: EntitySnapshot }
    | { type: 'changed'; previous: EntitySnapshot; current: EntitySnapshot }
    | { type: 'removed'; previous: EntitySnapshot; current: null }
)

export interface EntityWatchOptions extends SubscriptionOptions {
    intervalMs?: number
    emitInitial?: boolean
    emitRemoved?: boolean
    fields?: Array<'identity' | 'grid' | 'position' | 'health' | 'alive' | 'team' | 'capabilities'>
}

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

export type CombatModifierPhase = 'source' | 'target'
export type CombatModifierOperation = 'add' | 'multiply' | 'clamp' | 'block'
export type CombatMatchValue<T> = T | readonly T[]

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

export interface CombatModifierDefinitionBase {
    id: string
    phase: CombatModifierPhase
    priority?: number
    
    subject?: EntityHandle
    match?: CombatModifierMatch
}

export type CombatModifierDefinition =
    | (CombatModifierDefinitionBase & { operation: 'add'; value: number })
    | (CombatModifierDefinitionBase & { operation: 'multiply'; value: number })
    | (CombatModifierDefinitionBase & { operation: 'clamp'; min?: number; max?: number })
    | (CombatModifierDefinitionBase & { operation: 'block'; reason?: string })

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

export interface CombatModifierState extends CombatModifierMetadata {
    readonly active: boolean
    readonly state: 'active' | 'disposed' | string
    readonly stateReason: string | null
}

export interface CombatModifierHandle {
    readonly id: string
    readonly owner: string
    readonly phase: CombatModifierPhase
    readonly signal: AbortSignal
    isActive(): boolean
    snapshot(): CombatModifierState
    dispose(reason?: string): boolean
}

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

export interface CombatEntityIdentitySnapshot {
    readonly kind: EntityKind
    readonly codename: string | null
    readonly team: Team
}

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

export interface CombatCapabilities {
    readonly available: true
    readonly coverage: 'api-actions-only'
    readonly nativeInterception: false
    readonly sourceAttribution: true
    readonly typedDamage: true
    readonly operations: readonly CombatModifierOperation[]
}

export interface CombatApi {
    getCapabilities(): CombatCapabilities
    readonly modifiers: {
        add(definition: CombatModifierDefinition): CombatModifierHandle
        list(): readonly CombatModifierMetadata[]
    }
    watchDamage(listener: (event: CombatDamageResolvedEvent) => MaybePromise<void>, options?: SubscriptionOptions): () => boolean
}

export type SpawnKind = 'plant' | 'zombie' | 'projectile' | 'resource' | 'tomb' | 'tile-liquid'
export type CellSpawnKind = Exclude<SpawnKind, 'projectile'>
export type ProjectileTargetSide = Exclude<Team, 'neutral' | 'unknown'>

export interface LinearProjectileMotion {
    kind: 'linear'
    
    velocity: { columnsPerSecond: number; lanesPerSecond: number }
    
    heightInCells?: number
}

export interface SpawnDescriptorBase<K extends SpawnKind = SpawnKind> {
    kind: K
    type: string
    at: BoardCell
    
    required?: boolean
}

export interface CellSpawnDescriptor extends SpawnDescriptorBase<CellSpawnKind> {
    targetSide?: never
    motion?: never
}

export interface ProjectileSpawnDescriptor extends SpawnDescriptorBase<'projectile'> {
    
    targetSide: ProjectileTargetSide
    
    motion: LinearProjectileMotion
}

export type SpawnDescriptor = CellSpawnDescriptor | ProjectileSpawnDescriptor

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

export interface SpawnDisposeResult {
    ok: boolean
    disposed: boolean
    results: readonly unknown[]
}

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

export interface SpawnsApi {
    getCapabilities(): Readonly<Record<SpawnKind, SpawnCapability>>
    supports(kind: string): kind is SpawnKind
    spawn<D extends SpawnDescriptor>(descriptor: D): Promise<SpawnResult<D['kind']>>
}

export type StatusEffect = 'stun' | 'chill' | 'freeze' | 'butter' | 'dark-matter' | 'perfume' | 'chili-stun' | 'glittering' | 'sap' | 'poison'
export type DurationStatusEffect = Exclude<StatusEffect, 'poison'>

export interface DurationStatusDescriptor {
    effect: DurationStatusEffect
    duration: number
    damagePerSecond?: never
    propagation?: never
    required?: boolean
}

export interface PoisonStatusDescriptor {
    effect: 'poison'
    duration: number
    
    damagePerSecond: number
    
    propagation?: 'none' | 'contact'
    required?: boolean
}

export type StatusDescriptor = DurationStatusDescriptor | PoisonStatusDescriptor

export interface StatusEffectCapability {
    effect: StatusEffect
    available: boolean
    adapter: string | null
    
    clearable: boolean
}

export interface StatusEffectState {
    effect: StatusEffect
    available: boolean
    adapter: string | null
    active: boolean
    
    remaining: number | null
    
    details: Readonly<Record<string, unknown>> | null
}

export interface StatusSnapshot {
    effects: Readonly<Record<string, StatusEffectState>>
    clearAll: boolean
    
    targetActive: boolean
}

export type StatusTransitionChange = 'activated' | 'deactivated' | 'extended' | 'shortened' | 'adapter' | 'details'

export interface StatusEffectTransition {
    effect: StatusEffect
    changes: readonly StatusTransitionChange[]
    before: StatusEffectState
    after: StatusEffectState
}

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

export interface StatusClearResult {
    ok: boolean
    methodName: string | null
    before: StatusSnapshot | null
    after: StatusSnapshot | null
    changes: readonly StatusEffectTransition[]
    reason: string | null
    message: string | null
}

export interface StatusEffectClearResult extends StatusClearResult {
    effect: StatusEffect
    adapter: string | null
    cleared: boolean
}

export type StatusWatchEventType = 'started' | 'ended' | 'updated'
export type StatusWatchChange = 'initial' | 'active' | 'adapter' | 'details' | 'remaining'
export type StatusWatchReason = 'initial' | 'activated' | 'expired-or-cleared' | 'target-inactive' | 'extended-or-updated'

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

export interface StatusWatchOptions extends SubscriptionOptions {
    
    effects?: readonly StatusEffect[]
    
    intervalMs?: number
    
    emitInitial?: boolean
}

export type StatusLayerEffect = 'poison' | 'speed-multiplier'

export interface PoisonStatusLayerDetails {
    damagePerSecond: number
}

export interface SpeedMultiplierStatusLayerDetails {
    multiplier: number
}

export interface StatusLayerDetailsByEffect {
    poison: PoisonStatusLayerDetails
    'speed-multiplier': SpeedMultiplierStatusLayerDetails
}

export interface StatusLayerCapability {
    effect: StatusLayerEffect
    available: boolean
    adapter: string | null
    
    sourceOwned: boolean
}

export type StatusLayerState<E extends StatusLayerEffect = StatusLayerEffect> = {
    [K in E]: {
        effect: K
        active: boolean
        
        remaining: number
        details: Readonly<StatusLayerDetailsByEffect[K]>
        reason: string | null
    }
}[E]

export interface StatusLayerDisposeResult<E extends StatusLayerEffect = StatusLayerEffect> {
    ok: boolean
    disposed: boolean
    before: StatusLayerState<E>
    after: StatusLayerState<E>
    reason: string | null
}

export interface StatusLayerHandle<E extends StatusLayerEffect = StatusLayerEffect> {
    readonly effect: E
    readonly target: EntityHandle
    isActive(): boolean
    getState(): StatusLayerState<E>
    
    dispose(): StatusLayerDisposeResult<E>
}

export interface PoisonStatusLayerDescriptor {
    effect: 'poison'
    duration: number
    damagePerSecond: number
    required?: boolean
}

export interface SpeedMultiplierStatusLayerDescriptor {
    effect: 'speed-multiplier'
    duration: number
    
    multiplier: number
    required?: boolean
}

export type StatusLayerDescriptor = PoisonStatusLayerDescriptor | SpeedMultiplierStatusLayerDescriptor

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

export interface StatusLayerApi {
    getCapabilities(target: EntityHandle): {
        effects: Readonly<Record<string, StatusLayerCapability>>
    }
    supports(target: EntityHandle, effect: string): effect is StatusLayerEffect
    apply(target: EntityHandle, descriptor: PoisonStatusLayerDescriptor): StatusLayerApplyResult<'poison'>
    apply(target: EntityHandle, descriptor: SpeedMultiplierStatusLayerDescriptor): StatusLayerApplyResult<'speed-multiplier'>
}

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

export type ProjectileImpactKind = 'direct' | 'splash' | 'unclassified'

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

export interface ImpactsApi {
    getCapabilities(): ProjectileImpactCapabilities
    supports(targetKind: 'plant' | 'zombie' | 'tomb', impactKind?: ProjectileImpactKind): boolean
    watch(listener: (event: ProjectileImpactEvent) => MaybePromise<void>, options?: ProjectileImpactWatchOptions): () => boolean
}

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

export interface GameClockState {
    readonly available: boolean
    readonly scale: number | null
    readonly paused: boolean
}

export interface GameClockTick {
    readonly deltaSeconds: number
    readonly scale: number | null
    readonly paused: boolean
    readonly frame: number
}

export interface GameClockTaskOptions {
    label?: string
    signal?: AbortSignal
}

export interface GameClockApi {
    isAvailable(): boolean
    getState(): GameClockState
    onTick(callback: (tick: GameClockTick) => MaybePromise<void>, options?: GameClockTaskOptions): () => boolean
    sleep(seconds: number, options?: GameClockTaskOptions): Promise<void>
    setTimeout(callback: (tick: GameClockTick) => MaybePromise<void>, seconds: number, options?: GameClockTaskOptions): () => boolean
    setInterval(callback: (tick: GameClockTick) => MaybePromise<void>, seconds: number, options?: GameClockTaskOptions): () => boolean
}

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

export interface SettingsChangeEvent {
    readonly namespace: string
    readonly operation: 'set' | 'reset' | 'import'
    readonly previous: Record<string, unknown>
    readonly values: Record<string, unknown>
}

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

export interface ControlItemBase {
    disabled?: boolean | (() => boolean)
    visible?: boolean | (() => boolean)
    key: string
    label: string
    description?: string
}

export type ControlItem =
    | (ControlItemBase & { type: 'action'; variant?: string; onClick: () => MaybePromise<void> })
    | (ControlItemBase & { type: 'toggle'; getValue: () => boolean; setValue: (value: boolean) => MaybePromise<void> })
    | (ControlItemBase & { type: 'select'; getValue: () => string; options: Array<{ label: string; value: string }>; setValue: (value: string) => MaybePromise<void> })
    | (ControlItemBase & { type: 'number'; getValue: () => number; min?: number; max?: number; step?: number; setValue: (value: number) => MaybePromise<void> })
    | (ControlItemBase & { type: 'text'; getValue: () => string; setValue: (value: string) => MaybePromise<void> })
    | (ControlItemBase & { type: 'readonly' } & ({ value: unknown; getValue?: () => unknown } | { getValue: () => unknown }))

export interface ControlsApi {
    definePanel(definition: {
        title: string
        description?: string
        groups: Array<{ title: string; description?: string; items: ControlItem[] }>
    }): unknown
    clear(): void
}

export interface EventsApi {
    on(name: string, listener: (...args: any[]) => any, options?: SubscriptionOptions): () => boolean
    once(name: string, listener: (...args: any[]) => any, options?: SubscriptionOptions): () => boolean
    emit(name: string, ...args: any[]): unknown
    emitAsync(name: string, ...args: any[]): Promise<unknown>
    onDispose(cleanup: () => MaybePromise<void>, label?: string): () => void
}

export interface DataTypeInfo {
    type: string
    kind: 'features' | 'objects' | 'lang' | 'unknown'
    category: string
}

export interface DataEntrySummary {
    id: string
    label: string
    name?: string
    aliases?: readonly string[]
}

export interface DataMutationMeta<T = unknown> {
    type: string
    current: T
    original: T | null
    info: DataTypeInfo
}

export type ModServiceMethod = (...args: any[]) => any
export type ModServiceApiShape = Record<string, ModServiceMethod>

export interface ModServiceSnapshot {
    readonly id: string
    readonly version: string
    readonly provider: string
    readonly capabilities: readonly string[]
}

export interface ModServiceDefinition<TApi extends ModServiceApiShape> {
    id: string
    version: string
    capabilities?: readonly string[]
    api: TApi
}

export interface ModServiceRegistration extends ModServiceSnapshot {
    readonly signal: AbortSignal
    isActive(): boolean
    dispose(reason?: string): boolean
}

export interface ModServiceHandle<TApi extends ModServiceApiShape = ModServiceApiShape> extends ModServiceSnapshot {
    readonly signal: AbortSignal
    readonly api: Readonly<TApi>
    isActive(): boolean
}

export interface ModServiceRequirements {
    minVersion?: string
    maxVersion?: string
    capabilities?: readonly string[]
    required?: boolean
}

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

export interface ServicesApi {
    provide<TApi extends ModServiceApiShape>(definition: ModServiceDefinition<TApi>): ModServiceRegistration
    resolve<TApi extends ModServiceApiShape = ModServiceApiShape>(id: string, requirements?: ModServiceRequirements): ModServiceResolveResult<TApi>
    list(): readonly ModServiceSnapshot[]
}

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

export interface DataQuery {
    useOriginal?: boolean
    autoDownload?: boolean
}

export interface SingleTypeDataDomain {
    readonly type: string
    getData<T = unknown>(query?: DataQuery): T | null
    listEntries(query?: DataQuery): DataEntrySummary[]
    getEntry<T = unknown>(id: string, query?: DataQuery): T | null
    mutate<T = unknown>(mutator: (data: T, meta: DataMutationMeta<T>) => T | void): T | null
    export(query?: DataQuery): unknown
}

export interface PropsDataDomain extends SingleTypeDataDomain {
    getPropsData<T = unknown>(query?: DataQuery): T | null
    mutateProps<T = unknown>(mutator: (data: T) => void): unknown
}

export interface LawnDataDomain extends PropsDataDomain {
    getBoardGridMaps<T = unknown>(query?: DataQuery): T | null
    mutateBoardGridMaps<T = unknown>(mutator: (data: T) => void): unknown
}

export interface ShopDataDomain extends SingleTypeDataDomain {
    getCommodities<T = unknown>(section: string, query?: DataQuery): T[]
    getCommodity<T = unknown>(section: string, id: string, query?: DataQuery): T | null
}

export interface UpgradeDataDomain extends SingleTypeDataDomain {
    getRoutes<T = unknown>(query?: DataQuery): T | null
    mutateRoutes<T = unknown>(mutator: (data: T) => void): unknown
}

export interface GardenApi {
    getState<T = unknown>(): T | null
    mutateState<T = unknown>(mutator: (data: T) => void): unknown
    finishAllGrowth(): unknown
}

export type PlayerCurrency = 'coin' | 'gem' | 'sprout'

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

export interface LevelLoadedEvent {
    sceneName: string | null
    levelName: string | null
}

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

export interface WorldMapApi extends Omit<SingleTypeDataDomain, 'type'> {
    getWorlds<T = unknown>(query?: Pick<DataQuery, 'useOriginal'>): T[]
    getWorld<T = unknown>(id: string | number, query?: Pick<DataQuery, 'useOriginal'>): T | null
    mutateWorlds<T = unknown>(mutator: (worlds: T[], meta: DataMutationMeta<unknown>) => T[] | void, query?: Pick<DataQuery, 'useOriginal'>): unknown
    patchWorld<T = unknown>(id: string | number, mutator: (world: T, context: { world: T; worlds: T[]; options: object }) => T | void, options?: object): unknown
    replaceWorldLevels(id: string | number, levels?: readonly unknown[]): unknown
    replaceWorldPlants(id: string | number, plants?: readonly unknown[]): unknown
}

export interface LocalizationApi {
    getLyrics<T = Record<string, unknown>>(): T | null
    getCurrentLanguage(): number
    setCurrentLanguage(next: number): number | null
    export(useOriginal?: boolean, autoDownload?: boolean): unknown
}

export interface BoardCellQuery {
    laneIndex?: number
    laneIndexes?: readonly number[]
    columnIndex?: number
    columnIndexes?: readonly number[]
    filter?: (cell: BoardCell) => boolean
}

export interface BoardNeighborOptions {
    
    distance?: number
    
    diagonals?: boolean
    includeSelf?: boolean
}

export type BoardDistanceMetric = 'euclidean' | 'manhattan' | 'chebyshev'

export interface BoardApi {
    getCell(laneIndex: number, columnIndex: number): BoardCell | null
    resolveCell(subject: BoardSubject): BoardCell | null
    listCells(query?: BoardCellQuery): readonly BoardCell[]
    getNeighbors(subject: BoardSubject, options?: BoardNeighborOptions): readonly BoardCell[]
    isSameCell(first: BoardSubject, second: BoardSubject): boolean
    
    distance(first: BoardSubject, second: BoardSubject, metric?: BoardDistanceMetric): number | null
}

export interface ScenesApi {
    getName(): string | null
    is(name: string): boolean
}

export type GameplayPhase = 'outside' | 'preparing' | 'running' | 'paused' | 'waiting' | 'won' | 'lost' | 'ended'
export type GameplayOutcome = 'won' | 'lost' | null

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

export type GameplayStateField = keyof GameplayState

export interface GameplayStateEvent {
    readonly type: 'initial' | 'changed'
    readonly changes: readonly GameplayStateField[]
    readonly previous: GameplayState | null
    readonly current: GameplayState
    readonly timestamp: number
}

export interface GameplayWatchOptions extends SubscriptionOptions {
    intervalMs?: number
    emitInitial?: boolean
}

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

export interface GameMetadataApi {
    readonly propertySheets: SingleTypeDataDomain
    readonly narrative: SingleTypeDataDomain
}

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

export interface AlmanacEntityDataDomain extends EntityDataDomain {
    listAlmanacEntries(query?: Pick<DataQuery, 'useOriginal'>): DataEntrySummary[]
    getAlmanac<T = unknown>(id: string, query?: Pick<DataQuery, 'useOriginal'>): T | null
    getAlmanacData<T = unknown>(query?: Pick<DataQuery, 'useOriginal'>): T | null
    mutateAlmanac<T = unknown>(mutator: (data: T, meta: DataMutationMeta<T>) => T | void): T | null
}


export interface PackFileReader {
    readonly namespace: string
    readonly version: string
    readonly contentDigest: string
    listPaths(): string[]
    readText(relativePath: string): Promise<string | null>
    readBytes(relativePath: string): Promise<Uint8Array | null>
}


export interface PackFilesApi {
    own(): PackFileReader
    from(namespace: string): PackFileReader
    
    contributions(): PackFileReader[]
}

export interface ModStorageHandle<T> {
    read(): Promise<T>
    update(transform: (value: T) => T | Promise<T>): Promise<T>
}
export interface ModStorageApi {
    
    open<T>(definition: {
        scope: 'global' | 'save'
        version: number
        defaults: T
        validate(value: unknown): boolean | Promise<boolean>
        migrate?(value: unknown, fromVersion: number, toVersion: number): T | Promise<T>
    }): Promise<ModStorageHandle<T>>
}

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


export interface NativeContentIdentity {
    id: string
    kind: 'plant' | 'zombie'
    codename: string
    engineId: number
}

export interface StartupRegistration {
    prepare(input: { previousIdentities: NativeContentIdentity[]; identities: NativeContentIdentity[] }): MaybePromise<void | { identities?: NativeContentIdentity[] }>
    
    publish(): void
    
    dispose(): MaybePromise<void>
    getResources?(): unknown[]
}


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

export interface ModModule {
    startup?(ctx: StartupContext): MaybePromise<void | (() => MaybePromise<void>)>
    setup(ctx: ModContext): MaybePromise<void | (() => MaybePromise<void>)>
    dispose?(ctx: ModContext): MaybePromise<void>
}
