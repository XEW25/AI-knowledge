# RLinf — RPent GitHub repository (raw capture)

- **URL**: https://github.com/RLinf/RPent
- **Captured**: 2026-08-17（clone 审计，浅克隆 HEAD `66c0822 docs: update Dashboard session documentation (#70)`，pushed 2026-08-13）
- **形态**: 代码仓库（非论文）。审计方式 = 本地 clone + 逐文件阅读 + 关键词证据分布统计
- **License**: **⚠️ 无 LICENSE 文件**（`pyproject.toml` 第 12 行声明 `license = {file = "LICENSE"}` 但文件不存在；母项目 RLinf/RLinf 4527 stars 为 Apache-2.0，疑为疏漏）
- **规模快照**: 279 stars；源码 12,611 行（59 个 .py）+ `robots/libero` 5,343 行；commits ≥30（浅克隆截断）；创建于 2026-07-07；分类器自标 `Development Status :: 2 - Pre-Alpha`

→ 源笔记：[[RLinf - RPent Recursive Physical Agent Framework]]

## 本次核实的关键事实（细节见源笔记）
- **RPent 就是 Harness VLA 的代码仓**：README 明写 *"Our first RPent publication, Harness VLA…"*，引用条目 `zhang2026harnessvla`；项目页 harnessvla.github.io 唯一 GitHub 链接指向它（页面 Code 按钮仍标 coming soon）
- planner = 编码 agent 产品经 MCP：依赖 `claude-agent-sdk>=0.1.60`、`openai-codex>=0.1.0b3`
- **harness 行为在 markdown 不在代码**：Python 中 `staging`/`precondition`/`postcondition`/`verif` 命中 0、`recover` 1；guides/prompts 中 `recover` 25、`memory` 52
- 记忆两层设计（audit JSON + recipe JSONL / MEMORY.md 索引的跨任务笔记），托管于 HF 数据集 `RLinf/RPent-memory`，**写入需 maintainer 人审、无自助上传**
- 环境仅 LIBERO；`hardware`/`real robot` 命中 0；无 tests 目录
- `segment`（SAM3）工具把分割叠加图 `_image_bytes` 返回给多模态 planner（planner 能目视核对 mask）
