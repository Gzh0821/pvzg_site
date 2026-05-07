#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(scriptDir, '..');
const defaultGameJsonDir = path.resolve(siteRoot, '../pvzge_build/docs/game-json-files');
const boardObjectsPath = path.join(siteRoot, 'src/components/level-editor/data/board-objects.json');
const publicRoot = path.join(siteRoot, 'src/.vuepress/public');
const objectImageDir = path.join(publicRoot, 'assets/image/objects');
const imagePrefix = '/assets/image/objects/';

const allowedCategories = new Set(['tile', 'obstacle', 'tombstone']);
const allowedExportClasses = new Set(['InitialGridItemProperties', 'GravestoneProperties']);

const sourceRules = {
  TilesFeatures: {
    featureFile: 'Features/TilesFeatures.json',
    featureKey: 'Tiles',
    propsFile: 'Objects/TileProps.json',
    propsClass: 'TileProperties',
    propsGroup: 'TileProps',
    exportClass: 'InitialGridItemProperties',
    categories: new Set(['tile', 'obstacle']),
    skipped: new Map([
      ['railcart', 'railcart visuals are owned by RailcartProperties'],
      ['rail', 'rail layout is owned by RailcartProperties'],
    ]),
  },
  TombstonesFeatures: {
    featureFile: 'Features/TombstonesFeatures.json',
    featureKey: 'Tombstones',
    propsFile: 'Objects/TombstoneProps.json',
    propsClass: 'TombstoneProperties',
    propsGroup: 'TombstoneProps',
    exportClass: 'GravestoneProperties',
    categories: new Set(['tombstone', 'obstacle']),
    skipped: new Map(),
  },
};

const allowedDuplicateImageGroups = [
  ['boulder_trap_falling_backward', 'boulder_trap_falling_forward'],
  ['gravestone', 'gravestone_tutorial'],
].map((codes) => [...codes].sort());

const errors = [];
const warnings = [];

function parseArgs() {
  let gameJsonDir = process.env.PVZGE_GAME_JSON_DIR || defaultGameJsonDir;

  for (let i = 2; i < process.argv.length; i += 1) {
    const arg = process.argv[i];
    if (arg === '--help' || arg === '-h') {
      console.log(`Usage: pnpm check:level-editor-objects [-- --game-json-dir <path>]

Default reference directory:
${defaultGameJsonDir}

PVZGE_GAME_JSON_DIR can also override the reference directory.`);
      process.exit(0);
    }
    if (arg === '--game-json-dir') {
      gameJsonDir = process.argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--game-json-dir=')) {
      gameJsonDir = arg.slice('--game-json-dir='.length);
    } else {
      errors.push(`Unknown argument: ${arg}`);
    }
  }

  if (!gameJsonDir) {
    errors.push('--game-json-dir requires a path');
  }
  return path.resolve(siteRoot, gameJsonDir || defaultGameJsonDir);
}

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`Failed to read JSON ${filePath}: ${error.message}`);
  }
}

function readReference(gameJsonDir, relativePath) {
  const filePath = path.join(gameJsonDir, relativePath);
  if (!existsSync(filePath)) {
    throw new Error(`Missing reference file: ${filePath}`);
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

function indexProps(objects, expectedClass, label) {
  const index = new Map();
  if (!Array.isArray(objects)) {
    errors.push(`${label}.objects is not an array`);
    return index;
  }

  objects
    .filter((object) => object?.objclass === expectedClass)
    .forEach((object, i) => {
      if (!Array.isArray(object.aliases) || object.aliases.length === 0) {
        errors.push(`${label}.objects[${i}] has no aliases`);
        return;
      }
      object.aliases.forEach((alias) => {
        if (index.has(alias)) {
          errors.push(`${label} has duplicate ${expectedClass} alias: ${alias}`);
        } else {
          index.set(alias, object);
        }
      });
    });
  return index;
}

function parseRtid(value) {
  const match = typeof value === 'string' && /^RTID\(([^@()]+)@([^@()]+)\)$/.exec(value);
  return match ? { alias: match[1], group: match[2] } : null;
}

function count(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function formatCounts(map) {
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
}

function hashFile(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

function isAllowedDuplicateImageGroup(items) {
  const codes = items.map((item) => item.code).sort();
  return allowedDuplicateImageGroups.some(
    (allowedCodes) => allowedCodes.length === codes.length && allowedCodes.every((code, i) => code === codes[i]),
  );
}

function loadReferences(gameJsonDir) {
  return Object.fromEntries(
    Object.entries(sourceRules).map(([source, rule]) => {
      const features = readReference(gameJsonDir, rule.featureFile);
      const props = readReference(gameJsonDir, rule.propsFile);
      return [
        source,
        {
          ...rule,
          featuresByCode: indexByCode(features[rule.featureKey], `${source}.${rule.featureKey}`),
          propsByAlias: indexProps(props.objects, rule.propsClass, rule.propsFile),
        },
      ];
    }),
  );
}

function validateImage(item, referencedImages, imageHashes) {
  if (typeof item.image !== 'string' || !item.image.startsWith(imagePrefix)) {
    errors.push(`${item.code}: image must start with ${imagePrefix}`);
    return;
  }

  const expectedImage = `${imagePrefix}object_${item.code}.png`;
  if (item.image !== expectedImage) {
    warnings.push(`${item.code}: image path is ${item.image}, expected ${expectedImage}`);
  }

  const imagePath = path.join(publicRoot, item.image.slice(1));
  referencedImages.add(path.resolve(imagePath));
  if (!existsSync(imagePath) || !statSync(imagePath).isFile()) {
    errors.push(`${item.code}: missing image file ${imagePath}`);
    return;
  }

  const hash = hashFile(imagePath);
  imageHashes.set(hash, [...(imageHashes.get(hash) || []), item]);
}

function validateFeatureBackedItem(item, refs) {
  const feature = refs.featuresByCode.get(item.code);
  if (!feature) {
    errors.push(`${item.code}: not found in ${item.source}`);
    return;
  }

  if (item.exportClass !== refs.exportClass) {
    errors.push(`${item.code}: ${item.source} entries must export as ${refs.exportClass}`);
  }
  if (!refs.categories.has(item.category)) {
    errors.push(`${item.code}: category ${item.category} is not valid for ${item.source}`);
  }
  if (item.props !== feature.PROPS) {
    errors.push(`${item.code}: props mismatch, board=${item.props || '<missing>'}, ${item.source}=${feature.PROPS}`);
  }
  if (item.res !== feature.RES) {
    errors.push(`${item.code}: res mismatch, board=${item.res || '<missing>'}, ${item.source}=${feature.RES}`);
  }

  const rtid = parseRtid(feature.PROPS);
  if (!rtid) {
    errors.push(`${item.code}: invalid PROPS RTID in ${item.source}: ${feature.PROPS}`);
  } else if (rtid.group !== refs.propsGroup) {
    errors.push(`${item.code}: PROPS group is ${rtid.group}, expected ${refs.propsGroup}`);
  } else if (!refs.propsByAlias.has(rtid.alias)) {
    errors.push(`${item.code}: ${feature.PROPS} does not resolve in ${refs.propsFile}`);
  }
}

function validateBoardObjects(gameJsonDir) {
  const refsBySource = loadReferences(gameJsonDir);
  const boardObjects = readJson(boardObjectsPath);
  const codes = new Set();
  const usedFeatureCodes = Object.fromEntries(Object.keys(sourceRules).map((source) => [source, new Set()]));
  const categoryCounts = new Map();
  const exportClassCounts = new Map();
  const sourceCounts = new Map();
  const referencedImages = new Set();
  const imageHashes = new Map();

  if (!Array.isArray(boardObjects)) {
    errors.push(`${boardObjectsPath} must be a JSON array`);
    return { boardObjects, categoryCounts, exportClassCounts, sourceCounts };
  }

  boardObjects.forEach((item, i) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      errors.push(`board-objects[${i}] is not an object`);
      return;
    }

    const label = item.code || `board-objects[${i}]`;
    if (!item.code) {
      errors.push(`${label}: missing code`);
      return;
    }
    if (codes.has(item.code)) errors.push(`${item.code}: duplicate code`);
    codes.add(item.code);

    if (!item.name) errors.push(`${label}: missing name`);
    if (!allowedCategories.has(item.category)) errors.push(`${label}: invalid category ${item.category}`);
    else count(categoryCounts, item.category);
    if (!allowedExportClasses.has(item.exportClass)) errors.push(`${label}: invalid exportClass ${item.exportClass}`);
    else count(exportClassCounts, item.exportClass);
    if (!sourceRules[item.source] && item.source !== 'GravestoneProperties') errors.push(`${label}: invalid source ${item.source}`);
    else count(sourceCounts, item.source);
    if ('advanced' in item && typeof item.advanced !== 'boolean') errors.push(`${label}: advanced must be boolean`);

    validateImage(item, referencedImages, imageHashes);

    if (sourceRules[item.source]) {
      usedFeatureCodes[item.source].add(item.code);
      validateFeatureBackedItem(item, refsBySource[item.source]);
    } else if (item.source === 'GravestoneProperties') {
      if (item.category !== 'tombstone') errors.push(`${label}: GravestoneProperties source must use tombstone category`);
      if (item.exportClass !== 'GravestoneProperties') errors.push(`${label}: GravestoneProperties source must export as GravestoneProperties`);
      if ('props' in item || 'res' in item) warnings.push(`${label}: GravestoneProperties source is expected to omit props/res`);
    }
  });

  Object.entries(refsBySource).forEach(([source, refs]) => {
    refs.featuresByCode.forEach((_feature, code) => {
      if (usedFeatureCodes[source].has(code)) return;
      if (refs.skipped.has(code)) return;
      errors.push(`${source}.${code}: reference entry is not indexed in board-objects.json`);
    });
  });

  if (existsSync(objectImageDir)) {
    readdirSync(objectImageDir)
      .filter((fileName) => fileName.startsWith('object_') && fileName.endsWith('.png'))
      .map((fileName) => path.resolve(objectImageDir, fileName))
      .filter((filePath) => !referencedImages.has(filePath))
      .forEach((filePath) => warnings.push(`unused object image: ${path.relative(siteRoot, filePath)}`));
  }

  imageHashes.forEach((items) => {
    if (items.length > 1 && !isAllowedDuplicateImageGroup(items)) {
      warnings.push(`duplicate image content: ${items.map((item) => `${item.code} (${item.image})`).join(', ')}`);
    }
  });

  return { boardObjects, categoryCounts, exportClassCounts, sourceCounts };
}

function main() {
  const gameJsonDir = parseArgs();
  let summary;

  try {
    summary = validateBoardObjects(gameJsonDir);
  } catch (error) {
    errors.push(error.message);
  }

  if (summary?.boardObjects) {
    console.log('Level editor board objects check');
    console.log(`Reference data: ${gameJsonDir}`);
    console.log(`Objects: ${Array.isArray(summary.boardObjects) ? summary.boardObjects.length : 0}`);
    console.log(`Categories: ${formatCounts(summary.categoryCounts)}`);
    console.log(`Export classes: ${formatCounts(summary.exportClassCounts)}`);
    console.log(`Sources: ${formatCounts(summary.sourceCounts)}`);
  }

  if (warnings.length > 0) {
    console.log(`\nWarnings (${warnings.length}):`);
    warnings.forEach((warning) => console.log(`- ${warning}`));
  }

  if (errors.length > 0) {
    console.error(`\nErrors (${errors.length}):`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log('\nOK: no blocking board object issues found.');
}

main();
