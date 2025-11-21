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

# 获取局域网IP地址
get_local_ip() {
    # 尝试多种方法获取局域网IP
    local ip=""
    
    # 方法1: 尝试获取Wi-Fi IP (en0)
    if command -v ipconfig &> /dev/null; then
        ip=$(ipconfig getifaddr en0 2>/dev/null)
    fi
    
    # 方法2: 如果方法1失败，尝试获取以太网IP (en1)
    if [ -z "$ip" ] && command -v ipconfig &> /dev/null; then
        ip=$(ipconfig getifaddr en1 2>/dev/null)
    fi
    
    # 方法3: 使用ifconfig查找非127.0.0.1的IP
    if [ -z "$ip" ]; then
        ip=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
    fi
    
    # 如果都失败了，使用localhost
    if [ -z "$ip" ]; then
        ip="localhost"
    fi
    
    echo "$ip"
}

# 获取局域网IP
LOCAL_IP=$(get_local_ip)
PORT=3000

# 检查并清理端口占用
check_and_kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null)
    
    if [ ! -z "$pid" ]; then
        echo "⚠️  检测到端口 $port 已被占用 (PID: $pid)"
        echo "🔧 正在停止占用该端口的进程..."
        kill -9 $pid 2>/dev/null
        sleep 1
        echo "✅ 端口已清理"
        echo ""
    fi
}

# 清理端口
check_and_kill_port $PORT

# 启动服务器
echo "✅ 服务器启动中..."
echo "🌐 HTTP 端口: $PORT"
echo ""
echo "📍 访问地址："
echo "   本地: http://localhost:$PORT"
if [ "$LOCAL_IP" != "localhost" ]; then
    echo "   局域网: http://$LOCAL_IP:$PORT"
fi
echo ""
echo "🔗 API 端点:"
echo "   本地: http://localhost:$PORT/api/nal2/process"
if [ "$LOCAL_IP" != "localhost" ]; then
    echo "   局域网: http://$LOCAL_IP:$PORT/api/nal2/process"
fi
echo ""
echo "功能："
echo "  - NAL2 函数 HTTP API 调用"
echo "  - NAL2 自动化测试"
echo "  - 参数管理和历史记录"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

node server.js
