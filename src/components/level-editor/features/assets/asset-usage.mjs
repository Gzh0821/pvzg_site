// Resolve type references wherever native events, generators or pools store them.
export function collectAssetReferences(value, localDefinitions = []) {
  const references = new Map();
  const localTypes = new Map(localDefinitions.flatMap((entry) => entry.object.aliases.map((alias) => [alias, entry.kind])));
  function visit(node) {
    if (typeof node === 'string') {
      const match = /^RTID\((.+)@(PlantTypes|ZombieTypes|CurrentLevel)\)$/.exec(node);
      if (!match) return;
      const [, alias, namespace] = match;
      const kind = namespace === 'PlantTypes' ? 'plant' : namespace === 'ZombieTypes' ? 'zombie' : localTypes.get(alias);
      if (kind) references.set(`${kind}:${alias}`, { kind, code: namespace === 'CurrentLevel' && kind === 'zombie' ? node : alias });
    } else if (Array.isArray(node)) node.forEach(visit);
    else if (node && typeof node === 'object') Object.values(node).forEach(visit);
  }
  visit(value);
  return [...references.values()];
}
