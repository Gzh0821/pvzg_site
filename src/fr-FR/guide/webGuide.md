---
title: 官网开发指南
icon: laptop-code
pageInfo: false
index: true
order: 5
---

欢迎您参与《PvZ2 Gardendless》网站开源项目！无论您是开发新手，还是有经验的开发者，我们都鼓励您贡献代码、提交问题或建议。
下面是一个简要的开发指南，帮助零基础用户快速参与本项目。

## 1. 准备工作

在开始之前，您需要完成一些基础的设置。对于`Windows`系统，我们建议您使用`Windows Terminal`的`PowerShell`运行命令，可以通过右键菜单开始打开。

### 1.1 安装 VScode , Git 和 Node.js

#### VScode

VScode 是一款轻量级的代码编辑器，支持多种编程语言。在项目开发中，我们推荐使用 VScode 来编辑代码。

- 下载并安装 VScode: [VScode 官方网站](https://code.visualstudio.com/)
- 阅读 [VScode 文档](https://code.visualstudio.com/docs) 了解更多使用方法。
- 建议安装插件：`Vue - Official`、`ESLint`、`GitLens` 等提高开发效率。

#### Git

Git 是管理项目版本的工具。在项目开发中，我们会使用 Git 来拉取代码并提交修改。

- 下载并安装 Git: [Git 官方网站](https://git-scm.com/) ，对于Windows，建议您下载 `64-bit Git for Windows Setup` 。
- 安装过程中可以使用默认设置。
- 默认编辑器(Default Editor)建议选择 `Use Visual Studio Code as Git's default editor`。
- 环境变量配置建议选择 `Git from the command line and also from 3rd-party software`。
- 安装完成后，您可以通过命令行运行以下命令来确认是否安装成功：

```bash
  git --version
```

#### Node.js

VuePress 是基于 Node.js 的静态网站生成器，因此您需要安装 Node.js。

- 下载并安装 Node.js: [Node.js 官方网站](https://nodejs.org/)
- 安装完成后，您可以运行以下命令来确认是否安装成功：

```bash
node --version
npm --version
```

### 1.2 安装 Corepack

Corepack 是一个 Node.js 包管理器，它可以帮助您更快地安装和管理项目依赖。

- 运行以下命令来激活 Corepack：

```bash
corepack enable
```

## 2. Fork 项目

### 2.1 创建Github账号

在参与项目之前，您需要注册一个 GitHub 账号。

### 2.2 Fork 项目

在 GitHub 上参与项目时，您可以通过 Fork（复制一份项目到自己的账户）来进行开发工作。

1. 访问 [pvzg_site项目](https://github.com/Gzh0821/pvzg_site)。
2. 点击页面右上角的 `Fork` 按钮，将项目复制到您自己的 GitHub 仓库中。
3. 进入您 Fork 后的项目仓库。

## 3) 克隆项目到本地

在您 Fork 项目后，需要将项目代码克隆到您的本地计算机上。`VScode` 提供了克隆仓库的功能，您可以查看其文档了解，或使用终端：

1. 打开终端，Windows 请使用 `Windows Terminal` 或 `VScode` 附带的终端功能。

2. 在您想放置本项目的路径下，运行以下命令，将项目克隆到本地：

```bash
git clone https://github.com/YOUR_USERNAME/pvzg_site.git
```

请将 `YOUR_USERNAME` 替换为您的 GitHub 用户名。

3. 进入项目目录，项目目录中应包含 `package.json` 文件：

```bash
cd pvzg_site
```

4. 通过 `VScode` 打开项目目录，之后，你可以使用 `VScode` 输入命令和编写文件：

```bash
code .
```

## 4. 安装依赖

进入项目目录后，您需要安装项目所需的依赖包，后续所有命令都要在项目目录路径中输入。

- 使用 `Corepack` 安装 `pnpm` ，使用 `pnpm` 安装依赖：

```bash
corepack install
# 检查是否正确在项目中安装了pnpm 
pnpm -v
# 安装依赖
pnpm install
```

## 5. 运行开发环境

安装依赖完成后，您可以启动项目的开发环境，查看本地运行的文档网站。

- 使用以下命令启动开发服务器：

```bash
pnpm docs:dev
```

成功启动后，您可以在浏览器中访问 `http://localhost:8080` 查看开发中的网站效果。

## 6. 开始编辑

现在您已经可以对代码进行修改和优化了。

### 6.1 Markdown 文件

Markdown是一种轻量级标记语言，您可以通过 [Markdown Guide](https://www.markdownguide.org/) 了解更多。

项目的页面内容主要使用 Markdown 编写，后缀名为 `.md` ，您可以在 `src` 目录下找到项目的页面文件。

本项目使用 `Vuepress` 开发，对于 `Vuepress` 的使用，您可以查看 [Vuepress 官方文档](https://vuepress.vuejs.org/zh/) 了解更多。

`.md` 文件格式大致如下：

```markdown
<!-- 配置项 -->
---
title: 页面的标题
index: false
...
---
<!-- HTML组件 -->
<script />
<Catalog />

> [!info]
> info here...

### Title

Content...
```

### 6.2 提供翻译

在 `src` 目录下，您可以找到 `en` 目录，其中包含本网站的英文页面，您可以参考该目录内的文件，将其翻译为其他语言。

对于翻译工作，您只需要修改对应语言目录，如`ru-RU`,`pt-BR`内`.md`文件即可，您需要保持目录内文件结构和名称与`en`保持一致。

对于`.md`文件中的配置项，仅需修改`title`，对于`HTML组件`，保持不变即可。
建议您在修改时，随时检查页面是否正确显示。

## 7. 提交修改并发起 Pull Request

当您对代码的修改完成并测试成功后，您可以提交您的修改并发起 Pull Request。

### 7.1 提交修改并推送到 GitHub

我们建议您使用`VScode`提交，只需在`VScode`左侧的`Source Control`中填写提交信息，然后点击提交，并点击同步更改即可。

要使用终端提交：

1. 将修改的代码添加到 Git：

```bash
git add .
```

2. 提交修改：

```bash
git commit -m "描述您的修改内容"
```

3. 将本地修改推送到您自己的 GitHub 仓库：

```bash
git push origin main
```

### 7.2 发起 Pull Request

1. 进入您的 GitHub 仓库页面。
2. 点击页面上方的 `Compare & pull request` 按钮。
3. 填写修改的描述，并提交 Pull Request。

我们将会尽快审查您的 Pull Request，并根据需要进行反馈或合并。

## 8. 提交问题 (Issues)

如果您在开发过程中遇到问题，您可以通过 GitHub 的 Issues 系统进行反馈。

1. 访问项目的 [Issues 页面](https://github.com/Gzh0821/pvzg_site/issues)。
2. 点击 `New issue` 按钮。
3. 填写问题描述并提交。

## 9) 参与讨论

我们欢迎所有用户参与项目的讨论！您可以通过以下方式与我们交流：

- 在 GitHub 上参与 Discussions 讨论。
- 在 Discord 服务器上参与讨论。

感谢您对本项目的支持与贡献，我们期待与您一同完善这个项目！
