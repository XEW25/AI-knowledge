# 3D Gaussian Splatting (3DGS)

## Quick Definition

3DGS 是一种用**3D 高斯椭球集合**表示三维场景的方法，通过 splatting 投影 + alpha blending 实现**实时新颖视角合成**。每个高斯拥有位置、形状（协方差矩阵）、不透明度和视角相关颜色（球谐函数），数十万到数百万个高斯叠加在一起，从任意新视角渲染出逼真图像。

## Core Properties of Each Gaussian

| 属性 | 维度 | 含义 |
|------|------|------|
| 位置 μ | 3D | 高斯中心坐标 |
| 协方差 Σ | 3×3 | 控制椭球的形状、大小、朝向（各向异性） |
| 不透明度 α | 标量 | 参与 alpha blending 的权重 |
| 球谐系数 (SH) | 标量 | 视角相关颜色（view-dependent appearance） |

协方差通过缩放向量 S 和旋转四元数 R 参数化，确保正定：$\Sigma = R \cdot \text{diag}(S^2) \cdot R^T$

## How Splatting Works

1. **投影**: 每个 3D 高斯沿视线投影到 2D 像面，得到 2D 高斯
2. **排序**: 按深度从前到后排序
3. **Alpha blending**: 逐个混合颜色

$$C = \sum_i c_i \alpha_i \prod_{j=1}^{i-1}(1 - \alpha_j)$$

## Training

1. 用 COLMAP (SfM) 从多视角图像恢复点云和相机位姿，作为高斯初始化
2. 迭代优化：splatting 渲染 → 与真实图片计算 L1 + SSIM loss → 反向传播
3. **自适应密度控制**：过大高斯→分裂，过小→克隆，不透明低→删除

## 3DGS vs Alternatives

### vs NeRF

| | NeRF | 3DGS |
|--|------|------|
| 表示方式 | 隐式 (MLP) | 显式 (高斯点集) |
| 渲染 | Ray marching，慢 | Splatting，**快 10-100×** |
| 可编辑 | 困难 | 可直接操作高斯 |
| 视角相关外观 | 有限 | 球谐可表达复杂视角依赖 |

### vs 3D 点云

| | 3D 点云 | 3DGS |
|--|---------|------|
| 空间填充 | 仅零体积点 | 连续概率密度场 |
| 渲染 | 最近点投影，有缝隙 | Alpha blending，平滑连续 |
| 可微 | 通常不可微 | 天然可微 |
| 遮挡处理 | 需额外逻辑 | 自动通过 alpha 混合处理 |

## 与物理引擎的关系

**3DGS 不是物理仿真方法**。它只表示"长什么样"，不建模力、碰撞、动力学等因果物理过程。

| | 3DGS | 物理引擎 (MuJoCo/Isaac Sim) |
|--|------|---------------------------|
| 核心任务 | 外观表示 | 物理仿真 |
| 因果建模 | ❌ | ✅ |
| 预测能力 | 给视角→渲染图 | 给动作→状态变化 |

两者在具身系统中**互补**：3DGS 负责感知（眼睛），物理引擎负责规划（大脑）。

传统物理引擎也带渲染器（光栅化/RTX），但那是**从物理规则出发合成图像**；3DGS 是**从真实照片中学习外观**，本质不同。

##具身控制中的输入形式

3DGS 作为具身控制输入，主要有四种路线：

1. **RGB/D 渲染** — 查询当前位姿，渲染图像/深度图，输入视觉编码器（最常用）
2. **语义特征图** — 每个高斯携带语义向量，渲染出特征图供 policy 理解场景
3. **直接 3D 查询** — 用 3D 坐标 query 局部高斯特征（仍在探索）
4. **在线建图** — 边走边建 3DGS，全局场景作为记忆供规划使用

路线一（RGB/D）最成熟，路线二（语义特征）最有前景，路线三/四仍在 research 阶段。

## Key Papers

- **Kerbl et al. (2023)** — 原始 3DGS，SIGGRAPH / ACM ToG [[Kerbl et al. - 3D Gaussian Splatting for Real-Time Radiance Field Rendering]]
- **LangSplat** — 开放词汇语义 3DGS
- **LEGaussians** — 语义特征增强的高斯
- **GNFactor** — 3DGS 用于机器人 manipulation
- **SplatSim** — 3DGS + 物理引擎 sim-to-real

## 作为 3D 空间表征的起点

3DGS 满足几何精确和视角一致，但缺乏物体级语义结构和组合性。它可能是"spatial modality"的感知层底层（类比像素），上面还需要一层结构化抽象（类比 token）。详见 [[3D Spatial Representation]]。

## Related

- [[3D Spatial Representation]] — 理想 3D 空间表征的特征与设计原则
- [[Object-Centric Representation]] — 在 3DGS 上加物体中心的结构化抽象
- [[Spatial Intelligence for Embodied AI]] — 相关研究主题
- [[Task decomposition]] — 3DGS 感知与物理规划是具身任务分解的两种核心能力
- [[Agent memory]] — 3DGS 在线建图是空间记忆的一种实现方式

## tags

#3dgs #scene-representation #embodied-ai #novel-view-synthesis #robotics
