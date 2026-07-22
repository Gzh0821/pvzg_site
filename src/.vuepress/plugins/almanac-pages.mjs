import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { customizeDevServer } from '@vuepress/helper';
import { createPage } from 'vuepress/core';

import {
  buildAllAlmanacData,
  buildAlmanacDeveloperPayloads,
  getAlmanacDirectoryPath,
  validateAlmanacData,
} from '../lib/almanac-data.mjs';

const HOSTNAME = 'https://www.pvzge.com';
const DEVELOPER_ASSET_PREFIX = '/assets/almanac-data/';

const PAGE_COMPONENT = `\
<script setup>
import AlmanacEntityPage from '@source/components/almanac-v2/AlmanacEntityPage.vue';
</script>

<AlmanacEntityPage />
`;

const ENTITY_LABELS = {
  zh: { plant: '植物图鉴', zombie: '僵尸图鉴' },
  en: { plant: 'Plants Almanac', zombie: 'Zombies Almanac' },
};

const compactDescription = (entity) => (entity.summary || entity.description || `${entity.name} (${entity.codename})`)
  .replace(/\s+/gu, ' ')
  .trim()
  .slice(0, 155);

const getPageTitle = (entity, entityLabel) => entity.catalogRole === 'derived'
  ? `${entity.name} · ${entity.codename} | ${entityLabel}`
  : `${entity.name} | ${entityLabel}`;

const stripBuildOnlyFields = ({ imageExists: _imageExists, similarity: _similarity, ...entity }) => entity;

export const almanacPagesPlugin = () => (app) => ({
  name: 'pvzge-almanac-pages',

  extendsBundlerOptions: (bundlerOptions) => {
    const payloads = buildAlmanacDeveloperPayloads();
    const payloadByUrl = new Map(payloads.entries.map((entry) => [entry.url, entry]));

    customizeDevServer(bundlerOptions, app, {
      path: DEVELOPER_ASSET_PREFIX,
      errMsg: 'Unknown almanac developer payload',
      response: async (request, response) => {
        const rawUrls = [request.originalUrl, request.url].filter(Boolean);
        const candidates = rawUrls.flatMap((rawUrl) => {
          const pathname = new URL(rawUrl, 'http://localhost').pathname;
          return [
            pathname,
            `${DEVELOPER_ASSET_PREFIX}${pathname.replace(/^\/+/, '')}`,
          ];
        });
        const entry = candidates.map((candidate) => payloadByUrl.get(candidate)).find(Boolean);
        if (!entry) throw new Error(`Unknown almanac developer payload: ${request.url}`);

        response.setHeader('Content-Type', 'application/json; charset=utf-8');
        response.setHeader('Cache-Control', 'no-store');
        return entry.serialized;
      },
    });
  },

  onInitialized: async () => {
    const allData = buildAllAlmanacData();
    validateAlmanacData(allData);

    const generatedPages = [];

    for (const localeData of allData) {
      const { locale, plants, zombies, directories } = localeData;

      for (const [kind, entities] of [
        ['plant', directories.plants],
        ['zombie', directories.zombies],
      ]) {
        const directoryPath = getAlmanacDirectoryPath(kind, locale.pathPrefix);
        const directoryPage = app.pages.find((page) => page.path === directoryPath);
        if (!directoryPage) throw new Error(`Missing almanac directory page: ${directoryPath}`);

        directoryPage.frontmatter.almanacDirectory = {
          kind,
          locale: locale.lang,
          entities,
        };
      }

      for (const entity of [...plants, ...zombies]) {
        const entityLabel = ENTITY_LABELS[locale.lang][entity.kind];
        const canonical = `${HOSTNAME}${entity.path}`;
        const pageTitle = getPageTitle(entity, entityLabel);
        const pageDescription = compactDescription(entity);
        const robotsHead = entity.hasAlmanac
          ? []
          : [['meta', { name: 'robots', content: 'noindex,follow' }]];
        generatedPages.push(createPage(app, {
          path: entity.path,
          content: PAGE_COMPONENT,
          frontmatter: {
            title: pageTitle,
            description: pageDescription,
            pageInfo: false,
            comment: false,
            toc: false,
            article: false,
            index: false,
            ...(entity.hasAlmanac ? {} : { sitemap: false }),
            sidebar: false,
            watermark: true,
            head: [
              ['link', { rel: 'canonical', href: canonical }],
              ['meta', { property: 'og:type', content: 'article' }],
              ['meta', { property: 'og:title', content: pageTitle }],
              ['meta', { property: 'og:description', content: pageDescription }],
              ['meta', { property: 'og:image', content: `${HOSTNAME}${entity.image}` }],
              ...robotsHead,
            ],
            almanacEntity: stripBuildOnlyFields(entity),
          },
        }));
      }
    }

    app.pages.push(...await Promise.all(generatedPages));
  },

  onGenerated: () => {
    const payloads = buildAlmanacDeveloperPayloads();
    for (const entry of payloads.entries) {
      const outputPath = app.dir.dest(entry.relativePath);
      mkdirSync(dirname(outputPath), { recursive: true });
      writeFileSync(outputPath, entry.serialized, 'utf8');
    }
  },
});
