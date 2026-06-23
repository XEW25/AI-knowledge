# Ascend HiFloat8 Format for Deep Learning

- Raw note: [[2026-04-13 - Luo et al. - Ascend HiFloat8 Format for Deep Learning]]

## Metadata
- Type: source note
- Format: arXiv paper / preliminary white paper
- Authors: [[Yuanyong Luo]] and collaborators
- Organization: [[Huawei]]
- Date accessed: 2026-04-13
- Original URL: https://arxiv.org/abs/2409.16626
- PDF URL: https://arxiv.org/pdf/2409.16626
- Local PDF: [[2026-04-13 - Luo et al. - Ascend HiFloat8 Format for Deep Learning.pdf]] (arXiv v2, kept in `01 Raw/`)
- Related: [[Model quantization]]
- Tags: #quantization #fp8 #low-bit-training #number-formats #inference #training

## Summary
This paper proposes HiFloat8 (HiF8), a new 8-bit floating-point format for deep learning training and inference. The paper is motivated by a practical problem in FP8 systems: the usual formats E4M3 and E5M2 each optimize one side of the precision-versus-range tradeoff, so practical training often needs both. HiF8 attempts to reduce that awkwardness by using a single variable-structure format with tapered precision and denormal-range extension.

The most important design idea is the `dot field`, which determines how many bits go to exponent and mantissa depending on the encoded region. This makes HiF8 a kind of structured, hardware-conscious tapered-precision float. The paper also argues that rounding design matters just as much as the format itself, and introduces a hybrid rounding strategy for backward pass behavior.

## Visualization
[[hif8_value_density.html|HiF8 ↔ FP8 representable-value density (interactive)]] — values per octave (binade) on a log₂ axis, comparing HiF8 against FP8 E4M3 / E5M2, with each format's precision-change boundaries labelled on the x-axis. Hover any octave to read its actual representable values. It makes the `dot field`'s tapered precision concrete: HiF8 carries 8 values/octave near the centre (where data concentrates) and tapers to 2→1 toward the extremes, spending the same 256-code budget as flat E4M3 (dense but narrow) and E5M2 (wide but coarse). Built by enumerating all 256 codes, so it is exact — including the top-octave dips where a code is spent on NaN (E4M3, 2⁸) or Inf (HiF8, 2¹⁵).

## Key claims
1. Standard FP8 formats force an unsatisfying precision/range tradeoff.
2. HiF8’s variable field allocation gives a better balance between dynamic range and local precision.
3. A single 8-bit format may replace some dual-format FP8 training practices.
4. In simulation, HiF8 often matches FP16 mixed-precision training across traditional models and LLMs.

## Why it matters
This source is important because it pushes beyond generic “quantization” and into the design of low-bit numeric formats themselves. It is especially relevant for the part of the quantization problem that touches training stability, dynamic range, and hardware-friendly representation.

For this vault, the paper looks like a strong seed source for a broader `Model quantization` topic, especially around:
- FP8 format design
- low-bit training
- precision/range tradeoffs
- training-friendly numerical representations

## What feels strong
- The paper addresses a real engineering pain point in FP8 practice.
- The `dot field` is a genuinely distinctive design idea.
- The paper treats rounding and scaling as part of the format story, not afterthoughts.
- The evaluation spans both traditional networks and LLMs.

## What feels limited
- All evidence is simulated rather than native-hardware evidence.
- The claimed wins are often “close to FP16” rather than an obviously dominant leap.
- The setup remains mixed precision; it is not proof of fully native 8-bit end-to-end superiority.
- It is a vendor-authored white-paper-style format proposal, so broader independent validation still matters.

## Ada’s notes
The most valuable thing here is not “Huawei has another FP8-like format,” but the broader idea that low-bit training may benefit from format designs that abandon fixed exponent/mantissa allocation. This paper belongs more to the line of `numeric representation design for low-bit training` than to generic post-training quantization.

If more sources in this direction are added later, this paper will likely sit near the beginning of a subcluster around:
- FP8 and float-like low-bit formats
- tapered precision
- training-time numerical robustness
- calibration and scaling strategies

## Questions worth following up
1. How does HiF8 compare with other tapered-precision or vendor-specific low-bit formats?
2. Which benefits come from the format itself versus from the scaling/rounding recipe?
3. How well would the claims survive on real hardware rather than simulation?
4. When does format design matter more than quantization/calibration strategy?

## Possible downstream vault work
- Seed the topic page [[Model quantization]]
- Later compare this with other FP8 / low-bit training papers
- Potentially add concept pages for FP8 formats or low-bit training once the cluster is denser
