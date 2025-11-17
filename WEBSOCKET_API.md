# WebSocket API 文档

本文档描述 FunApp4NAL2 的 WebSocket API 接口，供第三方客户端集成使用。

## 📡 连接信息

### WebSocket 服务器地址

```
ws://[SERVER_IP]:3000
```

**默认配置**: `ws://172.29.1.253:3000`

### 连接要求

- 协议: WebSocket (ws://)
- 端口: 3000 (可配置)
- 无需认证
- 支持自动重连

## 🔌 连接流程

### 1. 建立连接

```javascript
const ws = new WebSocket("ws://172.29.1.253:3000");

ws.onopen = () => {
  console.log("连接已建立");
  // 进入步骤2：注册客户端
};
```

### 2. 注册客户端

连接成功后，必须先注册客户端类型。

**发送消息:**

```json
{
  "type": "register",
  "client": "web" // 或 "app"
}
```

**参数说明:**

- `type`: 固定为 "register"
- `client`: 客户端类型
  - `"web"`: Web 控制端（发送 input，接收 output）
  - `"app"`: App 处理端（接收 input，发送 output）

**服务器响应:**

```json
{
  "type": "registered",
  "client": "web"
}
```

## 📨 消息协议

所有消息使用 JSON 格式。

### 消息类型

#### 1. Web 端发送 input 给 App 处理

**发送者**: Web 客户端  
**接收者**: App 客户端

**消息格式:**

```json
{
  "type": "send_to_app",
  "input": "输入参数（任意字符串）"
}
```

**示例:**

```json
{
  "type": "send_to_app",
  "input": "{\"value\": 100, \"type\": \"test\"}"
}
```

#### 2. App 接收处理请求

**发送者**: 服务器  
**接收者**: App 客户端

**消息格式:**

```json
{
  "type": "process_input",
  "input": "需要处理的参数"
}
```

**App 端处理逻辑:**

```javascript
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "process_input") {
    // 1. 接收input
    const input = data.input;

    // 2. 处理数据（调用NAL2或其他处理逻辑）
    const output = processData(input);

    // 3. 发送结果（见消息类型3）
    ws.send(
      JSON.stringify({
        type: "send_to_web",
        output: output,
      })
    );
  }
};
```

#### 3. App 发送 output 给 Web

**发送者**: App 客户端  
**接收者**: Web 客户端

**消息格式:**

```json
{
  "type": "send_to_web",
  "output": "处理结果（任意字符串）"
}
```

**示例:**

```json
{
  "type": "send_to_web",
  "output": "{\"result\": \"processed\", \"data\": [1, 2, 3]}"
}
```

#### 4. Web 接收处理结果

**发送者**: 服务器  
**接收者**: Web 客户端

**消息格式:**

```json
{
  "type": "receive_output",
  "output": "处理结果"
}
```

#### 5. 错误消息

**发送者**: 服务器  
**接收者**: 任意客户端

**消息格式:**

```json
{
  "type": "error",
  "message": "错误描述"
}
```

**常见错误:**

- "App 未连接" - Web 发送请求时 App 不在线

## 💻 客户端实现示例

### JavaScript/Node.js

```javascript
const WebSocket = require("ws");

const ws = new WebSocket("ws://172.29.1.253:3000");

ws.on("open", () => {
  // 注册为App客户端
  ws.send(
    JSON.stringify({
      type: "register",
      client: "app",
    })
  );
});

ws.on("message", (data) => {
  const message = JSON.parse(data);

  if (message.type === "process_input") {
    // 处理input
    const output = processInput(message.input);

    // 返回output
    ws.send(
      JSON.stringify({
        type: "send_to_web",
        output: output,
      })
    );
  }
});

ws.on("error", (error) => {
  console.error("WebSocket错误:", error);
});

ws.on("close", () => {
  console.log("连接已关闭");
  // 重连逻辑
  setTimeout(connect, 3000);
});

function processInput(input) {
  // 实现你的处理逻辑
  return input; // 示例：直接返回
}
```

### Python

```python
import websocket
import json
import time

def on_message(ws, message):
    data = json.loads(message)

    if data['type'] == 'process_input':
        # 处理input
        output = process_input(data['input'])

        # 返回output
        ws.send(json.dumps({
            'type': 'send_to_web',
            'output': output
        }))

def on_open(ws):
    # 注册为App客户端
    ws.send(json.dumps({
        'type': 'register',
        'client': 'app'
    }))

def on_error(ws, error):
    print(f'错误: {error}')

def on_close(ws, close_status_code, close_msg):
    print('连接已关闭')
    # 重连
    time.sleep(3)
    connect()

def process_input(input_data):
    # 实现你的处理逻辑
    return input_data  # 示例：直接返回

def connect():
    ws = websocket.WebSocketApp(
        'ws://172.29.1.253:3000',
        on_open=on_open,
        on_message=on_message,
        on_error=on_error,
        on_close=on_close
    )
    ws.run_forever()

if __name__ == '__main__':
    connect()
```

### Java

```java
import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;
import org.json.JSONObject;

import java.net.URI;

public class NAL2WebSocketClient extends WebSocketClient {

    public NAL2WebSocketClient(URI serverUri) {
        super(serverUri);
    }

    @Override
    public void onOpen(ServerHandshake handshake) {
        // 注册为App客户端
        JSONObject register = new JSONObject();
        register.put("type", "register");
        register.put("client", "app");
        send(register.toString());
    }

    @Override
    public void onMessage(String message) {
        JSONObject data = new JSONObject(message);

        if ("process_input".equals(data.getString("type"))) {
            // 处理input
            String input = data.getString("input");
            String output = processInput(input);

            // 返回output
            JSONObject response = new JSONObject();
            response.put("type", "send_to_web");
            response.put("output", output);
            send(response.toString());
        }
    }

    @Override
    public void onClose(int code, String reason, boolean remote) {
        System.out.println("连接已关闭: " + reason);
        // 重连逻辑
    }

    @Override
    public void onError(Exception ex) {
        ex.printStackTrace();
    }

    private String processInput(String input) {
        // 实现你的处理逻辑
        return input; // 示例：直接返回
    }

    public static void main(String[] args) {
        try {
            NAL2WebSocketClient client = new NAL2WebSocketClient(
                new URI("ws://172.29.1.253:3000")
            );
            client.connect();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

## 🔄 完整交互流程

```
Web客户端                服务器                App客户端
    |                      |                      |
    |--register(web)------>|                      |
    |<---registered--------|                      |
    |                      |<--register(app)------|
    |                      |---registered-------->|
    |                      |                      |
    |--send_to_app-------->|                      |
    |  {input: "data"}     |---process_input----->|
    |                      |  {input: "data"}     |
    |                      |                      | [处理中...]
    |                      |<--send_to_web--------|
    |                      |  {output: "result"}  |
    |<--receive_output-----|                      |
    |  {output: "result"}  |                      |
```

## 🚨 错误处理

### 1. App 未连接

当 Web 发送请求但 App 不在线时：

```json
{
  "type": "error",
  "message": "App未连接"
}
```

**建议**: Web 端显示错误提示，要求确保 App 在线

### 2. 消息格式错误

服务器会忽略格式错误的消息，不返回任何响应。

**建议**: 严格按照 JSON 格式发送消息

### 3. 连接断开

客户端应实现自动重连机制：

```javascript
ws.onclose = () => {
  console.log("连接断开，3秒后重连...");
  setTimeout(connect, 3000);
};
```

## 📋 最佳实践

### 1. 心跳保活

```javascript
setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "ping" }));
  }
}, 30000); // 每30秒发送一次
```

### 2. 重连策略

```javascript
let reconnectAttempts = 0;
const maxReconnectAttempts = 10;

function connect() {
  const ws = new WebSocket("ws://172.29.1.253:3000");

  ws.onclose = () => {
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
      setTimeout(connect, delay);
    }
  };

  ws.onopen = () => {
    reconnectAttempts = 0; // 重置计数器
  };
}
```

### 3. 消息队列

```javascript
const messageQueue = [];
let isConnected = false;

function sendMessage(message) {
  if (isConnected) {
    ws.send(JSON.stringify(message));
  } else {
    messageQueue.push(message);
  }
}

ws.onopen = () => {
  isConnected = true;
  // 发送队列中的消息
  while (messageQueue.length > 0) {
    ws.send(JSON.stringify(messageQueue.shift()));
  }
};
```

## 🔒 安全建议

1. **生产环境使用 wss://**: 加密 WebSocket 连接
2. **添加认证机制**: 在 register 消息中包含 token
3. **输入验证**: 验证所有接收到的数据
4. **限流保护**: 实现消息发送频率限制
5. **日志记录**: 记录所有连接和消息，便于调试

## 📞 技术支持

- 服务器配置: `config.json`
- 配置更新: `npm run update-config`
- 服务器启动: `cd server && npm start`
- 查看日志: 服务器终端输出

## 🔄 版本历史

- v1.0.0 (2025-01-12): 初始版本
  - 基础 WebSocket 通信
  - Web 和 App 双向通信
  - 自动重连支持
