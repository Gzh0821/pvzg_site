---
title: Guia de desarrollo del sitio web
icon: laptop-code
pageInfo: false
index: true
order: 5
---

## Ejecutar localmente

Instala Git, una versión de Node.js compatible con las dependencias y la versión de pnpm indicada en `package.json`. Haz un fork del [repositorio](https://github.com/Gzh0821/pvzg_site) y sustituye `YOUR_USERNAME` por tu usuario de GitHub:

```bash
git clone https://github.com/YOUR_USERNAME/pvzg_site.git
cd pvzg_site
pnpm install
pnpm docs:dev
```

Abre la dirección que muestra el terminal. Después de editar, ejecuta `pnpm docs:build` y comprueba el resultado.

## Dónde editar

| Contenido | Directorio |
| --- | --- |
| Páginas chinas | `src/` |
| Inglés, español, ruso | `src/en/`, `src/es-ES/`, `src/ru-RU/` |
| Herramientas interactivas | `src/components/` |
| Descargas, imágenes y JSON públicos | `src/.vuepress/public/` |
| Navegación y estilos | `src/.vuepress/` |

Las páginas usan Markdown y frontmatter para título, icono y orden. Conserva la configuración, usa enlaces relativos y actualiza los idiomas relacionados. No edites archivos generados en `.cache`, `.temp` o `dist`.

## Contribuir

Trabaja en tu rama y abre un Pull Request con los cambios y su validación. También puedes informar de problemas en [Issues](https://github.com/Gzh0821/pvzg_site/issues), incluyendo pasos y capturas.
