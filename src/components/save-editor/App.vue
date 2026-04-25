<template>
    <a-config-provider :theme="{
        token: {
            colorPrimary: '#aa6f42'
        },
        algorithm: $isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        components: {}
    }"></a-config-provider>
    <a-layout class="save-editor-shell">
        <div class="tool-header">
            <div class="tool-title-block">
                <a-typography-title :level="2" class="tool-title">{{ t('title') }}</a-typography-title>
                <a-typography-text type="secondary">{{ t('game version', { version: gameVersion }) }}</a-typography-text>
            </div>
            <div class="save-actions">
                <a-upload :before-upload="handleUpload" accept=".json" :showUploadList="false">
                    <a-button type="primary">
                        <template #icon><upload-outlined /></template>
                        {{ t('upload save') }}
                    </a-button>
                </a-upload>
                <a-button @click="newArchive">
                    <template #icon><file-add-outlined /></template>
                    {{ t('new save') }}
                </a-button>
                <a-button @click="clearArchive" danger>
                    <template #icon><delete-outlined /></template>
                    {{ t('clear save') }}
                </a-button>
            </div>
        </div>
        <a-layout-content v-if="Object.keys(archiveData).length" class="tool-content">
            <a-alert v-if="isOldArchive" :message="t('old version warning')" type="warning"
                style="margin-bottom:16px" />
            <a-form layout="vertical">
                <div class="summary-strip">
                    <a-form-item class="name-field">
                        <a-input :addon-before="t('save name')" v-model:value="archiveData.name"
                            :placeholder="t('enter name')" />
                    </a-form-item>
                    <div class="summary-pill">
                        <strong>{{ ownedPlantCount }}</strong>
                        <span>{{ t('plants owned') }}</span>
                    </div>
                    <div class="summary-pill">
                        <strong>{{ unlockedWorldCount }}</strong>
                        <span>{{ t('worlds unlocked') }}</span>
                    </div>
                    <div class="summary-pill">
                        <strong>{{ enabledFeatureCount }}</strong>
                        <span>{{ t('features enabled') }}</span>
                    </div>
                </div>

                <a-collapse v-model:activeKey="activeKeys" :bordered="false" :destroy-inactive-panel="true">
                    <a-collapse-panel :key="'basic'" :header="t('basic resources')">
                        <a-row :gutter="[16, 12]">
                            <a-col :xs="24" :sm="12" :lg="6">
                                <a-form-item>
                                    <a-input-number :addon-before="t('worldKey')" v-model:value="archiveData.worldkey"
                                        :min="0" style="width:100%" />
                                </a-form-item>
                            </a-col>
                            <a-col :xs="24" :sm="12" :lg="6">
                                <a-form-item>
                                    <a-input-number :addon-before="t('gem')" v-model:value="archiveData.gem" :min="0"
                                        style="width:100%" />
                                </a-form-item>
                            </a-col>
                            <a-col :xs="24" :sm="12" :lg="6">
                                <a-form-item>
                                    <a-input-number :addon-before="t('coin')" v-model:value="archiveData.coin" :min="0"
                                        style="width:100%" />
                                </a-form-item>
                            </a-col>
                            <a-col :xs="24" :sm="12" :lg="6">
                                <a-form-item>
                                    <a-input-number :addon-before="t('sprout')" v-model:value="archiveData.sprout"
                                        :min="0" style="width:100%" />
                                </a-form-item>
                            </a-col>
                        </a-row>
                    </a-collapse-panel>

                    <a-collapse-panel :key="'plants'" :header="t('edit plants')">
                        <a-form-item>
                            <a-flex justify="center" class="plant-search-row">
                                <a-select v-model:value="selectPlantValue" show-search allow-clear
                                    :placeholder="t('select plant')" :options="plantOptions"
                                    :filter-option="plantFilterOption" style="width: min(100%, 420px)" />
                            </a-flex>
                            <a-flex v-if="selectPlantValue && plantCodenameMap[selectPlantValue]" justify="center"
                                align="center" class="plant-editor-card">
                                <a-flex vertical align="center" class="plant-preview">
                                    <img class="plant-image" alt="plant"
                                        :src="'/assets/image/plants/plants_' + selectPlantValue + '_c.webp'" />
                                    <p class="plant-title">{{
                                        plantCodenameMap[selectPlantValue]?.name ||
                                        plantCodenameMap[selectPlantValue]?.enName ||
                                        selectPlantValue
                                    }}</p>
                                    <p class="muted-code">{{ selectPlantValue }}</p>
                                </a-flex>
                                <a-flex vertical gap="small" class="plant-controls">
                                    <template v-if="archiveData.plantProps && archiveData.plantProps[selectPlantValue]">
                                        <a-select v-model:value="archiveData.plantProps[selectPlantValue].progress"
                                            style="width:100%">
                                            <a-select-option :value="0">{{ t('locked') }}</a-select-option>
                                            <a-select-option :value="1">{{ t('available') }}</a-select-option>
                                            <a-select-option :value="2">{{ t('unlocked') }}</a-select-option>
                                        </a-select>
                                        <a-flex gap="small" align="center">
                                            <span style="font-size:0.9em">{{ t('boost') }}:</span>
                                            <a-switch :checked="!!(archiveData.plantProps?.[selectPlantValue]?.boost)"
                                                @change="(val: boolean) => { if (archiveData.plantProps?.[selectPlantValue]) archiveData.plantProps[selectPlantValue].boost = val ? 1 : 0 }" />
                                        </a-flex>
                                        <!-- 奖章 -->
                                        <a-checkbox v-model:checked="archiveData.plantProps[selectPlantValue].medal">
                                            {{ t('medal') }}
                                        </a-checkbox>
                                        <a-button danger @click="removePlant(selectPlantValue)" style="width:100%">
                                            {{ t('delete') }}
                                        </a-button>
                                    </template>
                                    <template v-else>
                                        <a-button type="primary" @click="addPlant(selectPlantValue)" style="width:100%">
                                            {{ t('add') }}
                                        </a-button>
                                    </template>
                                </a-flex>
                            </a-flex>
                        </a-form-item>
                    </a-collapse-panel>

                    <a-collapse-panel :key="'worlds'" :header="t('world unlock')">
                        <a-row v-if="archiveData.worldProps" :gutter="[12, 12]">
                            <template v-for="([worldID, world]) in worldEntries" :key="worldID">
                                <a-col :xs="24" :sm="12" :lg="8">
                                    <div class="world-card">
                                        <a-checkbox v-model:checked="archiveData.worldProps[worldID]['unlocked']">
                                            {{ t('world ' + worldID) }}
                                        </a-checkbox>
                                        <div v-if="world.endlessProps" style="margin-top:6px">
                                            <a-input-number size="small" :addon-before="t('endless level')"
                                                v-model:value="archiveData.worldProps[worldID].endlessProps.level"
                                                :min="1" style="width:100%" />
                                        </div>
                                    </div>
                                </a-col>
                            </template>
                        </a-row>
                    </a-collapse-panel>

                    <a-collapse-panel :key="'upgrades'" :header="t('upgrades')">
                        <a-input-search v-model:value="upgradeQuery" :placeholder="t('search upgrades')"
                            allow-clear class="section-search" />
                        <a-list v-if="archiveData.upgradeProps" :data-source="upgradeEntries" size="small" bordered>
                            <template #renderItem="{ item }">
                                <a-list-item>
                                    <a-row style="width:100%" align="middle" :gutter="8">
                                        <a-col :xs="24" :lg="7">
                                            <div class="upgrade-title">
                                                {{ item.name }}
                                            </div>
                                            <div class="upgrade-meta">
                                                {{ t('obtain from') }}: {{ t('world ' +
                                                    upgradeList[item.id]?.OBTAINWORLD) }}
                                            </div>
                                        </a-col>
                                        <a-col :xs="24" :lg="9" class="upgrade-desc">
                                            {{ item.description }}
                                        </a-col>
                                        <a-col :xs="16" :lg="5">
                                            <a-select v-model:value="archiveData.upgradeProps[item.id].progress"
                                                style="width:100%">
                                                <a-select-option :value="0">{{ t('upgrade progress locked') }}</a-select-option>
                                                <a-select-option :value="1">{{ t('upgrade progress pending') }}</a-select-option>
                                                <a-select-option :value="2">{{ t('upgrade progress obtained') }}</a-select-option>
                                            </a-select>
                                        </a-col>
                                        <a-col :xs="8" :lg="3" style="text-align:center">
                                            <a-switch v-model:checked="archiveData.upgradeProps[item.id].enabled"
                                                :disabled="archiveData.upgradeProps[item.id].progress === 0"
                                                :checked-children="t('enabled')" :un-checked-children="t('disabled')" />
                                        </a-col>
                                    </a-row>
                                </a-list-item>
                            </template>
                        </a-list>
                    </a-collapse-panel>

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

                    <a-collapse-panel :key="'features'" :header="t('features')">
                        <a-row v-if="archiveData.features" :gutter="[16, 12]">
                            <template v-for="([key]) in featureEntries" :key="key">
                                <a-col :xs="24" :sm="12" :lg="8">
                                    <a-flex gap="small" align="center">
                                        <a-switch v-model:checked="archiveData.features[key]"
                                            :checked-children="t('enabled')" :un-checked-children="t('disabled')" />
                                        <span style="font-size:0.9em">{{ t(key) || key }}</span>
                                    </a-flex>
                                </a-col>
                            </template>
                        </a-row>
                        <a-empty v-else :description="false" />
                    </a-collapse-panel>
                </a-collapse>

                <div class="tool-footer">
                    <a-button type="primary" size="large" @click="saveArchive">
                        <template #icon><save-outlined /></template>
                        {{ t('save to local') }}
                    </a-button>
                </div>
            </a-form>
        </a-layout-content>
        <a-layout-content v-else class="empty-state">
            <a-empty :description="t('empty description')" />
        </a-layout-content>
    </a-layout>
</template>

<script lang="ts" setup>
import { ref, computed, inject } from 'vue'
import { message, theme } from 'ant-design-vue'
import { DeleteOutlined, FileAddOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons-vue'
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

// 世界 codename 表（按 WorldmapFeatures.json WORLDMAPS 数组索引 0-27）
const worldCodenames = [
    'chooser', 'egypt', 'pirate', 'cowboy', 'future', 'dark',
    'beach', 'iceage', 'lostcity', 'epic', 'eighties', 'dino',
    'modern', 'kongfu',
    'epic_egypt', 'epic_pirate', 'epic_cowboy', 'epic_future', 'epic_dark',
    'epic_beach', 'epic_iceage', 'epic_lostcity', 'epic_eighties', 'epic_dino',
    'epic_modern', 'epic_kongfu',
    'sky', 'epic_sky'
];
const worldAmount = worldCodenames.length;

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
        feature_store: false,
        feature_plantfood_purchase: false
    } as Record<string, boolean>,
    version: gameVersion,
};

const archiveData = ref<ArchiveData>({});
const otherData = ref<Record<string, any>>({}); // 保存存档中其他未处理字段，确保下载时完整恢复
const selectPlantValue = ref<string>('');
const uploadVersion = ref('');
const upgradeQuery = ref('');
// 控制折叠面板的展开/收起状态（升级特性默认不展开，避免首次渲染卡顿）
const activeKeys = ref(['basic', 'plants', 'worlds', 'tutorial', 'features']);

const cloneDefaultArchive = () => structuredClone(defaultArchive) as ArchiveData;

const normalizeArchive = (data: Record<string, any> = {}) => {
    const base = cloneDefaultArchive();
    return {
        ...base,
        ...data,
        plantProps: { ...(base.plantProps || {}), ...(data.plantProps || {}) },
        worldProps: { ...(base.worldProps || {}), ...(data.worldProps || {}) },
        upgradeProps: { ...(base.upgradeProps || {}), ...(data.upgradeProps || {}) },
        tutorial: { ...(base.tutorial || {}), ...(data.tutorial || {}) },
        features: { ...(base.features || {}), ...(data.features || {}) }
    } as ArchiveData;
};

const localizedText = (entry: any, key: 'NAME' | 'DESCRIPTION') =>
    entry?.[key]?.[i18nLanguage as string] || entry?.[key]?.en || '';

// 升级列表条目（用于 a-list，避免直接 v-for 对象导致性能问题）
const upgradeEntries = computed(() => {
    if (!archiveData.value.upgradeProps) return [];
    const query = upgradeQuery.value.trim().toLowerCase();
    return Object.entries(archiveData.value.upgradeProps)
        .map(([id, data]) => {
            const entry = upgradeList[Number(id)];
            return {
                id,
                data,
                name: localizedText(entry, 'NAME'),
                description: localizedText(entry, 'DESCRIPTION')
            };
        })
        .filter(item => !query
            || item.name.toLowerCase().includes(query)
            || item.description.toLowerCase().includes(query)
            || item.id.includes(query));
});

const worldEntries = computed(() =>
    Object.entries(archiveData.value.worldProps || {})
        .filter(([, world]) => world && Object.prototype.hasOwnProperty.call(world, 'unlocked'))
);

const featureEntries = computed(() => Object.entries(archiveData.value.features || {}));

const ownedPlantCount = computed(() => Object.keys(archiveData.value.plantProps || {}).length);
const unlockedWorldCount = computed(() =>
    worldEntries.value.filter(([, world]) => Boolean(world.unlocked)).length
);
const enabledFeatureCount = computed(() =>
    featureEntries.value.filter(([, enabled]) => Boolean(enabled)).length
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
            archiveData.value = normalizeArchive(data);
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
    archiveData.value = cloneDefaultArchive();
    uploadVersion.value = gameVersion;
    otherData.value = {};
};

// 清空存档
const clearArchive = () => {
    archiveData.value = {};
    otherData.value = {};
    uploadVersion.value = '';
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
.save-editor-shell {
    container-type: inline-size;
    max-width: 1120px;
    margin: 1.5rem auto;
    border: 1px solid rgba(170, 111, 66, 0.16);
    border-radius: 10px;
    background: color-mix(in srgb, var(--bg-color, #fff) 94%, #aa6f42 6%);
    box-shadow: 0 10px 30px rgba(64, 38, 18, 0.08);
    overflow: hidden;
}

.tool-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 18px 20px;
    font-family: 'pvzgeFontEN', 'pvzgFont', sans-serif;
    border-bottom: 1px solid rgba(170, 111, 66, 0.14);
}

.tool-title-block {
    flex: 1 1 280px;
    min-width: 0;
}

.tool-title {
    font-family: 'pvzgeFontEN', 'pvzgFont', sans-serif !important;
    margin-bottom: 4px !important;
    line-height: 1.22 !important;
    white-space: normal;
    overflow-wrap: anywhere;
}

.save-actions {
    display: grid;
    grid-template-columns: repeat(3, max-content);
    gap: 8px;
    justify-content: end;
    align-items: start;
}

.save-actions :deep(.ant-upload),
.save-actions :deep(.ant-upload-wrapper),
.save-actions :deep(.ant-upload-select) {
    width: 100%;
}

.save-actions :deep(.ant-btn) {
    min-height: 36px;
    height: auto;
    white-space: normal;
    text-align: center;
}

.tool-content {
    padding: 20px;
}

.summary-strip {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
    align-items: stretch;
    margin-bottom: 16px;
}

.name-field {
    grid-column: 1 / -1;
    margin: 0;
}

.summary-pill {
    min-width: 120px;
    padding: 8px 12px;
    border: 1px solid rgba(170, 111, 66, 0.16);
    border-radius: 8px;
    background: rgba(170, 111, 66, 0.06);
}

.summary-pill strong {
    display: block;
    color: #8b572f;
    font-size: 1.2rem;
    line-height: 1.1;
}

.summary-pill span {
    color: #7a6a5e;
    font-size: 0.82rem;
}

p.plant-title {
    font-family: 'pvzgeFontEN', 'pvzgFont', sans-serif;
    font-size: x-large;
    text-align: center;
    margin: 4px 0 2px;
}

.plant-search-row {
    margin-bottom: 16px;
}

.plant-editor-card {
    width: 100%;
    flex-wrap: wrap;
    gap: 32px;
    padding: 18px;
    border: 1px solid rgba(170, 111, 66, 0.14);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.45);
}

.plant-preview {
    min-width: 110px;
    max-width: 150px;
}

.plant-image {
    width: 120px;
    height: 120px;
    object-fit: contain;
}

.plant-controls {
    min-width: 220px;
    max-width: 320px;
}

.muted-code {
    color: #888;
    font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    font-size: 0.82em;
    margin: 0;
}

.world-card {
    height: 100%;
    border: 1px solid rgba(170, 111, 66, 0.16);
    border-radius: 6px;
    padding: 8px 10px;
    background: rgba(255, 255, 255, 0.38);
}

.section-search {
    max-width: 360px;
    margin-bottom: 12px;
}

.upgrade-title {
    font-weight: 600;
    line-height: 1.3;
}

.upgrade-meta {
    color: #888;
    font-size: 0.8em;
    margin-top: 2px;
}

.upgrade-desc {
    color: #555;
    font-size: 0.82em;
    line-height: 1.45;
}

.tool-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 16px;
}

.empty-state {
    padding: 56px 20px;
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

:deep(.ant-motion-collapse),
:deep(.ant-motion-collapse-active) {
    transition: none !important;
}

/* 升级列表紧凑样式 */
:deep(.ant-list-item) {
    padding: 8px 12px;
}

@media (max-width: 760px) {
    .save-editor-shell {
        margin: 0.75rem 0;
        border-radius: 8px;
    }

    .summary-strip {
        grid-template-columns: 1fr;
    }

    .tool-header {
        flex-direction: column;
        justify-content: flex-start;
        padding: 16px 14px;
    }

    .tool-title-block,
    .save-actions {
        width: 100%;
    }

    .tool-title-block {
        flex: none;
    }

    .tool-title {
        font-size: 1.35rem;
        line-height: 1.25;
    }

    .save-actions {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    }

    .save-actions :deep(.ant-btn) {
        width: 100%;
    }

    .tool-content {
        padding: 14px;
    }
}

@container (max-width: 760px) {
    .tool-header {
        flex-direction: column;
        justify-content: flex-start;
        padding: 16px 14px;
    }

    .tool-title-block,
    .save-actions {
        width: 100%;
    }

    .tool-title-block {
        flex: none;
    }

    .tool-title {
        font-size: 1.35rem;
        line-height: 1.25;
    }

    .save-actions {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    }

    .save-actions :deep(.ant-btn) {
        width: 100%;
    }
}
</style>
