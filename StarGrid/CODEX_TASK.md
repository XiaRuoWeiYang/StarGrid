# Codex 接手说明 / v2

所有沟通使用中文。当前目标为网页玩法和设计迭代，暂不创建 Unity 正式项目。

## 已实现
四个页面：开始、每日挑战、游戏、设置。五个普通样板关，每日简单/困难各一题，通关下一关、浏览器本地保存。已按用户确认移除模式切换、X 排除与撤销；只直接点击放星/取消，固定线索除外。

## 运行与验证
直接用现代浏览器打开 WebDemo/index.html，保留同目录 style.css、game.js，无依赖、无需构建。可用任意静态服务打开整个 WebDemo。不同地址/端口或 file:// 的存档不共享。

可选：安装有 Node.js 时在项目根目录运行 `node Tests/verify.cjs`。测试不是运行时依赖，覆盖规则、多解、提示、每日日期和存档校验。实测记录见 Docs/TEST_REPORT.md。

## 继续开发约束
1. 胜利按启用规则，不匹配固定答案；第一至第四关多解，第五关及每日困难唯一解。
2. 提示必须尊重玩家可扩展的摆法，不可强行纠正到单一参考答案；保护 givens。
3. 普通关末关回首页，每日困难末关回每日页，无虚假下一关。
4. 每日以北京时间和版本种子固定，保留旧日正在玩的棋盘；新日期独立保存。
5. 有界生成器会兜底，允许重复，不宣称无限不重复或服务端公平竞赛。
6. 已有 solver 只覆盖 6×6 行列一星及区域/接触组合。未来扩展要明确范围、验证和推理步骤。
7. 后续 Unity 使用 BoardState、RuleSystem/IRule、LevelData、GridManager、GameManager、HintSystem、UIManager、SaveManager 分层。

设计入口 GAME_DESIGN.md；数据与难度 Docs/LEVEL_DESIGN.md；规则 Docs/RULE_SYSTEM.md；架构 Docs/UNITY_ARCHITECTURE.md。

## 发布
本轮只更新本地文件。此前 GitHub 写入连接曾返回 403，不能声称自动同步成功。手动更新时上传根目录文档、Docs、WebDemo、Tests 并保持路径一致；本地 work/ 不属于项目交付内容。
