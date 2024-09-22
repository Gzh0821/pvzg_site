const data = {
    // 关卡标题
    "#comment": "~",
    // 关卡的基本描述信息
    "Information": {
        // 关卡的UUID
        "uuid": "c58a208a-a5e3-4cfa-9bc3-cc7fbb08c2e3",
        // 关卡名字
        "Name": "Bank theft 1",
        // 关卡的作者
        "Author": "LMYY",
        // 作者的链接
        "AuthorLink": "https://github.com/Gzh0821",
        // 关卡的描述
        "Introduction": "A level that is easy to play, but hard to win.",
        // 关卡的版本
        "Version": "1.0",
        // 关卡的创建时间
        "CreatedAt": "2022-03-08",
        // 关卡的更新时间
        "UpdatedAt": "2022-03-08",
        // 关卡的难度，可选值有：Easy, Normal, Hard, Expert
        "Difficulty": "Easy",
        // 关卡的分类，可选值有：Survival, Tower Defense, Tower Defense Survival, Puzzle, Mini-game, Adventure, Other
        "Category": "Survival",
    },
    // 关卡的总列表，每个对象代表一个关卡配置项。
    "objects": [
        {
            // 配置项：关卡的基本设置
            "objclass": "LevelDefinition",
            // 关卡的基本设置
            "objdata": {
                // 关卡的描述
                "Description": "~",
                // 关卡的编号，用于系列关卡中
                "LevelNumber": 1,
                // 保持默认即可
                "Loot": "RTID(DefaultLoot@LevelModules)",
                // 关卡的玩法模式，前三条为基本模式。
                "Modules": [
                    "RTID(ZombiesDeadWinCon@LevelModules)",
                    "RTID(DefaultZombieWinCondition@LevelModules)",
                    "RTID(NewWaves@CurrentLevel)",

                    "RTID(StandardIntro@LevelModules)",
                    "RTID(ProtectThePlant@CurrentLevel)",
                    "RTID(SeedBank@CurrentLevel)",
                    "RTID(ChallengeModule@CurrentLevel)",
                    "RTID(ForzenPlantPlacement@CurrentLevel)"
                ],
                // 显示在游戏内的关卡名
                "Name": "Bank theft 1",
                // 可选：多语言支持
                "NameMultiLanguage": {
                    "en": "Bank theft I",
                    "zh": "银行失窃I"
                },
                // 作者，建议与Author一致
                "WritenBy": "保罗_刘",
                // 无用：掉落相关
                "NormalPresentTable": "egypt_normal_01",
                "ShinyPresentTable": "egypt_shiny_01",
                // 关卡的场景，格式为:RTID(世界名Stage@LevelModules)
                "StageModule": "RTID(TutorialStage@LevelModules)"
            }
        },
        // 每个玩法模式的配置:
        {
            "aliases": [
                "NewWaves"
            ],
            "objclass": "WaveManagerModuleProperties",
            "objdata": {
                "DynamicZombies": [
                    {},
                    {},
                    {},
                    {
                        "PointIncrementPerWave": 20,
                        "StartingPoints": 100,
                        "StartingWave": 5,
                        "ZombiePool": [
                            "RTID(tutorial@ZombieTypes)",
                            "RTID(tutorial_armor1@ZombieTypes)"
                        ]
                    },
                    {
                        "PointIncrementPerWave": 30,
                        "StartingPoints": 100,
                        "StartingWave": 5,
                        "ZombiePool": [
                            "RTID(tutorial@ZombieTypes)",
                            "RTID(tutorial_armor1@ZombieTypes)"
                        ]
                    },
                    {
                        "PointIncrementPerWave": 30,
                        "StartingPoints": 200,
                        "StartingWave": 4,
                        "ZombiePool": [
                            "RTID(tutorial@ZombieTypes)",
                            "RTID(tutorial_armor1@ZombieTypes)"
                        ]
                    },
                    {
                        "PointIncrementPerWave": 40,
                        "StartingPoints": 200,
                        "StartingWave": 3,
                        "ZombiePool": [
                            "RTID(tutorial@ZombieTypes)",
                            "RTID(tutorial_armor1@ZombieTypes)"
                        ]
                    }
                ],
                "WaveManagerProps": "RTID(WaveManagerProps@CurrentLevel)"
            }
        },
        {
            "aliases": [
                "WaveManagerProps"
            ],
            "objclass": "WaveManagerProperties",
            "objdata": {
                "FlagWaveInterval": 12,
                "WaveCount": 12,
                "Waves": [
                    [
                        "RTID(Wave1@CurrentLevel)"
                    ],
                    [
                        "RTID(Wave2@CurrentLevel)"
                    ],
                    [
                        "RTID(Wave3@CurrentLevel)"
                    ],
                    [
                        "RTID(Wave4@CurrentLevel)"
                    ],
                    [
                        "RTID(Wave5@CurrentLevel)"
                    ],
                    [
                        "RTID(Wave6@CurrentLevel)"
                    ],
                    [
                        "RTID(Wave7@CurrentLevel)"
                    ],
                    [
                        "RTID(Wave8@CurrentLevel)"
                    ],
                    [
                        "RTID(Wave9@CurrentLevel)"
                    ],
                    [
                        "RTID(Wave10@CurrentLevel)"
                    ],
                    [
                        "RTID(Wave11@CurrentLevel)"
                    ],
                    [
                        "RTID(Wave12@CurrentLevel)"
                    ]
                ]
            }
        },
        {
            "aliases": [
                "SeedBank"
            ],
            "objclass": "SeedBankProperties",
            "objdata": {
                "PresetPlantList": [
                    {
                        "Level": -1,
                        "PlantType": "iceburg"
                    }
                ],
                "SelectionMethod": "preset"
            }
        },
        {
            "aliases": [
                "ProtectThePlant"
            ],
            "objclass": "ProtectThePlantChallengeProperties",
            "objdata": {
                "MustProtectCount": 1,
                "Plants": [
                    {
                        "GridX": 0,
                        "GridY": 1,
                        "PlantType": "escaperoot",
                        "Level": -1
                    }
                ]
            }
        },
        {
            "aliases": [
                "ForzenPlantPlacement"
            ],
            "objclass": "InitialPlantProperties",
            "objdata": {
                "InitialPlantPlacements": [
                    {
                        "GridX": 0,
                        "GridY": 0,
                        "TypeName": "peashooter",
                        "Level": -1
                    },
                    {
                        "GridX": 0,
                        "GridY": 3,
                        "TypeName": "peashooter",
                        "Level": -1
                    },
                    {
                        "GridX": 1,
                        "GridY": 1,
                        "TypeName": "peashooter",
                        "Level": -1
                    },
                    {
                        "GridX": 1,
                        "GridY": 2,
                        "TypeName": "peashooter",
                        "Level": -1
                    },
                    {
                        "GridX": 1,
                        "GridY": 4,
                        "TypeName": "peashooter",
                        "Level": -1
                    },
                    {
                        "GridX": 2,
                        "GridY": 3,
                        "TypeName": "repeater",
                        "Level": -1
                    },
                    {
                        "GridX": 2,
                        "GridY": 0,
                        "TypeName": "peashooter",
                        "Level": -1
                    },
                    {
                        "GridX": 2,
                        "GridY": 2,
                        "TypeName": "peashooter",
                        "Level": -1
                    }
                ]
            }
        },
        {
            "aliases": [
                "Wave1"
            ],
            "objclass": "SpawnZombiesJitteredWaveActionProps",
            "objdata": {
                "AdditionalPlantfood": 0,
                "Zombies": [
                    {
                        "Type": "RTID(tutorial@ZombieTypes)"
                    }
                ]
            }
        },
        {
            "aliases": [
                "Wave2"
            ],
            "objclass": "SpawnZombiesJitteredWaveActionProps",
            "objdata": {
                "AdditionalPlantfood": 1,
                "DynamicPlantfood": [
                    1,
                    1,
                    1,
                    1,
                    1,
                    0,
                    0
                ],
                "Zombies": [
                    {
                        "Row": "4",
                        "Type": "RTID(tutorial@ZombieTypes)"
                    }
                ]
            }
        },
        {
            "aliases": [
                "Wave3"
            ],
            "objclass": "SpawnZombiesJitteredWaveActionProps",
            "objdata": {
                "AdditionalPlantfood": 1,
                "Zombies": [
                    {
                        "Row": "3",
                        "Type": "RTID(tutorial_armor1@ZombieTypes)"
                    }
                ]
            }
        },
        {
            "aliases": [
                "Wave4"
            ],
            "objclass": "SpawnZombiesJitteredWaveActionProps",
            "objdata": {
                "Zombies": [
                    {
                        "Type": "RTID(tutorial_armor1@ZombieTypes)"
                    },
                    {
                        "Type": "RTID(tutorial@ZombieTypes)"
                    },
                    {
                        "Type": "RTID(tutorial@ZombieTypes)"
                    }
                ]
            }
        },
        {
            "aliases": [
                "Wave5"
            ],
            "objclass": "SpawnZombiesJitteredWaveActionProps",
            "objdata": {
                "AdditionalPlantfood": 1,
                "DynamicPlantfood": [
                    1,
                    1,
                    1,
                    1,
                    1,
                    0,
                    0
                ],
                "Zombies": [
                    {
                        "Type": "RTID(tutorial_armor1@ZombieTypes)"
                    },
                    {
                        "Type": "RTID(tutorial_armor1@ZombieTypes)"
                    }
                ]
            }
        },
        {
            "aliases": [
                "Wave6"
            ],
            "objclass": "SpawnZombiesJitteredWaveActionProps",
            "objdata": {
                "Zombies": [
                    {
                        "Row": "2",
                        "Type": "RTID(tutorial_armor1@ZombieTypes)"
                    },
                    {
                        "Row": "3",
                        "Type": "RTID(tutorial@ZombieTypes)"
                    },
                    {
                        "Row": "5",
                        "Type": "RTID(tutorial_armor1@ZombieTypes)"
                    }
                ]
            }
        },
        {
            "aliases": [
                "Wave7"
            ],
            "objclass": "SpawnZombiesJitteredWaveActionProps",
            "objdata": {
                "AdditionalPlantfood": 1,
                "Zombies": [
                    {
                        "Row": "3",
                        "Type": "RTID(tutorial_armor1@ZombieTypes)"
                    },
                    {
                        "Row": "4",
                        "Type": "RTID(tutorial_armor1@ZombieTypes)"
                    },
                    {
                        "Row": "5",
                        "Type": "RTID(tutorial@ZombieTypes)"
                    }
                ]
            }
        },
        {
            "aliases": [
                "Wave8"
            ],
            "objclass": "SpawnZombiesJitteredWaveActionProps",
            "objdata": {
                "AdditionalPlantfood": 1,
                "DynamicPlantfood": [
                    1,
                    1,
                    1,
                    1,
                    1,
                    0,
                    0
                ],
                "Zombies": [
                    {
                        "Type": "RTID(tutorial_armor1@ZombieTypes)"
                    },
                    {
                        "Type": "RTID(tutorial@ZombieTypes)"
                    },
                    {
                        "Type": "RTID(tutorial_armor1@ZombieTypes)"
                    },
                    {
                        "Type": "RTID(tutorial_armor1@ZombieTypes)"
                    }
                ]
            }
        },
        {
            "aliases": [
                "Wave9"
            ],
            "objclass": "SpawnZombiesJitteredWaveActionProps",
            "objdata": {
                "Zombies": [
                    {
                        "Type": "RTID(tutorial_armor1@ZombieTypes)"
                    },
                    {
                        "Type": "RTID(tutorial@ZombieTypes)"
                    },
                    {
                        "Type": "RTID(tutorial_armor1@ZombieTypes)"
                    },
                    {
                        "Type": "RTID(tutorial_armor1@ZombieTypes)"
                    },
                    {
                        "Type": "RTID(tutorial@ZombieTypes)"
                    }
                ]
            }
        },
        {
            "aliases": [
                "Wave10"
            ],
            "objclass": "SpawnZombiesJitteredWaveActionProps",
            "objdata": {
                "Zombies": [
                    {
                        "Type": "RTID(tutorial_armor1@ZombieTypes)"
                    },
                    {
                        "Type": "RTID(tutorial_armor1@ZombieTypes)"
                    },
                    {
                        "Type": "RTID(tutorial_armor1@ZombieTypes)"
                    }
                ]
            }
        },
        {
            "aliases": [
                "Wave11"
            ],
            "objclass": "SpawnZombiesJitteredWaveActionProps",
            "objdata": {
                "Zombies": [
                    {
                        "Type": "RTID(tutorial_armor1@ZombieTypes)"
                    },
                    {
                        "Type": "RTID(tutorial@ZombieTypes)"
                    },
                    {
                        "Type": "RTID(tutorial_armor1@ZombieTypes)"
                    }
                ]
            }
        },
        {
            "aliases": [
                "Wave12"
            ],
            "objclass": "SpawnZombiesJitteredWaveActionProps",
            "objdata": {
                "Zombies": [
                    {
                        "Row": "1",
                        "Type": "RTID(tutorial_armor1@ZombieTypes)"
                    },
                    {
                        "Row": "2",
                        "Type": "RTID(tutorial_armor1@ZombieTypes)"
                    },
                    {
                        "Row": "3",
                        "Type": "RTID(tutorial_armor1@ZombieTypes)"
                    },
                    {
                        "Row": "4",
                        "Type": "RTID(tutorial_armor1@ZombieTypes)"
                    },
                    {
                        "Row": "5",
                        "Type": "RTID(tutorial_armor1@ZombieTypes)"
                    },
                    {
                        "Row": "1",
                        "Type": "RTID(tutorial_armor1@ZombieTypes)"
                    },
                    {
                        "Row": "2",
                        "Type": "RTID(tutorial_armor1@ZombieTypes)"
                    },
                    {
                        "Row": "3",
                        "Type": "RTID(tutorial_armor1@ZombieTypes)"
                    },
                    {
                        "Row": "5",
                        "Type": "RTID(tutorial_armor1@ZombieTypes)"
                    }
                ]
            }
        }
    ],
    "version": 1
}