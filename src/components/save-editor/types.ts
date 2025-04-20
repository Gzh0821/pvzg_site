export interface ArchiveData {
    name?: string;
    worldkey?: number;
    gem?: number;
    coin?: number;
    plantProps?: { [key: number]: PlantData };
    worldProps?: { currentWM: number, worldChooserPos: number, [key: number]: WorldData };
    version?: string;
    [key: string]: any;
}

interface OtherData {
    [key: string]: any;
}

interface PlantMap {
    [key: number]: {
        codename: string;
        name: string;
    };
}

interface Pagination {
    pageSize: number;
    showSizeChanger: boolean;
}

interface I18nJson {
    [key: string]: {
        [key: string]: string;
    };
}

interface PlantData {
    progress: number,
    tutorialLevel: number
    costume: number,
    costumes: number[],
}

interface WorldData {
    unlocked: boolean,
    wmx: number,
    [key: string]: any;
}