# 2026-08-06 · Raw · FAR: Failure-Aware Retry for Test-Time Recovery and Continual Policy Improvement

- **Tier**: URL-only(未下载 PDF;HTML 正文自读)
- **arXiv**: https://arxiv.org/abs/2607.01111 · HTML: https://arxiv.org/html/2607.01111v1
- **Source note**: [[FAR - Failure-Aware Retry for Test-Time Recovery and Continual Policy Improvement]]
- Keywords(原文): Robot Manipulation, Failure Recovery, **Test-time Adaptation**

## 已核实事实(自读,2026-08-06)

### 问题设定
- 机器人策略部署必然遇到失败;**朴素重试只会重复同样的错误**;失败状态**很少被离线演示覆盖、对预训练策略是 OOD**
- 现有恢复方法**多依赖人工介入**来纠正行为并采数据 —— FAR 明确定位于**自主**

### 四个部件
1. **价值估计(IQL)**:采用 **IQL 的价值学习目标**,同时训 **Q-function `Q_φ`** 与 **value function `V_ψ`**;用**时序价值差(temporal value difference)** 定位**失败诱因动作**
2. **FCPA(Failure-Contrastive Preference Adaptation)**:用失败经验**构造偏好学习信号** —— 失败诱因动作作负例 + **替代正例**,更新策略使其**避开先前不成功的行为**
3. **轻量动作扰动**:FCPA **受限于离线策略的 support**;重试时向执行动作**注入轻量扰动**以在 OOD 状态做**局部探索**扩展 support。**仿真中简单高斯扰动通常已足够**
4. **持续策略改进**:**成功的恢复轨迹进 replay buffer** → 训练循环。原文:*"successful recovery trajectories provide supervision on **hard states where the initial policy fails**, improving both policy robustness **and value estimation** over time"*

### 评测
- **3 个仿真 benchmark / 9 个操作任务**;每任务 **50 eval episodes**,**每 episode 最多 5 次尝试**,**3 个随机种子**报均值与标准差
- **3 个真机任务**,**7-DoF xArm**;每任务 **20 episodes**,**每 episode 最多 3 次尝试**
- ⚠️ 未用 LIBERO / CALVIN / RoboCasa(0 命中),为自选/自建仿真环境

### 结果
- 相对**标准 diffusion policy** 平均增益:**仿真 +17.6%**、**真机 +11.7%**
- **"enables recovery without environment resets"** —— 无需环境复位
- **持续改进阶段数据效率显著提升**,在 **reset budget 与 timestep budget 两种预算下**皆然,靠"**利用信息量大的失败案例**"
- **减少对人工介入的需求**

## 未核实 / 注意
- `LoRA` 全文 22 次命中**均在参考文献**,**方法中未使用**(已核对上下文)
- 作者与机构未在提取中定位;代码发布情况未查
- 自建仿真环境的具体名称未逐项核实
