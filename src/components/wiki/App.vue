<template>
    <div class="app">
        <h1>PvZ2 Gardendless 植物图鉴</h1>
        <div class="container">
            <div class="sidebar">
                <PlantCatalog :plants="plants" @selectPlant="selectPlant" />
            </div>
            <div class="content">
                <PlantDetail v-if="selectedPlant" :keyMap="keyMap" :plant="selectedPlant" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import PlantCatalog from './views/PlantCatalog.vue';
import PlantDetail from './views/PlantDetail.vue';
import type { Plant, KeyMap } from './types';
import plantsJson from './plants.json';
import i18nJson from './i18n.json';

const keyMap: KeyMap = i18nJson?.Almanac;
// 中文转换
// 定义响应式状态
const plants = ref<Plant[]>([]);
const selectedPlant = ref<Plant | null>(null);

// 从 JSON 文件加载植物数据
// onMounted(async () => {
//   const response = await fetch('/src/data/plants.json');
//   plants.value = await response.json();
// });

plants.value = plantsJson["PLANTS"].map((plant: any) => {
    // 从原始数据中提取需要的字段并整理
    const res: Plant = {
        elements: {},
        id: plant["ID"],
        name: plant["NAME"]?.["zh"],
        image: plant.image,
        description: plant["ALMANAC"]?.["Introduction"]?.["zh"],
    };
    if (plant?.["ALMANAC"]?.["Elements"]) {
        plant["ALMANAC"]["Elements"].forEach((element: any) => {
            // 找到对应的值
            const { TYPE, SORT, VALUE } = element;

            let value;
            if (SORT && SORT.zh) {
                value = SORT.zh; // 有 SORT.zh 时，取 SORT.zh
            } else if (VALUE) {
                value = VALUE; // 没有 SORT.zh 时，取 VALUE
            } else if (TYPE == "RECHARGE") {
                value = plant["COOLDOWN"]
            } else {
                value = plant[TYPE]; // 只有 TYPE 时，从原始数据中查找
            }

            res.elements[TYPE] = value;
        });
    }
    console.log(res);
    return res;
});
selectedPlant.value = plants.value[0];
// 选择植物
const selectPlant = (plant: Plant) => {
    selectedPlant.value = plant;
};
</script>

<style scoped>
.app {
    font-family: 'Arial', sans-serif;
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
    max-height: 70vh;
    overflow-y: auto;
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
        padding: var(--navbar-height) 10px;
    }


}
</style>