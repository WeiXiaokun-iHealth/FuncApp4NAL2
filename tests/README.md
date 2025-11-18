# NAL2 自动化单元测试

自动化测试框架，用于测试 46 个 NAL2 函数的实现。

## 功能特性

### ✅ 自动发现测试

- 自动扫描`input_json_data`目录中的所有 JSON 测试文件
- 支持 46 个 NAL2 函数的自动化测试
- 无需手动配置测试用例

### ✅ 完整验证

- 输出结构验证
- 数据类型验证
- 数组长度验证（19/9/100 元素）
- 函数特定输出验证

### ✅ 详细报告

- 彩色控制台输出
- 测试通过率统计
- 失败原因详细说明
- JSON 格式测试报告

## 快速开始

### 运行所有测试

```bash
# 使用npm
npm test

# 或使用yarn
yarn test

# 或直接运行
node tests/nal2_automated_tests.js
```

### 查看测试结果

测试结果会以两种方式呈现：

1. **控制台输出** - 实时彩色输出
2. **JSON 报告** - 保存在`tests/results/`目录

## 测试覆盖

### 已实现函数（5 个）✅

1. dllVersion
2. RealEarInsertionGain_NL2
3. RealEarAidedGain_NL2
4. TccCouplerGain_NL2
5. EarSimulatorGain_NL2

### 待实现函数（41 个）📋

6-46: 增益计算、曲线生成、硬件校正、用户配置等

## 验证规则

### 基本验证

- ✅ 输出对象存在
- ✅ 无错误信息
- ✅ sequence_num 存在
- ✅ function 名称匹配
- ✅ output_parameters 存在

### 数组长度验证

**19 元素数组**

- REIG, REAG, ESG, TccGain
- REDD, REUR, RECD
- MPO, CT, AT, MLE
- Speech_rms, Speech_max, Speech_min, Speech_thresh
- MAF, BWC, ESCD
- Tubing, Ventout

**9 元素数组**

- REDD9, REUR9, RECDh9, RECDt9
- Tubing9, Ventout9

**100 元素数组**

- REIO, REIOunl
- TccIO, TccIOunl
- ESIO, ESIOunl

### 特殊函数验证

**单值返回函数**

- GainAt_NL2 → double
- Get_SI_NL2 → double
- Get_SII → double

**Set 函数**

- 应返回 `{ success: true }`

## 测试报告格式

### 控制台输出示例

```
╔════════════════════════════════════════╗
║   NAL2自动化单元测试开始执行          ║
╚════════════════════════════════════════╝

📁 找到 46 个测试文件

📋 测试: 01_dllVersion
  函数: dllVersion
  序号: 1
  ✅ 通过 (250ms)

📋 测试: 02_RealEarInsertionGain_NL2
  函数: RealEarInsertionGain_NL2
  序号: 2
  ✅ 通过 (180ms)

...

╔════════════════════════════════════════╗
║           测试结果汇总                 ║
╚════════════════════════════════════════╝

总测试数: 46
✅ 通过: 5
❌ 失败: 41
⏭️  跳过: 0

📊 通过率: 10.87%
```

### JSON 报告格式

```json
{
  "timestamp": "2025-11-17T07:49:00.000Z",
  "stats": {
    "total": 46,
    "passed": 5,
    "failed": 41,
    "skipped": 0,
    "passRate": "10.87%"
  },
  "results": [
    {
      "name": "01_dllVersion",
      "file": "01_dllVersion_data.json",
      "status": "passed",
      "duration": 250,
      "error": null,
      "validation": {
        "passed": true,
        "errors": []
      }
    }
  ]
}
```

## 配置选项

测试配置位于`nal2_automated_tests.js`的`TEST_CONFIG`对象：

```javascript
const TEST_CONFIG = {
  jsonDataDir: path.join(__dirname, "../input_json_data"), // JSON测试数据目录
  testResultsDir: path.join(__dirname, "results"), // 测试报告输出目录
  timeout: 10000, // 超时时间（毫秒）
};
```

## 自定义验证

### 添加新函数验证

在`validateFunctionSpecificOutput`函数中添加验证规则：

```javascript
const arrayLengthRules = {
  YourFunction_NL2: {
    outputArray1: 19,
    outputArray2: 100,
  },
};
```

### 添加特殊验证逻辑

```javascript
// 例如：验证特定范围
if (functionName === "SpecialFunction") {
  const value = params.someValue;
  if (value < 0 || value > 100) {
    validations.errors.push("值应在0-100范围内");
  }
}
```

## 持续集成

### CI/CD 集成

在 CI/CD 管道中运行测试：

```yaml
# .github/workflows/test.yml
name: NAL2 Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "16"
      - run: npm install
      - run: npm test
```

## 故障排除

### 常见问题

**Q: 测试超时**

- A: 增加`TEST_CONFIG.timeout`值

**Q: 找不到测试文件**

- A: 确认`input_json_data`目录存在且包含 JSON 文件

**Q: NAL2Bridge 导入失败**

- A: 确认`utils/NAL2Bridge.js`路径正确

## 测试最佳实践

1. **定期运行测试** - 每次代码变更后运行
2. **检查失败原因** - 仔细阅读失败测试的错误信息
3. **保持测试数据更新** - 确保 JSON 测试数据反映最新的 API
4. **审查测试报告** - 定期查看 JSON 报告以跟踪进度

## 贡献指南

### 添加新测试

1. 在`input_json_data/`中创建 JSON 测试文件
2. 确保文件名格式：`{序号}_{函数名}_data.json`
3. 运行测试验证

### 提交测试报告

测试报告自动保存在`tests/results/`目录（已添加到.gitignore）

## 许可证

与主项目相同
