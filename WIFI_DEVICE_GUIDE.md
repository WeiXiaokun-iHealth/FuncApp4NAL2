# Android WiFi 设备运行指南

本指南介绍如何通过 WiFi 无线方式在 Android 设备上运行应用。

## 快速开始

### 使用一键运行脚本（推荐）

我们提供了一个自动化脚本来简化整个流程：

```bash
# 使用默认 IP 地址 (172.29.2.68)
./scripts/run-wifi-device.sh

# 或指定其他 IP 地址
./scripts/run-wifi-device.sh 192.168.1.100
```

该脚本会自动：

1. 检测设备连接状态
2. 如果检测到 USB 设备，自动启用 WiFi 调试
3. 尝试通过 WiFi 连接设备
4. 构建并安装应用
5. 启动应用

## 首次设置

### 方法一：使用脚本自动设置（推荐）

1. 用 USB 线连接手机到电脑
2. 手机上允许 USB 调试授权
3. 运行脚本：
   ```bash
   ./scripts/run-wifi-device.sh
   ```
4. 脚本会自动启用 WiFi 调试
5. 按提示拔掉 USB 线
6. 应用会自动安装并启动

### 方法二：手动设置

如果脚本无法自动设置，可以手动操作：

1. **USB 连接并启用 WiFi 调试**

   ```bash
   # 连接 USB 并验证
   adb devices

   # 启用 TCP/IP 模式
   adb tcpip 5555
   ```

2. **获取手机 IP 地址**

   - 进入手机「设置」→「关于手机」→「状态信息」
   - 或「设置」→「WLAN」→ 点击已连接的网络
   - 记下 IP 地址（例如：172.29.2.68）

3. **通过 WiFi 连接**

   ```bash
   adb connect <手机IP>:5555
   # 例如: adb connect 172.29.2.68:5555
   ```

4. **验证连接**

   ```bash
   adb devices
   # 应该看到类似: 172.29.2.68:5555    device
   ```

5. **拔掉 USB 线**

6. **运行应用**
   ```bash
   npx react-native run-android --deviceId=<手机IP>:5555
   ```

## 常用操作

### 查看已连接的设备

```bash
adb devices
# 或更详细的信息
adb devices -l
```

### 断开 WiFi 连接

```bash
# 断开特定设备
adb disconnect 172.29.2.68:5555

# 断开所有设备
adb disconnect
```

### 切换回 USB 模式

如果之后需要通过 USB 连接：

```bash
adb -s <设备IP>:5555 usb
```

### 重启 ADB 服务

如果遇到连接问题：

```bash
adb kill-server
adb start-server
```

### 重新连接设备

```bash
./scripts/run-wifi-device.sh
```

## 脚本功能说明

`run-wifi-device.sh` 脚本提供以下功能：

1. **智能设备检测**

   - 自动检测是否已通过 WiFi 连接
   - 如果未连接，尝试自动连接

2. **USB 设备自动配置**

   - 检测 USB 连接的设备
   - 自动为其启用 TCP/IP 模式
   - 提示用户拔掉 USB 线

3. **Metro Bundler 管理**

   - 检测 Metro bundler 是否运行
   - 如果未运行，自动在后台启动

4. **应用构建和安装**

   - 自动构建 Android 应用
   - 安装到指定的 WiFi 设备
   - 启动应用

5. **彩色输出**
   - 清晰的步骤提示
   - 成功/失败状态显示
   - 错误提示和解决建议

## 故障排除

### 连接失败

**问题：** `failed to connect to 'xxx:5555': Connection refused`

**解决方案：**

1. 确保手机和电脑在同一 WiFi 网络
2. 检查手机 IP 地址是否正确
3. 确认手机已开启 USB 调试
4. 尝试用 USB 重新设置

### 设备离线

**问题：** 设备显示为 `offline`

**解决方案：**

```bash
adb disconnect
adb kill-server
adb start-server
adb connect <手机IP>:5555
```

### 安装失败 - 版本降级

**问题：** `INSTALL_FAILED_VERSION_DOWNGRADE`

**解决方案：**

```bash
# 卸载旧版本
adb -s <手机IP>:5555 uninstall com.funcapp.nal2

# 重新安装
./scripts/run-wifi-device.sh
```

### Metro Bundler 连接失败

**问题：** 应用无法连接到 Metro bundler

**解决方案：**

1. 在手机上打开应用的开发菜单（摇动手机）
2. 点击「Settings」
3. 点击「Debug server host & port for device」
4. 输入电脑的 IP 地址和端口（例如：192.168.1.50:8081）
5. 重新加载应用

### WiFi 连接不稳定

**解决方案：**

1. 确保 WiFi 信号强度良好
2. 在手机「开发者选项」中启用「保持唤醒」
3. 考虑为手机设置静态 IP 地址
4. 检查防火墙设置，允许 ADB 端口（5555）

## 性能提示

- WiFi 传输速度通常比 USB 慢
- 首次安装大型应用建议使用 USB
- 后续开发调试可以使用 WiFi
- 确保良好的 WiFi 信号质量

## 安全建议

- 不要在公共 WiFi 网络上使用 WiFi 调试
- 完成调试后，建议关闭 WiFi 调试：
  ```bash
  adb disconnect
  # 或在手机上关闭 USB 调试
  ```
- 定期检查授权的调试设备

## 支持的 Android 版本

### Android 10 及以下

- 需要先通过 USB 启用 TCP/IP 模式
- 使用本指南中的方法

### Android 11 及以上

- 支持无线调试功能（无需 USB）
- 可以在手机「开发者选项」→「无线调试」中配对

## 相关文档

- [WIFI_DEBUG_GUIDE.md](./WIFI_DEBUG_GUIDE.md) - 详细的 WiFi 调试指南
- [RUN_APP.md](./RUN_APP.md) - 应用运行指南
- [README.md](./README.md) - 项目说明文档

## 常见场景

### 场景 1：日常开发

```bash
# 早上到办公室，手机和电脑在同一 WiFi
./scripts/run-wifi-device.sh

# 开发过程中，代码会自动热重载
# 如需重新安装，再次运行脚本即可
```

### 场景 2：更换 WiFi 网络

```bash
# 1. 断开旧连接
adb disconnect

# 2. 确保手机和电脑连接到新的 WiFi
# 3. 获取手机新的 IP 地址
# 4. 使用新 IP 运行脚本
./scripts/run-wifi-device.sh 新IP地址
```

### 场景 3：多设备测试

```bash
# 设备 1
./scripts/run-wifi-device.sh 172.29.2.68

# 设备 2
./scripts/run-wifi-device.sh 172.29.2.69

# 查看所有连接的设备
adb devices
```

## 技术支持

如有问题，请：

1. 查看本指南的「故障排除」部分
2. 检查 [WIFI_DEBUG_GUIDE.md](./WIFI_DEBUG_GUIDE.md)
3. 查看 ADB 日志：`adb logcat`

---

**最后更新：** 2025/11/20
