// Registries describe editor contributions. They never own a document or mutate it.
export function createFeatureRegistry() {
  const definitions = new Map();
  const classes = new Map();
  return {
    register(definition) {
      if (!definition.id || definitions.has(definition.id)) {
        throw new Error(`Duplicate or missing editor feature: ${definition.id}`);
      }
      if (definition.objclass && classes.has(definition.objclass)) {
        throw new Error(`Duplicate editor object class: ${definition.objclass}`);
      }
      const contribution = Object.freeze({ ...definition });
      definitions.set(contribution.id, contribution);
      if (contribution.objclass) classes.set(contribution.objclass, contribution);
      return contribution;
    },
    get: (id) => definitions.get(id),
    getByClass: (objclass) => classes.get(objclass),
    list: () => [...definitions.values()]
  };
}
