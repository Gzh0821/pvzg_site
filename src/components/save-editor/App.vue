<template>
    <a-config-provider :theme="{
        token: {
            colorPrimary: '#aa6f42'
        },
        algorithm: $isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        components: {}
    }"></a-config-provider>
    <a-layout>
        <a-page-header :title="t('title')" :sub-title="gameVersion" style="font-family: 'pvzgeFontEN','pvzgFont',sans-serif">
            <template #extra>
                <a-upload :before-upload="handleUpload" accept=".json" :showUploadList="false">
                    <a-button type="primary"> {{ t('upload save') }}</a-button>
                </a-upload>
                <a-button @click="newArchive">{{ t('new save') }}</a-button>
                <a-button @click="clearArchive" danger>{{ t('clear save') }}</a-button>
            </template>
        </a-page-header>
        <a-layout-content v-if="Object.keys(archiveData).length" style="padding: 20px">
            <a-alert v-if="isOldArchive" :message="t('old version warning')" type="warning" />
            <a-form layout="vertical">

                <a-form-item>
                    <a-flex justify="center">
                        <a-input :addon-before="t('save name')" v-model:value="archiveData.name"
                            :placeholder="t('enter name')" />
                    </a-flex>
                </a-form-item> <!-- 基础资源 -->
                <a-collapse v-model:activeKey="activeKeys" :bordered="false">
                    <a-collapse-panel :key="'basic'" :header="t('basic resources')">
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
                                    <a-input-number :addon-before="t('coin')" v-model:value="archiveData.coin"
                                        :min="0" />
                                </a-form-item>
                            </a-col>
                        </a-row>
                    </a-collapse-panel>
                </a-collapse> <a-collapse v-model:activeKey="activeKeys" :bordered="false">
                    <a-collapse-panel :key="'plants'" :header="t('edit plants')">
                        <a-form-item>
                            <a-flex justify="center">
                                <a-input-number :addon-before="t('plant id')" id="inputNumber"
                                    v-model:value="selectPlantValue" :min="0" />
                            </a-flex>
                            <a-flex v-if="plantMap[selectPlantValue]">
                                <a-row :gutter="16" align="middle">
                                    <a-col :span="6">
                                        <img width="900px" alt="logo"
                                            :src="'/assets/image/plants/plants_' + plantMap[selectPlantValue].codename + '_c.webp'" />
                                    </a-col>
                                    <a-col :span="12">
                                        <p class="plant-title">{{
                                            plantMap[selectPlantValue].name ? plantMap[selectPlantValue].name
                                                : plantMap[selectPlantValue].enName
                                        }}</p>
                                    </a-col>
                                    <a-col :span="6">
                                        <template
                                            v-if="archiveData.plantProps && archiveData.plantProps[selectPlantValue]">
                                            <a-flex gap="small" wrap="wrap" justify="center">
                                                <a-select
                                                    v-model:value="archiveData.plantProps[selectPlantValue].progress"
                                                    style="width:100%">
                                                    <a-select-option :value="0">{{ t('locked') }}</a-select-option>
                                                    <a-select-option :value="1">{{ t('available') }}</a-select-option>
                                                    <a-select-option :value="2">{{ t('unlocked') }}</a-select-option>
                                                </a-select>
                                                <a-button danger @click="removePlant(selectPlantValue)">{{
                                                    t('delete')
                                                    }}
                                                </a-button>
                                            </a-flex>
                                        </template>
                                        <template v-else>
                                            <a-flex gap="small" wrap="wrap" justify="center">
                                                <a-button type="primary" @click="addPlant(selectPlantValue)">{{
                                                    t('add')
                                                    }}
                                                </a-button>
                                            </a-flex>
                                        </template>
                                    </a-col>
                                </a-row>
                            </a-flex>
                        </a-form-item>
                    </a-collapse-panel>
                </a-collapse>

                <a-collapse v-model:activeKey="activeKeys" :bordered="false">
                    <a-collapse-panel :key="'worlds'" :header="t('world unlock')">
                        <a-row v-if="archiveData.worldProps">
                            <template v-for="(world, worldID) in archiveData.worldProps" :key="worldID">
                                <a-col :span="6" v-if="world.hasOwnProperty('unlocked')">
                                    <a-checkbox v-model:checked="archiveData.worldProps[worldID]['unlocked']">
                                        {{ t('world ' + worldID) }}
                                    </a-checkbox>
                                </a-col>
                            </template>
                        </a-row>
                    </a-collapse-panel>
                </a-collapse>

                <a-collapse v-model:activeKey="activeKeys" :bordered="false">
                    <a-collapse-panel :key="'upgrades'" :header="t('upgrades')">
                        <a-row v-if="archiveData.upgradeProps" :gutter="[16, 16]">
                            <template v-for="(upgrade, upgradeID) in archiveData.upgradeProps" :key="upgradeID">
                                <a-col :span="8">
                                    <a-card hoverable>
                                        <template #cover>
                                            <!-- <div style="text-align: center; padding: 10px;">
                                                <img v-if="upgradeList[upgradeID]" style="width: 64px; height: 64px;" 
                                                    :alt="upgradeList[upgradeID].SPRITENAME" 
                                                    :src="'/assets/image/upgrades/' + upgradeList[upgradeID].SPRITENAME + '.webp'" />
                                            </div> -->
                                        </template>
                                        <template #title>
                                            <span v-if="upgradeList[upgradeID]">
                                                {{ upgradeList[upgradeID].NAME[i18nLanguage] ||
                                                    upgradeList[upgradeID].NAME.en
                                                }}
                                            </span>
                                        </template>
                                        <template v-if="upgradeList[upgradeID]">
                                            <p>{{ upgradeList[upgradeID].DESCRIPTION[i18nLanguage] ||
                                                upgradeList[upgradeID].DESCRIPTION.en }}</p>
                                            <p>{{ t('obtain from') }}: {{ t('world ' +
                                                upgradeList[upgradeID].OBTAINWORLD) }}
                                            </p>
                                            <a-flex gap="small" wrap="wrap">
                                                <a-select v-model:value="archiveData.upgradeProps[upgradeID].progress"
                                                    style="width:50%">
                                                    <a-select-option :value="0">{{ t('locked') }}</a-select-option>
                                                    <a-select-option :value="1">{{ t('unlocked') }}</a-select-option>
                                                </a-select>
                                                <a-switch v-model:checked="archiveData.upgradeProps[upgradeID].enabled"
                                                    :disabled="archiveData.upgradeProps[upgradeID].progress !== 1"
                                                    :checked-children="t('enabled')"
                                                    :un-checked-children="t('disabled')" />
                                            </a-flex>
                                        </template>
                                    </a-card>
                                </a-col>
                            </template>
                        </a-row>
                    </a-collapse-panel>
                </a-collapse>

                <a-form-item></a-form-item>
                <a-divider></a-divider>
                <a-button type="primary" @click="saveArchive"> {{ t('save to local') }}</a-button>
            </a-form>
        </a-layout-content>
        <a-layout-content v-else>
            <a-empty :description="t('empty description')" />
        </a-layout-content>
    </a-layout>
</template>

<script lang="ts" setup>
import { ref, computed, inject } from 'vue'
import { message, theme, Collapse } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import JSON5 from 'json5'

import { getPlantIdMap } from '../plantsAlmanac/formatPlants'

import upgradeJson from './UpgradeFeatures.json'
import i18nJson from './vue-i18n.json'

import type { ArchiveData } from './types';

const i18nLanguage = inject('i18nLanguage', 'en');
const plantMap = getPlantIdMap(i18nLanguage);

// 世界数量
const worldAmount = 13
const gameVersion = '0.3.5'


// 升级特性
const upgradeList = upgradeJson.UPGRADES

const { t, locale } = useI18n({
    locale: i18nLanguage,
    fallbackLocale: 'en',
    messages: i18nJson
})

locale.value = i18nLanguage
// 初始化空存档模板
const defaultArchive = {
    name: "New Player",
    worldkey: 0,
    gem: 0,
    coin: 0,
    plantProps: {},
    worldProps: {
        ...Object.fromEntries(Array.from({ length: worldAmount }, (_, i) => [i, { unlocked: false, wmx: 0 }])),
        ...{ currentWM: 0, worldChooserPos: 1 }
    },
    upgradeProps: {
        ...Object.fromEntries(Array.from({ length: upgradeList.length }, (_, i) => [i, {
            progress: 0,
            enabled: true
        }])),
    },
    version: gameVersion,
    // ...其他字段初始化
};

const archiveData = ref<ArchiveData>({})
const otherData = ref({}) // 存储未处理的字段
const selectPlantValue = ref(0)
const uploadVersion = ref('')
// 控制折叠面板的展开/收起状态
const activeKeys = ref(['basic', 'plants', 'worlds', 'upgrades'])

// 处理文件上传
const handleUpload = file => {
    const reader = new FileReader()
    reader.onload = e => {
        try {
            if (e.target === null || typeof e.target.result !== 'string') throw new Error('Invalid file')
            const data = JSON5.parse(e.target.result)
            // 合并用户数据和默认结构
            uploadVersion.value = data.version
            archiveData.value = { ...defaultArchive, ...data }
            // 保存其他字段
            otherData.value = Object.fromEntries(
                Object.entries(data).filter(([key]) => !(key in defaultArchive))
            )
        } catch (err) {
            message.error(t('parse error'))
            console.error(err)
        }
    }
    reader.readAsText(file)
    return false
}

// 新建存档
const newArchive = () => {
    archiveData.value = { ...defaultArchive }
    uploadVersion.value = gameVersion
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
    const [major, minor, patch] = uploadVersion.value.split('.').map(Number);
    const [currentMajor, currentMinor, currentPatch] = gameVersion.split('.').map(Number);

    if (major < currentMajor) return true;
    if (major === currentMajor && minor < currentMinor) return true;
    return major === currentMajor && minor === currentMinor && patch < currentPatch;
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
    const saveName = finalData.name || 'New Player'
    const blob = new Blob([JSON.stringify(finalData, null, 2)], {
        type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${saveName}.json`
    a.click()
    URL.revokeObjectURL(url)

    message.success(t('save successfully'))
}

</script>
<style scoped>
p.plant-title {
    font-family: 'pvzgFont', sans-serif;
    font-size: x-large;
}

/* 定制折叠面板样式 */
:deep(.ant-collapse) {
    background: transparent;
    margin-bottom: 16px;
}

:deep(.ant-collapse-header) {
    font-size: 1.2em;
    font-weight: 500;
}

:deep(.ant-collapse-content) {
    padding: 10px 0;
}
</style>