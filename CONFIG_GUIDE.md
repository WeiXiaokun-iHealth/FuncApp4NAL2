# 配置管理指南

本文档介绍如何使用统一配置系统管理 FunApp4NAL2 的 IP 和端口配置。

## 📋 配置文件

所有配置集中在项目根目录的 `config.json` 文件中：

```json
{
  "serverIP": "172.29.1.253",
  "serverPort": 3000,
  "metroPort": 8081
}
```

### 配置项说明

- **serverIP**: 你的电脑 IP 地址（手机需要通过这个地址访问服务器）
- **serverPort**: 参数管理服务器的端口号（默认 3000）
- **metroPort**: Metro Bundler 的端口号（默认 8081）

## 🔧 修改配置

### 自动检测 IP（推荐）

**每次运行时自动检测当前 IP 地址**，无需手动修改：

```bash
npm run update-config
```

或者：

```bash
yarn update-config
```

脚本会：

1. 自动检测当前电脑的 WiFi IP 地址
2. 如果 IP 变化，自动更新 `config.json`
3. 更新 `App.js` 中的 API 地址

**优势**：

- ✅ 无需手动查找 IP 地址
- ✅ 切换 WiFi 网络后自动适配
- ✅ 避免配置错误

### 手动修改配置

如果需要手动指定 IP 地址：

1. 打开 `config.json` 文件
2. 修改配置项：

```json
{
  "serverIP": "192.168.1.100",
  "serverPort": 3000,
  "metroPort": 8081
}
```

3. 运行配置更新命令：

```bash
npm run update-config
```

## 🚀 一键启动

配置好之后，可以使用一键启动命令：

```bash
npm run start-all
```

或者：

```bash
yarn start-all
```

这个命令会：

1. 自动更新配置到所有文件
2. 检查并安装服务器依赖
3. 启动参数管理服务器
4. 启动 Metro Bundler
5. 构建并运行 Android 应用

## 🛑 停止所有服务

```bash
npm run stop
```

或者：

```bash
yarn stop
```

这个命令会停止：

- 参数管理服务器
- Metro Bundler
- 其他相关进程

## 📝 可用命令

在项目根目录运行：

| 命令                    | 说明                 |
| ----------------------- | -------------------- |
| `npm run update-config` | 更新配置到所有文件   |
| `npm run start-all`     | 一键启动所有服务     |
| `npm run stop`          | 停止所有服务         |
| `npm start`             | 仅启动 Metro Bundler |
| `npm run android`       | 仅运行 Android 应用  |

## 🔍 获取 IP 地址

### macOS/Linux

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

或者：

```bash
ipconfig getifaddr en0
```

### Windows

```bash
ipconfig
```

查找"无线局域网适配器"或"以太网适配器"下的 IPv4 地址。

## 💡 使用场景

### 场景 1: IP 地址变化（自动处理）

**推荐做法**：每次运行时都会自动检测并更新 IP

当你切换 WiFi 网络后：

```bash
npm run start-all
```

脚本会自动：

1. ✅ 检测新的 IP 地址
2. ✅ 更新 `config.json`
3. ✅ 更新所有相关文件
4. ✅ 启动服务

**手动处理**（如需要）：

1. 运行 `npm run update-config` 检测并更新 IP
2. 重新启动应用

### 场景 2: 端口冲突

如果默认端口被占用：

1. 编辑 `config.json` 修改 `serverPort` 或 `metroPort`
2. 运行 `npm run update-config`
3. 重新启动服务

### 场景 3: 首次使用

1. 获取你的 IP 地址
2. 编辑 `config.json` 设置正确的 IP
3. 运行 `npm run start-all` 一键启动

## 🔧 高级用法

### 仅更新配置不启动

```bash
npm run update-config
```

### 自定义启动流程

如果需要自定义启动流程，可以编辑：

- `scripts/start-all.sh` - 启动脚本
- `scripts/stop-all.sh` - 停止脚本
- `scripts/update-config.js` - 配置更新脚本

## 📌 注意事项

1. **确保手机和电脑在同一 WiFi 网络**
2. **IP 地址格式**: 必须是有效的 IPv4 地址格式（如 192.168.1.100）
3. **端口号**: 必须是 1024-65535 之间的数字，且未被占用
4. **配置更新**: 修改 `config.json` 后必须运行 `update-config` 命令
5. **重启应用**: 配置更新后需要重新启动服务和应用

## 🐛 故障排除

### 问题 1: 配置更新失败

**现象**: 运行 `update-config` 报错

**解决**:

1. 检查 `config.json` 格式是否正确（必须是有效 JSON）
2. 检查 IP 地址格式是否正确
3. 确保端口号是数字类型

### 问题 2: 一键启动失败

**现象**: `start-all` 命令无法执行

**解决**:

1. 确保脚本有执行权限: `chmod +x scripts/*.sh`
2. 检查是否安装了必要的依赖
3. 查看终端输出的具体错误信息

### 问题 3: App 连接不上服务器

**现象**: App 显示连接错误

**解决**:

1. 确认已运行 `npm run update-config`
2. 确认手机和电脑在同一网络
3. 在手机浏览器访问 `http://你的IP:3000` 测试连接
4. 检查防火墙设置

## 📖 相关文档

- [完整使用指南](USAGE_GUIDE.md) - 详细使用说明
- [服务器文档](server/README.md) - API 接口文档
- [运行指南](RUN_APP.md) - 应用运行说明
