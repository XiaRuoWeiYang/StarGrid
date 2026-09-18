# StarGrid · 星星方格

竖屏、低美术量的规则解谜游戏原型：在 6×6 彩色棋盘上放置星星，满足每行、每列、每个颜色区域各一星，且星星不能相邻或斜向接触。

## 试玩
下载本仓库并解压，使用现代浏览器打开 **WebDemo/index.html**。无需安装依赖、构建或联网；请保留同目录的 style.css 和 game.js。GitHub 文件页面仅展示源码，不会直接运行游戏。

当前实现一个可玩关卡，包含放星/取消、X 排除、撤销、可撤销重置、提示、实时规则与冲突状态、通关弹窗和重玩。手机优先，桌面居中呈现。刷新会重新开始，尚无持久化存档。

## 设计方向
逐步闯关为主体，后续加入每日挑战。先做 5 个难度递进样板关，再扩展首批 20 关。当前仅完成单关 Web Demo；Unity 正式项目、通用 solver、多关卡与每日挑战均未实现。本关已离线验证为唯一解。

## 文档
- [游戏设计](GAME_DESIGN.md)
- [开发接手说明](CODEX_TASK.md)
- [规则系统](Docs/RULE_SYSTEM.md)
- [关卡设计与 solver 计划](Docs/LEVEL_DESIGN.md)
- [后续 Unity 架构](Docs/UNITY_ARCHITECTURE.md)
- [验证记录](Docs/TEST_REPORT.md)

运行时仅包含原生 HTML/CSS/JavaScript，不依赖外部字体、图片或第三方库。
