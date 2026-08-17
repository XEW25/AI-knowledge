# PPT diagram workflow（本机画图流程）

> 类别：System 操作文档（同 [[Vault linting]]）。记录在这台 Windows 机器上用代码生成、QA、迭代 PPT 架构图的完整流程。首次建立于 2026-08-17（具身 Agent 系统逻辑架构图）。

## 流程（五步循环）

1. **生成**：写 pptxgenjs 脚本（node）。pptxgenjs 未全局安装，先在工作目录 `npm install pptxgenjs`。
2. **渲染 QA**：本机**没有 LibreOffice**；用 **PowerPoint COM** 导出 PNG（保真度也更高）：
   ```powershell
   $ppt = New-Object -ComObject PowerPoint.Application
   $pres = $ppt.Presentations.Open($src, $true, $false, $false)
   $pres.Slides.Item(1).Export($out, "PNG", 1920, 1080)
   $pres.Close(); $ppt.Quit()
   ```
3. **看图修版**：检查溢出、CJK 断字（手动 `breakLine` 控制换行点）、元素碰撞 → 改脚本 → 重渲，收敛为止。
4. **交付**：成品放**库根目录、中文文件名**（与既有 `架构图.pptx` 等同处，不进 git）；生成器脚本存 `scripts/pptx/`（进 git，保证可重生成）。
5. **迭代**：**改版前必须先提取现文件全部文本**（用户会直接在 pptx 里改措辞）：
   ```python
   from pptx import Presentation
   for sh in Presentation(f).slides[0].shapes:
       if sh.has_text_frame: print(sh.left, sh.top, sh.text_frame.text)
   ```
   把用户的删改合并进脚本后再动版式。

## 本机事实与坑（一次性踩完）

- **⚠️ pptxgenjs 负 extent 陷阱**：向上/向左的箭头直接算负 `w`/`h` 会写出负 `<a:ext>`——zip 完好、XML 合法、**但 PowerPoint 拒开并报 "corrupted (0x80070570)"**（极像路径/文件系统错误）。修法：包围盒归一化 + `flipH`/`flipV`（见脚本内 `arrow()` 封装）。排查：正则查 slide XML 里 `<a:ext cx="-`。
- **⚠️ pptx skill 的 validate.py 在中文 locale 下假阳**：它用 GBK 读 XML，含中文的 slide 全报解码错误。改用 `zipfile.testzip()` + defusedxml 显式 UTF-8 解析验证。
- 中文字体统一 `Microsoft YaHei`；COM 渲染即真实效果，QA 可信。
- pptxgenjs 其余坑（色值不带 `#`、`LAYOUT_WIDE`、选项对象不可复用等）见 pptx skill 自带文档。

## 风格约定（本库）

- **白底 + 淡彩色块 + 深色文字 + 虚线分组边框**（参照根目录 `架构图.pptx`）；不用深色底。
- **琥珀色 = 待建组件**的标注惯例（具身 Agent 图中 = 四特性）。
- 16:9 `LAYOUT_WIDE`（13.33″×7.5″）。

## 生成器索引

| 成品（库根，不进 git） | 生成器（进 git） |
|---|---|
| `具身Agent系统逻辑架构.pptx` | `scripts/pptx/gen_embodied_agent_arch.js` |

新图沿用同一模式：一图一脚本，脚本进此表。
