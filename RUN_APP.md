# 如何运行 FuncApp4NAL2

## 问题说明

应用构建成功，但 Metro bundler 端口可能不匹配。

## 解决方案

### 方法 1：重新启动（推荐）

1. **关闭所有运行的进程**
   - 在终端中按 `Ctrl+C` 停止所有 yarn 命令
2. **清理并重新启动**

   ```bash
   # 杀掉所有node进程
   pkill -f node

   # 等待几秒钟

   # 重新启动Metro bundler
   yarn start
   ```

3. **在另一个终端运行 Android 应用**
   ```bash
   yarn android
   ```

### 方法 2：在手机上手动操作

1. 在手机上打开 FuncApp4NAL2 应用
2. 摇动手机打开开发者菜单
3. 选择 "Settings"
4. 修改 "Debug server host & port" 为: `172.29.1.253:8082`
5. 返回并选择 "Reload"

### 方法 3：使用开发者模式 URL

在手机的 FuncApp4NAL2 应用中，应该连接到：

```
exp+funcapp4nal2://expo-development-client/?url=http%3A%2F%2F172.29.1.253%3A8082
```

## 验证应用运行

应用成功启动后，你应该看到：

- 标题 "FuncApp4NAL2"
- 副标题 "React Native + NAL2 Module"
- 一个 "Test NAL2 Module" 按钮

点击按钮后应该显示：

- "NAL2 module loaded successfully!" 或相关消息

## 故障排除

如果仍然出现 500 错误：

1. **检查 Metro bundler 是否正常运行**

   ```bash
   # 在终端查看是否有错误输出
   ```

2. **清理缓存**

   ```bash
   yarn start --clear
   ```

3. **完全重新安装**

   ```bash
   # 停止所有进程
   pkill -f node

   # 删除node_modules和重新安装
   rm -rf node_modules
   yarn install

   # 清理Android构建
   cd android && ./gradlew clean && cd ..

   # 重新启动
   yarn start
   # 在另一个终端
   yarn android
   ```
