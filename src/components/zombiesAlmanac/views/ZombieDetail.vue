<template>
    <div class="zombie-detail" v-if="zombie">
        <div class="details-container">
            <div class="zombie-image">
                <img :src="'/assets/image/zombies/Zombie_' + zombie.zombieType + '_0.webp'" :alt="zombie.name">
                <p class="zombie-title">{{ zombie.name }}</p>
                <!-- <img v-if="zombie.enFamily" :src="'/assets/wikicon/' + zombie.enFamily + '_familyicon.webp'"
                    :alt="zombie.enFamily" class="family-img"> -->
            </div>
            <div class="zombie-stats">
                <table>
                    <tbody>
                        <tr v-for="(value, key) in zombie.elements" :key="key">

                            <td class="ability"><img :src="keyMap[key].icon" /> {{ keyMap[key][i18nLanguage] }}</td>
                            <td class="value">{{ value }}</td>
                        </tr>
                        <!-- <tr key="CodeName">
                            <td class="ability"> CodeName </td>
                            <td class="value">{{ zombie.codename }}</td>
                        </tr> -->
                    </tbody>
                </table>
            </div>

        </div>
        <div class="details-container">
            <div class="zombie-introduction">
                <p class="description">{{ zombie.description }}</p><br>
                <p v-for="value in zombie.special" :key="value['NAME'][i18nLanguage]" class="description">
                    {{ value['NAME'][i18nLanguage] }}: <span class="descriptionKey">{{
                        value['DESCRIPTION'][i18nLanguage] }}</span>
                </p><br>
                <p class="description">{{ zombie.chat }}</p>
            </div>
        </div>
        <div class="details-container">
            <div class="zombie-introduction">
                <p class="description">Codename: <span class="descriptionKey">{{ zombie.codename }}</span></p>
                <p class="description">OBTAINWORLD: <span class="descriptionKey">{{ zombie.obtainWorld }}</span></p>
                <p class="description">Properties: <span class="descriptionKey">{{ zombie.objdata }}</span></p>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { inject } from 'vue';
import type { Zombie, KeyMap } from '../types';


// 接收 props
const props = defineProps<{ zombie: Zombie, keyMap: KeyMap }>();
const i18nLanguage = inject('i18nLanguage', 'zh');
</script>

<style scoped>
.zombie-detail {
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
    font-family: 'pvzgeFontEN', 'pvzgFont', "Noto Sans SC", sans-serif;
}

[data-theme="dark"] .details-container {
    background-color: #4d3b29;
    border: 2px solid rgba(206, 206, 214, 0.8);
    box-shadow: rgba(206, 206, 214, 0.8) 0 0 12px;
}

.details-container {
    display: flex;
    padding: 2%;
    flex-direction: row;
    justify-content: space-between;
    border-radius: 10px;
    background-color: #aa6f42;
    border: 2px solid rgba(0, 0, 0, 0.8);
    box-shadow: rgba(0, 0, 0, 0.8) 0 0 12px;
}

/* .zombie-image-frame {
    margin: 0 10%;
    position: relative;
    display: flex;
    width: 240px;
    height: 152px;
} */


/* .zombie-image-frame img.frame-img {
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
} */
[data-theme="dark"] .zombie-image {
    background-color: #383011;
    box-shadow: rgba(206, 206, 214, 0.8) 0 0 12px;
}

.zombie-image {
    display: flex;
    flex-direction: column;
    text-align: center;
    justify-content: center;
    padding: 10px;
    margin-right: 10px;
    background-color: #ede5c4;
    border-radius: 10px;
    box-shadow: rgba(0, 0, 0, 0.8) 0 0 12px;
    align-items: center;
}

.zombie-image img {

    max-height: 120px;
    border-radius: 10px;
    /* border: 3px solid rgba(255, 255, 255, 0.3); */
    /* backdrop-filter: blur(10px); */
    transition: transform 0.25s ease-in-out, opacity 0.25s ease-in-out;
    /* box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 12px */
}

.zombie-image img.family-img {
    width: 50px;
    height: 50px;
    border-radius: 40px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
    transition: transform 0.25s ease-in-out, opacity 0.25s ease-in-out;
    box-shadow: rgba(0, 0, 0, 0.2) 0 0 12px
}

[data-theme="dark"] .zombie-stats {
    background-color: #383011;
    box-shadow: rgba(206, 206, 214, 0.8) 0 0 12px
}

.zombie-stats {
    display: flex;
    flex-direction: column;
    flex: 1;
    border-radius: 10px;
    overflow: hidden;
    background-color: #ede5c4;
    box-shadow: rgba(0, 0, 0, 0.8) 0 0 12px
        /* 隐藏超出部分 */
}

[data-theme="dark"] .zombie-introduction {
    background-color: #383011;
    box-shadow: rgba(206, 206, 214, 0.8) 0 0 12px
}

.zombie-introduction {
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
    background-color: #a09ec5;
    border-radius: 5px;
}

table tbody tr:nth-child(even) {
    background-color: #65637d;
}

table tbody td img {
    object-fit: contain;
    vertical-align: middle;
    height: 32px;
}

table tbody td.ability {
    color: #d8d8d8;
    font-weight: bold;
    font-family: 'pvzgeFontEN', 'pvzgFont', "Noto Sans SC", sans-serif;
    font-size: large;
    border-radius: 7% 0 0 7%;
    text-shadow: 0px -1px 1px black, 0px 1px 1px black, 1px 0px 1px black, -1px 0px 0px black, 1px 2px 1px black;
}

table tbody td.value {
    color: white;
    font-weight: bold;
    font-family: 'pvzgeFontEN', 'pvzgFont', "Noto Sans SC", sans-serif;
    font-size: larger;
    border-radius: 0 7% 7% 0;
    text-shadow: 0px -1px 1px black, 0px 1px 1px black, 1px 0px 1px black, -1px 0px 0px black, 1px 2px 1px black;
}

.ability {
    color: #80ea4c;
    font-weight: bold;
}


[data-theme="dark"] p.description {
    color: #e2b000;
}

p.description {
    margin: 0.2em 0;
    font-family: 'pvzgeFontEN', 'pvzgFont', "Noto Sans SC", sans-serif;
    font-size: x-large;
    color: #865600;
    line-height: 1.2em;
}

p.zombie-title {
    font-family: 'pvzgeFontEN', 'pvzgFont', "Noto Sans SC", sans-serif;
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

    .zombie-image {
        align-items: center;
        margin-right: 0;
        margin-bottom: 10px;
    }

    .zombie-stats {
        padding-left: 0;
    }

    .zombie-detail {
        margin-left: 0;
    }
}
</style>