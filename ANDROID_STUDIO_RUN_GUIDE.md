# 如何在 Android Studio 中运行 FuncApp4NAL2

## 📱 步骤 1：确保 Android 设备被识别

### 1.1 在手机上启用 USB 调试

1. 打开**设置** → **关于手机**
2. 连续点击**版本号** 7 次，启用**开发者选项**
3. 返回**设置** → **系统** → **开发者选项**
4. 启用 **USB 调试**
5. 启用 **USB 安装**（如果有这个选项）

### 1.2 连接并授权设备

1. 用 USB 线连接手机到电脑
2. 手机上会弹出**允许 USB 调试**对话框
3. 勾选**始终允许这台电脑**
4. 点击**允许**

### 1.3 验证设备连接

在终端运行：

```bash
/Users/weixiaokun/Library/Android/sdk/platform-tools/adb devices
```

应该显示类似：

```
List of devices attached
XXXXXX          device
```

如果显示 `unauthorized`，请在手机上重新授权。

## 🚀 步骤 2：在 Android Studio 中打开项目

### 2.1 打开项目

1. 启动 **Android Studio**
2. 选择 **File** → **Open**
3. 导航到项目的 `android` 目录：
   ```
   /Users/weixiaokun/HearingProject/FuncApp4NAL2/android
   ```
4. 点击 **Open**

### 2.2 等待 Gradle 同步

- Android Studio 会自动同步 Gradle
- 等待底部状态栏显示 "Gradle build finished"
- 如果出现错误，点击 "Sync Now" 或 "Try Again"

## ▶️ 步骤 3：启动 Metro Bundler

在运行应用前，必须先启动 Metro Bundler。

**打开终端**（项目根目录），运行：

```bash
# 方法 1：使用 npm
npm start

# 方法 2：使用 yarn
yarn start
```

等待看到：

```
Metro waiting on exp://[IP地址]:8081
```

**保持这个终端运行**，不要关闭！

## 📲 步骤 4：在 Android Studio 中运行应用

### 4.1 选择设备

1. 在 Android Studio 顶部工具栏，点击设备下拉菜单
2. 应该能看到你的 Android 设备名称
3. 选择你的设备

### 4.2 运行应用

点击绿色的 **Run** 按钮（▶️）或按 `Shift + F10`

### 4.3 等待应用安装

- Android Studio 会编译并安装 APK 到你的设备
- 首次运行可能需要几分钟
- 观察底部的 "Run" 标签页查看进度

## ✅ 步骤 5：验证应用运行

应用成功启动后：

1. **手机上**应该自动打开 FuncApp4NAL2 应用
2. **应该看到**：
   - 标题 "FuncApp4NAL2"
   - 副标题 "React Native + NAL2 Module"
   - "Test NAL2 Module" 按钮

如果看到白屏或错误：

1. 确保 Metro Bundler 正在运行
2. 在手机上摇动设备打开开发者菜单
3. 选择 "Reload"

## 🔧 方法 2：使用命令行运行（推荐）

如果 Android Studio 运行有问题，可以使用命令行：

### 1. 启动 Metro（终端 1）

```bash
npm start
```

### 2. 运行 Android（终端 2）

```bash
npm run android
```

这会自动：

- 编译应用
- 安装到已连接的设备
- 启动应用

## ⚡ 一键启动（最简单）

项目提供了一键启动脚本：

```bash
npm run start-all
```

这会自动启动：

- 参数管理服务器
- Metro Bundler
- Android 应用

## 🐛 常见问题

### 问题 1：设备显示 "offline" 或 "unauthorized"

**解决方案**：

```bash
# 重启 adb
/Users/weixiaokun/Library/Android/sdk/platform-tools/adb kill-server
/Users/weixiaokun/Library/Android/sdk/platform-tools/adb start-server
/Users/weixiaokun/Library/Android/sdk/platform-tools/adb devices
```

在手机上重新授权 USB 调试。

### 问题 2：Metro Bundler 连接失败

**解决方案**：

1. 确保手机和电脑在**同一 WiFi 网络**
2. 编辑 `config.json`，设置正确的 IP 地址：

```bash
# 获取你的 IP 地址
ifconfig | grep "inet " | grep -v 127.0.0.1
```

3. 更新配置：

```bash
npm run update-config
```

4. 重启 Metro：

```bash
# 停止当前的 Metro（Ctrl+C）
npm start
```

### 问题 3：Gradle 同步失败

**解决方案**：

```bash
cd android
./gradlew clean
cd ..
```

然后在 Android Studio 中重新同步。

### 问题 4：端口被占用

**解决方案**：

```bash
# 查看占用端口的进程
lsof -i :8081

# 杀掉进程
kill -9 [PID]

# 或者直接杀掉所有 node 进程
pkill -f node
```

### 问题 5：应用安装失败

**解决方案**：

```bash
# 卸载旧版本
/Users/weixiaokun/Library/Android/sdk/platform-tools/adb uninstall com.funcapp.nal2

# 重新安装
npm run android
```

## 📝 设置 adb 环境变量（可选）

为了方便使用 `adb` 命令，可以添加到环境变量：

```bash
# 编辑 ~/.zshrc
echo 'export PATH=$PATH:/Users/weixiaokun/Library/Android/sdk/platform-tools' >> ~/.zshrc

# 重新加载配置
source ~/.zshrc

# 现在可以直接使用
adb devices
```

## 🎯 推荐工作流程

### 日常开发

1. **打开 Android Studio**（保持打开以便查看日志）
2. **启动 Metro**：`npm start`
3. **运行应用**：在 Android Studio 点击 Run 或使用 `npm run android`
4. **开发时**：
   - 修改代码后，在手机上双击 R 键快速刷新
   - 或摇动设备 → 选择 "Reload"

### 首次运行

1. **检查设备**：`/Users/weixiaokun/Library/Android/sdk/platform-tools/adb devices`
2. **配置 IP**：编辑 `config.json`
3. **更新配置**：`npm run update-config`
4. **一键启动**：`npm run start-all`

## 📚 相关文档

- [README.md](README.md) - 项目概述
- [配置管理指南](CONFIG_GUIDE.md) - IP 和端口配置
- [WiFi 调试指南](WIFI_DEBUG_GUIDE.md) - 无线调试设置
- [运行指南](RUN_APP.md) - 应用运行说明

## 💡 提示

- **首次运行**需要下载依赖，耗时较长
- **保持 Metro Bundler 运行**在后台
- **使用热重载**提高开发效率（修改代码后自动刷新）
- **查看日志**：Android Studio 底部的 Logcat 标签页
- **使用 WiFi 调试**免去 USB 线的麻烦（参见 WiFi_DEBUG_GUIDE.md）
