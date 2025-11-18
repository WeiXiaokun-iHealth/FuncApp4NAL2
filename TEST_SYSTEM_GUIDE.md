# NAL2 网页测试系统使用指南

## 概述

NAL2 网页测试系统提供了一个可视化界面，用于批量测试所有 46 个 NAL2 函数。系统通过 WebSocket 与 React Native 应用通信，实现自动化测试流程。

## 系统架构

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  网页测试界面   │ ←─WS─→  │  Node.js服务器  │ ←─WS─→  │  RN移动应用     │
│  test.html      │         │  server.js      │         │  App.js         │
└─────────────────┘         └─────────────────┘         └─────────────────┘
        │                            │                            │
        │                            │                            │
        ▼                            ▼                            ▼
  显示测试结果              管理测试数据                  执行NAL2函数
```

## 快速开始

### 1. 启动服务器

```bash
cd server
npm install
node server.js
```

服务器启动后会显示：

```
NAL2参数服务器运行在: http://localhost:3000
WebSocket服务器运行在: ws://localhost:3000
局域网访问: http://172.29.1.253:3000
测试页面: http://172.29.1.253:3000/test
```

### 2. 启动移动应用

```bash
npm run android
# 或
yarn android
```

确保应用成功启动并显示"WebSocket 已连接"状态。

### 3. 打开测试页面

在浏览器中访问：

```
http://localhost:3000/test
```

或局域网访问：

```
http://172.29.1.253:3000/test
```

## 测试界面说明

### 界面元素

1. **头部信息**

   - 显示系统标题和说明
   - 进度条显示测试进度

2. **控制面板**

   - 🎬 **运行所有测试** - 一键运行 46 个测试
   - 🗑️ **清空结果** - 清除所有测试结果
   - 过滤按钮 - 按状态筛选测试（全部/通过/失败）

3. **统计信息**

   - 总计 - 全部测试数量
   - ✅ 通过 - 成功的测试数量
   - ❌ 失败 - 失败的测试数量

4. **测试列表**
   - 实时显示每个测试的状态
   - 显示测试耗时
   - 失败测试显示错误信息

### 测试状态说明

- ⏳ **等待中** - 测试尚未开始（灰色）
- 🔄 **运行中** - 测试正在执行（黄色）
- ✅ **通过** - 测试成功完成（绿色）
- ❌ **失败** - 测试执行失败（红色）

## 测试流程

### 自动化测试流程

1. 点击"运行所有测试"按钮
2. 系统自动读取 `input_json_data/` 目录下的 46 个 JSON 文件
3. 按顺序逐个发送测试请求到移动应用
4. 移动应用调用 NAL2 函数并返回结果
5. 网页实时显示测试进度和结果
6. 完成后生成测试报告

### 单个测试流程

```
网页 → 服务器 → App → NAL2Bridge → NAL2Module → NAL2 SDK
                  ↓
         测试结果 ← ← ← ← ← ← ← ← ← ← ← ← ←
```

## 测试数据

测试数据位于 `input_json_data/` 目录，包含 46 个 JSON 文件：

### 测试文件格式

```json
{
  "sequence_num": 1,
  "function": "dllVersion",
  "input_parameters": {}
}
```

### 测试覆盖范围

1. **基础函数** (1 个)

   - dllVersion

2. **增益计算** (4 个)

   - RealEarInsertionGain_NL2
   - RealEarAidedGain_NL2
   - TccCouplerGain_NL2
   - EarSimulatorGain_NL2

3. **I/O 曲线** (3 个)

   - RealEarInputOutputCurve_NL2
   - TccInputOutputCurve_NL2
   - EarSimulatorInputOutputCurve_NL2

4. **语音和阈值** (2 个)

   - Speech_o_Gram_NL2
   - AidedThreshold_NL2

5. **REDD/REUR 系列** (8 个)

   - Get/SetREDDindiv (19/9 元素)
   - Get/SetREURindiv (19/9 元素)

6. **核心计算** (9 个)

   - CrossOverFrequencies_NL2
   - CenterFrequencies
   - CompressionThreshold_NL2
   - setBWC
   - CompressionRatio_NL2
   - getMPO_NL2
   - GainAt_NL2
   - ReturnValues_NL2
   - GetMLE

7. **硬件校正** (6 个)

   - GetTubing_NL2 (19/9 元素)
   - GetVentOut_NL2 (19/9 元素)
   - Get_SI_NL2
   - Get_SII

8. **用户配置** (5 个)

   - SetAdultChild
   - SetExperience
   - SetCompSpeed
   - SetTonalLanguage
   - SetGender

9. **RECD 系列** (8 个)
   - GetRECDh_indiv_NL2 (19/9 元素)
   - GetRECDt_indiv_NL2 (19/9 元素)
   - SetRECDh_indiv_NL2 (19/9 元素)
   - SetRECDt_indiv_NL2 (19/9 元素)

## 测试结果

### 结果保存

测试完成后，结果会自动保存到：

```
tests/results/test_report_YYYY-MM-DDTHH-MM-SS-MMMZ.json
```

### 结果格式

```json
[
  {
    "sequence_num": 1,
    "function": "dllVersion",
    "input_parameters": {},
    "result": {
      "sequence_num": 1,
      "return": 0,
      "function": "dllVersion",
      "output_parameters": {
        "major": 1,
        "minor": 0
      }
    },
    "success": true,
    "duration": 250
  }
]
```

## API 接口

### 获取测试列表

```
GET /api/test/run-all
```

返回所有 46 个测试文件的内容。

### 处理 NAL2 请求

```
POST /api/nal2/process
Content-Type: application/json

{
  "sequence_num": 1,
  "function": "dllVersion",
  "input_parameters": {}
}
```

返回 NAL2 函数执行结果。

### 保存测试结果

```
POST /api/test/results
Content-Type: application/json

[测试结果数组]
```

保存测试结果到文件系统。

## 常见问题

### 1. App 未连接

**症状**: 测试界面显示"App 未连接或已断开"

**解决**:

- 确保移动应用正在运行
- 检查应用是否显示"WebSocket 已连接"
- 在应用中点击"重新连接"按钮
- 检查服务器是否正常运行

### 2. 测试超时

**症状**: 某些测试显示"请求超时"

**解决**:

- 检查 NAL2 SDK 是否正确加载
- 增加 server.js 中的超时时间（默认 30 秒）
- 检查函数是否需要更长的处理时间

### 3. 部分测试失败

**症状**: 某些测试通过，某些失败

**解决**:

- 查看失败测试的错误信息
- 检查 NAL2Bridge.js 中的函数实现
- 确认测试数据格式正确
- 检查原生模块是否正确导出函数

### 4. WebSocket 断开

**症状**: 测试过程中连接断开

**解决**:

- 检查网络连接
- 确认服务器未重启
- 重新启动应用和测试页面

## 性能优化

### 提高测试速度

1. **并发测试** - 修改 test.html 支持并发执行
2. **缓存结果** - 缓存成功的测试结果
3. **跳过 Set 函数** - Set 函数通常较快，可优先测试

### 减少错误

1. **增加重试机制** - 失败自动重试
2. **添加延迟** - 测试间添加小延迟
3. **验证输入** - 发送前验证数据格式

## 高级功能

### 自定义测试

1. 在 `input_json_data/` 添加新的 JSON 文件
2. 文件名格式: `NN_FunctionName_data.json`
3. 刷新测试页面自动识别

### 批量测试特定函数

修改 test.html 的 filter 功能：

```javascript
const filteredTests = tests.filter(
  (test) => test.function.includes("RECD") // 只测试RECD相关函数
);
```

### 导出测试报告

测试结果自动保存为 JSON，可以：

- 导入 Excel 分析
- 生成 PDF 报告
- 对比不同版本结果

## 最佳实践

1. **完整测试** - 每次修改后运行完整测试
2. **记录历史** - 保留历史测试报告
3. **定期验证** - 定期运行回归测试
4. **文档更新** - 新增函数及时更新测试数据

## 技术支持

遇到问题时：

1. 查看浏览器控制台错误
2. 检查服务器日志
3. 查看移动应用日志
4. 参考 NAL2_INTEGRATION_GUIDE.md

---

**测试系统已就绪！现在可以运行完整的自动化测试了。** 🎉
