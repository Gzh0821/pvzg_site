function cloneJson(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

export function getZombieCode(value) {
  const text = String(value ?? '');
  return /^RTID\((.+)@ZombieTypes\)$/.exec(text)?.[1] || text;
}

export function toZombieTypeReference(code) {
  return `RTID(${code}@ZombieTypes)`;
}

export function groupZombieEntries(entries = []) {
  const groups = [];

  entries.forEach((entry) => {
    const normalizedEntry = cloneJson(entry && typeof entry === 'object' ? entry : { Type: entry });
    const code = getZombieCode(normalizedEntry.Type) || 'mummy';
    const row = normalizedEntry.Row === undefined || normalizedEntry.Row === null ? '' : String(normalizedEntry.Row);
    const existing = groups.at(-1);

    if (existing?.code === code && existing.row === row) {
      existing.count += 1;
      existing.entries.push(normalizedEntry);
      return;
    }

    groups.push({
      code,
      row,
      count: 1,
      entries: [normalizedEntry]
    });
  });

  return groups;
}

export function serializeZombieGroups(groups = []) {
  return groups.flatMap((group) => {
    const templates = group.entries?.length
      ? group.entries
      : [{ Type: toZombieTypeReference(group.code || 'mummy') }];

    return Array.from({ length: Math.max(1, Number(group.count) || 1) }, (_, index) => {
      const template = cloneJson(templates[Math.min(index, templates.length - 1)] || {});
      const hadImportedType = Object.prototype.hasOwnProperty.call(template, 'Type');
      const importedType = template.Type;
      const hadImportedRow = Object.prototype.hasOwnProperty.call(template, 'Row');
      const importedRow = template.Row;
      const row = String(group.row ?? '');

      template.Type =
        hadImportedType && getZombieCode(importedType) === group.code
          ? importedType
          : toZombieTypeReference(group.code || 'mummy');

      if (group.rowDirty) {
        if (row) template.Row = row;
        else delete template.Row;
      } else if (hadImportedRow && String(importedRow ?? '') === row) {
        template.Row = importedRow;
      } else if (row) {
        template.Row = row;
      } else {
        delete template.Row;
      }

      return template;
    });
  });
}

export function groupZombiePoolReferences(pool = []) {
  const groups = [];

  pool.forEach((rawValue) => {
    const code = getZombieCode(rawValue) || String(rawValue || 'mummy');
    const existing = groups.at(-1);
    if (existing?.code === code) existing.rawValues.push(cloneJson(rawValue));
    else groups.push({ code, rawValues: [cloneJson(rawValue)] });
  });

  return groups;
}

export function serializeZombiePoolGroups(groups = []) {
  return groups.flatMap((group) => group.rawValues.map((value) => cloneJson(value)));
}

export function resizeZombiePoolGroup(groups, groupIndex, count) {
  const result = cloneJson(groups);
  const group = result[groupIndex];
  if (!group) return result;
  const normalizedCount = Math.max(1, Math.round(count) || 1);
  const template = cloneJson(group.rawValues.at(-1) ?? toZombieTypeReference(group.code));
  group.rawValues = Array.from({ length: normalizedCount }, (_, index) => cloneJson(group.rawValues[index] ?? template));
  return result;
}

export function setDynamicZombiesOnModuleObject(moduleObject, slots) {
  const result = cloneJson(moduleObject || {});
  result.objdata = {
    ...(result.objdata || {}),
    DynamicZombies: cloneJson(slots)
  };
  return result;
}

export function collectPreservedStaticWaveObjects(objects, moduleObject, managerObject, referencedAliases) {
  const aliases = new Set(referencedAliases || []);
  return (objects || [])
    .filter(
      (object) =>
        object === moduleObject ||
        object === managerObject ||
        (object?.aliases || []).some((alias) => aliases.has(alias))
    )
    .map((object) => cloneJson(object));
}

export function isDetachedZombieSpawnAction(object, referencedAliases) {
  if (object?.objclass !== 'SpawnZombiesJitteredWaveActionProps') return false;
  const aliases = new Set(referencedAliases || []);
  return !(object?.aliases || []).some((alias) => aliases.has(alias));
}

export function supportsDynamicZombieEditing(moduleObject) {
  return Boolean(moduleObject?.objdata?.WaveManagerProps);
}
