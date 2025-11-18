#!/bin/bash

# NAL2模块更新脚本
# 用途: 重新打包NAL2模块并安装到主项目

echo "========================================="
echo "NAL2模块更新脚本"
echo "========================================="

# 进入NAL2模块目录
cd modules/nal2

echo ""
echo "1. 打包NAL2模块..."
npm pack

# 获取生成的包文件名
PACKAGE_FILE=$(ls -t react-native-nal2-*.tgz | head -1)

if [ -z "$PACKAGE_FILE" ]; then
    echo "❌ 错误: 未找到打包文件"
    exit 1
fi

echo "✅ 打包完成: $PACKAGE_FILE"

# 返回主项目目录
cd ../..

echo ""
echo "2. 删除旧的node_modules中的nal2模块..."
rm -rf node_modules/react-native-nal2

echo ""
echo "3. 安装新的NAL2模块..."
npm install ./modules/nal2/$PACKAGE_FILE

if [ $? -eq 0 ]; then
    echo "✅ NAL2模块安装成功"
else
    echo "❌ NAL2模块安装失败"
    exit 1
fi

echo ""
echo "4. 清理Android构建缓存..."
cd android
./gradlew clean

cd ..

echo ""
echo "========================================="
echo "✅ NAL2模块更新完成！"
echo "========================================="
echo ""
echo "下一步: 重新运行App"
echo "  npm run android"
echo ""
