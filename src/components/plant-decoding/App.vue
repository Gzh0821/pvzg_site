<template>
    <a-config-provider :theme="{
        token: {
            colorPrimary: '#0d9488'
        },
        algorithm: $isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        components: {}
    }">
    <section class="decoding-shell">
        <header class="tool-header">
            <div class="title-block">
                <a-typography-title :level="1" class="tool-title">{{ t('title') }}</a-typography-title>
            </div>
            <div class="stats-row">
                <div class="stat-pill">
                    <strong>{{ activeBasePlants.length }}</strong>
                    <span>{{ t('basePlants') }}</span>
                </div>
                <div class="stat-pill">
                    <strong>{{ secretRules.length }}</strong>
                    <span>{{ t('codeSlots') }}</span>
                </div>
                <div class="stat-pill" :class="{ solved }">
                    <strong>{{ step }}</strong>
                    <span>{{ t('attempts') }}</span>
                </div>
            </div>
        </header>

        <div class="control-band">
            <label class="number-control">
                <span>{{ t('baseCount') }}</span>
                <a-input-number v-model:value="baseCount" size="small" :min="3" :max="10" />
            </label>
            <label class="number-control">
                <span>{{ t('codeCount') }}</span>
                <a-input-number v-model:value="codeCount" size="small" :min="3" :max="10" />
            </label>
            <a-segmented
                v-model:value="viewMode"
                class="mode-toggle"
                size="small"
                :options="viewModeOptions"
            />
            <div class="control-actions">
                <a-button type="primary" size="small" @click="startRound">
                    <template #icon><reload-outlined /></template>
                    {{ t('newRound') }}
                </a-button>
                <a-button size="small" @click="toggleReveal">
                    <template #icon><eye-outlined /></template>
                    {{ revealAnswer ? t('hideAnswer') : t('showAnswer') }}
                </a-button>
            </div>
        </div>

        <main class="play-layout">
            <section class="board-panel">
                <div class="section-head">
                    <h3>{{ t('codeBoard') }}</h3>
                    <a-tag :color="solved ? 'success' : 'processing'">
                        {{ solved ? t('solved') : t('inProgress') }}
                    </a-tag>
                </div>

                <div class="slots-grid" :style="{ '--slot-count': String(secretRules.length || 1) }">
                    <button
                        v-for="(_, index) in secretRules"
                        :key="index"
                        class="code-slot"
                        :data-slot-index="index"
                        :class="[
                            activeSlot === index ? 'active' : '',
                            feedback[index] ? `state-${feedback[index]}` : '',
                            guesses[index] ? 'filled' : ''
                        ]"
                        type="button"
                        @click="selectSlot(index)"
                        @contextmenu.prevent="clearSlot(index)"
                    >
                        <span class="slot-index">{{ index + 1 }}</span>
                        <PlantToken v-if="guesses[index]" :plant="plantView(guesses[index]?.Target || '')" compact />
                        <span v-else class="slot-empty">{{ t('emptySlot') }}</span>
                        <span v-if="feedback[index]" class="feedback-label">{{ t(`feedback.${feedback[index]}`) }}</span>
                    </button>
                </div>

                <div class="merge-tray">
                    <div class="section-head compact">
                        <h3>{{ t('mergeTray') }}</h3>
                        <a-button size="small" @click="clearSelection">{{ t('clear') }}</a-button>
                    </div>
                    <div class="picked-row">
                        <div class="picked-cell">
                            <PlantToken v-if="selectedPlants[0]" :plant="plantView(selectedPlants[0])" compact />
                            <span v-else>{{ t('pickA') }}</span>
                        </div>
                        <span class="plus-sign">+</span>
                        <div class="picked-cell">
                            <PlantToken v-if="selectedPlants[1]" :plant="plantView(selectedPlants[1])" compact />
                            <span v-else>{{ t('pickB') }}</span>
                        </div>
                        <span class="arrow-sign">=</span>
                        <div class="picked-result" :class="{ ready: currentMerge }">
                            <PlantToken v-if="currentMerge" :plant="plantView(currentMerge.Target)" compact />
                            <span v-else>{{ t('noMerge') }}</span>
                        </div>
                    </div>
                </div>

                <div class="board-actions">
                    <a-button
                        type="primary"
                        data-action="confirm-guess"
                        :disabled="!canConfirm"
                        @click="confirmGuess"
                    >
                        <template #icon><check-circle-outlined /></template>
                        {{ t('confirm') }}
                    </a-button>
                    <a-button :disabled="!guesses[activeSlot]" @click="clearSlot(activeSlot)">
                        {{ t('clearSlot') }}
                    </a-button>
                    <div class="reward" v-if="solved">
                        <strong>{{ reward }}</strong>
                        <span>{{ t('reward') }}</span>
                    </div>
                </div>
                <div class="feedback-strip" v-if="attempts.length">
                    <span class="attempt-index">#{{ attempts[0].index }}</span>
                    <div class="history-feedbacks">
                        <a-tag v-for="(state, index) in attempts[0].feedback" :key="index" :color="feedbackColor(state)">
                            {{ index + 1 }} · {{ t(`feedback.${state}`) }}
                        </a-tag>
                    </div>
                </div>
            </section>

            <aside class="side-panel" :class="{ 'answer-open': viewMode === 'practice' && (revealAnswer || solved), 'rules-open': viewMode === 'rules' }">
                <section v-if="viewMode === 'practice'">
                    <div class="section-head compact">
                        <h3>{{ t('basePool') }}</h3>
                        <span class="muted">{{ availableRules.length }} {{ t('rules') }}</span>
                    </div>
                    <div class="base-grid">
                        <button
                            v-for="plant in activeBasePlants"
                            :key="plant"
                            type="button"
                            class="plant-button"
                            :data-plant="plant"
                            :class="{ picked: selectedPlants.includes(plant) }"
                            @click="pickBase(plant)"
                        >
                            <PlantToken :plant="plantView(plant)" />
                        </button>
                    </div>
                </section>

                <section class="answer-panel" v-if="viewMode === 'practice' && (revealAnswer || solved)">
                    <div class="section-head compact">
                        <h3>{{ t('answer') }}</h3>
                    </div>
                    <ol class="answer-list">
                        <li v-for="(rule, index) in secretRules" :key="`${rule.Target}-${index}`">
                            <PlantToken :plant="plantView(rule.Target)" compact />
                            <span class="muted">{{ plantName(rule.PlantA) }} + {{ plantName(rule.PlantB) }}</span>
                        </li>
                    </ol>
                </section>

                <section class="rules-panel" v-if="viewMode === 'rules'">
                    <div class="section-head compact">
                        <div class="rules-title">
                            <h3>{{ t('rulesReference') }}</h3>
                            <span class="muted">{{ visibleRules.length }}/{{ allRules.length }}</span>
                        </div>
                        <a-segmented
                            v-model:value="ruleScope"
                            class="scope-toggle"
                            size="small"
                            :options="ruleScopeOptions"
                        />
                    </div>
                    <div class="rules-table-wrap">
                        <table class="rules-table">
                            <thead>
                                <tr>
                                    <th>{{ t('plantA') }}</th>
                                    <th>{{ t('plantB') }}</th>
                                    <th>{{ t('result') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="rule in visibleRules" :key="`${rule.PlantA}-${rule.PlantB}-${rule.Target}`">
                                    <td><PlantToken :plant="plantView(rule.PlantA)" compact /></td>
                                    <td><PlantToken :plant="plantView(rule.PlantB)" compact /></td>
                                    <td><PlantToken :plant="plantView(rule.Target)" compact /></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </aside>
        </main>

    </section>
    </a-config-provider>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, inject, onMounted, ref, watch } from 'vue';
import { theme } from 'ant-design-vue';
import { CheckCircleOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons-vue';

import decodingData from './decoding-plants.json';
import { getPlantMap } from '../plantsAlmanac/formatPlants';

type FeedbackState = 'correct' | 'change' | 'half' | 'fault';
type ViewMode = 'practice' | 'rules';
type RuleScope = 'current' | 'all';

interface MergeRule {
    PlantA: string;
    PlantB: string;
    Target: string;
}

interface PlantView {
    codename: string;
    displayCodename: string;
    name: string;
    image: string | null;
}

interface Attempt {
    index: number;
    feedback: FeedbackState[];
}

const messages = {
    zh: {
        title: '植物解码练习器',
        subtitle: '网页复刻版 · 使用当前游戏解码数据',
        basePlants: '基础植物',
        codeSlots: '密码槽',
        attempts: '提交次数',
        baseCount: '基础数量',
        codeCount: '密码数量',
        newRound: '新一局',
        showAnswer: '显示答案',
        hideAnswer: '隐藏答案',
        codeBoard: '解码板',
        solved: '已解开',
        inProgress: '解码中',
        emptySlot: '空槽',
        mergeTray: '合成槽',
        clear: '清空',
        pickA: '选择 A',
        pickB: '选择 B',
        noMerge: '未形成合成',
        confirm: '提交判定',
        clearSlot: '清空当前槽',
        reward: '模拟钻石',
        basePool: '基础池',
        rules: '条规则',
        practiceMode: '练习',
        rulesMode: '规则',
        rulesReference: '合成规则',
        currentRules: '当前',
        allRules: '全部',
        plantA: '植物 A',
        plantB: '植物 B',
        result: '结果',
        answer: '答案',
        history: '提交记录',
        feedback: {
            correct: '正确',
            change: '换位',
            half: '半对',
            fault: '错误'
        }
    },
    en: {
        title: 'Plant Decoding Practice',
        subtitle: 'Web remake · current game decoding data',
        basePlants: 'Base Plants',
        codeSlots: 'Code Slots',
        attempts: 'Attempts',
        baseCount: 'Base Count',
        codeCount: 'Code Count',
        newRound: 'New Round',
        showAnswer: 'Show Answer',
        hideAnswer: 'Hide Answer',
        codeBoard: 'Code Board',
        solved: 'Solved',
        inProgress: 'In Progress',
        emptySlot: 'Empty',
        mergeTray: 'Merge Tray',
        clear: 'Clear',
        pickA: 'Pick A',
        pickB: 'Pick B',
        noMerge: 'No merge',
        confirm: 'Confirm',
        clearSlot: 'Clear Slot',
        reward: 'Simulated Gems',
        basePool: 'Base Pool',
        rules: 'rules',
        practiceMode: 'Play',
        rulesMode: 'Rules',
        rulesReference: 'Merge Rules',
        currentRules: 'Current',
        allRules: 'All',
        plantA: 'Plant A',
        plantB: 'Plant B',
        result: 'Result',
        answer: 'Answer',
        history: 'History',
        feedback: {
            correct: 'Correct',
            change: 'Moved',
            half: 'Half',
            fault: 'Fault'
        }
    },
    es: {
        title: 'Practica de descifrado de plantas',
        subtitle: 'Recreacion web · datos actuales del juego',
        basePlants: 'Plantas base',
        codeSlots: 'Ranuras',
        attempts: 'Intentos',
        baseCount: 'Bases',
        codeCount: 'Codigos',
        newRound: 'Nueva ronda',
        showAnswer: 'Mostrar respuesta',
        hideAnswer: 'Ocultar respuesta',
        codeBoard: 'Tablero',
        solved: 'Resuelto',
        inProgress: 'En curso',
        emptySlot: 'Vacio',
        mergeTray: 'Fusion',
        clear: 'Limpiar',
        pickA: 'Elegir A',
        pickB: 'Elegir B',
        noMerge: 'Sin fusion',
        confirm: 'Confirmar',
        clearSlot: 'Limpiar ranura',
        reward: 'Gemas simuladas',
        basePool: 'Bases',
        rules: 'reglas',
        practiceMode: 'Juego',
        rulesMode: 'Reglas',
        rulesReference: 'Reglas',
        currentRules: 'Actual',
        allRules: 'Todo',
        plantA: 'Planta A',
        plantB: 'Planta B',
        result: 'Resultado',
        answer: 'Respuesta',
        history: 'Historial',
        feedback: {
            correct: 'Correcto',
            change: 'Cambiado',
            half: 'Medio',
            fault: 'Error'
        }
    },
    ru: {
        title: 'Тренировка расшифровки растений',
        subtitle: 'Веб-версия · текущие данные игры',
        basePlants: 'Базовые',
        codeSlots: 'Слоты',
        attempts: 'Попытки',
        baseCount: 'Базы',
        codeCount: 'Коды',
        newRound: 'Новый раунд',
        showAnswer: 'Показать ответ',
        hideAnswer: 'Скрыть ответ',
        codeBoard: 'Поле кода',
        solved: 'Решено',
        inProgress: 'В процессе',
        emptySlot: 'Пусто',
        mergeTray: 'Слияние',
        clear: 'Очистить',
        pickA: 'Выбрать A',
        pickB: 'Выбрать B',
        noMerge: 'Нет слияния',
        confirm: 'Проверить',
        clearSlot: 'Очистить слот',
        reward: 'Гемы',
        basePool: 'База',
        rules: 'правил',
        practiceMode: 'Игра',
        rulesMode: 'Правила',
        rulesReference: 'Правила',
        currentRules: 'Текущие',
        allRules: 'Все',
        plantA: 'Раст. A',
        plantB: 'Раст. B',
        result: 'Итог',
        answer: 'Ответ',
        history: 'История',
        feedback: {
            correct: 'Верно',
            change: 'Не там',
            half: 'Половина',
            fault: 'Ошибка'
        }
    }
} as const;

const imageAliasMap: Record<string, string> = {
    cherribomb: 'cherry_bomb'
};

const i18nLanguage = inject('i18nLanguage', 'en') as string;
const localeKey = computed(() => (i18nLanguage in messages ? i18nLanguage : 'en') as keyof typeof messages);
const plantMap = computed<Record<string, any>>(() => getPlantMap(localeKey.value));

const t = (key: string) => {
    const segments = key.split('.');
    let value: any = messages[localeKey.value];
    for (const segment of segments) value = value?.[segment];
    if (value !== undefined) return value;
    value = messages.en;
    for (const segment of segments) value = value?.[segment];
    return value ?? key;
};

const basePool = decodingData.BASES as string[];
const allRules = decodingData.MERGES as MergeRule[];

const baseCount = ref(5);
const codeCount = ref(4);
const secretRules = ref<MergeRule[]>([]);
const guesses = ref<Array<MergeRule | null>>([]);
const feedback = ref<Array<FeedbackState | null>>([]);
const attempts = ref<Attempt[]>([]);
const selectedPlants = ref<string[]>([]);
const activeSlot = ref(0);
const step = ref(0);
const solved = ref(false);
const revealAnswer = ref(false);
const reward = ref(0);
const viewMode = ref<ViewMode>('practice');
const ruleScope = ref<RuleScope>('current');

const activeBasePlants = computed(() => basePool.slice(0, baseCount.value));
const availableRules = computed(() => allRules.filter(rule =>
    activeBasePlants.value.includes(rule.PlantA) && activeBasePlants.value.includes(rule.PlantB)
));
const currentMerge = computed(() => selectedPlants.value.length === 2
    ? findMerge(selectedPlants.value[0], selectedPlants.value[1])
    : null
);
const canConfirm = computed(() => guesses.value.length > 0 && guesses.value.every(Boolean) && !solved.value);
const visibleRules = computed(() => ruleScope.value === 'current' ? availableRules.value : allRules);
const viewModeOptions = computed(() => [
    { label: t('practiceMode'), value: 'practice' },
    { label: t('rulesMode'), value: 'rules' }
]);
const ruleScopeOptions = computed(() => [
    { label: t('currentRules'), value: 'current' },
    { label: t('allRules'), value: 'all' }
]);

const PlantToken = defineComponent({
    name: 'PlantToken',
    props: {
        plant: { type: Object as () => PlantView, required: true },
        compact: { type: Boolean, default: false }
    },
    setup(props) {
        return () => h('span', { class: ['plant-token', props.compact ? 'compact' : ''], title: props.plant.codename }, [
            props.plant.image
                ? h('img', {
                    src: props.plant.image,
                    alt: '',
                    loading: 'lazy',
                    width: props.compact ? 32 : 40,
                    height: props.compact ? 32 : 40,
                    'aria-hidden': 'true'
                })
                : h('span', { class: 'plant-fallback', 'aria-hidden': 'true' }, props.plant.codename.slice(0, 2).toUpperCase()),
            h('span', { class: 'plant-token-text' }, [
                h('strong', props.plant.name),
                h('small', props.plant.codename)
            ])
        ]);
    }
});

function resolveDisplayCodename(codename: string) {
    if (imageAliasMap[codename]) return imageAliasMap[codename];
    const lowerCodename = codename.toLowerCase();
    if (plantMap.value[lowerCodename]) return lowerCodename;
    return codename;
}

function plantView(codename: string): PlantView {
    const displayCodename = resolveDisplayCodename(codename);
    const plant = plantMap.value[codename] || plantMap.value[displayCodename];
    const image = hasKnownImage(displayCodename) ? `/assets/image/plants/plants_${displayCodename}_c.webp` : null;
    return {
        codename,
        displayCodename,
        name: plant?.name || plant?.enName || codename,
        image
    };
}

function hasKnownImage(codename: string) {
    return !['stickybombrice', 'slingpea', 'inferno'].includes(codename);
}

function plantName(codename: string) {
    return plantView(codename).name;
}

function shuffleRules(rules: MergeRule[]) {
    return rules
        .map(rule => ({ rule, weight: Math.random() }))
        .sort((a, b) => a.weight - b.weight)
        .map(item => item.rule);
}

function findMerge(a: string, b: string) {
    return allRules.find(rule =>
        (rule.PlantA === a && rule.PlantB === b) || (rule.PlantA === b && rule.PlantB === a)
    ) || null;
}

function startRound() {
    const rules = shuffleRules(availableRules.value);
    const count = Math.min(codeCount.value, rules.length);
    secretRules.value = rules.slice(0, count);
    guesses.value = Array.from({ length: count }, () => null);
    feedback.value = Array.from({ length: count }, () => null);
    attempts.value = [];
    selectedPlants.value = [];
    activeSlot.value = 0;
    step.value = 0;
    solved.value = false;
    revealAnswer.value = false;
    reward.value = 0;
}

function selectSlot(index: number) {
    activeSlot.value = index;
}

function clearSlot(index: number) {
    if (solved.value) return;
    guesses.value[index] = null;
    feedback.value[index] = null;
}

function clearSelection() {
    selectedPlants.value = [];
}

function pickBase(codename: string) {
    if (solved.value) return;
    if (selectedPlants.value.length >= 2) selectedPlants.value = [];
    selectedPlants.value.push(codename);
    if (selectedPlants.value.length === 2) {
        const merge = currentMerge.value;
        if (merge) {
            guesses.value[activeSlot.value] = merge;
            feedback.value[activeSlot.value] = null;
            const next = guesses.value.findIndex((guess, index) => !guess && index !== activeSlot.value);
            if (next >= 0) activeSlot.value = next;
        }
        selectedPlants.value = [];
    }
}

function judgeHalf(real: MergeRule, guess: MergeRule) {
    return [guess.PlantA, guess.PlantB].some(plant => plant === real.PlantA || plant === real.PlantB);
}

function judgeSlot(index: number): FeedbackState {
    const guess = guesses.value[index]!;
    const real = secretRules.value[index];
    if (guess.Target === real.Target) return 'correct';
    const targetExistsElsewhere = secretRules.value.some((rule, ruleIndex) =>
        ruleIndex !== index && rule.Target === guess.Target && guesses.value[ruleIndex]?.Target !== rule.Target
    );
    if (targetExistsElsewhere) return 'change';
    if (judgeHalf(real, guess)) return 'half';
    return 'fault';
}

function confirmGuess() {
    if (!canConfirm.value) return;
    step.value += 1;
    const judgedFeedback = guesses.value.map((_, index) => judgeSlot(index));
    feedback.value = judgedFeedback;
    attempts.value.unshift({
        index: step.value,
        feedback: judgedFeedback.slice()
    });
    solved.value = judgedFeedback.every(state => state === 'correct');
    if (solved.value) {
        reward.value = Math.round(
            secretRules.value.length * activeBasePlants.value.length * Math.exp(-Math.pow(step.value / 8, 2))
        );
        revealAnswer.value = true;
    }
}

function toggleReveal() {
    revealAnswer.value = !revealAnswer.value;
}

function feedbackColor(state: FeedbackState) {
    if (state === 'correct') return 'success';
    if (state === 'change') return 'processing';
    if (state === 'half') return 'warning';
    return 'error';
}

watch([baseCount, codeCount], () => {
    baseCount.value = Math.min(10, Math.max(3, Number(baseCount.value) || 5));
    codeCount.value = Math.min(10, Math.max(3, Number(codeCount.value) || 4));
    startRound();
});

onMounted(startRound);
</script>

<style scoped>
.decoding-shell {
    --decoding-primary: #0d9488;
    --decoding-primary-strong: #0f766e;
    --decoding-action: #f97316;
    --decoding-bg: color-mix(in srgb, var(--vp-c-bg) 92%, #0d9488 8%);
    --decoding-panel: color-mix(in srgb, var(--vp-c-bg) 88%, var(--vp-c-bg-soft) 12%);
    --decoding-surface: color-mix(in srgb, var(--vp-c-bg) 82%, #f0fdfa 18%);
    --decoding-border: color-mix(in srgb, var(--vp-c-text) 15%, transparent);
    --decoding-muted: var(--vp-c-text-mute);
    --decoding-shell-width: min(1120px, calc(100vw - 96px));
    container-type: inline-size;
    width: var(--decoding-shell-width);
    max-width: calc(100vw - 2rem);
    margin: 0.25rem auto 0.75rem;
    margin-left: calc((100% - var(--decoding-shell-width)) / 2);
    border: 1px solid var(--decoding-border);
    border-radius: 8px;
    background: var(--decoding-bg);
    color: var(--vp-c-text);
    overflow: hidden;
}

[data-theme="dark"] .decoding-shell {
    --decoding-primary: #2dd4bf;
    --decoding-primary-strong: #5eead4;
    --decoding-action: #fb923c;
    --decoding-surface: color-mix(in srgb, var(--vp-c-bg) 78%, #134e4a 22%);
}

.tool-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
    padding: 10px 12px;
    border-bottom: 1px solid var(--decoding-border);
}

.title-block {
    min-width: 0;
}

.tool-title {
    margin-bottom: 0 !important;
    font-size: 1.18rem !important;
    line-height: 1.2 !important;
    white-space: normal;
    overflow-wrap: anywhere;
}

.stats-row {
    display: grid;
    grid-template-columns: repeat(3, minmax(68px, 1fr));
    gap: 6px;
}

.stat-pill {
    min-width: 68px;
    border: 1px solid var(--decoding-border);
    border-radius: 6px;
    padding: 5px 8px;
    background: var(--decoding-surface);
}

.stat-pill strong {
    display: block;
    color: var(--decoding-primary-strong);
    font-size: 1rem;
    line-height: 1;
}

.stat-pill span {
    color: var(--decoding-muted);
    font-size: 0.68rem;
}

.stat-pill.solved strong {
    color: var(--decoding-action);
}

.control-band {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--decoding-border);
    background: color-mix(in srgb, var(--decoding-panel) 88%, var(--decoding-primary) 12%);
}

.number-control {
    display: inline-grid;
    grid-template-columns: auto 76px;
    align-items: center;
    gap: 6px;
    min-width: 0;
    color: var(--decoding-muted);
    font-size: 0.8rem;
}

.number-control :deep(.ant-input-number) {
    width: 100%;
    min-width: 0;
}

.control-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-left: auto;
}

.mode-toggle,
.scope-toggle {
    flex: 0 0 auto;
}

.mode-toggle :deep(.ant-segmented-item-label),
.scope-toggle :deep(.ant-segmented-item-label) {
    min-height: 24px;
    line-height: 24px;
}

.play-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.5fr) minmax(260px, 0.68fr);
    gap: 10px;
    padding: 10px 12px 12px;
}

.board-panel,
.side-panel > section {
    border: 1px solid var(--decoding-border);
    border-radius: 7px;
    background: var(--decoding-panel);
}

.board-panel {
    padding: 10px;
}

.side-panel {
    display: grid;
    gap: 8px;
    align-content: start;
}

.side-panel > section {
    padding: 10px;
}

.rules-panel {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    max-height: 360px;
}

.rules-title {
    display: flex;
    align-items: baseline;
    gap: 6px;
    min-width: 0;
}

.rules-table-wrap {
    min-height: 0;
    overflow: auto;
    border: 1px solid var(--decoding-border);
    border-radius: 7px;
    background: var(--decoding-surface);
}

.rules-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
}

.rules-table th,
.rules-table td {
    padding: 5px 4px;
    border-bottom: 1px solid var(--decoding-border);
    text-align: center;
    vertical-align: middle;
}

.rules-table th {
    position: sticky;
    top: 0;
    z-index: 1;
    background: var(--decoding-surface);
    color: var(--decoding-muted);
    font-size: 0.7rem;
    font-weight: 600;
}

.rules-table tr:last-child td {
    border-bottom: 0;
}

.rules-table :deep(.plant-token-text strong) {
    max-width: 64px;
}

.rules-table :deep(.plant-token) {
    grid-template-columns: 24px minmax(0, 1fr);
    align-items: center;
    justify-items: start;
    gap: 4px;
}

.rules-table :deep(.plant-token.compact img),
.rules-table :deep(.plant-token.compact .plant-fallback) {
    width: 24px;
    height: 24px;
}

.section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 8px;
}

.section-head h3 {
    margin: 0;
    font-size: 0.92rem;
    line-height: 1.25;
}

.section-head.compact h3 {
    font-size: 0.86rem;
}

.muted {
    color: var(--decoding-muted);
    font-size: 0.76rem;
}

.slots-grid {
    display: grid;
    grid-template-columns: repeat(var(--slot-count), minmax(88px, 1fr));
    gap: 6px;
}

.code-slot,
.plant-button {
    appearance: none;
    cursor: pointer;
    color: inherit;
    transition: border-color 160ms ease, background-color 160ms ease;
}

.code-slot {
    position: relative;
    display: grid;
    align-content: center;
    min-height: 88px;
    border: 2px solid var(--decoding-border);
    border-radius: 7px;
    padding: 10px 6px 8px;
    background: var(--decoding-surface);
    text-align: center;
}

.code-slot:hover,
.plant-button:hover {
    border-color: var(--decoding-primary);
}

.code-slot.active {
    border-color: var(--decoding-action);
}

.code-slot.state-correct {
    border-color: #16a34a;
}

.code-slot.state-change {
    border-color: #2563eb;
}

.code-slot.state-half {
    border-color: #d97706;
}

.code-slot.state-fault {
    border-color: #dc2626;
}

.slot-index {
    position: absolute;
    top: 5px;
    left: 6px;
    color: var(--decoding-muted);
    font-size: 0.68rem;
}

.slot-empty,
.picked-cell,
.picked-result {
    color: var(--decoding-muted);
    font-size: 0.78rem;
}

.feedback-label {
    position: absolute;
    right: 6px;
    bottom: 5px;
    font-size: 0.68rem;
    font-weight: 600;
}

.merge-tray {
    margin-top: 8px;
    border: 1px solid var(--decoding-border);
    border-radius: 7px;
    padding: 8px;
    background: var(--decoding-surface);
}

.picked-row {
    display: grid;
    grid-template-columns: minmax(72px, 1fr) auto minmax(72px, 1fr) auto minmax(90px, 1.05fr);
    gap: 6px;
    align-items: center;
}

.picked-cell,
.picked-result {
    display: grid;
    place-items: center;
    min-height: 54px;
    border: 1px dashed var(--decoding-border);
    border-radius: 7px;
    background: color-mix(in srgb, var(--vp-c-bg) 80%, transparent);
}

.picked-result.ready {
    border-style: solid;
    border-color: var(--decoding-primary);
}

.plus-sign,
.arrow-sign {
    color: var(--decoding-primary-strong);
    font-weight: 700;
}

.board-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
}

.reward {
    display: flex;
    align-items: baseline;
    gap: 5px;
    margin-left: auto;
    color: var(--decoding-action);
}

.reward strong {
    font-size: 1.15rem;
}

.feedback-strip {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    min-height: 24px;
}

.base-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(76px, 1fr));
    gap: 6px;
}

.plant-button {
    min-height: 72px;
    border: 1px solid var(--decoding-border);
    border-radius: 7px;
    padding: 6px;
    background: var(--decoding-surface);
}

.plant-button.picked {
    border-color: var(--decoding-action);
    background: color-mix(in srgb, var(--decoding-surface) 78%, var(--decoding-action) 22%);
}

.answer-list {
    display: grid;
    gap: 5px;
    margin: 0;
    padding-left: 18px;
}

.answer-list li {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 6px;
    align-items: center;
}

.answer-list li .muted {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.attempt-index {
    color: var(--decoding-muted);
    font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    font-size: 0.76rem;
}

.history-feedbacks {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

:deep(.plant-token) {
    display: inline-grid;
    justify-items: center;
    gap: 2px;
    max-width: 100%;
}

:deep(.plant-token img),
:deep(.plant-fallback) {
    width: 40px;
    height: 40px;
}

:deep(.plant-token img) {
    object-fit: contain;
}

:deep(.plant-fallback) {
    display: grid;
    place-items: center;
    border-radius: 7px;
    border: 1px solid var(--decoding-border);
    color: var(--decoding-primary-strong);
    font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    font-weight: 700;
}

:deep(.plant-token.compact img),
:deep(.plant-token.compact .plant-fallback) {
    width: 32px;
    height: 32px;
}

:deep(.plant-token-text) {
    display: grid;
    gap: 1px;
    max-width: 100%;
    line-height: 1.08;
}

:deep(.plant-token-text strong) {
    max-width: 96px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.76rem;
}

:deep(.plant-token-text small) {
    display: none;
    max-width: 96px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--decoding-muted);
    font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    font-size: 0.62rem;
}

@media (prefers-reduced-motion: reduce) {
    .code-slot,
    .plant-button {
        transition: none;
    }
}

@container (max-width: 880px) {
    .tool-header {
        grid-template-columns: 1fr;
    }

    .stats-row {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .control-actions {
        margin-left: 0;
    }
}

@media (max-width: 1180px) and (min-width: 761px) {
    .decoding-shell {
        --decoding-shell-width: min(980px, calc(100vw - 48px));
    }
}

@media (max-width: 760px) {
    .decoding-shell {
        --decoding-shell-width: 100%;
        width: 100%;
        max-width: 100%;
        margin-left: auto;
    }
}

@container (max-width: 620px) {
    .decoding-shell {
        margin: 0.75rem 0;
        border-radius: 8px;
    }

    .tool-header,
    .control-band,
    .play-layout {
        padding-inline: 10px;
    }

    .stats-row {
        grid-template-columns: 1fr 1fr 1fr;
    }

    .stat-pill {
        min-width: 0;
    }

    .number-control {
        grid-template-columns: 1fr 82px;
        width: 100%;
    }

    .control-actions,
    .control-actions :deep(.ant-btn) {
        width: auto;
    }

    .mode-toggle {
        max-width: 100%;
    }

    .slots-grid {
        grid-template-columns: repeat(auto-fit, minmax(62px, 1fr));
        gap: 4px;
    }

    .code-slot {
        min-height: 76px;
        padding: 8px 4px 6px;
    }

    .play-layout {
        grid-template-columns: 1fr;
    }

    .side-panel.answer-open > section:first-child {
        display: none;
    }

    .rules-panel {
        max-height: 256px;
    }

    .rules-panel .section-head {
        align-items: flex-start;
    }

    .scope-toggle {
        max-width: 148px;
    }

    .rules-table th,
    .rules-table td {
        padding-inline: 3px;
    }

    .picked-row {
        grid-template-columns: minmax(46px, 1fr) auto minmax(46px, 1fr) auto minmax(58px, 1.05fr);
        gap: 4px;
    }

    .plus-sign,
    .arrow-sign {
        text-align: center;
    }

    .board-actions :deep(.ant-btn) {
        width: auto;
    }

    .reward {
        width: 100%;
        margin-left: 0;
        justify-content: center;
    }
}
</style>
