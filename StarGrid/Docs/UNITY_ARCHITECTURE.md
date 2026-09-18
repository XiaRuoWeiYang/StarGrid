# Unity 后续架构（设计，尚未创建项目）

采用纯 C# 领域层、数据层、表现层分离。场景对象不保存唯一权威棋盘状态；关卡由数据驱动。

| 模块 | 职责 | 依赖 |
| --- | --- | --- |
| BoardState | 格子状态、合法索引、快照、恢复 | 基础数据类型 |
| LevelData | 尺寸、区域、规则配置、教学信息；JSON/ScriptableObject | 序列化数据 |
| IRule / RuleSystem | 无副作用规则检查、汇总冲突与胜利 | BoardState、LevelData |
| GridManager | 生成/复用格子视图、上报点击、绘制星和 X | LevelData、状态快照 |
| GameManager | 关卡生命周期、输入命令、撤销栈、胜利事件 | 领域服务 |
| HintSystem | 请求 solver 推理、生成单步建议或修正命令 | 状态副本、LevelData、solver |
| UIManager | 模式、状态条、提示文本、完成弹窗 | GameManager 事件 |
| SaveManager | 存取关卡进度、棋盘、设置及版本迁移 | 可序列化存档 DTO |

## 调用顺序
加载 LevelData 并校验 → GameManager 创建 BoardState → GridManager 建网格 → 玩家点击上报格子与模式 → GameManager 保存快照并写入状态 → RuleSystem.Evaluate → 发布 BoardChanged/RulesChanged → GridManager、UIManager 刷新 → GameManager 只在未完成到完成的转换上发布 LevelCompleted。

撤销通过同一管线重新验证，不直接回滚 UI。输入模式与棋盘状态分开。提示返回可撤销命令，不绕开 GameManager。重复打开/关闭完成弹窗不能重复奖励。

## 数据与表现
建议目录：Scripts/Domain、Rules、Application、Presentation、Persistence；Resources 或 Addressables 中放关卡资产。先用 UGUI 和等比例布局完成 6×6 方格，区域配色作为主题配置；逻辑层不引用 UnityEngine，格子视图只缓存索引。关卡导入器将 JSON 转为 LevelData，业务代码不可散落关卡答案与尺寸常量。

## 存档
SaveManager 规划使用 persistentDataPath 下的带版本 JSON：levelId、cells、completedLevelIds、settings、schemaVersion。采用临时文件写入后替换，读失败时提示并保留损坏备份。恢复时重新跑规则，不能信任存档的 completed 标志。Web Demo 当前不实现此模块。

## 验证与迁移顺序
先移植 BoardState 与 IRule 的 EditMode 测试，覆盖全部冲突边界；再接入输入与 UI，做 PlayMode 撤销/重玩/弹窗验证；最后接存档与通用 solver。正式版本需真机验证安全区域、不同宽高比、后台恢复和触控。不预先选定 Unity 版本、渲染管线或第三方包，本次无 Unity 依赖。
