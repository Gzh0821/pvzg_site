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
      description: "《PvZ2 Gardendless》(PvZ Gardendless)是一款完全重制的《植物大战僵尸2》(Plants vs Zombies 2)游戏，制作组为植物大战僵尸粉丝们提供了一个全新的游戏体验。",
    },
  },

  theme,

  // Enable it with pwa
  // shouldPrefetch: false,
});
