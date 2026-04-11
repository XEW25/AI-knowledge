# Harness design for long-running application development

- Raw note: [[2026-04-12 - Prithvi Rajasekaran - Harness design for long-running application development]]

## Metadata
- Type: source note
- Format: web engineering article
- Author: [[Prithvi Rajasekaran]]
- Organization: [[Anthropic]]
- Date accessed: 2026-04-12
- Original URL: https://www.anthropic.com/engineering/harness-design-long-running-apps
- Related: [[Harness design]], [[Agent orchestration]], [[Task decomposition]], [[Claude Code]], [[OpenClaw]]
- Tags: #agents #harness-design #long-horizon #coding-agents #multi-agent-systems

## Summary
This article argues that long-running application development quality depends heavily on harness design. Rather than treating autonomous coding as a single-agent problem, it builds a structured multi-agent workflow that separates planning, generation, and evaluation. The article’s strongest message is that harnesses should be treated as evolving engineering artifacts: they encode assumptions about model weaknesses, and those assumptions must be re-evaluated as models improve.

The article begins with a generator–evaluator setup for frontend design, where subjective quality is made more gradable through explicit evaluation criteria. It then scales the same general idea into long-running coding with a planner–generator–evaluator architecture that produces full-stack applications over multi-hour autonomous sessions.

## Key claims
1. Long-running autonomous coding quality is strongly shaped by harness design, not only by base model quality.
2. Long tasks fail partly because of context growth, context anxiety, and weak self-evaluation.
3. Generator–evaluator separation is a strong lever for improving both subjective and objective output quality.
4. Structured artifacts and explicit handoff contracts are important for long-horizon coherence.
5. Harness components should be revisited as models improve; not all scaffolding remains load-bearing over time.

## Why it matters
For this vault, the most important contribution is not just the specific Anthropic system, but the broader framing that **harness design is a first-class part of capability engineering for long-running agents**.

This article strengthens the line that agent performance depends on more than single-call model quality. It adds concrete evidence that:
- decomposition matters
- evaluator separation matters
- context management strategy matters
- artifact interfaces between agents matter

It is especially relevant to the growing cluster around long-horizon agent architecture and the practical side of orchestration design.

## What feels strong
- The article is rich in concrete engineering detail rather than only abstract advice.
- It clearly distinguishes context reset from compaction and explains why that matters.
- It treats evaluator skepticism as something that can be engineered and calibrated.
- The idea of removing harness components as models improve is a valuable design principle.

## What feels limited
- It is still an internal case-study style article, not a controlled academic comparison.
- The article focuses on application-building workflows, so some insights may transfer unevenly to other domains.
- It gives compelling patterns, but not yet a formal theory of harness design.

## Ada’s notes
The most valuable point here is that harnesses are not static wrappers around a model. They are evolving structures that compensate for specific capability gaps. That makes harness design itself an empirical research object.

What stands out most:
- generator vs evaluator separation as a durable pattern
- context reset vs compaction as a real architectural choice
- structured files / contracts as the substrate for long-running multi-agent work
- periodic simplification of harnesses as models improve

This article feels like strong evidence for treating agent architecture as a system-design problem rather than only a prompting problem.

## Questions worth following up
1. Which harness components generalize across domains, and which are task-specific?
2. How should one identify whether a harness component is still load-bearing for a newer model?
3. What are the right artifact interfaces for long-running agent collaboration?
4. How does evaluator design relate to broader questions of learned versus engineered orchestration?

## Possible downstream vault work
- Update [[Agent orchestration]]
- Create or extend a page on harness design for long-running agents
- Add entities such as [[Prithvi Rajasekaran]] and [[Anthropic]] if they become more central in this cluster
- Extend the long-horizon agent architecture map with harness-specific patterns
