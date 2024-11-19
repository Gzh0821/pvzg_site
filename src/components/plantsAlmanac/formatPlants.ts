import type { Plant, KeyMap } from './types';
import { ref, computed, onMounted, inject } from 'vue';
import plantsJson from './plants.json';
import i18nJson from './i18n.json';

const frameMap = {
    'water': 'beach',
    'market': 'prenium',
};

const keyMap: KeyMap = i18nJson?.Almanac;
const familyNameMap = i18nJson?.PlantFamily;

export const plantsOrder = plantsJson["SEEDCHOOSERDEFAULTORDER"];
export function getPlantMap(i18nLanguage: string) {
    return plantsJson["PLANTS"].reduce((acc, plant) => {
        acc[plant["CODENAME"]] = formatOriginPlant(plant, i18nLanguage);
        return acc;
    }, {});
}

export function formatOriginPlant(originPlant: any, i18nLanguage: string): Plant {
    // 从原始数据中提取需要的字段并整理
    const res: Plant = {
        elements: {},
        special: [],
        enFamily: '',
        id: originPlant["ID"],
        plantType: originPlant["_CARDSPRITENAME"],
        codename: originPlant["CODENAME"],
        name: originPlant["NAME"]?.[i18nLanguage],
        enName: originPlant["NAME"]?.["en"],
        frameWorld: frameMap[originPlant["OBTAINWORLD"]] || originPlant["OBTAINWORLD"],
        description: originPlant["ALMANAC"]?.["Introduction"]?.[i18nLanguage],
        chat: originPlant["ALMANAC"]?.["Chat"]?.[i18nLanguage],
        subPlants: originPlant["SubPlantList"]
    };
    if (originPlant?.["ALMANAC"]?.["Elements"]) {
        originPlant["ALMANAC"]["Elements"].forEach((element) => {
            // 找到对应的值
            const { TYPE, SORT, VALUE } = element;

            let value;
            if (SORT && SORT[i18nLanguage]) {
                value = SORT[i18nLanguage]; // 有 SORT 时，取 SORT
            } else if (VALUE) {
                value = VALUE; // 没有 SORT 时，取 VALUE
            } else if (TYPE == "RECHARGE") {
                value = originPlant["COOLDOWN"]
            } else if (TYPE == "FAMILY") {
                value = familyNameMap[originPlant[TYPE]][i18nLanguage];
                res.enFamily = familyNameMap[originPlant[TYPE]]['en'];
            }
            else {
                value = originPlant[TYPE]; // 只有 TYPE 时，从原始数据中查找
            }
            res.elements[TYPE] = value;
        });
    }
    if (originPlant?.["ALMANAC"]?.["Special"]) {
        res.special = originPlant["ALMANAC"]["Special"]
    }
    return res;
};

