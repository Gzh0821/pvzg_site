<template>
    <div class="zombie-filter">
        <div class="search-input-group">
            <label for="zombie-search">Search:</label>
            <input id="zombie-search" type="text" v-model="searchTerm" :placeholder @input="handleFilter"/>
        </div>
        <!-- <div class="filter-family-group">
            <template v-for="item in familyNameMap">
                <div class="filter-family-option" :class="{ selected: selectedAttribute === item['en'] }"
                    @click="selectAttribute(item['en'])">
                    <img :src="'/assets/wikicon/' + item['en'] + '_familyicon.webp'" :alt="item['en']"
                        :class="item['en'] === selectedAttribute ? 'selected' : ''" />
                </div>
            </template>
</div> -->
    </div>
</template>

<script lang="ts" setup>
import {ref, inject, computed} from 'vue';

const props = defineProps<{ familyNameMap: Record<string, any>[] }>();
// 父组件传递的属性过滤事件
const emits = defineEmits(['filterZombies']);

const searchTerm = ref(''); // 植物名称
const selectedAttribute = ref(''); // 植物属性
const i18nLanguage = inject('i18nLanguage', 'zh');

const selectAttribute = (attribute: string) => {
    selectedAttribute.value = selectedAttribute.value == attribute ? '' : attribute;
    return handleFilter();
};
// 处理筛选逻辑
const handleFilter = () => {
    emits('filterZombies', {name: searchTerm.value});
};

const placeholder = computed(() => {
    return i18nLanguage === 'zh' ? '输入僵尸名称' : 'Enter zombie name';
});
</script>

<style scoped>
.zombie-filter {
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

.filter-family-group {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    text-align: center;
    justify-content: center;
    align-items: center;
    gap: 5px;
}

[data-theme="dark"] .filter-family-group img {
    opacity: 0.3;
}

.filter-family-group img {
    width: 40px;
    height: auto;
    border-radius: 100%;
    border: 3px solid rgba(255, 255, 255, 0.3);
    opacity: 0.5;
    object-fit: contain;
}

.filter-family-group img.selected {
    border-color: black;
    box-shadow: 0 0 8px rgba(76, 175, 80, 0.3);
    opacity: 1;
}

.filter-family-group p {
    font-family: 'pvzgFont', 'pvzgeFontEN', "Noto Sans SC", sans-serif;
    font-size: medium;
}

.filter-family-option {
    cursor: pointer;
    text-align: center;
}

[data-theme="dark"] .zombie-filter input {
    color: white;
    border: 2px solid #deb991;
    background-color: #1b1b1f;
}

.zombie-filter input {
    font-family: 'pvzgFont', 'pvzgeFontEN', "Noto Sans SC", sans-serif;
    color: black;
    padding: 10px 15px;
    width: 100%;
    border: 2px solid #432b1a;
    border-radius: 15px;
    background-color: #fff;
    font-size: 16px;
    outline: none;
    transition: border 0.3s ease, box-shadow 0.3s ease;
}

.zombie-filter input:focus {
    border-color: #4caf50;
    box-shadow: 0 0 8px rgba(76, 175, 80, 0.3);
}

.zombie-filter select {
    padding: 10px 15px;
    width: 100%;
    border: 2px solid #432b1a;
    border-radius: 15px;
    background-color: #fff;
    font-size: 16px;
    outline: none;
    transition: border 0.3s ease, box-shadow 0.3s ease;
}

.zombie-filter select:focus {
    border-color: #4caf50;
    box-shadow: 0 0 8px rgba(76, 175, 80, 0.3);
}

.zombie-filter option {
    background-color: #fff;
    color: #333;
    padding: 10px;
}

[data-theme="dark"] .zombie-filter label {
    color: #deb991;
}

.zombie-filter label {
    font-family: 'pvzgFont', 'pvzgeFontEN', "Noto Sans SC", sans-serif;
    font-size: x-large;
    color: #432b1a;
}
</style>