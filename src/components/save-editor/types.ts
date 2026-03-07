export interface ArchiveData {
    name?: string;
    worldkey?: number;
    gem?: number;
    coin?: number;
    sprout?: number;
    plantProps?: { [key: string]: PlantData };
    worldProps?: { [key: string]: any };
    upgradeProps?: { [key: string]: UpgradeData };
    tutorial?: { [key: string]: boolean };
    features?: { [key: string]: boolean };
    version?: string;
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
