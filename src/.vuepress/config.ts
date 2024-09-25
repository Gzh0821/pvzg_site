import { defineUserConfig } from "vuepress";

import theme from "./theme.js";

export default defineUserConfig({
  base: "/",
  pagePatterns: ['**/*.md', '!.vuepress', '!node_modules', '!components'],
  head: [
    ['link', { rel: 'stylesheet', href: '/styles/custom.css' }],
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
      title: "PvZ2 Gardendless Official Website|A completely remastered PVZ2 experience",
      description: "Official website of PvZ2 Gardendless. PVZ2 Gardendless is a complete remastered, full PC platform of Plants vs Zombies 2.",
    },
    "/ru-RU/": {
      lang: "ru-RU",
      title: "PvZ2 Gardendless Официальный сайт|Полностью переработанный опыт PVZ2",
      description: "«PVZ2 Gardendless» — это полностью переделанная платформенная игра «Plants vs Zombies 2» (Plants vs Zombies 2) для ПК.",
    },
    "/pt-BR/": {
      lang: "pt-BR",
      title: "Site oficial do PvZ2 Gardendless | Uma experiência PVZ2 completamente remasterizada",
      description: "Site oficial de PvZ2 Gardendless. PVZ2 Gardendless é uma versão completa remasterizada e para plataforma de PC de Plants vs Zombies 2.",
    },
    "/": {
      lang: "zh-CN",
      title: "PvZ2 Gardendless 官方网站|完全重置的PVZ2体验",
      description: "《PvZ2 Gardendless》的官方网站。《PVZ2 Gardendless》是一款完全重制的，全PC平台的《植物大战僵尸2》(Plants vs Zombies 2)游戏。",
    },
  },

  theme,

  // Enable it with pwa
  // shouldPrefetch: false,
});
