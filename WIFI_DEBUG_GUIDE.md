# Android WiFi 调试指南

本指南将帮助您设置 Android 设备通过 WiFi 进行调试，无需 USB 连接。

## 前提条件

- Android 设备和开发电脑必须连接到同一个 WiFi 网络
- Android 设备已开启开发者选项和 USB 调试
- 已安装 Android SDK Platform Tools（包含 adb 命令）

## 方法一：通过 USB 首次设置（推荐）

### 步骤 1: USB 连接并启用网络调试

1. 使用 USB 线连接您的 Android 设备到电脑
2. 确认设备已授权 USB 调试
3. 打开终端/命令行，运行以下命令：

```bash
# 验证设备已连接
adb devices

# 设置 adb 监听 TCP/IP 端口 5555
adb tcpip 5555
```

### 步骤 2: 获取设备 IP 地址

在 Android 设备上：

1. 进入 **设置** > **关于手机** > **状态信息**
2. 或 **设置** > **WLAN** > 点击已连接的网络
3. 记下设备的 IP 地址（例如：192.168.1.100）

### 步骤 3: 通过 WiFi 连接

```bash
# 连接到设备（替换为您的实际 IP 地址）
adb connect 192.168.1.100:5555

# 验证连接
adb devices
```

您应该看到类似以下输出：

```
List of devices attached
192.168.1.100:5555    device
```

### 步骤 4: 断开 USB

现在可以安全地断开 USB 线，设备将继续通过 WiFi 连接。

## 方法二：Android 11+ 无线调试（无需 USB）

Android 11 及更高版本支持无需 USB 的无线调试功能。

### 启用无线调试

1. 在 Android 设备上，进入 **设置** > **开发者选项**
2. 找到并启用 **无线调试**
3. 点击 **无线调试**，会显示 IP 地址和端口号

### 配对设备

#### 方法 A：使用配对码

1. 在设备上点击 **使用配对码配对设备**
2. 记下配对码、IP 地址和端口号
3. 在电脑终端运行：

```bash
adb pair 192.168.1.100:12345
# 输入设备上显示的配对码
```

4. 配对成功后连接：

```bash
adb connect 192.168.1.100:54321
```

#### 方法 B：扫描二维码（如果支持）

某些设备支持通过扫描二维码配对。

## 运行 React Native 应用

连接成功后，您可以正常运行应用：

```bash
# Metro bundler
npm start
# 或
yarn start

# 在另一个终端安装并运行
npm run android
# 或
yarn android
```

## 常用命令

```bash
# 查看已连接的设备
adb devices

# 连接到设备
adb connect <设备IP>:5555

# 断开设备
adb disconnect <设备IP>:5555

# 断开所有设备
adb disconnect

# 重启 adb 服务器
adb kill-server
adb start-server

# 查看设备日志
adb logcat

# 安装 APK
adb install app.apk

# 切换回 USB 模式
adb usb
```

## 故障排除

### 问题 1: 无法连接到设备

**解决方案：**

- 确保设备和电脑在同一 WiFi 网络
- 检查防火墙设置，确保允许 ADB 通信（端口 5555）
- 尝试重启 adb 服务器：`adb kill-server && adb start-server`
- 检查设备的 USB 调试是否已启用

### 问题 2: 连接频繁断开

**解决方案：**

- 确保设备不会进入休眠状态（设置 > 开发者选项 > 保持唤醒）
- WiFi 信号要稳定
- 考虑设置设备的静态 IP 地址

### 问题 3: "offline" 状态

**解决方案：**

```bash
adb disconnect
adb kill-server
adb start-server
adb connect <设备IP>:5555
```

### 问题 4: Metro bundler 无法连接

**解决方案：**

1. 摇动设备打开开发菜单
2. 选择 **Settings**
3. 选择 **Debug server host & port for device**
4. 输入电脑的 IP 地址和端口（例如：192.168.1.50:8081）
5. 返回并重新加载应用

## 性能提示

- WiFi 调试可能比 USB 稍慢
- 确保 WiFi 信号强度良好
- 对于大型应用，首次安装建议使用 USB

## 安全提示

- 不在公共 WiFi 网络上使用 WiFi 调试
- 完成调试后，建议关闭 WiFi 调试功能
- 定期检查已授权的调试设备

## 快速脚本

创建一个快速连接脚本：

```bash
#!/bin/bash
# wifi-debug.sh

DEVICE_IP="192.168.1.100"  # 替换为您的设备 IP

# 如果已通过 USB 连接
if adb devices | grep -q "device$"; then
    echo "检测到 USB 连接，启用网络调试..."
    adb tcpip 5555
    sleep 2
fi

# 连接到设备
echo "连接到 $DEVICE_IP:5555..."
adb connect $DEVICE_IP:5555

# 显示连接状态
echo "当前连接的设备："
adb devices
```

使用方法：

```bash
chmod +x wifi-debug.sh
./wifi-debug.sh
```

## 相关文档

- [RUN_APP.md](./RUN_APP.md) - 应用运行指南
- [README.md](./README.md) - 项目说明文档
- [CONFIG_GUIDE.md](./CONFIG_GUIDE.md) - 配置指南

---

**注意：** WiFi 调试功能需要在开发者选项中启用。首次设置时建议使用 USB 连接以确保配置正确。
