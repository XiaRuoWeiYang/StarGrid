# 后续 Unity 架构 / v2

仅设计，尚未创建 Unity 项目。纯 C# 领域层、数据层、表现层分离，关卡数据驱动。

| 模块 | 职责 |
| --- | --- |
| BoardState | 空/星状态、固定线索、操作计数、状态快照；本版没有 X 或撤销栈 |
| LevelData | 尺寸、区域、rules、givens、普通/每日类型、日期与关卡标识；JSON/ScriptableObject |
| IRule / RuleSystem | 无副作用规则检查、冲突集合、完成条件，按规则 ID 注册 |
| GridManager | 生成格子，渲染星/区域/固定线索，向应用层上报点击 |
| GameManager | 页面和关卡生命周期、输入处理、保存、结算与下一关路由 |
| HintSystem | 先延续所有已放星的可行解，无扩展解时才提出修正；保护固定线索 |
| UIManager | 开始、每日、游戏、设置页、规则条、重置确认和结算 |
| SaveManager | 版本化关卡进度、当前棋盘、完成记录及设置，损坏恢复 |

## 事件流程
校验并读取 LevelData → 创建/恢复 BoardState → 加入 givens → RuleSystem 计算 → GridManager 绘制。点击 → GameManager 修改状态 → RuleSystem → BoardChanged/RulesChanged → UI 更新 → 首次满足时 LevelCompleted → SaveManager 保存。

下一关：普通 n→n+1，末关回首页；每日简单→同日困难，困难回每日页。跨日不替换玩家正在玩的关卡，旧日简单完成后回每日页。不能靠固定答案匹配触发结算。

## 建议目录
Scripts/Domain、Rules、Application、Presentation、Persistence。纯逻辑不引用 UnityEngine。GridManager 持有视图而非权威状态；UI 不直接判断胜负。规则与关卡配置不散落在场景对象里。先用 UGUI 实现竖屏布局，真机验证安全区域和不同宽高比。

## 存档与每日题
Unity SaveManager 规划 persistentDataPath 下版本 JSON，临时写后替换，损坏备份与提示。恢复棋盘重新计算规则，完成记录和正在玩的棋盘分开。网页已用 localStorage 实现基本保存；不是 Unity SaveManager 已完成。

每日生成应从 UI 分离到 DailyLevelProvider，采用版本化种子/题库。正式版可从服务端拿日期和题目；离线日期策略、跨日行为与去重需有测试。

## 迁移验证
先迁移 BoardState、IRule、solver 并做 EditMode 测试；再接四个页面、点击、固定星和下一关，做 PlayMode；最后接持久化与音效。覆盖多解接受、提示不误删合法路径、设置往返、末关、跨日及损坏恢复。当前不指定 Unity 版本或第三方依赖。
