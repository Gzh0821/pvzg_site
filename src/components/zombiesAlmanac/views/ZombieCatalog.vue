<template>
    <ul>
        <li v-for="zombie in zombies" :key="zombie.codename" @click="selectZombie(zombie)">

            <template v-if="zombie.subZombies">
                <a-popover arrow-point-at-center trigger="hover" :open="visible[zombie.codename]"
                    @open-change="visible[zombie.codename] = $event" :overlayInnerStyle="{
                        border: $isDarkMode ? '3px solid #deb991' : '3px solid #432b1a',
                        backgroundColor: $isDarkMode ? '#383011' : '#ede5c4',
                        textAlign: 'center'
                    }">
                    <template #content>
                        <a-row :gutter="[16, { xs: 8, sm: 16, md: 24, lg: 32 }]" justify="center">
                            <template
                                v-for="subZombie in zombie.subZombies.map((codename) => { return zombieMap[codename] }).filter((z) => z)"
                                :key="subZombie.codename">
                                <a-col @click="selectZombie(subZombie, zombie)">
                                    <img :src="'/assets/image/zombies/Zombie_' + subZombie.zombieType + '_0.webp'"
                                        :alt="subZombie.name">
                                    <p>{{ subZombie.name }}</p>
                                </a-col>
                            </template>
                        </a-row>
                    </template>
                    <img :src="'/assets/image/zombies/Zombie_' + zombie.zombieType + '_0.webp'" :alt="zombie.name">
                </a-popover>
                <p>{{ zombie.name }}</p>
            </template>
            <template v-else>
                <img :src="'/assets/image/zombies/Zombie_' + zombie.zombieType + '_0.webp'" :alt="zombie.name">
                <p>{{ zombie.name }}</p>
            </template>
        </li>
    </ul>
    <!-- </div> -->
</template>

<script lang="ts" setup>
import type { Zombie } from '../types';
import { ref } from 'vue';

// 定义 props 类型
const props = defineProps<{ zombies: Zombie[], zombieMap: { [key: string]: Zombie } }>();

// 定义 emits
const emits = defineEmits(['selectZombie']);
const visible = ref({});

const selectZombie = (zombie: Zombie, parZombie: Zombie | undefined = undefined) => {
    if (parZombie)
        visible.value[parZombie.codename] = false;
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
    font-family: 'pvzgeFontEN', 'pvzgFont', "Noto Sans SC", sans-serif;
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