<template>
    <!-- <a-row :gutter="[16, 24]">
        <a-col :span="8" v-for="level in paginatedLevels" :key="level.name">
            <a-card :title="level.name" @click="downloadLevel(level)" hoverable>
                <p v-if="level.author">Author: {{ level.author }}</p>
                <p v-if="level.introduction">Introduction: {{ level.introduction }}</p>
            </a-card>
        </a-col>
    </a-row>
 -->
    <a-config-provider :theme="{
        algorithm: $isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    }">
        <a-space direction="vertical" size="middle" style="width: 100%" theme="dark">
            <a-input-search v-model:value.lazy="searchValue" placeholder="Search level..." enter-button />
            <a-list item-layout="vertical" :data-source="filteredLevels" size="middle" header="PvZ2 Gardendless Levels"
                :pagination="pagination" bordered>
                <template #renderItem="{ item }">
                    <a-list-item>
                        <template #actions>
                            <span v-if="item.version">
                                <VPIcon icon="code-branch" /> {{ item.version }}
                            </span>
                            <span v-if="item.difficulty">
                                <VPIcon icon="fire" /> {{ item.difficulty }}
                            </span>
                            <span v-if="item.category">
                                <VPIcon icon="tag" /> {{ item.category }}
                            </span>
                            <span v-if="item.updatedAt">
                                <VPIcon icon="clock" /> {{ item.updatedAt }}
                            </span>
                        </template>
                        <a-list-item-meta :description="item.introduction">
                            <template #title>
                                <a @click="downloadLevel(item)">{{ item.name }}</a>
                                <span class="author-name"> by {{ item.author }}</span>
                            </template>
                        </a-list-item-meta>
                    </a-list-item>
                </template>
            </a-list>
        </a-space>
    </a-config-provider>
</template>

<script setup lang="ts">
import { message, theme } from 'ant-design-vue';
import axios from 'axios';
import { ref, onBeforeMount, computed, inject } from 'vue';

const props = defineProps<{ authorGroup: string }>();

const levels: any = ref([]);
const i18nLanguage = inject('i18nLanguage', 'en');
const searchValue = ref('');
// 获取官方作者及关卡信息
const fetchLevels = async (authorGroup: string) => {
    try {
        // 第一步：获取根 links.json 文件
        const rootResponse = await axios.get('https://levelapi.pvzge.com/links.json');
        const authors = rootResponse.data[authorGroup];

        // 遍历每个作者，获取他们的关卡信息
        for (const author in authors) {
            const authorLocation = authors[author].location;
            const authorResponse = await axios.get(`https://levelapi.pvzge.com${authorLocation}`);

            const authorData = authorResponse.data;
            const authorInfo = authorData.authorInfo;
            const authorName = authorData.author;

            // 遍历每个关卡
            authorData.levelList.forEach((level: string | { [key: string]: any }) => {
                if (typeof level === 'string') {
                    levels.value.push({
                        name: level,
                        author: authorName,
                        introduction: authorInfo,
                        url: `https://levelapi.pvzge.com/${authorGroup}/${author}/levels/${level}`,
                    });
                }
                else {
                    if (level.fileName && level.Information) {
                        const levelInfo = level.Information;
                        levels.value.push({
                            name: typeof levelInfo.name === 'string' ?
                                levelInfo.name : levelInfo.name[i18nLanguage] ?? levelInfo.name.en,
                            introduction: typeof levelInfo.Introduction === 'string' ?
                                levelInfo.Introduction : levelInfo.Introduction[i18nLanguage] ?? levelInfo.Introduction.en,
                            author: authorName,
                            gameVersion: levelInfo.GameVersion,
                            version: levelInfo.Version,
                            createdAt: levelInfo.CreatedAt,
                            updatedAt: levelInfo.UpdatedAt,
                            difficulty: levelInfo.Difficulty,
                            category: levelInfo.Category,
                            url: `https://levelapi.pvzge.com/${authorGroup}/${author}/levels/${level.fileName}`,
                        });
                    }
                }
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

const pagination = {
    pageSize: 6,
};

const filteredLevels = computed(() => {
    return levels.value.filter((level: any) => {
        return level.name.toLowerCase().includes(searchValue.value.toLowerCase()) ||
            level.author.toLowerCase().includes(searchValue.value.toLowerCase());
    });
});

onBeforeMount(() => {
    fetchLevels(props.authorGroup);
});
</script>

<style scoped>
.author-name {
    font-size: small;
    opacity: 0.7;
}
</style>