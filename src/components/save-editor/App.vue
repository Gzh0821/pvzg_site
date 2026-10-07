<template>
    <ClientOnly>
    <a-config-provider :theme="{
        token: {
            colorPrimary: $isDarkMode ? '#65d8cf' : '#08726c',
            borderRadius: 12,
            colorTextLightSolid: $isDarkMode ? '#062d2a' : '#fff',
            colorError: $isDarkMode ? '#ffa49c' : '#b24037',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
        },
        algorithm: $isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        components: {}
    }">
    <div class="save-editor-shell">
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
                <a-popconfirm :title="t('discard save question')" @confirm="clearArchive" :ok-text="t('clear save')" :cancel-text="t('cancel')">
                    <a-button danger :disabled="!Object.keys(archiveData).length">
                        <template #icon><delete-outlined /></template>
                        {{ t('clear save') }}
                    </a-button>
                </a-popconfirm>
            </div>
        </div>
        <a-alert v-if="validationErrors.length" :message="t('invalid save')" type="error" class="validation-alert">
            <template #description><ul><li v-for="error in validationErrors" :key="error">{{ error === 'save' ? t('save file required') : error }}</li></ul></template>
        </a-alert>
        <div v-if="Object.keys(archiveData).length" class="tool-content">
            <a-alert v-if="isOldArchive" :message="t('old version warning')" type="warning"
                style="margin-bottom:16px" />
            <a-form layout="vertical">
                <div class="summary-strip">
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

                <div class="editor-workspace">
                    <nav class="editor-nav" :aria-label="t('editor sections')">
                        <button v-for="section in sections" :key="section.id" type="button"
                            :class="{ active: activeSection === section.id }" :aria-current="activeSection === section.id ? 'page' : undefined"
                            :aria-controls="'save-section-' + section.id" @click="activeSection = section.id">
                            <component :is="section.icon" /><span>{{ t(section.label) }}</span>
                        </button>
                    </nav>
                    <div class="editor-main">
                        <h3 class="view-title">{{ t(sections.find(section => section.id === activeSection)!.label) }}</h3>
                        <section v-if="activeSection === 'basic'" class="editor-section" id="save-section-basic">
                            <a-form-item class="name-field">
                                <a-input :addon-before="t('save name')" v-model:value="archiveData.name" :aria-label="t('save name')"
                                    :placeholder="t('enter name')" />
                            </a-form-item>

                                <a-row :gutter="[16, 12]">
                                    <a-col :xs="24" :sm="12" :lg="12">
                                        <a-form-item>
                                            <a-input-number :addon-before="t('worldKey')" v-model:value="archiveData.worldkey" :aria-label="t('worldKey')"
                                                :min="0" style="width:100%" />
                                        </a-form-item>
                                    </a-col>
                                    <a-col :xs="24" :sm="12" :lg="12">
                                        <a-form-item>
                                            <a-input-number :addon-before="t('gem')" v-model:value="archiveData.gem" :aria-label="t('gem')" :min="0"
                                                style="width:100%" />
                                        </a-form-item>
                                    </a-col>
                                    <a-col :xs="24" :sm="12" :lg="12">
                                        <a-form-item>
                                            <a-input-number :addon-before="t('coin')" v-model:value="archiveData.coin" :aria-label="t('coin')" :min="0"
                                                style="width:100%" />
                                        </a-form-item>
                                    </a-col>
                                    <a-col :xs="24" :sm="12" :lg="12">
                                        <a-form-item>
                                            <a-input-number :addon-before="t('sprout')" v-model:value="archiveData.sprout" :aria-label="t('sprout')"
                                                :min="0" style="width:100%" />
                                        </a-form-item>
                                    </a-col>
                                </a-row>
                        </section>
                        <section v-if="activeSection === 'plants'" class="editor-section" id="save-section-plants">
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
                                        <a-button
                                            v-if="selectedPlantAlmanacPath"
                                            :href="selectedPlantAlmanacPath"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style="width:100%"
                                        >
                                            {{ t('view almanac') }} ↗
                                        </a-button>
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
                        </section>
                        <section v-if="activeSection === 'garden'" class="editor-section" id="save-section-garden">
                            <GardenEditor :zen="archiveData.zengarden" :features="gardenFeatures" :plant-options="plantOptions" :t="t" :editable="gardenEditable" />
                        </section>
                        <section v-if="activeSection === 'worlds'" class="editor-section" id="save-section-worlds">
                            <a-row v-if="archiveData.worldProps" :gutter="[12, 12]">
                                <template v-for="([worldID, world]) in worldEntries" :key="worldID">
                                    <a-col :xs="24" :sm="12" :lg="12">
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
                        </section>
                        <section v-if="activeSection === 'upgrades'" class="editor-section" id="save-section-upgrades">
                            <a-input-search v-model:value="upgradeQuery" :placeholder="t('search upgrades')"
                                allow-clear class="section-search" />
                            <a-list v-if="archiveData.player_upgrades" :data-source="upgradeEntries" size="small" bordered>
                                <template #renderItem="{ item }">
                                    <a-list-item>
                                        <a-row style="width:100%" align="middle" :gutter="8">
                                            <a-col :xs="24" :lg="7">
                                                <div class="upgrade-title">
                                                    {{ item.name }}
                                                </div>
                                                <div class="upgrade-meta">
                                                    {{ t('obtain from') }}: {{ t('world ' +
                                                        upgradeList[item.index]?.OBTAINWORLD) }}
                                                </div>
                                            </a-col>
                                            <a-col :xs="24" :lg="9" class="upgrade-desc">
                                                {{ item.description }}
                                            </a-col>
                                            <a-col :xs="16" :lg="5">
                                                <a-select v-model:value="archiveData.player_upgrades[item.id].progress"
                                                    style="width:100%">
                                                    <a-select-option :value="0">{{ t('upgrade progress locked') }}</a-select-option>
                                                    <a-select-option :value="1">{{ t('upgrade progress pending') }}</a-select-option>
                                                    <a-select-option :value="2">{{ t('upgrade progress obtained') }}</a-select-option>
                                                </a-select>
                                            </a-col>
                                            <a-col :xs="8" :lg="3" style="text-align:center">
                                                <a-switch v-model:checked="archiveData.player_upgrades[item.id].enabled"
                                                    :disabled="archiveData.player_upgrades[item.id].progress === 0"
                                                    :checked-children="t('enabled')" :un-checked-children="t('disabled')" />
                                            </a-col>
                                        </a-row>
                                    </a-list-item>
                                </template>
                            </a-list>
                        </section>
                        <section v-if="activeSection === 'daily'" class="editor-section" id="save-section-daily">
                            <div class="daily-grid">
                                <div class="daily-card" v-if="archiveData.arcade_plant_decoding">
                                    <div class="daily-card-title">{{ t('plant decoding') }}</div>
                                    <a-row :gutter="[12, 12]">
                                        <a-col :xs="24" :md="12">
                                            <a-flex gap="small" align="center" class="daily-switch-row">
                                                <a-switch v-model:checked="archiveData.arcade_plant_decoding.played_today"
                                                    :checked-children="t('enabled')"
                                                    :un-checked-children="t('disabled')" />
                                                <span>{{ t('played today') }}</span>
                                            </a-flex>
                                        </a-col>
                                        <a-col :xs="24" :md="12">
                                            <a-input-number :addon-before="t('gem today')"
                                                v-model:value="archiveData.arcade_plant_decoding.gem_today" :min="0"
                                                style="width:100%" />
                                        </a-col>
                                        <a-col :xs="24" :md="12">
                                            <a-input-number :addon-before="t('base count')"
                                                v-model:value="archiveData.arcade_plant_decoding.max_base_count" :min="3"
                                                :max="10" style="width:100%" />
                                        </a-col>
                                        <a-col :xs="24" :md="12">
                                            <a-input-number :addon-before="t('code count')"
                                                v-model:value="archiveData.arcade_plant_decoding.max_code_count" :min="3"
                                                :max="10" style="width:100%" />
                                        </a-col>
                                    </a-row>
                                    <div class="daily-actions">
                                        <a-button size="small" @click="resetArcadeDaily">
                                            {{ t('reset arcade daily') }}
                                        </a-button>
                                        <span class="daily-card-note">{{ t('arcade reward note') }}</span>
                                    </div>
                                </div>

                                <div class="daily-card">
                                    <div class="daily-card-title">{{ t('daily flags') }}</div>
                                    <a-flex gap="small" align="center" class="daily-switch-row">
                                        <a-switch v-model:checked="archiveData.yeti_spawned_today"
                                            :checked-children="t('enabled')" :un-checked-children="t('disabled')" />
                                        <span>{{ t('yeti spawned today') }}</span>
                                    </a-flex>
                                </div>
                            </div>
                        </section>
                        <section v-if="activeSection === 'advanced'" class="editor-section" id="save-section-advanced">
                            <div class="section-subheading"><h4>{{ t('features') }}</h4></div>
                            <div class="switch-list" v-if="archiveData.features">
                                <label v-for="([key]) in featureEntries" :key="key" class="switch-row">
                                    <span>{{ t(key) }}</span>
                                    <a-switch v-model:checked="archiveData.features[key]" :aria-label="t(key)" />
                                </label>
                            </div>
                        </section>
                    </div>
                </div>

                <div class="tool-footer">
                    <a-button :disabled="!history.length" @click="undo">{{ t('undo') }}</a-button>
                    <a-button :disabled="!changes.length" @click="previewOpen = true">{{ t('preview changes', { count: changes.length }) }}</a-button>
                    <a-button type="primary" size="large" @click="saveArchive">
                        <template #icon><save-outlined /></template>
                        {{ t('save to local') }}
                    </a-button>
                </div>
            </a-form>
        </div>
        <div v-else class="empty-state">
            <div class="empty-symbol"><FileAddOutlined /></div>
            <h3>{{ t('empty title') }}</h3>
            <p>{{ t('empty description') }}</p>
        </div>
    </div>
    <a-modal v-model:open="previewOpen" :title="t('changes title')" :footer="null" width="min(900px, 95vw)">
        <div class="change-list">
            <details v-for="change in changes" :key="change.path">
                <summary>{{ change.path }}</summary>
                <p>{{ t('before') }}</p><pre>{{ displayValue(change.before) }}</pre>
                <p>{{ t('after') }}</p><pre>{{ displayValue(change.after) }}</pre>
            </details>
        </div>
    </a-modal>
    </a-config-provider>
    </ClientOnly>
</template>

<script lang="ts" setup>
import { ref, computed, inject, watch } from 'vue'
import { ClientOnly } from 'vuepress/client'
import { message, theme } from 'ant-design-vue'
import { DeleteOutlined, FileAddOutlined, SaveOutlined, UploadOutlined, WalletOutlined, AppstoreOutlined, ExperimentOutlined, GlobalOutlined, GiftOutlined, CalendarOutlined, SettingOutlined } from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'
import JSON5 from 'json5'

import { trackEvent } from '../analytics'
import { getAlmanacEntityPath } from '../almanac-v2/almanac-routes'
import { getPlantIdMap } from '../plantsAlmanac/formatPlants'

import { upgradeJson } from '../game-data/upgrades'
import { trophyJson } from '../game-data/trophies'
import versionJson from '../version.json'

import GardenEditor from './GardenEditor.vue';
import gardenLayout from './garden-layout.json';
import { plantFeaturesJson } from '../game-data/plants';
import { validateSave, gardenIssues, diffSave } from './save-state.mjs';

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
const gardenFeatures = Object.fromEntries(plantFeaturesJson.PLANTS.map(plant => [plant.CODENAME, plant]));
const upgradeList = upgradeJson.UPGRADES;
const trophyList = trophyJson.TROPHIES;

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

const makeArcadePlantDecoding = () => ({
    played_today: false,
    gem_today: 0,
    max_base_count: 5,
    max_code_count: 4
});

const makeDateState = () => ({
    date: 1,
    month: 1,
    year: 1,
    hour: 0,
    minute: 0,
    second: 0,
    plantCostumeToday: [] as any[]
});

const makeZenGardenState = () => ({
    sprout: 0,
    plantsInMain: [] as any[],
    plantsInMushroom: [] as any[],
    plantsInBeach: [] as any[],
    plantsInNight: [] as any[],
    plantInCart: null
});

// 初始化空存档模板
const defaultArchive = {
    name: "New Player",
    forceLevel: 'tutorial1',
    worldkey: 0,
    gem: 0,
    coin: 0,
    sprout: 0,
    time: 0,
    date: makeDateState(),
    difficulty: 3,
    plantProps: {} as Record<string, any>,
    zombieProps: {} as Record<string, any>,
    player_trophies: {} as Record<string, any>,
    levelProps: {} as Record<string, any>,
    worldProgress: [] as any[],
    cardDecks: [] as any[],
    memoryPlantChoose: [] as any[],
    zengarden: makeZenGardenState(),
    arcade_plant_decoding: makeArcadePlantDecoding(),
    yeti_spawned_today: false,
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
    player_upgrades: Object.fromEntries(
        upgradeList.map((upgrade: any) => [upgrade.CODENAME, { progress: 0, enabled: true }])
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
        worldmap: false,
        worldkey: false,
        zengarden_open: false,
        zengarden_intro: false
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

const handledSaveKeys = new Set(Object.keys(defaultArchive));
const legacySaveKeys = new Set(['upgradeProps', 'trophyProps', 'obtainedUpgrades', 'obtainedTrophies']);

const archiveData = ref<ArchiveData>({});
const otherData = ref<Record<string, any>>({}); // 保存存档中其他未处理字段，确保下载时完整恢复
const selectPlantValue = ref<string>('');
const selectedPlantAlmanacPath = computed(() => (
    selectPlantValue.value
        ? getAlmanacEntityPath('plant', selectPlantValue.value, String(i18nLanguage))
        : null
));
const uploadVersion = ref('');
const upgradeQuery = ref('');
const activeSection = ref('basic');
const sections = [
    { id: 'basic', label: 'basic resources', icon: WalletOutlined },
    { id: 'plants', label: 'edit plants', icon: AppstoreOutlined },
    { id: 'garden', label: 'garden editor', icon: ExperimentOutlined },
    { id: 'worlds', label: 'world unlock', icon: GlobalOutlined },
    { id: 'upgrades', label: 'upgrades', icon: GiftOutlined },
    { id: 'daily', label: 'daily state', icon: CalendarOutlined },
    { id: 'advanced', label: 'features', icon: SettingOutlined }
];

const originalData = ref<Record<string, any>>({});
const history = ref<string[]>([]);
const previewOpen = ref(false);
const validationErrors = ref<string[]>([]);
let lastSnapshot = '{}';
const snapshot = () => JSON.stringify({ archive: archiveData.value, other: otherData.value });
const beginSession = (original: Record<string, any>) => {
    originalData.value = JSON.parse(JSON.stringify(original));
    history.value = [];
    activeSection.value = 'basic';
    lastSnapshot = snapshot();
    validationErrors.value = [];
};
watch(snapshot, (next) => {
    if (next === lastSnapshot) return;
    history.value.push(lastSnapshot);
    if (history.value.length > 50) history.value.shift();
    lastSnapshot = next;
    validationErrors.value = [];
});
const undo = () => {
    const previous = history.value.pop();
    if (!previous) return;
    const state = JSON.parse(previous);
    lastSnapshot = previous;
    archiveData.value = state.archive;
    otherData.value = state.other;
    validationErrors.value = [];
};
const finalData = computed(() => ({ ...otherData.value, ...archiveData.value }));
const changes = computed(() => diffSave(originalData.value, finalData.value));
const displayValue = (value: any) => value === undefined ? '—' : JSON.stringify(value);
const gardenEditable = computed(() => archiveData.value.version === gardenLayout.version);
const checkSave = (data: Record<string, any>) => {
    const errors = validateSave(data);
    if (!errors.length && data.version === gardenLayout.version) errors.push(...gardenIssues(data.zengarden, gardenLayout.slots, gardenFeatures));
    return errors;
};

const cloneDefaultArchive = () => structuredClone(defaultArchive) as ArchiveData;

const clampInteger = (value: any, min: number, max: number, fallback: number) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(max, Math.max(min, Math.trunc(parsed)));
};

const isRecord = (value: any): value is Record<string, any> =>
    value && typeof value === 'object' && !Array.isArray(value);

const resolveFeatureCodename = (key: any, featureList: any[]) => {
    const keyText = String(key);
    if (featureList.some((entry: any) => entry.CODENAME === keyText)) return keyText;
    const index = Number(keyText);
    if (Number.isInteger(index) && index >= 0 && index < featureList.length) {
        return featureList[index]?.CODENAME || null;
    }
    return null;
};

const normalizeUpgradeData = (value: any) => ({
    ...value,
    progress: clampInteger(value?.progress, 0, 2, 0),
    enabled: value?.enabled === false ? false : true
});

const normalizeTrophyData = (value: any) => ({
    ...value,
    progress: clampInteger(value?.progress, 0, 2, 0)
});

const applyProgressObject = (
    target: Record<string, any>,
    source: any,
    featureList: any[],
    normalize: (value: any) => any
) => {
    if (!isRecord(source)) return;
    Object.entries(source).forEach(([key, value]) => {
        const codename = resolveFeatureCodename(key, featureList);
        if (codename) target[codename] = normalize(value);
    });
};

const applyLegacyProgressArray = (
    target: Record<string, any>,
    source: any,
    idKey: string,
    featureList: any[],
    normalize: (value: any) => any
) => {
    if (!Array.isArray(source)) return;
    source.forEach(value => {
        const codename = resolveFeatureCodename(value?.[idKey], featureList);
        if (codename) target[codename] = normalize(value);
    });
};

const normalizePlayerUpgrades = (data: Record<string, any>) => {
    const result = { ...(data.player_upgrades || {}), ...Object.fromEntries(
        upgradeList.map((upgrade: any) => [upgrade.CODENAME, { progress: 0, enabled: true }])
    ) };
    applyLegacyProgressArray(result, data.obtainedUpgrades, 'upgradeID', upgradeList, normalizeUpgradeData);
    applyProgressObject(result, data.upgradeProps, upgradeList, normalizeUpgradeData);
    applyProgressObject(result, data.player_upgrades, upgradeList, normalizeUpgradeData);
    return result;
};

const normalizePlayerTrophies = (data: Record<string, any>) => {
    const result: Record<string, any> = { ...(data.player_trophies || {}) };
    applyLegacyProgressArray(result, data.obtainedTrophies, 'trophyID', trophyList, normalizeTrophyData);
    applyProgressObject(result, data.trophyProps, trophyList, normalizeTrophyData);
    applyProgressObject(result, data.player_trophies, trophyList, normalizeTrophyData);
    return result;
};

const normalizeArcadePlantDecoding = (data?: Record<string, any> | null) => {
    const base = makeArcadePlantDecoding();
    const source = (data && typeof data === 'object') ? data : {};
    return {
        ...base,
        ...source,
        played_today: Boolean(source.played_today ?? base.played_today),
        gem_today: Math.max(0, Math.trunc(Number(source.gem_today ?? base.gem_today) || 0)),
        max_base_count: clampInteger(source.max_base_count, 3, 10, base.max_base_count),
        max_code_count: clampInteger(source.max_code_count, 3, 10, base.max_code_count)
    };
};

const mergeObject = (base: any, value: any) => ({
    ...(base || {}),
    ...((value && typeof value === 'object' && !Array.isArray(value)) ? value : {})
});

const normalizeArchive = (data: Record<string, any> = {}) => {
    const base = cloneDefaultArchive();
    const currentData = { ...data };
    legacySaveKeys.forEach(key => delete currentData[key]);
    return {
        ...base,
        ...currentData,
        plantProps: { ...(base.plantProps || {}), ...(data.plantProps || {}) },
        worldProps: { ...(base.worldProps || {}), ...(data.worldProps || {}) },
        player_upgrades: normalizePlayerUpgrades(data),
        tutorial: { ...(base.tutorial || {}), ...(data.tutorial || {}) },
        features: { ...(base.features || {}), ...(data.features || {}) },
        date: mergeObject(base.date, data.date),
        zombieProps: mergeObject(base.zombieProps, data.zombieProps),
        player_trophies: normalizePlayerTrophies(data),
        levelProps: mergeObject(base.levelProps, data.levelProps),
        zengarden: mergeObject(base.zengarden, data.zengarden),
        worldProgress: Array.isArray(data.worldProgress) ? data.worldProgress : base.worldProgress,
        cardDecks: Array.isArray(data.cardDecks) ? data.cardDecks : base.cardDecks,
        memoryPlantChoose: Array.isArray(data.memoryPlantChoose) ? data.memoryPlantChoose : base.memoryPlantChoose,
        arcade_plant_decoding: normalizeArcadePlantDecoding(data.arcade_plant_decoding),
        yeti_spawned_today: Boolean(data.yeti_spawned_today ?? base.yeti_spawned_today)
    } as ArchiveData;
};

const localizedText = (entry: any, key: 'NAME' | 'DESCRIPTION') =>
    entry?.[key]?.[i18nLanguage as string] || entry?.[key]?.en || '';

// 升级列表条目（用于 a-list，避免直接 v-for 对象导致性能问题）
const upgradeEntries = computed(() => {
    if (!archiveData.value.player_upgrades) return [];
    const query = upgradeQuery.value.trim().toLowerCase();
    return upgradeList
        .map((entry: any, index: number) => {
            const id = entry.CODENAME;
            return {
                id,
                index,
                data: archiveData.value.player_upgrades?.[id],
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

const ownedPlantCount = computed(() => Object.values(archiveData.value.plantProps || {}).filter(plant => plant.progress === 2).length);
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
            const errors = checkSave(data);
            if (errors.length) {
                validationErrors.value = errors;
                message.error(t('invalid save'));
                return;
            }
            // 记录上传版本
            uploadVersion.value = data.version;
            archiveData.value = normalizeArchive(data);
            // 保存 defaultArchive 中不存在的字段，下载时原样恢复
            otherData.value = Object.fromEntries(
                Object.entries(data).filter(([key]) => !handledSaveKeys.has(key) && !legacySaveKeys.has(key))
            );
            beginSession(data);
        } catch (err) {
            message.error(t('parse error'));
            console.error(err);
        }
    };
    reader.onerror = () => message.error(t('parse error'));
    reader.readAsText(file);
    return false;
};

// 新建存档
const newArchive = () => {
    archiveData.value = cloneDefaultArchive();
    uploadVersion.value = gameVersion;
    otherData.value = {};
    beginSession(finalData.value);
};

// 清空存档
const clearArchive = () => {
    archiveData.value = {};
    otherData.value = {};
    uploadVersion.value = '';
    beginSession({});
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

const resetArcadeDaily = () => {
    const arcade = normalizeArcadePlantDecoding(archiveData.value.arcade_plant_decoding);
    arcade.played_today = false;
    arcade.gem_today = 0;
    archiveData.value.arcade_plant_decoding = arcade;
    message.success(t('arcade daily reset'));
};

// 保存存档（将 archiveData 与 otherData 合并后下载，保留所有原始字段）
const saveArchive = () => {
    const exportedData = {
        ...otherData.value,
        ...archiveData.value
    };
    legacySaveKeys.forEach(key => delete (exportedData as Record<string, any>)[key]);
    validationErrors.value = checkSave(exportedData);
    if (validationErrors.value.length) { message.error(t('invalid save')); return; }
    const saveName = exportedData.name || 'New Player';
    const blob = new Blob([JSON.stringify(exportedData, null, 2)], {
        type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${saveName}.json`;
    a.click();
    URL.revokeObjectURL(url);
    trackEvent('tool_complete', {
        tool_action: 'export',
        tool_name: 'save_editor'
    });
    message.success(t('save successfully'));
};
</script>

<style scoped src="./editor.css"></style>
