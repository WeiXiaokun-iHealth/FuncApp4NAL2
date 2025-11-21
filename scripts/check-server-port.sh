#!/bin/bash

# 检查手机上的服务器端口状态

echo "======================================"
echo "  检查Android设备上的端口状态"
echo "======================================"
echo ""

# 检查设备连接
echo "1. 检查设备连接..."
if ! adb devices | grep -q "device$"; then
    echo "❌ 未检测到Android设备"
    echo "请确保:"
    echo "  - USB已连接（或WiFi调试已启用）"
    echo "  - 运行 adb devices 确认设备"
    exit 1
fi
echo "✅ 设备已连接"
echo ""

# 检查端口8080-8090
echo "2. 检查端口8080-8090的监听状态..."
echo ""

for port in {8080..8090}; do
    result=$(adb shell "netstat -an | grep :$port" 2>/dev/null)
    if [ -n "$result" ]; then
        echo "端口 $port:"
        echo "$result"
        echo ""
    fi
done

# 检查是否有WebSocket相关进程
echo "3. 检查WebSocket相关进程..."
adb shell "ps | grep -i websocket" 2>/dev/null || echo "未找到WebSocket进程"
echo ""

# 检查App进程
echo "4. 检查App进程..."
adb shell "ps | grep com.funcapp.nal2" 2>/dev/null || echo "未找到App进程"
echo ""

# 检查网络接口
echo "5. 检查网络接口和IP..."
adb shell "ip addr show wlan0" 2>/dev/null | grep "inet " || echo "获取IP失败"
echo ""

echo "======================================"
echo "  诊断建议"
echo "======================================"
echo ""
echo "如果上面没有显示端口8081在LISTEN状态，说明："
echo "  1. WebSocket服务器启动失败"
echo "  2. 需要查看详细日志找出原因"
echo ""
echo "查看详细日志:"
echo "  adb logcat | grep -E '(AppServer|WebSocket|JavaWebSocket|bind)'"
echo ""
