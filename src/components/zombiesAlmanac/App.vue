<template>
    <div class="app">
        <div class="container">
            <div class="filter">
                <h1 v-if="i18nLanguage == 'zh'">PvZ2 Gardendless 僵尸图鉴</h1>
                <h1 v-else>PvZ2 Gardendless Zombies Almanac</h1>
                <ZombieFilter @filterZombies="filterZombies" :familyNameMap />
            </div>
        </div>
        <div class="container">
            <div class="sidebar">
                <ZombieCatalog :zombies="filteredZombies" @selectZombie="selectZombie" />
            </div>
            <div class="content">
                <ZombieDetail v-if="selectedZombie" :keyMap="keyMap" :zombie="selectedZombie" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, inject } from 'vue';
import ZombieCatalog from './views/ZombieCatalog.vue';
import ZombieDetail from './views/ZombieDetail.vue';
import ZombieFilter from './views/ZombieFilter.vue';
import type { Zombie, KeyMap } from './types';

import zombiesJson from './zombies.json';
import i18nJson from './i18n.json';

// 中文转换
const keyMap: KeyMap = i18nJson?.Almanac;
const familyNameMap = i18nJson?.PlantFamily;
const i18nLanguage = inject('i18nLanguage', 'zh');

// 定义响应式状态
const zombies = ref<Zombie[]>([]);
const filteredZombies = ref<Zombie[]>([]);
const selectedZombie = ref<Zombie | null>(null);

// 植物展示顺序
// const zombiesOrder = zombiesJson?.["SEEDCHOOSERDEFAULTORDER"].concat(zombiesJson?.["ALMANACHIDDENORDER"]);
// 选择植物
const selectZombie = (zombie: Zombie) => {
    selectedZombie.value = zombie;
};
// 边框样式
const frameMap = {
    'water': 'beach',
    'market': 'prenium',
};
const formatOriginZombie = (originZombie: any) => {
    // 从原始数据中提取需要的字段并整理
    const res: Zombie = {
        elements: {},
        special: [],
        enFamily: '',
        id: originZombie["ID"],
        zombieType: originZombie["_CARDSPRITENAME"],
        codename: originZombie["CODENAME"],
        // zombie没有i18n，暂时只取name值
        // name: originPlant["NAME"]?.[i18nLanguage],
        // enName: originPlant["NAME"]?.["en"],
        name: originZombie["NAME"],
        enName: originZombie["NAME"],
        image: originZombie.image,
        frameWorld: frameMap[originZombie["OBTAINWORLD"]] || originZombie["OBTAINWORLD"],
        description: originZombie["ALMANAC"]?.["Introduction"]?.[i18nLanguage],
        chat: originZombie["ALMANAC"]?.["Chat"]?.[i18nLanguage]
    };
    if (originZombie?.["ALMANAC"]?.["Elements"]) {
        originZombie["ALMANAC"]["Elements"].forEach((element) => {
            // 找到对应的值
            const { TYPE, SORT, VALUE } = element;

            let value;
            if (SORT && SORT[i18nLanguage]) {
                value = SORT[i18nLanguage]; // 有 SORT 时，取 SORT
            } else if (VALUE) {
                value = VALUE; // 没有 SORT 时，取 VALUE
            } else if (TYPE == "RECHARGE") {
                value = originZombie["COOLDOWN"]
            } else if (TYPE == "FAMILY") {
                value = familyNameMap[originZombie[TYPE]][i18nLanguage];
                res.enFamily = familyNameMap[originZombie[TYPE]]['en'];
            }
            else {
                value = originZombie[TYPE]; // 只有 TYPE 时，从原始数据中查找
            }
            if (res.elements)
                res.elements[TYPE] = value;
        });
    }
    if (originZombie?.["ALMANAC"]?.["Special"]) {
        res.special = originZombie["ALMANAC"]["Special"]

    }
    return res;
};
const filterZombies = (filter: { name: string }) => {
    const { name } = filter;

    filteredZombies.value = zombies.value.filter(singleZombie => {
        // 根据名称筛选
        const matchName = singleZombie.name.toLowerCase().includes(name.toLowerCase()) ||
            singleZombie.enName.toLowerCase().includes(name.toLowerCase()) ||
            singleZombie.codename.toLowerCase().includes(name.toLowerCase());

        // 根据属性筛选（这里可以自定义属性逻辑）
        // const matchAttribute = family == '' || singleZombie.enFamily == family ||
        //     (family == 'None' && singleZombie.enFamily == '');

        // return matchName && matchAttribute;
        return matchName;
    });
};

// 暂时没有使用zombiesOrder
// zombies.value = zombiesOrder.map((codename) => {
//     return zombiesJson["ZOMBIES"].find((item) => item["CODENAME"] == codename);
// }).map(formatOriginZombie);

zombies.value = zombiesJson["ZOMBIES"].map(formatOriginZombie);
filteredZombies.value = zombies.value;
selectZombie(filteredZombies.value[0]);

</script>

<style scoped>
.filter h1 {
    font-family: 'pvzgFont', 'pvzgeFontEN', "Noto Sans SC";
    font-size: xx-large;
    color: #432b1a;
}

[data-theme="dark"] .filter h1 {

    color: #deb991;
}

.app {
    text-align: center;
    justify-content: center;
    align-items: center;
}

.container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
}

[data-theme="dark"] .sidebar {
    border: 5px solid #deb991;
    background-color: #383011;
}

.sidebar {
    min-width: 20%;
    max-height: 65vh;
    min-height: 10rem;
    overflow-y: auto;
    border-radius: 20px;
    border: 5px solid #432b1a;
    background-color: #ede5c4;
}

[data-theme="dark"] .filter {
    border: 5px solid #deb991;
    background-color: #383011;
}

.filter {
    min-width: 100%;
    overflow-y: auto;
    border-radius: 20px;
    border: 5px solid #432b1a;
    background-color: #ede5c4;
    margin: 0 0 5%;
    padding: 10px 0;
}

.content {
    flex-basis: 80%;
    /* 右侧固定占80% */
    padding-left: 20px;
}

@media (max-width: 768px) {
    .container {
        flex-direction: column;
        /* 竖屏时，变成垂直排列 */
    }

    .sidebar {
        min-height: 0;
        flex-basis: auto;
        width: 100%;
        height: auto;
        overflow-x: auto;
        /* 横向滚动 */
        overflow-y: hidden;
        /* 关闭竖向滚动 */
        display: flex;
        flex-wrap: nowrap;
        padding: 10px 0;
    }

    .content {
        flex-basis: auto;
        width: 100%;
        padding: 5% 0;
    }
}
</style>