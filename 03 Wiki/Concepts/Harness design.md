# Harness design

Harness design is the design of the surrounding system that structures how an AI model or agent operates over time.

## Core idea
A harness is not just a wrapper. It is the operational scaffold that determines how work is decomposed, how context is managed, how tools are invoked, how artifacts are handed off, how evaluation is performed, and how multiple agents or sessions are coordinated.

## Why it matters
For long-running and complex tasks, raw model quality is often not enough. A strong harness can materially change system behavior by compensating for specific model weaknesses such as context degradation, weak self-evaluation, poor long-horizon coherence, or insufficient decomposition.

## Typical harness components
Common harness components include:
- planners or initializers
- generators / executors
- evaluators / critics / QA agents
- context reset or compaction strategies
- structured artifacts or handoff files
- contracts or intermediate specifications
- tool and environment interfaces
- retry / iteration loops

## Load-bearing harnesses
A useful way to think about harness design is that each component encodes an assumption about what the base model cannot yet do reliably on its own. As models improve, some harness components may stop being load-bearing and should be simplified or removed.

## From harness design to meta-harness design
A further extension of this idea is that if harness assumptions are perishable, then the surrounding system should not be too tightly coupled to today’s harness. This points toward a higher-level design problem: building stable interfaces around future harnesses.

One useful framing is to separate:
- the **session** as the durable event/state layer
- the **harness** as the orchestration or reasoning loop
- the **sandbox / tools** as the execution layer

This kind of abstraction allows harness implementations to evolve while keeping the broader system architecture stable. In that sense, harness design can grow into a broader concern with platform abstractions or meta-harness design.

> **形式化（2026-09 加，[[Tan et al. - MetaRSI-v1 A Meta-Recursive Self-Improving System for Recursive Self-Improving Systems Themselves|MetaRSI-v1]]）**：harness 可枚举为**五槽 genome**（系统提示 / 记忆 / 内置工具 / 技能 / MCP 挂载），改动是对命名字段的**类型化补丁**而非任意代码；每个添加在**每次推理付上下文税**，被权重吸收后由 M→H 冗余对账适配器**提议退休**（回放不掉精度才删）。“load-bearing” 由此从判断变成算法：**只有 scaffold + weights 双基底的环能表达“退休”**，单基底环成本单调累积、止于成本而非能力（其 Law 3）。前沿模型只改 harness 自改进 Terminal-Bench +7.3，但其 Law 5 给上界：harness 路线只放大已有能力，不进口新知识。⚠️ 实证全在代码 / 封闭 QA，核心代码未放。
## Relevance to long-horizon agent systems
Harness design is especially important for:
- long-running coding agents
- multi-agent systems
- autonomous research and planning loops
- tasks where quality must be externally evaluated rather than self-assessed

## Relation to this vault
Harness design is closely connected to:
- [[Agent orchestration]]
- [[Task decomposition]]
- [[Claude Code]]
- [[OpenClaw]]
- [[Prithvi Rajasekaran - Harness design for long-running application development]]
- [[Anthropic - Scaling Managed Agents Decoupling the brain from the hands]]

It is a useful concept for understanding when capability gains come from better scaffolding rather than only from better base models, and when platform abstractions should be designed to outlast any single harness implementation.

> **溯源（本页的证据基础）**：本页综合自**两篇 Anthropic 工程博客**，同日（2026-04-12）ingest——核心论点 / 部件清单 / **load-bearing** 来自 [[Prithvi Rajasekaran - Harness design for long-running application development]]；**meta-harness + session/harness/sandbox 三层**来自 [[Anthropic - Scaling Managed Agents Decoupling the brain from the hands]]。⚠️ 二者均为**厂商工程案例文章，非同行评审、无对照实验**（两篇源笔记各自已标注此局限），且**库内无学术性 harness/scaffolding 文献**。"脚手架 vs 基座模型"这一论点与 [[Alex Zhang - The Mismanaged Geniuses Hypothesis|MGH]] 同源。
>
> **具身侧展开**：[[Embodied failure detection]] — harness 的一个部件在具身场景的具体化（环境不报错 ⇒ 自己造 exception），也是 load-bearing 原则的一次应用。

## Open questions
- Which harness components generalize across domains?
- How do we tell whether a harness component is still load-bearing for a newer model?
- Which parts of a harness should remain engineered versus learned?（[[Tan et al. - MetaRSI-v1 A Meta-Recursive Self-Improving System for Recursive Self-Improving Systems Themselves|MetaRSI-v1]] 的答案：**提议**可学、**裁决**必须是不可写的确定性代码——评估器 / 任务集 / 发布规则 / 账本放在所有写面之外，否则“能力更好”与“成功定义更宽”从环内不可区分）
- How should artifact interfaces be designed for long-running collaboration?

## Related
- [[Agent orchestration]]
- [[Task decomposition]]
- [[Prithvi Rajasekaran - Harness design for long-running application development]]
- [[Anthropic - Scaling Managed Agents Decoupling the brain from the hands]]
- [[Claude Code]]
- [[OpenClaw]]
- [[Anthropic]]
- [[Harnesses and managed agent systems]]
