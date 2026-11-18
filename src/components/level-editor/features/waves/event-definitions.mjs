export const WAVE_EVENT_DEFINITIONS = {
  tide: {
    objclass: 'TidalChangeWaveActionProps',
    labelKey: 'actionTide',
    alias: (wave) => `Wave${wave}TidalChangeEvent0`,
    defaults: { TidalChange: { ChangeAmount: 3, ChangeType: 'absolute' } }
  },
  dino: {
    objclass: 'DinoWaveActionProps',
    labelKey: 'actionDino',
    alias: (wave) => `Wave${wave}DinoTimeEvent0`,
    defaults: { DinoRow: 2, DinoType: 'raptor', DinoWaveDuration: 0 }
  },
  storm: {
    objclass: 'StormZombieSpawnerProps',
    labelKey: 'actionStorm',
    alias: (wave) => `Wave${wave}StormEvent0`,
    defaults: {
      ColumnStart: 4,
      ColumnEnd: 8,
      GroupSize: 2,
      TimeBetweenGroups: 2,
      Type: 'sandstorm',
      Zombies: [{ Type: 'RTID(mummy@ZombieTypes)' }, { Type: 'RTID(mummy@ZombieTypes)' }]
    }
  },
  ground: {
    objclass: 'SpawnZombiesFromGroundSpawnerProps',
    labelKey: 'actionGround',
    alias: (wave) => `Wave${wave}GroundSpawnEvent0`,
    defaults: {
      ColumnStart: 4,
      ColumnEnd: 8,
      RowStart: 0,
      RowEnd: 4,
      Zombies: [{ Type: 'RTID(mummy@ZombieTypes)' }, { Type: 'RTID(mummy@ZombieTypes)' }]
    }
  },
  frostWind: {
    objclass: 'FrostWindWaveActionProps',
    labelKey: 'actionFrostWind',
    alias: (wave) => `Wave${wave}FrostWindEvent0`,
    defaults: { Winds: [{ Direction: 'right', Row: 2 }] }
  },
  beachAmbush: {
    objclass: 'BeachStageEventZombieSpawnerProps',
    labelKey: 'actionBeachAmbush',
    alias: (wave) => `Wave${wave}BeachAmbushEvent0`,
    defaults: {
      ZombieName: 'beach',
      ZombieCount: 3,
      ColumnStart: 4,
      ColumnEnd: 8,
      GroupSize: 1,
      TimeBeforeFullSpawn: 0.5,
      TimeBetweenGroups: 0.25
    }
  },
  raidingParty: {
    objclass: 'RaidingPartyZombieSpawnerProps',
    labelKey: 'actionRaidingParty',
    alias: (wave) => `Wave${wave}RaidingPartyEvent0`,
    defaults: {
      ZombieType: 'RTID(pirate_swashbuckler@ZombieTypes)',
      SwashbucklerCount: 5,
      GroupSize: 1,
      TimeBetweenGroups: 1
    }
  },
  spiderRain: {
    objclass: 'SpiderRainZombieSpawnerProps',
    labelKey: 'actionSpiderRain',
    alias: (wave) => `Wave${wave}SpiderRainEvent0`,
    defaults: {
      ColumnEnd: 7,
      ColumnStart: 1,
      GroupSize: 1,
      SpiderCount: 5,
      SpiderZombieName: 'future_imp',
      TimeBeforeFullSpawn: 2,
      TimeBetweenGroups: 0.25,
      WaveStartMessage: '[WARNING_SPIDERRAIN]',
      ZombieFallTime: 1.5
    }
  },
  parachuteRain: {
    objclass: 'ParachuteRainZombieSpawnerProps',
    labelKey: 'actionParachuteRain',
    alias: (wave) => `Wave${wave}ParachuteRainEvent0`,
    defaults: {
      ColumnEnd: 8,
      ColumnStart: 4,
      GroupSize: 1,
      SpiderCount: 4,
      SpiderZombieName: 'lostcity_lostpilot',
      TimeBeforeFullSpawn: 1,
      TimeBetweenGroups: 0.25,
      WaveStartMessage: '[WARNING_PARACHUTERAIN]',
      ZombieFallTime: 1.5
    }
  },
  gravestones: {
    objclass: 'SpawnGravestonesWaveActionProps',
    labelKey: 'actionGravestones',
    alias: (wave) => `Wave${wave}GravestoneEvent0`,
    defaults: {
      GravestonePool: [{ Count: 3, Type: 'RTID(gravestone_egypt@GridItemTypes)' }],
      SpawnEffectAnimID: 'POPANIM_EFFECTS_TOMBSTONE_DARK_SPAWN_EFFECT',
      SpawnPositionsPool: Array.from({ length: 5 }, (_, row) => ({ mX: 5, mY: row })),
      SpawnSoundID: 'Play_Zomb_Egypt_TombRaiser_Grave_Rise',
      maxX: 8,
      minX: 3
    }
  },
  gridItemSpawn: {
    objclass: 'SpawnZombiesFromGridItemSpawnerProps',
    labelKey: 'actionGridItemSpawn',
    alias: (wave) => `Wave${wave}GridItemSpawnEvent0`,
    defaults: {
      AdditionalPlantfood: 0,
      GridTypes: ['RTID(gravestone_egypt@GridItemTypes)'],
      WaveStartMessage: '',
      ZombieSpawnWaitTime: 0,
      Zombies: [{ Type: 'RTID(mummy@ZombieTypes)' }]
    }
  },
  dropShip: {
    objclass: 'DropShipZombieSpawnerProps',
    labelKey: 'actionDropShip',
    alias: (wave) => `Wave${wave}DropShipEvent0`,
    defaults: {
      DropShipPosition: { mX: 4, mY: 2 },
      DropShipType: 'sky_dropship',
      DropShipShiftedProperties: {
        ImpType: 'sky_imp',
        ImpCount: { Min: 4, Max: 4 },
        TimeBeforeFirst: { Min: 1, Max: 1 },
        TimeBetween: { Min: 2, Max: 2 },
        ImpLandingColumns: [0, 1],
        ImpLandingRows: [],
        ImpFlyingDuration: { Min: 3, Max: 3.5 }
      }
    }
  },
  thunderCharge: {
    objclass: 'ThunderChargeWaveActionProps',
    labelKey: 'actionThunderCharge',
    alias: (wave) => `Wave${wave}ThunderChargeEvent0`,
    defaults: {
      TimeBeforeFirst: { Min: 3, Max: 3 },
      TimeBetween: { Min: 3, Max: 3 },
      WaveStartMessage: '[WARNING_THUNDER_STRIKE]',
      Thunders: [
        { Sign: 1, LinkedPlantCount: 5 },
        { Sign: -1, LinkedPlantCount: 5 }
      ]
    }
  },
  qigongStrike: {
    objclass: 'QigongStrikeWaveActionProps',
    labelKey: 'actionQigongStrike',
    alias: (wave) => `Wave${wave}QigongStrikeEvent0`,
    defaults: {
      WaveStartMessage: '[WARNING_QIGONG_STRIKE]',
      Zombies: [{ Type: 'abbot_imp', Rows: [2], Columns: [5], Delay: 1 }]
    }
  },
  chiHole: {
    objclass: 'KongfuChiHoleProps',
    labelKey: 'actionChiHole',
    alias: (wave) => `Wave${wave}KongfuChiHoleEvent0`,
    defaults: {
      Direction: 1,
      LanesToAffect: [0, 1, 2, 3, 4],
      WaveStartMessage: '[WARNING_QIGONG_HOLE]',
      PlantMovingTimeBetweenSquares: 1,
      LifeSpan: 1.5,
      TimeBeforeAbsorbing: 1.5,
      Column: 8,
      SuppressesNextWave: true,
      SuppressObjectiveTip: false
    }
  },
  missileLocate: {
    objclass: 'MissileLocateWaveActionProps',
    labelKey: 'actionMissileLocate',
    alias: (wave) => `Wave${wave}MissileEvent0`,
    defaults: {
      ColumnEnd: 0,
      ColumnStart: 0,
      MissileCount: 1,
      MissileFallCountdown: 4,
      WaveStartMessage: '[WARNING_MISSILE]'
    }
  },
  waveWarning: {
    objclass: 'WaveWarningProps',
    labelKey: 'actionWaveWarning',
    alias: (wave) => `Wave${wave}Warning0`,
    defaults: {
      LabelR: 255,
      LabelG: 100,
      LabelB: 0,
      LabelAInit: 4,
      OutLineR: 0,
      OutLineG: 0,
      OutLineB: 0,
      String: 'WATCH OUT!',
      StringMultiLanguage: { en: 'WATCH OUT!', zh: '小心！' },
      Sound: 'HugeWave',
      LabelTargetScale: 0.5,
      LabelInitScale: 4,
      Duration: 3,
      InitTime: 0.33
    }
  },
  scheduler: {
    objclass: 'WaveSchedulerProps',
    labelKey: 'actionScheduler',
    alias: (wave) => `Wave${wave}Scheduler0`,
    defaults: {
      RewardWhenEnded: false,
      SuppressRewardState: false,
      TimeBeforeFirst: { Min: 1, Max: 1 },
      TimeBetween: { Min: 1, Max: 1 },
      Repeat: { Min: 1, Max: 1 },
      Events: []
    }
  }
};

