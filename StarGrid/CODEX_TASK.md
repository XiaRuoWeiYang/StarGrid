# Codex 接手说明

## 当前交付
设计文档 + 原生 HTML/CSS/JS 单关 Demo。没有 Unity 项目，当前阶段不要创建 Unity 正式版。所有用户沟通使用中文。

## 本地运行
直接用现代浏览器打开 `WebDemo/index.html`，无需安装、构建、联网或启动服务。CSS 和 JS 使用相对路径。刷新重新开始。手机可复制整个 WebDemo 文件夹到支持本地网页的环境，或在同一局域网自行提供静态服务后访问；本次桌面预览服务只绑定本机，不向局域网开放。

## 文件
- GAME_DESIGN.md：游戏定位、体验与范围。
- Docs/RULE_SYSTEM.md：状态、判定与提示契约。
- Docs/LEVEL_DESIGN.md：完整关卡数据、答案与 solver 计划。
- Docs/UNITY_ARCHITECTURE.md：后续 Unity 分层。
- Docs/TEST_REPORT.md：本次检查与限制。
- WebDemo/index.html、style.css、game.js：唯一运行时文件，零依赖。

## 后续要求
保持低美术量与手机优先；产品模式确定为“逐步闯关 + 后续每日挑战”。先确认这一关，制作 5 个递进样板关，再扩展首批 20 关；不以两关难度骤升作为主体。当前 Demo 仍为单关展示，勿将规划描述为已实现功能。新增规则应提取注册器并保持纯计算。禁止仅靠预设答案判断胜利。通用 solver 完成后，区域谜题发布必须验证唯一解并记录难度依据；教学多解关接受所有合法解。Unity 必须采用 BoardState、RuleSystem/IRule、LevelData、GridManager、GameManager、HintSystem、UIManager、SaveManager 分层。

## 手工回归步骤
放星后再点应清除；X 模式亦应切换；制造同一行/列/区域及斜接触应标红；撤销、重置、重置后撤销应恢复预期状态；先放错误星再请求提示应清错；对唯一解位置标 X 后提示可补星；六颗正确星应弹窗，保留其他 X 也可通关；关闭、重玩均可继续；键盘可走完整流程。浏览器缩窄时棋盘不得横向溢出。
