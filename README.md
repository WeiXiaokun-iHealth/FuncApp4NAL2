# FunApp4NAL2

React Native 应用，集成 NAL2 模块和参数管理系统。

## 🚀 快速开始

### 一键启动（推荐）

```bash
# 编辑config.json设置你的IP地址
# 然后运行：
npm run start-all
```

这个命令会自动完成所有启动步骤！

### 传统启动方式

1. **更新配置**

```bash
npm run update-config
```

2. **启动服务器**（新终端）

```bash
cd server
npm install
npm start
```

3. **启动 Metro**（新终端）

```bash
npm start
```

4. **运行 App**（新终端）

```bash
npm run android
```

## 📋 配置管理

所有配置集中在 `config.json` 中：

```json
{
  "serverIP": "172.29.1.253",
  "serverPort": 3000,
  "metroPort": 8081
}
```

修改配置后运行：

```bash
npm run update-config
```

详细说明请查看 [配置管理指南](CONFIG_GUIDE.md)

## 📝 可用命令

| 命令                    | 说明                                 |
| ----------------------- | ------------------------------------ |
| `npm run start-all`     | 一键启动所有服务（服务器+Metro+App） |
| `npm run update-config` | 更新配置到所有文件                   |
| `npm run stop`          | 停止所有服务                         |
| `npm start`             | 仅启动 Metro Bundler                 |
| `npm run android`       | 仅运行 Android 应用                  |

## 🎯 功能特点

### React Native App

- NAL2 函数测试页面
- HTTP API 参数接收
- Input/Output 实时显示
- 错误处理机制

### 参数管理服务器

- Web 管理界面
- RESTful API
- 历史记录管理
- 数据持久化存储

## 📂 项目结构

```
FuncApp4NAL2/
├── config.json              # 统一配置文件 ⭐
├── App.js                   # React Native主应用
├── package.json             # 项目依赖
├── CONFIG_GUIDE.md          # 配置管理指南 ⭐
├── USAGE_GUIDE.md           # 完整使用指南 ⭐
├── scripts/                 # 脚本工具
│   ├── update-config.js     # 配置更新脚本
│   ├── start-all.sh         # 一键启动脚本
│   └── stop-all.sh          # 停止服务脚本
├── server/                  # 参数管理服务器
│   ├── server.js            # Express服务器
│   ├── package.json         # 服务器依赖
│   ├── data.json            # 数据存储
│   ├── public/
│   │   └── index.html       # Web管理界面
│   └── README.md            # API文档
├── modules/
│   └── nal2/                # NAL2原生模块
├── android/                 # Android配置
└── ios/                     # iOS配置
```

## 🔧 系统要求

- Node.js (>= 14)
- Yarn 或 npm
- Android Studio（Android 开发）
- Xcode（iOS 开发）
- 手机和电脑在同一 WiFi 网络

## 📱 WiFi 调试

无需 USB 连接，通过 WiFi 直接调试 Android 应用！

### 快速开始

```bash
# 运行 WiFi 调试脚本
./scripts/wifi-debug.sh
```

脚本会自动：

- 检测 USB 连接的设备
- 启用网络调试模式
- 通过 WiFi 连接设备
- 验证连接状态

### 手动设置

如果您的设备是 Android 11+，可以使用无线调试功能：

1. 设备上：**设置** > **开发者选项** > 启用**无线调试**
2. 记下显示的 IP 地址和端口
3. 电脑上运行：`adb pair <IP>:<端口>`
4. 输入配对码
5. 连接：`adb connect <IP>:<端口>`

详细说明请查看 [WiFi 调试指南](WIFI_DEBUG_GUIDE.md)

## 📖 文档

- [配置管理指南](CONFIG_GUIDE.md) - IP 和端口配置
- [完整使用指南](USAGE_GUIDE.md) - 详细使用说明
- [WiFi 调试指南](WIFI_DEBUG_GUIDE.md) - 无线调试设置 ⭐
- [服务器文档](server/README.md) - API 接口文档
- [运行指南](RUN_APP.md) - 应用运行说明

## 🎬 使用流程

1. **配置 IP 地址**: 编辑 `config.json`
2. **一键启动**: `npm run start-all`
3. **Web 管理**: 浏览器访问 `http://localhost:3000`
4. **设置参数**: 在 Web 界面设置 Input/Output
5. **点击设置为当前参数**
6. **App 接收**: 手机 App 点击"接收参数"按钮
7. **查看结果**: 在 Input 和 Output 区域查看数据

## 💡 典型场景

### 首次使用

```bash
# 1. 获取你的IP地址
ifconfig | grep "inet " | grep -v 127.0.0.1

# 2. 编辑config.json，设置serverIP

# 3. 一键启动
npm run start-all
```

### IP 地址变化

```bash
# 1. 编辑config.json，更新serverIP
# 2. 更新配置
npm run update-config
# 3. 重启服务
npm run stop
npm run start-all
```

## 🐛 故障排除

### App 连接不上服务器

1. 确认已运行 `npm run update-config`
2. 确认手机和电脑在同一网络
3. 检查防火墙设置

### 端口被占用

编辑 `config.json` 修改端口号，然后：

```bash
npm run update-config
```

### 脚本无法执行

```bash
chmod +x scripts/*.sh
```

## 📞 技术支持

遇到问题请查看：

1. [配置管理指南](CONFIG_GUIDE.md)
2. [完整使用指南](USAGE_GUIDE.md)
3. 终端错误输出

## 📄 License

UNLICENSED
