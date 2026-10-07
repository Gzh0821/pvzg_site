<template>
    <a-alert v-if="!editable" :message="t('garden version note', { version: layout.version })" type="warning" />
    <template v-else>
        <a-flex gap="small" wrap="wrap" class="garden-toolbar">
            <a-select v-model:value="garden" :options="gardens" style="min-width:160px" @change="selected = 0" />
            <a-button @click="unlockAll">{{ t('unlock garden slots') }}</a-button>
            <a-button :disabled="!plants.length" @click="plants.forEach(p => maturePlant(p))">{{ t('mature garden') }}</a-button>
        </a-flex>
        <div class="garden-layout">
        <div class="garden-body">
        <div class="garden-grid">
            <button v-for="(slot, pos) in layout.slots[garden]" :key="pos" type="button"
                class="garden-slot" :class="{ selected: selected === pos }" :aria-pressed="selected === pos" @click="selectSlot(pos)">
                <span class="slot-number">{{ pos + 1 }}</span><LockOutlined v-if="!isUnlocked(pos)" class="slot-lock" />
                <img v-if="plantAt(pos)?.plant && features[plantAt(pos).plant]" alt=""
                    :src="'/assets/image/plants/plants_' + plantAt(pos).plant + '_c.webp'" />
                <span>{{ plantAt(pos) ? plantName(plantAt(pos)) : t(isUnlocked(pos) ? 'empty slot' : 'locked') }}</span>
            </button>
        </div>
        <a-button class="cart-button" :type="selected === -1 ? 'primary' : 'default'" @click="selectSlot(-1)">
            {{ t('garden cart') }}: {{ zen.plantInCart ? plantName(zen.plantInCart) : t('empty slot') }}
        </a-button>
        </div>
        <component :is="compact ? Drawer : 'aside'" v-bind="compact ? { open: inspectorOpen, placement: 'right', width: 'min(360px, 100vw)', title: t('garden editor') } : {}" @close="inspectorOpen = false">
        <div class="garden-detail">
            <a-flex gap="small" align="center" wrap="wrap">
                <strong>{{ selected === -1 ? t('garden cart') : t('garden slot', { slot: selected + 1 }) }}</strong>
                <a-switch v-if="selected >= 0" :checked="isUnlocked(selected)" :disabled="!!currentPlant || layout.slots[garden][selected].unlocked"
                    :checked-children="t('unlocked')" :un-checked-children="t('locked')" @change="setUnlocked(selected, !!$event)" />
                <span v-if="currentPlant" class="growth-state">{{ t(currentPlant.grownTime >= fullGrowthTime ? 'garden mature' : 'garden growing') }}</span>
            </a-flex>
            <div class="garden-plant-name" v-if="currentPlant">{{ plantName(currentPlant) }}</div>
            <label class="garden-field-label">{{ t('garden plant label') }}</label>
            <a-flex gap="small" wrap="wrap" class="garden-toolbar">
                <a-select v-model:value="chosenPlant" :options="availablePlants" show-search :filter-option="filterPlant"
                    :placeholder="t('select plant')" style="width:100%" />
                <a-button :disabled="!chosenPlant || (selected >= 0 && !isUnlocked(selected))" @click="putPlant">
                    {{ t(currentPlant ? 'replace plant' : 'add') }}
                </a-button>
                <a-button :disabled="!currentPlant" @click="maturePlant(currentPlant)">{{ t('mature plant') }}</a-button>
                <a-button danger :disabled="!currentPlant" @click="removeCurrent">{{ t('delete') }}</a-button>
            </a-flex>
            <label v-if="currentPlant" class="garden-field-label">{{ t('move to') }}</label>
            <a-flex v-if="currentPlant" gap="small" wrap="wrap">
                <a-select v-model:value="destination" :options="destinations" :placeholder="t('move destination')" style="width:100%" />
                <a-button :disabled="!destination" @click="movePlant">{{ t('move plant') }}</a-button>
            </a-flex>
        </div>
        </component>
        </div>
    </template>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { Drawer } from 'ant-design-vue';
import { LockOutlined } from '@ant-design/icons-vue';
import layout from './garden-layout.json';
import { gardenFields, canPlant, makeGardenPlant, maturePlant, fullGrowthTime } from './save-state.mjs';
const props = defineProps<{ zen: any; features: Record<string, any>; plantOptions: any[]; t: (key: string, values?: any) => string; editable: boolean }>();
const compact = ref(false);
const inspectorOpen = ref(false);
let media: MediaQueryList;
const updateCompact = () => { compact.value = media.matches; };
onMounted(() => {
    media = window.matchMedia('(max-width: 719px)');
    updateCompact();
    media.addEventListener('change', updateCompact);
});
onUnmounted(() => media?.removeEventListener('change', updateCompact));
const selectSlot = (pos: number) => { selected.value = pos; inspectorOpen.value = true; };
const garden = ref(0);
const selected = ref(0);
const chosenPlant = ref<string>();
const destination = ref<string>();
const gardens = computed(() => gardenFields.map((name: string, id: number) => ({ value: id, label: props.t('garden ' + name) })));
const plants = computed<any[]>(() => props.zen['plantsIn' + gardenFields[garden.value]] || []);
const plantAt = (pos: number) => plants.value.find(p => p.pos === pos && p.inZen === garden.value);
const currentPlant = computed(() => selected.value === -1 ? props.zen.plantInCart : plantAt(selected.value));
const isUnlocked = (pos: number, id = garden.value) => layout.slots[id][pos].unlocked || !!props.zen['slotsIn' + gardenFields[id]]?.[pos]?.unlocked;
const plantName = (plant: any) => props.plantOptions.find(p => p.value === plant.plant)?.label || plant.plant || `ID ${plant.ID}`;
const availablePlants = computed(() => props.plantOptions.filter(p => selected.value === -1
    ? !!props.features[p.value]?.ZENGARDEN?.PlantPlace && props.features[p.value].ZENGARDEN.PlantPlace !== 'none'
    : canPlant(props.features[p.value], layout.slots[garden.value][selected.value])));
const filterPlant = (query: string, option: any) => `${option.label} ${option.value}`.toLowerCase().includes(query.toLowerCase());
watch([garden, selected, () => props.zen], () => { chosenPlant.value = undefined; destination.value = undefined; });
const setUnlocked = (pos: number, unlocked: boolean) => {
    const key = 'slotsIn' + gardenFields[garden.value];
    props.zen[key] ||= [];
    for (let i = props.zen[key].length; i <= pos; i++) props.zen[key].push({ unlocked: layout.slots[garden.value][i].unlocked });
    props.zen[key][pos].unlocked = unlocked;
};
const unlockAll = () => layout.slots[garden.value].forEach((_, pos) => setUnlocked(pos, true));
const removeCurrent = () => {
    if (selected.value === -1) props.zen.plantInCart = null;
    else {
        const index = plants.value.indexOf(currentPlant.value);
        if (index >= 0) plants.value.splice(index, 1);
    }
};
const putPlant = () => {
    if (!chosenPlant.value || !availablePlants.value.some(p => p.value === chosenPlant.value)) return;
    if (selected.value >= 0 && !isUnlocked(selected.value)) return;
    const plant = { ...currentPlant.value, ...makeGardenPlant(chosenPlant.value, garden.value, Math.max(0, selected.value)) };
    delete plant.ID;
    if (props.features[chosenPlant.value]?.ZENGARDEN?.PlantPlace === 'float') plant.waterLeftTime = -1;
    removeCurrent();
    if (selected.value === -1) props.zen.plantInCart = plant;
    else {
        const key = 'plantsIn' + gardenFields[garden.value];
        props.zen[key] ||= [];
        props.zen[key].push(plant);
    }
};
const destinations = computed(() => {
    if (!currentPlant.value || !props.features[currentPlant.value.plant]) return [];
    const options = props.zen.plantInCart ? [] : [{ value: 'cart', label: props.t('garden cart') }];
    layout.slots.forEach((slots, id) => slots.forEach((slot, pos) => {
        const occupied = (props.zen['plantsIn' + gardenFields[id]] || []).some((p: any) => p.pos === pos);
        if (!occupied && isUnlocked(pos, id) && canPlant(props.features[currentPlant.value.plant], slot)) {
            options.push({ value: `${id}:${pos}`, label: `${props.t('garden ' + gardenFields[id])} · ${pos + 1}` });
        }
    }));
    return options;
});
const movePlant = () => {
    if (!currentPlant.value || !destinations.value.some(p => p.value === destination.value)) return;
    const plant = currentPlant.value;
    const target = destination.value;
    removeCurrent();
    if (target === 'cart') props.zen.plantInCart = plant;
    else {
        const [id, pos] = target!.split(':').map(Number);
        plant.inZen = id;
        plant.pos = pos;
        const key = 'plantsIn' + gardenFields[id];
        props.zen[key] ||= [];
        props.zen[key].push(plant);
    }
    destination.value = undefined;
};
</script>

<style scoped>
.garden-toolbar { margin: 0 0 1rem; }
.garden-layout { display: grid; grid-template-columns: minmax(0, 1fr); gap: 1rem; align-items: start; }
.garden-body { min-width: 0; }
.garden-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(66px, 1fr)); gap: .5rem; }
.garden-slot { position: relative; min-height: 88px; padding: 1.25rem .3rem .5rem; border: 1px solid var(--tool-border); border-radius: 14px; background: var(--tool-panel); color: inherit; font: inherit; font-size: .75rem; cursor: pointer; touch-action: manipulation; overflow-wrap: anywhere; transition: background 120ms, transform 120ms; }
.garden-slot.selected { border-color: var(--tool-accent); background: var(--tool-accent-surface); box-shadow: inset 0 0 0 1px var(--tool-accent); }
.garden-slot:hover { background: var(--tool-accent-surface); }
.garden-slot:active { transform: scale(.95); transition-duration: 60ms; }
.garden-slot:focus-visible { outline: 2px solid var(--tool-accent); outline-offset: 2px; }
.garden-slot img { display: block; width: 44px; height: 44px; object-fit: contain; margin: 0 auto .25rem; }
.slot-number { position: absolute; top: .25rem; left: .5rem; color: var(--tool-muted); font-variant-numeric: tabular-nums; }
.slot-lock { position: absolute; top: .3rem; right: .4rem; color: var(--tool-muted); font-size: .65rem; }
.cart-button { margin: 1rem 0; }
.garden-detail { border: 1px solid var(--tool-border, var(--vp-c-divider)); border-radius: 18px; background: var(--tool-panel, var(--vp-c-bg-soft)); padding: 1rem; }
.garden-detail .garden-toolbar { margin: .5rem 0 1rem; }
.garden-plant-name { font-size: 1.125rem; font-weight: 650; margin: 1rem 0; }
.garden-field-label { display: block; color: var(--tool-muted, var(--vp-c-text-mute)); font-size: .8125rem; margin-top: 1rem; }
.growth-state { border-radius: 999px; background: var(--tool-accent-surface, var(--vp-c-accent-soft)); color: var(--tool-accent-strong, var(--vp-c-accent)); padding: .2rem .5rem; font-size: .75rem; }
@container editor-content (min-width: 650px) {
    .garden-layout { grid-template-columns: minmax(0, 1fr) 242px; }
    aside { position: sticky; top: 5rem; }
}
@media (prefers-reduced-motion: reduce) {
    .garden-slot { transition: none; transform: none !important; }
}
</style>
