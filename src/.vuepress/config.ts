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
      description: "PvZ2 Gardendless的官方网站",
    },
  },

  theme,

  // Enable it with pwa
  // shouldPrefetch: false,
});
