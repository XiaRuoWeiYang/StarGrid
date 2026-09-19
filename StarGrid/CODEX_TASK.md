# Codex 接手说明 / v3

所有沟通使用中文。当前目标仍为 WebDemo 和设计验证，暂不创建 Unity
正式项目。

## 当前产品方向

-   Demo：先完成 20 关。
-   正式首发：目标 50 关。
-   长期：按 200、500+ 关持续扩展，不设代码关卡上限。
-   第一关：2×2 共 4 格教学关。
-   每日挑战：第一关极简单热身，第二关高难挑战。
-   不强制每关唯一解；满足全部启用规则即胜利。

## 当前代码事实

现有 WebDemo 已有 5 个 6×6 样板关、本地保存、提示、重新开始和基础
solver。当前 solver/关卡数据仍存在 6×6、1★等限制，因此 v3
规划尚未全部实现。

## 下一阶段优先级

P0：底层从固定 6×6 改为 size 驱动，支持 Demo 所需多尺寸。 P0：完成第 1
关 2×2 教学闭环。 P0：普通关扩展到 20 关，按长期难度曲线设计。
P0：保持按规则胜利，不允许固定答案逐格比较。
P0：导航、存档、关卡选择不得写死 20 关，从 LevelData 派生。
P1：每日挑战改为"热身 → 高难"连续两关。 P1：为
starQuota、givens、blockedCells、solutionType、tags
等长期字段预留数据契约。 P1：扩展测试覆盖多尺寸、20
关导航、多解胜利、刷新恢复和每日流程。

## 强制开发规范

开发前必须阅读 Docs/DEVELOPMENT_RULES.md。

Codex
每次修改代码、关卡、规则、UI、存档或测试，都必须同步更新受影响文档。没有文档同步的修改视为未完成。

每次任务结束至少： 1. 运行适用的自动测试。 2. 做必要浏览器验证。 3. 更新
Docs/TEST_REPORT.md。 4. 更新 Docs/CHANGELOG.md。 5. 更新 CODEX_TASK.md
当前状态。 6. 检查
GAME_DESIGN.md、LEVEL_DESIGN.md、RULE_SYSTEM.md、README.md
是否需要同步。

## 长期架构约束

-   不得写死 20/50/100/200/500 总关卡数。
-   LevelData 数据驱动。
-   SaveData 使用稳定 level id。
-   RuleSystem 与 UI 分离。
-   Solver 能力范围必须明确。
-   新规则必须先有数据契约、validator/solver 支持、测试和教学。
-   第 501 关原则上应主要通过新增数据实现，而不是修改核心流程。
-   关卡选择未来按章节/分页/地图组织，禁止一次堆 500 个按钮。
-   不强制唯一解。

## 设计入口

-   GAME_DESIGN.md
-   Docs/LEVEL_DESIGN.md
-   Docs/DEVELOPMENT_RULES.md
-   Docs/RULE_SYSTEM.md
-   Docs/UNITY_ARCHITECTURE.md
-   Docs/TEST_REPORT.md
-   Docs/CHANGELOG.md

## 当前下一步

从"多尺寸底层 + 第一关教学 +
20关数据结构"开始开发。每次代码提交必须同步文档。
