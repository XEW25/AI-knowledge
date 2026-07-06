# Huawei（华为）

- **Type**: Entity（公司）
- **相关业务（本库范围）**: **Ascend（昇腾）** AI 加速器 / NPU 产品线，及深度学习数值格式与训练/推理软硬件栈。
- **本库依据**: [[Luo et al. - Ascend HiFloat8 Format for Deep Learning|Ascend HiFloat8]]（Yuanyong Luo 等）的署名机构。

## 与本库的关联
- **HiFloat8 (HiF8)**：一种 8-bit 浮点格式，用可变字段 `dot field` 实现**渐变精度（tapered precision）**——试图用单一格式兼顾 FP8 E4M3/E5M2 各自的精度-动态范围权衡。
- 在 [[Model quantization]] 分类中归**表征设计（数值格式）路线**（Route 1 / FP8 一支）——本库量化簇里少见的"设计新数值格式"方向，与 SmoothQuant / DuQuant 的**分布重塑**路线互补。也是 [[VLA quantization]] 页指出的"尚无 VLA Route-1 例子"的上游母方法。

## Related
- [[Luo et al. - Ascend HiFloat8 Format for Deep Learning]] — 本库所收其工作
- [[Model quantization]] — 表征设计 / FP8 路线

## tags
#entity #org #hardware #quantization #fp8 #china
