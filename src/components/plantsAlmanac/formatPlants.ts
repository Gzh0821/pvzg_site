import type {Plant} from './types';

import plantAlmanacJson from './jsons/PlantAlmanac.json';
import plantFeaturesJson from './jsons/PlantFeatures.json';
import plantPropsJson from './jsons/PlantProps.json';

import i18nJson from './i18n.json';

const frameMap = {
    'water': 'beach',
    'market': 'prenium',
};

const familyNameMap = i18nJson?.PlantFamily;

const plantProps = plantPropsJson.objects.reduce((acc, item) => {
    const key = item.aliases[0];
    const value = item.objdata;

    if (key != null) {
        acc[key] = value;
    }
    return acc;
}, {});

const plantAlmanac = plantAlmanacJson.objects.reduce((acc, item) => {
    const key = item.aliases[0];
    const value = item.objdata;

    if (key != null) {
        acc[key] = value;
    }
    return acc;
}, {});

export const plantsOrder = plantFeaturesJson.SEEDCHOOSERDEFAULTORDER;

export function getPlantMap(i18nLanguage: string) {
    return plantFeaturesJson["PLANTS"].reduce((acc, plant) => {
        acc[plant["CODENAME"]] = formatOriginPlant(plant, i18nLanguage);
        return acc;
    }, {});
}

export function getPlantIdMap(i18nLanguage: string) {
    return plantFeaturesJson["PLANTS"].reduce((acc, plant) => {
        acc[plant["ID"]] = formatOriginPlant(plant, i18nLanguage);
        return acc;
    }, {});
}

export function formatOriginPlant(originPlant: any, i18nLanguage: string): Plant {
    const codename = originPlant["CODENAME"];
    const propsName = originPlant["PROPS"].match(/RTID\((.*?)@PlantProps\)/)?.[1];
    const almanacName = originPlant["ALMANAC"].match(/RTID\((.*?)@PlantAlmanac\)/)?.[1];

    const propsObjdata = plantProps[propsName] || plantProps[codename] || {};
    const almanacObjdata = plantAlmanac[almanacName] || plantAlmanac[codename] || {};

    const upperPropsObjdata = {};
    Object.keys(propsObjdata).forEach((key) => {
        upperPropsObjdata[key.toUpperCase()] = propsObjdata[key];
    });
    // 从原始数据中提取需要的字段并整理
    const res: Plant = {
        elements: {},
        special: [],
        enFamily: familyNameMap[upperPropsObjdata["FAMILY"]]['en'],
        id: originPlant["ID"],
        plantType: originPlant["_CARDSPRITENAME"],
        codename: codename,
        name: originPlant["NAME"]?.[i18nLanguage],
        enName: originPlant["NAME"]?.["en"],
        frameWorld: frameMap[originPlant["OBTAINWORLD"]] || originPlant["OBTAINWORLD"],
        obtainWorld: originPlant["OBTAINWORLD"],
        description: almanacObjdata?.["Introduction"]?.[i18nLanguage],
        chat: almanacObjdata?.["Chat"]?.[i18nLanguage],
        subPlants: originPlant["SubPlantList"],
        objdata: propsObjdata,
    };
    if (almanacObjdata?.["Elements"]) {
        almanacObjdata["Elements"].forEach((element) => {
            // 找到对应的值
            const {TYPE, SORT, VALUE} = element;

            let value;
            if (SORT && SORT[i18nLanguage]) {
                value = SORT[i18nLanguage]; // 有 SORT 时，取 SORT
            } else if (VALUE) {
                value = VALUE; // 没有 SORT 时，取 VALUE
            } else if (TYPE == "RECHARGE") {
                value = upperPropsObjdata["COOLDOWN"]
            } else if (TYPE == "FAMILY") {
                value = familyNameMap[upperPropsObjdata[TYPE]][i18nLanguage];
            } else {
                value = upperPropsObjdata[TYPE]; // 只有 TYPE 时，从原始数据中查找
            }
            res.elements[TYPE] = value;
        });
    }
    if (almanacObjdata?.["Special"]) {
        res.special = almanacObjdata["Special"]
    }
    return res;
}

