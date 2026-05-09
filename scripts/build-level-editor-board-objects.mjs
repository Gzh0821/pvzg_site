#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(scriptDir, '..');
const defaultRawDir = path.join(siteRoot, 'src/components/game-data/raw');
const defaultOverridesPath = path.join(siteRoot, 'src/components/game-data/overrides/board-object-overrides.json');
const defaultOutputPath = path.join(siteRoot, 'src/components/game-data/indexes/board-objects.json');
const imagePrefix = '/assets/image/objects/';

const sourceRules = {
  TilesFeatures: {
    featureFile: 'Features/TilesFeatures.json',
    featureKey: 'Tiles',
    exportClass: 'InitialGridItemProperties',
    categories: new Set(['tile', 'obstacle']),
  },
  TombstonesFeatures: {
    featureFile: 'Features/TombstonesFeatures.json',
    featureKey: 'Tombstones',
    exportClass: 'GravestoneProperties',
    categories: new Set(['tombstone', 'obstacle']),
  },
};

const manualSources = {
  GravestoneProperties: {
    exportClass: 'GravestoneProperties',
    categories: new Set(['tombstone']),
  },
};

const errors = [];

function parseArgs() {
  const options = {
    rawDir: process.env.PVZG_SITE_GAME_DATA_RAW_DIR || defaultRawDir,
    overridesPath: defaultOverridesPath,
    outputPath: defaultOutputPath,
  };

  for (let i = 2; i < process.argv.length; i += 1) {
    const arg = process.argv[i];
    if (arg === '--') {
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      console.log(`Usage: pnpm build:level-editor-objects [-- --raw-dir <path> --overrides <path> --out <path>]

Defaults:
raw data:  ${path.relative(siteRoot, defaultRawDir)}
overrides: ${path.relative(siteRoot, defaultOverridesPath)}
output:    ${path.relative(siteRoot, defaultOutputPath)}

PVZG_SITE_GAME_DATA_RAW_DIR can also override the raw data directory.`);
      process.exit(0);
    }
    if (arg === '--raw-dir') {
      options.rawDir = process.argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--raw-dir=')) {
      options.rawDir = arg.slice('--raw-dir='.length);
    } else if (arg === '--overrides') {
      options.overridesPath = process.argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--overrides=')) {
      options.overridesPath = arg.slice('--overrides='.length);
    } else if (arg === '--out') {
      options.outputPath = process.argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--out=')) {
      options.outputPath = arg.slice('--out='.length);
    } else {
      errors.push(`Unknown argument: ${arg}`);
    }
  }

  return {
    rawDir: path.resolve(siteRoot, options.rawDir || defaultRawDir),
    overridesPath: path.resolve(siteRoot, options.overridesPath || defaultOverridesPath),
    outputPath: path.resolve(siteRoot, options.outputPath || defaultOutputPath),
  };
}

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`Failed to read JSON ${filePath}: ${error.message}`);
  }
}

function readRaw(rawDir, relativePath) {
  const filePath = path.join(rawDir, relativePath);
  if (!existsSync(filePath)) {
    throw new Error(`Missing raw game data file: ${filePath}`);
  }
  return readJson(filePath);
}

function indexByCode(entries, label) {
  const index = new Map();
  if (!Array.isArray(entries)) {
    errors.push(`${label} is not an array`);
    return index;
  }

  entries.forEach((entry, i) => {
    if (!entry?.CODENAME) {
      errors.push(`${label}[${i}] has no CODENAME`);
    } else if (index.has(entry.CODENAME)) {
      errors.push(`${label} has duplicate CODENAME: ${entry.CODENAME}`);
    } else {
      index.set(entry.CODENAME, entry);
    }
  });
  return index;
}

function loadFeatureRefs(rawDir) {
  return Object.fromEntries(
    Object.entries(sourceRules).map(([source, rule]) => {
      const features = readRaw(rawDir, rule.featureFile);
      return [
        source,
        {
          ...rule,
          featuresByCode: indexByCode(features[rule.featureKey], `${source}.${rule.featureKey}`),
        },
      ];
    }),
  );
}

function defaultImage(code) {
  return `${imagePrefix}object_${code}.png`;
}

function assertBasicOverride(entry, i) {
  const label = entry?.code || `items[${i}]`;
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    errors.push(`items[${i}] must be an object`);
    return null;
  }
  if (!entry.code) errors.push(`${label}: missing code`);
  if (!entry.name) errors.push(`${label}: missing name`);
  if (!entry.category) errors.push(`${label}: missing category`);
  if (!entry.source) errors.push(`${label}: missing source`);
  if ('advanced' in entry && typeof entry.advanced !== 'boolean') errors.push(`${label}: advanced must be boolean`);
  return label;
}

function buildFeatureItem(entry, refs, label) {
  const feature = refs.featuresByCode.get(entry.code);
  if (!feature) {
    errors.push(`${label}: not found in ${entry.source}`);
    return null;
  }
  if (!refs.categories.has(entry.category)) {
    errors.push(`${label}: category ${entry.category} is not valid for ${entry.source}`);
  }
  if (entry.exportClass && entry.exportClass !== refs.exportClass) {
    errors.push(`${label}: ${entry.source} must export as ${refs.exportClass}`);
  }

  const item = {
    code: entry.code,
    name: entry.name,
    category: entry.category,
    exportClass: refs.exportClass,
    props: feature.PROPS,
    res: feature.RES,
    source: entry.source,
  };
  if ('advanced' in entry) item.advanced = entry.advanced;
  item.image = entry.image || defaultImage(entry.code);
  return item;
}

function buildManualItem(entry, config, label) {
  const exportClass = entry.exportClass || config.exportClass;
  if (!config.categories.has(entry.category)) {
    errors.push(`${label}: category ${entry.category} is not valid for ${entry.source}`);
  }
  if (exportClass !== config.exportClass) {
    errors.push(`${label}: ${entry.source} must export as ${config.exportClass}`);
  }

  const item = {
    code: entry.code,
    name: entry.name,
    category: entry.category,
    exportClass,
    source: entry.source,
  };
  if ('advanced' in entry) item.advanced = entry.advanced;
  item.image = entry.image || defaultImage(entry.code);
  return item;
}

function buildBoardObjects(rawDir, overridesPath) {
  const refsBySource = loadFeatureRefs(rawDir);
  const overrides = readJson(overridesPath);
  if (!Array.isArray(overrides.items)) {
    errors.push(`${overridesPath} must contain an items array`);
    return [];
  }

  const codes = new Set();
  const usedFeatureCodes = Object.fromEntries(Object.keys(sourceRules).map((source) => [source, new Set()]));
  const items = [];

  overrides.items.forEach((entry, i) => {
    const label = assertBasicOverride(entry, i);
    if (!label || !entry?.code) return;
    if (codes.has(entry.code)) {
      errors.push(`${entry.code}: duplicate override item`);
      return;
    }
    codes.add(entry.code);

    if (refsBySource[entry.source]) {
      usedFeatureCodes[entry.source].add(entry.code);
      const item = buildFeatureItem(entry, refsBySource[entry.source], label);
      if (item) items.push(item);
      return;
    }

    if (manualSources[entry.source]) {
      const item = buildManualItem(entry, manualSources[entry.source], label);
      if (item) items.push(item);
      return;
    }

    errors.push(`${label}: invalid source ${entry.source}`);
  });

  Object.entries(refsBySource).forEach(([source, refs]) => {
    const skipped = overrides.skipped?.[source] || {};
    Object.keys(skipped).forEach((code) => {
      if (!refs.featuresByCode.has(code)) {
        errors.push(`${source}.${code}: skipped code does not exist in raw data`);
      }
    });
    refs.featuresByCode.forEach((_feature, code) => {
      if (usedFeatureCodes[source].has(code)) return;
      if (Object.hasOwn(skipped, code)) return;
      errors.push(`${source}.${code}: raw entry is neither indexed nor skipped`);
    });
  });

  return items;
}

function main() {
  const options = parseArgs();
  let boardObjects = [];

  try {
    boardObjects = buildBoardObjects(options.rawDir, options.overridesPath);
  } catch (error) {
    errors.push(error.message);
  }

  if (errors.length > 0) {
    console.error(`Level editor board objects generation failed (${errors.length}):`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  mkdirSync(path.dirname(options.outputPath), { recursive: true });
  writeFileSync(options.outputPath, `${JSON.stringify(boardObjects, null, 2)}\n`);

  console.log('Level editor board objects generated');
  console.log(`Raw data: ${options.rawDir}`);
  console.log(`Overrides: ${options.overridesPath}`);
  console.log(`Output: ${options.outputPath}`);
  console.log(`Objects: ${boardObjects.length}`);
}

main();
