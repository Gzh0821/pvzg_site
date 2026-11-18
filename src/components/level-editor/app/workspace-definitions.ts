import { createFeatureRegistry } from '../core/feature-registry.mjs';

const registry = createFeatureRegistry();
[
  { id: 'basic', label: 'workbenchLevel', icon: 'file', assets: false },
  { id: 'board', label: 'importSectionBoard', icon: 'board', assets: true },
  { id: 'waves', label: 'importSectionWaves', icon: 'waves', assets: true },
  { id: 'seed', label: 'importSectionSeed', icon: 'seed', assets: true },
  { id: 'narrative', label: 'narrative', icon: 'story', assets: false },
  { id: 'assets', label: 'workbenchLocalAssets', icon: 'assets', assets: true }
].forEach((definition) => registry.register(definition));

export const workspaceDefinitions = registry.list();

export function createWorkspaceRegistry(views: Record<string, { main: unknown; inspector?: unknown; }>) {
  const workspaces = createFeatureRegistry();
  workspaceDefinitions.forEach((definition) => {
    const view = views[definition.id];
    if (!view) throw new Error(`Missing editor workspace: ${definition.id}`);
    workspaces.register({ ...definition, ...view });
  });
  return workspaces;
}
