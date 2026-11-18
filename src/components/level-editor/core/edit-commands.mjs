export function createEditCommands({ read, write, onCommitted }) {
  const listeners = new Set();
  let depth = 0;
  return {
    // Edits are synchronous; file I/O completes before entering a document edit.
    execute(id, operation) {
      if (depth) return operation();
      const before = JSON.stringify(read());
      let result;
      depth += 1;
      try {
        result = operation();
      } catch (error) {
        write(JSON.parse(before));
        throw error;
      } finally {
        depth -= 1;
      }
      if (JSON.stringify(read()) !== before) {
        onCommitted();
        for (const listener of listeners) listener({ type: 'document.changed', command: id });
      }
      return result;
    },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    dispose() { listeners.clear(); }
  };
}
