export const NARRATIVE_SLOTS = ['FirstIntroNarrative', 'ReplayIntroNarrative', 'FirstOutroNarrative', 'ReplayOutroNarrative'];
export const NARRATIVE_CHARACTERS = ['crazydave', 'winnie', 'zombossicon', 'crazydaveicon', 'winnieicon', ''];
const COMMON_ACTIONS = ['NPC_ENTER', 'SAY', 'TIRED', 'PLAYFUL', 'EXCITED', 'NPC_EXIT'];

export function getNarrativeActions(character) {
  if (character === '') return ['START_DIALOG_MUSIC', 'GIVE_GEM'];
  if (character === 'zombossicon') return ['NPC_ENTER', 'SAY', 'NPC_EXIT'];
  if (character === 'crazydaveicon') return [...COMMON_ACTIONS, 'SHOUT',
    ...Array.from({ length: 17 }, (_, index) => `SPECIAL${index + 1}`)];
  if (character === 'crazydave') return [...COMMON_ACTIONS, 'SHOUT', 'SAY_TACO', 'BRINGOUT_TACO', 'EAT_TACO',
    ...Array.from({ length: 17 }, (_, index) => `SPECIAL${index + 1}`)];
  return character === 'winnie' || character === 'winnieicon' ? COMMON_ACTIONS : [];
}

export function findNarrative(objects, alias) {
  return objects.find((object) => object?.objclass === 'NarrativeProperties' && object.aliases?.includes(alias));
}

export function createLocalNarrative(objects, definition, slot, source, language, reservedAliases = []) {
  const aliases = new Set([...reservedAliases, ...objects.flatMap((object) => object?.aliases || [])]);
  const base = `Editor${slot}`;
  let alias = base;
  for (let index = 1; aliases.has(alias); index++) alias = `${base}${index}`;
  const object = source ? JSON.parse(JSON.stringify(source)) : {
    objclass: 'NarrativeProperties', objdata: { Flow: [
      { Character: 'crazydave', Action: 'NPC_ENTER' },
      { Character: 'crazydave', Action: 'SAY', Lines: { [language]: '' } }
    ] }
  };
  object.aliases = [alias];
  objects.push(object);
  definition[slot] = alias;
  return object;
}

export function getNarrativeWarnings(objects, definition, sharedObjects) {
  return NARRATIVE_SLOTS.flatMap((slot) => {
    const alias = definition[slot];
    if (!alias) return [];
    const object = findNarrative(objects, alias) || findNarrative(sharedObjects || [], alias);
    if (!object && sharedObjects == null) return [];
    if (!object || !Array.isArray(object.objdata?.Flow)) return [{ slot, reason: 'missing' }];
    const visible = new Set();
    return object.objdata.Flow.flatMap((step, index) => {
      if (!step || typeof step !== 'object' || Array.isArray(step)) return [{ slot, index, reason: 'action' }];
      const issues = [];
      if (!getNarrativeActions(step.Character).includes(step.Action)) issues.push({ slot, index, reason: 'action' });
      if (step.Action === 'NPC_ENTER') visible.add(step.Character);
      else if (step.Action === 'NPC_EXIT') visible.delete(step.Character);
      else if (step.Character && !visible.has(step.Character)) issues.push({ slot, index, reason: 'enter' });
      return issues;
    });
  });
}
