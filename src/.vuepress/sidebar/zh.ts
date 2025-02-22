import { sidebar } from "vuepress-theme-hope";

export const zhSidebar = sidebar({
  "/download/": "structure",
  "/instructions/": "structure",
  "/guide/": "structure",
  "/custom-level/": "structure",
  "/contribution/": "structure",
  "/almanac/": "structure",
  "/": [
    // "portfolio",
    // {
    //   text: "案例",
    //   icon: "laptop-code",
    //   prefix: "demo/",
    //   link: "demo/",
    //   children: "structure",
    // },
    // {
    //   text: "文档",
    //   icon: "book",
    //   prefix: "guide/",
    //   children: "structure",
    // },
    // {
    //   text: "幻灯片",
    //   icon: "person-chalkboard",
    //   link: "https://plugin-md-enhance.vuejs.press/zh/guide/content/revealjs/demo.html",
    // },
  ],
});
