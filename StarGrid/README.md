# StarGrid · 星星方格

竖屏、简单干净的规则解谜游戏。当前使用 WebDemo 验证玩法。

## 产品规划

-   Demo：20 关。
-   正式首发：目标 50 关。
-   长期：支持 200、500+ 关并持续扩展。
-   不要求所有关卡唯一解。
-   第一关规划为 2×2 共 4 格教学关。
-   每日挑战规划为"简单热身 + 高难第二关"。

当前代码仍需从旧版固定 6×6 样板关向 v3 多尺寸/长期数据架构升级。

## 开发原则

LevelData、导航、存档、RuleSystem 和 solver
必须允许持续增加关卡和规则，禁止写死 20/50/100/200/500 关。

Codex
每次修改代码、数据、规则或玩法时必须同步更新受影响文档和测试。完整规范见
Docs/DEVELOPMENT_RULES.md。

## 文档

-   GAME_DESIGN.md：长期游戏设计
-   CODEX_TASK.md：当前 Codex 任务
-   Docs/LEVEL_DESIGN.md：关卡与长期内容规划
-   Docs/DEVELOPMENT_RULES.md：开发规范
-   Docs/RULE_SYSTEM.md：规则与 solver
-   Docs/UNITY_ARCHITECTURE.md：未来 Unity 架构
-   Docs/TEST_REPORT.md：验证记录
-   Docs/CHANGELOG.md：重要变更
