<template>
    <a-row :gutter="[16, 24]">
        <a-col :span="8" v-for="level in paginatedLevels" :key="level.name">
            <a-card :title="level.name" @click="downloadLevel(level)" hoverable>
                <p>Author: {{ level.author }}</p>
                <p>Author Info: {{ level.authorInfo }}</p>
            </a-card>
        </a-col>
    </a-row>
    <a-pagination :current="currentPage" :pageSize="pageSize" :total="levels.length" @change="handlePageChange"
        style="margin-top: 20px;" />
</template>

<script setup lang="ts">
import { Card as ACard, Row as ARow, Col as ACol, Pagination as APagination, message } from 'ant-design-vue';
import axios from 'axios';
import { ref, onBeforeMount, computed } from 'vue';
const levels: any = ref([]);
const currentPage = ref(1);
const pageSize = ref(9);
// 获取官方作者及关卡信息
const fetchOfficialLevels = async () => {
    try {
        // 第一步：获取根 links.json 文件
        const rootResponse = await axios.get('https://levelapi.pvzge.com/links.json');
        const officialAuthors = rootResponse.data.official;

        // 遍历每个官方作者，获取他们的关卡信息
        for (const author in officialAuthors) {
            const authorLocation = officialAuthors[author].location;
            const authorResponse = await axios.get(`https://levelapi.pvzge.com${authorLocation}`);

            const authorData = authorResponse.data;
            const authorInfo = authorData.AuthorInfo;
            const authorName = authorData.Author;

            // 遍历每个关卡
            authorData.levelList.forEach((levelName) => {
                levels.value.push({
                    name: levelName,
                    author: authorName,
                    authorInfo: authorInfo,
                    url: `https://levelapi.pvzge.com/official/${authorName}/levels/${levelName}`,
                });
            });
        }
    } catch (error) {
        message.error('Failed to load levels: ' + error.message);
    }
};

// 下载 JSON 文件
const downloadLevel = async (level) => {
    try {
        // 请求获取 JSON 文件内容
        const response = await axios.get(level.url);
        const jsonData = response.data;

        // 将 JSON 数据转换为 Blob 对象
        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });

        // 创建一个临时的 URL 并触发下载
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', level.name); // 设置下载的文件名
        document.body.appendChild(link);
        link.click();

        // 下载完成后清理 URL 和 DOM
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    } catch (error) {
        message.error('Failed to download level: ' + error.message);
    }
};
// 处理页码变化
const handlePageChange = (page) => {
    currentPage.value = page;
};

const paginatedLevels = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return levels.value.slice(start, end);
});

onBeforeMount(() => {
    fetchOfficialLevels();
});
</script>

<style scoped>
a-card {
    margin-bottom: 24px;
}
</style>