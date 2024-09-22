import { navbar } from "vuepress-theme-hope";

export const zhNavbar = navbar([
  "/",
  "/download/",
  "/almanac/",
  "/guide/",
  "/custom-level/",
  "/instructions/",
  "/contribution/",
  "/devtool/",
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
