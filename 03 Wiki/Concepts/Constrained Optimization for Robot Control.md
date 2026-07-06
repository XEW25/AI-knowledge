# Constrained Optimization for Robot Control

## Definition
Producing robot actions by **formulating the task as an optimization problem** — an objective plus constraints over states/actions — and solving for a trajectory or control, rather than emitting actions from a learned policy network. A classic robotics family (trajectory optimization, TAMP, model-predictive control, QP-based whole-body control); increasingly paired with an LLM/VLM front-end that **writes** the objective/constraints from a language goal.

## Why it matters here
It is the **execution half** of the [[Task Decomposition as OOD Mitigation|decompose-and-solve]] route: a high-level model turns a language goal into constraints, and an optimizer turns constraints into motion. This decouples "understand the task" from "actuate it," giving interpretability, zero-shot generalization, and no task-specific training — the [[Huang et al. - ReKep Spatiotemporal Reasoning Keypoint Constraints for Robotic Manipulation|ReKep]] recipe (Python keypoint-cost functions solved for SE(3) trajectories, closed-loop ~10 Hz).

## Contrast with learned policies
- **Optimization:** explicit, interpretable, zero-shot; but needs a good problem *formulation*, and is brittle if the model writes wrong constraints (ReKep has no self-correction of bad constraints).
- **Learned VLA:** end-to-end, data-hungry, plausibly higher ceiling on contact-rich skills.

These are the two poles the vault repeatedly contrasts — see [[Task decomposition]] and [[VLA - Vision-Language-Action Models]].

## Adjacent in the vault
Constraint-based control also shows up on the **dependability / safety** side: CBF- and SHIELD-style safety filters in [[Home robot architecture - a hierarchical embodied agent]] act as an optimization-based safety layer over a learned policy — the classical "spinal"/safety floor beneath [[Embodied Cerebellum Models|the cerebellum]].

## Related
- [[Huang et al. - ReKep Spatiotemporal Reasoning Keypoint Constraints for Robotic Manipulation]] — LLM-generated constraints + solver
- [[Keypoint-based Manipulation]] — what the constraints are typically written over
- [[Task Decomposition as OOD Mitigation]] · [[Task decomposition]]
- [[Home robot architecture - a hierarchical embodied agent]] — the safety-constraint layer

## tags
#concept #optimization #control #robotics #embodied
