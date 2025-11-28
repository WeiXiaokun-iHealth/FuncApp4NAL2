#!/bin/bash

# 重新构建并安装Android应用
# 用于清除缓存并使用最新代码
#
# 重要说明：
# 1. 此脚本会先更新 NAL2 模块（modules/nal2 -> node_modules）
# 2. 然后清理所有缓存并重新构建应用
# 3. 最后自动启动应用
#
# 使用场景：
#   - 修改了 modules/nal2 中的 Android/iOS 原生代码
#   - 遇到代码不一致或缓存问题
#   - 需要完全重新构建应用
#
# 使用方法：
#   yarn android:rebuild

echo "🔄 开始重新构建Android应用..."

# 0. 更新NAL2模块（将modules/nal2的更改应用到node_modules）
echo "📦 更新NAL2模块..."
bash scripts/update-nal2-module.sh

# 1. 清理Android构建缓存
echo "📦 清理Android构建缓存..."
cd android
./gradlew clean
cd ..

# 2. 清理React Native缓存
echo "🧹 清理React Native缓存..."
rm -rf node_modules/.cache
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*

# 3. 重新安装依赖（可选，如果需要）
# echo "📥 重新安装依赖..."
# npm install

# 4. 重新构建并安装
echo "🔨 重新构建并安装应用..."
cd android
./gradlew installDebug
cd ..

echo "✅ 重新构建完成！"
echo ""
echo "🚀 正在启动应用..."
npx react-native run-android

echo ""
echo "💡 提示：如果还是看到旧日志，请尝试："
echo "   1. 完全卸载应用: adb uninstall com.funcapp.nal2"
echo "   2. 重新安装: cd android && ./gradlew installDebug"
