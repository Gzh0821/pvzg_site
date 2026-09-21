---
title: 编写 JavaScript 模组
icon: toolbox
pageInfo: false
index: true
order: 9
---

# 编写 JavaScript 模组

只改数值或翻译时，优先使用 [JSON 模组](./gp-next-datapack.md)。需要按游戏状态执行操作、添加自己的选项或读取资源时，再写 JavaScript。

## 最小可运行模组

```text
hello-mod/
├── pack.json
└── scripts/
    └── main.js
```

`pack.json`：

```json
{
  "uuid": "yourname.hello",
  "name": "问候模组",
  "version": "1.0.0",
  "packFormatVersion": 1,
  "apiVersion": 2,
  "minGpNextVersion": "1.5.0-pre.1",
  "js": { "entry": "scripts/main.js" }
}
```

`scripts/main.js`：

```js
export default {
  setup(ctx) {
    ctx.ui.toast('模组已加载', 'success')
  }
}
```

压缩后从模组页导入，按[控制台说明](./gp-next-console.md)开启 JS，勾选并应用。更新时保持 `uuid` 不变，增加 `version`，重新导入。

## 给玩家一个按钮

在 `setup(ctx)` 中定义面板，玩家点开模组详情就能使用：

```js
ctx.controls.definePanel({
  title: '问候',
  groups: [{
    title: '操作',
    items: [{
      type: 'action', key: 'hello', label: '打个招呼',
      onClick: () => ctx.ui.toast('你好！')
    }]
  }]
})
```

`action` 使用 `onClick`。数值、文本、开关和选择控件使用 `getValue()` / `setValue(value)`；不要写成 `value/onChange`。

## 保存设置和进度

给玩家调整的选项用 `ctx.settings`，玩法进度用 `ctx.storage`。读写文件的 `ctx.files` 只用于读取包内内容，不能写入。

停用模组不会自动撤销已经保存的进度或货币变化。测试会改存档的操作时，使用单独存档。

## 多文件和 TypeScript

已写成单个入口的 JS 不需要构建工具。使用 TypeScript、多个源码文件或 npm 库时，由作者把它们打包成一个自包含的 ES module，再交付 ZIP。玩家不需要 Node.js 或编译器。

[API 用法](./gp-next-api.md) · [完整参数类型](./gp-next-api-reference.md) · [资源与前置](./gp-next-resources.md)
