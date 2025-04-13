import type { Zombie } from './types';
import zombieAlmanacJson from './ZombieAlmanac.json';
import zombieFeaturesJson from './ZombieFeatures.json';
import zombiePropsJson from './ZombieProps.json';

import i18nJson from './i18n.json';

const frameMap = {
    'water': 'beach',
    'market': 'prenium',
};

const familyNameMap = i18nJson?.PlantFamily;

const zombieProps = zombiePropsJson.objects.reduce((acc, item) => {
    const key = item.aliases[0];
    const value = item.objdata;

    if (key != null) {
        acc[key] = value;
    }
    return acc;
}, {});

const zombieAlmanac = zombieAlmanacJson.objects.reduce((acc, item) => {
    const key = item.aliases[0];
    const value = item.objdata;

    if (key != null) {
        acc[key] = value;
    }
    return acc;
}, {});

export const zombiesOrder = zombieFeaturesJson.ALMANAC;

export function getZombieMap(i18nLanguage: string) {
    return zombieFeaturesJson["ZOMBIES"].reduce((acc, zombie) => {
        acc[zombie["CODENAME"]] = formatOriginZombie(zombie, i18nLanguage);
        return acc;
    }, {});
}

export function formatOriginZombie(originZombie: any, i18nLanguage: string): Zombie {
    const codename = originZombie["CODENAME"];
    const propsObjdata = zombieProps[codename] || {};
    const almanacObjdata = zombieAlmanac[codename] || {};
    const upperPropsObjdata = {};
    Object.keys(propsObjdata).forEach((key) => {
        upperPropsObjdata[key.toUpperCase()] = propsObjdata[key];
    });
    // 从原始数据中提取需要的字段并整理
    const res: Zombie = {
        elements: {},
        special: [],
        enFamily: '',
        // id: originZombie["ID"],
        zombieType: originZombie["_CARDSPRITENAME"],
        codename: codename,
        name: originZombie["NAME"]?.[i18nLanguage],
        enName: originZombie["NAME"]?.["en"],
        frameWorld: frameMap[originZombie["OBTAINWORLD"]] || originZombie["OBTAINWORLD"],
        obtainWorld: originZombie["OBTAINWORLD"],
        description: almanacObjdata?.["Introduction"]?.[i18nLanguage],
        chat: almanacObjdata?.["Chat"]?.[i18nLanguage],
        subZombies: originZombie["SubZombieList"],
        objdata: propsObjdata,
    };
    if (almanacObjdata?.["Elements"]) {
        almanacObjdata["Elements"].forEach((element) => {
            // 找到对应的值
            const { TYPE, SORT, VALUE } = element;

            let value;
            if (SORT && SORT[i18nLanguage]) {
                value = SORT[i18nLanguage]; // 有 SORT 时，取 SORT
            } else if (VALUE) {
                value = VALUE; // 没有 SORT 时，取 VALUE
            } else if (TYPE == "RECHARGE") {
                value = upperPropsObjdata["COOLDOWN"]
            } else if (TYPE == "FAMILY") {
                value = familyNameMap[upperPropsObjdata[TYPE]][i18nLanguage];
                res.enFamily = familyNameMap[upperPropsObjdata[TYPE]]['en'];
            }
            else {
                value = upperPropsObjdata[TYPE]; // 只有 TYPE 时，从原始数据中查找
            }
            res.elements[TYPE] = value;
        });
    }
    if (almanacObjdata?.["Special"]) {
        res.special = almanacObjdata["Special"]
    }
    return res;
};

