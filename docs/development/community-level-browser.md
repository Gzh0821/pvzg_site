# 社区关卡浏览与游戏启动（2026-11-10）

## 当前状态

四语言的 `/creator-garden/community-level.html` 已恢复。本轮用户授权先发布静态关卡源与官网浏览／下载，客户端由用户之后单独发布。因此 `App.vue` 的 `GAME_LAUNCH_ENABLED` 暂为 `false`，线上不显示游戏启动按钮。旧 `level-list` 与 `levelapi.pvzge.com` 不恢复。

创意花园的结构导航自动加入社区关卡入口。列表支持名称／作者／说明／路径搜索、作者／目录筛选和每页 24 关；同页 `?path=<关卡路径>` 显示详情。详情包含原文件中的名称、作者、说明、场景、可确定的波次／初始阳光／供给、植物和僵尸引用，以及原文件下载、GitHub 来源和游戏启动链接。

引用列表包含候选、禁用项及本地实体，不将引用数称作实际出场数量。关卡没有的元数据不补造；作者未提供对应语言时展示其已有文本。页面不执行关卡内容，不渲染作者 HTML。

## 数据与启动契约

- 固定源：`https://levels.pvzge.com/api/github-levels/`。
- 新增静态 `catalog.json`：`{version:1, tree, levels:[{path, sha, size, title, description, author, folder, stage, startingSun, seedMode, waveCount}]}`。由 `../pvzge_github_levels/scripts/build-static-pages.mjs` 在已有 Pages 构建中生成，不添加运行时服务、R2 或付费服务。当前 785 关摘要约 300 KB；列表只读取一次摘要，选中详情后再读取单关原文件。
- 下载保留原字节、原扩展名；详情核对目录记录的字节数与 Git blob SHA-1。更新冲突会提示刷新。
- 链接格式：`pvzge://github-level/open?path=<路径>&sha=<40位Git blob SHA>`，不接受任意下载地址。
- 对应客户端实现位于 `../pvzge_build/src/addon/gp-next/core/github-level*.js`。客户端启动后排队处理意图，重新读取固定目录，检查路径、SHA、字节上限和正文哈希，再调用既有进关流程。已在对局中时拒绝启动。

## 验证

- 网站纯函数 2 项、静态索引／Pages 构建 4 项、客户端及相邻 Nest 导入 12 项通过；官网完整 1,443 页生产构建和游戏 Vite 构建通过。
- 浏览器使用本地生成的真实 785 关静态产物替代尚未上线的 `catalog.json`。四语言详情、390px 手机与 1440px 桌面、明暗模式、名称／路径搜索、原文件 Blob 下载及启动链接检查通过；列表仅发 1 个关卡源请求，详情仅发 2 个。`Morticulturalist` 搜索返回对应 7 关。无页面横向溢出，设计检测无问题。
- 隔离 macOS Tauri 诊断 bundle 中，实际通过公网读取并校验 `AbsurdLach/Errors/ACT4_PirateSea_Night/4_1.JSON`，从 `mainScene` 进入 `inGameScene`，状态 `launched`。随后通过 Tauri `deep-link://new-url` 事件再次发送链接，收到 `in-game` 拒绝和先退出当前关卡提示。
- macOS 测试调用接收函数及原生事件，不代表操作系统从浏览器冷启动已验收；Windows 桌面未实测。未发布的新客户端代码不能视为现有安装包已支持。

## 发布顺序

本轮先部署并检查静态关卡源的 `catalog.json`，再上线官网浏览／下载；沿用现有服务器每半小时同步 fork 和 Pages 分发。含 GitHub 关卡协议的兼容客户端公开后，再将 `App.vue` 的 `GAME_LAUNCH_ENABLED` 改为 `true` 并发布官网。本轮不发布客户端，不更新游戏版本元数据或安装包。

游戏更新时应同步审阅 `../pvzge_github_levels/scripts/level-text.mjs` 中提取自 0.16.15 `MultiLanguage.LevelName` 的官方文本。

## 网页先行发布（2026-11-10）

- 按用户要求仅发布网页和静态摘要接口，客户端保留源码，未构建或发布安装包。
- 静态关卡源提交 `828d4b6`、标题键显示修正 `1fe2b36` 已推送并由既有 Pages 自动部署。正式域名与默认 Pages 域名的 `catalog.json` 均为 200、版本 1、789 关；最终 tree 为 `8f70ead62b89f81e19fb934b458e46fbc189aa56`。全部记录的路径／大小／SHA 与游戏目录逐项一致，三份实际关卡的字节长度和 Git blob SHA 抽检通过。
- 官网提交 `4f3b5b1c9b` 已推送，GitHub 构建／部署 `42838123629` 成功；既有 `pvzge-site-workers` 部署成功，版本 ID `3965d4f0-4a85-4b39-9146-b94ee4e72348`。
- 正式入口：`https://pvzge.com/creator-garden/community-level.html`，英文、西班牙文、俄文页面均返回 200。真实浏览器确认 789 关列表、搜索返回 7 个 Morticulturalist 关卡、详情内容和原文件 Blob 下载（`Morticulturalist7.json`，19,410 字节）正常；页面没有 `pvzge:` 启动链接。列表读取一次摘要、详情读取摘要及单关正文，不预先下载整个关卡库。
- 原服务器半小时定时器仍为 active，最近运行 success；未新增付费服务，未操作 R2 或更改客户端更新信息。
