---
title: 新植物、僵尸与资源
icon: toolbox
pageInfo: false
index: true
order: 12
---

# 新植物、僵尸与资源

## 玩家安装

一个新植物模组可能包含内容包和前置框架。安装作者列出的全部 ZIP，启用 JavaScript，再按提示重启。只有内容包而没有前置时，图片或动画不会自动变成可用植物。

## 作者如何组织资源

GP-Next 不强制所有模组采用同一份实体 JSON。自己的前置可以约定自己的文件格式，通过 `files` 读取图片、音频、骨骼或其他文件，再提供内容注册方式。

资源须符合所选框架支持的格式和版本。PNG 图片、声音和骨骼文件不会仅因放进 ZIP 就自动成为游戏内容；作者需要提供相应的读取和注册方式。不要把不兼容的动画文件改扩展名后直接导入。

## 启动注册 API

需要在进入游戏前注册内容时，在清单中声明：

```json
"js": { "entry": "scripts/main.js", "startup": true, "reloadable": false }
```

入口同时提供 `startup(ctx)` 和 `setup(ctx)`。`startup` 在游戏对象可用、第一场景开始前执行；运行期操作放进 `setup`。

| 接口 | 用法 |
| --- | --- |
| `ctx.files` | 读取自身或已声明前置的文件 |
| `ctx.registry.provide(id, value)` | 提供启动阶段的前置能力 |
| `ctx.registry.resolve(provider, id)` | 获取直接依赖提供的启动能力 |
| `ctx.registrations.add(id, registration)` | 登记内容准备、发布和清理 |
| `ctx.engine.getCc/getClassByName/getSystemModule/getModuleExport` | 高级作者访问与目标游戏版本匹配的对象 |
| `ctx.runtime` / `ctx.log` | 管理任务、清理和日志 |

注册对象中 `prepare` 可异步加载资源；`publish` 必须同步，只发布已准备内容；`dispose` 负责回收未发布的内容。`getResources` 可提供资源状态。完整签名见 [StartupContext 与 StartupRegistration](./gp-next-api-reference.md#startupcontext)。

新增植物或僵尸需要固定身份时，`prepare` 可返回 `identities`；各条目包含 `id/kind/codename/engineId`，并参考传入的 `previousIdentities/identities`。不要在升级时随意改变已有内容身份。此机制不替作者处理任意自定义存档格式。

启动模组依赖的 JS 前置也必须声明 `startup: true`；普通运行期 JS 服务不能提前使用。启动后的服务共享使用 `ctx.services`。

发布过的新类型与资源通常需要重启才能更换或停用。请在模组说明中写清前置、支持的游戏版本和是否影响存档。

## 准备、发布与失败清理

这个入口读取自带的 `data/options.json`（如 `{"message":"Ready"}`），在准备完成后发布到模组自己的变量。它只演示启动时序，不会新增植物或导入骨骼动画。真实资源可在 prepare 中通过所选框架准备，在 publish 中同步注册；需要回收的临时资源在 dispose 中释放。

```js
let options
export default {
  startup(ctx) {
    const files = ctx.files.own()
    let prepared
    ctx.registrations.add('options', {
      async prepare() {
        const text = await files.readText('data/options.json')
        if (text === null) throw new Error('Missing data/options.json')
        prepared = JSON.parse(text)
        if (typeof prepared.message !== 'string') throw new Error('message must be a string')
      },
      publish() { options = prepared },
      dispose() { prepared = undefined }
    })
  },
  setup(ctx) { ctx.ui.toast(options.message) }
}
```

不要在 publish 中继续 await 文件读取，也不要在 publish 中重新调用 ctx.engine 或 ctx.registry。需要的游戏对象在 startup/prepare 阶段取得；所需前置服务在 startup 收集阶段取得。启动资源已发布后，更新或停用按提示重启。
