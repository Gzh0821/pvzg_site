---
title: Website Development Guide
icon: laptop-code
pageInfo: false
comment: false
index: true
order: 5
---

Welcome to participate in the "PvZ2 Gardendless" official website open source project! Whether you are a novice developer or an experienced developer, we encourage you to contribute code, submit issues or suggestions.
Below is a brief development guide to help zero-based users quickly participate in this project.

## 1. Preparation

Before you start, you need to complete some basic settings. For `Windows` systems, we recommend that you use `PowerShell` of `Windows Terminal` to run commands, which can be started through the right-click menu.

### 1.1 Install VScode, Git and Node.js

#### VScode

VScode is a lightweight code editor that supports multiple programming languages. In project development, we recommend using VScode to edit code.

- Download and install VScode: [VScode official website](https://code.visualstudio.com/)
- Read the [VScode documentation](https://code.visualstudio.com/docs) to learn more about how to use it.
- It is recommended to install plugins: `Vue - Official`, `ESLint`, `GitLens`, etc. to improve development efficiency.

#### Git

Git is a tool for managing project versions. In project development, we will use Git to pull code and submit modifications.

- Download and install Git: [Git official website](https://git-scm.com/), for Windows, it is recommended that you download `64-bit Git for Windows Setup`.
- You can use the default settings during the installation process.
- It is recommended to select `Use Visual Studio Code as Git's default editor` for the default editor.
- It is recommended to select `Git from the command line and also from 3rd-party software` for environment variable configuration.
- After the installation is complete, you can run the following command through the command line to confirm whether the installation is successful:

```bash
git --version
```

#### Node.js

VuePress is a static website generator based on Node.js, so you need to install Node.js.

- Download and install Node.js: [Node.js official website](https://nodejs.org/)
- After the installation is complete, you can run the following command to confirm whether the installation is successful:

```bash
node --version
npm --version
```

### 1.2 Install Corepack

Corepack is a Node.js package manager that helps you install and manage project dependencies faster.

- Run the following command to activate Corepack:

```bash
corepack enable
```

## 2. Fork the project

### 2.1 Create a Github account

Before participating in the project, you need to register a GitHub account.

### 2.2 Fork the project

When participating in a project on GitHub, you can fork (copy a copy of the project to your own account) to carry out development work.

1. Visit the [pvzg_site project](https://github.com/Gzh0821/pvzg_site).
2. Click the `Fork` button in the upper right corner of the page to copy the project to your own GitHub repository.
3. Enter the project repository you forked.

## 3. Clone the project locally

After you fork the project, you need to clone the project code to your local computer. `VScode` provides the function of cloning repositories. You can check its documentation to learn more, or use the terminal:

1. Open the terminal. For Windows, please use `Windows Terminal` or the terminal function included with `VScode`.

2. In the path where you want to place this project, run the following command to clone the project locally:

```bash
git clone https://github.com/YOUR_USERNAME/pvzg_site.git
```

Please replace `YOUR_USERNAME` with your GitHub username.

3. Enter the project directory, which should contain the `package.json` file:

```bash
cd pvzg_site
```

4. Open the project directory through `VScode`. After that, you can use `VScode` to enter commands and write files:

```bash
code .
```

## 4. Install dependencies

After entering the project directory, you need to install the dependency packages required by the project. All subsequent commands must be entered in the project directory path.

- Use `Corepack` to install `pnpm`, and use `pnpm` to install dependencies:

```bash
corepack install
# Check if pnpm is correctly installed in the project
pnpm -v
# Install dependencies
pnpm install
```

## 5. Run the development environment

After installing the dependencies, you can start the development environment of the project and view the document website running locally.

- Use the following command to start the development server:

```bash
pnpm docs:dev
```

After successful startup, you can visit `http://localhost:8080` in your browser to view the website in development.

## 6. Start editing

Now you can modify and optimize the code.

### 6.1 Markdown file

Markdown is a lightweight markup language. You can learn more about it through [Markdown Guide](https://www.markdownguide.org/).

The page content of the project is mainly written in Markdown, with the suffix `.md`. You can find the page files of the project in the `src` directory.

This project is developed using `Vuepress`. For the use of `Vuepress`, you can check [Vuepress official documentation](https://vuepress.vuejs.org/) to learn more.

The format of `.md` files is as follows:

```markdown
<!-- Configuration items -->
---
title: page title
index: false
...
---
<!-- HTML components -->
<script />
<Catalog />

> [!info]
> info here...

### Title

Content...
```

### 6.2 Provide translations

Under the `src` directory, you can find the `en` directory, which contains the English pages of this website. You can refer to the files in this directory and translate them into other languages.

For translation work, you only need to modify the `.md` files in the corresponding language directory, such as `ru-RU`, `pt-BR`. You need to keep the file structure and name in the directory consistent with `en`.

For the configuration items in the `.md` file, only `title` needs to be modified, and for the `HTML component`, it can be left unchanged.
It is recommended that you check whether the page is displayed correctly at any time when making changes.

## 7. Submit changes and initiate a Pull Request

When you have completed the code modification and tested successfully, you can submit your changes and initiate a Pull Request.

### 7.1 Submit changes and push to GitHub

We recommend that you use `VScode` to submit. Just fill in the submission information in `Source Control` on the left side of `VScode`, then click Submit, and click Synchronize Changes.

To submit using the terminal:

1. Add the modified code to Git:

```bash
git add .
```

2. Submit the changes:

```bash
git commit -m "Describe your changes"
```

3. Push local changes to your own GitHub repository:

```bash
git push origin main
```

### 7.3 Initiate Pull Request

1. Go to your GitHub repository page.
2. Click the `Compare & pull request` button at the top of the page.
3. Fill in the description of the changes and submit the Pull Request.

We will review your Pull Request as soon as possible and provide feedback or merge as needed.

## 8. Submit Issues

If you encounter problems during development, you can provide feedback through GitHub's Issues system.

1. Visit the project's [Issues page](https://github.com/Gzh0821/pvzg_site/issues).

2. Click the `New issue` button.

3. Fill in the problem description and submit.

## 9. Participate in discussions

We welcome all users to participate in the project's discussions! You can communicate with us in the following ways:

- Participate in Discussions on GitHub.

- Participate in discussions on the Discord server.

Thank you for your support and contribution to this project, and we look forward to working with you to improve this project!