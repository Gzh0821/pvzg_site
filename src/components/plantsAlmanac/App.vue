<template>
    <div class="app">
        <div class="container">
            <div class="filter">
                <h1 v-if="i18nLanguage == 'zh'">PvZ2 Gardendless 植物图鉴</h1>
                <h1 v-else>PvZ2 Gardendless Plants Almanac</h1>
                <PlantFilter @filterPlants="filterPlants" :familyNameMap />
            </div>
        </div>
        <div class="container">
            <div class="sidebar">
                <PlantCatalog :plants="filteredPlants" @selectPlant="selectPlant" />
            </div>
            <div class="content">
                <PlantDetail v-if="selectedPlant" :keyMap="keyMap" :plant="selectedPlant" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, inject } from 'vue';
import PlantCatalog from './views/PlantCatalog.vue';
import PlantDetail from './views/PlantDetail.vue';
import PlantFilter from './views/PlantFilter.vue';
import type { Plant, KeyMap } from './types';

import plantsJson from './plants.json';
import i18nJson from './i18n.json';

// 中文转换
const keyMap: KeyMap = i18nJson?.Almanac;
const familyNameMap = i18nJson?.PlantFamily;
const i18nLanguage = inject('i18nLanguage', 'zh');

// 定义响应式状态
const plants = ref<Plant[]>([]);
const filteredPlants = ref<Plant[]>([]);
const selectedPlant = ref<Plant | null>(null);

// 植物展示顺序
const plantsOrder = plantsJson["SEEDCHOOSERDEFAULTORDER"].concat(plantsJson["ALMANACHIDDENORDER"]);
// 选择植物
const selectPlant = (plant: Plant) => {
    selectedPlant.value = plant;
};
// 边框样式
const frameMap = {
    'water': 'beach',
    'market': 'prenium',
};
const formatOriginPlant = (originPlant: any) => {
    // 从原始数据中提取需要的字段并整理
    const res: Plant = {
        elements: {},
        special: [],
        enFamily: '',
        id: originPlant["ID"],
        plantType: originPlant["PLANTTYPE"],
        codename: originPlant["CODENAME"],
        name: originPlant["NAME"]?.[i18nLanguage],
        enName: originPlant["NAME"]?.["en"],
        frameWorld: frameMap[originPlant["OBTAINWORLD"]] || originPlant["OBTAINWORLD"],
        description: originPlant["ALMANAC"]?.["Introduction"]?.[i18nLanguage],
        chat: originPlant["ALMANAC"]?.["Chat"]?.[i18nLanguage]
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
const filterPlants = (filter: { name: string; family: string }) => {
    const { name, family } = filter;

    filteredPlants.value = plants.value.filter(plant => {
        // 根据名称筛选
        const matchName = plant.name.toLowerCase().includes(name.toLowerCase()) ||
            plant.enName.toLowerCase().includes(name.toLowerCase()) ||
            plant.plantType.toLowerCase().includes(name.toLowerCase());

        // 根据属性筛选（这里可以自定义属性逻辑）
        const matchAttribute = family == '' || plant.enFamily == family ||
            (family == 'None' && plant.enFamily == '');

        return matchName && matchAttribute;
    });
};


// 瓷砖萝卜有五种，需要特殊处理
let powerplantIndex = plantsOrder.indexOf("powerplant");
if (powerplantIndex !== -1) {
    // 用 "powerplant_alpha" 到 "powerplant_epsilon" 替换该位置及后续四项
    plantsOrder.splice(powerplantIndex, 1, "powerplant_alpha", "powerplant_beta", "powerplant_gamma", "powerplant_delta", "powerplant_epsilon");
};

plants.value = plantsOrder.map((codename) => {
    return formatOriginPlant(plantsJson["PLANTS"].find((item) => item["CODENAME"] == codename));
});
filteredPlants.value = plants.value;
selectPlant(filteredPlants.value[0]);

</script>

<style scoped>
.filter h1 {
    font-family: 'pvzgFont', 'pvzgeFontEN', "Noto Sans SC";
    font-size: xx-large;
    color: #432b1a;
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

.sidebar {
    min-width: 20%;
    background-color: #f8f9fa;
    max-height: 65vh;
    min-height: 10rem;
    overflow-y: auto;
    border-radius: 20px;
    border: 5px solid #432b1a;
    background-color: #ede5c4;
}

.filter {
    min-width: 100%;
    background-color: #f8f9fa;
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