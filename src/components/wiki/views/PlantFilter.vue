<template>
    <div class="plant-filter">
        <div class="search-input-group">
            <label for="plant-search">Search:</label>
            <input id="plant-search" type="text" v-model="searchTerm" :placeholder @input="handleFilter" />
            <!-- <select v-model="selectedAttribute" @change="handleFilter">
            <option value="">所有植物</option>
            <option value="sun">向日葵类</option>
            <option value="shooter">射手类</option>
        </select> -->
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, inject, watch, computed } from 'vue';

// 父组件传递的属性过滤事件
const emits = defineEmits(['filterPlants']);

const searchTerm = ref(''); // 植物名称
const selectedAttribute = ref(''); // 植物属性
const i18nLanguage = inject('i18nLanguage', 'zh');
// 处理筛选逻辑
const handleFilter = () => {
    emits('filterPlants', { name: searchTerm.value, attribute: selectedAttribute.value });
};
const placeholder = computed(() => {
    return i18nLanguage === 'zh' ? '输入植物名称' : 'Enter plant name';
});
</script>

<style scoped>
.plant-filter {
    display: flex;
    flex-direction: column;
    text-align: center;
    justify-content: center;
    align-items: center;
    gap: 15px;
}

.search-input-group {
    display: flex;
    flex-direction: row;
    text-align: center;
    justify-content: center;
    align-items: center;
    gap: 10px;
}

.plant-filter input {
    font-family: 'pvzgFont', 'pvzgeFontEN', "Noto Sans SC";
    padding: 10px 15px;
    width: 100%;
    border: 2px solid #432b1a;
    border-radius: 15px;
    background-color: #fff;
    font-size: 16px;
    outline: none;
    transition: border 0.3s ease, box-shadow 0.3s ease;
}

.plant-filter input:focus {
    border-color: #4caf50;
    box-shadow: 0 0 8px rgba(76, 175, 80, 0.3);
}

.plant-filter select {
    padding: 10px 15px;
    width: 100%;
    border: 2px solid #432b1a;
    border-radius: 15px;
    background-color: #fff;
    font-size: 16px;
    outline: none;
    transition: border 0.3s ease, box-shadow 0.3s ease;
}

.plant-filter select:focus {
    border-color: #4caf50;
    box-shadow: 0 0 8px rgba(76, 175, 80, 0.3);
}

.plant-filter option {
    background-color: #fff;
    color: #333;
    padding: 10px;
}
.plant-filter label{
    font-family: 'pvzgFont', 'pvzgeFontEN', "Noto Sans SC";
    font-size: x-large;
}
</style>