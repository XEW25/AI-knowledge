# Tan et al. - MetaRSI-v1: A Meta-Recursive Self-Improving System for Recursive Self-Improving Systems Themselves

## Metadata
- **Type**: source note
- **Format**: arXiv preprint (cs.LG), **v1 2026-09-06**；CC BY 4.0；副标题 "One Kernel, Two Axes, Three Operators, Every Domain"
- **Authors**: Zihan Tan\*, Leixin Sun\*†, … Guancheng Wan‡（30 位作者；\*共一，†项目负责，‡通讯）
- **Organization**: **CosmosMind-ai**（新机构，无过往可查）
- **arXiv**: [2609.06396](https://arxiv.org/abs/2609.06396)
- **Code**（2026-09-23 核实）: ⚠️ **只开源了被改进的对象，没有开源改进它的机器**。[CosmosMind-ai/RSI-Harness](https://github.com/CosmosMind-ai/RSI-Harness)（719 stars，MIT，2026-09-03 建）= **RSIH**：TypeScript，在 Pi coding agent 上加一层叫 **Genome** 的配置层，把系统提示 / 工具 / 技能 / MCP / 扩展 / 运行时策略 / 记忆 / 键位 / 主题打包成一个可版本化目录（"switching contexts is switching Genomes"）。仓内有 `config/genomes/harness-rsi/`（含 25 KB 的 `harness-rsi.ts` 扩展与 genome-authoring 技能）与 `paperlab` 等示例 genome。**Data-RSI / Model-RSI / RSI2 调度器 / MetaRSI2 元层 / 信号编译器均未发布**。HF `CosmosMind/RSI-Harness` 仅为同一批 genome 配置。HF papers 未索引
- **Raw tier**: URL-only（arXiv HTML + PDF 文本自读；PDF 未入库）
- **Verification status**: 框架定义 / 三算子 / 五条准入 / 两轴调度 / 元层 / 表 3 / 前沿模型六组 / 元改进器对照 / 五条铁律 / §6.5 物理世界 **自读核实**；代码仓 README + 目录结构已读，**RSIH 代码未逐行审计**；45 系统普查（表 6）与 22 领域阶梯（表 8）的逐条归类**未复核**
- **Related**: [[Harness design]], [[Harnesses and managed agent systems]], [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework]], [[Harness development base - JiuwenSymbiosis selection and build plan]], [[Embodied failure detection]], [[Alex Zhang - The Mismanaged Geniuses Hypothesis]], [[Anthropic - Scaling Managed Agents Decoupling the brain from the hands]], [[Robot data engine]], [[Agent orchestration]]
- **Tags**: #rsi #recursive-self-improvement #harness #meta-harness #self-evolving-agent #verification #sealed-evaluator #continual-learning #coding-agent #framework

## Summary

**两件事。** 一是实证判断：调查 45 个 RSI 系统，**69% 的改进环闭合在机器可免费验证的目标上**（测试套件 / 精确匹配 / 数值目标 / 选择题）；把 22 个领域按**验证阶梯**（1 可执行测试与精确匹配 → 2 仿真 → 3 复现已报告结果 → 4 带仪器的协议执行 → 5 无真值的专家评分）排位，**环闭合数量与验证等级相关 −0.75，控制验证等级后模型能力不再显著** ⇒ 限制 RSI 扩张的是**验证格式，不是学科**。八月普查翻倍到 55 环，53 个仍在 1–3 级，八个从未有环的领域依旧没有。

二是框架 **MetaRSI-v1**：被改进的对象不是 checkpoint 而是 **⟨数据, 模型, harness⟩ 三元组**，三个算子各写一面，共用一个**七阶段环内核**（只有 Diagnose / Propose 由模型驱动，其余五段确定性代码；评估器 / 发布门 / 账本在所有写面之外）。**信号新鲜度**给出可组合性：六种两两排列只有五种合法。上面两层：RSI2 Agent 在**横向（算子顺序）/ 纵向（重写算子提议策略）**两轴调度；MetaRSI2 Agent 每个改进周期后修改调度器指令面。

> **本库定位一句话**：给 [[Harness design]] 的 "meta-harness" 与 "load-bearing" 两个概念补上**形式化骨架**——harness 是一个**可写面**，每个添加都要付上下文税，被权重吸收后可被**退休**；给云边协同页"自演进的闸门是验证"补上**跨领域证据**。⚠️ 实验全在它自己批评的"机器可验证切片"（代码 + 封闭式 QA）里；核心代码未放。

## 框架

### 被改进的对象与不变量

- 目标系统 = 数据状态 D（语料 / 合成记录 / 课程）+ 模型状态 M（参数 / adapter / 有界架构选择 / 训练配置）+ harness 状态 H（系统提示、持久记忆、内置工具、技能库、MCP 挂载）。
- **学习信号**是算子唯一可读的环境输入：确定性编译器把 rollout 证据压成三层类型化对象（结果层 / 归因层 / **模型归因的机制层**——只有最后一层是模型自己的假设）。来源不限：验证器裁决、自身轨迹、外部知识、框架自身决策记录；**入选条件是"在环里的位置"而非模态**。
- **信号会过期**：任何改变系统行为的一步都让此前编译的所有信号作废。
- **受保护面**：密封评估器、留出任务集、发布规则、资源账本——**任何层都不可写**。目标函数是"部署后的改进生产率"，按成本、对既有能力的回退、工作信号与密封测量的偏差惩罚；**评的是发布出的后继，不是最好的候选**。

### 环内核：模型提议、代码裁决

Observe → **Diagnose → Propose**（模型）→ Validate → Execute → **Select → Export**（受保护代码）。算子的准入条件只有一条：**放弃裁决权**。每个失败 rollout 编译成一个**失败签名**：评估器报告什么、agent 做了什么（均有 trace 与验证器报告为据）、模型归因的**机制**（唯一的假设字段）。三算子共用同一签名词表，所以"缺一个程序性习惯"路由到 harness、"缺知识"路由到数据与权重，路由决策在一个所有算子都能读的对象上做。

### 三个算子

| | **Data-RSI ♣ 放大器** | **Harness-RSI ♠ 脚手架** | **Model-RSI ♥ 内化** |
|---|---|---|---|
| 写面 | D：合成指令与配额、能力靶与难度分布、逐记录验证标准、课程与混合比 | H：**五槽**——系统提示、记忆（类型化条目 + 检索策略）、内置工具、技能库、MCP 挂载；上下文 / 工具 / 草稿策略 | M：可训参数集与模块架构、adapter 位置与层参与、适配族与秩、优化器与 batch、序列长、checkpoint |
| 做什么 | 从执行轨迹合成**验证过的**训练记录，并**标出能力边界**（四维学习签名：知识缺、有知识但推理错、缺验证步、易受干扰）；产物喂另两个 | 对五槽打**类型化补丁**（HarnessPatch = 修复假设 + 逐槽操作 + 预期效果 + 风险声明）；按失败签名分片搜索，冻结基线回放，去重 + 硬复杂度上限合并 | 从**固定基座**在累积数据集上 LoRA（不续上一轮 adapter，保证归因）；损失掩码只计 assistant 位置 |
| 成本形态 | 模型调用 | 模型调用 + 回放；**零训练成本，但每个添加在每次推理都付上下文税** | GPU 小时；**一次付清，推理零开销，跨 scaffold 持久** |
| 发布 | 对抗生成：Operator 写、**Anchor 盲解**（同一模型、输入隔离），一致才收；再过契约 + 语义双 fail-closed 验证 | **严格优于历史最优**才发布，否则保留在位者 | 同一严格改进纪律 |

**Data-RSI 的自限**：合成靶在自身 rollout **展现过**的能力上，证的是"盲解自洽"而非"对模型自己不知道的知识正确"。

### 五条合法转移（信号新鲜度）

**改变行为的步**（H、M）让旧信号作废；D 不改行为。Model-RSI 消费的是 Dataset 工件，只有"D 之后无改变行为的步"才新鲜 ⇒ 六种排列里**唯一非法的是 H→M**（harness 改了系统能力却不产数据，最新数据集必然描述已不存在的系统），同理 M→M 非法。五条合法边各配一个**类型化 Transition Agent 适配器**：D→H 经验蒸馏成 HarnessPatch；D→M 数据物化 + 损失掩码；H→D / M→D 信号重编译；**M→H 冗余对账**——读训练报告，**提议删除已被新权重吸收的 scaffold 条目**，回放后精度不掉才删。

### 两轴调度与元层

- **RSI2 Agent**：横向 = 抽一个受限于合法集的类型化改进程序（每步带算子、目的、边、证据、预算份额）；纵向 = 对某算子发"更新或跳过"指令，由专属 Sub-Agent 重写该算子的**提议策略**，四项检查通过才装（决定性的一条：**实际 diff 必须等于声明的修改**）。每个算子字段分三类：可变面（诊断指令、提议优先级、适用性自述）/ 行动面（= 写面）/ 受保护面（评估器、沙箱、发布门、工件 schema、证据链、身份与 IO 类型）。
- **MetaRSI2 Agent**：每个改进周期结束后读整条 trace（哪些序列与纵向指令的收益过了发布门、哪些候选生成了没被选、预算怎么花），修改 RSI2 Agent 的路由偏好、预算与停止策略、轴选择、适配器附带指导。**它自身参数固定，层级到此终止。**
- **四个角色而非四个模型**：任一角色可由人占。三算子高频机械（人会成瓶颈），四 agent 每周期决策少且正需判断 ⇒ 新领域首次部署应落在"人握调度器、算子自动跑"的中间态。

## 结果

**设置**：自托管 **Qwen3.5-35B-A3B**（35B 总 / 3B 激活）三算子全开；六个前沿模型只能经 API ⇒ 只走 D + H 路线。**闭环自演化**：所有模型驱动角色（三算子的诊断提议、对抗生成的 Operator 与 Anchor、两级调度 agent）都由目标模型自己扮演，**无更强教师**，唯一外部信号是验证器。所有条件同预算（token / GPU 小时 / 墙钟 / 调用 / 候选 / 验证查询），pass@1，超预算算失败，**五个外层种子均值**。基准：Terminal-Bench 2.1、SWE-bench Pro 公开测试集（容器化 + 隐藏验证器）、**GPQA-D-hard100（作者自选难题子集）**、合并 AIME。

### 表 3：密封集成绩

| | Terminal-Bench 2.1 | SWE-bench Pro | GPQA-D-hard100 | AIME |
|---|---|---|---|---|
| 冻结 | 23.6 | 10.3 | 71.2 | 55.0 |
| Data-RSI 单独 | 27.4 | 12.4 | 73.8 | 57.7 |
| Harness-RSI 单独 | 29.4 | 14.9 | 78.8 | 63.3 |
| Model-RSI 单独 | 27.0 | 14.0 | 75.4 | 59.3 |
| 人工固定顺序 | 30.3 | 15.3 | 79.4 | 64.3 |
| 随机合法组合 | 28.1 | 13.6 | 75.8 | 60.7 |
| 静态路由器 | 30.8 | 14.9 | 79.6 | 64.0 |
| **MetaRSI-v1** | **31.9** | **19.5** | **83.8** | **68.3** |

平均比冻结 **+10.9**，比最强单算子（Harness-RSI）**+4.3**，比两个组合基线（同三算子、同证据、齐平 +7.3）**+3.6** ⇒ 作者归因："差距来自**谁决定顺序**"。可执行套件 +8.8、封闭式套件 +13.0。算子排名跨领域不稳定：Harness-RSI 在封闭式领先，可执行套件上三者接近。

### 前沿模型只走 Harness 路线（Terminal-Bench 2.1，各自当自己的提议者与裁判）

六个全部为正，**+5.6（GLM-5.2）到 +9.2（Gemini 3.1 Pro）**，均值 **+7.3**；Claude Opus 5 84.5 → 92.1、Kimi K3 84.0 → 91.2、GPT-5.6 Sol 83.4 → 90.1、DeepSeek V4 Pro 83.6 → 91.2。与 35B 目标在同基准的涨幅相当 ⇒ 作者称 harness 路线**不是小模型专属**。⚠️ 基线是"在作者自己的 RSIH 上"的成绩，涨幅也是在这个 harness 上的涨幅。

### 改进器本身变好了（§5.4）

第一周期释出后继，第二周期分叉：原改进器 vs 元层重写过的改进器，同预算同密封集。**元更新版多涨 7.2 对 4.9**，优势 2.3，且随领域可得增益放大。

## 讨论中值得记的判断

- **放大器不是源（§6.2）**：三算子只重新分配模型已有能力；为从未展现过的能力合成记录的，正是缺这能力的模型。任何真增益来自环外信息（验证器裁决、检索文档、语料、仪器读数、专家笔记），**人类监督在此账本里只是一个以成本区分的信息源**；Data-RSI 的边界声明把外部监督分配到真正的缺口，且**报出加了多少**。
- **两条路线（§6.3）**：harness 路线只需 API、成本按推理递增、可作文档迁移、坏于上下文膨胀与规则冲突；模型路线需开源权重 + 训练器、成本一次付清、只能作大工件迁移、坏于遗忘与归因丢失；**组合 = genome → weights → 修剪后的 genome**，修剪限住第一种退化。
- **五条铁律**（每条附"何种观察可反驳"）：①**验证而非能力设定前沿**（推论：要扩 RSI，先造验证器）；②**自我知识会过期，重描述是速率上限**（准入原则是其局部形式）；③**能力无关基底，成本有关**——同一行为在 scaffold 里每次推理付费、在权重里一次付清，成熟的环把大部分精力花在**把能力搬到便宜的地方**，只有双基底的环能"退休"被吸收的那份；④**信任由不可写之物度量**——从环内看，"能力更好"与"成功定义更宽"是同一个数，这比 Goodhart 更强：**内部不可观测**，唯一补救是把评估器 / 任务集 / 发布规则 / 账本放在所有写面之外；⑤**没有环创造能力，每次增益都是进口的**——一个 RSI 结果应报两个数：放大了多少、进口了多少。

### §6.5 环触及物理世界时（对本库最直接的一节）

- **可沿用**：学习信号、预算账本、受保护分离对验证器是测试还是光谱仪无差别；账本加仪器时 / 耗材 / 样品行。Data-RSI 的边界声明**升级为实验分配器**：实验室的约束是仪器时间，Data-RSI 无法合成的残余就是"哪些问题真需要上仪器"的有界声明。
- **断在两处**：**可逆性**——框架假设候选可免费丢弃，物理动作无沙箱，消耗样品或损坏机械臂无法回滚 ⇒ 准入原则需第二个前提"动作是否可恢复"，调度器要把不可恢复步当**承诺**而非候选；**环延迟**——便宜算子与昂贵算子的成本比拉大到"昂贵的那个要几天并耗材料"时，调度器的工作从排序变成"要不要动"。
- **三项新增**：**分级保真**（仿真 → 台架代理 → 仪器，同一算子集，级间提升按候选提升同样设门，不可逆的一级最后到达）；**不可逆感知的动作空间**（算子声明写面时同时声明可否撤销，Validate 拒绝无显式授权的不可恢复提议）；**人类授权作为受保护面**（签字点在所有层的写面之外，理由同密封评估器）。
- **更深的问题：环境而非行动者**——四维签名都预设任务良定义、失败可归因到行动者对已知环境的能力；开放物理环境会出现**环境模型本身错了**的失败，需要**第四个算子，其写面是环境模型**（产物 = 修订后的动力学 + 钉住它们的回归测试）。

## 在本库框架中的位置

### 对 [[Harness design]]：meta-harness 与 load-bearing 的形式化

本页说"harness 假设会过期，系统不应与今日 harness 紧耦合"，Open question 问"怎么知道某部件还是不是 load-bearing"。MetaRSI 给了机制：**Harness-RSI 加进的每个部件在每次推理付上下文税**（Law 3）；**Model-RSI 内化后，M→H 冗余对账适配器提议删除已被权重吸收的条目，回放不掉精度才删**。"退休"这个操作就是 load-bearing 判定的机制化，且**只有双基底（scaffold + weights）的环能表达它**。同时它给"harness 是什么"一个可枚举定义：**五槽 genome**，补丁是对命名字段的类型化操作而非"任意代码"——这正是可确定性验证与自动调度的前提。

### 对云边协同页：演进通道的闸门与去人边界

该页判断"T2 可控自演进的自动化程度是失败检测层信号质量的因变量"、"coding agent 属于演进通道、放进运行时通道就出不了仿真"。MetaRSI 的 Law 1 / Law 2 是同一判断的通用形式（验证设定前沿；重描述是速率上限），Law 4 是该页"云④下发前车队级验证门"要放在写面之外的理由。**§6.5 三项新增**（分级保真 / 不可逆感知 / 人类授权受保护）与该页"验证门"、[[Embodied failure detection]] "不可逆失败只能事前拦截"、[[Real-robot evaluation]] "复位成本是第二维"逐条同构。

### 对团队四特性④持续学习（[[Harness development base - JiuwenSymbiosis selection and build plan]]）

该页写 `trace_feedback/` "缺 target_skill 解析、自动应用 + 回滚、gate 指标，全部等①检测"。MetaRSI 提供了一份可对照的规范：**失败签名**（评估器报告 / agent 行为 / 模型归因机制三层，只有第三层是假设）就是 target_skill 解析的类型；**七阶段内核**里 Validate / Select / Export 是"自动应用 + 回滚"的骨架；**密封评估器 + 严格优于历史最优才发布**是 gate 指标；**"实际 diff 必须等于声明的修改"**是回滚可审计的前提。⚠️ 但 MetaRSI 的环是离线的、候选免费，与该页"运行时通道 vs 演进通道"的划分一致——它只该住在演进通道。

### 对 [[Alex Zhang - The Mismanaged Geniuses Hypothesis|MGH]] 与 Harness VLA / Pigey / Show-Harness

MGH 说"能力已在模型里，脆弱脚手架浪费了它"；前沿模型只改 harness 就 +7.3 是这个假设在代码 agent 上的又一证据，与本库 harness 簇三篇具身证据同向。但 Law 5 给了**上界**：harness 路线只能放大已有能力，不能进口新知识。

## Why it matters（对本库）

1. **harness 第一次有了可枚举的形式定义**（五槽 genome + 类型化补丁）和**退休机制**（M→H 冗余对账），把本库 load-bearing 原则从判断变成算法。
2. **"验证是闸门"有了跨 45 系统 / 22 领域的量化证据**（ρ = −0.75，控制能力后仍显著），本库此前只在具身侧靠三点外证。
3. **信号新鲜度 / 准入原则**是一个可迁移的组合规则：任何"多个改进算子写同一系统"的设计（含团队四特性之间）都要回答"这一步消费的证据描述的是不是当前系统"。
4. **§6.5 给出了把自演进环搬到物理世界的差分清单**：可逆性第二准入、分级保真、不可逆感知写面、人类授权受保护、环境模型第四算子——每条都对应本库已有页面的一个空位。
5. **五条铁律**是一组可反驳的命题，适合当本库自演进相关判断的对照表。

## What feels strong
- 问题陈述有数据：不是"RSI 只做代码"的印象，而是 45 系统按闭环对象归类 + 22 领域按验证阶梯排位 + 偏相关。
- 授权边界的设计一致：模型只提议，代码裁决，评估器不可写，从算子到元层同一条规则。
- 组合基线设计得当：人工固定顺序、随机合法组合、静态路由器都用同三算子同证据，把"调度"隔离出来。
- 前沿模型闭环自改进（自己当提议者与裁判）排除了"更强教师"解释。
- 讨论诚实：放大器不是源、两个数、物理世界会断在哪。

## What feels limited
- **实验全在自己批评的切片里**：代码 + 封闭式 QA；验证阶梯 4–5 级的领域一个都没跑，§6.5 是论证不是实验。
- **完整三算子环只在一个 35B MoE 上跑过**；前沿模型只有 D + H。
- **核心代码未开源**：RSIH 是被改进的对象；Data-RSI / Model-RSI / 调度器 / 元层 / 信号编译器都没放，"719 stars" 属于配置层工具。
- GPQA-D-hard100 自选子集；SWE-bench Pro 作者自陈对 scaffold 敏感到无法跨模型比较；五种子均值但**正文无区间**。
- 前沿模型基线与涨幅都相对于作者自家 harness。
- 元层"7.2 vs 4.9"只有两周期一次分叉。
- 30 位作者的新机构，"五条铁律"修辞强；Law 1 的相关基于作者自行归类的普查。
- 45 系统 / 22 领域的逐条归类本笔记未复核。

## Open questions（接本库）
- 团队 `trace_feedback/` 若照七阶段内核重构，**失败签名的第三层（模型归因机制）在具身场景由谁产**？具身失败检测页的"裁决段"给的是世界侧证据，机制归因仍是空的。
- **可逆性作为第二准入条件**在团队 rails 里怎么落：是 SafetyRail 的前置谓词，还是调度层的"承诺 vs 候选"标记？
- Harness-RSI 的"上下文税"在具身 harness 里对应什么——提示词长度？规则数？每步 VLM 调用？Show-Harness 的插件消融（全开反而掉成功率）像是同一现象。
- 第四个算子（写环境模型）与本库 [[World-Action Models]] 的关系：WAM 的世界模型是不是这个算子的实现？
- RSIH 的 Genome 与 JiuwenSymbiosis 的 rails 配置、Show-Harness 的 plugins 目录是同一类东西（可版本化 harness 配置）——值得做一次三方对照。

## Related
- [[Harness design]] — meta-harness / load-bearing 的形式化
- [[Harnesses and managed agent systems]] — 主题页
- [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework]] — 演进通道闸门、验证门
- [[Harness development base - JiuwenSymbiosis selection and build plan]] — ④持续学习的对照规范
- [[Embodied failure detection]] — 不可逆失败事前拦截 ↔ 可逆性准入
- [[Real-robot evaluation]] — 复位成本 ↔ 候选不免费
- [[Alex Zhang - The Mismanaged Geniuses Hypothesis]] — harness 路线 +7.3 的同向证据；Law 5 给上界
- [[Anthropic - Scaling Managed Agents Decoupling the brain from the hands]] — session / harness / sandbox 分层的对照
- [[Robot data engine]] — Data-RSI 边界声明 ↔ 昂贵金标准分配
- [[Agent orchestration]] · [[Task decomposition]]

## tags
#rsi #recursive-self-improvement #harness #meta-harness #genome #load-bearing #verification-ladder #sealed-evaluator #signal-freshness #self-evolving-agent #continual-learning #coding-agent #terminal-bench #cosmosmind #framework
