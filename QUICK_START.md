# FuncApp4NAL2 快速开始指南

## 新架构快速指南

本项目已完成架构重构，**App 现在作为服务器，Web 端作为客户端**。

## 快速开始

### 1. 构建和安装 App

```bash
# 进入 Android 目录
cd android

# 清理构建
./gradlew clean

# 构建 Debug APK（用于测试）
./gradlew assembleDebug

# 或构建 Release APK（用于发布）
./gradlew assembleRelease

# 安装到设备
adb install app/build/outputs/apk/debug/app-debug.apk
# 或
adb install app/build/outputs/apk/release/app-release.apk
```

### 2. 启动 App

1. 在 Android 设备上启动 FuncApp4NAL2
2. App 自动创建 WebSocket 服务器（端口 8080）
3. 界面会显示服务器 IP 地址，例如：`192.168.1.100:8080`
4. 记录这个地址，Web 端需要用它来连接

### 3. 连接 Web 端

#### 方式一：使用测试页面（推荐）

```bash
# 启动测试服务器
cd server
npm install
npm start

# 在浏览器中打开
# http://localhost:3000/test
```

然后在页面中输入 App 显示的服务器地址并连接。

#### 方式二：直接打开 HTML 文件

直接在浏览器中打开 `server/public/index.html`，然后输入 App 的服务器地址。

#### 方式三：使用 API 调用

**WebSocket 方式：**

```javascript
const ws = new WebSocket("ws://192.168.1.100:8080");

ws.onopen = () => {
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
  console.log("响应:", response.result);
};
```

**HTTP API 方式：**

```javascript
const response = await fetch("http://192.168.1.100:8081/api/nal2/process", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    sequence_num: 1,
    function: "dllVersion",
    input_parameters: {},
  }),
});

const result = await response.json();
console.log("响应:", result);
```

## 架构变化

### 旧架构（已废弃）

```
Web 客户端 ↔ Node.js 服务器 ↔ App 客户端
```

### 新架构（当前）

```
Web 客户端 ↔ App 服务器
```

**主要变化：**

- ❌ 不再需要独立的 Node.js 服务器
- ✅ App 启动时自动创建服务器
- ✅ Web 端直接连接 App
- ✅ 简化了部署和维护

## 重要文件说明

### App 端

| 文件                               | 说明                         |
| ---------------------------------- | ---------------------------- |
| `App.js`                           | 应用入口（已改为服务器模式） |
| `components/AppServerScreen.js`    | 服务器界面                   |
| `utils/AppServer.js`               | 服务器 JavaScript 封装       |
| `android/.../AppServerModule.java` | Android 原生服务器模块       |

### Web 端

| 文件                       | 说明                 |
| -------------------------- | -------------------- |
| `server/public/index.html` | Web 测试和演示页面   |
| `server/server.js`         | 旧版服务器（已废弃） |

### 文档

| 文件                        | 说明                   |
| --------------------------- | ---------------------- |
| `NEW_ARCHITECTURE.md`       | 新架构详细说明         |
| `QUICK_START.md`            | 快速开始指南（本文档） |
| `WEBSOCKET_API.md`          | WebSocket API 文档     |
| `NAL2_INTEGRATION_GUIDE.md` | NAL2 集成指南          |

## 常见问题

### Q1: 原生模块未找到错误

**错误信息：** `AppServerModule 未找到，需要原生实现`

**原因：** 原生模块未正确编译或注册

**解决方法：**

```bash
# 清理并重新构建
cd android
./gradlew clean
./gradlew assembleDebug

# 重新安装
adb uninstall com.funcapp.nal2
adb install app/build/outputs/apk/debug/app-debug.apk
```

### Q2: Web 端无法连接

**检查清单：**

- ✅ App 和 Web 端在同一局域网
- ✅ IP 地址输入正确
- ✅ App 服务器正在运行（界面显示绿色状态）
- ✅ 防火墙未阻止端口 8080

### Q3: NAL2 函数调用失败

**常见原因：**

- 输入参数格式错误
- NAL2 库未正确加载
- 函数不支持当前配置

**解决方法：**

- 参考 `input_json_data/` 目录中的示例
- 查看 App 日志获取详细错误信息
- 阅读 NAL2 文档了解函数要求

## 下一步

1. 阅读 `NEW_ARCHITECTURE.md` 了解详细架构
2. 查看 `WEBSOCKET_API.md` 了解 API 详情
3. 探索 `examples/` 目录中的调用示例
4. 运行 `npm test` 执行自动化测试

## 获取帮助

如遇到问题：

1. 检查 App 日志：`adb logcat | grep FuncApp`
2. 查看文档目录中的其他指南
3. 联系开发团队

---

**提示：** 这是新架构（v2.0.0），如果您之前使用旧版本，请注意架构已完全改变。
