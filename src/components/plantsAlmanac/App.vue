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
                <PlantCatalog :plants="filteredPlants" @selectPlant="selectPlant" :plantMap />
            </div>
            <div class="content">
                <PlantDetail v-if="selectedPlant" :keyMap :plant="selectedPlant" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, inject } from 'vue';
import PlantCatalog from './views/PlantCatalog.vue';
import PlantDetail from './views/PlantDetail.vue';
import PlantFilter from './views/PlantFilter.vue';
import type { Plant, KeyMap } from './types';

import { getPlantMap, plantsOrder } from './formatPlants';
import i18nJson from './i18n.json';

// 中文转换
const keyMap: KeyMap = i18nJson?.Almanac;
const familyNameMap = i18nJson?.PlantFamily;
const i18nLanguage = inject('i18nLanguage', 'zh');

// 定义响应式状态
const plants = ref<Plant[]>([]);
const plantMap = getPlantMap(i18nLanguage);

const filteredPlants = ref<Plant[]>([]);
const selectedPlant = ref<Plant | null>(null);
// 选择植物
const selectPlant = (plant: Plant) => {
    selectedPlant.value = plant;
};

const filterPlants = (filter: { name: string; family: string }) => {
    const { name, family } = filter;

    filteredPlants.value = plants.value.filter(plant => {
        // 根据名称筛选
        const matchName = plant.name.toLowerCase().includes(name.toLowerCase()) ||
            plant.enName.toLowerCase().includes(name.toLowerCase()) ||
            plant.codename.toLowerCase().includes(name.toLowerCase()) ||
            plant.id.toString() == name;

        // 根据属性筛选
        const matchAttribute = family == '' || plant.enFamily == family ||
            (family == 'None' && plant.enFamily == '');

        return matchName && matchAttribute;
    });
};


plants.value = plantsOrder.map((codename) => {
    return plantMap[codename];
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
    background-color: #f8f9fa;
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