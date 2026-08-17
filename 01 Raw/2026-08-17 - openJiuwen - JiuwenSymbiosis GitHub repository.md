# openJiuwen — JiuwenSymbiosis GitHub repository (raw capture)

- **URL**: https://github.com/openJiuwen-ai/jiuwensymbiosis
- **镜像**: https://gitcode.com/openJiuwen/jiuwensymbiosis
- **Captured**: 2026-08-17（clone 审计，HEAD 为 2026-08-11 `!55 docs: reorganize documentation`）
- **形态**: 代码仓库（非论文）。审计方式 = 本地 clone + 逐文件阅读 + 关键词证据分布统计
- **License**: Apache-2.0；版权头 `Copyright (c) Huawei Technologies Co., Ltd. 2026`
- **规模快照**: 45 stars / 4 forks；源码 24,801 行（.py）+ 测试 19,230 行（124 个测试文件）；141 commits；创建于 2026-06-12

→ 源笔记：[[openJiuwen - JiuwenSymbiosis Physical AI Assistant Framework]]

## 本次核实的关键事实（细节见源笔记）
- 七层架构 Agent→Rails→Tools→API→Env→Hardware；六个内置 Rail 及默认开关
- `exec_mode: "agent"`（默认，每步 LLM）/ `"fast"`（一次规划 + 无 LLM 闭环）
- fast 路径：白名单 AST 符号参数、`track_detect`/`track_grasp` 复合算子、ServoController 四种终止原因、`is_grasp_confirmed` fail-closed 后置条件 + 回 home 重抓
- Trace Feedback Loop 设计文档：在线（DiagnosisRail）/ 离线（聚类→SkillPatchProposal→人审门禁，`target_skill` 恒为 `<unresolved>`）
- 感知 sidecar：GroundingDINO+SAM2，`POST /segment`，选型理由明写 "license-clean"
- 关键词零命中：`continual` / `fine-tune` / `learn` / `checkpoint` / `LoRA` / `dataset` / `reward` / `conformal` / `VLA`；`memory` 7 处全为 in-memory/CUDA-OOM 字面义
- 上游 openjiuwen agent-core 另行审计：源码 491,407 行 + 测试 397,098 行（含 harness 96k / agent_evolving 42k / rsi 41k）；`agent-memory` 独立仓库存在但本仓未引用
- **全仓库无任何 benchmark 与成功率数字**
