export interface ArchiveData {
    worldkey?: number;
    gem?: number;
    coin?: number;
    plantProps?: {} | { [key: string]: PlantData };
    worldProgress?: Array<{
        worldID: number;
        unlocked: boolean;
    }>;
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
}
