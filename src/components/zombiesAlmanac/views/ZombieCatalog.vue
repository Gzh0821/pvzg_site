<template>
    <!-- <div class="zombie-catalog"> -->
    <!-- <h2>植物列表</h2> -->
    <ul>
        <li v-for="zombie in zombies" :key="zombie.id" @click="selectZombie(zombie)">
            <!-- <img :src="'/assets/wikiplants/' + plant.enName.replace(/\s+/g, '_').replace(/[\']/g, '') + '2.webp'"
                :alt="plant.name"> -->
            <!-- <div class="zombie-image-frame">
                <img class="zombie-img" :src="'/assets/image/plants-tp/plants_' + plant.plantType + '_0.webp'"
                    :alt="plant.name">
                <img class="frame-img" :src="'/assets/image/plants-frame/background_' + plant.frameWorld + '_0.webp'"
                    :alt="plant.frameWorld">
            </div> -->
            <img :src="'/assets/image/zombies/Zombie_' + zombie.zombieType + '_0.webp'" :alt="zombie.name">
            <p>{{ zombie.name }}</p>
        </li>
    </ul>
    <!-- </div> -->
</template>

<script lang="ts" setup>
import type { Zombie } from '../types';

// 定义 props 类型
const props = defineProps<{ zombies: Zombie[] }>();

// 定义 emits
const emits = defineEmits(['selectZombie']);

// 选择植物事件
const selectZombie = (zombie: Zombie) => {
    emits('selectZombie', zombie);
};
</script>

<style scoped>
/* .zombie-image-frame {
    margin: 0 10%;
    position: relative;
    height: 70px;
} 

.zombie-image-frame img.zombie-img {
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

.zombie-image-frame img.frame-img {
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
    font-family: 'pvzgFont', 'pvzgeFontEN', "Noto Sans SC";
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

    .zombie-image-frame {
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