import { estimateStrategyOutcome } from './solver.mjs';

function estimatorBudget(ruleCount, slotCount) {
    const complexity = ruleCount * slotCount;
    if (complexity <= 64) return { secretLimit: 128, rolloutSampleLimit: 512 };
    if (complexity <= 180) return { secretLimit: 48, rolloutSampleLimit: 256 };
    return { secretLimit: 24, rolloutSampleLimit: 128 };
}

self.addEventListener('message', event => {
    const { id, rules, slotCount, history, locked, options } = event.data;
    try {
        const estimate = estimateStrategyOutcome(rules, slotCount, history, locked, {
            ...options,
            ...estimatorBudget(rules.length, slotCount)
        });
        self.postMessage({ id, estimate });
    } catch (error) {
        self.postMessage({ id, error: error instanceof Error ? error.message : String(error) });
    }
});
