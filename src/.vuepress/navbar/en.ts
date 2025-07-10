import { navbar } from "vuepress-theme-hope";

export const enNavbar = navbar([
  "/en/",
  "/en/download/",
  "/en/almanac/",
  "/en/guide/",
  "/en/creator-garden/",
  "/en/useful-tool/",
  "/en/instructions/",
  "/en/contribution/",
  { text: "Online Play", link: "https://play.pvzge.com", icon: "circle-play" },
  // "/",
  // "/portfolio",
  // "/demo/",
  // {
  //   text: "Guide",
  //   icon: "lightbulb",
  //   prefix: "/guide/",
  //   children: [
  //     {
  //       text: "Bar",
  //       icon: "lightbulb",
  //       prefix: "bar/",
  //       children: ["baz", { text: "...", icon: "ellipsis", link: "#" }],
  //     },
  //     {
  //       text: "Foo",
  //       icon: "lightbulb",
  //       prefix: "foo/",
  //       children: ["ray", { text: "...", icon: "ellipsis", link: "#" }],
  //     },
  //   ],
  // },
  // {
  //   text: "V2 Docs",
  //   icon: "book",
  //   link: "https://theme-hope.vuejs.press/",
  // },
]);
