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
                <a-typography-title :level="2" class="tool-title">{{ t('title') }}</a-typography-title>
                <a-typography-text type="secondary">{{ t('subtitle') }}</a-typography-text>
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
                <a-input-number v-model:value="baseCount" :min="3" :max="10" />
            </label>
            <label class="number-control">
                <span>{{ t('codeCount') }}</span>
                <a-input-number v-model:value="codeCount" :min="3" :max="10" />
            </label>
            <div class="control-actions">
                <a-button type="primary" @click="startRound">
                    <template #icon><reload-outlined /></template>
                    {{ t('newRound') }}
                </a-button>
                <a-button @click="toggleReveal">
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
                        size="large"
                        data-action="confirm-guess"
                        :disabled="!canConfirm"
                        @click="confirmGuess"
                    >
                        <template #icon><check-circle-outlined /></template>
                        {{ t('confirm') }}
                    </a-button>
                    <a-button size="large" :disabled="!guesses[activeSlot]" @click="clearSlot(activeSlot)">
                        {{ t('clearSlot') }}
                    </a-button>
                    <div class="reward" v-if="solved">
                        <strong>{{ reward }}</strong>
                        <span>{{ t('reward') }}</span>
                    </div>
                </div>
            </section>

            <aside class="side-panel">
                <section>
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

                <section class="answer-panel" v-if="revealAnswer || solved">
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
            </aside>
        </main>

        <section class="history-panel" v-if="attempts.length">
            <div class="section-head compact">
                <h3>{{ t('history') }}</h3>
            </div>
            <div class="history-list">
                <div v-for="attempt in attempts" :key="attempt.index" class="history-row">
                    <span class="attempt-index">#{{ attempt.index }}</span>
                    <div class="history-feedbacks">
                        <a-tag v-for="(state, index) in attempt.feedback" :key="index" :color="feedbackColor(state)">
                            {{ index + 1 }} · {{ t(`feedback.${state}`) }}
                        </a-tag>
                    </div>
                </div>
            </div>
        </section>
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

const activeBasePlants = computed(() => basePool.slice(0, baseCount.value));
const availableRules = computed(() => allRules.filter(rule =>
    activeBasePlants.value.includes(rule.PlantA) && activeBasePlants.value.includes(rule.PlantB)
));
const currentMerge = computed(() => selectedPlants.value.length === 2
    ? findMerge(selectedPlants.value[0], selectedPlants.value[1])
    : null
);
const canConfirm = computed(() => guesses.value.length > 0 && guesses.value.every(Boolean) && !solved.value);

const PlantToken = defineComponent({
    name: 'PlantToken',
    props: {
        plant: { type: Object as () => PlantView, required: true },
        compact: { type: Boolean, default: false }
    },
    setup(props) {
        return () => h('span', { class: ['plant-token', props.compact ? 'compact' : ''] }, [
            props.plant.image
                ? h('img', { src: props.plant.image, alt: props.plant.name, loading: 'lazy' })
                : h('span', { class: 'plant-fallback', 'aria-hidden': 'true' }, props.plant.codename.slice(0, 2).toUpperCase()),
            h('span', { class: 'plant-token-text' }, [
                h('strong', props.plant.name),
                h('small', props.plant.codename)
            ])
        ]);
    }
});

function plantView(codename: string): PlantView {
    const displayCodename = imageAliasMap[codename] || codename;
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
    feedback.value = guesses.value.map((_, index) => judgeSlot(index));
    attempts.value.unshift({
        index: step.value,
        feedback: feedback.value as FeedbackState[]
    });
    solved.value = feedback.value.every(state => state === 'correct');
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
    container-type: inline-size;
    max-width: 1200px;
    margin: 1.5rem auto;
    border: 1px solid var(--decoding-border);
    border-radius: 10px;
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
    gap: 16px;
    align-items: start;
    padding: 18px 20px;
    border-bottom: 1px solid var(--decoding-border);
}

.title-block {
    min-width: 0;
}

.tool-title {
    margin-bottom: 4px !important;
    line-height: 1.2 !important;
    white-space: normal;
    overflow-wrap: anywhere;
}

.stats-row {
    display: grid;
    grid-template-columns: repeat(3, minmax(88px, 1fr));
    gap: 8px;
}

.stat-pill {
    min-width: 88px;
    border: 1px solid var(--decoding-border);
    border-radius: 8px;
    padding: 8px 10px;
    background: var(--decoding-surface);
}

.stat-pill strong {
    display: block;
    color: var(--decoding-primary-strong);
    font-size: 1.2rem;
    line-height: 1;
}

.stat-pill span {
    color: var(--decoding-muted);
    font-size: 0.78rem;
}

.stat-pill.solved strong {
    color: var(--decoding-action);
}

.control-band {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    border-bottom: 1px solid var(--decoding-border);
    background: color-mix(in srgb, var(--decoding-panel) 88%, var(--decoding-primary) 12%);
}

.number-control {
    display: inline-grid;
    grid-template-columns: auto 90px;
    align-items: center;
    gap: 8px;
    min-width: 0;
    color: var(--decoding-muted);
    font-size: 0.9rem;
}

.number-control :deep(.ant-input-number) {
    width: 100%;
    min-width: 0;
}

.control-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-left: auto;
}

.play-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(300px, 0.75fr);
    gap: 16px;
    padding: 18px 20px;
}

.board-panel,
.side-panel > section,
.history-panel {
    border: 1px solid var(--decoding-border);
    border-radius: 8px;
    background: var(--decoding-panel);
}

.board-panel {
    padding: 14px;
}

.side-panel {
    display: grid;
    gap: 14px;
    align-content: start;
}

.side-panel > section,
.history-panel {
    padding: 14px;
}

.section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 12px;
}

.section-head h3 {
    margin: 0;
    font-size: 1.05rem;
    line-height: 1.25;
}

.section-head.compact h3 {
    font-size: 0.98rem;
}

.muted {
    color: var(--decoding-muted);
    font-size: 0.82rem;
}

.slots-grid {
    display: grid;
    grid-template-columns: repeat(var(--slot-count), minmax(118px, 1fr));
    gap: 10px;
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
    min-height: 132px;
    border: 2px solid var(--decoding-border);
    border-radius: 8px;
    padding: 12px 8px 10px;
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
    top: 7px;
    left: 8px;
    color: var(--decoding-muted);
    font-size: 0.75rem;
}

.slot-empty,
.picked-cell,
.picked-result {
    color: var(--decoding-muted);
    font-size: 0.9rem;
}

.feedback-label {
    position: absolute;
    right: 7px;
    bottom: 6px;
    font-size: 0.74rem;
    font-weight: 600;
}

.merge-tray {
    margin-top: 14px;
    border: 1px solid var(--decoding-border);
    border-radius: 8px;
    padding: 12px;
    background: var(--decoding-surface);
}

.picked-row {
    display: grid;
    grid-template-columns: minmax(96px, 1fr) auto minmax(96px, 1fr) auto minmax(120px, 1.1fr);
    gap: 8px;
    align-items: center;
}

.picked-cell,
.picked-result {
    display: grid;
    place-items: center;
    min-height: 74px;
    border: 1px dashed var(--decoding-border);
    border-radius: 8px;
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
    gap: 10px;
    margin-top: 14px;
}

.reward {
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin-left: auto;
    color: var(--decoding-action);
}

.reward strong {
    font-size: 1.5rem;
}

.base-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(104px, 1fr));
    gap: 8px;
}

.plant-button {
    min-height: 108px;
    border: 1px solid var(--decoding-border);
    border-radius: 8px;
    padding: 8px;
    background: var(--decoding-surface);
}

.plant-button.picked {
    border-color: var(--decoding-action);
    background: color-mix(in srgb, var(--decoding-surface) 78%, var(--decoding-action) 22%);
}

.answer-list {
    display: grid;
    gap: 8px;
    margin: 0;
    padding-left: 20px;
}

.answer-list li {
    display: grid;
    grid-template-columns: minmax(120px, 1fr);
    gap: 2px;
}

.history-panel {
    margin: 0 20px 18px;
}

.history-list {
    display: grid;
    gap: 8px;
}

.history-row {
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr);
    gap: 8px;
    align-items: center;
}

.attempt-index {
    color: var(--decoding-muted);
    font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
}

.history-feedbacks {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

:deep(.plant-token) {
    display: inline-grid;
    justify-items: center;
    gap: 4px;
    max-width: 100%;
}

:deep(.plant-token img),
:deep(.plant-fallback) {
    width: 54px;
    height: 54px;
}

:deep(.plant-token img) {
    object-fit: contain;
}

:deep(.plant-fallback) {
    display: grid;
    place-items: center;
    border-radius: 8px;
    border: 1px solid var(--decoding-border);
    color: var(--decoding-primary-strong);
    font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    font-weight: 700;
}

:deep(.plant-token.compact img),
:deep(.plant-token.compact .plant-fallback) {
    width: 42px;
    height: 42px;
}

:deep(.plant-token-text) {
    display: grid;
    gap: 1px;
    max-width: 100%;
    line-height: 1.15;
}

:deep(.plant-token-text strong) {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.82rem;
}

:deep(.plant-token-text small) {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--decoding-muted);
    font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    font-size: 0.68rem;
}

@media (prefers-reduced-motion: reduce) {
    .code-slot,
    .plant-button {
        transition: none;
    }
}

@container (max-width: 880px) {
    .tool-header,
    .play-layout {
        grid-template-columns: 1fr;
    }

    .stats-row {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .control-actions {
        margin-left: 0;
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
        padding-inline: 14px;
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
        width: 100%;
    }

    .slots-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .picked-row {
        grid-template-columns: 1fr;
        justify-items: stretch;
    }

    .plus-sign,
    .arrow-sign {
        text-align: center;
    }

    .board-actions :deep(.ant-btn) {
        width: 100%;
    }

    .reward {
        width: 100%;
        margin-left: 0;
        justify-content: center;
    }

    .history-panel {
        margin-inline: 14px;
    }
}
</style>
