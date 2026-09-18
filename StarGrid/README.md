# StarGrid · 星星方格

竖屏、简单干净的规则解谜 Web Demo。点击格子放星，再次点击取消，满足当前关卡的全部规则即可通关。

## 运行
下载并解压仓库，用现代浏览器打开 **WebDemo/index.html**。保留 style.css、game.js；无需依赖、构建、网络或安装。GitHub 文件页只显示源码，不直接运行游戏。

## 第二版内容
- 开始界面、5 个普通关卡、继续旅程与关卡选择。
- 每日简单/困难各一道，按北京时间更新。
- 简单与教学支持多解，困难验证唯一解；所有合法答案都被接受。
- 直接点按、实时规则、重新开始、兼容多解的提示、通关下一关。
- 设置页：音效、动画、区域字母；本地保存设置、棋盘和完成记录。
- 已移除模式按钮、X 标记与撤销。

当前 solver 限于 6×6 规则组合。每日题使用本机日期和确定性生成，可能重复，不提供云端同步或排行榜；Unity 正式版尚未创建。

## 文档与验证
[游戏设计](GAME_DESIGN.md) · [开发说明](CODEX_TASK.md) · [规则](Docs/RULE_SYSTEM.md) · [关卡](Docs/LEVEL_DESIGN.md) · [Unity 架构](Docs/UNITY_ARCHITECTURE.md) · [测试记录](Docs/TEST_REPORT.md)

有 Node.js 时运行 `node Tests/verify.cjs` 检查规则和每日生成；游戏本身不需要 Node.js。
