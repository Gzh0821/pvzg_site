export function createEditHistory(initial, limit = 50) {
  let snapshots = [JSON.stringify(initial)];
  let index = 0;
  return {
    get canUndo() { return index > 0; },
    get canRedo() { return index < snapshots.length - 1; },
    reset(value) { snapshots = [JSON.stringify(value)]; index = 0; },
    record(value) {
      const snapshot = JSON.stringify(value);
      if (snapshot === snapshots[index]) return false;
      snapshots = [...snapshots.slice(0, index + 1), snapshot].slice(-limit);
      index = snapshots.length - 1;
      return true;
    },
    move(direction) {
      const next = index + direction;
      if (next < 0 || next >= snapshots.length) return null;
      index = next;
      return JSON.parse(snapshots[index]);
    }
  };
}
