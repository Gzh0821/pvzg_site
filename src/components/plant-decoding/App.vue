<template>
    <a-config-provider :theme="{
        token: { colorPrimary: '#0f9fb3', borderRadius: 10 },
        algorithm: $isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm
    }">
        <section class="decoding-shell">
            <header class="tool-header">
                <h1>{{ t('title') }}</h1>
                <a-segmented v-model:value="toolMode" class="mode-switch" :options="toolModeOptions" />
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
                <div class="quick-stats" aria-live="polite">
                    <span><strong>{{ availableRules.length }}</strong>{{ t('availableMerges') }}</span>
                    <span v-if="toolMode === 'assistant'"><strong>{{ assistantHistory.length }}</strong>{{ t('recordedRounds') }}</span>
                    <span v-else-if="toolMode === 'practice'"><strong>{{ practiceStep }}</strong>{{ t('attemptsUnit') }}</span>
                    <span v-else><strong>{{ visibleRules.length }}</strong>{{ t('visibleRules') }}</span>
                </div>
                <div class="control-actions">
                    <a-button v-if="toolMode === 'assistant'" @click="undoAssistant" :disabled="!assistantHistory.length">
                        {{ t('undoRound') }}
                    </a-button>
                    <a-button v-if="toolMode === 'assistant'" type="primary" @click="resetAssistant">
                        <template #icon><reload-outlined /></template>
                        {{ t('resetAssistant') }}
                    </a-button>
                    <a-button v-if="toolMode === 'practice'" type="primary" @click="startPractice">
                        <template #icon><reload-outlined /></template>
                        {{ t('newRound') }}
                    </a-button>
                    <a-segmented
                        v-if="toolMode === 'rules'"
                        v-model:value="ruleScope"
                        :options="ruleScopeOptions"
                    />
                </div>
            </div>

            <div class="decoder-layout">
                <aside class="base-rail console-panel">
                    <div class="panel-heading">
                        <h2>{{ t('basePool') }}</h2>
                        <span class="count-badge">{{ activeBasePlants.length }}</span>
                    </div>
                    <div class="base-list">
                        <button
                            v-for="plant in activeBasePlants"
                            :key="plant"
                            type="button"
                            class="base-card"
                            :class="{ picked: selectedPlants.includes(plant), interactive: toolMode === 'practice' }"
                            :disabled="toolMode !== 'practice' || practiceSolved"
                            @click="pickBase(plant)"
                        >
                            <PlantToken :plant="plantView(plant)" image-only />
                            <span>{{ plantName(plant) }}</span>
                        </button>
                    </div>
                </aside>

                <main class="decode-stage console-panel">
                    <template v-if="toolMode === 'assistant'">
                        <div class="panel-heading stage-heading">
                            <h2>{{ assistantHistory.length ? t('enterFeedback') : t('firstRecommendation') }}</h2>
                            <span class="live-status" :class="assistantStatusClass">{{ assistantStatusText }}</span>
                        </div>

                        <div class="history-chamber" :class="{ empty: !assistantHistory.length }" :aria-label="t('history')">
                            <article
                                v-for="round in assistantHistoryNewest"
                                :key="round.index"
                                class="attempt-record"
                            >
                                <span class="attempt-number">#{{ round.index }}</span>
                                <div class="record-slots" :style="{ '--slot-count': String(round.guesses.length) }">
                                    <div v-for="(target, index) in round.guesses" :key="`${round.index}-${index}`" class="record-card">
                                        <PlantToken :plant="plantView(target)" image-only compact />
                                        <span class="feedback-mark" :class="`state-${round.feedback[index]}`">
                                            {{ feedbackSymbol(round.feedback[index]) }}
                                        </span>
                                    </div>
                                </div>
                            </article>
                        </div>

                        <section class="current-deck">
                            <div class="deck-label">
                                <span>{{ t('currentGuess') }}</span>
                                <button
                                    type="button"
                                    class="text-button"
                                    @click="applyRecommendation"
                                    :disabled="assistantContradiction || assistantRecommendationMatches"
                                >
                                    {{ t('restoreRecommendation') }}
                                </button>
                            </div>
                            <div class="decode-slots" :style="{ '--slot-count': String(codeCount) }">
                                <button
                                    v-for="(_, index) in codeCount"
                                    :key="index"
                                    type="button"
                                    class="decode-card"
                                    :class="[
                                        assistantActiveSlot === index ? 'active' : '',
                                        assistantFeedback[index] ? `state-${assistantFeedback[index]}` : '',
                                        assistantLocked[index] ? 'locked' : ''
                                    ]"
                                    @click="assistantActiveSlot = index"
                                >
                                    <span class="slot-number">{{ index + 1 }}</span>
                                    <PlantToken
                                        v-if="assistantGuesses[index]"
                                        :plant="plantView(assistantGuesses[index])"
                                        compact
                                    />
                                    <span v-else class="slot-placeholder">{{ t('selectMerge') }}</span>
                                    <span v-if="assistantFeedback[index]" class="slot-feedback">
                                        {{ feedbackSymbol(assistantFeedback[index]!) }} {{ t(`feedback.${assistantFeedback[index]}`) }}
                                    </span>
                                    <span v-else class="slot-feedback confidence">{{ confidenceLabel(index) }}</span>
                                </button>
                            </div>
                        </section>

                        <section class="merge-shelf">
                            <div class="deck-label">
                                <span>{{ t('mergeShelf') }}</span>
                            </div>
                            <div class="merge-grid">
                                <button
                                    v-for="rule in availableRules"
                                    :key="rule.Target"
                                    type="button"
                                    class="merge-option"
                                    :class="{ selected: assistantGuesses[assistantActiveSlot] === rule.Target }"
                                    :disabled="assistantTargetUsedElsewhere(rule.Target) || assistantLocked[assistantActiveSlot]"
                                    :title="`${plantName(rule.PlantA)} + ${plantName(rule.PlantB)}`"
                                    @click="selectAssistantTarget(rule.Target)"
                                >
                                    <PlantToken :plant="plantView(rule.Target)" image-only compact />
                                    <span>{{ plantName(rule.Target) }}</span>
                                    <small>{{ plantName(rule.PlantA) }} + {{ plantName(rule.PlantB) }}</small>
                                </button>
                            </div>
                        </section>
                    </template>

                    <template v-else-if="toolMode === 'practice'">
                        <div class="panel-heading stage-heading">
                            <h2>{{ t('codeBoard') }}</h2>
                            <span class="live-status" :class="practiceSolved ? 'success' : ''">
                                {{ practiceSolved ? t('solved') : t('inProgress') }}
                            </span>
                        </div>

                        <div class="history-chamber practice-history" :class="{ empty: !practiceAttempts.length }" :aria-label="t('history')">
                            <article v-for="round in practiceAttempts" :key="round.index" class="attempt-record">
                                <span class="attempt-number">#{{ round.index }}</span>
                                <div class="record-slots" :style="{ '--slot-count': String(round.guesses.length) }">
                                    <div v-for="(target, index) in round.guesses" :key="`${round.index}-${index}`" class="record-card">
                                        <PlantToken :plant="plantView(target)" image-only compact />
                                        <span class="feedback-mark" :class="`state-${round.feedback[index]}`">
                                            {{ feedbackSymbol(round.feedback[index]) }}
                                        </span>
                                    </div>
                                </div>
                            </article>
                        </div>

                        <section class="current-deck">
                            <div class="deck-label"><span>{{ t('currentGuess') }}</span></div>
                            <div class="decode-slots" :style="{ '--slot-count': String(secretRules.length || 1) }">
                                <button
                                    v-for="(_, index) in secretRules"
                                    :key="index"
                                    type="button"
                                    class="decode-card"
                                    :class="[
                                        practiceActiveSlot === index ? 'active' : '',
                                        practiceFeedback[index] ? `state-${practiceFeedback[index]}` : '',
                                        practiceLocked[index] ? 'locked' : ''
                                    ]"
                                    @click="practiceActiveSlot = index"
                                    @contextmenu.prevent="clearPracticeSlot(index)"
                                >
                                    <span class="slot-number">{{ index + 1 }}</span>
                                    <PlantToken v-if="practiceGuesses[index]" :plant="plantView(practiceGuesses[index]!)" compact />
                                    <span v-else class="slot-placeholder">{{ t('emptySlot') }}</span>
                                    <span v-if="practiceFeedback[index]" class="slot-feedback">
                                        {{ feedbackSymbol(practiceFeedback[index]!) }} {{ t(`feedback.${practiceFeedback[index]}`) }}
                                    </span>
                                </button>
                            </div>
                        </section>

                        <section class="fusion-dock">
                            <div class="deck-label">
                                <span>{{ t('mergeTray') }}</span>
                                <button type="button" class="text-button" @click="clearSelection">{{ t('clear') }}</button>
                            </div>
                            <div class="fusion-equation">
                                <div class="fusion-cell">
                                    <PlantToken v-if="selectedPlants[0]" :plant="plantView(selectedPlants[0])" compact />
                                    <span v-else>{{ t('pickA') }}</span>
                                </div>
                                <b>+</b>
                                <div class="fusion-cell">
                                    <PlantToken v-if="selectedPlants[1]" :plant="plantView(selectedPlants[1])" compact />
                                    <span v-else>{{ t('pickB') }}</span>
                                </div>
                                <b>=</b>
                                <div class="fusion-cell result" :class="{ ready: currentMerge }">
                                    <PlantToken v-if="currentMerge" :plant="plantView(currentMerge.Target)" compact />
                                    <span v-else>{{ t('noMerge') }}</span>
                                </div>
                            </div>
                        </section>
                    </template>

                    <template v-else>
                        <div class="panel-heading stage-heading">
                            <h2>{{ t('rulesReference') }}</h2>
                            <span class="count-badge">{{ visibleRules.length }}</span>
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
                                    <tr v-for="rule in visibleRules" :key="rule.Target">
                                        <td><PlantToken :plant="plantView(rule.PlantA)" compact /></td>
                                        <td><PlantToken :plant="plantView(rule.PlantB)" compact /></td>
                                        <td class="result-cell"><PlantToken :plant="plantView(rule.Target)" compact /></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </template>
                </main>

                <aside class="status-rail console-panel">
                    <template v-if="toolMode === 'assistant'">
                        <div class="panel-heading">
                            <h2>{{ t('feedbackPanel') }}</h2>
                            <span class="active-slot-badge">{{ assistantActiveSlot + 1 }}</span>
                        </div>

                        <div class="solver-summary" :class="{ danger: assistantContradiction, solved: assistantSolved }">
                            <strong>{{ assistantSummaryTitle }}</strong>
                            <span>{{ assistantSummaryDetail }}</span>
                            <div v-if="!assistantContradiction" class="solver-confidence">
                                <span>{{ t('averageConfidence') }}</span>
                                <b>{{ confidencePrefix }}{{ assistantAverageConfidence }}%</b>
                            </div>
                        </div>

                        <div class="feedback-buttons">
                            <button
                                v-for="state in feedbackStates"
                                :key="state"
                                type="button"
                                :class="`feedback-button state-${state}`"
                                :disabled="assistantLocked[assistantActiveSlot]"
                                @click="setAssistantFeedback(state)"
                            >
                                <span>{{ feedbackSymbol(state) }}</span>
                                {{ t(`feedback.${state}`) }}
                            </button>
                        </div>

                        <div class="domain-list" v-if="!assistantContradiction">
                            <span v-for="(domain, index) in assistantAnalysis.domains" :key="index" :class="{ certain: domain.length === 1 }">
                                <b>{{ index + 1 }}</b>{{ domain.length }}
                            </span>
                        </div>

                        <a-button
                            class="primary-action"
                            type="primary"
                            size="large"
                            :disabled="!assistantCanSubmit || assistantContradiction || assistantSolved"
                            @click="submitAssistantRound"
                        >
                            <template #icon><check-circle-outlined /></template>
                            {{ t('recordFeedback') }}
                        </a-button>
                        <p v-if="assistantContradiction" class="status-hint">{{ t('contradictionHint') }}</p>
                    </template>

                    <template v-else-if="toolMode === 'practice'">
                        <div class="panel-heading">
                            <div>
                                <span class="panel-kicker">{{ t('attemptsLabel') }}</span>
                                <h2 class="attempt-display">{{ practiceStep }}</h2>
                            </div>
                            <span v-if="practiceSolved" class="reward-badge">+{{ practiceReward }}</span>
                        </div>
                        <div class="feedback-legend">
                            <span v-for="state in feedbackStates" :key="state" :class="`state-${state}`">
                                <b>{{ feedbackSymbol(state) }}</b>{{ t(`feedback.${state}`) }}
                            </span>
                        </div>
                        <a-button
                            class="primary-action"
                            type="primary"
                            size="large"
                            :disabled="!practiceCanConfirm"
                            @click="confirmPractice"
                        >
                            <template #icon><check-circle-outlined /></template>
                            {{ t('confirm') }}
                        </a-button>
                        <a-button class="secondary-action" :disabled="practiceLocked[practiceActiveSlot]" @click="clearPracticeSlot(practiceActiveSlot)">
                            {{ t('clearSlot') }}
                        </a-button>
                        <button type="button" class="reveal-button" @click="revealAnswer = !revealAnswer">
                            <eye-outlined /> {{ revealAnswer ? t('hideAnswer') : t('showAnswer') }}
                        </button>
                        <ol v-if="revealAnswer || practiceSolved" class="answer-list">
                            <li v-for="(rule, index) in secretRules" :key="`${rule.Target}-${index}`">
                                <span>{{ index + 1 }}</span><PlantToken :plant="plantView(rule.Target)" compact />
                            </li>
                        </ol>
                    </template>

                    <template v-else>
                        <div class="panel-heading">
                            <h2>{{ t('feedbackMeaning') }}</h2>
                        </div>
                        <div class="feedback-legend explanatory">
                            <span v-for="state in feedbackStates" :key="state" :class="`state-${state}`">
                                <b>{{ feedbackSymbol(state) }}</b>
                                <span><strong>{{ t(`feedback.${state}`) }}</strong><small>{{ t(`feedbackHelp.${state}`) }}</small></span>
                            </span>
                        </div>
                    </template>
                </aside>
            </div>
        </section>
    </a-config-provider>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, inject, nextTick, onMounted, ref, watch } from 'vue';
import { theme } from 'ant-design-vue';
import { CheckCircleOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons-vue';

import decodingData from './decoding-plants.json';
import { analyzePuzzle, judgeAttempt, makeSuggestion, suggestionConfidence } from './solver.mjs';
import { getPlantMap } from '../plantsAlmanac/formatPlants';

type FeedbackState = 'correct' | 'change' | 'half' | 'fault';
type ToolMode = 'assistant' | 'practice' | 'rules';
type RuleScope = 'current' | 'all';

interface MergeRule {
    PlantA: string;
    PlantB: string;
    Target: string;
}

interface PlantView {
    codename: string;
    name: string;
    image: string | null;
}

interface RoundRecord {
    index: number;
    guesses: string[];
    feedback: FeedbackState[];
}

const messages = {
    zh: {
        title: '植物解码助手',
        assistantMode: '解码助手', practiceMode: '练习器', rulesMode: '规则表', baseCount: '基础植物', codeCount: '密码槽位',
        availableMerges: '种合成', recordedRounds: '轮记录', attemptsUnit: '次推测', attemptsLabel: '推测次数', visibleRules: '条规则', undoRound: '撤销上一轮',
        resetAssistant: '重新开始', newRound: '新一局', basePool: '基础植物库',
        enterFeedback: '录入本轮游戏反馈', firstRecommendation: '先照此顺序推测',
        currentGuess: '当前推测', restoreRecommendation: '恢复推荐方案', selectMerge: '选择合成', history: '推测记录',
        mergeShelf: '可用合成', feedbackPanel: '反馈控制台', recordFeedback: '记录并计算下一轮',
        contradictionHint: '请撤销上一轮并核对反馈或植物顺序。',
        possibleSolutions: '可行排列', sampledSolutions: '至少 {count} 组', exactSolutions: '{count} 组', averageConfidence: '平均把握度', confidenceValue: '{prefix}{value}% 把握',
        contradiction: '没有可行答案', contradictionDetail: '至少一条记录与其他记录冲突', solvedTitle: '解码完成', solvedDetail: '所有槽位均已完全正确',
        certainSlots: '{count} 个槽位已确定',
        codeBoard: '解码记录台', solved: '已解开', inProgress: '解码中',
        emptySlot: '空槽', mergeTray: '合成台', clear: '清空', pickA: '选择 A', pickB: '选择 B', noMerge: '尚未合成',
        confirm: '提交判定', clearSlot: '清空当前槽', showAnswer: '显示答案', hideAnswer: '隐藏答案',
        rulesReference: '全部合成关系', currentRules: '当前基础池', allRules: '全部', plantA: '植物 A', plantB: '植物 B', result: '合成结果',
        feedbackMeaning: '四色反馈',
        feedback: { correct: '完全正确', change: '位置错误', half: '部分正确', fault: '完全错误' },
        feedbackHelp: { correct: '植物和槽位都正确', change: '植物存在，但应放在别处', half: '两株基础植物中有一株匹配', fault: '目标与两株基础植物都不匹配' }
    },
    en: {
        title: 'Plant decoding assistant',
        assistantMode: 'Assistant', practiceMode: 'Practice', rulesMode: 'Rules', baseCount: 'Base plants', codeCount: 'Code slots',
        availableMerges: ' merges', recordedRounds: ' rounds', attemptsUnit: ' attempts', attemptsLabel: 'Attempts', visibleRules: ' rules', undoRound: 'Undo round',
        resetAssistant: 'Start over', newRound: 'New round', basePool: 'Base plant pool',
        enterFeedback: 'Enter this round’s feedback', firstRecommendation: 'Try this order first',
        currentGuess: 'Current guess', restoreRecommendation: 'Restore recommendation', selectMerge: 'Select merge', history: 'Guess history',
        mergeShelf: 'Available merges', feedbackPanel: 'Feedback console', recordFeedback: 'Record and calculate next round',
        contradictionHint: 'Undo the last round and check the feedback or plant order.',
        possibleSolutions: 'Possible orders', sampledSolutions: 'At least {count}', exactSolutions: '{count}', averageConfidence: 'Average confidence', confidenceValue: '{prefix}{value}% confidence',
        contradiction: 'No possible answer', contradictionDetail: 'At least one record conflicts with another', solvedTitle: 'Decoded', solvedDetail: 'Every slot is fully correct',
        certainSlots: '{count} slots confirmed',
        codeBoard: 'Decode history', solved: 'Solved', inProgress: 'In progress',
        emptySlot: 'Empty', mergeTray: 'Merge dock', clear: 'Clear', pickA: 'Choose A', pickB: 'Choose B', noMerge: 'No merge yet',
        confirm: 'Check guess', clearSlot: 'Clear active slot', showAnswer: 'Show answer', hideAnswer: 'Hide answer',
        rulesReference: 'All merge rules', currentRules: 'Current pool', allRules: 'All', plantA: 'Plant A', plantB: 'Plant B', result: 'Result',
        feedbackMeaning: 'Four feedback states',
        feedback: { correct: 'Correct', change: 'Moved', half: 'Partial', fault: 'Wrong' },
        feedbackHelp: { correct: 'Plant and slot both match', change: 'Plant exists in another slot', half: 'One of the two base plants matches', fault: 'Neither base plant matches' }
    },
    es: {
        title: 'Asistente de descifrado',
        assistantMode: 'Asistente', practiceMode: 'Práctica', rulesMode: 'Reglas', baseCount: 'Plantas base', codeCount: 'Ranuras',
        availableMerges: ' fusiones', recordedRounds: ' rondas', attemptsUnit: ' intentos', attemptsLabel: 'Intentos', visibleRules: ' reglas', undoRound: 'Deshacer ronda',
        resetAssistant: 'Reiniciar', newRound: 'Nueva ronda', basePool: 'Plantas base',
        enterFeedback: 'Introduce el resultado de la ronda', firstRecommendation: 'Prueba primero este orden',
        currentGuess: 'Intento actual', restoreRecommendation: 'Restaurar recomendación', selectMerge: 'Elegir', history: 'Historial de intentos',
        mergeShelf: 'Fusiones disponibles', feedbackPanel: 'Panel de resultados', recordFeedback: 'Registrar y calcular',
        contradictionHint: 'Deshaz la última ronda y comprueba el resultado o el orden.',
        possibleSolutions: 'Órdenes posibles', sampledSolutions: 'Al menos {count}', exactSolutions: '{count}', averageConfidence: 'Confianza media', confidenceValue: '{prefix}{value}% de confianza',
        contradiction: 'Sin respuesta posible', contradictionDetail: 'Algún registro contradice a otro', solvedTitle: 'Descifrado', solvedDetail: 'Todas las ranuras son correctas',
        certainSlots: '{count} ranuras confirmadas',
        codeBoard: 'Historial', solved: 'Resuelto', inProgress: 'En curso',
        emptySlot: 'Vacía', mergeTray: 'Fusión', clear: 'Limpiar', pickA: 'Elegir A', pickB: 'Elegir B', noMerge: 'Sin fusión',
        confirm: 'Comprobar', clearSlot: 'Limpiar ranura', showAnswer: 'Mostrar respuesta', hideAnswer: 'Ocultar respuesta',
        rulesReference: 'Todas las fusiones', currentRules: 'Actuales', allRules: 'Todas', plantA: 'Planta A', plantB: 'Planta B', result: 'Resultado',
        feedbackMeaning: 'Cuatro resultados',
        feedback: { correct: 'Correcto', change: 'Movido', half: 'Parcial', fault: 'Error' },
        feedbackHelp: { correct: 'Planta y posición coinciden', change: 'La planta está en otra ranura', half: 'Coincide una planta base', fault: 'No coincide ninguna planta base' }
    },
    ru: {
        title: 'Помощник расшифровки',
        assistantMode: 'Помощник', practiceMode: 'Тренировка', rulesMode: 'Правила', baseCount: 'Базовые', codeCount: 'Слоты',
        availableMerges: ' слияний', recordedRounds: ' раундов', attemptsUnit: ' попыток', attemptsLabel: 'Попытки', visibleRules: ' правил', undoRound: 'Отменить раунд',
        resetAssistant: 'Сначала', newRound: 'Новый раунд', basePool: 'Базовые растения',
        enterFeedback: 'Введите результат раунда', firstRecommendation: 'Начните с этого порядка',
        currentGuess: 'Текущая попытка', restoreRecommendation: 'Вернуть рекомендацию', selectMerge: 'Выбрать', history: 'История попыток',
        mergeShelf: 'Доступные слияния', feedbackPanel: 'Панель результата', recordFeedback: 'Записать и рассчитать',
        contradictionHint: 'Отмените последний раунд и проверьте результат или порядок.',
        possibleSolutions: 'Возможные порядки', sampledSolutions: 'Не менее {count}', exactSolutions: '{count}', averageConfidence: 'Средняя уверенность', confidenceValue: '{prefix}{value}% уверенности',
        contradiction: 'Решений нет', contradictionDetail: 'Записи противоречат друг другу', solvedTitle: 'Готово', solvedDetail: 'Все слоты верны',
        certainSlots: 'Точно: {count}',
        codeBoard: 'История', solved: 'Решено', inProgress: 'В процессе',
        emptySlot: 'Пусто', mergeTray: 'Слияние', clear: 'Очистить', pickA: 'Выбрать A', pickB: 'Выбрать B', noMerge: 'Нет слияния',
        confirm: 'Проверить', clearSlot: 'Очистить слот', showAnswer: 'Ответ', hideAnswer: 'Скрыть ответ',
        rulesReference: 'Все слияния', currentRules: 'Текущие', allRules: 'Все', plantA: 'Растение A', plantB: 'Растение B', result: 'Результат',
        feedbackMeaning: 'Четыре результата',
        feedback: { correct: 'Верно', change: 'Не на месте', half: 'Частично', fault: 'Ошибка' },
        feedbackHelp: { correct: 'Растение и слот верны', change: 'Растение находится в другом слоте', half: 'Совпало одно базовое растение', fault: 'Нет совпавших базовых растений' }
    }
} as const;

const i18nLanguage = inject('i18nLanguage', 'en') as string;
const localeKey = computed(() => (i18nLanguage in messages ? i18nLanguage : 'en') as keyof typeof messages);
const plantMap = computed<Record<string, any>>(() => getPlantMap(localeKey.value));
const imageAliasMap: Record<string, string> = { cherribomb: 'cherry_bomb' };
const basePool = decodingData.BASES as string[];
const allRules = decodingData.MERGES as MergeRule[];
const feedbackStates: FeedbackState[] = ['change', 'fault', 'half', 'correct'];

const t = (key: string, params?: Record<string, string | number>) => {
    const segments = key.split('.');
    let value: any = messages[localeKey.value];
    for (const segment of segments) value = value?.[segment];
    if (value === undefined) {
        value = messages.en;
        for (const segment of segments) value = value?.[segment];
    }
    const text = String(value ?? key);
    return params ? Object.entries(params).reduce((result, [name, replacement]) => result.replace(`{${name}}`, String(replacement)), text) : text;
};

const PlantToken = defineComponent({
    name: 'PlantToken',
    props: {
        plant: { type: Object as () => PlantView, required: true },
        compact: { type: Boolean, default: false },
        imageOnly: { type: Boolean, default: false }
    },
    setup(props) {
        return () => h('span', { class: ['plant-token', props.compact && 'compact', props.imageOnly && 'image-only'], title: props.plant.codename }, [
            props.plant.image
                ? h('img', { src: props.plant.image, alt: '', loading: 'lazy', 'aria-hidden': 'true' })
                : h('span', { class: 'plant-fallback', 'aria-hidden': 'true' }, props.plant.codename.slice(0, 2).toUpperCase()),
            !props.imageOnly && h('span', { class: 'plant-token-text' }, [h('strong', props.plant.name)])
        ]);
    }
});

function plantView(codename: string): PlantView {
    const lowerCodename = codename.toLowerCase();
    const displayCodename = imageAliasMap[codename] || imageAliasMap[lowerCodename] || lowerCodename;
    const plant = plantMap.value[codename] || plantMap.value[lowerCodename] || plantMap.value[displayCodename];
    return {
        codename,
        name: plant?.name || plant?.enName || codename,
        image: `/assets/image/plants/plants_${displayCodename}_c.webp`
    };
}

const plantName = (codename: string) => plantView(codename).name;
const feedbackSymbol = (state: FeedbackState) => ({ correct: '✓', change: '↔', half: '◐', fault: '⊘' })[state];

const toolMode = ref<ToolMode>('assistant');
const ruleScope = ref<RuleScope>('current');
const baseCount = ref(5);
const codeCount = ref(4);
const activeBasePlants = computed(() => basePool.slice(0, baseCount.value));
const availableRules = computed(() => allRules.filter(rule => activeBasePlants.value.includes(rule.PlantA) && activeBasePlants.value.includes(rule.PlantB)));
const visibleRules = computed(() => ruleScope.value === 'current' ? availableRules.value : allRules);
const toolModeOptions = computed(() => [
    { label: t('assistantMode'), value: 'assistant' },
    { label: t('practiceMode'), value: 'practice' },
    { label: t('rulesMode'), value: 'rules' }
]);
const ruleScopeOptions = computed(() => [
    { label: t('currentRules'), value: 'current' },
    { label: t('allRules'), value: 'all' }
]);

const assistantHistory = ref<RoundRecord[]>([]);
const assistantGuesses = ref<string[]>([]);
const assistantFeedback = ref<Array<FeedbackState | null>>([]);
const assistantActiveSlot = ref(0);
const assistantHistoryNewest = computed(() => assistantHistory.value.slice().reverse());
const assistantAnalysis = computed(() => analyzePuzzle(availableRules.value, codeCount.value, assistantHistory.value));
const assistantContradiction = computed(() => assistantAnalysis.value.contradiction);
const assistantSolved = computed(() => assistantHistory.value.at(-1)?.feedback.every(state => state === 'correct') || false);
const assistantLocked = computed(() => {
    const locked = Array(codeCount.value).fill(false);
    assistantHistory.value.forEach(round => round.feedback.forEach((state, index) => {
        if (state === 'correct') locked[index] = true;
    }));
    return locked;
});
const recommendedGuesses = computed(() => makeSuggestion(availableRules.value, assistantAnalysis.value, assistantLocked.value));
const assistantConfidence = computed(() => suggestionConfidence(assistantAnalysis.value, assistantGuesses.value));
const assistantAverageConfidence = computed(() => {
    if (!assistantConfidence.value.length) return 0;
    const average = assistantConfidence.value.reduce((sum: number, value: number) => sum + value, 0) / assistantConfidence.value.length;
    return Math.round(average * 100);
});
const confidencePrefix = computed(() => assistantAnalysis.value.truncated ? '≈' : '');
const assistantRecommendationMatches = computed(() => (
    recommendedGuesses.value.length === assistantGuesses.value.length
    && recommendedGuesses.value.every((target: string, index: number) => target === assistantGuesses.value[index])
));
const assistantCanSubmit = computed(() => (
    assistantGuesses.value.length === codeCount.value
    && assistantGuesses.value.every(Boolean)
    && new Set(assistantGuesses.value).size === codeCount.value
    && assistantFeedback.value.length === codeCount.value
    && assistantFeedback.value.every(Boolean)
));
const assistantStatusClass = computed(() => assistantContradiction.value ? 'danger' : assistantSolved.value ? 'success' : '');
const certainSlotCount = computed(() => assistantAnalysis.value.domains.filter((domain: string[]) => domain.length === 1).length);
const assistantStatusText = computed(() => assistantContradiction.value
    ? t('contradiction')
    : assistantSolved.value
        ? t('solvedTitle')
        : t('certainSlots', { count: certainSlotCount.value }));
const assistantSummaryTitle = computed(() => assistantContradiction.value
    ? t('contradiction')
    : assistantSolved.value
        ? t('solvedTitle')
        : t('possibleSolutions'));
const assistantSummaryDetail = computed(() => {
    if (assistantContradiction.value) return t('contradictionDetail');
    if (assistantSolved.value) return t('solvedDetail');
    const count = assistantAnalysis.value.sampleCount || 0;
    return assistantAnalysis.value.truncated ? t('sampledSolutions', { count }) : t('exactSolutions', { count });
});

function confidenceLabel(index: number) {
    return t('confidenceValue', {
        prefix: confidencePrefix.value,
        value: Math.round((assistantConfidence.value[index] || 0) * 100)
    });
}

function applyRecommendation() {
    if (assistantContradiction.value) return;
    assistantGuesses.value = recommendedGuesses.value.slice();
    assistantFeedback.value = Array.from({ length: codeCount.value }, (_, index) => assistantLocked.value[index] ? 'correct' : null);
    assistantActiveSlot.value = assistantLocked.value.findIndex(locked => !locked);
    if (assistantActiveSlot.value < 0) assistantActiveSlot.value = 0;
}

function resetAssistant() {
    assistantHistory.value = [];
    nextTick(applyRecommendation);
}

function undoAssistant() {
    assistantHistory.value.pop();
    nextTick(applyRecommendation);
}

function assistantTargetUsedElsewhere(target: string) {
    return assistantGuesses.value.some((guess, index) => guess === target && index !== assistantActiveSlot.value);
}

function selectAssistantTarget(target: string) {
    if (assistantLocked.value[assistantActiveSlot.value] || assistantTargetUsedElsewhere(target)) return;
    assistantGuesses.value[assistantActiveSlot.value] = target;
    assistantFeedback.value[assistantActiveSlot.value] = null;
    const next = assistantGuesses.value.findIndex((guess, index) => !guess && !assistantLocked.value[index]);
    if (next >= 0) assistantActiveSlot.value = next;
}

function setAssistantFeedback(state: FeedbackState) {
    const slot = assistantActiveSlot.value;
    if (assistantLocked.value[slot]) return;
    assistantFeedback.value[slot] = state;
    const next = assistantFeedback.value.findIndex((feedback, index) => !feedback && !assistantLocked.value[index]);
    if (next >= 0) assistantActiveSlot.value = next;
}

function submitAssistantRound() {
    if (!assistantCanSubmit.value || assistantContradiction.value) return;
    assistantHistory.value.push({
        index: assistantHistory.value.length + 1,
        guesses: assistantGuesses.value.slice(),
        feedback: assistantFeedback.value.slice() as FeedbackState[]
    });
    if (!assistantFeedback.value.every(state => state === 'correct')) nextTick(applyRecommendation);
}

const secretRules = ref<MergeRule[]>([]);
const practiceGuesses = ref<Array<string | null>>([]);
const practiceFeedback = ref<Array<FeedbackState | null>>([]);
const practiceAttempts = ref<RoundRecord[]>([]);
const practiceLocked = ref<boolean[]>([]);
const selectedPlants = ref<string[]>([]);
const practiceActiveSlot = ref(0);
const practiceStep = ref(0);
const practiceSolved = ref(false);
const practiceReward = ref(0);
const revealAnswer = ref(false);
const currentMerge = computed(() => selectedPlants.value.length === 2 ? findMerge(selectedPlants.value[0], selectedPlants.value[1]) : null);
const practiceCanConfirm = computed(() => practiceGuesses.value.every(Boolean) && practiceGuesses.value.length > 0 && !practiceSolved.value);

function shuffleRules(rules: MergeRule[]) {
    return rules.map(rule => ({ rule, weight: Math.random() })).sort((a, b) => a.weight - b.weight).map(item => item.rule);
}

function findMerge(a: string, b: string) {
    return allRules.find(rule => (rule.PlantA === a && rule.PlantB === b) || (rule.PlantA === b && rule.PlantB === a)) || null;
}

function startPractice() {
    secretRules.value = shuffleRules(availableRules.value).slice(0, Math.min(codeCount.value, availableRules.value.length));
    practiceGuesses.value = Array(secretRules.value.length).fill(null);
    practiceFeedback.value = Array(secretRules.value.length).fill(null);
    practiceLocked.value = Array(secretRules.value.length).fill(false);
    practiceAttempts.value = [];
    selectedPlants.value = [];
    practiceActiveSlot.value = 0;
    practiceStep.value = 0;
    practiceSolved.value = false;
    practiceReward.value = 0;
    revealAnswer.value = false;
}

function clearSelection() {
    selectedPlants.value = [];
}

function clearPracticeSlot(index: number) {
    if (practiceSolved.value || practiceLocked.value[index]) return;
    practiceGuesses.value[index] = null;
    practiceFeedback.value[index] = null;
}

function pickBase(codename: string) {
    if (toolMode.value !== 'practice' || practiceSolved.value) return;
    if (selectedPlants.value.length >= 2) selectedPlants.value = [];
    selectedPlants.value.push(codename);
    if (selectedPlants.value.length < 2) return;
    const merge = currentMerge.value;
    if (merge && !practiceLocked.value[practiceActiveSlot.value]) {
        practiceGuesses.value[practiceActiveSlot.value] = merge.Target;
        practiceFeedback.value[practiceActiveSlot.value] = null;
        const next = practiceGuesses.value.findIndex((guess, index) => !guess && !practiceLocked.value[index]);
        if (next >= 0) practiceActiveSlot.value = next;
    }
    selectedPlants.value = [];
}

function confirmPractice() {
    if (!practiceCanConfirm.value) return;
    const ruleMap = new Map(allRules.map(rule => [rule.Target, rule]));
    const judged = judgeAttempt(
        secretRules.value.map(rule => rule.Target),
        practiceGuesses.value as string[],
        ruleMap,
        practiceLocked.value
    );
    practiceStep.value += 1;
    practiceFeedback.value = judged.feedback;
    practiceLocked.value = judged.correct;
    practiceAttempts.value.unshift({
        index: practiceStep.value,
        guesses: (practiceGuesses.value as string[]).slice(),
        feedback: judged.feedback.slice()
    });
    practiceSolved.value = judged.feedback.every((state: FeedbackState) => state === 'correct');
    if (practiceSolved.value) {
        practiceReward.value = Math.round(secretRules.value.length * activeBasePlants.value.length * Math.exp(-Math.pow(practiceStep.value / 8, 2)));
        revealAnswer.value = true;
    } else {
        const next = practiceLocked.value.findIndex(locked => !locked);
        if (next >= 0) practiceActiveSlot.value = next;
    }
}

watch([baseCount, codeCount], () => {
    baseCount.value = Math.min(10, Math.max(3, Number(baseCount.value) || 5));
    codeCount.value = Math.min(10, Math.max(3, Number(codeCount.value) || 4));
    resetAssistant();
    startPractice();
});

onMounted(() => {
    resetAssistant();
    startPractice();
});
</script>

<style scoped>
.decoding-shell {
    --ink: #14232c;
    --muted: #647681;
    --steel: #344b59;
    --cyan: #17b9cc;
    --cyan-soft: #dff8fa;
    --surface: color-mix(in srgb, var(--vp-c-bg) 94%, #eaf4f4 6%);
    --surface-raised: color-mix(in srgb, var(--vp-c-bg) 88%, #f7fbfa 12%);
    --line: color-mix(in srgb, var(--vp-c-text) 15%, transparent);
    --correct: #43a52b;
    --change: #0aa9cf;
    --half: #c52acb;
    --fault: #e24545;
    --shell-width: min(1320px, calc(100vw - 64px));
    width: var(--shell-width);
    max-width: calc(100vw - 24px);
    margin: 8px auto 20px;
    margin-left: calc((100% - var(--shell-width)) / 2);
    color: var(--vp-c-text);
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", "Noto Sans SC", sans-serif;
}

[data-theme="dark"] .decoding-shell {
    --ink: #edf8f8;
    --muted: #9eb0b9;
    --steel: #263a45;
    --cyan: #31d2e0;
    --cyan-soft: #103f45;
    --surface: color-mix(in srgb, var(--vp-c-bg) 88%, #102e34 12%);
    --surface-raised: color-mix(in srgb, var(--vp-c-bg) 82%, #17343c 18%);
}

.tool-header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin: 0;
    border: 1px solid var(--line);
    border-bottom: 0;
    border-radius: 16px 16px 0 0;
    padding: 14px 16px 11px;
    background:
        linear-gradient(180deg, color-mix(in srgb, var(--surface-raised) 90%, var(--cyan) 10%), var(--surface-raised));
    overflow: hidden;
}

.tool-header::before {
    content: "";
    position: absolute;
    inset: 0 22px auto;
    height: 4px;
    border-radius: 0 0 999px 999px;
    background: var(--cyan);
}

.tool-header h1 {
    margin: 0;
    color: var(--ink);
    font-family: 'pvzgeFontEN', 'pvzgFont', "Noto Sans SC", sans-serif;
    font-size: clamp(1.35rem, 2.2vw, 1.8rem);
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: 0.01em;
}

.panel-kicker {
    color: var(--cyan);
    font-size: 0.68rem;
    font-weight: 750;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}

.mode-switch {
    flex: 0 0 auto;
    padding: 3px;
}

.mode-switch :deep(.ant-segmented-item-label) {
    min-width: 86px;
    min-height: 34px;
    line-height: 34px;
}

.control-band {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 0 0 12px;
    border: 1px solid var(--line);
    border-radius: 0 0 14px 14px;
    padding: 10px 12px;
    background: color-mix(in srgb, var(--surface-raised) 88%, transparent);
    backdrop-filter: blur(18px);
}

.number-control {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--muted);
    font-size: 0.78rem;
    font-weight: 650;
}

.number-control :deep(.ant-input-number) {
    width: 72px;
}

.quick-stats {
    display: flex;
    gap: 12px;
    color: var(--muted);
    font-size: 0.72rem;
}

.quick-stats span {
    display: flex;
    align-items: baseline;
    gap: 4px;
}

.quick-stats strong {
    color: var(--ink);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.95rem;
}

.control-actions {
    display: flex;
    gap: 8px;
    margin-left: auto;
}

.decoder-layout {
    display: grid;
    grid-template-columns: 180px minmax(0, 1fr) 244px;
    gap: 12px;
    align-items: start;
}

.console-panel {
    position: relative;
    border: 1px solid var(--line);
    border-radius: 18px;
    background: var(--surface);
    overflow: hidden;
}

.console-panel::before {
    content: "";
    position: absolute;
    inset: 0 16px auto;
    height: 3px;
    border-radius: 0 0 999px 999px;
    background: var(--cyan);
    opacity: 0.82;
}

.panel-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 15px 14px 10px;
}

.panel-heading h2 {
    margin: 2px 0 0;
    color: var(--ink);
    font-size: 0.9rem;
    line-height: 1.15;
}

.count-badge,
.active-slot-badge,
.reward-badge {
    display: grid;
    place-items: center;
    min-width: 30px;
    height: 30px;
    border-radius: 9px;
    background: var(--cyan-soft);
    color: color-mix(in srgb, var(--cyan) 70%, var(--ink));
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-weight: 800;
}

.base-rail {
    padding-bottom: 12px;
}

.base-list {
    display: grid;
    gap: 7px;
    max-height: 660px;
    padding: 0 10px;
    overflow-y: auto;
}

.base-card {
    appearance: none;
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr);
    align-items: center;
    gap: 6px;
    min-height: 52px;
    border: 1px solid var(--line);
    border-radius: 11px;
    padding: 5px;
    background: var(--surface-raised);
    color: var(--ink);
    text-align: left;
}

.base-card span:last-child {
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: 'pvzgeFontEN', 'pvzgFont', "Noto Sans SC", sans-serif;
    font-size: 0.88rem;
    font-weight: 650;
}

.base-card.interactive {
    cursor: pointer;
}

.base-card.interactive:hover,
.base-card.picked {
    border-color: var(--cyan);
    background: var(--cyan-soft);
}

.status-hint {
    margin: 10px 12px 0;
    color: var(--muted);
    font-size: 0.68rem;
    line-height: 1.45;
}

.decode-stage {
    min-width: 0;
}

.stage-heading {
    padding-inline: 18px;
}

.live-status {
    border-radius: 999px;
    padding: 5px 9px;
    background: var(--cyan-soft);
    color: color-mix(in srgb, var(--cyan) 75%, var(--ink));
    font-size: 0.68rem;
    font-weight: 750;
}

.live-status.success { background: color-mix(in srgb, var(--correct) 15%, var(--surface)); color: var(--correct); }
.live-status.danger { background: color-mix(in srgb, var(--fault) 15%, var(--surface)); color: var(--fault); }

.history-chamber {
    box-sizing: border-box;
    display: grid;
    align-content: start;
    gap: 8px;
    min-height: 104px;
    max-height: 365px;
    margin: 0 14px;
    border: 1px solid color-mix(in srgb, var(--steel) 55%, transparent);
    border-radius: 15px;
    padding: 12px;
    background:
        linear-gradient(180deg, color-mix(in srgb, #09141a 88%, var(--cyan) 12%), #101c23),
        var(--steel);
    box-shadow: inset 0 12px 28px rgb(0 0 0 / 24%);
    overflow: auto;
}

.history-chamber.empty { align-content: center; }

.attempt-record {
    display: grid;
    grid-template-columns: 30px minmax(0, 1fr);
    gap: 8px;
    align-items: center;
}

.attempt-number {
    color: #8ba2ad;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.68rem;
}

.record-slots {
    display: grid;
    grid-template-columns: repeat(var(--slot-count, 10), minmax(38px, 1fr));
    gap: 5px;
}

.record-card {
    position: relative;
    display: grid;
    place-items: center;
    min-height: 58px;
    border: 1px solid rgb(255 255 255 / 12%);
    border-radius: 8px;
    background: #eef1e9;
}

.record-card :deep(.plant-token.compact.image-only) {
    grid-template-columns: 42px;
}

.record-card :deep(.plant-token.compact img),
.record-card :deep(.plant-token.compact .plant-fallback) {
    width: 42px;
    height: 42px;
}

.feedback-mark {
    position: absolute;
    right: -2px;
    bottom: -3px;
    display: grid;
    place-items: center;
    width: 18px;
    height: 18px;
    border: 2px solid #16242c;
    border-radius: 50%;
    background: #15232b;
    font-size: 0.7rem;
    font-weight: 900;
}

.state-correct { color: var(--correct) !important; }
.state-change { color: var(--change) !important; }
.state-half { color: var(--half) !important; }
.state-fault { color: var(--fault) !important; }

.current-deck,
.merge-shelf,
.fusion-dock {
    margin: 10px 14px 0;
    border: 1px solid var(--line);
    border-radius: 14px;
    padding: 10px;
    background: var(--surface-raised);
}

.deck-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 8px;
    color: var(--ink);
    font-size: 0.75rem;
    font-weight: 750;
}

.deck-label small {
    color: var(--muted);
    font-size: 0.65rem;
    font-weight: 500;
}

.text-button,
.reveal-button {
    appearance: none;
    border: 0;
    padding: 4px;
    background: transparent;
    color: var(--cyan);
    cursor: pointer;
    font: inherit;
}

.decode-slots {
    display: grid;
    grid-template-columns: repeat(var(--slot-count), minmax(76px, 1fr));
    gap: 7px;
    overflow-x: auto;
    padding: 2px;
}

.decode-card {
    appearance: none;
    position: relative;
    display: grid;
    place-items: center;
    min-width: 76px;
    min-height: 102px;
    border: 2px solid var(--line);
    border-radius: 11px;
    padding: 12px 5px 20px;
    background: color-mix(in srgb, var(--surface-raised) 82%, #f2f0df 18%);
    color: var(--ink);
    cursor: pointer;
    transition: border-color 150ms ease, transform 150ms ease;
}

.decode-card :deep(.plant-token.compact) {
    grid-template-columns: 42px minmax(0, 1fr);
}

.decode-card :deep(.plant-token.compact img),
.decode-card :deep(.plant-token.compact .plant-fallback) {
    width: 42px;
    height: 42px;
}

.decode-card:hover { border-color: var(--cyan); }
.decode-card.active { border-color: var(--cyan); box-shadow: 0 0 0 3px color-mix(in srgb, var(--cyan) 18%, transparent); transform: translateY(-2px); }
.decode-card.locked { border-color: var(--correct); }
.decode-card.state-change { border-color: var(--change); }
.decode-card.state-half { border-color: var(--half); }
.decode-card.state-fault { border-color: var(--fault); }
.decode-card.state-correct { border-color: var(--correct); }

.slot-number {
    position: absolute;
    top: 4px;
    left: 6px;
    color: var(--muted);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.63rem;
}

.slot-feedback {
    position: absolute;
    right: 4px;
    bottom: 4px;
    left: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.6rem;
    font-weight: 800;
}

.slot-feedback.confidence,
.slot-placeholder { color: var(--muted); font-size: 0.66rem; font-weight: 500; }

.merge-shelf {
    margin-bottom: 14px;
}

.merge-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
    gap: 7px;
    max-height: 288px;
    overflow: auto;
}

.merge-option {
    appearance: none;
    display: grid;
    grid-template-columns: 40px minmax(0, 1fr);
    grid-template-rows: auto auto;
    align-items: center;
    gap: 0 5px;
    min-height: 58px;
    border: 1px solid var(--line);
    border-radius: 9px;
    padding: 5px 6px;
    background: var(--surface);
    color: var(--ink);
    cursor: pointer;
    text-align: left;
}

.merge-option:hover,
.merge-option.selected { border-color: var(--cyan); background: var(--cyan-soft); }
.merge-option:disabled { cursor: not-allowed; opacity: 0.38; }
.merge-option > .plant-token { grid-row: 1 / 3; }
.merge-option :deep(.plant-token.compact.image-only) { grid-template-columns: 40px; }
.merge-option :deep(.plant-token.compact img), .merge-option :deep(.plant-token.compact .plant-fallback) { width: 40px; height: 40px; }
.merge-option > span:not(.plant-token) { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: 'pvzgeFontEN', 'pvzgFont', "Noto Sans SC", sans-serif; font-size: 0.88rem; font-weight: 700; }
.merge-option small { color: var(--muted); font-family: 'pvzgeFontEN', 'pvzgFont', "Noto Sans SC", sans-serif; font-size: 0.68rem; line-height: 1.25; overflow-wrap: anywhere; }

.status-rail {
    padding-bottom: 14px;
}

.active-slot-badge {
    background: var(--ink);
    color: var(--surface);
    font-size: 1rem;
}

.solver-summary {
    display: grid;
    gap: 3px;
    margin: 0 10px 10px;
    border-radius: 11px;
    padding: 10px;
    background: var(--cyan-soft);
}

.solver-summary strong { color: var(--ink); font-size: 0.78rem; }
.solver-summary span { color: var(--muted); font-size: 0.65rem; }
.solver-summary.danger { background: color-mix(in srgb, var(--fault) 13%, var(--surface)); }
.solver-summary.solved { background: color-mix(in srgb, var(--correct) 13%, var(--surface)); }

.solver-confidence {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    margin-top: 5px;
    border-top: 1px solid color-mix(in srgb, var(--cyan) 20%, transparent);
    padding-top: 6px;
}

.solver-confidence b {
    color: var(--ink);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.82rem;
}

.feedback-buttons {
    display: grid;
    gap: 6px;
    padding: 0 10px;
}

.feedback-button {
    appearance: none;
    display: grid;
    grid-template-columns: 32px minmax(0, 1fr);
    align-items: center;
    min-height: 44px;
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 5px 8px;
    background: var(--surface-raised);
    color: var(--ink);
    cursor: pointer;
    font-size: 0.72rem;
    font-weight: 720;
    text-align: left;
}

.feedback-button span { font-size: 1.25rem; text-align: center; }
.feedback-button:hover { border-color: currentColor; }
.feedback-button:disabled { cursor: default; opacity: 0.4; }

.domain-list {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 4px;
    margin: 10px;
}

.domain-list span {
    display: grid;
    place-items: center;
    border-radius: 7px;
    padding: 4px 2px;
    background: var(--surface-raised);
    color: var(--muted);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.6rem;
}

.domain-list b { color: var(--ink); font-size: 0.65rem; }
.domain-list .certain { background: color-mix(in srgb, var(--correct) 14%, var(--surface)); color: var(--correct); }

.primary-action,
.secondary-action {
    width: calc(100% - 20px);
    min-height: 46px;
    margin: 0 10px 8px;
}

.primary-action {
    font-weight: 750;
}

.feedback-legend {
    display: grid;
    gap: 7px;
    margin: 0 10px 12px;
}

.feedback-legend > span {
    display: flex;
    align-items: center;
    gap: 7px;
    min-height: 34px;
    border-radius: 9px;
    padding: 5px 7px;
    background: var(--surface-raised);
    font-size: 0.68rem;
    font-weight: 700;
}

.feedback-legend b { width: 22px; font-size: 1rem; text-align: center; }
.feedback-legend.explanatory > span { display: grid; grid-template-columns: 24px 1fr; }
.feedback-legend.explanatory span span { display: grid; gap: 1px; }
.feedback-legend.explanatory strong { color: var(--ink); }
.feedback-legend.explanatory small { color: var(--muted); font-size: 0.58rem; font-weight: 500; line-height: 1.3; }

.attempt-display { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 2rem !important; }
.reward-badge { width: auto; padding-inline: 7px; color: var(--correct); }

.reveal-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    width: calc(100% - 20px);
    min-height: 40px;
    margin: 8px 10px 0;
}

.answer-list {
    display: grid;
    gap: 4px;
    max-height: 230px;
    margin: 8px 10px 0;
    padding: 0;
    overflow: auto;
    list-style: none;
}

.answer-list li {
    display: grid;
    grid-template-columns: 20px 1fr;
    align-items: center;
    border-radius: 8px;
    padding: 4px;
    background: var(--surface-raised);
    color: var(--muted);
    font-size: 0.65rem;
}

.fusion-dock { margin-bottom: 14px; }
.fusion-equation { display: grid; grid-template-columns: 1fr auto 1fr auto 1.2fr; gap: 7px; align-items: center; }
.fusion-equation > b { color: var(--cyan); }
.fusion-cell { display: grid; place-items: center; min-height: 64px; border: 1px dashed var(--line); border-radius: 10px; color: var(--muted); font-size: 0.7rem; }
.fusion-cell.result.ready { border-style: solid; border-color: var(--cyan); background: var(--cyan-soft); }

.rules-table-wrap {
    max-height: 680px;
    margin: 0 14px 14px;
    border: 1px solid var(--line);
    border-radius: 13px;
    overflow: auto;
}

.rules-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.rules-table th, .rules-table td { border-bottom: 1px solid var(--line); padding: 8px; text-align: center; }
.rules-table th { position: sticky; top: 0; z-index: 1; background: var(--surface-raised); color: var(--muted); font-size: 0.7rem; }
.rules-table tr:last-child td { border-bottom: 0; }
.rules-table .result-cell { background: color-mix(in srgb, var(--cyan-soft) 42%, transparent); }

:deep(.plant-token) {
    display: inline-grid;
    grid-template-columns: 44px minmax(0, 1fr);
    align-items: center;
    gap: 5px;
    max-width: 100%;
}

:deep(.plant-token.image-only) { grid-template-columns: 44px; }
:deep(.plant-token.compact) { grid-template-columns: 36px minmax(0, 1fr); }
:deep(.plant-token.compact.image-only) { grid-template-columns: 36px; }
:deep(.plant-token img), :deep(.plant-fallback) { width: 44px; height: 44px; object-fit: contain; }
:deep(.plant-token.compact img), :deep(.plant-token.compact .plant-fallback) { width: 36px; height: 36px; }
:deep(.plant-fallback) { display: grid; place-items: center; border-radius: 8px; background: var(--cyan-soft); color: var(--cyan); font-size: 0.65rem; font-weight: 800; }
:deep(.plant-token-text) { min-width: 0; }
:deep(.plant-token-text strong) { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--ink); font-family: 'pvzgeFontEN', 'pvzgFont', "Noto Sans SC", sans-serif; font-size: clamp(0.86rem, 0.95vw, 0.95rem); }

button:focus-visible,
:deep(.ant-btn:focus-visible),
:deep(.ant-segmented:focus-visible) {
    outline: 3px solid color-mix(in srgb, var(--cyan) 36%, transparent);
    outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
    .decode-card { transition: none; }
}

@media (max-width: 1180px) {
    .decoding-shell { --shell-width: min(1020px, calc(100vw - 32px)); }
    .decoder-layout { grid-template-columns: 160px minmax(0, 1fr) 220px; }
}

@media (max-width: 880px) {
    .decoding-shell { width: 100%; max-width: 100%; margin-left: 0; }
    .tool-header { align-items: stretch; padding-inline: 12px; }
    .control-band { flex-wrap: wrap; }
    .quick-stats { order: 3; width: 100%; }
    .decoder-layout { grid-template-columns: 1fr; }
    .base-rail { order: 1; }
    .decode-stage { order: 2; }
    .status-rail { order: 3; }
    .base-list { display: flex; max-height: none; overflow-x: auto; }
    .base-card { flex: 0 0 86px; grid-template-columns: 1fr; justify-items: center; text-align: center; }
    .status-rail .feedback-buttons { grid-template-columns: repeat(4, 1fr); }
    .feedback-button { grid-template-columns: 1fr; justify-items: center; text-align: center; }
    .domain-list { grid-template-columns: repeat(10, 1fr); }
    .status-rail { padding-bottom: max(14px, env(safe-area-inset-bottom)); }
}

@media (max-width: 620px) {
    .tool-header { display: grid; gap: 12px; margin-inline: 0; padding: 13px 10px 10px; }
    .mode-switch { width: 100%; }
    .mode-switch :deep(.ant-segmented-group) { display: grid; grid-template-columns: repeat(3, 1fr); }
    .mode-switch :deep(.ant-segmented-item-label) { min-width: 0; }
    .control-band { gap: 9px; margin-inline: 0; border-radius: 0 0 12px 12px; }
    .number-control { flex: 1 1 130px; justify-content: space-between; }
    .control-actions { width: 100%; margin-left: 0; }
    .control-actions :deep(.ant-btn) { flex: 1; }
    .decoder-layout { gap: 9px; }
    .console-panel { border-radius: 14px; }
    .history-chamber { min-height: 96px; max-height: 260px; margin-inline: 8px; }
    .current-deck, .merge-shelf, .fusion-dock { margin-inline: 8px; }
    .decode-slots { grid-template-columns: repeat(var(--slot-count), minmax(68px, 1fr)); }
    .decode-card { min-width: 68px; min-height: 92px; }
    .merge-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); max-height: 270px; }
    .status-rail .feedback-buttons { grid-template-columns: repeat(2, 1fr); }
    .feedback-button { min-height: 52px; }
    .domain-list { grid-template-columns: repeat(5, 1fr); }
    .fusion-equation { grid-template-columns: 1fr auto 1fr; }
    .fusion-equation > b:nth-of-type(2), .fusion-cell.result { grid-column: span 1; }
    .fusion-cell.result { grid-column: 1 / -1; }
    .rules-table th, .rules-table td { padding: 6px 3px; }
}
</style>
