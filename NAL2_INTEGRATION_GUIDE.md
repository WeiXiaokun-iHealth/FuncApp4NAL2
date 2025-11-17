# NAL2 数据解析和桥接模块集成指南

## 概述

本项目实现了一个完整的 NAL2 数据解析和桥接系统，可以通过 WebSocket 接收 JSON 格式的函数调用请求，自动解析参数并调用相应的 NAL2 原生模块函数，然后返回格式化的结果。

## 架构设计

### 系统组件

1. **WebSocket 服务器** (`server/server.js`)

   - 提供 WebSocket 通信接口
   - 转发 Web 端和 App 端的消息
   - 维护历史记录

2. **数据解析模块** (`utils/DataParser.js`)

   - 解析 JSON 格式的输入数据
   - 验证必需字段
   - 创建标准化的输出格式
   - 提供错误处理工具

3. **NAL2 桥接模块** (`utils/NAL2Bridge.js`)

   - 将解析后的数据映射到 NAL2 函数调用
   - 支持所有 23 个 NAL2 函数
   - 统一的错误处理机制

4. **NAL2 原生模块** (`modules/nal2/`)

   - Android 实现 (Kotlin/Java)
   - iOS 实现 (Swift/Objective-C)
   - TypeScript 接口定义

5. **React Native 应用** (`App.js`)
   - 建立 WebSocket 连接
   - 自动处理输入数据
   - 显示处理结果

## 支持的 NAL2 函数

### 1. 配置函数

- **CrossOverFrequencies_NL2** - 获取交叉频率
- **CenterFrequencies** - 设置中心频率
- **CompressionThreshold_NL2** - 压缩阈值
- **setBWC** - 设置带宽和中心频率

### 2. 用户参数设置

- **SetAdultChild** - 设置成人/儿童
- **SetExperience** - 设置使用经验
- **SetCompSpeed** - 设置压缩速度
- **SetTonalLanguage** - 设置声调语言
- **SetGender** - 设置性别

### 3. RECD 相关函数

- **GetRECDh_indiv_NL2** / **GetRECDh_indiv9_NL2** - 获取 RECD (耳机)
- **GetRECDt_indiv_NL2** / **GetRECDt_indiv9_NL2** - 获取 RECD (传感器)
- **SetRECDh_indiv_NL2** / **SetRECDh_indiv9_NL2** - 设置 RECD (耳机)
- **SetRECDt_indiv_NL2** / **SetRECDt_indiv9_NL2** - 设置 RECD (传感器)

### 4. 增益计算函数

- **CompressionRatio_NL2** - 压缩比
- **getMPO_NL2** - 最大输出功率
- **RealEarAidedGain_NL2** - 真耳辅助增益
- **RealEarInsertionGain_NL2** - 真耳插入增益
- **TccCouplerGain_NL2** - TCC 耦合器增益
- **EarSimulatorGain_NL2** - 耳模拟器增益

## 数据格式

### 输入 JSON 格式

```json
{
  "sequence_num": 123,
  "function": "FunctionName",
  "input_parameters": {
    "param1": value1,
    "param2": value2,
    ...
  }
}
```

### 输出 JSON 格式

```json
{
  "sequence_num": 123,
  "result": 0,
  "function": "FunctionName",
  "return": 0,
  "output_parameters": {
    "param1": [result_array],
    ...
  }
}
```

**返回码说明：**

- `0`: 成功
- `-1`: 失败（错误信息在`output_parameters.error`中）

## 使用示例

### 示例 1: RealEarInsertionGain_NL2

**输入：**

```json
{
  "sequence_num": 123,
  "function": "RealEarInsertionGain_NL2",
  "input_parameters": {
    "AC": [500, 1000, 2000, 4000, 0, 0, 0, 0, 0],
    "BC": [500, 1000, 2000, 4000, 0, 0, 0, 0, 0],
    "limiting": 0,
    "channels": 1,
    "direction": 0,
    "mic": 0,
    "ACother": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    "noOfAids": 0
  }
}
```

**输出：**

```json
{
  "sequence_num": 123,
  "result": 0,
  "function": "RealEarInsertionGain_NL2",
  "return": 0,
  "output_parameters": {
    "REIG": [5.2, 10.3, 15.7, ...]
  }
}
```

### 示例 2: CrossOverFrequencies_NL2

**输入：**

```json
{
  "sequence_num": 124,
  "function": "CrossOverFrequencies_NL2",
  "input_parameters": {
    "channels": 18,
    "AC": [35, 45, 40, 40, 65, 70, 70, 65, 55],
    "BC": [35, 45, 40, 40, 65, 70, 70, 65, 55]
  }
}
```

**输出：**

```json
{
  "sequence_num": 124,
  "result": 0,
  "function": "CrossOverFrequencies_NL2",
  "return": 0,
  "output_parameters": {
    "crossOverFreq": [250.0, 500.0, 750.0, ...]
  }
}
```

### 示例 3: SetAdultChild

**输入：**

```json
{
  "sequence_num": 125,
  "function": "SetAdultChild",
  "input_parameters": {
    "adultChild": 0,
    "dateOfBirth": 20100615
  }
}
```

**输出：**

```json
{
  "sequence_num": 125,
  "result": 0,
  "function": "SetAdultChild",
  "return": 0,
  "output_parameters": {
    "success": true
  }
}
```

## 开发指南

### 添加新的 NAL2 函数

如果需要添加新的 NAL2 函数支持，需要按以下步骤操作：

#### 1. 更新 Android 原生模块

在 `modules/nal2/android/src/main/java/com/nal2/Nal2Manager.java` 中添加：

```java
public double[] getNewFunction(/* parameters */) {
    try {
        double[] result = new double[size];
        OutputResult outputResult = NativeManager.getInstance(context).NewFunction(/* params */);
        return getOutputData(outputResult, result);
    } catch (Exception e) {
        Log.e(TAG, "调用NewFunction失败", e);
        return result;
    }
}
```

在 `modules/nal2/android/src/main/java/com/nal2/Nal2Module.kt` 中添加：

```kotlin
@ReactMethod
fun newFunction(/* parameters */, promise: Promise) {
    try {
        val result = nal2Manager.getNewFunction(/* params */)
        val resultArray = Arguments.createArray()
        result.forEach { resultArray.pushDouble(it) }
        promise.resolve(resultArray)
    } catch (e: Exception) {
        promise.reject("NAL2_ERROR", "调用newFunction失败: ${e.message}", e)
    }
}
```

#### 2. 更新 TypeScript 接口

在 `modules/nal2/src/index.tsx` 中添加：

```typescript
export function newFunction(
  param1: number,
  param2: number[]
): Promise<number[]> {
  return Nal2.newFunction(param1, Array.from(param2));
}
```

#### 3. 更新 NAL2Bridge

在 `utils/NAL2Bridge.js` 的 `processFunction` 方法中添加 case：

```javascript
case 'NewFunction':
  result = await this.handleNewFunction(input_parameters);
  outputParameters = { result: result };
  break;
```

并添加处理方法：

```javascript
static async handleNewFunction(params) {
  DataParser.validateParameters(params, ['param1', 'param2']);
  return await Nal2.newFunction(params.param1, params.param2);
}
```

#### 4. 添加测试数据

在 `input_json_data/` 目录下创建测试 JSON 文件：

```json
{
  "sequence_num": 200,
  "function": "NewFunction",
  "input_parameters": {
    "param1": 100,
    "param2": [1.0, 2.0, 3.0]
  }
}
```

## 测试方法

### 1. 启动 WebSocket 服务器

```bash
cd server
npm install
node server.js
```

### 2. 启动 React Native 应用

```bash
# Android
npm run android

# iOS
npm run ios
```

### 3. 使用 Web 界面测试

打开浏览器访问：`http://localhost:3000`

1. 在输入框中粘贴测试 JSON 数据
2. 点击"发送到 App"按钮
3. App 会自动处理并返回结果
4. 结果会显示在 Web 界面的输出框中

### 4. 使用 input_json_data 中的示例

所有 23 个函数的测试数据都已经准备好在 `input_json_data/` 目录中，可以直接复制使用。

## 错误处理

### 常见错误及解决方法

1. **JSON 解析失败**

   - 检查 JSON 格式是否正确
   - 确保没有多余的逗号
   - 验证所有字符串都用双引号

2. **缺少必需参数**

   - 查看函数文档确认所需参数
   - 检查参数名称拼写是否正确

3. **NAL2 模块调用失败**

   - 检查原生模块是否正确链接
   - 查看原生日志获取详细错误信息
   - 确认 NAL2 SDK 已正确安装

4. **WebSocket 连接失败**
   - 确认服务器 IP 地址和端口配置正确
   - 检查网络连接
   - 验证服务器是否正常运行

## 项目结构

```
FuncApp4NAL2/
├── utils/
│   ├── DataParser.js          # 数据解析模块
│   └── NAL2Bridge.js           # NAL2桥接模块
├── modules/
│   └── nal2/
│       ├── android/            # Android原生实现
│       ├── ios/                # iOS原生实现
│       └── src/
│           └── index.tsx       # TypeScript接口
├── server/
│   ├── server.js              # WebSocket服务器
│   └── public/
│       └── index.html         # Web测试界面
├── input_json_data/           # 测试数据示例
│   ├── 19_CrossOverFrequencies_NL2_data.json
│   ├── 20_CenterFrequencies_data.json
│   ├── ...
│   └── 52_EarSimulatorGain_NL2_data.json
├── App.js                     # React Native主应用
└── NAL2_INTEGRATION_GUIDE.md  # 本文档
```

## 维护和更新

### 版本控制

- 当前版本：1.0.0
- 最后更新：2025-11-17

### 变更日志

- 2025-11-17：初始版本，支持 23 个 NAL2 函数

### 贡献指南

如需添加新功能或修复 Bug，请遵循以下步骤：

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

## 技术支持

如有问题，请查看：

- [NAL2 SDK 文档]
- [React Native 文档](https://reactnative.dev/)
- [WebSocket API 文档](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

## 许可证

本项目采用 [MIT License]。
