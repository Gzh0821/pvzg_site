import { defineUserConfig } from "vuepress";

import theme from "./theme.js";

export default defineUserConfig({
  base: "/",

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
        href: "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap",
        rel: "stylesheet",
      },
    ],
    [
      "link",
      {
        href: "https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap",
        rel: "stylesheet",
      },
    ],
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
