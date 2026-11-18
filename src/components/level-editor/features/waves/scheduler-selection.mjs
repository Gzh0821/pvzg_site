export function selectedSchedulerEvent(action, selectedAliases, parseAlias) {
  const events = Array.isArray(action.objdata?.Events) ? action.objdata.Events : [];
  const aliases = events.map(ref => typeof ref === 'string' ? parseAlias(ref) : '');
  const selected = aliases.indexOf(selectedAliases[action.id]);
  return selected >= 0 ? selected : Math.max(0, aliases.findIndex(Boolean));
}

export function selectedWaveEvent(action, selectedAliases, parseAlias, getChild) {
  const visited = new Set();
  while (action?.objclass === 'WaveSchedulerProps' && !visited.has(action.id)) {
    visited.add(action.id);
    const index = selectedSchedulerEvent(action, selectedAliases, parseAlias);
    const ref = action.objdata?.Events?.[index];
    const child = typeof ref === 'string' && getChild(parseAlias(ref));
    if (!child) break;
    action = child;
  }
  return action;
}
