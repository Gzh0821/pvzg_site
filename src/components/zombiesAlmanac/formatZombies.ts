import type { Zombie } from './types';
import zombieAlmanacJson from './ZombieAlmanac.json';
import zombieFeaturesJson from './ZombieFeatures.json';
import zombiePropsJson from './ZombieProps.json';
import i18nJson from './i18n.json';

/**
 * 世界框架映射，将特定世界ID转换为显示名称
 */
const FRAME_MAP: Record<string, string> = {
    'water': 'beach',
    'market': 'prenium',
};

/**
 * 僵尸家族名称映射
 */
const familyNameMap = i18nJson?.PlantFamily;

/**
 * 处理僵尸属性数据，将JSON对象转换为按别名索引的映射
 * @returns {Record<string, any>} 按别名索引的僵尸属性映射
 */
const zombieProps: Record<string, any> = zombiePropsJson.objects.reduce((acc: Record<string, any>, item) => {
    const key = item.aliases[0];
    const value = item.objdata;

    if (key != null) {
        acc[key] = value;
    }
    return acc;
}, {});

/**
 * 处理僵尸年鉴数据，将JSON对象转换为按别名索引的映射
 * @returns {Record<string, any>} 按别名索引的僵尸年鉴数据映射
 */
const zombieAlmanac: Record<string, any> = zombieAlmanacJson.objects.reduce((acc: Record<string, any>, item) => {
    const key = item.aliases[0];
    const value = item.objdata;

    if (key != null) {
        acc[key] = value;
    }
    return acc;
}, {});

/**
 * 僵尸的显示顺序
 */
export const zombiesOrder = zombieFeaturesJson.ALMANAC;

/**
 * 获取僵尸数据映射
 * @param {string} i18nLanguage - 国际化语言代码
 * @returns {Record<string, Zombie>} 按代号索引的僵尸数据映射
 */
export function getZombieMap(i18nLanguage: string): Record<string, Zombie> {
    return zombieFeaturesJson.ZOMBIES.reduce((acc: Record<string, Zombie>, zombie: any) => {
        acc[zombie.CODENAME] = formatOriginZombie(zombie, i18nLanguage);
        return acc;
    }, {});
}

/**
 * 格式化原始僵尸数据为标准格式
 * @param {any} originZombie - 原始僵尸数据
 * @param {string} i18nLanguage - 国际化语言代码
 * @returns {Zombie} 格式化后的僵尸数据
 */
export function formatOriginZombie(originZombie: any, i18nLanguage: string): Zombie {
    // 提取基础信息
    const codename = originZombie.CODENAME;

    // 从引用ID字符串中提取属性名和年鉴名
    const propsName = originZombie.PROPS.match(/RTID\((.*?)@ZombieProps\)/)?.[1];
    const almanacName = originZombie.ALMANAC.match(/RTID\((.*?)@ZombieAlmanac\)/)?.[1];

    // 获取属性和年鉴数据，如果找不到特定名称的数据，则尝试使用代号作为备用
    const propsObjdata = zombieProps[propsName] || zombieProps[codename] || {};
    const almanacObjdata = zombieAlmanac[almanacName] || zombieAlmanac[codename] || {};

    // 创建大写键名的属性映射，用于后续查询
    const upperPropsObjdata: Record<string, any> = {};
    Object.keys(propsObjdata).forEach((key) => {
        upperPropsObjdata[key.toUpperCase()] = propsObjdata[key];
    });

    // 从原始数据中提取需要的字段并整理成标准结构
    const zombie: Zombie = {
        elements: {},
        special: [],
        enFamily: '',
        // id: originZombie.ID,  // 当前未使用
        zombieType: originZombie._CARDSPRITENAME,
        codename,
        name: originZombie.NAME?.[i18nLanguage],
        enName: originZombie.NAME?.en,
        frameWorld: FRAME_MAP[originZombie.OBTAINWORLD] || originZombie.OBTAINWORLD,
        obtainWorld: originZombie.OBTAINWORLD,
        description: almanacObjdata?.Introduction?.[i18nLanguage],
        chat: almanacObjdata?.Chat?.[i18nLanguage],
        subZombies: originZombie.SubZombieList,
        objdata: propsObjdata,
    };

    // 处理元素属性
    if (almanacObjdata?.Elements) {
        almanacObjdata.Elements.forEach((element: any) => {
            const { TYPE, SORT, VALUE } = element;
            let value;

            // 按优先级顺序确定值
            if (SORT && SORT[i18nLanguage]) {
                value = SORT[i18nLanguage]; // 首选：特定语言的排序值
            } else if (VALUE) {
                value = VALUE; // 其次：固定值
            } else if (TYPE === "RECHARGE") {
                value = upperPropsObjdata.COOLDOWN; // 特殊处理：充能时间
            } else if (TYPE === "FAMILY") {
                // 特殊处理：家族名称，需同时设置本地化和英文名称
                value = familyNameMap[upperPropsObjdata[TYPE]]?.[i18nLanguage];
                zombie.enFamily = familyNameMap[upperPropsObjdata[TYPE]]?.en;
            } else {
                value = upperPropsObjdata[TYPE]; // 最后：从属性中查找
            }

            // 设置元素值
            zombie.elements[TYPE] = value;
        });
    }

    // 处理特殊属性
    if (almanacObjdata?.Special) {
        zombie.special = almanacObjdata.Special;
    }

    return zombie;
}

