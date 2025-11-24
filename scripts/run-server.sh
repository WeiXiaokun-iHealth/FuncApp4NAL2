#!/bin/bash

# NAL2 测试服务器运行脚本
# 提供 HTTP API 服务，用于 NAL2 功能测试

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
    local ip=""
    
    # macOS: 尝试获取活动网络接口的IP
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # 优先获取 Wi-Fi IP (en0)
        ip=$(ipconfig getifaddr en0 2>/dev/null)
        
        # 如果 Wi-Fi 未连接，尝试以太网 (en1)
        if [ -z "$ip" ]; then
            ip=$(ipconfig getifaddr en1 2>/dev/null)
        fi
    fi
    
    # Linux 或其他系统，或者 macOS 方法失败
    if [ -z "$ip" ]; then
        # 使用 hostname -I (Linux)
        if command -v hostname &> /dev/null; then
            ip=$(hostname -I 2>/dev/null | awk '{print $1}')
        fi
    fi
    
    # 通用方法：使用 ifconfig 或 ip addr
    if [ -z "$ip" ]; then
        if command -v ifconfig &> /dev/null; then
            ip=$(ifconfig | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | head -1)
        elif command -v ip &> /dev/null; then
            ip=$(ip addr show | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | cut -d'/' -f1 | head -1)
        fi
    fi
    
    # 如果都失败了，使用 localhost
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
echo "功能："
echo "  - NAL2 函数 HTTP API 调用"
echo "  - NAL2 自动化测试"
echo "  - 参数管理和历史记录"
echo ""

node server.js
