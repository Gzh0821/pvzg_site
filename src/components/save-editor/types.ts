export interface ArchiveData {
    name?: string;
    worldkey?: number;
    gem?: number;
    coin?: number;
    sprout?: number;
    forceLevel?: string;
    time?: number;
    date?: { [key: string]: any };
    difficulty?: number;
    plantProps?: { [key: string]: PlantData };
    zombieProps?: { [key: string]: any };
    player_trophies?: { [key: string]: any };
    levelProps?: { [key: string]: any };
    worldProgress?: any[];
    cardDecks?: any[];
    memoryPlantChoose?: any[];
    zengarden?: { [key: string]: any };
    arcade_plant_decoding?: ArcadePlantDecodingData;
    yeti_spawned_today?: boolean;
    worldProps?: { [key: string]: any };
    player_upgrades?: { [key: string]: UpgradeData };
    tutorial?: { [key: string]: boolean };
    features?: { [key: string]: boolean };
    version?: string;
    [key: string]: any;
}

export interface ArcadePlantDecodingData {
    played_today: boolean;
    gem_today: number;
    max_base_count: number;
    max_code_count: number;
    [key: string]: any;
}

export interface PlantData {
    progress: number;
    tutorialLevel: number;
    costume: number;
    costumes: number[];
    boost?: number;
    medal?: boolean;
    [key: string]: any;
}

export interface WorldData {
    unlocked: boolean;
    wmx: number;
    viewed?: boolean;
    endlessProps?: EndlessProps;
    endlessMiniGameProps?: { level: number };
    [key: string]: any;
}

export interface EndlessProps {
    level: number;
    obtainedPlants: string[];
    plantfood: number;
    mower: boolean[];
    initialPlants: string[];
    plantChosen: boolean;
    plantsToChoose: null | any;
    [key: string]: any;
}

export interface UpgradeData {
    progress: number;
    enabled: boolean;
}
