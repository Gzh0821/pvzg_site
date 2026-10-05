import { navbar } from "vuepress-theme-hope";

export const zhNavbar = navbar([
  "/download/",
  "/almanac/",
  "/guide/",
  "/creator-garden/",
  "/useful-tool/",
  {
    text: "更多",
    icon: "ellipsis",
    children: [
      { text: "创意苗圃 (Beta)", link: "https://nest.pvzge.com/", icon: "seedling" },
      "/contribution/",
      "/instructions/",
    ],
  },
  { text: "在线游玩", link: "https://play.pvzge.com", icon: "circle-play" },
  // "/demo/",
  // {
  //   text: "指南",
  //   icon: "lightbulb",
  //   prefix: "/zh/guide/",
  //   children: [
  //     {
  //       text: "Bar",
  //       icon: "lightbulb",
  //       prefix: "bar/",
  //       children: ["baz", { text: "...", icon: "ellipsis", link: "" }],
  //     },
  //     {
  //       text: "Foo",
  //       icon: "lightbulb",
  //       prefix: "foo/",
  //       children: ["ray", { text: "...", icon: "ellipsis", link: "" }],
  //     },
  //   ],
  // },
  // {
  //   text: "V2 文档",
  //   icon: "book",
  //   link: "https://theme-hope.vuejs.press/zh/",
  // },
]);
