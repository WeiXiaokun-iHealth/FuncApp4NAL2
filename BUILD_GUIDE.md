# 构建指南

本文档说明如何使用 yarn 命令来构建和运行 FuncApp4NAL2 应用。

## 所有可用命令

### 0. 启动 NAL2 测试服务器

```bash
yarn server
```

启动 NAL2 测试服务器，提供：

- HTTP API 服务（端口 3000）
- 自动获取并显示局域网 IP
- NAL2 函数调用接口
- 参数管理和历史记录

### 1. 运行 Android 应用（开发模式）

```bash
yarn android
```

这会自动连接设备并安装运行应用。

### 2. 全新安装运行（清理所有缓存）

```bash
yarn android:fresh
```

这会：

- 清理 Metro 缓存
- 清理 Android 构建缓存
- 删除并重新安装所有依赖
- 运行应用

### 3. 构建 Release APK

```bash
yarn android:build:release
```

输出位置：`android/app/build/outputs/apk/release/app-release.apk`

### 4. 一键构建、安装并打开 Release APK

```bash
yarn android:build-install:release
```

这会自动完成：

- 构建 Release APK（包含自动增加 versionCode）
- 检查设备连接
- 安装 APK 到连接的设备（覆盖安装）
- 询问是否启动应用
- 打开 APK 所在目录（macOS 会在 Finder 中选中文件）

**注意**：如果未检测到设备，会询问是否仅构建 APK 而跳过安装。

### 5. 构建 Debug APK

```bash
yarn android:build:debug
```

输出位置：`android/app/build/outputs/apk/debug/app-debug.apk`

### 6. 安装 Release APK

```bash
yarn android:install:release
```

通过 adb 安装已构建的 release APK 到连接的设备。
**注意**：需要先运行命令 3 构建 APK

### 7. 安装 Debug APK

```bash
yarn android:install:debug
```

通过 adb 安装已构建的 debug APK 到连接的设备。
**注意**：需要先运行命令 5 构建 APK

## 清理命令

### 清理 Android 构建缓存

```bash
yarn clean:android
```

### 清理 Metro 缓存

```bash
yarn clean:metro
```

### 清理所有缓存和依赖

```bash
yarn clean:all
```

这会清理：

- Metro 缓存
- Android 构建缓存
- node_modules
- iOS 构建缓存

## iOS 相关

### 运行 iOS 应用

```bash
yarn ios
```

### 安装 CocoaPods 依赖

```bash
yarn ios:pod
```

## 其他命令

### 启动 Metro bundler

```bash
yarn start
```

### 运行测试

```bash
yarn test
```

### 监听模式运行测试

```bash
yarn test:watch
```

## 完整构建流程示例

### 开发调试流程

1. 启动 Metro bundler（可选，会自动启动）

   ```bash
   yarn start
   ```

2. 运行应用
   ```bash
   yarn android
   ```

### Release 构建流程

#### 方式一：一键完成（推荐）

```bash
yarn android:build-install:release
```

这会自动完成构建、安装和打开 APK 目录。

#### 方式二：分步执行

1. 构建 Release APK

   ```bash
   yarn android:build:release
   ```

2. 安装到设备
   ```bash
   yarn android:install:release
   ```

### 遇到问题时的清理流程

```bash
# 完全清理并重新开始
yarn android:fresh
```

## 注意事项

1. **设备连接**：运行 `yarn android` 前确保设备已通过 USB 或 WiFi 连接
2. **Release 签名**：构建 release APK 需要配置签名密钥
3. **端口占用**：Metro bundler 默认运行在 8081 端口
4. **应用服务器**：HTTP 服务器默认运行在 8080 端口

## 故障排查

### 问题：Metro bundler 端口被占用

```bash
# 杀掉占用 8081 端口的进程
lsof -ti:8081 | xargs kill -9
yarn start
```

### 问题：构建失败

```bash
# 清理并重新构建
yarn clean:android
yarn android:build:debug
```

### 问题：依赖问题

```bash
# 完全清理并重新安装
yarn clean:all
yarn install
yarn android
```
