import { defineUserConfig } from "vuepress";

import theme from "./theme.js";

export default defineUserConfig({
  base: "/",

  head: [
    ['link', { rel: 'stylesheet', href: '/styles/custom.css' }]
  ],
  locales: {
    "/en/": {
      lang: "en-US",
      title: "PvZ2 Gardendless Official Website|A completely remastered PVZ2 experience",
      description: "Official website of PvZ2 Gardendless. PVZ2 Gardendless is a complete remake of Plants vs Zombies 2.",
    },
    "/": {
      lang: "zh-CN",
      title: "PvZ2 Gardendless 官方网站|完全重置的PVZ2体验",
      description: "《PvZ2 Gardendless》的官方网站。《PVZ2 Gardendless》是一款完全重制的《植物大战僵尸2》(Plants vs Zombies 2)游戏。",
    },
  },

  theme,

  // Enable it with pwa
  // shouldPrefetch: false,
});
