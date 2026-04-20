# Kerbl et al. - 3D Gaussian Splatting for Real-Time Radiance Field Rendering

## Metadata

- **Type**: Paper (SIGGRAPH 2023 / ACM ToG)
- **Authors**: Bernhard Kerbl, Georgios Kopanas, Thomas Leimkühler, George Drettakis
- **Institution**: Inria, Université Côte d'Azur, and LIRRM
- **Year**: 2023
- **arXiv**: [2308.04079](https://arxiv.org/abs/2308.04079)
- **Project**: [https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/](https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/)
- **Code**: [3D 3D Gaussian Splatting](https://github.com/graphdeco-inria/gaussian-splatting)

## Core Contribution

提出**3D Gaussian Splatting (3DGS)**，一种用**3D 高斯椭球集合**表示三维场景的方法，通过 splatting 投影 + alpha blending 实现实时的新颖视角合成。

核心创新点：
1. **显式场景表示**：用数十万到数百万个高斯椭球替代 NeRF 的隐式 MLP
2. **实时渲染**：splatting 渲染比 ray marching 快 1-2 个数量级
3. **端到端可微**：所有高斯参数（位置、协方差、不透明度、球谐系数）均可梯度下降优化
4. **自适应密度控制**：训练过程中自动调整高斯数量（分裂、克隆、删除）

## Method

### 3D 高斯的属性

每个高斯 $G(x)$ 由以下参数定义：

| 参数 | 维度 | 含义 |
|------|------|------|
| 位置 μ | 3 | 高斯中心坐标 |
| 协方差矩阵 Σ | 3×3 | 控制椭球形状、大小、朝向 |
| 不透明度 α | 1 | 参与混合的权重 |
| 球谐系数 (SH) | 9×3 (DC) + 更高阶 | 视角相关颜色 |

协方差矩阵通过缩放矩阵 S 和旋转矩阵 R 参数化：$\Sigma = R S S^T R^T$

### Splatting 渲染

1. 将每个 3D 高斯投影到 2D 像面（使用仿射近似）
2. 按深度对所有投影高斯排序
3. 前向叠加 alpha blending：

$$C = \sum_i c_i \alpha_i \prod_{j=1}^{i-1}(1 - \alpha_j)$$

其中 $c_i$ 是第 i 个高斯的颜色，$\alpha_i$ 是其不透明度。

### 训练流程

```
输入: 多视角图片 + 相机位姿（通常由 COLMAP SfM 提供）
1. 初始化: 用 SfM 点云初始化高斯位置
2. 迭代优化:
   - Splatting 渲染得到图像
   - 计算 L1 + SSIM 损失
   - 反向传播更新高斯参数
   - 自适应密度控制:
     * 高斯过大 → 分裂
     * 高斯过小 → 克隆
     * 高斯高不透明度低 → 删除
3. 输出: 收敛后的 3DGS 场景表示
```

## Key Results

| 指标 | NeRF | 3DGS |
|------|------|------|
| 渲染速度 | ~10s/图 (360p) | **~100fps (1080p)** |
| PSNR | 相当 | 相当或略高 |
| 训练时间 | 数小时 | ~30min (Mip-NeRF360) |

## 影响与后续工作

3DGS 迅速成为场景表示领域的重要基线，引发了大量后续研究：

- **质量改进**: Mip-Splatting (抗锯齿), GS-DR (延迟渲染)
- **动态场景**: Dynamic 3DGS, Spacetime Gaussians
- **大场景**: Street Gaussians, Scaffold-GS
- **语义/可控**: Feature 3DGS, LangSplat, LEGaussians
- **具身/机器人**: GNFactor, SplatSim, RT-GS

## tags

#paper #3dgs #scene-representation #novel-view-synthesis #graphics
