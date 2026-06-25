# ReKep: Spatio-Temporal Reasoning of Relational Keypoint Constraints for Robotic Manipulation

- Canonical URL: https://arxiv.org/abs/2409.01652
- PDF URL: https://arxiv.org/pdf/2409.01652
- Original PDF URL: https://rekep-robot.github.io/rekep.pdf
- Source type: arXiv PDF
- Accessed at: 2026-04-21T22:41:00+08:00
- arXiv ID: 2409.01652
- Authors: Wenlong Huang*, Chen Wang*, Yunzhu Li, Ruohan Zhang, Li Fei-Fei
- Affiliations: Stanford University, Columbia University
- Local PDF: — 已移除(13.8 MB,超 AGENTS.md `01 Raw` 体积阈值;见上方 Canonical / PDF URL,arXiv 2409.01652 可随时重取)

## Raw capture

### Abstract

Representing robotic manipulation tasks as constraints that associate the robot and the environment is a promising way to encode desired robot behaviors. However, it remains unclear how to formulate the constraints such that they are 1) versatile to diverse tasks, 2) free of manual labeling, and 3) optimizable by off-the-shelf solvers to produce robot actions in real-time.

In this work, we introduce **Relational Keypoint Constraints (ReKep)**, a visually-grounded representation for constraints in robotic manipulation. Specifically, ReKep is expressed as Python functions mapping a set of 3D keypoints in the environment to a numerical cost. By representing a manipulation task as a sequence of ReKep constraints, a hierarchical optimization procedure solves for robot actions (SE(3) end-effector poses) with a perception-action loop at real-time frequency.

To circumvent manual specification, an automated procedure leverages large vision models (DINOv2) and vision-language models (GPT-4o) to produce ReKep from free-form language instructions and RGB-D observations.

### Key Method

1. **Keypoint proposal**: DINOv2 proposes keypoints on fine-grained meaningful regions in the scene
2. **Constraint generation**: GPT-4o generates ReKep constraints as Python programs specifying desired keypoint relations at different task stages and transitioning behaviors
3. **Optimization**: Constrained optimization solver produces dense SE(3) end-effector actions subject to generated constraints
4. **No additional training or task-specific data required**

### Demonstrated capabilities
- Multi-stage manipulation
- In-the-wild tasks
- Bimanual manipulation
- Reactive behaviors (closed-loop replanning)
- Novel strategy generation (e.g., different folding strategies for different clothing)

### BibTeX
```
@article{huang2024rekep,
  title = {ReKep: Spatio-Temporal Reasoning of Relational Keypoint Constraints for Robotic Manipulation},
  author = {Huang, Wenlong and Wang, Chen and Li, Yunzhu and Zhang, Ruohan and Fei-Fei, Li},
  journal = {arXiv preprint arXiv:2409.01652},
  year = {2024}
}
```
