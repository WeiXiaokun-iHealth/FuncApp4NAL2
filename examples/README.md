# Python WebSocket Client - NAL2 API 调用示例

这个目录包含使用 Python 调用 NAL2 WebSocket API 的示例代码。

## 🎯 项目说明

本项目最终交付：

1. **WebSocket API 服务器**：提供 NAL2 函数调用接口
2. **React Native App**：连接 WebSocket，实际处理 NAL2 算法
3. **Python 客户端示例**：展示如何通过 WebSocket API 调用 NAL2 功能

### 使用流程

```
1. 启动 WebSocket 服务器
   ↓
2. 启动 App（App 连接到 WebSocket）
   ↓
3. Python 客户端发送 input 参数
   ↓
4. WebSocket 转发给 App 处理
   ↓
5. App 处理完成，返回 output 结果
   ↓
6. Python 客户端接收结果
```

**注意**：Web 端界面仅用于调试，Python 客户端才是真正的 API 调用示例。

## 📋 文件说明

- `python_websocket_client.py`: Python WebSocket API 调用示例（命令行版本）
- `nal2_api_demo.ipynb`: Jupyter Notebook 交互式 Demo（**推荐新手使用**）
- `requirements.txt`: Python 依赖包列表

## 🚀 快速开始

### 方式 1：一键设置（推荐，最简单）

**macOS / Linux 用户：**

```bash
cd examples

# 运行一键设置脚本
./setup.sh
```

这个脚本会自动：

- ✅ 创建 Python 虚拟环境
- ✅ 安装所有依赖（websocket-client, jupyter 等）
- ✅ 配置完成后给出使用说明

**然后每次使用时：**

```bash
cd examples
source venv/bin/activate  # 激活虚拟环境
jupyter notebook          # 启动 Jupyter
# 或者 python python_websocket_client.py
```

使用完毕后：

```bash
deactivate  # 退出虚拟环境
```

### 方式 2：手动安装依赖

**macOS / Linux 用户：**

```bash
# 创建虚拟环境（推荐）
cd examples
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt
pip install jupyter
```

**Windows 用户：**

```bash
# 创建虚拟环境
cd examples
python -m venv venv
venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
pip install jupyter
```

### 2. 确保服务器运行

在运行 Python 客户端之前，请确保 NAL2 参数服务器和 App 端都在运行：

```bash
# 在项目根目录
./scripts/start-all.sh
```

### 3. 运行 Demo

#### 方法 A：使用 Jupyter Notebook（**推荐，更简单**）

**使用浏览器（推荐）：**

```bash
cd examples
source venv/bin/activate  # 激活虚拟环境
jupyter notebook          # 启动 Jupyter
```

然后在浏览器中打开 `nal2_api_demo.ipynb`，按顺序执行每个单元格即可。

**使用 VSCode（如果你更喜欢在编辑器中使用）：**

1. 确保已运行 `./setup.sh` 设置脚本
2. 在 VSCode 中打开 `nal2_api_demo.ipynb`
3. 点击右上角的"选择内核"（Select Kernel）
4. 选择 "Python (NAL2)" 或者选择 `examples/venv/bin/python`
5. 按顺序执行每个单元格（Shift+Enter）

**优点**：

- 📝 交互式，可以逐步执行
- 🔍 即时查看结果
- 📊 支持可视化（安装 matplotlib 后）
- ✅ 不需要处理复杂的依赖安装问题
- 💻 VSCode 中直接运行，无需切换到浏览器

#### 方法 B：使用命令行脚本

**从 examples 目录运行**：

```bash
cd examples
python3 python_websocket_client.py
```

**从项目根目录运行**：

```bash
python3 examples/python_websocket_client.py
```

## 💻 API 调用示例

Python 客户端作为 API 调用方，发送参数给 App 处理并接收结果。

```bash
python3 python_websocket_client.py
# 选择 1: Web客户端（API调用方）
```

**API 调用流程：**

1. Python 客户端连接到 WebSocket 服务器
2. 发送 NAL2 函数调用参数（input）
3. WebSocket 服务器转发给 App
4. App 处理 NAL2 算法计算
5. App 返回处理结果（output）
6. Python 客户端接收并显示结果

**示例输出：**

```
🔌 正在连接到 ws://172.29.1.253:3000...
✅ WebSocket已连接到 ws://172.29.1.253:3000
📤 发送注册消息: client=web
📨 收到消息: type=registered
✅ 已注册为 web 客户端

📋 准备发送的参数:
{
  "sequence_num": 123,
  "function": "RealEarInsertionGain_NL2",
  "input_parameters": {
    "AC": [35, 45, 40, 40, 65, 70, 70, 65, 55],
    ...
  }
}

📤 已发送input给App处理
⏳ 等待App处理结果...

============================================================
📥 收到处理结果:
{
  "sequence_num": 123,
  "result": 0,
  "function": "RealEarInsertionGain_NL2",
  "return": 0,
  "output_parameters": {
    "REIG": [5.007, 5.007, ...]
  }
}
============================================================
```

### 调试模式：模拟 App 处理端（可选）

如果需要在没有 App 的情况下测试，可以使用此模式模拟 App 端：

```bash
python3 python_websocket_client.py
# 选择 2: App客户端（仅用于测试）
```

**注意**：这个模式仅用于开发调试，生产环境应使用真正的 React Native App。

## 🔧 生产环境集成

### 典型使用场景

在你的 Python 应用中集成 NAL2 API 调用：

```python
from python_websocket_client import NAL2WebSocketClient
import json
import threading

class NAL2APIClient:
    """NAL2 API 调用封装"""

    def __init__(self, server_url="ws://172.29.1.253:3000"):
        self.client = NAL2WebSocketClient(url=server_url, client_type="web")
        self.client.connect()

    def call_nal2_function(self, function_name, parameters, timeout=30):
        """
        调用 NAL2 函数

        Args:
            function_name: 函数名称，如 "RealEarInsertionGain_NL2"
            parameters: 函数参数字典
            timeout: 超时时间（秒）

        Returns:
            处理结果字典，失败返回 None
        """
        # 构造请求
        input_data = {
            "sequence_num": int(time.time() * 1000),
            "function": function_name,
            "input_parameters": parameters
        }

        # 等待结果
        result_event = threading.Event()
        result_data = {"output": None}

        def on_result(output):
            result_data["output"] = json.loads(output)
            result_event.set()

        # 发送请求
        self.client.send_input(json.dumps(input_data), callback=on_result)

        # 等待响应
        if result_event.wait(timeout=timeout):
            return result_data["output"]
        else:
            return None

    def close(self):
        self.client.close()

# 使用示例
api = NAL2APIClient()

# 调用 NAL2 函数
result = api.call_nal2_function(
    function_name="RealEarInsertionGain_NL2",
    parameters={
        "AC": [35, 45, 40, 40, 65, 70, 70, 65, 55],
        "BC": [35, 45, 40, 40, 65, 70, 999, 999, 999],
        "L": 52,
        "limiting": 2,
        "channels": 18,
        "direction": 0,
        "mic": 1,
        "ACother": [35, 45, 40, 40, 65, 70, 70, 65, 55],
        "noOfAids": 1
    }
)

if result and result.get('result') == 0:
    reig = result['output_parameters']['REIG']
    print(f"REIG 结果: {reig}")
else:
    print("调用失败")

api.close()
```

## 📡 WebSocket 消息格式

### 注册消息

```json
{
  "type": "register",
  "client": "web" // 或 "app"
}
```

### Web 发送 input

```json
{
  "type": "send_to_app",
  "input": "JSON字符串格式的参数"
}
```

### App 发送 output

```json
{
  "type": "send_to_web",
  "output": "JSON字符串格式的结果"
}
```

更多详细信息请参考 [WEBSOCKET_API.md](../WEBSOCKET_API.md)

## 🔍 常见问题

### 1. 连接失败

**问题：** `❌ WebSocket错误: Connection refused`

**解决方案：**

- 确保服务器正在运行：`cd server && npm start`
- 检查 config.json 中的 IP 地址和端口是否正确
- 确认防火墙允许该端口

### 2. 等待超时

**问题：** `⚠️ 等待超时，可能App未连接`

**解决方案：**

- 确保 App 端（React Native 或 Python App 客户端）已连接
- 在 Web 界面查看 App 连接状态
- 检查服务器日志确认 App 是否注册成功

### 3. 依赖安装问题

**问题：** `ModuleNotFoundError: No module named 'websocket'`

**解决方案：**

```bash
# macOS / Linux
pip3 install websocket-client

# Windows
pip install websocket-client

# 不是 websocket 或 websockets
```

**问题：** `zsh: command not found: pip` (macOS)

**解决方案：**

```bash
# macOS 使用 pip3
pip3 install --user websocket-client

# 如果 pip3 也不可用，先安装 Python 3
brew install python3
```

**问题：** `error: externally-managed-environment` (macOS 新版本)

**解决方案：**

```bash
# 方法 1：使用 --user 标志（推荐）
pip3 install --user websocket-client

# 方法 2：创建虚拟环境（更推荐用于开发）
python3 -m venv venv
source venv/bin/activate
pip install websocket-client

# 然后运行程序
python3 python_websocket_client.py

# 退出虚拟环境
deactivate
```

### 4. 修改服务器地址

如果服务器地址不是默认的 `172.29.1.253:3000`，可以：

**方法 1：修改代码**

```python
client = NAL2WebSocketClient(url="ws://YOUR_IP:YOUR_PORT")
```

**方法 2：使用环境变量**

```python
import os
url = os.getenv('NAL2_WS_URL', 'ws://172.29.1.253:3000')
client = NAL2WebSocketClient(url=url)
```

## 🧪 测试

### 完整测试流程

1. **启动服务器和 App**：

```bash
# 在项目根目录
./scripts/start-all.sh
```

这会启动：

- WebSocket 服务器（端口 3000）
- React Native App（自动连接到 WebSocket）

2. **确认 App 已连接**：

查看服务器终端输出，应该看到：

```
App客户端已连接
```

或者打开浏览器访问 `http://172.29.1.253:3000` 查看连接状态。

3. **运行 Python 客户端测试**：

```bash
# 如果在项目根目录
python3 examples/python_websocket_client.py

# 或者切换到 examples 目录
cd examples
python3 python_websocket_client.py

# 选择 1: Web客户端
```

4. **查看结果**：

成功调用后会显示：

```
📥 收到处理结果:
{
  "sequence_num": 123,
  "result": 0,
  "function": "RealEarInsertionGain_NL2",
  "output_parameters": {
    "REIG": [5.007, 5.007, ...]
  }
}
```

### 本地调试测试（无需 App）

如果需要在没有 App 的情况下测试 WebSocket 通信：

**终端 1（模拟 App 处理端）：**

```bash
# 从 examples 目录运行
cd examples
python3 python_websocket_client.py
# 选择 2: App客户端（仅用于测试）
```

**终端 2（API 调用方）：**

```bash
# 从 examples 目录运行
cd examples
python3 python_websocket_client.py
# 选择 1: Web客户端
```

**注意**：模拟 App 端返回的是示例数据，不是真实的 NAL2 计算结果。

## 🌟 生产环境最佳实践

### 1. 连接管理

```python
class NAL2Connection:
    """管理 NAL2 API 连接的单例"""

    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance.client = None
        return cls._instance

    def connect(self, url="ws://172.29.1.253:3000"):
        if self.client is None or not self.client.connected:
            self.client = NAL2WebSocketClient(url=url, client_type="web")
            return self.client.connect()
        return True

    def get_client(self):
        return self.client

# 使用
conn = NAL2Connection()
conn.connect()
client = conn.get_client()
```

### 2. 批量处理

```python
def batch_nal2_calls(parameters_list, max_workers=5):
    """批量调用 NAL2 API"""
    from concurrent.futures import ThreadPoolExecutor

    api = NAL2APIClient()
    results = []

    def process_one(params):
        return api.call_nal2_function(
            function_name=params['function'],
            parameters=params['input_parameters']
        )

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [executor.submit(process_one, p) for p in parameters_list]
        results = [f.result() for f in futures]

    api.close()
    return results
```

### 3. 错误处理和重试

```python
def call_nal2_with_retry(api, function_name, parameters, max_retries=3):
    """带重试的 API 调用"""
    for attempt in range(max_retries):
        try:
            result = api.call_nal2_function(function_name, parameters)
            if result and result.get('result') == 0:
                return result
            print(f"调用失败，重试 {attempt + 1}/{max_retries}")
        except Exception as e:
            print(f"错误: {e}，重试 {attempt + 1}/{max_retries}")
            time.sleep(2 ** attempt)  # 指数退避

    return None
```

## 📚 参考文档

- [WebSocket API 文档](../WEBSOCKET_API.md) - 完整的 API 说明
- [使用指南](../USAGE_GUIDE.md) - 项目整体使用说明
- [websocket-client 文档](https://websocket-client.readthedocs.io/) - Python 库官方文档

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个示例代码！

## 📄 许可证

与主项目相同
