# 调试指南 - WebSocket 服务器启动问题

## 当前问题

服务器日志显示"启动成功"，但实际端口未监听，Web 端无法连接。

## 调试步骤

### 1. 查看详细日志

```bash
# 清空旧日志
adb logcat -c

# 启动App后立即查看日志
adb logcat | grep -E "(AppServer|WebSocket|JavaWebSocket|Exception|Error|FATAL)"
```

### 2. 检查特定错误

```bash
# 检查类加载错误
adb logcat | grep "ClassNotFoundException"

# 检查网络错误
adb logcat | grep "bind"

# 检查权限错误
adb logcat | grep "SecurityException"
```

### 3. 完整日志输出

```bash
# 保存完整日志到文件
adb logcat > app_log.txt
# 然后搜索关键词：WebSocket, AppServer, Exception
```

## 可能的错误和解决方案

### 错误 1: ClassNotFoundException

**症状：**

```
java.lang.ClassNotFoundException: org.java_websocket.server.WebSocketServer
```

**原因：** Java-WebSocket 库未正确打包

**解决：**

```bash
cd android
./gradlew clean
./gradlew assembleDebug --stacktrace
```

### 错误 2: BindException

**症状：**

```
java.net.BindException: Address already in use
```

**原因：** 端口真的被占用

**解决：**

```bash
# 杀死占用端口的进程
adb shell "netstat -tulpn | grep 8080"
```

### 错误 3: SecurityException

**症状：**

```
java.lang.SecurityException: Permission denied
```

**原因：** 缺少 INTERNET 权限

**解决：** 检查 AndroidManifest.xml

### 错误 4: 静默失败

**症状：** 无任何错误日志，但服务器未启动

**原因：** 异常被捕获但未记录

**解决：** 已在代码中添加详细日志

## 修复建议

基于日志输出，采取以下措施：

1. **如果是 ClassNotFoundException**

   - 重新编译项目
   - 确认依赖正确添加

2. **如果是 BindException**

   - 重启 App
   - 使用不同端口

3. **如果无任何日志**
   - 检查原生模块是否正确注册
   - 确认 JavaScript 调用是否到达原生代码

## 下一步

运行完整调试日志收集：

```bash
# 1. 清空日志
adb logcat -c

# 2. 启动App

# 3. 在另一个终端收集日志
adb logcat *:V > full_debug_log.txt

# 4. 等待30秒后停止
# 5. 分析 full_debug_log.txt
```

将日志输出提供给开发团队进行分析。
