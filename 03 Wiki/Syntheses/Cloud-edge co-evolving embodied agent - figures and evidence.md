# Cloud-edge co-evolving embodied agent — figures and evidence

> [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework]] 的配图与证据附录。
> 图为**自包含 .svg**(存于 `assets/`,内联 `<style>` + 浅色背景,Obsidian 打开即显示;矢量文本,改数后另存即可重渲,无需外部工具)。绝对量级标"示意"的为典型值,需实测标定;其余为已核实硬数。

- **Type**: Synthesis 附录(figures + evidence)
- **Date**: 2026-06-23

---

## 已核实硬数表(核心① 引用基础)

| 量 | 值 | 来源 |
|---|---|---|
| 训练显存 ≈ 8× 推理 | 16 vs 2 bytes/参数(混合精度:fp16权重2+fp16梯度2+fp32主权重4+Adam m 4+v 4)| 标准混合精度/ZeRO 账 |
| Thor 算力 | FP4 2070(稀疏)/ 1035(稠密FP4=稀疏FP8=稀疏INT8)/ 517(稠densFP8=稀疏FP16);FP16 ~258 稠密(推得)| [NVIDIA Jetson Thor 博客 Table 1](https://developer.nvidia.com/blog/introducing-nvidia-jetson-thor-the-ultimate-platform-for-physical-ai/) |
| Thor 内存/带宽/功耗 | 128GB LPDDR5X / **273 GB/s** / 40–130W;GA 2025-08-25 | 同上 |
| Orin 算力 | 275 TOPS(稀疏INT8)/ 170(稠densINT8)/ 85 FP16 TFLOPS / **5.3 FP32** | [NVIDIA Jetson Orin](https://www.nvidia.com/en-us/autonomous-machines/embedded-systems/jetson-orin/) |
| Orin 带宽 | 64GB / **204.8 GB/s** | 同上 |
| 数据中心带宽对照 | H100 ~3.35 TB/s;B200 ~8 TB/s | 公认规格 |
| 关键比值 | 算力 Orin→Thor ×7.5,带宽仅 ×1.33;headline(FP4)vs 训练(FP16)~8×;Orin headline vs FP32 ~52×;端侧 vs 数据中心带宽 ~12–29× | 由上表推 |
| 三计算机分工 | DGX=训练 / Omniverse-Cosmos=仿真 / **Jetson Thor=推理** | [NVIDIA 三计算机](https://blogs.nvidia.com/blog/three-computers-robotics/) |
| GR00T 工作流 | 服务器(H100/L40,40GB+)微调 → 下载到 Thor 推理(16GB+)| [Seeed/NVIDIA 文档](https://wiki.seeedstudio.com/fine_tune_gr00t_n1.5_for_lerobot_so_arm_and_deploy_on_jetson_thor/) |
| TinyML 训练墙 | 更新 MCUNet 末两 block 即超 256KB;Sparse Update 省 7–9×、总 20–21× | [On-Device Training Under 256KB(arXiv:2206.15472)](https://arxiv.org/abs/2206.15472) |
| LoRA | vs GPT-3 175B Adam 全量微调:可训参 ↓10,000×、GPU 显存 ↓3× | [LoRA(arXiv:2106.09685)](https://arxiv.org/abs/2106.09685) |

**显存账诚实修正**:2B 专家(FP16 ~4GB)全量微调 ≈ 40–60GB,叠运行栈仍可入 128GB;**显存非瓶颈,真瓶颈是实时算力争用 + 功耗 + 吞吐**。运行栈估算公式(示意):`M_run = N·P·b(专家)+ A(激活/KV)+ V(感知)+ S(系统)`,4×2B INT8 ≈ 8+2+3+5 = ~18GB。

> 已弃用图:`edge_memory_inference_vs_training_overflow`(显存溢出图)——仅在"大模型/机载大脑/多专家同时全量训"时成立,对 2B/128GB 不成立,故不作主图。

---

## 图 1 · 核心①:实时算力争用 → 推理性能下降(主图)

**说明**:上=推理延迟随时间,训练并发窗口冲破"实时标准"(红区);下=调度条对齐成因;再给错峰解法。**deadline/标准由典型控制节拍(50–200Hz)推得;绝对 ms 为示意**。

![[fig-core1-compute-contention.svg]]

---

## 图 2 · 核心②:孤岛 vs 协同(拓扑)

**说明**:左孤岛(节点无连线=无协同,各自微调/RL)；右协同(经云中枢经验上行+共享下发)。示意结构图。

![[fig-core2-siloed-vs-collaborative.svg]]

---

## 图 3 · 核心②:适配成本随场景数(标度,概念示意)

**说明**:孤岛线性 vs 协同亚线性,保留交叉点(规模化后协同制胜)。**讲形状,非实测绝对值。**

![[fig-core2-cost-scaling.svg]]

---

## 图 4 · 关键技术 T1:CLS 快/慢双系统 + 错峰巩固

**说明**:海马快学(情景缓冲,在线廉价)+ 新皮层慢学(专家权重,错峰巩固)+ replay。原理/映射示意。

![[fig-t1-cls.svg]]

---

## 图 5 · 关键技术 T2:部署前门控 + 运行时 Simplex 守护

**说明**:两道防线——部署前影子/金丝雀/回滚;运行时 Simplex(演进专家被验证地板兜住)。注:经典地板=fail-safe(保安全,不保完成任务)。

![[fig-t2-simplex-safety.svg]]

---

## 图 6 · 关键技术 T3:模块化联邦协同进化

**说明**:按技能、模块粒度联邦——通用技能 adapter 跨端聚合(FedAvg,非原始数据/非全量权重),场景特化 adapter 留本地。化解"个性化 vs 泛化"。示意结构图。

![[fig-t3-modular-federated.svg]]

---

## 图 7 · 关键技术 T4:能力画像 + 契约共版本化(不传权重)

**说明**:B 之下大脑↔专家的演进接口不交换权重,只同步 ① 能力画像、② 契约版本、③ 缺口信号;更优指令经运行时通道自然下发。示意结构图。

![[fig-t4-capability-registry-contract.svg]]

---

## tags

#synthesis #figures #evidence #embodied-ai #cloud-edge #continuous-evolution
