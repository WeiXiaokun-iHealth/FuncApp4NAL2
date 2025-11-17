#!/bin/bash

echo "🚀 FunApp4NAL2 一键启动脚本"
echo "================================"

# 获取脚本所在目录的父目录（项目根目录）
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# 1. 更新配置
echo "📝 步骤1: 更新配置文件..."
node scripts/update-config.js

if [ $? -ne 0 ]; then
    echo "❌ 配置更新失败"
    exit 1
fi

# 2. 安装server依赖（如果需要）
if [ ! -d "server/node_modules" ]; then
    echo ""
    echo "📦 步骤2: 安装服务器依赖..."
    cd server
    npm install
    cd ..
else
    echo ""
    echo "✅ 步骤2: 服务器依赖已安装"
fi

# 3. 启动服务器（后台运行）
echo ""
echo "🌐 步骤3: 启动参数管理服务器..."
cd server
npm start &
SERVER_PID=$!
cd ..

echo "   服务器PID: $SERVER_PID"
sleep 2

# 4. 启动Metro Bundler（后台运行）
echo ""
echo "📱 步骤4: 启动Metro Bundler..."
yarn start &
METRO_PID=$!

echo "   Metro PID: $METRO_PID"
sleep 3

# 5. 运行Android应用
echo ""
echo "🤖 步骤5: 构建并运行Android应用..."
yarn android

# 保存PID以便后续清理
echo $SERVER_PID > .server.pid
echo $METRO_PID > .metro.pid

echo ""
echo "================================"
echo "✨ 启动完成！"
echo ""
echo "📌 进程信息:"
echo "   服务器PID: $SERVER_PID"
echo "   Metro PID: $METRO_PID"
echo ""
echo "🛑 停止所有服务请运行: npm run stop"
echo "================================"
