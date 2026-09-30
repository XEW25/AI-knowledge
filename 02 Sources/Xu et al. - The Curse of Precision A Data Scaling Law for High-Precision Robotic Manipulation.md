# Xu et al. - The Curse of Precision A Data Scaling Law for High-Precision Robotic Manipulation

## Metadata

- **Type**: source note
- **Authors**: Cuijie Xu, Yuanfan Xu, Min Xue, Jianjie Lin, Jian Wang, Xudong Zhang, Yu Wang, Jincheng Yu
- **Organizations**: 清华大学、OpenMind (WuHu) Robotics
- **Version**: arXiv:2607.23108v1，2026-07-25；arXiv 作者备注称 ICRA 2026 接收，未另行核实会议记录
- **Source**: [arXiv](https://arxiv.org/abs/2607.23108) · [v1 HTML](https://arxiv.org/html/2607.23108v1) · [v1 PDF](https://arxiv.org/pdf/2607.23108v1)
- **Raw tier**: URL-only；不下载或 Git 跟踪 PDF
- **Verification status**: HTML 方法、评测协议、表 I–III 与局限已读；数字为作者自报，未复现。未独立读图，不从图形补充精确曲线数值
- **Code status**: 未做仓库核实，不据此断言代码未发布
- **Ingested**: 2026-09-30，经 Ethan 讨论确认

## Summary

**精密操作的数据预算取决于系统能看清和学会到什么程度。** 本文固定行为克隆算法，通过容差和演示量扫描，提出接近系统精度边界时数据成本急升的经验拟合。收录为 [[Robot data engine]] 与 [[Real-robot evaluation]] 的系统诊断案例；拟合边界不是已证明的物理硬极限，证据仅覆盖仿真行为克隆。

## 两条经验关系

**P 是容差尺寸，越小代表任务越精密；不是越大越好的精度分数。** N 为成功演示轨迹数，SR 为成功率。[§III-A](https://arxiv.org/html/2607.23108v1#S3)

- 固定容差：`log(1−SR) = a·log(N) + b`，拟合失败率随数据量的幂律下降。
- 固定目标成功率：`log(N) = m/(P−c) + n`，拟合接近边界 c 时的数据需求。

在模型形式成立且 P 从上方接近 c 时，N 会按 `exp(m/(P−c)+n)` 急剧增长。作者称其为 precision curse；这是经验模型的渐近性质，不是实验已经采集了无限数据、证实不可突破。参数 c 是给定系统配置下拟合出的极限容差，改变观测、示范或任务分布都可能改变它。

## 实验怎样做

全部使用 ManiSkill3 / SAPIEN 仿真中的 Panda；以 Diffusion Policy 做行为克隆，视觉模型采用 ResNet-18 与 U-Net 去噪器。滚球分支采用状态输入，不应把三任务全部描述成视觉策略。[§III–IV](https://arxiv.org/html/2607.23108v1)

| 任务 | P 的定义与扫描范围 | 示范来源 |
|---|---|---|
| Peg Insertion | 方销/方孔间隙，4–10 mm | 特权位姿脚本＋运动规划 |
| Stack Cuboid | 方形底面半边长，4–10 mm | 特权位姿脚本＋运动规划 |
| Roll Ball | 球通过目标圆区域的半径，35–200 mm | RL 专家 |

每个容差单独生成**仅含成功轨迹**的数据池，再取不同 N 训练；不是同一固定演示集合只改变评测阈值。每个 (N,P) 点只做一次训练，训练中多次评测，每次 100 episodes，最后取最高三次 SR 的均值。

拟合分两层：先拟合 N→SR；再对不同 P 插值/外推达到指定 SR 所需的 N；最后网格搜索共享 c，使不同目标 SR 曲线的总拟合优度最大。因此第二条关系的点包含第一层估计，**不能当作全部直接测量的数据需求**。共享 c 与 SR 无关是拟合中施加的结构，不是完全无约束地独立发现。

## 系统消融的意义

表 III 插入任务的拟合 c：[§IV-C](https://arxiv.org/html/2607.23108v1#S4)

| 配置 | c（mm） |
|---|---:|
| 基线：腕部相机、保守专家、高随机化 | 2.35 |
| 移除腕部相机 | 3.85 |
| 改用更直接的专家成功轨迹 | 1.27 |
| 降低任务随机化范围 | 1.00 |

**更直接的专家不等于更高成功率的专家。** 作者报 5 mm 间隙下，保守专家原始成功率约 98%，直接专家约 50%；后者过滤成功样本后反而更易学。作者归因为减少纠正动作引入的观测歧义，尚不能将歧义这一因果解释视作完全独立验证。

**数据引擎含义（分析）**：专家原始成功率、保留演示的可学性、采集成功样本的成本是三个指标。成功率低意味着更多被舍弃的采集，不能只看学生更准就认定总成本更低。降低随机化也缩小了目标分布，不能称作同覆盖范围的能力提升。

模型容量是另一个前提：滚球中作者报小 U-Net 不呈现稳定 scaling，增大后拟合明显改善。这支持“先检查表达能力再堆数据”的诊断思路，不支持所有模型必然服从同一关系。

## 证据与统计边界

- **仿真与算法范围**：没有真机验证；仅行为克隆，未验证 VLA、RL、DAgger 或其他传感器路线。对通用性只能保留假设。
- **单次训练**：评测次数不能替代训练种子重复，误差条不覆盖初始化与训练随机性。
- **选最优评测**：最高三次均值有选择偏差；基于这 300 次试验的 Wilson 区间不能消除选择偏差，也不是对训练总体的置信区间。
- **外推边界**：实际插入扫描为 4–10 mm，拟合 c 可低于扫描下界；不能直接声称达到表中 c，或精确预测亚毫米所需数据。
- **诊断不是判定器**：作者建议一致下降趋势指向系统瓶颈、异常波动指向 bug；本库判断这只是排查线索，拟合失效也可能来自容量、训练未收敛或分布变化。

## 如何用于本库（分析）

在目标系统上联合扫描容差与数据量，检查提高 N 是否稳定降低失败；若改善趋弱，分别试验局部观测、示范一致性、模型容量和任务覆盖。用独立留出评测与多种子确认趋势，比较同一任务分布，再考虑预测数据预算。**保留诊断方法，避免把 c 当作跨系统通用常数。**

## Related

- [[Robot data engine]] — 演示量、可学性与有效样本成本
- [[Real-robot evaluation]] — 容差扫描、选择偏差和种子不确定性
- [[Tao et al. - ForeTac-VLA A Forecasting-Based Tactile-Vision-Language-Action Model for Contact-Rich Robotic Manipulation|ForeTac-VLA]] — 感知接触状态的另一条改进轴；本文未验证触觉能改变 c
- [[Physical Intelligence - RL Tokens Precise Manipulation with Efficient Online RL]] — 精密操作的在线 RL 路线对照；不能把本文 BC 拟合外推至 RL
- [[Embodied AI - VLAs, world models, and cerebellum]] — 导航入口

## tags

#data-scaling #precision #imitation-learning #diffusion-policy #system-diagnosis #simulation
