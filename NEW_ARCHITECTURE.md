# FuncApp4NAL2 新架构说明

## 架构概述

### 旧架构（已废弃）

```
┌─────────┐         ┌─────────────┐         ┌─────────┐
│  Web端  │ ◄─────► │ 独立Server  │ ◄─────► │  App端  │
│ (客户端) │         │ (Node.js)   │         │ (客户端) │
└─────────┘         └─────────────┘         └─────────┘
```

- 独立的 Node.js 服务器作为中介
- Web 端和 App 端都是客户端，连接到服务器
- 服务器转发双方消息

**缺点：**

- 需要额外部署和维护独立服务器
- 架构复杂，增加故障点
- App 端依赖外部服务

### 新架构（当前）

```
┌─────────┐         ┌──────────────────┐
│  Web端  │ ◄─────► │      App端       │
│ (客户端) │         │ (WebSocket服务器) │
└─────────┘         │   (HTTP服务器)    │
                    │   (NAL2处理器)    │
                    └──────────────────┘
```

- **App 端作为服务器**：启动 WebSocket 和 HTTP 服务器
- **Web 端作为客户端**：扫描或手动连接到 App
- **直接通信**：无需中间服务器

**优点：**

- ✅ 简化架构，无需独立服务器
- ✅ App 端完全自主，不依赖外部服务
- ✅ 更灵活的部署方式
- ✅ 减少网络延迟
- ✅ 降低维护成本

## 技术实现

### 1. App 端（服务器模式）

#### 1.1 原生模块

**文件：** `android/app/src/main/java/com/funcapp4nal2/AppServerModule.java`

提供以下功能：

- WebSocket 服务器（基于 Java-WebSocket 库）
- HTTP 服务器（基于 Java ServerSocket）
- 客户端连接管理
- 消息路由和事件通知

**API 接口：**

```javascript
// 启动服务器
await AppServer.start(port, messageHandler);

// 停止服务器
await AppServer.stop();

// 发送消息给指定客户端
await AppServer.sendToClient(clientId, message);

// 广播消息给所有客户端
await AppServer.broadcast(message);

// 获取服务器状态
const status = await AppServer.getStatus();
```

#### 1.2 JavaScript 封装

**文件：** `utils/AppServer.js`

封装原生模块，提供统一的 JavaScript API 接口。

#### 1.3 UI 界面

**文件：** `components/AppServerScreen.js`

显示服务器状态和处理信息：

- 服务器运行状态
- 本地 IP 地址和端口
- 已连接客户端数量
- 最近的请求和响应
- 连接说明

### 2. Web 端（客户端模式）

#### 2.1 连接方式

**方式一：自动扫描**

- Web 端扫描局域网内的 App 服务器
- 通过 UDP 广播或 HTTP 探测
- 显示可用的服务器列表

**方式二：手动输入**

- 用户手动输入 App 的 IP 地址和端口
- 格式：`ws://192.168.1.100:8080`

#### 2.2 通信协议

**WebSocket 消息格式：**

```json
{
  "type": "nal2_request",
  "data": {
    "sequence_num": 1,
    "function": "dllVersion",
    "input_parameters": {}
  }
}
```

**HTTP API 调用：**

```bash
POST http://{APP_IP}:{PORT+1}/api/nal2/process
Content-Type: application/json

{
  "sequence_num": 1,
  "function": "dllVersion",
  "input_parameters": {}
}
```

### 3. NAL2 处理流程

```
Web端发送请求
      ↓
App服务器接收
      ↓
解析请求参数 (DataParser)
      ↓
调用NAL2函数 (NAL2Bridge)
      ↓
格式化输出结果
      ↓
发送响应给Web端
```

## 部署说明

### App 端（APK）

#### 1. 构建 APK

```bash
# 清理构建
cd android && ./gradlew clean

# 构建Release版本
./gradlew assembleRelease

# 输出位置
# android/app/build/outputs/apk/release/app-release.apk
```

#### 2. 安装和运行

```bash
# 安装APK
adb install android/app/build/outputs/apk/release/app-release.apk

# 启动App
# App启动后自动创建服务器
# 在界面上显示服务器地址和端口
```

#### 3. 网络配置

确保 App 有以下权限（已在 AndroidManifest.xml 中配置）：

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
```

### Web 端

#### 1. 独立部署

**文件：** `server/public/index.html`

这是一个独立的 HTML 文件，可以：

- 直接在浏览器中打开
- 部署到任何 Web 服务器
- 作为静态页面使用

#### 2. 连接到 App

1. 确保 Web 端设备和 App 在同一局域网
2. 在 Web 端输入 App 显示的服务器地址
3. 点击连接
4. 连接成功后即可发送 NAL2 请求

#### 3. API 调用示例

**JavaScript 示例：**

```javascript
// WebSocket连接
const ws = new WebSocket("ws://192.168.1.100:8080");

ws.onopen = () => {
  // 发送NAL2请求
  ws.send(
    JSON.stringify({
      type: "nal2_request",
      data: {
        sequence_num: 1,
        function: "dllVersion",
        input_parameters: {},
      },
    })
  );
};

ws.onmessage = (event) => {
  const response = JSON.parse(event.data);
  console.log("NAL2响应:", response.result);
};
```

**HTTP API 示例：**

```javascript
// 使用fetch发送HTTP请求
const response = await fetch("http://192.168.1.100:8081/api/nal2/process", {
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
console.log("NAL2响应:", result);
```

**Python 示例：**

```python
import requests
import json

# 发送NAL2请求
url = 'http://192.168.1.100:8081/api/nal2/process'
data = {
    'sequence_num': 1,
    'function': 'dllVersion',
    'input_parameters': {}
}

response = requests.post(url, json=data)
result = response.json()
print('NAL2响应:', result)
```

## 交付产物

### 1. Android APK

**文件：** `android/app/build/outputs/apk/release/app-release.apk`

**功能：**

- 完整的 NAL2 处理功能
- WebSocket 服务器（端口 8080）
- HTTP API 服务器（端口 8081）
- 自动显示服务器地址

### 2. API 文档

**文件：**

- `WEBSOCKET_API.md` - WebSocket API 文档
- `NEW_ARCHITECTURE.md` - 架构说明（本文档）

**内容：**

- API 接口定义
- 请求/响应格式
- 调用示例
- 错误处理

### 3. Web 演示页面

**文件：** `server/public/index.html`

**功能：**

- 可视化测试界面
- 支持扫描和手动连接
- NAL2 函数测试
- 结果显示

### 4. 调用示例

**文件：** `examples/`

提供多种语言的调用示例：

- JavaScript (浏览器)
- JavaScript (Node.js)
- Python
- Java
- C#

## 测试说明

### 1. 本地测试

**步骤：**

1. 启动 App（自动创建服务器）
2. 记录 App 显示的 IP 地址和端口
3. 打开 Web 页面或使用 API 调用
4. 输入服务器地址并连接
5. 发送测试请求
6. 查看响应结果

### 2. 自动化测试

**文件：** `tests/nal2_automated_tests.js`

```bash
# 运行自动化测试
npm test

# 测试将自动：
# 1. 连接到App服务器
# 2. 运行所有NAL2函数测试
# 3. 生成测试报告
```

### 3. 网络要求

- App 和 Web 端在同一局域网
- 防火墙允许端口 8080 和 8081
- 网络稳定，延迟低

## 故障排查

### 问题 1：App 无法启动服务器

**可能原因：**

- 端口被占用
- 缺少网络权限
- 原生模块未正确编译

**解决方法：**

```bash
# 检查端口占用
adb shell netstat -an | grep 8080

# 重新编译
cd android && ./gradlew clean
./gradlew assembleRelease
```

### 问题 2：Web 端无法连接

**可能原因：**

- IP 地址错误
- 不在同一网络
- 防火墙阻止

**解决方法：**

- 确认 IP 地址正确
- 检查网络连接
- 关闭防火墙或添加规则

### 问题 3：NAL2 处理失败

**可能原因：**

- 输入参数错误
- NAL2 库未正确加载
- 函数不支持

**解决方法：**

- 检查输入参数格式
- 查看 App 日志
- 参考 NAL2 文档

## 版本历史

### v2.0.0 - 新架构（当前）

- ✅ App 作为服务器模式
- ✅ 简化架构
- ✅ 原生 WebSocket 支持
- ✅ HTTP API 接口

### v1.0.0 - 旧架构（已废弃）

- 独立 Node.js 服务器
- App 和 Web 都是客户端
- WebSocket 连接

## 后续优化

### 短期计划

- [ ] 添加服务器自动发现（mDNS/Bonjour）
- [ ] 支持多个 Web 客户端同时连接
- [ ] 添加身份认证和加密
- [ ] 优化错误处理和重连机制

### 长期计划

- [ ] iOS 版本支持
- [ ] 桌面应用（Electron）
- [ ] 云端服务选项
- [ ] 数据持久化和历史记录

## 联系方式

如有问题或建议，请联系开发团队。
