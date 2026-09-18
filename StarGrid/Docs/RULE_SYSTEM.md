# 规则系统规格

## 状态与坐标
棋盘是长度 size² 的数组，0=空、1=星、2=X。索引为 row*size+column，内部坐标从 0 开始，界面从 1 开始。区域映射与棋盘等长；当前区域 ID 为 0–5。X 既不增加星数，也不阻止通关。

| 规则 ID | 计算 | 冲突 | 完成 |
| --- | --- | --- | --- |
| ONE_STAR_PER_ROW | 每行星数 | 任意行大于 1 | 每行等于 1 |
| ONE_STAR_PER_COLUMN | 每列星数 | 任意列大于 1 | 每列等于 1 |
| ONE_STAR_PER_REGION | 每区域星数 | 任意区域大于 1 | 每区域等于 1 |
| NO_TOUCH | 两星行距、列距 | 两个距离均 ≤1 | 没有接触对 |

同一颗星不与自身比较，每对星只统计一次。红框集合是所有冲突参与格的并集。空行属于“未完成”，不属于“冲突”；空棋盘的不接触规则成立。全部四条满足并恰有六星才能胜利。

## 纯逻辑边界
网页 evaluate(cells, level) 返回 stars、statuses、conflicts、touching、won，不操作 DOM 或修改输入。当前 Web Demo 固定四条规则；rules 字段记录配置，尚不是可动态增删规则的注册器。Unity 需实现注册器并拒绝未知规则 ID。

未来 IRule.Evaluate(BoardState, LevelData) 返回 RuleResult：ruleId、isSatisfied、hasConflict、conflictCells、progress、messageKey。RuleSystem 聚合全部启用的 IRule，不让 UI 直接判断胜负。

## 命令与提示
每次写棋盘前保存完整快照，撤销按后进先出还原；模式切换不进历史。提示使用已经独立验证的单关答案，明确告知位置，并非通用推理提示。存在错误星时优先清错，避免自动填入后造成新的冲突。正式版 HintSystem 应基于 solver 的确定性推理输出“依据—排除—建议”，不可在多解棋盘里把另一条合法路径说成错误。

## 后续测试重点
覆盖零星、同一行/列/区域重复、八方向接触、跨行边缘不误判、带 X 的合法解、多规则共同冲突、非法数据与 solver 的 0/1/≥2 解。不能仅比较答案数组判断胜利。
