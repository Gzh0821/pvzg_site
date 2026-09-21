import { navbar } from "vuepress-theme-hope";

export const ruNavbar = navbar([
  "/ru-RU/download/",
  "/ru-RU/almanac/",
  "/ru-RU/guide/",
  "/ru-RU/creator-garden/",
  "/ru-RU/useful-tool/",
  {
    text: "Ещё",
    icon: "ellipsis",
    children: ["/ru-RU/contribution/", "/ru-RU/instructions/"],
  },
  { text: "Онлайн-игра", link: "https://play.pvzge.com", icon: "circle-play" },
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
