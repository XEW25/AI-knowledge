# Object-Centric Representation

## Quick Definition

Object-centric representation 是一种**以物体为基本单元**的场景表示方法，将场景分解为离散的物体实体及其属性和关系，而非将整个场景表示为统一的连续场或像素数组。

## 为什么具身 AI 需要它

传统的全局表示（整张图的 feature map、整个场景的 NeRF）丢失了物体的边界和 identity。具身控制需要：

1. **精确操作** — 抓哪个物体、推哪个物体，需要物体级的精确定位
2. **泛化** — 见过"红色杯子在桌子上"，应该能处理"蓝色杯子在椅子上"（组合泛化）
3. **可解释性** — 知道动作作用在哪个物体上，便于调试和安全保障

## 与全局表示的对比

| | 全局表示 (Global Feature Map) | Object-Centric 表示 |
|--|------------------------------|-------------------|
| 基本单元 | 像素 / patch / 整体向量 | 物体实体 |
| 组合性 | ❌ | ✅ |
| 跨场景泛化 | 弱（依赖整体相似性） | 强（物体可自由组合） |
| 可解释性 | 弱 | 强 |
| 解析难度 | 低（端到端学习） | 高（需要分割/检测） |

## 具身中的典型做法

1. **分割 + 点云** — RGB-D → 语义分割 → 每个物体的点云 → Object-centric 3D（GROOT 的做法）
2. **Slot Attention** — 无监督地发现场景中的物体 slots
3. **Scene Graph** — 节点=物体，边=关系，显式的图结构
4. **Object-Centric 3DGS** — 将 3DGS 的高斯按物体分组，每个物体有自己的高斯子集

## Key Papers

- **GROOT** (CoRL 2023) — Object-centric point cloud representation for manipulation
- **Object-Centric 3DGS** (2026) — Scene-agnostic object-centric 3DGS [arXiv:2604.09045]
- **Slot Attention** (ICML 2020) — 无监督 object discovery
- **CVPR 2025 Workshop: Causal and Object-Centric Representations for Robotics**

## Related

- [[3D Spatial Representation]] — 理想的 3D 空间表征需要物体中心性
- [[3D Gaussian Splatting]] — 感知层实现，Object-centric 是其上的结构化抽象
- [[Task decomposition]] — 物体级表示是任务分解的基础

## tags

#object-centric #scene-representation #embodied-ai #compositional
