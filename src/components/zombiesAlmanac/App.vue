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
                <ZombieCatalog :zombies="filteredZombies" @selectZombie="selectZombie" :zombieMap />
            </div>
            <div class="content">
                <ZombieDetail v-if="selectedZombie" :keyMap="keyMap" :zombie="selectedZombie" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {inject, ref} from 'vue';
import ZombieCatalog from './views/ZombieCatalog.vue';
import ZombieDetail from './views/ZombieDetail.vue';
import ZombieFilter from './views/ZombieFilter.vue';
import type {KeyMap, Zombie} from './types';

import {getZombieMap, zombiesOrder} from './formatZombies';
import i18nJson from './i18n.json';

// 中文转换
const keyMap: KeyMap = i18nJson?.Almanac;
const familyNameMap = i18nJson?.PlantFamily;
const i18nLanguage = inject('i18nLanguage', 'zh');

// 定义响应式状态
const zombies = ref<Zombie[]>([]);
const zombieMap = getZombieMap(i18nLanguage);

const filteredZombies = ref<Zombie[]>([]);
const selectedZombie = ref<Zombie | null>(null);

// 选择僵尸
const selectZombie = (zombie: Zombie) => {
    selectedZombie.value = zombie;
};

const filterZombies = (filter: { name: string }) => {
    const { name } = filter;

    filteredZombies.value = zombies.value.filter(singleZombie => {
        // 根据名称筛选
      return singleZombie.name.toLowerCase().includes(name.toLowerCase()) ||
            singleZombie.enName.toLowerCase().includes(name.toLowerCase()) ||
            singleZombie.codename.toLowerCase().includes(name.toLowerCase());
    });
};


zombies.value = zombiesOrder.map((codename) => {
    return zombieMap[codename];
});

filteredZombies.value = zombies.value;
selectZombie(filteredZombies.value[0]);

</script>

<style scoped>
.filter h1 {
    font-family: 'pvzgeFontEN', 'pvzgFont', "Noto Sans SC",sans-serif;
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
    max-height: 80vh;
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