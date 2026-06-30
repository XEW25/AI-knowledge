# Chen et al. - LaWAM Latent World Action Models for Efficient Dynamics-Aware Robot Policies

- **Type**: Source note(paper;**PDF 全文自读核实**;**标准 benchmark**,非自造指标)
- **Paper**: [arXiv:2606.15768v1](https://arxiv.org/abs/2606.15768)(2026-06-14)
- **Authors**: Jialei Chen, Kai Wang, Kang Chen, Shuaihang Chen, Feng Gao, Wenhao Tang, Zhiyuan Li, Weilin Liu, Zhuyu Yao, Boxun Li, Yuanbo Xu, Chao Yu — 清华 / 吉大 / 南开 / 北大 / 哈工大 / 中关村学院 / Striding.AI / **Infinigence AI(无问芯穹)**
- **Date ingested**: 2026-06-30
- **Raw**: **URL-only**(arXiv 稳定;9.85 MB PDF 仅临时自读、读毕清理、未入库,符合 >2MB 规则)
- **Code**: **未见明确开源链接**(论文摘要/正文未给;待确认)

---

## TL;DR

一个**隐空间 World-Action Model**:在冻结视觉基座(**DINOv3**)的 latent 空间里训一个 **latent action model(LAM)**,**把它的 decoder 复用成世界模型(LaWM,230M)**——单次前向预测**未来观测特征 = 隐视觉子目标**,喂给 Alternate-DiT 动作专家做"动力学感知"的动作生成。相比像素 WAM:**世界建模参数少 ~95%(230M vs 5B WAN)、延迟低 ~24×(187ms vs LingBot-VA 4482ms)**,且 **LIBERO 98.6% / RoboTwin 91.22%**(标准 benchmark)SOTA/有竞争力。

## 问题

VLA 缺"动作如何改变场景"的前瞻;WAM 加了前瞻但**像素视频生成贵 + 像素级冗余 + 迭代延迟**(LingBot-VA 单次推理 4482ms vs VLA-0.5 220ms)。

## 方法(PDF 核实)

- **冻结视觉基座(DINOv3)→ 在其 latent 空间操作**。
- **LAM**:inverse-dynamics encoder(IDM)从转移 (u, u_T) 推出 **latent action z**;decoder 从当前特征 + z 预测未来特征。
- **关键 novelty:把 LAM 的 decoder 留下来当世界模型(LaWM)**——以往 latent-action VLA 只用 LAM 学 embodiment-agnostic 动作表征、训完**丢掉 decoder**;LaWAM 反其道,**用 decoder 生成未来观测特征作隐视觉子目标**(与 Garrido et al. 并行观察:LAM 的 decoder 本就是个 latent-action-conditioned 世界模型)。
- **LaWAM**:latent-action distillation 预训练;推理时 **policy 预测 latent action → LaWM 单次前向解出隐子目标 → Alternate-DiT 动作专家** 据 context + 子目标出 action chunk。**非迭代**(对照扩散/视频生成)。
- **训练数据**:~**3000h 机器人视频 + 1500h egocentric 人类视频**(开源数据)。**LaWM = 230M**(比像素 WAM 的 5B WAN backbone 少 ~95% 世界建模参数)。

## 结果(标准 benchmark)

- **LIBERO 98.6% / RoboTwin 91.22% SR** + 真机(pick-place / 开抽屉 / 叠毛巾)。
- LIBERO 对照:π0(3.5B)、π0.5(3.5B)、LingBot-VA(5.5B)——LaWAM 用 **230M 的 LaWM** 打平/超过这些大得多的世界建模骨架。
- **187ms / 动作块,~24× 低于像素 WAM**。

## 定位 / 对照

- vs **π0.7**:也用视觉子目标,但其子目标由**单独的迭代像素模型(BAGEL)**产;LaWAM 是**单次 latent**。
- vs **LDA-1B**:也在 DINO latent 空间建模,但**联合扩散去噪未来视觉 + 动作(迭代)**;LaWAM 单次非迭代。
- vs **像素 WAM**([[GigaWorld Team - GigaWorld-Policy An Efficient Action-Centered World-Action Model|GigaWorld-Policy]]、LingBot-VA、GR00T-dreams):避开像素合成。
- vs **latent-token WAM**(把未来压成 latent token):LaWAM 暴露**显式结构化隐子目标**而非隐 token。
- 引用了库内 [[Bi et al. - Motus A Unified Latent Action World Model|Motus]]、GigaWorld-Policy。

## 在本库的定位

- [[World-Action Models]] 的**隐空间 / 高效分支**(对照视频生成 WAM)。
- "推理时世界模型产出什么"四档里的**隐特征子目标档**,且做成**单次前向**(效率新点)。
- [[JEPA]] / DINO-WM latent 家族 + latent-action 谱系([[AgiBot - GO-1 ViLLA Generalist Embodied Foundation Model|GO-1]] / LAPA)的**交汇点**:用"LAM decoder = latent WM"把两者缝起来。
- [[World model trends - architecture, scale, function, hardware]]:**产隐 → 轻/快**的最强新证(230M、24×、标准 benchmark SOTA)。
- **边缘可行**:230M + 187ms + 单次 → 端侧可行的 WAM(对照 [[ACE Robotics - Kairos 3.0 a Real-Time Generative Video World Model|Kairos]] 像素路线)。

`★ Insight ─────────────────────────────────────`
- **LaWAM 是三条库内线索的汇合点**:JEPA/DINO 隐预测 + latent-action(GO-1/LAPA)+ WAM-for-control,靠一句话缝起来——"**latent-action model 的 decoder 本身就是一个 latent 世界模型**"。这把"训完即弃的 decoder"变成"面向策略的动力学接口",是个高杠杆复用。
- 它也是趋势页论点的硬证:**产隐 → 世界建模参数 -95%、延迟 -24×,却在标准 benchmark 上不输 3.5–5.5B 的大模型**。再次印证"控制 data-bound 不是 param-bound;为控制建模世界,不必产像素"。可靠性比 NeuroVLA 那次强——**这次是 LIBERO/RoboTwin 标准榜**。
`─────────────────────────────────────────────────`

## Related

- [[World-Action Models]] · [[JEPA]] · [[World model trends - architecture, scale, function, hardware]]
- [[Bi et al. - Motus A Unified Latent Action World Model]] · [[GigaWorld Team - GigaWorld-Policy An Efficient Action-Centered World-Action Model]] · [[AgiBot - GO-1 ViLLA Generalist Embodied Foundation Model]](latent-action 谱系)
- [[Embodied Brain Models]](Predictive Spatial / subgoal 接口)· [[Embodied Cerebellum Models]](边缘 WM)
- [[Maes et al. - LeWorldModel (LeWM) Stable End-to-End JEPA from Pixels]] · [[ACE Robotics - Kairos 3.0 a Real-Time Generative Video World Model]](对照:latent vs pixel)

## tags

#source #world-model #world-action-model #latent-action #jepa #dinov3 #robot-manipulation #efficient-inference #embodied-ai #paper-verified
