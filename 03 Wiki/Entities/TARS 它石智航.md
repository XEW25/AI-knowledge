# TARS 它石智航（Tashi Zhihang / TARS）

- **Type**: Company / Embodied-AI Startup
- **Headquarters**: 中国
- **Focus**: Human-centric（以人为中心）**穿戴式离机数据采集** + 具身数据引擎；中国公司里把"离机/穿戴采集"做成产品线的代表（与遥操数采工厂路线相对）
- **关键人物**: 首席科学家 丁文超（media-reported）
- **估值**: 2026-04 媒体口径列入中国 13 家百亿人民币级估值具身公司之一（secondary）

> ⚠️ 本页信息主要来自公司宣称与媒体报道（secondary），暂无论文/代码可核；置信度整体低于有 arXiv 论文背书的实体页。

## 产品与数据

- **TARS SenseHub 穿戴采集套件**：「眼睛」TARS-Vision + 「双手」TARS-Glove，直接记录人类第一视角演示（非遥操作机器人）——公司称此路线解决遥操规模化成本高、仿真数据 sim2real gap 两个痛点（vendor）。
- **WIYH（World In Your Hands）数据集**（2025-12 开源）：宣称全球首个大规模真实世界 **VLTA**（视觉-语言-**触觉**-动作）多模态数据集——在 VLA 三模态外加触觉；10 万+ 真实人类操作视频、40+ 任务类型、100+ 技能、520+ 物品、约 10 类场景，分批发布（vendor/media）。
- **标注体系**：标定 / 深度 / 动作 / 指令 / CoT / mask / 触觉（vendor）。
- **TARS Datacore 数据引擎**：云端大模型，宣称数据全流程**自动化标注**（注意：是"模型做标注"，不是"模型做质量打分/筛选"）（vendor）。
- 公司宣称案例：高杂乱场景任务仅用机器人操作数据成功率 8%，加入 WIYH 人类视频数据后升至 60%（vendor，存疑）。

## 在数采格局中的站位

- 属 UMI 类离机采集范式的**穿戴式**分支（vs 手持夹爪的 UMI/FastUMI；vs [[Galaxea 星海图]] 的单本体遥操路线；vs [[Galbot 银河通用]] 的合成优先路线）。
- 详见 [[Real-robot data collection - teleop vs UMI-class, and the model-in-the-loop quality problem]]。

## Related

- [[AgiBot 智元]] / [[Galaxea 星海图]] / [[Galbot 银河通用]] — 中国具身数据路线三对照
- [[DeepCybo]] — 同样押注人类第一视角数据（PhysBrain），但走"纯视频无轨迹"路线

## tags

#entity #tars #tashi #embodied-ai #china #data-collection #wearable #tactile
