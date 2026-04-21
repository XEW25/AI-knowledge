# 3D Spatial Representation

## 核心主张

具身控制模型处理的是 **3D 物理世界的因果交互**，需要一种专门的"空间模态"（spatial modality）来编码 3D 空间信息——正如语言模型需要语言、视觉模型需要图像一样。

当前主流的图像/视频输入是 2D 投影，在本质上是**观察的函数**（随视角、光照变化），而非**物体本身的函数**（与观察无关），这构成了具身控制的根本性 modality 不匹配。

## 语言类比

| 语言模型 | 具身控制模型 |
|---------|------------|
| 需要语言作为输入 modality | 需要 3D 空间表征作为输入 modality |
| 语言：组合式、符号化、可编码因果链 | 空间表征：精确几何、物理不变、可组合 |
| 语言本身不内建因果，因果是模型学到的 | 空间表征不需要内建物理因果，物理直觉是模型学到的 |
| Token 是基本单元 | 需要一种 "spatial token" 作为基本单元 |

关键洞察：语言之所以有效，不是因为语言内建了因果和逻辑，而是因为它**足够抽象、组合性强、能编码复杂关系**。同理，3D 空间表征不需要内建物理因果，只需要足够抽象、可组合、能编码空间结构。

## 图像/视频作为 3D 表示的根本缺陷

| 缺陷 | 说明 |
|------|------|
| 视角依赖 | 换一个角度，像素完全变了 |
| 几何丢失 | 2D 投影丢掉了精确的 3D 结构和尺寸 |
| 物理不变性缺失 | 物体 identity 不随观察变化，但图像会变 |
| 空间关系模糊 | 遮挡、前后关系、精确距离都丢失了 |
| 因果结构不可用 | 无法直接从像素推出物理因果关系 |

## 理想 3D 空间表征的特征

### 必要性质

1. **视角不变性** — 编码物体本身，不随观察角度变化
2. **空间结构保留** — 精确的 3D 几何和拓扑关系
3. **物理不变性** — 刚体变换（平移、旋转、拉伸）下表示稳定
4. **组合性** — 局部可组合成整体，跨场景泛化
5. **可查询/可索引** — 模型能精确指向空间中的任意实体

### 可能的组织层次

```
顶层：场景图（Scene Graph）
  节点：物体（类别、姿态、属性）
  边：空间关系（on, under, beside, inside）

中层：物体结构（Object Structure）
  物体 = 部件的组合（table = top + legs）
  部件之间有几何约束关系

底层：几何基元（Geometric Primitive）
  形状基元 + 空间占位（occupancy / SDF / point cloud）
```

类比语言层级：词 → 短语 → 句子 → 篇章 ≈ 基元 → 部件 → 物体 → 场景

### "解析的、有结构依据的"

空间表征应该是**可分解、可命名、可查询、层级一致**的。这与语言的 parse tree 类似——场景可以被解析成结构化的图，每个节点和边可以被精确引用。

但结构化和连续表示可能需要共存：
- **结构化层**：拓扑关系、物体 identity、空间关系 → 符号化
- **连续层**：颜色、材质、几何细节 → 连续向量

## 现有候选方案

| 表示 | 几何 | 不变性 | 组合性 | 可微 | 问题 |
|------|------|--------|--------|------|------|
| RGB/视频 | ❌ | ❌ | ❌ | ✅ | 丢失 3D 结构 |
| 3D 点云 | ✅ | 部分 | ❌ | 部分 | 稀疏、无结构 |
| NeRF | ✅ | 部分 | ❌ | ✅ | 隐式、难编辑 |
| [[3D Gaussian Splatting]] | ✅ | 部分 | ❌ | ✅ | 冗余、缺乏语义结构 |
| Scene Graph | ✅ | ✅ | ✅ | ❌ | 需要解析、粒度难定 |
| SDF | ✅ | ✅ | ❌ | ✅ | 缺乏物体级语义 |

**目前没有一个表示同时满足所有理想特征。** 3DGS 是目前最好的感知层表示，但可能需要在上面加一层结构化抽象（spatial tokens / scene graphs）才能成为真正的"spatial modality"。

## 可能的最终形态

```
3DGS / 点云（连续几何底层）
  ↓ 解析/抽象
Spatial Tokens（离散、可组合的空间单元）
  ↓
场景图 / 关系网络（结构化推理层）
```

3DGS 是空间版的"像素"，空间版"token"还不知道长什么样。这可能是一个重要的 open research question。

## Key Papers

- **SPA** (ICLR 2025) — 实验验证 3D spatial awareness 对具身表征的重要性 [arXiv:2410.08208]
- **UniSplat** (2026) — 从多视角图像学习 spatial intelligence [arXiv:2604.10573]
- **GROOT** (CoRL 2023) — Object-centric 3D representation for generalizable manipulation
- **Object-Centric 3DGS** (2026) — 3DGS + object-centric 表示 [arXiv:2604.09045]
- **Embodied Spatial Intelligence** (2025) — 3D Perception to 3D Reasoning [arXiv:2509.00465]
- **CVPR Workshop: Causal and Object-Centric Representations for Robotics** (2025)

## Related

- [[3D Gaussian Splatting]] — 目前最接近的感知层实现
- [[Object-Centric Representation]] — 以物体为中心的表示方法
- [[Spatial Intelligence for Embodied AI]] — 相关研究主题页
- [[Task decomposition]] — 感知与规划是具身任务分解的两种核心能力

## tags

#3d-representation #embodied-ai #spatial-intelligence #scene-representation #open-question
