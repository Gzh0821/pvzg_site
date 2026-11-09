---
title: 编写 JavaScript 模组
icon: toolbox
pageInfo: false
index: true
order: 9
---

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
  "gpNextVersion": ">=1.5.2",
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

先在“实验性 → JS Modding”确认风险并开启 JS，再从模组页导入压缩包，勾选并应用。更新时保持 `uuid` 不变，增加 `version`，重新导入。

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

升级已有模组前，检查[属性 Hook 的旧写法迁移](./gp-next-api.md#属性-hook-与旧写法迁移)。GP-Next 1.5.6 不再向 getter 提供预读 `value`，需要显式调用 `callNext()`；setter 返回值也不会自动写入。`apiVersion: 2` 不会恢复旧行为。

下载[最新类型声明](/downloads/mods/gp-next-api.d.ts)，放在入口文件旁。JavaScript 可在文件顶部启用 `// @ts-check`，并为 `setup` 标注上下文，让编辑器检查回调参数：

```js
// @ts-check
export default {
  /** @param {import('./gp-next-api').ModContext} ctx */
  setup(ctx) {
    ctx.ui.toast('模组已加载', 'success')
  }
}
```

类型声明仅用于开发时检查，不是运行时模块；升级后重新检查源码并重新打包，不能只更改清单版本。

已写成单个入口的 JS 不需要构建工具。使用 TypeScript、多个源码文件或 npm 库时，由作者把它们打包成一个自包含的 ES module，再交付 ZIP。玩家不需要 Node.js 或编译器。

[API 用法](./gp-next-api.md) · [完整参数类型](./gp-next-api-reference.md) · [资源与前置](./gp-next-resources.md)
