# FunApp4NAL2 完整使用指南

本指南介绍如何启动和使用 FunApp4NAL2 应用及其配套的参数管理服务器。

## 📋 系统组成

1. **React Native App** (FunApp4NAL2) - Android 应用
2. **本地 HTTP 服务器** - 参数管理 Web 界面和 API 服务

## 🚀 快速启动

### 步骤 1: 启动参数管理服务器

```bash
# 进入server目录
cd server

# 安装依赖（首次使用）
npm install

# 启动服务器
npm start
```

服务器启动后会显示：

```
NAL2参数服务器运行在: http://localhost:3000
局域网访问: http://<your-ip>:3000
App API端点: http://<your-ip>:3000/api/current-params
```

**记住显示的 IP 地址，后面需要用到！**

### 步骤 2: 获取电脑 IP 地址

如果服务器没有自动显示 IP，可以手动查看：

**macOS/Linux:**

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**

```bash
ipconfig
```

查找"无线局域网适配器"或"以太网适配器"下的 IPv4 地址

### 步骤 3: 配置 App API 地址

编辑 `App.js` 文件，找到第 26 行：

```javascript
const apiUrl = "http://YOUR_IP:3000/api/current-params";
```

将 `YOUR_IP` 替换为你电脑的实际 IP 地址，例如：

```javascript
const apiUrl = "http://192.168.1.100:3000/api/current-params";
```

### 步骤 4: 启动 Metro Bundler

在项目根目录打开新终端：

```bash
yarn start
```

### 步骤 5: 运行 Android App

确保手机和电脑在同一 WiFi 网络下，然后：

```bash
yarn android
```

或者如果应用已经安装，直接在手机上打开 **FunApp4NAL2** 应用。

## 🎯 使用流程

### 在 Web 界面管理参数

1. 在浏览器打开 `http://localhost:3000`
2. 在 **Input** 输入框中输入 NAL2 参数（JSON 格式）
3. 在 **Output** 输入框中输入预期输出（JSON 格式）
4. 点击 **"设置为当前参数"** 按钮 - 这将设置为 App 可获取的参数
5. 可选：点击 **"保存到历史"** 按钮保存这组参数以供后续使用

### 在 App 中获取参数

1. 打开手机上的 FunApp4NAL2 应用
2. 点击 **"接收参数"** 按钮
3. App 会从服务器获取当前参数
4. **Input** 区域显示接收到的参数
5. **Output** 区域显示处理后的结果

### 使用历史记录

Web 界面右侧的历史记录列表可以：

- 点击记录名称：加载该记录的参数到编辑区
- 点击 **"更新"** 按钮：用当前编辑区的内容更新该记录
- 点击 **"删除"** 按钮：删除该历史记录

## 📱 典型工作流程

```
1. Web界面: 创建/编辑参数
   ↓
2. Web界面: 点击"设置为当前参数"
   ↓
3. Web界面: (可选) 点击"保存到历史"
   ↓
4. App: 点击"接收参数"按钮
   ↓
5. App: 查看Input和Output区域的结果
   ↓
6. 重复上述步骤测试不同参数
```

## 🔧 故障排除

### App 无法连接到服务器

**问题**: 点击"接收参数"显示连接错误

**解决方法**:

1. 确认服务器正在运行 (`npm start` 在 server 目录)
2. 确认手机和电脑在同一 WiFi 网络
3. 检查 App.js 中的 IP 地址是否正确
4. 尝试在手机浏览器访问 `http://你的IP:3000` 测试连接
5. 检查电脑防火墙是否允许 3000 端口

### Metro Bundler 连接问题

**问题**: App 启动后无法加载或显示白屏

**解决方法**:

1. 摇动手机打开 React Native 开发菜单
2. 点击 "Settings"
3. 设置 "Debug server host & port" 为: `你的IP:8081`
4. 返回并点击 "Reload"

### 服务器启动失败

**问题**: `npm start` 报错端口被占用

**解决方法**:

```bash
# 查找占用3000端口的进程
lsof -i :3000

# 或者修改server/server.js中的PORT值为其他端口
const PORT = 3001;  // 改为3001或其他未被占用的端口
```

## 📝 JSON 格式示例

### Input 参数示例

```json
{
  "dateOfBirth": 1990,
  "adultChild": 1,
  "experience": 2,
  "compSpeed": 1,
  "tonal": 0,
  "gender": 1,
  "channels": 8,
  "bandWidth": 0,
  "selection": 0,
  "WBCT": 0,
  "haType": 0,
  "direction": 0,
  "mic": 0,
  "noOfAids": 2,
  "ac": [10, 15, 20, 25, 30, 35, 40],
  "bc": [5, 10, 15, 20, 25, 30, 35],
  "calcCh": [1, 2, 3, 4, 5, 6, 7, 8],
  "levels": [50, 65, 80]
}
```

### Output 结果示例

```json
{
  "cfArray": [1.2, 1.5, 1.8, 2.0, 2.2, 2.5, 2.8, 3.0],
  "status": "success",
  "timestamp": "2025-01-12T14:30:00.000Z"
}
```

## 🛠️ 开发模式

### 服务器热重载

使用 nodemon 实现代码修改后自动重启：

```bash
cd server
npm run dev
```

### App 热重载

Metro Bundler 默认支持热重载，修改代码后自动刷新。

## 📂 文件结构

```
FunApp4NAL2/
├── App.js                    # React Native主应用
├── package.json              # RN项目依赖
├── android/                  # Android原生代码
├── ios/                      # iOS原生代码
├── modules/
│   └── nal2/                 # NAL2原生模块
└── server/                   # 参数管理服务器
    ├── server.js             # Express服务器
    ├── package.json          # 服务器依赖
    ├── data.json             # 数据存储（自动生成）
    ├── public/
    │   └── index.html        # Web管理界面
    └── README.md             # 服务器说明文档
```

## 🔐 安全注意事项

1. 本服务器仅用于开发和测试，不应在生产环境使用
2. 默认没有身份验证，局域网内所有设备都可访问
3. 不要在公共 WiFi 网络下使用
4. 数据明文存储在 data.json 文件中

## 📞 联系与支持

如有问题，请检查：

1. 本文档的故障排除部分
2. server/README.md 了解 API 详情
3. 终端输出的错误信息
