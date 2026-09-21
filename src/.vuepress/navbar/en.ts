import { navbar } from "vuepress-theme-hope";

export const enNavbar = navbar([
  "/en/download/",
  "/en/almanac/",
  "/en/guide/",
  { text: "Garden", link: "/en/creator-garden/", icon: "feather" },
  "/en/useful-tool/",
  {
    text: "More",
    icon: "ellipsis",
    children: ["/en/contribution/", "/en/instructions/"],
  },
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
