// The editor accepts a single player exported by the game, not a settings/cloud container.
export const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const nonnegativeInteger = value => Number.isSafeInteger(value) && value >= 0;
export const gardenFields = ['Main', 'Mushroom', 'Beach', 'Night'];
export const fullGrowthTime = 24 * 60 * 60 * 1000;

export function validateSave(data) {
    const errors = [];
    if (!isRecord(data) || typeof data.name !== 'string' || !isRecord(data.plantProps)
        || !isRecord(data.worldProps) || !isRecord(data.levelProps)) return ['save'];
    for (const field of ['worldkey', 'gem', 'coin', 'sprout']) {
        if (data[field] !== undefined && !nonnegativeInteger(data[field])) errors.push(field);
    }
    if (data.version !== undefined && typeof data.version !== 'string') errors.push('version');
    for (const field of ['tutorial', 'features', 'date', 'zombieProps', 'player_upgrades', 'player_trophies', 'zengarden']) {
        if (data[field] !== undefined && !isRecord(data[field])) errors.push(field);
    }
    for (const field of ['worldProgress', 'cardDecks', 'memoryPlantChoose']) {
        if (data[field] !== undefined && !Array.isArray(data[field])) errors.push(field);
    }
    for (const [id, entry] of Object.entries(data.plantProps)) {
        if (!isRecord(entry) || !Number.isInteger(entry.progress) || entry.progress < 0 || entry.progress > 2) errors.push(`plantProps.${id}`);
    }
    for (const [id, entry] of Object.entries(data.levelProps)) {
        if (!isRecord(entry) || !Number.isInteger(entry.progress) || entry.progress < 0 || entry.progress > 4) errors.push(`levelProps.${id}`);
    }
    for (const [id, entry] of Object.entries(data.worldProps)) {
        if (/^\d+$/.test(id) && (!isRecord(entry) || typeof entry.unlocked !== 'boolean')) errors.push(`worldProps.${id}`);
    }
    for (const field of ['player_upgrades', 'player_trophies']) {
        if (isRecord(data[field])) for (const [id, entry] of Object.entries(data[field])) {
            if (!isRecord(entry) || !Number.isInteger(entry.progress) || entry.progress < 0 || entry.progress > 2
                || (field === 'player_upgrades' && entry.enabled !== undefined && typeof entry.enabled !== 'boolean')) errors.push(`${field}.${id}`);
        }
    }
    if (data.arcade_plant_decoding !== undefined) {
        const daily = data.arcade_plant_decoding;
        if (!isRecord(daily)) errors.push('arcade_plant_decoding');
        else {
            if (daily.played_today !== undefined && typeof daily.played_today !== 'boolean') errors.push('arcade_plant_decoding.played_today');
            if (daily.gem_today !== undefined && !nonnegativeInteger(daily.gem_today)) errors.push('arcade_plant_decoding.gem_today');
            for (const field of ['max_base_count', 'max_code_count']) {
                if (daily[field] !== undefined && (!Number.isInteger(daily[field]) || daily[field] < 3 || daily[field] > 10)) errors.push(`arcade_plant_decoding.${field}`);
            }
        }
    }
    if (data.yeti_spawned_today !== undefined && typeof data.yeti_spawned_today !== 'boolean') errors.push('yeti_spawned_today');
    if (isRecord(data.features)) for (const [key, value] of Object.entries(data.features)) {
        if (typeof value !== 'boolean') errors.push(`features.${key}`);
    }
    if (isRecord(data.tutorial)) for (const [key, value] of Object.entries(data.tutorial)) {
        if (typeof value !== 'boolean') errors.push(`tutorial.${key}`);
    }
    if (isRecord(data.zengarden)) {
        for (const suffix of gardenFields) for (const prefix of ['plantsIn', 'slotsIn']) {
            const field = prefix + suffix;
            if (data.zengarden[field] !== undefined && !Array.isArray(data.zengarden[field])) errors.push(`zengarden.${field}`);
        }
        if (data.zengarden.plantInCart != null && !isRecord(data.zengarden.plantInCart)) errors.push('zengarden.plantInCart');
    }
    return errors;
}

export function canPlant(feature, slot) {
    const place = feature?.ZENGARDEN?.PlantPlace;
    if (!place || place === 'none') return false;
    if (slot.groundType === 0) return true;
    return (slot.groundType === 2 ? ['solid', 'dirt', 'fly'] : ['dirt', 'fly']).includes(place);
}

export function gardenIssues(zen, layouts, features) {
    if (!isRecord(zen)) return [];
    const issues = [];
    const checkPlant = (plant, path) => {
        if (typeof plant.plant !== 'string' && !nonnegativeInteger(plant.ID)) issues.push(`${path}: plant`);
        for (const field of ['grownTime', 'oldTime', 'waterCD']) {
            if (plant[field] !== undefined && (!Number.isFinite(plant[field]) || plant[field] < 0)) issues.push(`${path}: ${field}`);
        }
        if (plant.stuck !== undefined && typeof plant.stuck !== 'boolean') issues.push(`${path}: stuck`);
        if (plant.requirement !== undefined && (!Number.isInteger(plant.requirement) || plant.requirement < 0 || plant.requirement > 3)) issues.push(`${path}: requirement`);
        if (plant.waterLeftTime !== undefined && (!Number.isInteger(plant.waterLeftTime) || plant.waterLeftTime < -1 || plant.waterLeftTime > 3)) issues.push(`${path}: waterLeftTime`);
    };
    if (isRecord(zen.plantInCart)) checkPlant(zen.plantInCart, 'zengarden.plantInCart');
    gardenFields.forEach((suffix, id) => {
        const seen = new Set();
        const slots = zen['slotsIn' + suffix] || [];
        for (const plant of zen['plantsIn' + suffix] || []) {
            const path = `zengarden.plantsIn${suffix}`;
            if (!isRecord(plant)) { issues.push(path); continue; }
            const slot = layouts[id][plant.pos];
            if (!slot || !nonnegativeInteger(plant.pos) || plant.inZen !== id || seen.has(plant.pos)) issues.push(`${path}: position`);
            else {
                if (!(slot.unlocked || slots[plant.pos]?.unlocked)) issues.push(`${path}[${plant.pos}]: locked`);
                // Unknown datapack plants are preserved; their placement cannot be verified here.
                if (features[plant.plant] && !canPlant(features[plant.plant], slot)) issues.push(`${path}[${plant.pos}]: plant`);
            }
            seen.add(plant.pos);
            checkPlant(plant, path);
        }
        slots.forEach((slot, pos) => {
            if (!isRecord(slot) || typeof slot.unlocked !== 'boolean') issues.push(`zengarden.slotsIn${suffix}[${pos}]`);
        });
    });
    return issues;
}

export function makeGardenPlant(plant, garden, pos, now = Date.now()) {
    return { plant, inZen: garden, pos, grownTime: 0, oldTime: now, stuck: true,
        waterCD: 0, waterLeftTime: 3, requirement: 0 };
}
export function maturePlant(plant, now = Date.now()) {
    Object.assign(plant, { grownTime: fullGrowthTime + 1, oldTime: now, stuck: false, waterCD: 0, waterLeftTime: 0, requirement: 0 });
}

export function diffSave(before, after, path = '') {
    if (JSON.stringify(before) === JSON.stringify(after)) return [];
    if (isRecord(before) && isRecord(after)) {
        return [...new Set([...Object.keys(before), ...Object.keys(after)])].flatMap(key =>
            diffSave(before[key], after[key], path ? `${path}.${key}` : key));
    }
    return [{ path, before, after }];
}
