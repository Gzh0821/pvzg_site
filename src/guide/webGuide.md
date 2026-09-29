---
title: 官网开发指南
icon: laptop-code
pageInfo: false
index: true
order: 5
---

## 本地运行

安装 Git、满足项目依赖要求的 Node.js 和 `package.json` 中指定版本的 pnpm。Fork [官网仓库](https://github.com/Gzh0821/pvzg_site)，将下面的 `YOUR_USERNAME` 换成自己的 GitHub 用户名：

```bash
git clone https://github.com/YOUR_USERNAME/pvzg_site.git
cd pvzg_site
pnpm install
pnpm docs:dev
```

打开终端显示的预览地址。修改后运行 `pnpm docs:build`，检查构建输出。

## 修改位置

| 内容 | 目录 |
| --- | --- |
| 中文页面 | `src/` |
| 英文、西班牙文、俄文 | `src/en/`、`src/es-ES/`、`src/ru-RU/` |
| 交互工具 | `src/components/` |
| 下载文件、图片和公共 JSON | `src/.vuepress/public/` |
| 导航和样式 | `src/.vuepress/` |

页面使用 Markdown，顶部 frontmatter 定义标题、图标和目录顺序。修改已有页面时保留其配置，使用相对链接，并同步相关语言。不要编辑 `.cache`、`.temp` 或 `dist` 中的生成文件。

## 提交贡献

在自己的分支提交修改并发起 Pull Request，说明改动和验证结果。没有代码修改时，也可在 [Issues](https://github.com/Gzh0821/pvzg_site/issues) 提供复现步骤、截图或建议。
