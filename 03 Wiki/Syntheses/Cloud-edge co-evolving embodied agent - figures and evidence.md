# Cloud-edge co-evolving embodied agent — figures and evidence

> [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework]] 的配图与证据附录。
> SVG 用 visualize 工具的宿主 CSS 类(`c-gray`/`t`/`ts`/`th` 等)与 `var(--p/b/t)` 别名,**只在 show_widget 宿主内渲染**;重建时把代码块原样喂回 `mcp__visualize__show_widget` 即可。绝对量级标"示意"的为典型值,需实测标定;其余为已核实硬数。

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

```svg
<svg viewBox="0 0 680 450" xmlns="http://www.w3.org/2000/svg" font-family="var(--font-sans)">
  <text x="24" y="28" class="t" font-size="17" font-weight="500">实时算力争用:训练并发 → 推理延迟冲破实时标准</text>
  <text x="130" y="52" class="th" font-size="11">推理延迟 (ms)</text>
  <line x1="130" y1="60" x2="130" y2="180" stroke="var(--b)" stroke-width="1"/>
  <line x1="130" y1="180" x2="650" y2="180" stroke="var(--b)" stroke-width="1"/>
  <text x="124" y="69" class="ts" font-size="11" text-anchor="end">50</text>
  <text x="124" y="136" class="ts" font-size="11" text-anchor="end">20</text>
  <text x="124" y="184" class="ts" font-size="11" text-anchor="end">0</text>
  <rect x="320" y="60" width="180" height="72" fill="#E24B4A" fill-opacity="0.10"/>
  <line x1="130" y1="132" x2="650" y2="132" stroke="#A32D2D" stroke-width="1" stroke-dasharray="5 4"/>
  <text x="646" y="127" class="ts" font-size="11" text-anchor="end">实时标准 ~20ms(控制节拍)</text>
  <polyline fill="none" stroke="#378ADD" stroke-width="2.5" stroke-linejoin="round" points="130,156 175,154 220,157 270,155 320,156 330,108 345,84 358,120 372,70 388,110 404,82 420,118 436,75 452,112 468,95 484,120 500,108 512,156 560,154 610,156 650,156"/>
  <g class="c-red"><text x="410" y="80" class="t" font-size="12" text-anchor="middle">延迟 ↑ ~3–5× → 超出标准</text></g>
  <text x="225" y="196" class="ts" font-size="11" text-anchor="middle">推理独占</text>
  <g class="c-red"><text x="410" y="196" class="t" font-size="11" text-anchor="middle">推理 + 训练并发 ✗</text></g>
  <text x="575" y="196" class="ts" font-size="11" text-anchor="middle">训练停</text>
  <text x="24" y="233" class="ts" font-size="12">推理</text>
  <rect x="130" y="221" width="520" height="18" rx="3" fill="#1D9E75"/>
  <text x="24" y="263" class="ts" font-size="12">训练</text>
  <rect x="320" y="251" width="180" height="18" rx="3" fill="#E24B4A"/>
  <line x1="410" y1="251" x2="410" y2="180" stroke="var(--t)" stroke-width="0.5" stroke-dasharray="3 3"/>
  <text x="130" y="292" class="ts" font-size="12">训练与推理抢同一 GPU / 带宽 → 推理掉帧、违反实时标准</text>
  <line x1="24" y1="310" x2="656" y2="310" stroke="var(--b)" stroke-width="0.5"/>
  <text x="24" y="334" class="t" font-size="14" font-weight="500">解法:错峰 —— 训练挪到空闲 / 充电,推理独占算力</text>
  <text x="290" y="356" class="th" font-size="11" text-anchor="middle">运行</text>
  <text x="555" y="356" class="th" font-size="11" text-anchor="middle">空闲 / 充电</text>
  <line x1="460" y1="362" x2="460" y2="392" stroke="var(--t)" stroke-width="1" stroke-dasharray="4 4"/>
  <rect x="130" y="366" width="330" height="18" rx="3" fill="#1D9E75"/>
  <rect x="460" y="366" width="190" height="18" rx="3" fill="#378ADD"/>
  <text x="130" y="410" class="ts" font-size="12">→ 推理延迟回到标准以内,训练不抢实时算力</text>
  <rect x="24" y="430" width="12" height="12" rx="2" fill="#1D9E75"/><text x="41" y="440" class="ts" font-size="11">推理</text>
  <rect x="120" y="430" width="12" height="12" rx="2" fill="#E24B4A"/><text x="137" y="440" class="ts" font-size="11">训练(并发抢占)</text>
  <rect x="320" y="430" width="12" height="12" rx="2" fill="#378ADD"/><text x="337" y="440" class="ts" font-size="11">训练 / 巩固(错峰)</text>
</svg>
```

---

## 图 2 · 核心②:孤岛 vs 协同(拓扑)

**说明**:左孤岛(节点无连线=无协同,各自微调/RL)；右协同(经云中枢经验上行+共享下发)。示意结构图。

```svg
<svg viewBox="0 0 680 430" xmlns="http://www.w3.org/2000/svg" font-family="var(--font-sans)">
  <defs><marker id="bi" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>
  <text x="24" y="28" class="t" font-size="17" font-weight="500">跨场景:孤岛各自微调 vs 协同演进</text>
  <line x1="340" y1="46" x2="340" y2="398" stroke="var(--b)" stroke-width="0.5" stroke-dasharray="4 4"/>
  <text x="30" y="60" class="t" font-size="14" font-weight="500">现状 · 场景孤岛(✗)</text>
  <g class="c-gray"><rect x="45" y="82" width="125" height="52" rx="8"/><text class="t" x="107" y="106" font-size="13" text-anchor="middle">家庭 A</text><text class="ts" x="107" y="123" font-size="10" text-anchor="middle">↻ 单独微调 / RL</text></g>
  <g class="c-gray"><rect x="185" y="82" width="125" height="52" rx="8"/><text class="t" x="247" y="106" font-size="13" text-anchor="middle">家庭 B</text><text class="ts" x="247" y="123" font-size="10" text-anchor="middle">↻ 单独微调 / RL</text></g>
  <g class="c-gray"><rect x="45" y="150" width="125" height="52" rx="8"/><text class="t" x="107" y="174" font-size="13" text-anchor="middle">工厂 C</text><text class="ts" x="107" y="191" font-size="10" text-anchor="middle">↻ 单独微调 / RL</text></g>
  <g class="c-gray"><rect x="185" y="150" width="125" height="52" rx="8"/><text class="t" x="247" y="174" font-size="13" text-anchor="middle">商场 D</text><text class="ts" x="247" y="191" font-size="10" text-anchor="middle">↻ 单独微调 / RL</text></g>
  <text x="30" y="236" class="ts" font-size="11">各自为战:每场景单独微调 / RL,彼此无连接</text>
  <g class="c-red"><text class="t" x="30" y="254" font-size="11">经验不流动 → 重复劳动、增益不传播</text></g>
  <text x="356" y="60" class="t" font-size="14" font-weight="500">协同演进(✓)</text>
  <line x1="437" y1="120" x2="462" y2="131" stroke="#1D9E75" stroke-width="1.5" marker-start="url(#bi)" marker-end="url(#bi)"/>
  <line x1="585" y1="120" x2="568" y2="131" stroke="#1D9E75" stroke-width="1.5" marker-start="url(#bi)" marker-end="url(#bi)"/>
  <line x1="437" y1="200" x2="462" y2="157" stroke="#1D9E75" stroke-width="1.5" marker-start="url(#bi)" marker-end="url(#bi)"/>
  <line x1="585" y1="200" x2="568" y2="157" stroke="#1D9E75" stroke-width="1.5" marker-start="url(#bi)" marker-end="url(#bi)"/>
  <g class="c-teal"><rect x="458" y="116" width="114" height="50" rx="8"/><text class="t" x="515" y="137" font-size="12" text-anchor="middle">云 · 车队聚合</text><text class="ts" x="515" y="154" font-size="10" text-anchor="middle">+ 共享下发</text></g>
  <g class="c-gray"><rect x="356" y="92" width="82" height="34" rx="6"/><text class="t" x="397" y="113" font-size="11" text-anchor="middle">家庭 A</text></g>
  <g class="c-gray"><rect x="585" y="92" width="82" height="34" rx="6"/><text class="t" x="626" y="113" font-size="11" text-anchor="middle">家庭 B</text></g>
  <g class="c-gray"><rect x="356" y="190" width="82" height="34" rx="6"/><text class="t" x="397" y="211" font-size="11" text-anchor="middle">工厂 C</text></g>
  <g class="c-gray"><rect x="585" y="190" width="82" height="34" rx="6"/><text class="t" x="626" y="211" font-size="11" text-anchor="middle">商场 D</text></g>
  <text x="515" y="184" class="th" font-size="10" text-anchor="middle">↑ 经验上行   ↓ 共享下发</text>
  <text x="356" y="248" class="ts" font-size="11">通用技能聚合共享 · 场景特化留本地</text>
  <g class="c-teal"><text class="t" x="356" y="266" font-size="11">一处学到、全队受益</text></g>
  <text x="24" y="416" class="th" font-size="11">示意图。节点 = 场景/部署;孤岛 = 无跨场景经验流动;协同 = 经验上行 + 共享下发(云② 车队聚合 + B 模块化)。</text>
</svg>
```

---

## 图 3 · 核心②:适配成本随场景数(标度,概念示意)

**说明**:孤岛线性 vs 协同亚线性,保留交叉点(规模化后协同制胜)。**讲形状,非实测绝对值。**

```svg
<svg viewBox="0 0 680 390" xmlns="http://www.w3.org/2000/svg" font-family="var(--font-sans)">
  <defs><marker id="ax" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>
  <text x="24" y="28" class="t" font-size="17" font-weight="500">适配成本随场景数:孤岛线性 vs 协同亚线性</text>
  <line x1="70" y1="58" x2="70" y2="320" stroke="var(--b)" stroke-width="1" marker-start="url(#ax)"/>
  <line x1="70" y1="320" x2="652" y2="320" stroke="var(--b)" stroke-width="1" marker-end="url(#ax)"/>
  <text x="40" y="190" class="th" font-size="11" text-anchor="middle" transform="rotate(-90 40 190)">总适配成本(训练/数据/人力)</text>
  <text x="646" y="342" class="th" font-size="11" text-anchor="end">场景 / 部署数 N →</text>
  <path d="M70 305 L640 95" fill="none" stroke="#E24B4A" stroke-width="2.5"/>
  <g class="c-red"><text class="t" x="636" y="88" font-size="12" text-anchor="end">孤岛:N × 单场景(线性)</text></g>
  <path d="M70 285 C 220 250 420 232 640 222" fill="none" stroke="#1D9E75" stroke-width="2.5"/>
  <g class="c-teal"><text class="t" x="636" y="242" font-size="12" text-anchor="end">协同:共享基座 + 小 adapter(亚线性)</text></g>
  <circle cx="147" cy="278" r="3.5" fill="var(--p)"/>
  <text x="162" y="268" class="ts" font-size="11">超过几个场景后,协同更省 →</text>
  <text x="24" y="358" class="th" font-size="11">概念示意:讲“线性 vs 亚线性”的形状,非实测绝对值。</text>
  <text x="24" y="374" class="th" font-size="11">协同的亚线性来自 B 模块化 + 云② 联邦聚合(通用技能共享、场景特化本地)。</text>
</svg>
```

---

## 图 4 · 关键技术 T1:CLS 快/慢双系统 + 错峰巩固

**说明**:海马快学(情景缓冲,在线廉价)+ 新皮层慢学(专家权重,错峰巩固)+ replay。原理/映射示意。

```svg
<svg viewBox="0 0 680 320" xmlns="http://www.w3.org/2000/svg" font-family="var(--font-sans)">
  <defs><marker id="a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>
  <text x="24" y="28" class="t" font-size="17" font-weight="500">互补学习系统(CLS):快情景记忆 + 慢权重巩固</text>
  <line x1="355" y1="48" x2="355" y2="210" stroke="var(--t)" stroke-width="0.5" stroke-dasharray="4 4"/>
  <text x="190" y="62" class="th" font-size="12" text-anchor="middle">运行 · 在线(廉价)</text>
  <text x="515" y="62" class="th" font-size="12" text-anchor="middle">空闲 / 充电 · 离线(错峰)</text>
  <g class="c-gray"><rect x="24" y="104" width="110" height="52" rx="8"/><text class="t" x="79" y="126" font-size="13" text-anchor="middle">体验</text><text class="ts" x="79" y="144" font-size="10" text-anchor="middle">+ 验证信号</text></g>
  <g class="c-purple"><rect x="170" y="92" width="160" height="72" rx="10"/><text class="t" x="250" y="116" font-size="14" text-anchor="middle">情景缓冲</text><text class="ts" x="250" y="134" font-size="11" text-anchor="middle">(快 · 海马)</text><text class="ts" x="250" y="152" font-size="10" text-anchor="middle">高可塑 · 即时捕获 · 廉价</text></g>
  <g class="c-teal"><rect x="450" y="92" width="170" height="72" rx="10"/><text class="t" x="535" y="116" font-size="14" text-anchor="middle">专家慢权重</text><text class="ts" x="535" y="134" font-size="11" text-anchor="middle">(慢 · 新皮层)</text><text class="ts" x="535" y="152" font-size="10" text-anchor="middle">低可塑 · 整合 · 只动 adapter</text></g>
  <line x1="136" y1="128" x2="166" y2="128" stroke="var(--p)" stroke-width="1.5" marker-end="url(#a)"/>
  <text x="389" y="118" class="ts" font-size="11" text-anchor="middle">replay 巩固</text>
  <line x1="332" y1="128" x2="446" y2="128" stroke="var(--p)" stroke-width="1.5" marker-end="url(#a)"/>
  <path d="M535 166 V196 Q535 206 525 206 H89 Q79 206 79 196 V158" fill="none" stroke="var(--t)" stroke-width="1.5" marker-end="url(#a)"/>
  <text x="307" y="224" class="ts" font-size="11" text-anchor="middle">下发 / 部署 → 更好执行 → 新体验</text>
  <text x="24" y="254" class="t" font-size="12" font-weight="500">为何高效:在线只捕获(便宜) · 重巩固错峰到充电(不抢实时) · 只动 adapter(小)</text>
  <text x="24" y="284" class="th" font-size="10">CLS(Complementary Learning Systems, McClelland 1995):海马快学 + 新皮层慢学 + replay 巩固。</text>
  <text x="24" y="300" class="th" font-size="10">映射:情景缓冲 ↔ 快(海马),专家权重 ↔ 慢(新皮层),错峰巩固 ↔ 睡眠。交错回放(新旧混合)防遗忘。</text>
</svg>
```

---

## 图 5 · 关键技术 T2:部署前门控 + 运行时 Simplex 守护

**说明**:两道防线——部署前影子/金丝雀/回滚;运行时 Simplex(演进专家被验证地板兜住)。注:经典地板=fail-safe(保安全,不保完成任务)。

```svg
<svg viewBox="0 0 680 400" xmlns="http://www.w3.org/2000/svg" font-family="var(--font-sans)">
  <defs><marker id="a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>
  <text x="24" y="26" class="t" font-size="17" font-weight="500">系统安全策略:部署前门控 + 运行时 Simplex 守护</text>
  <text x="24" y="52" class="ts" font-size="12">部署前 · 让新版本“挣得”上岗(门控 + 可回滚)</text>
  <g class="c-gray"><rect x="24" y="66" width="100" height="40" rx="8"/><text class="t" x="74" y="91" font-size="12" text-anchor="middle">候选新版本</text></g>
  <g class="c-gray"><rect x="144" y="66" width="100" height="40" rx="8"/><text class="t" x="194" y="91" font-size="12" text-anchor="middle">影子验证</text></g>
  <g class="c-gray"><rect x="264" y="66" width="100" height="40" rx="8"/><text class="t" x="314" y="91" font-size="12" text-anchor="middle">金丝雀</text></g>
  <g class="c-green"><rect x="384" y="66" width="110" height="40" rx="8"/><text class="t" x="439" y="91" font-size="12" text-anchor="middle">提升上线 ✓</text></g>
  <line x1="124" y1="86" x2="142" y2="86" stroke="var(--p)" stroke-width="1.5" marker-end="url(#a)"/>
  <line x1="244" y1="86" x2="262" y2="86" stroke="var(--p)" stroke-width="1.5" marker-end="url(#a)"/>
  <line x1="364" y1="86" x2="382" y2="86" stroke="var(--p)" stroke-width="1.5" marker-end="url(#a)"/>
  <line x1="300" y1="106" x2="300" y2="120" stroke="#A32D2D" stroke-width="1.5" marker-end="url(#a)"/>
  <g class="c-red"><rect x="182" y="120" width="210" height="30" rx="8"/><text class="t" x="287" y="139" font-size="11" text-anchor="middle">✗ 验证失败 → 回滚至 last-good</text></g>
  <line x1="24" y1="166" x2="656" y2="166" stroke="var(--b)" stroke-width="0.5"/>
  <text x="340" y="184" class="ts" font-size="11" text-anchor="middle">通过门控的版本 → 进入运行时,仍受 Simplex 约束</text>
  <text x="24" y="206" class="ts" font-size="12">运行时 · Simplex 守护(学习组件被验证地板兜住)</text>
  <g class="c-amber"><rect x="36" y="220" width="156" height="54" rx="10"/><text class="t" x="114" y="244" font-size="13" text-anchor="middle">演进专家</text><text class="ts" x="114" y="262" font-size="10" text-anchor="middle">(不可信 · 会变)</text></g>
  <g class="c-green"><rect x="36" y="292" width="156" height="50" rx="10"/><text class="t" x="114" y="313" font-size="13" text-anchor="middle">已验证安全控制器</text><text class="ts" x="114" y="330" font-size="10" text-anchor="middle">经典地板 · 不学习</text></g>
  <g class="c-gray"><rect x="252" y="252" width="150" height="56" rx="10"/><text class="t" x="327" y="276" font-size="13" text-anchor="middle">安全监视器 / 切换</text><text class="ts" x="327" y="294" font-size="10" text-anchor="middle">检查包络 / CBF</text></g>
  <g class="c-gray"><rect x="470" y="258" width="140" height="44" rx="10"/><text class="t" x="540" y="284" font-size="13" text-anchor="middle">机器人 / 作动</text></g>
  <line x1="192" y1="247" x2="250" y2="270" stroke="var(--p)" stroke-width="1.5" marker-end="url(#a)"/>
  <text x="214" y="252" class="th" font-size="10">候选动作</text>
  <line x1="192" y1="315" x2="250" y2="292" stroke="var(--p)" stroke-width="1.5" marker-end="url(#a)"/>
  <text x="214" y="320" class="th" font-size="10">安全动作</text>
  <line x1="402" y1="280" x2="468" y2="280" stroke="var(--p)" stroke-width="1.5" marker-end="url(#a)"/>
  <text x="435" y="274" class="th" font-size="10" text-anchor="middle">选其一驱动</text>
  <text x="252" y="326" class="ts" font-size="10">正常 → 演进专家;越界 → 切经典地板</text>
  <text x="24" y="384" class="th" font-size="10">原则:每步演进都被门控、可回滚,且被一条不学习的经典地板(可证明稳定 / CBF)兜底。</text>
</svg>
```

---

## 图 6 · 关键技术 T3:模块化联邦协同进化

**说明**:按技能、模块粒度联邦——通用技能 adapter 跨端聚合(FedAvg,非原始数据/非全量权重),场景特化 adapter 留本地。化解"个性化 vs 泛化"。示意结构图。

```svg
<svg viewBox="0 0 680 415" xmlns="http://www.w3.org/2000/svg" font-family="var(--font-sans)">
  <defs><marker id="bi" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>
  <text x="24" y="28" class="t" font-size="16" font-weight="500">T3 模块化联邦协同:通用技能联邦共享,场景特化本地保留</text>
  <g class="c-teal"><rect x="200" y="66" width="280" height="58" rx="10"/><text class="t" x="340" y="90" font-size="13" text-anchor="middle">云② · 按技能联邦聚合(FedAvg)</text><text class="ts" x="340" y="108" font-size="10" text-anchor="middle">仅聚合通用技能 adapter,非原始数据</text></g>
  <line x1="120" y1="296" x2="250" y2="126" stroke="#1D9E75" stroke-width="1.5" marker-start="url(#bi)" marker-end="url(#bi)"/>
  <line x1="340" y1="296" x2="340" y2="126" stroke="#1D9E75" stroke-width="1.5" marker-start="url(#bi)" marker-end="url(#bi)"/>
  <line x1="560" y1="296" x2="440" y2="126" stroke="#1D9E75" stroke-width="1.5" marker-start="url(#bi)" marker-end="url(#bi)"/>
  <text x="392" y="200" class="ts" font-size="10" text-anchor="middle">↕ Δadapter 上行 / 聚合下行(仅通用技能)</text>
  <text x="392" y="216" class="th" font-size="9" text-anchor="middle">非全量权重 · 非原始数据</text>
  <rect x="30" y="270" width="180" height="112" rx="10" fill="none" stroke="var(--b)" stroke-width="1"/>
  <text x="120" y="288" class="t" font-size="13" text-anchor="middle">家庭 A</text>
  <g class="c-teal"><rect x="40" y="296" width="160" height="28" rx="6"/><text class="t" x="120" y="314" font-size="11" text-anchor="middle">通用技能 adapter</text></g>
  <g class="c-amber"><rect x="40" y="330" width="160" height="28" rx="6"/><text class="t" x="120" y="348" font-size="11" text-anchor="middle">特化 adapter(本地)</text></g>
  <rect x="250" y="270" width="180" height="112" rx="10" fill="none" stroke="var(--b)" stroke-width="1"/>
  <text x="340" y="288" class="t" font-size="13" text-anchor="middle">工厂 B</text>
  <g class="c-teal"><rect x="260" y="296" width="160" height="28" rx="6"/><text class="t" x="340" y="314" font-size="11" text-anchor="middle">通用技能 adapter</text></g>
  <g class="c-amber"><rect x="260" y="330" width="160" height="28" rx="6"/><text class="t" x="340" y="348" font-size="11" text-anchor="middle">特化 adapter(本地)</text></g>
  <rect x="470" y="270" width="180" height="112" rx="10" fill="none" stroke="var(--b)" stroke-width="1"/>
  <text x="560" y="288" class="t" font-size="13" text-anchor="middle">商场 C</text>
  <g class="c-teal"><rect x="480" y="296" width="160" height="28" rx="6"/><text class="t" x="560" y="314" font-size="11" text-anchor="middle">通用技能 adapter</text></g>
  <g class="c-amber"><rect x="480" y="330" width="160" height="28" rx="6"/><text class="t" x="560" y="348" font-size="11" text-anchor="middle">特化 adapter(本地)</text></g>
  <text x="24" y="404" class="th" font-size="11">通用上行共享 + 特化本地保留 → 个性化 vs 泛化两全(模块粒度联邦;通用技能 adapter 跨端聚合,特化 adapter 不上传)。</text>
</svg>
```

---

## 图 7 · 关键技术 T4:能力画像 + 契约共版本化(不传权重)

**说明**:B 之下大脑↔专家的演进接口不交换权重,只同步 ① 能力画像、② 契约版本、③ 缺口信号;更优指令经运行时通道自然下发。示意结构图。

```svg
<svg viewBox="0 0 680 322" xmlns="http://www.w3.org/2000/svg" font-family="var(--font-sans)">
  <defs><marker id="a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>
  <text x="24" y="28" class="t" font-size="16" font-weight="500">T4 端云协同接口:能力画像 + 契约共版本化(不传权重)</text>
  <g class="c-teal"><rect x="24" y="56" width="210" height="128" rx="10"/><text class="t" x="129" y="76" font-size="12" text-anchor="middle">云 · 大脑 + 能力登记表</text><text class="ts" x="129" y="92" font-size="10" text-anchor="middle">(权威能力画像)</text><text class="ts" x="44" y="116" font-size="10">倒液 · 成功率 92% · v4</text><text class="ts" x="44" y="136" font-size="10">抓取 · 成功率 85% · v2</text><text class="ts" x="44" y="156" font-size="10">移动 · 成功率 90% · v3</text></g>
  <g class="c-gray"><rect x="446" y="56" width="210" height="128" rx="10"/><text class="t" x="551" y="76" font-size="12" text-anchor="middle">端 · 专家库(独立模块)</text><text class="ts" x="466" y="100" font-size="10">倒液专家 · v4</text><text class="ts" x="466" y="120" font-size="10">抓取专家 · v2</text><text class="ts" x="466" y="140" font-size="10">移动专家 · v3</text><text class="ts" x="466" y="160" font-size="10">…</text></g>
  <text x="340" y="86" class="ts" font-size="11" text-anchor="middle">① 能力画像同步</text>
  <line x1="440" y1="96" x2="240" y2="96" stroke="var(--p)" stroke-width="1.5" marker-end="url(#a)"/>
  <text x="340" y="122" class="ts" font-size="11" text-anchor="middle">② 契约共版本化 v3</text>
  <line x1="240" y1="132" x2="440" y2="132" stroke="var(--p)" stroke-width="1.5" marker-start="url(#a)" marker-end="url(#a)"/>
  <text x="340" y="158" class="ts" font-size="11" text-anchor="middle">③ 缺口信号 ↔ 新专家包</text>
  <line x1="240" y1="168" x2="440" y2="168" stroke="var(--p)" stroke-width="1.5" marker-start="url(#a)" marker-end="url(#a)"/>
  <g class="c-amber"><rect x="24" y="198" width="632" height="44" rx="8"/><text class="t" x="340" y="218" font-size="12" text-anchor="middle">✗ 大脑演进后不推权重(B:专家独立)</text><text class="ts" x="340" y="234" font-size="10" text-anchor="middle">更优指令经运行时通道自然下发;演进平面只同步 ① 能力画像 + ② 契约版本 + ③ 缺口信号</text></g>
  <text x="24" y="266" class="th" font-size="10">① 能力画像同步:专家被改 → 更新云对它的能力 card(能干啥 / 边界 / 成功率),非权重。</text>
  <text x="24" y="284" class="th" font-size="10">② 契约共版本化:子任务 / 约束 / 验证 schema 两侧对齐(协商版本、前后兼容),防“语言”漂移。</text>
  <text x="24" y="302" class="th" font-size="10">③ 缺口信号 → 新专家:大脑要的技能没有 → 端报缺口 → 云训新专家 → 签名下发。</text>
</svg>
```

---

## tags

#synthesis #figures #evidence #embodied-ai #cloud-edge #continuous-evolution
