import { hopeTheme } from "vuepress-theme-hope";

import { enNavbar, ruNavbar, zhNavbar } from "./navbar/index.js";
import { enSidebar, ruSidebar, zhSidebar } from "./sidebar/index.js";

export default hopeTheme({
  hostname: "https://www.pvzge.com",

  author: {
    name: "LMYY",
    url: "https://gaozih.com",
  },

  license: "Apache 2.0",

  iconAssets: "fontawesome-with-brands",

  favicon: "/favicon.ico",

  logo: "pvzg_nav.png",

  repo: "Gzh0821/pvzg_site",

  docsDir: "src",

  lastUpdated: false,
  // 是否展示贡献者
  contributors: false,
  // 是否展示编辑链接
  editLink: false,

  locales: {
    "/en/": {
      // navbar
      navbar: enNavbar,
      navbarTitle: "PvZ2 Gardendless",
      // sidebar
      sidebar: enSidebar,

      footer: "Official website of PvZ2 Gardendless: pvzge.com",
      copyright: "Copyright 2021-2024 <a href=\"https://gaozih.com\">Gaozih</a> © All Rights Reserved.",
      displayFooter: true,

      metaLocales: {
        editLink: "Edit this page on GitHub",
      },
    },
    "/ru-RU/": {
      // navbar
      navbar: ruNavbar,
      navbarTitle: "PvZ2 Gardendless",
      // sidebar
      sidebar: ruSidebar,

      footer: "Official website of PvZ2 Gardendless: pvzge.com",
      copyright: "Copyright 2021-2024 <a href=\"https://gaozih.com\">Gaozih</a> © All Rights Reserved.",
      displayFooter: true,

      metaLocales: {
        editLink: "Редактировать эту страницу на GitHub",
      },
    },
    /**
     * Chinese locale config
     */
    "/": {
      // navbar
      navbar: zhNavbar,
      navbarTitle: "PvZ2 Gardendless",
      // sidebar
      sidebar: zhSidebar,

      footer: "《PvZ2 Gardendless》官方网站: pvzge.com",
      copyright: "Copyright 2021-2024 <a href=\"https://gaozih.com\">Gaozih</a> © All Rights Reserved.",
      displayFooter: true,

      // page meta
      metaLocales: {
        editLink: "在 GitHub 上编辑此页",
      },
    },
  },

  encrypt: {
    config: {
      "/demo/encrypt.html": ["1234"],
      "/zh/demo/encrypt.html": ["1234"],
    },
  },

  plugins: {
    // Note: This is for testing ONLY!
    // You MUST generate and use your own comment service in production.
    // comment: {
    //   provider: "Giscus",
    //   repo: "vuepress-theme-hope/giscus-discussions",
    //   repoId: "R_kgDOG_Pt2A",
    //   category: "Announcements",
    //   categoryId: "DIC_kwDOG_Pt2M4COD69",
    // },
    comment: {
      provider: "Giscus",
      repo: "Gzh0821/pvzg_site",
      repoId: "R_kgDOMVGuyA",
      category: "Announcements",
      categoryId: "DIC_kwDOMVGuyM4ChC2W",
    },

    searchPro: true,
    components: {
      components: ["Badge", "BiliBili", "VPCard", "VidStack",],
    },

    // All features are enabled for demo, only preserve features you need here
    mdEnhance: {
      alert: true,
      align: true,
      attrs: true,
      codetabs: true,
      component: true,
      demo: true,
      figure: true,
      imgLazyload: true,
      imgSize: true,
      include: true,
      mark: true,
      plantuml: true,
      spoiler: true,
      stylize: [
        {
          matcher: "Recommended",
          replacer: ({ tag }) => {
            if (tag === "em")
              return {
                tag: "Badge",
                attrs: { type: "tip" },
                content: "Recommended",
              };
          },
        },
      ],
      sub: true,
      sup: true,
      tabs: true,
      tasklist: true,
      vPre: true,

      // Install chart.js before enabling it
      // chart: true,

      // insert component easily

      // Install echarts before enabling it
      // echarts: true,

      // Install flowchart.ts before enabling it
      // flowchart: true,

      // gfm requires mathjax-full to provide tex support
      // gfm: true,

      // Install katex before enabling it
      // katex: true,

      // Install mathjax-full before enabling it
      // mathjax: true,

      // Install mermaid before enabling it
      // mermaid: true,

      // playground: {
      //   presets: ["ts", "vue"],
      // },

      // Install reveal.js before enabling it
      // revealJs: {
      //   plugins: ["highlight", "math", "search", "notes", "zoom"],
      // },

      // Install @vue/repl before enabling it
      // vuePlayground: true,

      // Install sandpack-vue3 before enabling it
      // sandpack: true,
    },
    seo: true,
    sitemap: true,
    // Install @vuepress/plugin-pwa and uncomment these if you want a PWA
    // pwa: {
    //   favicon: "/favicon.ico",
    //   cacheHTML: true,
    //   cacheImage: true,
    //   appendBase: true,
    //   apple: {
    //     icon: "/assets/icon/apple-icon-152.png",
    //     statusBarColor: "black",
    //   },
    //   msTile: {
    //     image: "/assets/icon/ms-icon-144.png",
    //     color: "#ffffff",
    //   },
    //   manifest: {
    //     icons: [
    //       {
    //         src: "/assets/icon/chrome-mask-512.png",
    //         sizes: "512x512",
    //         purpose: "maskable",
    //         type: "image/png",
    //       },
    //       {
    //         src: "/assets/icon/chrome-mask-192.png",
    //         sizes: "192x192",
    //         purpose: "maskable",
    //         type: "image/png",
    //       },
    //       {
    //         src: "/assets/icon/chrome-512.png",
    //         sizes: "512x512",
    //         type: "image/png",
    //       },
    //       {
    //         src: "/assets/icon/chrome-192.png",
    //         sizes: "192x192",
    //         type: "image/png",
    //       },
    //     ],
    //     shortcuts: [
    //       {
    //         name: "Demo",
    //         short_name: "Demo",
    //         url: "/demo/",
    //         icons: [
    //           {
    //             src: "/assets/icon/guide-maskable.png",
    //             sizes: "192x192",
    //             purpose: "maskable",
    //             type: "image/png",
    //           },
    //         ],
    //       },
    //     ],
    //   },
    // },
  },
});
