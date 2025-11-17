#!/bin/bash

echo "🛑 停止所有服务..."
echo "================================"

# 获取脚本所在目录的父目录（项目根目录）
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# 停止服务器
if [ -f ".server.pid" ]; then
    SERVER_PID=$(cat .server.pid)
    echo "🌐 停止参数管理服务器 (PID: $SERVER_PID)..."
    kill $SERVER_PID 2>/dev/null
    rm .server.pid
    echo "   ✅ 服务器已停止"
else
    echo "   ⚠️  未找到服务器PID文件"
fi

# 停止Metro
if [ -f ".metro.pid" ]; then
    METRO_PID=$(cat .metro.pid)
    echo "📱 停止Metro Bundler (PID: $METRO_PID)..."
    kill $METRO_PID 2>/dev/null
    rm .metro.pid
    echo "   ✅ Metro已停止"
else
    echo "   ⚠️  未找到Metro PID文件"
fi

# 清理其他可能的进程
echo ""
echo "🧹 清理其他相关进程..."
pkill -f "node.*server.js" 2>/dev/null
pkill -f "expo start" 2>/dev/null
pkill -f "react-native start" 2>/dev/null

echo ""
echo "================================"
echo "✨ 所有服务已停止"
echo "================================"
