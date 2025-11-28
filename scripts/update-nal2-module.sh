#!/bin/bash

# 更新 react-native-nal2 模块的脚本
# 
# 重要说明：
# 1. yarn add --force 不会真正强制更新本地文件包
# 2. 必须先删除 node_modules/react-native-nal2 才能确保更新
# 3. 如果遇到代码不一致问题，运行 yarn cache clean 清理缓存
#
# 使用方法：
#   yarn update:nal2              # 仅更新模块
#   yarn android:rebuild          # 更新模块 + 重新构建应用

set -e  # 遇到错误立即退出

echo "========================================"
echo "  更新 NAL2 模块"
echo "========================================"

# 进入模块目录
cd modules/nal2

# 清理所有旧的打包文件（包括有v和没有v的）
echo "步骤 1: 清理旧的打包文件..."
rm -f react-native-nal2*.tgz

# 打包模块（使用统一的文件名）
echo "步骤 2: 打包模块..."
yarn pack --filename react-native-nal2-0.0.0.tgz

# 返回项目根目录
cd ../..

# 删除旧模块并安装新模块
echo "步骤 3: 删除旧模块..."
rm -rf node_modules/react-native-nal2

echo "步骤 4: 安装更新的模块..."
yarn add file:./modules/nal2/react-native-nal2-0.0.0.tgz

echo "========================================"
echo "  ✓ NAL2 模块更新完成！"
echo "========================================"
