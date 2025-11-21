# 完整使用指南 - App 作为 API 服务器

## 架构说明

```
┌─────────────────┐                           ┌─────────────────┐
│   Web浏览器     │                           │   Android App   │
│                 │                           │                 │
│  ┌───────────┐  │    HTTP POST请求          │  ┌───────────┐  │
│  │ 测试页面  │──┼────────────────────────→  │  │HTTP服务器 │  │
│  └───────────┘  │    /api/nal2/process      │  └─────┬─────┘  │
│                 │                           │        │        │
│  显示结果       │ ←──────────────────────┐  │        ↓        │
│                 │    JSON响应             │  │  ┌───────────┐  │
└─────────────────┘                        │  │  │NAL2处理   │  │
                                           │  │  └───────────┘  │
                                           │  │                 │
                                           └──┼─────────────────┘
                                              │  返回结果
                                              └─────────────────
```

## App 端显示信息

App 启动后会显示：

```
━━━━━━━━━━━━━━━━━━━━━━━━
    NAL2 HTTP API服务器
━━━━━━━━━━━━━━━━━━━━━━━━

🌐 服务器地址
IP地址: 192.168.1.100
端口: 8080

📡 API端点
POST http://192.168.1.100:8080/api/nal2/process

📝 请求格式
{
  "sequence_num": 1,
  "function": "dllVersion",
  "input_parameters": {}
}

✅ 服务器状态: 运行中
```

## Web 端测试页面

### 创建测试页面

在`server/public/index.html`中：

```html
<!DOCTYPE html>
<html>
  <head>
    <title>NAL2 API测试工具</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial,
          sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        padding: 20px;
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
      }

      .header {
        background: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        margin-bottom: 20px;
      }

      .header h1 {
        color: #667eea;
        margin-bottom: 10px;
      }

      .header p {
        color: #666;
      }

      .main-panel {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 20px;
      }

      .panel {
        background: white;
        padding: 25px;
        border-radius: 10px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      }

      .panel h2 {
        color: #333;
        margin-bottom: 20px;
        font-size: 20px;
        border-bottom: 2px solid #667eea;
        padding-bottom: 10px;
      }

      .form-group {
        margin-bottom: 15px;
      }

      label {
        display: block;
        color: #555;
        margin-bottom: 5px;
        font-weight: 500;
      }

      input,
      select,
      textarea {
        width: 100%;
        padding: 10px;
        border: 2px solid #ddd;
        border-radius: 5px;
        font-size: 14px;
        font-family: "Courier New", monospace;
      }

      input:focus,
      select:focus,
      textarea:focus {
        outline: none;
        border-color: #667eea;
      }

      textarea {
        min-height: 150px;
        resize: vertical;
      }

      .button-group {
        display: flex;
        gap: 10px;
        margin-top: 20px;
      }

      button {
        flex: 1;
        padding: 12px 24px;
        border: none;
        border-radius: 5px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
      }

      .btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
      }

      .btn-secondary {
        background: #f0f0f0;
        color: #333;
      }

      .btn-secondary:hover {
        background: #e0e0e0;
      }

      .status {
        padding: 10px;
        border-radius: 5px;
        margin-top: 10px;
        font-weight: 500;
      }

      .status.success {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }

      .status.error {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      }

      .status.info {
        background: #d1ecf1;
        color: #0c5460;
        border: 1px solid #bee5eb;
      }

      pre {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 5px;
        overflow-x: auto;
        font-size: 13px;
        line-height: 1.6;
      }

      .example-buttons {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-bottom: 15px;
      }

      .example-buttons button {
        padding: 8px;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Header -->
      <div class="header">
        <h1>🎯 NAL2 API测试工具</h1>
        <p>通过HTTP请求向App端发送NAL2数据处理请求</p>
      </div>

      <!-- Main Panels -->
      <div class="main-panel">
        <!-- Left Panel: Configuration -->
        <div class="panel">
          <h2>⚙️ 服务器配置</h2>

          <div class="form-group">
            <label>服务器地址</label>
            <input
              type="text"
              id="serverUrl"
              value="http://192.168.1.100:8080"
              placeholder="http://192.168.1.100:8080"
            />
          </div>

          <div class="form-group">
            <label>NAL2函数</label>
            <select id="functionName">
              <option value="dllVersion">dllVersion - DLL版本</option>
              <option value="RealEarInsertionGain_NL2">
                RealEarInsertionGain_NL2 - 真耳插入增益
              </option>
              <option value="RealEarAidedGain_NL2">
                RealEarAidedGain_NL2 - 真耳辅助增益
              </option>
              <option value="CompressionThreshold_NL2">
                CompressionThreshold_NL2 - 压缩阈值
              </option>
              <option value="CompressionRatio_NL2">
                CompressionRatio_NL2 - 压缩比
              </option>
            </select>
          </div>

          <div class="example-buttons">
            <button class="btn-secondary" onclick="loadExample('dllVersion')">
              DLL版本
            </button>
            <button class="btn-secondary" onclick="loadExample('REIG')">
              REIG
            </button>
            <button class="btn-secondary" onclick="loadExample('REAG')">
              REAG
            </button>
          </div>

          <div class="form-group">
            <label>输入参数（JSON）</label>
            <textarea
              id="inputParams"
              placeholder='{"audiogram": [25, 30, 35, 40, 45, 50]}'
            >
{}</textarea
            >
          </div>

          <div class="button-group">
            <button class="btn-primary" onclick="sendToApp()">
              📤 发送到App处理
            </button>
            <button class="btn-secondary" onclick="testConnection()">
              🔍 测试连接
            </button>
          </div>

          <div id="status"></div>
        </div>

        <!-- Right Panel: Response -->
        <div class="panel">
          <h2>📊 处理结果</h2>

          <div class="form-group">
            <label>响应状态</label>
            <input
              type="text"
              id="responseStatus"
              readonly
              placeholder="等待响应..."
            />
          </div>

          <div class="form-group">
            <label>处理时间</label>
            <input type="text" id="responseTime" readonly placeholder="- ms" />
          </div>

          <div class="form-group">
            <label>响应数据（JSON）</label>
            <textarea
              id="responseData"
              readonly
              placeholder="响应数据将显示在这里..."
            ></textarea>
          </div>

          <div class="button-group">
            <button class="btn-secondary" onclick="copyResponse()">
              📋 复制结果
            </button>
            <button class="btn-secondary" onclick="clearResponse()">
              🗑️ 清空
            </button>
          </div>
        </div>
      </div>

      <!-- Log Panel -->
      <div class="panel">
        <h2>📝 请求日志</h2>
        <pre id="requestLog">等待请求...</pre>
      </div>
    </div>

    <script>
      // 示例数据
      const examples = {
        dllVersion: {
          function: "dllVersion",
          params: {},
        },
        REIG: {
          function: "RealEarInsertionGain_NL2",
          params: {
            audiogram: [25, 30, 35, 40, 45, 50, 55, 60],
            ear: 1,
            ageYears: 65,
            ageMonths: 0,
            experience: 1,
          },
        },
        REAG: {
          function: "RealEarAidedGain_NL2",
          params: {
            audiogram: [30, 35, 40, 45, 50, 55, 60, 65],
            ear: 1,
            ageYears: 70,
            ageMonths: 0,
          },
        },
      };

      // 加载示例
      function loadExample(example) {
        const data = examples[example];
        document.getElementById("functionName").value = data.function;
        document.getElementById("inputParams").value = JSON.stringify(
          data.params,
          null,
          2
        );
        showStatus("info", `已加载${example}示例`);
      }

      // 测试连接
      async function testConnection() {
        const serverUrl = document.getElementById("serverUrl").value.trim();
        showStatus("info", "正在测试连接...");

        try {
          const response = await fetch(`${serverUrl}/health`);
          const data = await response.json();

          document.getElementById("requestLog").textContent =
            `连接测试成功\n` +
            `服务器: ${data.server}\n` +
            `版本: ${data.version}\n` +
            `状态: ${data.status}`;

          showStatus("success", "✅ 连接成功！");
        } catch (error) {
          document.getElementById(
            "requestLog"
          ).textContent = `连接失败: ${error.message}`;
          showStatus("error", `❌ 连接失败: ${error.message}`);
        }
      }

      // 发送到App处理
      async function sendToApp() {
        const serverUrl = document.getElementById("serverUrl").value.trim();
        const functionName = document.getElementById("functionName").value;
        const inputParamsText = document
          .getElementById("inputParams")
          .value.trim();

        // 验证输入
        if (!serverUrl) {
          showStatus("error", "请输入服务器地址");
          return;
        }

        let inputParams;
        try {
          inputParams = inputParamsText ? JSON.parse(inputParamsText) : {};
        } catch (e) {
          showStatus("error", "输入参数JSON格式错误");
          return;
        }

        // 构建请求
        const requestData = {
          sequence_num: Date.now(),
          function: functionName,
          input_parameters: inputParams,
        };

        // 显示请求信息
        document.getElementById("requestLog").textContent =
          `发送时间: ${new Date().toLocaleString()}\n` +
          `目标地址: ${serverUrl}/api/nal2/process\n` +
          `请求数据:\n${JSON.stringify(requestData, null, 2)}`;

        showStatus("info", "📤 正在发送到App处理...");

        const startTime = Date.now();

        try {
          const response = await fetch(`${serverUrl}/api/nal2/process`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
          });

          const endTime = Date.now();
          const duration = endTime - startTime;

          const responseData = await response.json();

          // 显示响应
          document.getElementById("responseStatus").value = response.ok
            ? "✅ 成功"
            : "❌ 失败";
          document.getElementById("responseTime").value = `${duration} ms`;
          document.getElementById("responseData").value = JSON.stringify(
            responseData,
            null,
            2
          );

          // 更新日志
          document.getElementById("requestLog").textContent +=
            `\n\n响应时间: ${new Date().toLocaleString()}\n` +
            `处理时长: ${duration}ms\n` +
            `响应数据:\n${JSON.stringify(responseData, null, 2)}`;

          showStatus("success", `✅ 处理成功！耗时 ${duration}ms`);
        } catch (error) {
          document.getElementById("responseStatus").value = "❌ 错误";
          document.getElementById("responseTime").value = "-";
          document.getElementById("responseData").value = error.message;

          showStatus("error", `❌ 请求失败: ${error.message}`);
        }
      }

      // 复制响应
      function copyResponse() {
        const responseData = document.getElementById("responseData").value;
        navigator.clipboard.writeText(responseData);
        showStatus("success", "✅ 已复制到剪贴板");
      }

      // 清空响应
      function clearResponse() {
        document.getElementById("responseStatus").value = "";
        document.getElementById("responseTime").value = "";
        document.getElementById("responseData").value = "";
        document.getElementById("requestLog").textContent = "已清空";
        showStatus("info", "已清空结果");
      }

      // 显示状态
      function showStatus(type, message) {
        const statusDiv = document.getElementById("status");
        statusDiv.className = `status ${type}`;
        statusDiv.textContent = message;

        if (type !== "error") {
          setTimeout(() => {
            statusDiv.textContent = "";
            statusDiv.className = "status";
          }, 3000);
        }
      }

      // 页面加载时加载默认示例
      window.onload = function () {
        loadExample("dllVersion");
      };
    </script>
  </body>
</html>
```

## 使用步骤

### 1. 启动 App 服务器

```bash
# 编译并安装App
bash scripts/rebuild-and-test.sh 你的手机IP

# App启动后会显示服务器地址
# 例如: http://192.168.1.100:8080
```

### 2. 打开测试页面

```bash
# 直接打开HTML文件
open server/public/index.html

# 或者启动Node.js服务器（可选）
cd server
npm install
npm start
# 然后访问 http://localhost:3000
```

### 3. 配置服务器地址

在测试页面中输入 App 显示的服务器地址：

```
http://192.168.1.100:8080
```

### 4. 选择 NAL2 函数并输入参数

例如测试`RealEarInsertionGain_NL2`：

```json
{
  "audiogram": [25, 30, 35, 40, 45, 50, 55, 60],
  "ear": 1,
  "ageYears": 65,
  "ageMonths": 0,
  "experience": 1
}
```

### 5. 点击"发送到 App 处理"

- App 接收请求
- 调用 NAL2 处理
- 返回结果到 Web 端
- 显示处理结果

## API 响应格式

### 成功响应

```json
{
  "success": true,
  "sequence_num": 1637123456,
  "function": "RealEarInsertionGain_NL2",
  "output_parameters": {
    "REIG": [10.5, 15.2, 18.7, 22.3, 25.1, 27.8, 29.5, 30.2],
    "frequencies": [250, 500, 750, 1000, 1500, 2000, 3000, 4000]
  },
  "processing_time_ms": 45
}
```

### 错误响应

```json
{
  "success": false,
  "error": "Invalid input parameters",
  "message": "Audiogram must contain 8 values"
}
```

## 交付产物

### 对外交付

1. **Android APK** - App 安装包
2. **API 文档** - HTTP API 使用说明
3. **测试页面** - 可视化测试和演示工具
4. **使用指南** - 完整的部署和使用文档

### 使用方式

```
客户端(Web/Python/等)
    ↓
  HTTP POST
    ↓
 App HTTP服务器 (手机)
    ↓
  NAL2处理
    ↓
  返回结果
```

## 优势

- ✅ **简单** - 标准 HTTP API，任何语言都可调用
- ✅ **可靠** - 无需 WebSocket，更稳定
- ✅ **直观** - Web 测试页面，所见即所得
- ✅ **灵活** - 支持所有 NAL2 函数
- ✅ **易用** - 清晰的 API 文档和示例
