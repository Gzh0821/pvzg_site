export const SPECIAL_MODE_CLASSES = { boss: 'ZombossBattleModuleProperties', airRaid: 'SkyMiniGameProperties', ship: 'SkyCityShipProperties' };
export const SPECIAL_SHIP_DEFAULTS = { Toughness: 20000, ToughnessShield: 10000, BloverSPS: 3, BloverDPS: 5000, EdgeX: 2.5 };
const clone = value => JSON.parse(JSON.stringify(value));

export function getSpecialBindings(draft, sharedObjects = []) {
  const seen = new Set(), bindings = [];
  for (const reference of draft.moduleRefs || []) {
    const match = /^RTID\((.+)@(CurrentLevel|LevelModules)\)$/.exec(reference);
    if (!match) continue;
    const object = (match[2] === 'CurrentLevel' ? draft.unsupportedRawObjects : sharedObjects).find(object => object?.aliases?.includes(match[1]));
    const kind = Object.keys(SPECIAL_MODE_CLASSES).find(kind => SPECIAL_MODE_CLASSES[kind] === object?.objclass);
    if (!kind || seen.has(object)) continue;
    seen.add(object);
    bindings.push({ kind, object, reference, shared: match[2] === 'LevelModules' });
  }
  return bindings;
}

export function localizeSpecialModule(draft, binding, reservedAliases = []) {
  if (!binding.shared) return binding;
  const used = new Set([...reservedAliases, ...draft.unsupportedRawObjects.flatMap(object => object?.aliases || [])]);
  const stem = binding.object.aliases?.[0] || 'SpecialMode';
  let alias = `${stem}Local`, suffix = 2;
  while (used.has(alias)) alias = `${stem}Local${suffix++}`;
  const object = clone(binding.object);
  object.aliases = [alias];
  const reference = `RTID(${alias}@CurrentLevel)`;
  draft.unsupportedRawObjects.push(object);
  draft.moduleRefs = draft.moduleRefs.map(ref => ref === binding.reference ? reference : ref);
  return { ...binding, object, reference, shared: false };
}

export function createSpecialLevel(template, name, description) {
  const level = clone(template);
  Object.assign(level.objects.find(object => object.objclass === 'LevelDefinition').objdata, { Name: name, Description: description });
  return level;
}

export function getSpecialTypeOptions(objects, globals, kind) {
  const local = objects.filter(object => object?.objclass === (kind === 'boss' ? 'ZombieType' : 'PlantType'));
  const mapped = local.flatMap(object => (object.aliases || []).map(value => ({ value, base: object.objdata?.[kind === 'boss' ? 'ZombieBasedOn' : 'PlantBasedOn'] || value, local: true })));
  const shared = globals.flatMap(object => (object.aliases || []).map(value => ({ value, base: object.base || object.objdata?.ZombieBasedOn || value, local: false })));
  const seen = new Set();
  return [...mapped, ...shared].filter(option => !seen.has(option.value) && seen.add(option.value));
}

// The game sorts by FullPoint; omitted, null and zero mean no further upgrade.
export function getAirMemberOrder(members) {
  return (members || []).map((member, index) => ({ member, index })).sort((a, b) => (a.member?.FullPoint || Infinity) - (b.member?.FullPoint || Infinity));
}

function airTeamProblems(teams, types) {
  if (!Array.isArray(teams)) return [['shape', teams]];
  const problems = [];
  if (!teams.length || teams.length > 3) problems.push(['count', teams.length]);
  for (const team of teams) {
    if (!team || typeof team !== 'object') { problems.push(['team', team]); continue; }
    if (team.Difficulty == null || team.Difficulty === '' || !Number.isFinite(Number(team.Difficulty)) || Number(team.Difficulty) < 0 || Number(team.Difficulty) > 5) problems.push(['difficulty', team.Difficulty]);
    if (!Array.isArray(team.Members) || !team.Members.length) { problems.push(['members', team.Members]); continue; }
    for (const member of team.Members) {
      if (!member || typeof member !== 'object') { problems.push(['member', member]); continue; }
      if (!types.some(type => type.value === member.Type)) problems.push(['type', member.Type]);
      if (member.FullPoint != null && member.FullPoint !== '' && (!Number.isFinite(Number(member.FullPoint)) || Number(member.FullPoint) < 0)) problems.push(['points', member.FullPoint]);
    }
  }
  return problems;
}

function inheritedProblems(current, original) {
  const available = new Map();
  for (const problem of original) { const key = JSON.stringify(problem); available.set(key, (available.get(key) || 0) + 1); }
  return current.every(problem => {
    const key = JSON.stringify(problem), count = available.get(key) || 0;
    if (!count) return false;
    available.set(key, count - 1);
    return true;
  });
}

export function getSpecialModeIssues(draft, originalObjects = [], options = { sharedObjects: [], bossTypes: [], plantTypes: [] }) {
  const issues = [];
  const integer = (value, min, max) => value !== '' && value != null && Number.isInteger(Number(value)) && Number(value) >= min && Number(value) <= max;
  const originalModule = binding => binding.shared ? binding.object : originalObjects.find(object => object?.objclass === binding.object.objclass && object.aliases?.some(alias => binding.object.aliases?.includes(alias)));
  for (const binding of getSpecialBindings(draft, options.sharedObjects)) {
    const data = binding.object.objdata || {}, original = originalModule(binding), invalid = new Set();
    if (binding.kind === 'boss') {
      const types = getSpecialTypeOptions(draft.unsupportedRawObjects, options.bossTypes, 'boss');
      if (!types.some(option => option.value === data.ZombossMechType)) invalid.add('ZombossMechType');
      if (!integer(data.ZombossSpawnGridPosition?.mX, 0, 8) || !integer(data.ZombossSpawnGridPosition?.mY, 0, 4)) invalid.add('ZombossSpawnGridPosition');
      if (data.ReservedColumnCount != null && !integer(data.ReservedColumnCount, 0, 9)) invalid.add('ReservedColumnCount');
    } else if (binding.kind === 'airRaid') {
      if (data.TargetPoint == null || data.TargetPoint === '' || !Number.isFinite(Number(data.TargetPoint)) || Number(data.TargetPoint) < 0) invalid.add('TargetPoint');
      const types = getSpecialTypeOptions(draft.unsupportedRawObjects, options.plantTypes, 'plant');
      if (airTeamProblems(data.Teams, types).length) invalid.add('Teams');
    } else {
      for (const field of ['Toughness', 'ToughnessShield', 'BloverSPS', 'BloverDPS', 'EdgeX']) {
        if (data[field] != null && (data[field] === '' || !Number.isFinite(Number(data[field])) || Number(data[field]) <= 0)) invalid.add(field);
      }
    }
    for (const field of invalid) {
      let inherited = !!original && JSON.stringify(original.objdata?.[field]) === JSON.stringify(data[field]);
      if (original && field === 'Teams') inherited = inheritedProblems(
        airTeamProblems(data.Teams, getSpecialTypeOptions(draft.unsupportedRawObjects, options.plantTypes, 'plant')),
        airTeamProblems(original.objdata?.Teams, getSpecialTypeOptions(originalObjects, options.plantTypes, 'plant'))
      );
      issues.push({ kind: binding.kind, field, inherited });
    }
  }
  return issues;
}
