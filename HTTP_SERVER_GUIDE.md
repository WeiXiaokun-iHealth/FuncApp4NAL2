# HTTP 服务器架构 - 使用指南

## 新方案说明

由于 WebSocket 库集成问题，我们采用了**更简单可靠的 HTTP-only 方案**：

**优势：**

- ✅ 不依赖第三方 WebSocket 库
- ✅ 使用 Java 原生 ServerSocket
- ✅ 更稳定可靠
- ✅ 更容易调试

## 快速开始

### 1. 编译和安装

```bash
# 清理并编译
cd android
./gradlew clean
./gradlew assembleDebug

# 卸载旧版本（如果有）
adb uninstall com.funcapp.nal2

# 安装新版本
adb install app/build/outputs/apk/debug/app-debug.apk
```

### 2. 启动 App

在手机上启动 App，会自动启动 HTTP 服务器。界面会显示：

```
服务器运行中
IP地址: 192.168.1.100
端口: 8080
```

### 3. Web 端调用

#### 方式 1：直接 HTTP POST

```javascript
// 发送NAL2请求
const response = await fetch("http://192.168.1.100:8080/api/nal2/process", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    sequence_num: 1,
    function: "dllVersion",
    input_parameters: {},
  }),
});

const result = await response.json();
console.log("结果:", result);
```

#### 方式 2：使用测试页面

```html
<!DOCTYPE html>
<html>
  <head>
    <title>NAL2 HTTP Test</title>
  </head>
  <body>
    <h1>NAL2 HTTP API 测试</h1>

    <div>
      <label>服务器地址:</label>
      <input
        type="text"
        id="serverUrl"
        value="http://192.168.1.100:8080"
        style="width:300px"
      />
    </div>

    <div>
      <button onclick="testConnection()">测试连接</button>
      <button onclick="testDllVersion()">测试dllVersion</button>
    </div>

    <div>
      <h3>响应:</h3>
      <pre id="response"></pre>
    </div>

    <script>
      async function testConnection() {
        const url = document.getElementById("serverUrl").value;
        try {
          const response = await fetch(url + "/health");
          const data = await response.json();
          document.getElementById("response").textContent = JSON.stringify(
            data,
            null,
            2
          );
        } catch (error) {
          document.getElementById("response").textContent =
            "Error: " + error.message;
        }
      }

      async function testDllVersion() {
        const url = document.getElementById("serverUrl").value;
        try {
          const response = await fetch(url + "/api/nal2/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sequence_num: 1,
              function: "dllVersion",
              input_parameters: {},
            }),
          });
          const data = await response.json();
          document.getElementById("response").textContent = JSON.stringify(
            data,
            null,
            2
          );
        } catch (error) {
          document.getElementById("response").textContent =
            "Error: " + error.message;
        }
      }
    </script>
  </body>
</html>
```

## API 端点

### 健康检查

```bash
GET /health
GET /

# 响应:
{
  "status": "ok",
  "server": "FuncApp4NAL2",
  "version": "2.0.0"
}
```

### NAL2 处理

```bash
POST /api/nal2/process
POST /api/nal2

Content-Type: application/json

{
  "sequence_num": 1,
  "function": "dllVersion",
  "input_parameters": {}
}

# 响应:
{
  "status": "processing",
  "message": "Request received"
}
```

## JavaScript 使用示例

### 完整示例

```javascript
class NAL2HttpClient {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
  }

  async checkHealth() {
    const response = await fetch(`${this.serverUrl}/health`);
    return await response.json();
  }

  async callNAL2(functionName, inputParameters = {}, sequenceNum = 1) {
    const response = await fetch(`${this.serverUrl}/api/nal2/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sequence_num: sequenceNum,
        function: functionName,
        input_parameters: inputParameters,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }
}

// 使用
const client = new NAL2HttpClient("http://192.168.1.100:8080");

// 测试连接
const health = await client.checkHealth();
console.log("服务器状态:", health);

// 调用dllVersion
const result = await client.callNAL2("dllVersion");
console.log("结果:", result);

// 调用其他函数
const gainResult = await client.callNAL2("RealEarInsertionGain_NL2", {
  audiogram: [25, 30, 35, 40, 45, 50],
  // ... 其他参数
});
```

## Python 使用示例

```python
import requests

class NAL2HttpClient:
    def __init__(self, server_url):
        self.server_url = server_url

    def check_health(self):
        response = requests.get(f'{self.server_url}/health')
        return response.json()

    def call_nal2(self, function_name, input_parameters=None, sequence_num=1):
        if input_parameters is None:
            input_parameters = {}

        data = {
            'sequence_num': sequence_num,
            'function': function_name,
            'input_parameters': input_parameters
        }

        response = requests.post(
            f'{self.server_url}/api/nal2/process',
            json=data
        )

        response.raise_for_status()
        return response.json()

# 使用
client = NAL2HttpClient('http://192.168.1.100:8080')

# 测试连接
health = client.check_health()
print('服务器状态:', health)

# 调用NAL2
result = client.call_nal2('dllVersion')
print('结果:', result)
```

## 测试和调试

### 测试服务器连接

```bash
# 使用curl测试
curl http://192.168.1.100:8080/health

# 测试NAL2 API
curl -X POST http://192.168.1.100:8080/api/nal2/process \
  -H "Content-Type: application/json" \
  -d '{"sequence_num":1,"function":"dllVersion","input_parameters":{}}'
```

### 查看 App 日志

```bash
adb logcat | grep "HttpServerModule"
```

### 检查端口

```bash
# 检查服务器是否在监听
bash scripts/check-server-port.sh
```

## 常见问题

### Q1: 无法连接到服务器

**检查清单:**

- ✅ 手机和电脑在同一 WiFi 网络
- ✅ IP 地址正确（查看 App 界面）
- ✅ 端口正确（默认 8080）
- ✅ 防火墙未阻止

**测试方法:**

```bash
# Ping测试
ping 192.168.1.100

# Telnet测试（如果有）
telnet 192.168.1.100 8080
```

### Q2: 服务器未启动

**解决方法:**

```bash
# 查看详细日志
adb logcat | grep -E "(HttpServer|bind|ServerSocket)"

# 重新编译
cd android
./gradlew clean assembleDebug
adb uninstall com.funcapp.nal2
adb install app/build/outputs/apk/debug/app-debug.apk
```

### Q3: CORS 错误

服务器已配置 CORS，允许所有来源：

```
Access-Control-Allow-Origin: *
```

如果仍有问题，检查浏览器控制台的详细错误信息。

## 性能和限制

- **并发请求:** 支持最多 10 个并发连接（线程池大小）
- **请求超时:** 无显式超时，依赖 TCP 默认设置
- **数据大小:** 无硬性限制，建议单个请求 < 1MB

## 下一步

1. 编译并安装 App
2. 启动 App 并记录 IP 地址
3. 使用提供的测试页面或代码进行测试
4. 集成到您的应用中

## 技术架构

```
┌─────────┐                    ┌──────────────┐
│ Web端   │ ──HTTP POST──────→ │  App HTTP    │
│         │                    │  服务器       │
│         │ ←─JSON Response──  │  (端口8080)   │
└─────────┘                    │              │
                               │  ↓ 调用      │
                               │  NAL2Bridge  │
                               └──────────────┘
```

- 无需 WebSocket，更简单
- 使用标准 HTTP 协议
- JSON 格式的请求和响应
- 支持 CORS 跨域请求

## 与旧架构对比

| 特性     | 旧架构 (WebSocket)     | 新架构 (HTTP)      |
| -------- | ---------------------- | ------------------ |
| 依赖     | 需要 Java-WebSocket 库 | 仅 Java 原生 API   |
| 复杂度   | 较高                   | 简单               |
| 调试难度 | 较难                   | 容易               |
| 稳定性   | 取决于第三方库         | 稳定               |
| 实时性   | 支持双向通信           | 请求-响应模式      |
| 适用场景 | 需要实时推送           | API 调用（本项目） |

对于 NAL2 这种请求-响应模式的应用，HTTP 完全够用且更可靠。
