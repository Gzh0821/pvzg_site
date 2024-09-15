<template>
    <div class="app">
        <h1 v-if="i18nLanguage == 'zh'">PvZ2 Gardendless 植物图鉴</h1>
        <h1 v-else>PvZ2 Gardendless Plants Almanac</h1>
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
import { ref, computed, onMounted, inject } from 'vue';
import PlantCatalog from './views/PlantCatalog.vue';
import PlantDetail from './views/PlantDetail.vue';
import type { Plant, KeyMap } from './types';

import plantsJson from './plants.json';
import i18nJson from './i18n.json';

// 中文转换
const keyMap: KeyMap = i18nJson?.Almanac;
const familyNameMap = i18nJson?.PlantFamily;
const i18nLanguage = inject('i18nLanguage', 'zh');

// 定义响应式状态
const plants = ref<Plant[]>([]);
const selectedPlant = ref<Plant | null>(null);

// 选择植物
const selectPlant = (plant: Plant) => {
    selectedPlant.value = plant;
};
const formatOriginPlant = (originPlant: any) => {
    // 从原始数据中提取需要的字段并整理
    const res: Plant = {
        elements: {},
        special: {},
        enFamily: '',
        id: originPlant["ID"],
        name: originPlant["NAME"]?.[i18nLanguage],
        enName: originPlant["NAME"]?.["en"],
        image: originPlant.image,
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
    if (originPlant["ALMANAC"]?.["Special"]) {
        originPlant["ALMANAC"]["Special"].forEach((element) => {
            res.special[element["NAME"][i18nLanguage]] = element["DESCRIPTION"][i18nLanguage];
        });
    }
    console.log(res);
    return res;
};

plants.value = plantsJson["PLANTS"].map(formatOriginPlant);
selectPlant(plants.value[0]);
</script>

<style scoped>
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
    max-height: 70vh;
    overflow-y: auto;
    border-radius: 20px;
    border: 5px solid #432b1a;
    background-color: #ede5c4;
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
        padding: var(--navbar-height) 0;
    }


}
</style>