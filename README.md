# FuncApp4NAL2 - NAL2 助听器算法应用

NAL2（National Acoustic Laboratories - Nonlinear 2）助听器验配算法的移动应用实现。

## 快速开始

### 1. 启动 React Native App

在项目根目录下运行：

```bash
./scripts/run-app.sh
```

该脚本会自动：

- 检查并安装依赖
- 清理缓存
- 启动 Metro bundler
- 在 Android 设备/模拟器上运行应用

**前提条件：**

- 已安装 Node.js（推荐 v18+）
- 已安装 Android Studio 和 Android SDK
- 已连接 Android 设备或启动了 Android 模拟器
- 已启用 USB 调试（真机）

### 2. 启动 Web 测试服务器

在项目根目录下运行：

```bash
./scripts/run-server.sh
```

服务器将在端口 **3000** 启动，提供：

- NAL2 函数 HTTP API 接口
- Web 测试界面
- 参数管理和历史记录

**访问测试页面：**
打开浏览器访问 `http://localhost:3000`

**注意：** App 必须先运行，Web 端才能通过 HTTP 调用 NAL2 功能。

### 3. 获取 App 的 IP 和端口

App 运行后会在设备上显示：

- **HTTP Server 地址**：如 `http://192.168.1.100:8080`
- 使用这个地址从外部设备调用 NAL2 API

在 App 界面可以查看和配置服务器信息。

## 打包 Android 应用

构建发布版 APK：

```bash
./scripts/build-android-release.sh
```

APK 文件将生成在：

```
android/app/build/outputs/apk/release/app-release.apk
```

## 项目结构

```
FuncApp4NAL2/
├── scripts/              # 运行和打包脚本
│   ├── run-app.sh       # 启动 RN App
│   ├── run-server.sh    # 启动 Web 服务器
│   └── build-android-release.sh  # 打包 Android APK
├── server/              # HTTP 测试服务器
│   ├── server.js        # 服务器主文件
│   └── public/          # Web 测试页面
├── components/          # React Native 组件
├── modules/nal2/        # NAL2 原生模块
├── input_json_data/     # 测试数据文件
├── tests/               # 自动化测试
└── README.md            # 本文件
```

## 常见问题

### App 无法启动

1. 确保已安装依赖：`npm install`
2. 清理缓存：`npm start -- --reset-cache`
3. 检查设备连接：`adb devices`

### 端口被占用

如果 3000 端口被占用，关闭占用的进程：

```bash
lsof -ti:3000 | xargs kill -9
```

### 无法连接到 App

1. 确保 App 已运行
2. 检查设备和电脑在同一网络
3. 在 App 中查看正确的 IP 和端口

## 更多文档

- **API 调用文档**：查看 `API_GUIDE.md`
- **NAL2 DLL 文档**：查看 `NAL-NL2 DLL Ver 1.0.0.0 documentation.pdf`
- **测试说明**：查看 `tests/README.md`

## 技术支持

如有问题，请检查：

1. Node.js 版本是否符合要求
2. Android 开发环境是否配置正确
3. 网络连接是否正常
