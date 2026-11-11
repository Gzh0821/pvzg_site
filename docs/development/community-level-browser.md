# 社区关卡浏览与游戏启动（2026-11-10）

## 当前状态

四语言的 `/creator-garden/community-level.html` 已恢复。GitHub 关卡启动要求 GP-Next 1.5.10；客户端四包公开发布、线上验证及 R2 清理于 2026-11-11 22:09:52（北京时间）完成后，再将 `App.vue` 的 `GAME_LAUNCH_ENABLED` 开启。旧 `level-list` 与 `levelapi.pvzge.com` 不恢复。

创意花园的结构导航自动加入社区关卡入口。列表支持名称／作者／说明／路径搜索、作者／目录筛选和每页 24 关；同页 `?path=<关卡路径>` 显示详情。详情包含原文件中的名称、作者、说明、场景、可确定的波次／初始阳光／供给、植物和僵尸引用，以及原文件下载；游戏启动链接按上述发布开关隐藏。

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

## 初次网页先行发布顺序（历史）

本轮先部署并检查静态关卡源的 `catalog.json`，再上线官网浏览／下载；沿用现有服务器每半小时同步 fork 和 Pages 分发。含 GitHub 关卡协议的兼容客户端公开后，再将 `App.vue` 的 `GAME_LAUNCH_ENABLED` 改为 `true` 并发布官网。本轮不发布客户端，不更新游戏版本元数据或安装包。

游戏更新时应同步审阅 `../pvzge_github_levels/scripts/level-text.mjs` 中提取自 0.16.15 `MultiLanguage.LevelName` 的官方文本。

## 网页先行发布（2026-11-10）

- 按用户要求仅发布网页和静态摘要接口，客户端保留源码，未构建或发布安装包。
- 静态关卡源提交 `828d4b6`、标题键显示修正 `1fe2b36` 已推送并由既有 Pages 自动部署。正式域名与默认 Pages 域名的 `catalog.json` 均为 200、版本 1、789 关；最终 tree 为 `8f70ead62b89f81e19fb934b458e46fbc189aa56`。全部记录的路径／大小／SHA 与游戏目录逐项一致，三份实际关卡的字节长度和 Git blob SHA 抽检通过。
- 官网提交 `4f3b5b1c9b` 已推送，GitHub 构建／部署 `42838123629` 成功；既有 `pvzge-site-workers` 部署成功，版本 ID `3965d4f0-4a85-4b39-9146-b94ee4e72348`。
- 正式入口：`https://pvzge.com/creator-garden/community-level.html`，英文、西班牙文、俄文页面均返回 200。真实浏览器确认 789 关列表、搜索返回 7 个 Morticulturalist 关卡、详情内容和原文件 Blob 下载（`Morticulturalist7.json`，19,410 字节）正常；页面没有 `pvzge:` 启动链接。列表读取一次摘要、详情读取摘要及单关正文，不预先下载整个关卡库。
- 原服务器半小时定时器仍为 active，最近运行 success；未新增付费服务，未操作 R2 或更改客户端更新信息。

## 前端细节优化（2026-11-11）

- 按用户标注移除四语言详情页的“GitHub 原文件”链接。下载作为当前主要操作；客户端启动开关继续为 `false`。
- 统一按钮盒模型与 44px 最小高度，缩短标题、作者、说明和元数据之间的过大留白。实体图片与名称对齐，窄屏自动换列；沿用官网明暗主题颜色。
- 增加清晰的键盘焦点与按压反馈；尊重减少动态效果和增强对比度设置。
- 列表与详情采用同页路由切换，返回保留搜索、作者筛选和分页，且不重复拉取已有目录。查询参数在挂载后参与详情选择，避免直达详情时服务端与客户端首屏结构不一致。
- 验证：2 项目录／正文校验测试及 1,443 页生产构建通过；四语言真实公网目录和详情、320／390px 窄屏、855px 原问题视口、1440px 桌面、明暗主题、键盘焦点及减少动态效果检查通过，无横向溢出。原文件下载为 `Cherry Picked Opponents (Abandoned CCD).json`（32,711 字节）；返回保留 `SansGrinder` 筛选与第 2／3 页。直达详情无 hydration 警告，设计检测为空。
- 发布：官网提交 `9a7abad155` 已推送；GitHub 部署流水线 `43015055679` 成功，既有 Worker 版本 `bbdcc45c-2a7d-4944-a5d5-d3b94bfe6f1c`。正式域名四语言均为 200，原标注详情已无 GitHub 来源链接和游戏启动按钮，下载保持 32,711 字节，15 张实体图片正常，控制台无错误／警告。客户端未发布，未操作 R2 或新增服务。

## 1.5.10 客户端发布后开放启动（2026-11-11）

- 客户端四包、原 Release 附件、官网更新信息和 R2 清理全部验证通过后，于北京时间 22:10:29 开启源码开关；客户端发布核验完成时间为 22:09:52。游戏仍为 0.16.15，GP-Next 为 1.5.10。
- 网页提交 `ebc18dedc9cdf8448e4da4dcf8dc22466432be94`；主站 Cloudflare Pages `277b2286-1c33-4fe6-b7b5-d2a43598fdcf` 成功。官方 Worker Custom Domains／zone routes 核对表明备用 `pvzge-site-workers` 没有绑定主站，本次以实际主站部署和 `pvzge.com` 线上结果验收，没有将备用 Worker 成功当作主站发布完成。
- 中、英、西、俄实际详情页均显示对应翻译的启动按钮，链接路径和 SHA 与当前目录一致；390px／320px 无横向溢出。真实点击检查链接与提示时拦截了系统协议导航，没有用普通玩家配置启动游戏，因此不计作浏览器到原生客户端冷启动实测。
- 原文件下载仍为 `4_1.JSON`、5,866 字节，Git blob SHA-1 `b5f619a3f3049655d8928702433fcc330824e05a`，与客户端实际下载校验函数读取的原字节一致；没有修改关卡源或新增服务。
