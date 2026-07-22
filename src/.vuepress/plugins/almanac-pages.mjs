import { createPage } from 'vuepress/core';

import {
  buildAllAlmanacData,
  getAlmanacDirectoryPath,
  validateAlmanacData,
} from '../lib/almanac-data.mjs';

const HOSTNAME = 'https://www.pvzge.com';

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

const compactDescription = (entity) => (entity.summary || entity.description)
  .replace(/\s+/gu, ' ')
  .trim()
  .slice(0, 155);

const stripBuildOnlyFields = ({ imageExists: _imageExists, similarity: _similarity, ...entity }) => entity;

export const almanacPagesPlugin = () => (app) => ({
  name: 'pvzge-almanac-pages',

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
        generatedPages.push(createPage(app, {
          path: entity.path,
          content: PAGE_COMPONENT,
          frontmatter: {
            title: `${entity.name} | ${entityLabel}`,
            description: compactDescription(entity),
            pageInfo: false,
            comment: false,
            toc: false,
            article: false,
            index: false,
            sidebar: false,
            watermark: true,
            head: [
              ['link', { rel: 'canonical', href: canonical }],
              ['meta', { property: 'og:type', content: 'article' }],
              ['meta', { property: 'og:title', content: `${entity.name} | ${entityLabel}` }],
              ['meta', { property: 'og:description', content: compactDescription(entity) }],
              ['meta', { property: 'og:image', content: `${HOSTNAME}${entity.image}` }],
            ],
            almanacEntity: stripBuildOnlyFields(entity),
          },
        }));
      }
    }

    app.pages.push(...await Promise.all(generatedPages));
  },
});
