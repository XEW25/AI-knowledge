const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5

// ---------- palette (light theme) ----------
const BG      = "FFFFFF";
const CONT    = "F5F8FD";
const BAND    = "E9EFF9";
const CARD    = "FFFFFF";
const CARDLN  = "AABCDF";
const EVO     = "EEF7F5";
const EVOBOX  = "DCEFEA";
const EVOLN   = "6FB0A8";
const DARK    = "1F2937"; // heading text
const ICE     = "3A4A63"; // body text
const MUTED   = "6E7B93"; // captions / arrows
const AMBER   = "D97706"; // the four features
const SIDELN  = "9AA8C4"; // sidecar dashed border
const F_CJK   = "Microsoft YaHei";

const slide = pres.addSlide();
slide.background = { color: BG };

function box(x, y, w, h, fill, line, radius) {
  slide.addShape("roundRect", { x, y, w, h, fill: { color: fill },
    line: line ? { color: line.c, width: line.w, dashType: line.d || "solid" } : { type: "none" },
    rectRadius: radius === undefined ? 0.05 : radius });
}
function txt(runs, x, y, w, h, opts) {
  slide.addText(runs, Object.assign({ x, y, w, h, margin: 0, fontFace: F_CJK,
    valign: "top", align: "left" }, opts || {}));
}
function arrow(x1, y1, x2, y2, color, width, dash, both) {
  slide.addShape("line", {
    x: Math.min(x1, x2), y: Math.min(y1, y2),
    w: Math.abs(x2 - x1), h: Math.abs(y2 - y1),
    flipH: x2 < x1, flipV: y2 < y1,
    line: Object.assign({ color: color, width: width || 1.2, endArrowType: "triangle",
      dashType: dash || "solid" }, both ? { beginArrowType: "triangle" } : {}) });
}

// ---------- title row (user wording: subtitle removed) ----------
txt([{ text: "具身 Agent 系统逻辑架构", options: { bold: true, color: DARK, fontSize: 25 } }],
    0.45, 0.22, 9.6, 0.55, { valign: "middle" });
txt([{ text: "★ 琥珀色 = 待建的四个特性", options: { color: AMBER, fontSize: 10.5, bold: true } }],
    9.6, 0.32, 3.28, 0.35, { align: "right", valign: "middle" });

// ================= runtime container =================
box(0.45, 0.92, 8.88, 5.66, CONT, { c: CARDLN, w: 1, d: "dash" }, 0.06);
txt([{ text: "运行时通道", options: { bold: true, color: DARK, fontSize: 11.5 } },
     { text: "（机器人执行任务时 · 在线）", options: { color: MUTED, fontSize: 9.5 } }],
    0.65, 1.0, 8.5, 0.3);

// ---- Band A: planner ----
box(0.65, 1.32, 8.48, 0.62, BAND, { c: CARDLN, w: 0.75 });
txt([{ text: "决策层  LLM / VLM Planner", options: { bold: true, color: DARK, fontSize: 12 } },
     { text: "    agent 模式：每步决策（大脑）  ｜  fast 模式：一次编译，此后无 LLM（小脑）",
       options: { color: ICE, fontSize: 9.5 } }],
    0.85, 1.32, 8.1, 0.62, { valign: "middle" });

// arrows A<->B
arrow(1.7, 1.96, 1.7, 2.28, MUTED, 1.4);
txt([{ text: "工具调用", options: { color: MUTED, fontSize: 8 } }], 1.82, 2.0, 1.2, 0.24);
arrow(8.05, 2.28, 8.05, 1.96, MUTED, 1.4);
txt([{ text: "诊断 · 记忆 · 观测注入", options: { color: MUTED, fontSize: 8 } }], 6.35, 2.0, 1.62, 0.24, { align: "right" });

// ---- Band B: rails (user wording) ----
box(0.65, 2.3, 8.48, 1.6, "E2E9F7", { c: CARDLN, w: 0.75 });
txt([{ text: "Rail 拦截层", options: { bold: true, color: DARK, fontSize: 10.5 } },
     { text: "（挂在工具调用的边界 · 可开关）", options: { color: MUTED, fontSize: 8.5 } }],
    0.85, 2.36, 8.1, 0.26);

const railY = 2.72, railH = 1.1, railW = 1.325, railGap = 0.075;
const rails = [
  { t: "SafetyRail", tag: "拦截", d: "事前否决越界指令（空间范围 / 边界 / 关节）", star: false },
  { t: "① DetectionRail", tag: "裁决", d: "模型预测+后置规则，根据世界输入检测工具调用状态（成功/失败/执行中/卡住），常驻进程", star: true },
  { t: "② RecoveryRail", tag: "善后", d: "重试流程：基于轨迹回归初始状态  基于成功记忆调整状态  重试  上报", star: true },
  { t: "DiagnosisRail", tag: "转述", d: "失败＋因果链注入下一轮，驱动重规划", star: false },
  { t: "③ MemoryRail", tag: "记忆", d: "读：经验注入决策；写：导出过程性 recipe", star: true },
  { t: "TraceRail", tag: "立案", d: "全程结构化记录", star: false },
];
rails.forEach((r, i) => {
  const x = 0.68 + i * (railW + railGap);
  box(x, railY, railW, railH, CARD, r.star ? { c: AMBER, w: 1.5 } : { c: CARDLN, w: 0.75 });
  txt([
    { text: r.t + (r.star ? " ★" : ""), options: { bold: true, color: r.star ? AMBER : DARK, fontSize: 9, breakLine: true } },
    { text: "「" + r.tag + "」", options: { bold: true, color: ICE, fontSize: 8.5, breakLine: true } },
    { text: r.d, options: { color: ICE, fontSize: 7.6 } },
  ], x + 0.08, railY + 0.07, railW - 0.16, railH - 0.14);
});
[1, 2].forEach(i => {
  const x = 0.68 + (i + 1) * (railW + railGap) - railGap - 0.005;
  txt([{ text: "▶", options: { color: AMBER, fontSize: 9, bold: true } }], x - 0.02, railY + railH / 2 - 0.11, 0.12, 0.2);
});

// arrows B<->C (tools band is narrower: x0.65..6.75)
arrow(1.7, 3.92, 1.7, 4.18, MUTED, 1.4);
txt([{ text: "原语 / 算子调用", options: { color: MUTED, fontSize: 8 } }], 1.82, 3.93, 1.4, 0.22);
arrow(6.3, 4.18, 6.3, 3.92, MUTED, 1.4);
txt([{ text: "结构化返回（终止原因＋监控统计）", options: { color: MUTED, fontSize: 8 } }], 3.76, 3.93, 2.42, 0.22, { align: "right" });

// ---- Band C: tool layer ----
box(0.65, 4.2, 6.1, 1.24, BAND, { c: CARDLN, w: 0.75 });
txt([{ text: "工具层", options: { bold: true, color: DARK, fontSize: 10.5 } },
     { text: "（Rail 拦在这一层的调用边界）", options: { color: MUTED, fontSize: 8.5 } }],
    0.85, 4.26, 5.8, 0.26);

// atomic primitives (user wording)
box(0.78, 4.54, 1.4, 0.82, CARD, { c: CARDLN, w: 0.75 });
txt([
  { text: "原子动作原语", options: { bold: true, color: DARK, fontSize: 9.5, breakLine: true } },
  { text: "goto_xyzr · 夹爪…\n一次到位", options: { color: ICE, fontSize: 8 } },
], 0.88, 4.62, 1.2, 0.68);

// compound ops (user wording)
box(2.3, 4.54, 3.42, 0.82, CARD, { c: CARDLN, w: 0.75 });
txt([
  { text: "复合算子（内部藏高频闭环）  ", options: { bold: true, color: DARK, fontSize: 9 } },
  { text: "伺服环 track_grasp ｜ vla_until（π0.5 chunk 循环）", options: { color: ICE, fontSize: 8 } },
], 2.42, 4.6, 3.2, 0.3);
box(2.42, 4.94, 3.18, 0.36, "FFF6E2", { c: AMBER, w: 1.25, d: "dash" });
txt([
  { text: "★①′ 算子内监控（事中 · 策略侧）：", options: { bold: true, color: AMBER, fontSize: 7.5, breakLine: true } },
  { text: "无进展检查 · chunk 时序一致性 · 逐 chunk 安全 · 带原因中止", options: { color: ICE, fontSize: 7.5 } },
], 2.52, 4.97, 3.0, 0.3, { valign: "middle" });

// other tools
box(5.84, 4.54, 0.82, 0.82, CARD, { c: CARDLN, w: 0.75 });
txt([
  { text: "其他工具", options: { bold: true, color: DARK, fontSize: 9, breakLine: true } },
  { text: "感知 · 查询 · 代码", options: { color: ICE, fontSize: 7.6 } },
], 5.92, 4.62, 0.68, 0.68);

// arrows C<->D
arrow(1.5, 5.46, 1.5, 5.66, MUTED, 1.4);
txt([{ text: "位姿 / 动作流", options: { color: MUTED, fontSize: 8 } }], 1.62, 5.46, 1.3, 0.18);
arrow(5.9, 5.66, 5.9, 5.46, MUTED, 1.4);
txt([{ text: "帧 · 本体感受", options: { color: MUTED, fontSize: 8 } }], 4.56, 5.46, 1.22, 0.18, { align: "right" });

// ---- Band D: embodiment access layer ----
box(0.65, 5.68, 6.1, 0.76, BAND, { c: CARDLN, w: 0.75 });
txt([{ text: "本体接入层", options: { bold: true, color: DARK, fontSize: 10 } },
     { text: "（纵链通向硬件）", options: { color: MUTED, fontSize: 8.5 } }],
    0.85, 5.72, 5.8, 0.22);
box(0.78, 5.94, 3.55, 0.44, CARD, { c: CARDLN, w: 0.75 });
txt([
  { text: "Env / Driver", options: { bold: true, color: DARK, fontSize: 9, breakLine: true } },
  { text: "API(Mixin) → Env(状态 · 观测 · 安全边界) → Driver(厂商协议) → 硬件", options: { color: ICE, fontSize: 7.6 } },
], 0.88, 5.98, 3.35, 0.38);
box(4.45, 5.94, 2.15, 0.44, CARD, { c: CARDLN, w: 0.75 });
txt([
  { text: "能力档案", options: { bold: true, color: DARK, fontSize: 9, breakLine: true } },
  { text: "实例级只可收窄 · 决定序列的编译粒度", options: { color: ICE, fontSize: 7.6 } },
], 4.55, 5.98, 1.95, 0.38);

// ---- sidecar column (lateral services) ----
box(7.15, 4.2, 1.98, 2.18, CARD, { c: SIDELN, w: 1, d: "dash" }, 0.05);
txt([{ text: "侧挂服务", options: { bold: true, color: DARK, fontSize: 9.5, breakLine: true } },
     { text: "独立子进程 · 被工具按需调用", options: { color: MUTED, fontSize: 7.8 } }],
    7.27, 4.27, 1.74, 0.44);
box(7.27, 4.78, 1.74, 0.62, EVOBOX, { c: EVOLN, w: 0.75 });
txt([
  { text: "感知服务子进程", options: { bold: true, color: DARK, fontSize: 8.8, breakLine: true } },
  { text: "GroundingDINO+SAM2 → 数字坐标", options: { color: ICE, fontSize: 7.6 } },
], 7.37, 4.84, 1.54, 0.52);
box(7.27, 5.62, 1.74, 0.62, EVOBOX, { c: EVOLN, w: 0.75 });
txt([
  { text: "VLA 服务子进程", options: { bold: true, color: DARK, fontSize: 8.8, breakLine: true } },
  { text: "π0.5 策略服务 · chunk 接口", options: { color: ICE, fontSize: 7.6 } },
], 7.37, 5.68, 1.54, 0.52);
// lateral double-headed arrows: tool layer <-> sidecars
arrow(6.79, 4.98, 7.11, 5.06, MUTED, 1.3, "solid", true);
arrow(6.79, 5.32, 7.11, 5.86, MUTED, 1.3, "solid", true);

// ================= evolution container (unchanged wording) =================
box(9.72, 0.92, 3.16, 5.66, EVO, { c: EVOLN, w: 1, d: "dash" }, 0.06);
txt([{ text: "演进通道", options: { bold: true, color: DARK, fontSize: 11.5 } },
     { text: "（任务之间 · 离线）", options: { color: MUTED, fontSize: 9.5 } }],
    9.88, 1.0, 2.85, 0.3);

function evoBox(y, h, runs, accent) {
  box(9.88, y, 2.84, h, accent ? "FFF6E2" : EVOBOX, accent ? { c: AMBER, w: 1.5 } : { c: EVOLN, w: 0.75 });
  txt(runs, 9.98, y + 0.06, 2.64, h - 0.12);
}
evoBox(1.38, 0.52, [
  { text: "Trace 证据库", options: { bold: true, color: DARK, fontSize: 9.5, breakLine: true } },
  { text: "步骤 · Rail 事件 · 帧 · 成功信号", options: { color: ICE, fontSize: 7.8 } }]);
arrow(11.3, 1.9, 11.3, 2.12, MUTED, 1.2);
evoBox(2.14, 0.52, [
  { text: "失败签名归一化 · 聚类", options: { bold: true, color: DARK, fontSize: 9.5, breakLine: true } },
  { text: "数字→⟨num⟩ · 按量级分桶", options: { color: ICE, fontSize: 7.8 } }]);
arrow(11.3, 2.66, 11.3, 2.88, MUTED, 1.2);
evoBox(2.9, 0.52, [
  { text: "改进提案", options: { bold: true, color: DARK, fontSize: 9.5, breakLine: true } },
  { text: "技能补丁 · 参数约束 · 新课程", options: { color: ICE, fontSize: 7.8 } }]);
arrow(11.3, 3.42, 11.3, 3.64, MUTED, 1.2);
evoBox(3.66, 1.12, [
  { text: "④ 持续学习 ★", options: { bold: true, color: AMBER, fontSize: 10.5, breakLine: true } },
  { text: "自动应用 · 回滚 · A/B 验收", options: { color: ICE, fontSize: 8.2, breakLine: true } },
  { text: "闸门 = ①的信号质量：", options: { bold: true, color: AMBER, fontSize: 8.2, breakLine: true } },
  { text: "信号弱 → 只能留人审\n信号强 → 才可撤掉人", options: { color: ICE, fontSize: 8 } }], true);
arrow(11.3, 4.82, 11.3, 5.12, MUTED, 1.2);
evoBox(5.18, 0.66, [
  { text: "回写", options: { bold: true, color: DARK, fontSize: 9.5, breakLine: true } },
  { text: "SKILL.md · 记忆库 · 策略权重", options: { color: ICE, fontSize: 8 } }]);

// cross-channel arrows
arrow(9.33, 3.1, 9.72, 1.75, AMBER, 1.6);
txt([{ text: "Trace 上行", options: { color: AMBER, fontSize: 8, bold: true } }], 9.24, 2.32, 0.62, 0.36);
arrow(9.88, 5.55, 9.38, 6.42, AMBER, 1.6);
txt([{ text: "新技能 / 新经验 下行 → ③ 读取", options: { color: AMBER, fontSize: 8, bold: true } }],
    7.05, 6.41, 2.25, 0.16, { align: "right" });

// ================= bottom collaboration strip (user wording) =================
box(0.45, 6.72, 12.43, 0.56, "EEF2FA", { c: CARDLN, w: 0.75 }, 0.04);
txt([
  { text: "协同主线：", options: { bold: true, color: DARK, fontSize: 10.5 } },
  { text: "① ", options: { bold: true, color: AMBER, fontSize: 10.5 } },
  { text: "造出失败信号（边界裁决＋算子内监控）→ ", options: { color: ICE, fontSize: 10 } },
  { text: "② ", options: { bold: true, color: AMBER, fontSize: 10.5 } },
  { text: "就地恢复，不可恢复经「转述」上报重规划 → 全程「立案」→ ", options: { color: ICE, fontSize: 10 } },
  { text: "④ ", options: { bold: true, color: AMBER, fontSize: 10.5 } },
  { text: "离线沉淀 → 回写技能与记忆 → ", options: { color: ICE, fontSize: 10 } },
  { text: "③ ", options: { bold: true, color: AMBER, fontSize: 10.5 } },
  { text: "注入下次决策。", options: { color: ICE, fontSize: 10, breakLine: true } },
  { text: "检测（①）是其余三个特性的前置条件——先深化检测，再谈自演进。", options: { bold: true, color: AMBER, fontSize: 10 } },
], 0.7, 6.72, 11.95, 0.56, { valign: "middle" });

slide.addNotes("具身 Agent 系统逻辑架构（拓扑修正版）：运行时通道自上而下为 决策层 → Rail 拦截层 → 工具层（原子动作原语 / 复合算子含①′算子内监控 / 其他工具）→ 本体接入层（Env/Driver 纵链 + 能力档案）；感知与 VLA 两个服务子进程侧挂在工具层旁，被工具按需调用（不在主纵链上）。右侧演进通道：Trace→聚类→提案→④持续学习（闸门=①信号质量）→回写。");

pres.writeFile({ fileName: "embodied-agent-arch2.pptx" }).then(() => console.log("written"));
