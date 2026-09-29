---
title: Website Development Guide
icon: laptop-code
pageInfo: false
index: true
order: 5
---

## Run locally

Install Git, a Node.js version supported by the dependencies, and the pnpm version specified in `package.json`. Fork the [site repository](https://github.com/Gzh0821/pvzg_site) and replace `YOUR_USERNAME` with your GitHub username:

```bash
git clone https://github.com/YOUR_USERNAME/pvzg_site.git
cd pvzg_site
pnpm install
pnpm docs:dev
```

Open the preview URL printed in the terminal. Run `pnpm docs:build` after editing and check the output.

## Where to edit

| Content | Directory |
| --- | --- |
| Chinese pages | `src/` |
| English, Spanish, Russian | `src/en/`, `src/es-ES/`, `src/ru-RU/` |
| Interactive tools | `src/components/` |
| Downloads, images, public JSON | `src/.vuepress/public/` |
| Navigation and styles | `src/.vuepress/` |

Pages use Markdown with frontmatter for titles, icons and ordering. Preserve existing configuration, use relative links and update related languages. Do not edit generated files in `.cache`, `.temp` or `dist`.

## Contribute

Commit on your own branch and open a Pull Request describing the changes and validation. For reports or suggestions, use [Issues](https://github.com/Gzh0821/pvzg_site/issues) with reproduction steps or screenshots.
