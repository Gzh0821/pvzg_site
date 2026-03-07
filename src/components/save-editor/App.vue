<template>
    <a-config-provider :theme="{
        token: {
            colorPrimary: '#aa6f42'
        },
        algorithm: $isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        components: {}
    }"></a-config-provider>
    <a-layout>
        <a-page-header :title="t('title')" :sub-title="gameVersion"
            style="font-family: 'pvzgeFontEN','pvzgFont',sans-serif">
            <template #extra>
                <a-upload :before-upload="handleUpload" accept=".json" :showUploadList="false">
                    <a-button type="primary"> {{ t('upload save') }}</a-button>
                </a-upload>
                <a-button @click="newArchive">{{ t('new save') }}</a-button>
                <a-button @click="clearArchive" danger>{{ t('clear save') }}</a-button>
            </template>
        </a-page-header>
        <a-layout-content v-if="Object.keys(archiveData).length" style="padding: 20px">
            <a-alert v-if="isOldArchive" :message="t('old version warning')" type="warning"
                style="margin-bottom:16px" />
            <a-form layout="vertical">

                <!-- 存档名 -->
                <a-form-item>
                    <a-flex justify="center">
                        <a-input :addon-before="t('save name')" v-model:value="archiveData.name"
                            :placeholder="t('enter name')" />
                    </a-flex>
                </a-form-item>

                <!-- 基础资源 -->
                <a-collapse v-model:activeKey="activeKeys" :bordered="false">
                    <a-collapse-panel :key="'basic'" :header="t('basic resources')">
                        <a-row :gutter="16">
                            <a-col :span="6">
                                <a-form-item>
                                    <a-input-number :addon-before="t('worldKey')"
                                        v-model:value="archiveData.worldkey" :min="0" style="width:100%" />
                                </a-form-item>
                            </a-col>
                            <a-col :span="6">
                                <a-form-item>
                                    <a-input-number :addon-before="t('gem')" v-model:value="archiveData.gem"
                                        :min="0" style="width:100%" />
                                </a-form-item>
                            </a-col>
                            <a-col :span="6">
                                <a-form-item>
                                    <a-input-number :addon-before="t('coin')" v-model:value="archiveData.coin"
                                        :min="0" style="width:100%" />
                                </a-form-item>
                            </a-col>
                            <a-col :span="6">
                                <a-form-item>
                                    <a-input-number :addon-before="t('sprout')" v-model:value="archiveData.sprout"
                                        :min="0" style="width:100%" />
                                </a-form-item>
                            </a-col>
                        </a-row>
                    </a-collapse-panel>
                </a-collapse>

                <!-- 植物编辑 -->
                <a-collapse v-model:activeKey="activeKeys" :bordered="false">
                    <a-collapse-panel :key="'plants'" :header="t('edit plants')">
                        <a-form-item>
                            <a-flex justify="center">
                                <a-select v-model:value="selectPlantValue" show-search allow-clear
                                    :placeholder="t('select plant')" :options="plantOptions"
                                    :filter-option="plantFilterOption" style="width: 320px" />
                            </a-flex>
                            <a-flex v-if="selectPlantValue && plantCodenameMap[selectPlantValue]"
                                justify="center" align="center"
                                style="width:100%; margin-top:16px; flex-wrap:wrap; gap:32px;">
                                <!-- 植物图片 + 名称 -->
                                <a-flex vertical align="center" style="min-width:110px; max-width:150px">
                                    <img style="width:120px; height:120px; object-fit:contain;" alt="plant"
                                        :src="'/assets/image/plants/plants_' + selectPlantValue + '_c.webp'" />
                                    <p class="plant-title" style="text-align:center; margin:4px 0 2px">{{
                                        plantCodenameMap[selectPlantValue]?.name ||
                                        plantCodenameMap[selectPlantValue]?.enName ||
                                        selectPlantValue
                                    }}</p>
                                    <p style="color:#888; font-size:0.82em; margin:0">{{ selectPlantValue }}</p>
                                </a-flex>
                                <!-- 编辑控件 -->
                                <a-flex vertical gap="small" style="min-width:220px; max-width:300px">
                                    <!-- 植物已在存档中 -->
                                    <template
                                        v-if="archiveData.plantProps && archiveData.plantProps[selectPlantValue]">
                                        <!-- 解锁进度 -->
                                        <a-select
                                            v-model:value="archiveData.plantProps[selectPlantValue].progress"
                                            style="width:100%">
                                            <a-select-option :value="0">{{ t('locked') }}</a-select-option>
                                            <a-select-option :value="1">{{ t('available') }}</a-select-option>
                                            <a-select-option :value="2">{{ t('unlocked') }}</a-select-option>
                                        </a-select>
                                        <!-- 爆发充能开关 -->
                                        <a-flex gap="small" align="center">
                                            <span style="font-size:0.9em">{{ t('boost') }}:</span>
                                            <a-switch
                                                :checked="!!(archiveData.plantProps?.[selectPlantValue]?.boost)"
                                                @change="(val: boolean) => { if (archiveData.plantProps?.[selectPlantValue]) archiveData.plantProps[selectPlantValue].boost = val ? 1 : 0 }" />
                                        </a-flex>
                                        <!-- 奖章 -->
                                        <a-checkbox
                                            v-model:checked="archiveData.plantProps[selectPlantValue].medal">
                                            {{ t('medal') }}
                                        </a-checkbox>
                                        <!-- 删除 -->
                                        <a-button danger @click="removePlant(selectPlantValue)"
                                            style="width:100%">
                                            {{ t('delete') }}
                                        </a-button>
                                    </template>
                                    <!-- 植物不在存档中 -->
                                    <template v-else>
                                        <a-button type="primary" @click="addPlant(selectPlantValue)"
                                            style="width:100%">
                                            {{ t('add') }}
                                        </a-button>
                                    </template>
                                </a-flex>
                            </a-flex>
                        </a-form-item>
                    </a-collapse-panel>
                </a-collapse>

                <!-- 世界解锁 -->
                <a-collapse v-model:activeKey="activeKeys" :bordered="false">
                    <a-collapse-panel :key="'worlds'" :header="t('world unlock')">
                        <a-row v-if="archiveData.worldProps" :gutter="[12, 12]">
                            <template v-for="(world, worldID) in archiveData.worldProps" :key="worldID">
                                <a-col :span="8" v-if="world && world.hasOwnProperty && world.hasOwnProperty('unlocked')">
                                    <div class="world-card">
                                        <a-checkbox
                                            v-model:checked="archiveData.worldProps[worldID]['unlocked']">
                                            {{ t('world ' + worldID) }}
                                        </a-checkbox>
                                        <div v-if="world.endlessProps" style="margin-top:6px">
                                            <a-input-number size="small"
                                                :addon-before="t('endless level')"
                                                v-model:value="archiveData.worldProps[worldID].endlessProps.level"
                                                :min="1" style="width:100%" />
                                        </div>
                                    </div>
                                </a-col>
                            </template>
                        </a-row>
                    </a-collapse-panel>
                </a-collapse>

                <!-- 升级特性（用列表替代卡片，解决卡顿） -->
                <a-collapse v-model:activeKey="activeKeys" :bordered="false">
                    <a-collapse-panel :key="'upgrades'" :header="t('upgrades')">
                        <a-list v-if="archiveData.upgradeProps" :data-source="upgradeEntries" size="small"
                            bordered>
                            <template #renderItem="{ item }">
                                <a-list-item>
                                    <a-row style="width:100%" align="middle" :gutter="8">
                                        <a-col :span="7">
                                            <div style="font-weight:500; line-height:1.3">
                                                {{ upgradeList[item.id]?.NAME[i18nLanguage] ||
                                                    upgradeList[item.id]?.NAME.en }}
                                            </div>
                                            <div style="font-size:0.8em; color:#888; margin-top:2px">
                                                {{ t('obtain from') }}: {{ t('world ' +
                                                    upgradeList[item.id]?.OBTAINWORLD) }}
                                            </div>
                                        </a-col>
                                        <a-col :span="9"
                                            style="font-size:0.82em; color:#555; line-height:1.4">
                                            {{ upgradeList[item.id]?.DESCRIPTION[i18nLanguage] ||
                                                upgradeList[item.id]?.DESCRIPTION.en }}
                                        </a-col>
                                        <a-col :span="5">
                                            <a-select
                                                v-model:value="archiveData.upgradeProps[item.id].progress"
                                                style="width:100%">
                                                <a-select-option :value="0">{{ t('locked') }}</a-select-option>
                                                <a-select-option :value="1">{{ t('unlocked') }}</a-select-option>
                                                <a-select-option :value="2">{{ t('unlocked max') }}</a-select-option>
                                            </a-select>
                                        </a-col>
                                        <a-col :span="3" style="text-align:center">
                                            <a-switch
                                                v-model:checked="archiveData.upgradeProps[item.id].enabled"
                                                :disabled="archiveData.upgradeProps[item.id].progress === 0"
                                                :checked-children="t('enabled')"
                                                :un-checked-children="t('disabled')" />
                                        </a-col>
                                    </a-row>
                                </a-list-item>
                            </template>
                        </a-list>
                    </a-collapse-panel>
                </a-collapse>

                <!-- 引导进度 -->
                <a-collapse v-model:activeKey="activeKeys" :bordered="false">
                    <a-collapse-panel :key="'tutorial'" :header="t('tutorial')">
                        <a-flex v-if="archiveData.tutorial" gap="middle" align="center" wrap="wrap">
                            <a-button type="primary" @click="completeTutorial">
                                {{ t('complete tutorials') }}
                            </a-button>
                            <template v-for="(val, key) in archiveData.tutorial" :key="key">
                                <a-tag :color="val ? 'success' : 'default'" style="cursor:default">
                                    {{ key }}
                                </a-tag>
                            </template>
                        </a-flex>
                        <a-empty v-else :description="false" />
                    </a-collapse-panel>
                </a-collapse>

                <!-- 功能开关 -->
                <a-collapse v-model:activeKey="activeKeys" :bordered="false">
                    <a-collapse-panel :key="'features'" :header="t('features')">
                        <a-row v-if="archiveData.features" :gutter="[16, 12]">
                            <template v-for="(_, key) in archiveData.features" :key="key">
                                <a-col :span="8">
                                    <a-flex gap="small" align="center">
                                        <a-switch v-model:checked="archiveData.features[key]"
                                            :checked-children="t('enabled')"
                                            :un-checked-children="t('disabled')" />
                                        <span style="font-size:0.9em">{{ t(key) || key }}</span>
                                    </a-flex>
                                </a-col>
                            </template>
                        </a-row>
                        <a-empty v-else :description="false" />
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
import { message, theme } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import JSON5 from 'json5'

import { getPlantIdMap } from '../plantsAlmanac/formatPlants'

import upgradeJson from './UpgradeFeatures.json'
import versionJson from '../version.json'

import type { ArchiveData } from './types';

// 动态导入所有语言文件
const messages = Object.fromEntries(
    Object.entries(import.meta.glob('./locales/*.json', { eager: true }))
        .map(([key, value]) => {
            const locale = key.match(/\/([a-zA-Z-]+)\.json$/)?.[1];
            console.log(locale, value);
            return [locale, (value as { default: any }).default];
        })
);

const i18nLanguage = inject('i18nLanguage', 'en');

// 植物 ID→Plant 映射（用于构建选项）
const plantMap = getPlantIdMap(i18nLanguage);

// 植物下拉选项（按 ID 顺序，value = codename）
const plantOptions = Object.values(plantMap).map((p: any) => ({
    value: p.codename as string,
    label: (p.name || p.enName) as string,
}));

// codename → Plant 反查表（用于显示中文名/英文名）
const plantCodenameMap: Record<string, any> = Object.fromEntries(
    Object.values(plantMap).map((p: any) => [p.codename, p])
);

// 植物搜索过滤（支持中文名和 codename）
const plantFilterOption = (input: string, option: any) => {
    const q = input.toLowerCase();
    return option.label.toLowerCase().includes(q) || option.value.toLowerCase().includes(q);
};

// 世界 codename 表（按 WorldmapFeatures.json WORLDMAPS 数组索引 0-25）
const worldCodenames = [
    'chooser', 'egypt', 'pirate', 'cowboy', 'future', 'dark',
    'beach', 'iceage', 'lostcity', 'epic', 'eighties', 'dino',
    'modern', 'kongfu',
    'epic_egypt', 'epic_pirate', 'epic_cowboy', 'epic_future', 'epic_dark',
    'epic_beach', 'epic_iceage', 'epic_lostcity', 'epic_eighties', 'epic_dino',
    'epic_modern', 'epic_kongfu'
];
const worldAmount = worldCodenames.length; // 26

// 游戏版本 & 升级特性列表
const gameVersion = versionJson.gameVersion;
const upgradeList = upgradeJson.UPGRADES;

const { t, locale } = useI18n({
    locale: i18nLanguage,
    fallbackLocale: 'en',
    messages: messages
})
locale.value = i18nLanguage;

// 默认无尽关卡数据工厂（避免对象共享引用）
const makeEndlessProps = () => ({
    level: 1,
    obtainedPlants: [] as string[],
    plantfood: 0,
    mower: [true, true, true, true, true],
    initialPlants: [] as string[],
    plantChosen: false,
    plantsToChoose: null
});

// 初始化空存档模板
const defaultArchive = {
    name: "New Player",
    worldkey: 0,
    gem: 0,
    coin: 0,
    sprout: 0,
    plantProps: {} as Record<string, any>,
    worldProps: {
        ...Object.fromEntries(
            Array.from({ length: worldAmount }, (_, i) => [i, {
                unlocked: i === 1,
                wmx: 0,
                endlessProps: makeEndlessProps(),
                endlessMiniGameProps: { level: 1 }
            }])
        ),
        currentWM: 0,
        worldChooserPos: 1
    },
    upgradeProps: Object.fromEntries(
        Array.from({ length: upgradeList.length }, (_, i) => [i, { progress: 0, enabled: true }])
    ),
    tutorial: {
        plantfood: false,
        almanac_intro: false,
        store_open: false,
        store_intro: false,
        almanac_open: false,
        premium_light_up: false,
        premium_unlock: false,
        premium_bring_out: false,
        worldmap: false
    } as Record<string, boolean>,
    features: {
        feature_zengarden: false,
        feature_almanac: false,
        feature_coins: true,
        feature_worldmap: true,
        feature_worldkeys: false,
        feature_plantfood: true,
        feature_shovel: true,
        feature_powerup: false,
        feature_store: false
    } as Record<string, boolean>,
    version: gameVersion,
};

const archiveData = ref<ArchiveData>({});
const otherData = ref<Record<string, any>>({}); // 保存存档中其他未处理字段，确保下载时完整恢复
const selectPlantValue = ref<string>('');
const uploadVersion = ref('');
// 控制折叠面板的展开/收起状态（升级特性默认不展开，避免首次渲染卡顿）
const activeKeys = ref(['basic', 'plants', 'worlds', 'tutorial', 'features']);

// 升级列表条目（用于 a-list，避免直接 v-for 对象导致性能问题）
const upgradeEntries = computed(() =>
    archiveData.value.upgradeProps
        ? Object.entries(archiveData.value.upgradeProps).map(([id, data]) => ({ id, data }))
        : []
);

// 处理文件上传
const handleUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
        try {
            if (e.target === null || typeof e.target.result !== 'string') throw new Error('Invalid file');
            const data = JSON5.parse(e.target.result);
            // 记录上传版本
            uploadVersion.value = data.version;
            // 浅合并：用户数据优先，defaultArchive 补全缺失字段
            archiveData.value = { ...defaultArchive, ...data };
            // 保存 defaultArchive 中不存在的字段，下载时原样恢复
            otherData.value = Object.fromEntries(
                Object.entries(data).filter(([key]) => !(key in defaultArchive))
            );
        } catch (err) {
            message.error(t('parse error'));
            console.error(err);
        }
    };
    reader.readAsText(file);
    return false;
};

// 新建存档
const newArchive = () => {
    archiveData.value = { ...defaultArchive };
    uploadVersion.value = gameVersion;
    otherData.value = {};
};

// 清空存档
const clearArchive = () => {
    archiveData.value = {};
    otherData.value = {};
};

// 判断是否为旧版存档
const isOldArchive = computed(() => {
    if (!uploadVersion.value) return true;
    const [major, minor, patch] = uploadVersion.value.split('.').map(Number);
    const [currentMajor, currentMinor, currentPatch] = gameVersion.split('.').map(Number);
    if (major < currentMajor) return true;
    if (major === currentMajor && minor < currentMinor) return true;
    return major === currentMajor && minor === currentMinor && patch < currentPatch;
});

// 植物操作（key 使用 codename 字符串，与存档格式一致）
const addPlant = (codename: string) => {
    if (!codename) return;
    if (!archiveData.value.plantProps) {
        archiveData.value.plantProps = {};
    }
    if (!archiveData.value.plantProps[codename]) {
        archiveData.value.plantProps[codename] = {
            progress: 0,
            tutorialLevel: 0,
            costume: -1,
            costumes: [],
            boost: 0,
            medal: false
        };
    }
};

const removePlant = (codename: string) => {
    if (!codename) return;
    delete archiveData.value.plantProps?.[codename];
};

// 一键完成所有引导
const completeTutorial = () => {
    if (!archiveData.value.tutorial) return;
    Object.keys(archiveData.value.tutorial).forEach(key => {
        archiveData.value.tutorial![key] = true;
    });
    message.success(t('tutorials completed'));
};

// 保存存档（将 archiveData 与 otherData 合并后下载，保留所有原始字段）
const saveArchive = () => {
    archiveData.value.worldProgress?.sort((a: any, b: any) => a.worldID - b.worldID);
    const finalData = {
        ...archiveData.value,
        ...otherData.value   // otherData 覆盖在后，确保原始字段值被保留
    };
    const saveName = finalData.name || 'New Player';
    const blob = new Blob([JSON.stringify(finalData, null, 2)], {
        type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${saveName}.json`;
    a.click();
    URL.revokeObjectURL(url);
    message.success(t('save successfully'));
};
</script>

<style scoped>
p.plant-title {
    font-family: 'pvzgeFontEN', 'pvzgFont', sans-serif;
    font-size: x-large;
    margin-bottom: 2px;
}

.world-card {
    border: 1px solid #f0f0f0;
    border-radius: 6px;
    padding: 8px 10px;
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

/* 升级列表紧凑样式 */
:deep(.ant-list-item) {
    padding: 8px 12px;
}
</style>
