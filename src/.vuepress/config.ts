import { defineUserConfig } from "vuepress";

import theme from "./theme.js";

export default defineUserConfig({
  base: "/",

  head: [
    ['link', { rel: 'stylesheet', href: '/styles/custom.css' }]
  ],
  locales: {
    // "/en/": {
    //   lang: "en-US",
    //   title: "Docs Demo",
    //   description: "A docs demo for vuepress-theme-hope",
    // },
    "/": {
      lang: "zh-CN",
      title: "PvZ2 Gardendless",
      description: "《PvZ2 Gardendless》的官方网站。《PVZ2 Gardendless》是一款完全重制的《植物大战僵尸2》(Plants vs Zombies 2)游戏。",
    },
  },

  theme,

  // Enable it with pwa
  // shouldPrefetch: false,
});
