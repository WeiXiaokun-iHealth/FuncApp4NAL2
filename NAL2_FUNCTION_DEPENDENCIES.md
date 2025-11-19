# NAL2 函数依赖关系分析

根据 NAL-NL2 SDK 文档，分析每个函数的 Requires 字段，建立正确的调用顺序。

## 依赖关系图

### 基础配置函数（无依赖）

这些函数不依赖其他函数，可以最先调用：

| 序号 | 函数名           | Requires | 说明                       |
| ---- | ---------------- | -------- | -------------------------- |
| 1    | dllVersion       | None     | 获取 DLL 版本              |
| 26   | GetMLE           | None     | 获取麦克风位置效果         |
| 28   | GetTubing_NL2    | None     | 获取导管校正数据           |
| 29   | GetTubing9_NL2   | None     | 获取导管校正数据(9 频率)   |
| 30   | GetVentOut_NL2   | None     | 获取通气孔校正数据         |
| 31   | GetVentOut9_NL2  | None     | 获取通气孔校正数据(9 频率) |
| 32   | Get_SI_NL2       | None     | 计算饱和指数               |
| 33   | Get_SII          | None     | 计算语音清晰度指数         |
| 34   | SetAdultChild    | None     | 设置成人/儿童              |
| 35   | SetExperience    | None     | 设置助听器经验             |
| 36   | SetCompSpeed     | None     | 设置压缩速度               |
| 37   | SetTonalLanguage | None     | 设置语言类型               |
| 38   | SetGender        | None     | 设置性别                   |

### 依赖链 Level 1：依赖基础配置

这些函数依赖基础配置函数（34-38）：

| 序号 | 函数名                   | Requires | 说明                                         |
| ---- | ------------------------ | -------- | -------------------------------------------- |
| 19   | CrossOverFrequencies_NL2 | None     | 计算交叉频率（虽然在依赖链中，但本身无依赖） |
| 17   | SetREURindiv             | None     | 设置 REUR 数据（无依赖）                     |
| 18   | SetREURindiv9            | None     | 设置 REUR 数据(9 频率)（无依赖）             |

### 依赖链 Level 2：依赖 19

这些函数依赖 CrossOverFrequencies_NL2 (19)：

| 序号 | 函数名            | Requires | 说明         |
| ---- | ----------------- | -------- | ------------ |
| 20   | CenterFrequencies | 19       | 计算中心频率 |
| 23   | setBWC            | 19       | 设置带宽校正 |

### 依赖链 Level 3：依赖 23

这些函数依赖 setBWC (23)：

| 序号 | 函数名                   | Requires | 说明                     |
| ---- | ------------------------ | -------- | ------------------------ |
| 21   | CompressionThreshold_NL2 | 23       | 计算压缩阈值             |
| 27   | ReturnValues_NL2         | 23       | 返回 MAF、BWC、ESCD 数据 |

### 依赖链 Level 4：依赖 23, 21, 34-38

这些函数依赖完整的初始化链：

| 序号 | 函数名                   | Requires                             | 说明         |
| ---- | ------------------------ | ------------------------------------ | ------------ |
| 2    | RealEarInsertionGain_NL2 | 23, 21, 34, 35, 36, 37, 38           | 实耳插入增益 |
| 3    | RealEarAidedGain_NL2     | 23, 21, 34, 35, 36, 37, 38           | 实耳辅助增益 |
| 22   | CompressionRatio_NL2     | 23, 21, 34, 35, 36, 37, 38           | 压缩比       |
| 25   | GainAt_NL2               | 23, 17 or 18, 21, 34, 35, 36, 37, 38 | 特定频率增益 |

### RECD 相关依赖链

#### GetRECD 函数依赖 45/46 (如果使用预测值)

| 序号 | 函数名              | Requires                                    | 说明               |
| ---- | ------------------- | ------------------------------------------- | ------------------ |
| 39   | GetRECDh_indiv_NL2  | 43 or 44 (if returning user entered values) | 获取 RECDh         |
| 40   | GetRECDh_indiv9_NL2 | 43 or 44 (if returning user entered values) | 获取 RECDh(9 频率) |
| 41   | GetRECDt_indiv_NL2  | 45 or 46 (if returning user entered values) | 获取 RECDt         |
| 42   | GetRECDt_indiv9_NL2 | 45 or 46 (if returning user entered values) | 获取 RECDt(9 频率) |

#### SetRECD 函数依赖 GetRECD (如果设置预测值)

| 序号 | 函数名              | Requires                                  | 说明               |
| ---- | ------------------- | ----------------------------------------- | ------------------ |
| 43   | SetRECDh_indiv_NL2  | 39 or 40 (if setting to predicted values) | 设置 RECDh         |
| 44   | SetRECDh_indiv9_NL2 | 39 or 40 (if setting to predicted values) | 设置 RECDh(9 频率) |
| 45   | SetRECDt_indiv_NL2  | 41 or 42 (if setting to predicted values) | 设置 RECDt         |
| 46   | SetRECDt_indiv9_NL2 | 41 or 42 (if setting to predicted values) | 设置 RECDt(9 频率) |

#### REDD 相关

| 序号 | 函数名        | Requires                                    | 说明              |
| ---- | ------------- | ------------------------------------------- | ----------------- |
| 11   | GetREDDindiv  | 15 or 16 (if returning user entered values) | 获取 REDD         |
| 12   | GetREDDindiv9 | 15 or 16 (if returning user entered values) | 获取 REDD(9 频率) |
| 15   | SetREDDindiv  | 45 or 46 (if setting predicted values)      | 设置 REDD         |
| 16   | SetREDDindiv9 | 45 or 46 (if setting predicted values)      | 设置 REDD(9 频率) |

#### REUR 相关

| 序号 | 函数名        | Requires                                    | 说明              |
| ---- | ------------- | ------------------------------------------- | ----------------- |
| 13   | GetREURindiv  | 17 or 18 (if returning user entered values) | 获取 REUR         |
| 14   | GetREURindiv9 | 17 or 18 (if returning user entered values) | 获取 REUR(9 频率) |

### 复杂依赖函数

#### 需要 RECD 数据的函数

| 序号 | 函数名                           | Requires                                        | 说明                |
| ---- | -------------------------------- | ----------------------------------------------- | ------------------- |
| 4    | TccCouplerGain_NL2               | 23, 43 or 44, 17 or 18, 21, 34, 35, 36, 37, 38  | 2cc 耦合器增益      |
| 5    | EarSimulatorGain_NL2             | 23, 43 or 44, 17 or 18, 21, 34, 35, 36, 37, 38  | 耳模拟器增益        |
| 7    | TccInputOutputCurve_NL2          | 23, 43 or 44, 17 or 18, 21, 34, 35, 36, 37, 38  | 2cc 耦合器 I/O 曲线 |
| 8    | EarSimulatorInputOutputCurve_NL2 | 23, 43, or 44, 17 or 18, 21, 34, 35, 36, 37, 38 | 耳模拟器 I/O 曲线   |
| 24   | getMPO_NL2                       | 43 or 44 (For type == SSPL)                     | 获取 MPO            |

#### 需要 REDD 数据的函数

| 序号 | 函数名             | Requires                                       | 说明     |
| ---- | ------------------ | ---------------------------------------------- | -------- |
| 9    | Speech_o_Gram_NL2  | 23, 15 or 16, 21, 34, 35, 36, 37, 38           | 语图     |
| 10   | AidedThreshold_NL2 | 23, 15 or 16, 17 or 18, 21, 34, 35, 36, 37, 38 | 辅助阈值 |

#### 不需要 RECD/REDD 的 I/O 曲线

| 序号 | 函数名                      | Requires                             | 说明          |
| ---- | --------------------------- | ------------------------------------ | ------------- |
| 6    | RealEarInputOutputCurve_NL2 | 23, 17 or 18, 21, 34, 35, 36, 37, 38 | 实耳 I/O 曲线 |

## 标准初始化流程（9 步）

根据文档和依赖关系，标准初始化流程应为：

1. **SetAdultChild (34)** - 设置成人/儿童
2. **SetExperience (35)** - 设置助听器经验
3. **SetCompSpeed (36)** - 设置压缩速度
4. **SetTonalLanguage (37)** - 设置语言类型
5. **SetGender (38)** - 设置性别
6. **CrossOverFrequencies_NL2 (19)** - 计算交叉频率
7. **setBWC (23)** - 设置带宽校正
8. **CompressionThreshold_NL2 (21)** - 计算压缩阈值
9. **RealEarInsertionGain_NL2 (2)** - 获取 NAL-NL2 处方

## 测试函数的正确执行顺序

### 组 1: 基础配置（无依赖，可并行）

- dllVersion (1)
- SetAdultChild (34)
- SetExperience (35)
- SetCompSpeed (36)
- SetTonalLanguage (37)
- SetGender (38)

### 组 2: 第一层依赖（依赖组 1）

- CrossOverFrequencies_NL2 (19) - 依赖：无（但逻辑上在配置后）

### 组 3: 第二层依赖（依赖组 2）

- CenterFrequencies (20) - 依赖：19
- setBWC (23) - 依赖：19

### 组 4: 第三层依赖（依赖组 3）

- CompressionThreshold_NL2 (21) - 依赖：23
- ReturnValues_NL2 (27) - 依赖：23

### 组 5: REUR 设置（无依赖，但应在使用前）

- SetREURindiv (17)
- SetREURindiv9 (18)

### 组 6: RECD 设置（需要先 Get 再 Set）

如果使用预测值：

1. GetRECDt_indiv_NL2 (41) 或 GetRECDt_indiv9_NL2 (42)
2. SetRECDt_indiv_NL2 (45) 或 SetRECDt_indiv9_NL2 (46)
3. GetRECDh_indiv_NL2 (39) 或 GetRECDh_indiv9_NL2 (40)
4. SetRECDh_indiv_NL2 (43) 或 SetRECDh_indiv9_NL2 (44)

### 组 7: REDD 设置（需要先 Set 再 Get）

如果使用预测值（依赖 45/46）：

1. SetRECDt 完成后
2. SetREDDindiv (15) 或 SetREDDindiv9 (16)
3. GetREDDindiv (11) 或 GetREDDindiv9 (12)

### 组 8: 核心计算函数（依赖完整初始化链）

- RealEarInsertionGain_NL2 (2) - 依赖：23, 21, 34-38
- RealEarAidedGain_NL2 (3) - 依赖：23, 21, 34-38
- CompressionRatio_NL2 (22) - 依赖：23, 21, 34-38 + centreFreq(从 20 获取)

### 组 9: 需要 RECD 的函数

- TccCouplerGain_NL2 (4) - 依赖：23, 43/44, 17/18, 21, 34-38
- EarSimulatorGain_NL2 (5) - 依赖：23, 43/44, 17/18, 21, 34-38
- getMPO_NL2 (24) - 依赖：43/44 (for SSPL)

### 组 10: I/O 曲线函数

- RealEarInputOutputCurve_NL2 (6) - 依赖：23, 17/18, 21, 34-38
- TccInputOutputCurve_NL2 (7) - 依赖：23, 43/44, 17/18, 21, 34-38
- EarSimulatorInputOutputCurve_NL2 (8) - 依赖：23, 43/44, 17/18, 21, 34-38

### 组 11: 需要 REDD 的函数

- Speech_o_Gram_NL2 (9) - 依赖：23, 15/16, 21, 34-38
- AidedThreshold_NL2 (10) - 依赖：23, 15/16, 17/18, 21, 34-38

### 组 12: REUR Get（依赖 Set）

- GetREURindiv (13) - 依赖：17/18 (if returning user entered values)
- GetREURindiv9 (14) - 依赖：17/18 (if returning user entered values)

### 组 13: 特殊函数

- GainAt_NL2 (25) - 依赖：23, 17/18, 21, 34-38
- GetMLE (26) - 无依赖
- GetTubing_NL2 (28) - 无依赖
- GetTubing9_NL2 (29) - 无依赖
- GetVentOut_NL2 (30) - 无依赖
- GetVentOut9_NL2 (31) - 无依赖
- Get_SI_NL2 (32) - 无依赖
- Get_SII (33) - 无依赖

## 特别注意：CompressionRatio_NL2 的依赖

根据文档，函数 22 (CompressionRatio_NL2) 的参数包括：

- CR[] - 输出参数
- channels - 通道数
- **centreFreq[]** - 每个通道的中心频率数组（Input）
- AC[], BC[] - 听力阈值
- direction, mic, limiting - 配置参数
- ACother[], noOfAids - 其他耳朵数据

**关键点**：centreFreq 是输入参数，需要从函数 20 (CenterFrequencies) 获取！

### 函数 22 的正确执行顺序：

1. 执行 CrossOverFrequencies_NL2 (19) → 获取 CFArray
2. 执行 CenterFrequencies (20，传入 CFArray) → 获取 centreFreq
3. 执行 setBWC (23)
4. 执行 CompressionRatio_NL2 (22，传入 centreFreq)

## 推荐的完整测试顺序

```
# 阶段1: 基础初始化
1. dllVersion (1)
34. SetAdultChild (34)
35. SetExperience (35)
36. SetCompSpeed (36)
37. SetTonalLanguage (37)
38. SetGender (38)

# 阶段2: 频率相关初始化
19. CrossOverFrequencies_NL2 (19)
20. CenterFrequencies (20) - 使用19的结果
23. setBWC (23) - 使用19的结果
21. CompressionThreshold_NL2 (21)

# 阶段3: REUR设置
17. SetREURindiv (17)
18. SetREURindiv9 (18)
13. GetREURindiv (13)
14. GetREURindiv9 (14)

# 阶段4: RECD设置
41. GetRECDt_indiv_NL2 (41)
42. GetRECDt_indiv9_NL2 (42)
45. SetRECDt_indiv_NL2 (45)
46. SetRECDt_indiv9_NL2 (46)
39. GetRECDh_indiv_NL2 (39)
40. GetRECDh_indiv9_NL2 (40)
43. SetRECDh_indiv_NL2 (43)
44. SetRECDh_indiv9_NL2 (44)

# 阶段5: REDD设置
15. SetREDDindiv (15)
16. SetREDDindiv9 (16)
11. GetREDDindiv (11)
12. GetREDDindiv9 (12)

# 阶段6: 核心计算函数
2. RealEarInsertionGain_NL2 (2)
3. RealEarAidedGain_NL2 (3)
22. CompressionRatio_NL2 (22) - 使用20的centreFreq结果

# 阶段7: 需要RECD的函数
4. TccCouplerGain_NL2 (4)
5. EarSimulatorGain_NL2 (5)
24. getMPO_NL2 (24)

# 阶段8: I/O曲线
6. RealEarInputOutputCurve_NL2 (6)
7. TccInputOutputCurve_NL2 (7)
8. EarSimulatorInputOutputCurve_NL2 (8)

# 阶段9: 需要REDD的函数
9. Speech_o_Gram_NL2 (9)
10. AidedThreshold_NL2 (10)

# 阶段10: 其他函数
25. GainAt_NL2 (25)
26. GetMLE (26)
27. ReturnValues_NL2 (27)
28. GetTubing_NL2 (28)
29. GetTubing9_NL2 (29)
30. GetVentOut_NL2 (30)
31. GetVentOut9_NL2 (31)
32. Get_SI_NL2 (32)
33. Get_SII (33)
```

## 总结

1. **初始化顺序很重要**：必须先完成 34-38 的配置，再执行 19, 23, 21
2. **CompressionRatio_NL2 (22) 特别需要注意**：需要先执行 20 获取 centreFreq
3. **RECD/REDD/REUR 有依赖关系**：通常需要先 Set 再 Get，或者先 GetPredicted 再 SetPredicted
4. **并非所有函数都需要完整初始化**：有些函数（如 26-33）完全独立，可以单独测试

## 建议的 Web 端实现

Web 端应该实现一个智能的依赖管理系统：

1. 维护一个全局状态，记录已完成的初始化步骤
2. 对于每个测试函数，检查其依赖是否已满足
3. 如果依赖未满足，自动执行依赖链
4. 缓存依赖函数的结果（如 CrossOverFrequencies 的结果），供后续函数使用
