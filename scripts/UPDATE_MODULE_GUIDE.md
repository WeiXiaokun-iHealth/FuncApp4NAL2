# NAL2 模块更新指南

## 快速使用

当你修改了 `modules/nal2/` 目录下的任何代码后，运行以下命令一键更新并重新运行 Android 应用：

```bash
./scripts/update-and-run-android.sh
```

## 脚本功能

此脚本会自动完成以下步骤：

1. **打包 NAL2 模块** 📦

   - 进入 `modules/nal2/` 目录
   - 删除旧的打包文件
   - 使用 yarn 打包生成新的 `.tgz` 文件

2. **安装更新后的模块** 📥

   - 强制安装本地打包的模块到 `node_modules/`
   - 覆盖原有的 `react-native-nal2` 模块

3. **清理 Android 缓存** 🧹

   - 运行 `./gradlew clean` 清理构建缓存
   - 确保使用最新的代码重新编译

4. **重新编译并运行 Android** 🚀
   - 执行 `yarn android` 重新编译并启动应用
   - 自动部署到已连接的 Android 设备或模拟器

## 使用场景

### 场景 1: 修改了 Java/Kotlin 代码

```bash
# 编辑 modules/nal2/android/src/main/java/com/nal2/*.java
# 或 modules/nal2/android/src/main/java/com/nal2/*.kt

# 运行更新脚本
./scripts/update-and-run-android.sh
```

### 场景 2: 修改了 TypeScript 导出

```bash
# 编辑 modules/nal2/src/index.tsx

# 运行更新脚本
./scripts/update-and-run-android.sh
```

### 场景 3: 修改了原生配置

```bash
# 编辑 modules/nal2/android/build.gradle
# 或其他配置文件

# 运行更新脚本
./scripts/update-and-run-android.sh
```

## 输出示例

```
========================================
  NAL2 模块更新和 Android 重新运行
========================================

[1/4] 打包 NAL2 模块...
✓ 模块打包成功

[2/4] 安装更新后的模块到 node_modules...
✓ 模块安装成功

[3/4] 清理 Android 缓存...
✓ Android 缓存清理完成

[4/4] 重新编译并运行 Android 应用...
这可能需要几分钟时间...

========================================
  ✓ Android 应用启动成功！
========================================
```

## 故障排除

### 错误: Permission denied

```bash
# 添加执行权限
chmod +x scripts/update-and-run-android.sh
```

### 错误: gradlew not found

确保你在项目根目录运行脚本：

```bash
cd /path/to/FuncApp4NAL2
./scripts/update-and-run-android.sh
```

### 编译失败

如果脚本在第 4 步失败：

1. 检查 Android Studio 中的错误日志
2. 确认修改的代码没有语法错误
3. 手动运行 `yarn android` 查看详细错误信息

## 手动步骤（如果脚本失败）

如果自动化脚本失败，可以手动执行每一步：

```bash
# 1. 打包模块
cd modules/nal2
rm -f react-native-nal2-*.tgz
yarn pack --filename react-native-nal2-v0.0.0.tgz
cd ../..

# 2. 安装模块
yarn add file:./modules/nal2/react-native-nal2-v0.0.0.tgz --force

# 3. 清理缓存
cd android
./gradlew clean
cd ..

# 4. 运行应用
yarn android
```

## 相关文件

- **脚本位置**: `scripts/update-and-run-android.sh`
- **NAL2 模块**: `modules/nal2/`
- **安装位置**: `node_modules/react-native-nal2/`
- **Android 构建**: `android/`

## 注意事项

⚠️ **重要提示**:

- 每次修改 `modules/nal2/` 中的代码后都需要运行此脚本
- 脚本会强制覆盖 `node_modules` 中的模块
- 确保 Android 设备/模拟器已连接且可用
- 首次运行可能需要较长时间（下载依赖）

## 开发工作流

推荐的开发流程：

1. 修改 `modules/nal2/` 中的代码
2. 运行 `./scripts/update-and-run-android.sh`
3. 等待应用启动
4. 测试功能
5. 如需继续修改，重复步骤 1-4

## 其他有用的脚本

- `./scripts/start-all.sh` - 启动所有服务（应用 + WebSocket 服务器）
- `./scripts/stop-all.sh` - 停止所有服务
- `./scripts/wifi-debug.sh` - 启用 WiFi 调试

## 技术支持

如有问题，请检查：

- NAL2 集成指南: `NAL2_INTEGRATION_GUIDE.md`
- Android Studio 运行指南: `ANDROID_STUDIO_RUN_GUIDE.md`
- WebSocket API 文档: `WEBSOCKET_API.md`
