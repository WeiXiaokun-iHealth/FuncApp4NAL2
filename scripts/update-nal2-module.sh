#!/bin/bash

# 更新 react-native-nal2 模块的脚本

set -e  # 遇到错误立即退出

echo "========================================
  更新 NAL2 模块
========================================"

# 进入模块目录
cd modules/nal2

# 清理旧的打包文件
echo "步骤 1: 清理旧的打包文件..."
rm -f react-native-nal2-v*.tgz

# 打包模块
echo "步骤 2: 打包模块..."
yarn pack --filename react-native-nal2-v0.0.0.tgz

# 返回项目根目录
cd ../..

# 安装更新的模块
echo "步骤 3: 安装更新的模块..."
yarn add file:./modules/nal2/react-native-nal2-v0.0.0.tgz --force

echo "========================================
  ✓ NAL2 模块更新完成！
========================================"
