#!/bin/bash

# NAL2 测试服务器运行脚本
# 提供 HTTP API 服务，用于 NAL2 功能测试

echo "🚀 启动 NAL2 测试服务器..."
echo ""

# 进入 server 目录
cd "$(dirname "$0")/../server" || exit 1

# 检查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "⚠️  未找到 node_modules，正在安装依赖..."
    npm install
    echo ""
fi

# 启动服务器
echo "✅ 服务器启动中..."
echo "🌐 HTTP 端口: 3000"
echo "🔗 API 端点: http://localhost:3000/api/nal2/process"
echo "🖥️  测试页面: http://localhost:3000"
echo ""
echo "功能："
echo "  - NAL2 函数 HTTP API 调用"
echo "  - NAL2 自动化测试"
echo "  - 参数管理和历史记录"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

node server.js
