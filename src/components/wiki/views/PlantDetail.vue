<template>
    <div class="plant-detail" v-if="plant">
        <!-- <img :src="plant.image" :alt="plant.name" />
    <p>{{ plant.description }}</p> -->
        <div class="details-container">
            <div class="plant-image">
                <img :src="'/assets/wikiplants/' + plant.enName.replace(/\s+/g, '_').replace(/[\']/g, '') + '2.webp'"
                    :alt="plant.name">
                <p class="plant-title">{{ plant.name }}</p>
                <img v-if="plant.enFamily" :src="'/assets/wikicon/' + plant.enFamily + '_familyicon.webp'"
                    :alt="plant.enFamily" class="family-img">
            </div>
            <div class="plant-stats">
                <table>
                    <tbody>
                        <tr v-for="(value, key) in plant.elements" :key="key">

                            <td class="ability"><img :src="keyMap[key].icon" /> {{ keyMap[key][i18nLanguage] }}</td>
                            <td class="value">{{ value }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
        <div class="details-container">
            <div class="plant-introduction">
                <p class="description">{{ plant.description }}</p><br>
                <p v-for="(value, key) in plant.special" :key="key" class="description">
                    {{ key }}: <span class="descriptionKey">{{ value }}</span>
                </p><br>
                <p class="description">{{ plant.chat }}</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { inject } from 'vue';
import type { Plant, KeyMap } from '../types';


// 接收 props
const props = defineProps<{ plant: Plant, keyMap: KeyMap }>();
const i18nLanguage = inject('i18nLanguage', 'zh');
</script>

<style scoped>
.plant-detail {
    display: flex;
    flex-direction: column;
    height: auto;
    margin-left: 20px;
}

p {
    font-size: 14px;
    color: #666;
}

h3 {
    font-family: 'pvzgFont', 'pvzgeFontEN', "Noto Sans SC";
}

.details-container {
    display: flex;
    padding: 2%;
    flex-direction: row;
    justify-content: space-between;
    border-radius: 10px;
    background-color: #aa6f42;
    border: 2px solid rgba(0, 0, 0, 0.8);
    box-shadow: rgba(0, 0, 0, 0.8) 0px 0px 12px;
}

.plant-image {
    display: flex;
    flex-direction: column;
    text-align: center;
    justify-content: center;
    padding: 10px;
    margin-right: 10px;
    background-color: #ede5c4;
    border-radius: 10px;
    box-shadow: rgba(0, 0, 0, 0.8) 0px 0px 12px;
    align-items: center;
}

.plant-image img {
    width: 150px;
    height: 150px;
    border-radius: 40px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
    transition: transform 0.25s ease-in-out, opacity 0.25s ease-in-out;
    box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 12px
}

.plant-image img.family-img {
    width: 50px;
    height: 50px;
    border-radius: 40px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
    transition: transform 0.25s ease-in-out, opacity 0.25s ease-in-out;
    box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 12px
}

.plant-stats {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding-left: 20px;
    border-radius: 10px;
    overflow: hidden;
    background-color: #ede5c4;
    box-shadow: rgba(0, 0, 0, 0.8) 0px 0px 12px
        /* 隐藏超出部分 */
}

.plant-introduction {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 10px;
    border-radius: 10px;
    text-align: left;
    background-color: #ede5c4;
    box-shadow: rgba(0, 0, 0, 0.8) 0px 0px 12px;
}

table {
    display: flex;
    justify-content: center;
    width: 100%;
    border-collapse: separate;
}

table tbody tr {
    background-color: #61ac66;
    border-radius: 5px;
}

table tbody tr:nth-child(even) {
    background-color: #3a6e3d;
}

table tbody td img {
    object-fit: contain;
    vertical-align: middle;
    height: 32px;
}

table tbody td.ability {
    color: #d8d8d8;
    font-weight: bold;
    font-family: 'pvzgFont', 'pvzgeFontEN', "Noto Sans SC";
    font-size: large;
    border-radius: 7% 0 0 7%;
    text-shadow: 0px -1px 1px black, 0px 1px 1px black, 1px 0px 1px black, -1px 0px 0px black, 1px 2px 1px black;
}

table tbody td.value {
    color: white;
    font-weight: bold;
    font-family: 'pvzgFont', 'pvzgeFontEN', "Noto Sans SC";
    font-size: larger;
    border-radius: 0 7% 7% 0;
    text-shadow: 0px -1px 1px black, 0px 1px 1px black, 1px 0px 1px black, -1px 0px 0px black, 1px 2px 1px black;
}

.ability {
    color: #80ea4c;
    font-weight: bold;
}

p.description {
    margin: 0.2em 0;
    font-family: 'pvzgFont', 'pvzgeFontEN', "Noto Sans SC";
    font-size: x-large;
    color: #865600;
    line-height: 1.2em;
}

p.plant-title {
    font-family: 'pvzgFont', 'pvzgeFontEN', "Noto Sans SC";
    font-size: xx-large;
    color: white;
    text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 2px -2px 0 #000, -1px 1px 0 #000, 5px 3px 5px rgba(0, 0, 0, 0.2);
    line-height: 1.2em;
}

span.descriptionKey {
    color: red;
}

@media (max-width: 768px) {
    .details-container {
        flex-direction: column;
    }

    .plant-image {
        align-items: center;
        margin-right: 0;
        margin-bottom: 10px;
    }

    .plant-stats {
        padding-left: 0;
    }

    .plant-detail {
        margin-left: 0;
    }
}
</style>