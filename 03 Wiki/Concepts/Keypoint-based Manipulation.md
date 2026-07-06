# Keypoint-based Manipulation

## Definition
A robot-manipulation approach that represents objects/scenes by a sparse set of **semantic 3D keypoints** and defines the task over those points (relations, constraints, or targets) — instead of learning a direct pixels→action policy or requiring full 6-DoF object pose.

## Why keypoints
- **Compact, generalizable state.** Semantic keypoints abstract away appearance and instance detail → transfer across object instances and categories.
- **Language-groundable.** Keypoints + a VLM/LLM let a natural-language goal be turned into geometric relations between points.
- **Optimizable.** Costs/constraints defined over keypoints are cheap to evaluate and differentiate → solvable by [[Constrained Optimization for Robot Control|constrained optimization]] rather than a learned policy.

## Vault anchor: ReKep
[[Huang et al. - ReKep Spatiotemporal Reasoning Keypoint Constraints for Robotic Manipulation|ReKep]] (Stanford / Columbia, 2024) is the canonical instance:
- **DINOv2** proposes fine-grained semantic keypoints in the scene.
- **GPT-4o** writes per-stage **relational keypoint constraints** as Python cost functions over the 3D keypoints.
- A solver turns the constraints into dense **SE(3)** end-effector trajectories.
- Real-time keypoint tracking closes the loop (~10 Hz, reactive to disturbances).
- Zero-shot: no task-specific training data.

## Limits
- Sparse keypoints may under-represent fine / contact-rich actions (e.g. USB insertion).
- Quality depends on the keypoint proposer (DINOv2) and the constraint generator (LLM); a wrong constraint has no self-correction.

## Related
- [[Huang et al. - ReKep Spatiotemporal Reasoning Keypoint Constraints for Robotic Manipulation]] — canonical work
- [[Constrained Optimization for Robot Control]] — how keypoint constraints are solved into motion
- [[Task Decomposition as OOD Mitigation]] · [[Task decomposition]] — ReKep's broader paradigm
- [[3D Spatial Representation]] · [[Object-Centric Representation]] — related scene representations
- [[VLA - Vision-Language-Action Models]] — the end-to-end learned alternative

## tags
#concept #manipulation #keypoints #robotics #embodied
