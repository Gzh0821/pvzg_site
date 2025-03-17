<template>
    <a-config-provider :theme="{
        token: {
            colorPrimary: '#aa6f42'
        },
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        components: {}
    }"></a-config-provider>
    <a-layout>
        <!-- <div style="
        display: flex;
        background-color: #ede5c4;
        border: 5px solid #432b1a;
        border-radius: 5px;
        padding: 0 20px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
      ">
            <p style="
          display: flex;
          font-family: 'pvzgFont';
          color: #432b1a;
          font-size: 24px;
          flex: auto;
          text-align: center;
          width: 100%;
          justify-content: center;
        ">
                存档编辑器
            </p>
            <div style="display: flex; gap: 10px; width: 100%;justify-content: center; margin: 10px;">
                <a-upload :before-upload="handleUpload" accept=".json" :showUploadList="false">
                    <a-button type="primary"> <upload-outlined /> 上传存档 </a-button>
                </a-upload>
                <a-button @click="newArchive">新建存档</a-button>
            </div>
        </div> -->
        <a-page-header :title="t('title')" style="font-family: 'pvzgFont'">
            <template #extra>
                <a-upload :before-upload="handleUpload" accept=".json" :showUploadList="false">
                    <a-button type="primary"> {{ t('upload save') }} </a-button>
                </a-upload>
                <a-button @click="newArchive">{{ t('new save') }}</a-button>
                <a-button @click="clearArchive" danger>{{ t('clear save') }}</a-button>
            </template>
        </a-page-header>
        <a-layout-content v-if="Object.keys(archiveData).length" style="padding: 20px">
            <a-alert v-if="isOldArchive" :message="t('old version warning')" type="warning" />
            <a-form layout="vertical">
                <!-- 基础资源 -->
                <a-divider orientation="left">{{ t('basic resources') }}</a-divider>
                <a-row :gutter="16">
                    <a-col :span="8">
                        <a-form-item>
                            <a-input-number :addon-before="t('worldKey')" v-model:value="archiveData.worldkey"
                                :min="0" />
                        </a-form-item>
                    </a-col>
                    <a-col :span="8">
                        <a-form-item>
                            <a-input-number :addon-before="t('gem')" v-model:value="archiveData.gem" :min="0" />
                        </a-form-item>
                    </a-col>
                    <a-col :span="8">
                        <a-form-item>
                            <a-input-number :addon-before="t('coin')" v-model:value="archiveData.coin" :min="0" />
                        </a-form-item>
                    </a-col>
                </a-row>

                <!-- 世界进度 -->
                <!-- <a-form-item label="已解锁世界">
                    <a-checkbox-group v-model:value="unlockedWorlds">
                        <a-checkbox v-for="world in archiveData.worldProgress" :key="world.worldID"
                            :value="world.worldID">
                            世界 {{ world.worldID }}
                        </a-checkbox>
                    </a-checkbox-group>
                </a-form-item> -->

                <!-- 已获得植物 -->

                <!-- <a-form-item>
                    <a-table :dataSource="archiveData.obtainedPlants" :columns="plantColumns" bordered style="flex: 1;">
                            <template #bodyCell="{ column, record, index }">
                                <template v-if="column.key === 'progress'">
                                    <a-select v-model:value="record.progress" style="width: 100%">
                                        <a-select-option :value="0">未获得</a-select-option>
                                        <a-select-option :value="1">已获得未解锁</a-select-option>
                                        <a-select-option :value="2">已解锁</a-select-option>
                                    </a-select>
                                </template>
                                <template v-if="column.key === 'action'">
                                    <a-button danger @click="removePlant(index)">删除</a-button>
                                </template>
                            </template>
                    </a-table>
                    <a-button @click="addPlant" style="margin-top: 10px">
                        添加植物
                    </a-button>

                </a-form-item> -->
                <a-divider orientation="left">{{ t('edit plants') }}</a-divider>
                <a-form-item>
                    <a-flex justify="center">
                        <a-input-number :addon-before="t('plant id')" id="inputNumber" v-model:value="selectPlantValue"
                            :min="0" />
                    </a-flex>
                    <a-flex v-if="plantMap[selectPlantValue]">
                        <a-row :gutter="16" align="middle">
                            <a-col :span="6">
                                <img width="900px" alt="logo"
                                    :src="'/assets/image/plants/plants_' + plantMap[selectPlantValue].codename + '_c.webp'" />
                            </a-col>
                            <a-col :span="12">
                                <p class="plant-title">{{ plantMap[selectPlantValue].name }}</p>
                            </a-col>
                            <a-col :span="6">
                                <template v-if="archiveData.plantProps && archiveData.plantProps[selectPlantValue]">
                                    <a-flex gap="small" wrap="wrap" justify="center">
                                        <a-select v-model:value="archiveData.plantProps[selectPlantValue].progress"
                                            style="width:100%">
                                            <a-select-option :value="0">{{ t('locked') }}</a-select-option>
                                            <a-select-option :value="1">{{ t('available') }}</a-select-option>
                                            <a-select-option :value="2">{{ t('unlocked') }}</a-select-option>
                                        </a-select>
                                        <a-button danger @click="removePlant(selectPlantValue)">{{ t('delete')
                                            }}</a-button>
                                    </a-flex>
                                </template>
                                <template v-else>
                                    <a-flex gap="small" wrap="wrap" justify="center">
                                        <a-button type="primary" @click="addPlant(selectPlantValue)">{{ t('add')
                                            }}</a-button>
                                    </a-flex>
                                </template>
                            </a-col>
                        </a-row>
                    </a-flex>
                </a-form-item>

                <a-divider orientation="left">{{ t('world unlock') }}</a-divider>
                <a-row v-if="archiveData.worldProps">
                    <template v-for="(world, worldID) in archiveData.worldProps" :key="worldID">
                        <a-col :span="6" v-if="world.hasOwnProperty('unlocked')">
                            <a-checkbox v-model:checked="archiveData.worldProps[worldID]['unlocked']">
                                {{ t('world ' + worldID) }}
                            </a-checkbox>
                        </a-col>
                    </template>
                </a-row>

                <a-form-item></a-form-item>
                <a-divider></a-divider>
                <a-button type="primary" @click="saveArchive"> {{ t('save to local') }} </a-button>
            </a-form>
        </a-layout-content>
        <a-layout-content v-else>
            <a-empty :description="t('empty description')" />
        </a-layout-content>
    </a-layout>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, inject } from 'vue'
import { message, theme } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { getPlantIdMap } from '../plantsAlmanac/formatPlants.ts'
import { useDarkMode } from "@vuepress/helper/client";

import i18nJson from './vue-i18n.json'

import type { ArchiveData } from './types';

const isDarkMode = useDarkMode();
const i18nLanguage = inject('i18nLanguage', 'en');
const plantMap = getPlantIdMap(i18nLanguage);

// 世界数量
const worldAmount = 10
const gameVersion = '0.2.7'

const { t, locale } = useI18n({
    locale: i18nLanguage,
    fallbackLocale: 'en',
    messages: i18nJson
})

locale.value = i18nLanguage
// 初始化空存档模板
const defaultArchive = {
    worldkey: 0,
    gem: 0,
    coin: 0,
    plantProps: {},
    worldProps: {
        ...Object.fromEntries(Array.from({ length: worldAmount }, (_, i) => [i, { unlocked: false, wmx: 0 }])),
        ...{ currentWM: 0, worldChooserPos: 1 }
    },
    version: gameVersion,
    // ...其他字段初始化
};
console.log(defaultArchive)
const archiveData = ref<ArchiveData>({})
const otherData = ref({}) // 存储未处理的字段
const selectPlantValue = ref(0)
const uploadVersion = ref('')

// 处理文件上传
const handleUpload = file => {
    const reader = new FileReader()
    reader.onload = e => {
        try {
            const data = JSON.parse(e.target.result)
            // 合并用户数据和默认结构
            uploadVersion.value = data.version
            console.log(uploadVersion)
            archiveData.value = { ...defaultArchive, ...data }
            // 保存其他字段
            otherData.value = Object.fromEntries(
                Object.entries(data).filter(([key]) => !(key in defaultArchive))
            )
        } catch (err) {
            message.error(t('parse error'))
        }
    }
    reader.readAsText(file)
    return false
}

// 新建存档
const newArchive = () => {
    archiveData.value = { ...defaultArchive }
    otherData.value = {}
}
// 清空存档
const clearArchive = () => {
    archiveData.value = {}
    otherData.value = {}
}


// 判断是否为旧版存档
const isOldArchive = computed(() => {
    if (!uploadVersion.value) return true;
    return uploadVersion.value !== gameVersion
});

// 植物操作
const addPlant = (id) => {
    if (!archiveData.value.plantProps) {
        archiveData.value.plantProps = {};
    }
    if (!archiveData.value.plantProps[id]) {
        archiveData.value.plantProps[id] = {
            progress: 0,
            tutorialLevel: 0,
            costume: -1,
            costumes: []
        };
    }
}

const removePlant = (id) => {
    delete archiveData.value.plantProps?.[id];
}

// 保存存档
const saveArchive = () => {
    archiveData.value.worldProgress?.sort((a, b) => a.worldID - b.worldID);
    const finalData = {
        ...archiveData.value,
        ...otherData.value
    }

    const blob = new Blob([JSON.stringify(finalData, null, 2)], {
        type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pp.json'
    a.click()
    URL.revokeObjectURL(url)

    message.success(t('save successfully'))
}

</script>
<style scoped>
p.plant-title {
    font-family: 'pvzgFont';
    font-size: x-large;
}
</style>