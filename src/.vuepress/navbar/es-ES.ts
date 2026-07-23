import { navbar } from "vuepress-theme-hope";

export const esNavbar = navbar([
  "/es-ES/download/",
  "/es-ES/almanac/",
  "/es-ES/guide/",
  "/es-ES/creator-garden/",
  "/es-ES/useful-tool/",
  {
    text: "Más",
    icon: "ellipsis",
    children: ["/es-ES/contribution/", "/es-ES/instructions/"],
  },
  { text: "Juego en línea", link: "https://play.pvzge.com", icon: "circle-play" },
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
