import { defineUserConfig } from "vuepress";
import { viteBundler } from "@vuepress/bundler-vite";
import theme from "./theme.js";
import vueI18n from '@intlify/unplugin-vue-i18n/vite'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export default defineUserConfig({
  base: "/",
  pagePatterns: ['**/*.md', '!.vuepress', '!node_modules', '!components'],
  head: [
    ['script', {
      src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7637695321442015',
      async: true, crossorigin: 'anonymous'
    }],
    ['meta', { name: 'google-adsense-account', content: 'ca-pub-7637695321442015' }],
    ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
    [
      "link",
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    ],
    [
      "link",
      {
        href: "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@100..900&family=Roboto&family=ZCOOL+KuaiLe&display=swap",
        rel: "stylesheet",
      },
    ],
  ],
  locales: {
    "/en/": {
      lang: "en-US",
      title: "PvZ2 Gardendless Official Website",
      description: "Official website of PvZ2 Gardendless. PVZ2 Gardendless is a complete remastered, full PC platform of Plants vs. Zombies 2.",
    },
    "/ru-RU/": {
      lang: "ru-RU",
      title: "PvZ2 Gardendless Официальный сайт",
      description: "«PVZ2 Gardendless» — это полностью переделанная платформенная игра Plants vs. Zombies 2 для ПК.",
    },
    "/es-ES/": {
      lang: "es-ES",
      title: "Sitio web oficial de PvZ2 Gardendless",
      description: "Sitio web oficial de PvZ2 Gardendless. PVZ2 Gardendless es una versión remasterizada y completa para PC de Plants vs. Zombies 2.",
    },
    "/": {
      lang: "zh-CN",
      title: "PvZ2 Gardendless 官方网站",
      description: "《PvZ2 Gardendless》的官方网站。《PVZ2 Gardendless》是一款完全重制的，全PC平台的《植物大战僵尸2》(Plants vs Zombies 2)游戏。",
    },
  },
  bundler: viteBundler({
    viteOptions: {
      plugins: [
        vueI18n({
          ssr: true
        })
      ],
    }
  }),
  theme,

  // Enable it with pwa
  // shouldPrefetch: false,
});
