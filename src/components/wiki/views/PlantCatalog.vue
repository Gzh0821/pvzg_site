<template>
  <!-- <div class="plant-catalog"> -->
    <!-- <h2>植物列表</h2> -->
    <ul>
      <li v-for="plant in plants" :key="plant.id" @click="selectPlant(plant)">
        <!-- 有图片后取消注释 -->
        <!-- <img :src="plant.image" :alt="plant.name" /> -->
        <p>{{ plant.name }}</p>
      </li>
    </ul>
  <!-- </div> -->
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from 'vue';
import type { Plant } from '../types';

// 定义 props 类型
const props = defineProps<{ plants: Plant[] }>();

// 定义 emits
const emits = defineEmits(['selectPlant']);

// 选择植物事件
const selectPlant = (plant: Plant) => {
  emits('selectPlant', plant);
};
</script>

<style scoped>


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
  width: 50px;
  height: 50px;
}

@media (max-width: 768px) {
    /* 调整植物条目的横向排列方式 */
  ul {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  li {
    flex: 0 0 auto;
    margin-right: 15px;
  }
  
  img {
    width: 60px;
    height: 60px;
  }
}
</style>