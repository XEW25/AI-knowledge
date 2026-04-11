# Harness design for long-running application development

- Source URL: https://www.anthropic.com/engineering/harness-design-long-running-apps
- Source type: web article
- Accessed at: 2026-04-12 00:09 Asia/Shanghai
- Author: Prithvi Rajasekaran
- Organization: Anthropic

## Raw capture

Written by Prithvi Rajasekaran, a member of Anthropic Labs.

This article studies how to improve long-running autonomous application development with harness design rather than relying only on stronger base models. It starts from two threads of work: frontend design generation and long-running coding harnesses. The author argues that both domains benefited from moving beyond naive single-agent execution and toward structured multi-agent systems with explicit roles, evaluation criteria, and artifact-based coordination.

### Core thesis
The article’s core claim is that long-running application development improves substantially when the harness explicitly structures the work. The most important design moves are:
- decompose the work into tractable pieces
- separate generation from evaluation
- use structured artifacts and handoff files for continuity
- revise the harness as models improve so that only still-load-bearing scaffolding remains

### Main engineering lessons
1. **Naive long-running agents drift over time.** As context grows, models lose coherence, incur high token costs, and may exhibit “context anxiety,” wrapping up early as they approach perceived context limits.
2. **Context resets + structured handoffs** were a strong fix in earlier harnesses, especially for Sonnet 4.5. The next agent starts fresh but receives a structured artifact carrying enough state to continue.
3. **Self-evaluation is weak by default.** Agents tend to overrate their own work, especially on subjective tasks like design.
4. **Generator–evaluator separation** helps by creating an external feedback loop. A tuned evaluator can become much more skeptical and useful than a generator criticizing itself.
5. **Planner–generator–evaluator** proved effective for full-stack application builds. The planner expands a short prompt into a product spec, the generator implements in stages, and the evaluator tests against explicit criteria.
6. **Communication via structured files** helps coordinate long-running multi-agent work without over-specifying implementation too early.
7. **Harness design is not static.** As models improve, some scaffolding stops being load-bearing and should be removed. New harness complexity should be justified by actual capability gains.

### Frontend-design phase
The frontend-design harness uses a generator + evaluator loop. The evaluator scores outputs using explicit criteria:
- design quality
- originality
- craft
- functionality

The author found that explicit criteria made subjective quality more gradable and that the wording of the criteria directly shaped output style.

### Full-stack coding phase
The article describes a three-agent architecture:
- **Planner**: turns a short prompt into an ambitious product spec without prematurely locking detailed implementation.
- **Generator**: implements features in sprints, using a standard web stack and self-evaluating before handoff.
- **Evaluator**: uses Playwright to test the running app, checks functionality and quality criteria, and blocks completion if thresholds are not met.

A key mechanism is the **sprint contract**, negotiated between generator and evaluator before implementation begins. This bridges high-level product specs and testable implementation.

### Example findings
The article compares a solo run with a full harness on a retro game maker. The full harness is much more expensive but materially better. It produces a more polished and more functional application, with a far richer spec and multiple QA-detected bug fixes. The evaluator catches concrete issues such as broken rectangle fill behavior, selection/deletion mismatches, and API route ordering bugs.

The article later simplifies the harness for Claude Opus 4.6, removing sprint decomposition while keeping planner and evaluator. The key lesson is that harness complexity should be revisited whenever model capabilities change.

### Why this article matters
This article is important because it pushes the discussion from “use multiple agents” to a more operational question: **which harness components are actually load-bearing for long-running work?** It treats harnesses as evolving engineering artifacts that encode assumptions about model weaknesses. Those assumptions should be stress-tested and periodically stripped down as models improve.

It also contributes concrete design patterns relevant to this vault:
- generator–evaluator separation
- planner-based spec expansion
- structured handoff artifacts
- explicit contracts between agents
- context reset vs compaction tradeoffs
- harness simplification as models improve
