<template>
    <ul>
        <li v-for="plant in plants" :key="plant.id" @click="selectPlant(plant)">

            <template v-if="plant.subPlants">
                <a-popover arrow-point-at-center trigger="hover" :open="visible[plant.codename]"
                           @open-change="visible[plant.codename] = $event" :overlayInnerStyle="{
                        border: $isDarkMode ? '3px solid #deb991' : '3px solid #432b1a',
                        backgroundColor: $isDarkMode ? '#383011' : '#ede5c4',
                        textAlign: 'center'
                    }">
                    <template #content>
                        <a-row :gutter="[16, { xs: 8, sm: 16, md: 24, lg: 32 }]" justify="center">
                            <template
                                v-for="subPlant in plant.subPlants.map((codename) => { return plantMap[codename] })"
                                :key="subPlant.id">
                                <a-col @click="selectPlant(subPlant, plant)">
                                    <img :src="'/assets/image/plants/plants_' + subPlant.codename + '_c.webp'"
                                         :alt="subPlant.name">
                                    <p>{{ subPlant.name }}</p>
                                </a-col>
                            </template>
                        </a-row>
                    </template>
                    <img :src="'/assets/image/plants/plants_' + plant.codename + '_c.webp'" :alt="plant.name">
                </a-popover>
                <p>{{ plant.name }}</p>
            </template>
            <template v-else>
                <img :src="'/assets/image/plants/plants_' + plant.codename + '_c.webp'" :alt="plant.name">
                <p>{{ plant.name }}</p>
            </template>
        </li>
    </ul>
    <!-- </div> -->
</template>

<script lang="ts" setup>
import type {Plant} from '../types';
import {ref} from 'vue';
// 定义 props 类型
const props = defineProps<{ plants: Plant[], plantMap: { [key: string]: Plant } }>();

// 定义 emits
const emits = defineEmits(['selectPlant']);
const visible = ref({});
// 选择植物事件
const selectPlant = (plant: Plant, parPlant: Plant | undefined = undefined) => {
    if (parPlant)
        visible.value[parPlant.codename] = false;
    emits('selectPlant', plant);
};

</script>

<style scoped>
/* .plant-image-frame {
    margin: 0 10%;
    position: relative;
    height: 70px;
} 

.plant-image-frame img.plant-img {
    width: 100%;
    object-fit: contain;
    border: 3px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px); 
    box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 12px; 
    border-radius: 5px;
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 2;
}

.plant-image-frame img.frame-img {
    width: 100%;
    object-fit: contain;
    border: 3px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
    box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 12px;
    border-radius: 5px;
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 1;
}*/
[data-theme="dark"] p {
    color: #deb991;
}

p {
    line-height: 1em;
    font-family: 'pvzgFont', 'pvzgeFontEN', "Noto Sans SC", sans-serif;
    font-size: large;
    color: #432b1a;
}

ul {
    list-style: none;
    padding: 0;
    justify-content: center;
}

li {
    cursor: pointer;
    /* margin: 10px 0; */
    text-align: center;
}

img {
    width: 120px;
    object-fit: contain;
}

@media (max-width: 768px) {

    .plant-image-frame {
        position: relative;
        min-width: 120px;
        margin: 10px 0 0;
        height: 70px;
    }

    /* 调整植物条目的横向排列方式 */
    ul {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        list-style: none;
        padding: 0 10px;
        margin: 0;
    }

    li {
        flex: 0 0 auto;
        margin-right: 15px;
    }

}
</style>