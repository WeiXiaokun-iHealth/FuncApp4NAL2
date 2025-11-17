#!/bin/bash
# WiFi 调试连接脚本
# 使用方法: ./scripts/wifi-debug.sh [设备IP地址]

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 默认设备 IP（可以通过参数覆盖）
DEVICE_IP=${1:-"192.168.1.100"}
PORT=5555

echo -e "${YELLOW}=== Android WiFi 调试连接工具 ===${NC}\n"

# 检查 adb 是否安装
if ! command -v adb &> /dev/null; then
    echo -e "${RED}错误: 未找到 adb 命令${NC}"
    echo "请确保已安装 Android SDK Platform Tools"
    exit 1
fi

echo -e "${GREEN}步骤 1: 检查当前连接状态${NC}"
adb devices -l
echo ""

# 检查是否有 USB 连接的设备
USB_DEVICE=$(adb devices | grep -v "List" | grep "device$" | grep -v ":" | awk '{print $1}')

if [ ! -z "$USB_DEVICE" ]; then
    echo -e "${YELLOW}检测到 USB 连接的设备: $USB_DEVICE${NC}"
    read -p "是否启用该设备的网络调试? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}步骤 2: 启用网络调试模式${NC}"
        adb tcpip $PORT
        
        echo "等待设备准备..."
        sleep 3
        
        echo -e "${YELLOW}提示: 请在设备上查看 WiFi IP 地址${NC}"
        echo "设置 > WLAN > 点击已连接的网络"
        read -p "请输入设备的 IP 地址 (默认: $DEVICE_IP): " USER_IP
        
        if [ ! -z "$USER_IP" ]; then
            DEVICE_IP=$USER_IP
        fi
    fi
else
    echo -e "${YELLOW}未检测到 USB 连接的设备${NC}"
    echo "将尝试通过 WiFi 连接到: $DEVICE_IP:$PORT"
fi

echo ""
echo -e "${GREEN}步骤 3: 通过 WiFi 连接设备${NC}"
adb connect $DEVICE_IP:$PORT

sleep 2

echo ""
echo -e "${GREEN}步骤 4: 验证连接状态${NC}"
adb devices -l

# 检查连接是否成功
WIFI_DEVICE=$(adb devices | grep "$DEVICE_IP:$PORT" | grep "device")

if [ ! -z "$WIFI_DEVICE" ]; then
    echo ""
    echo -e "${GREEN}✓ 成功! 设备已通过 WiFi 连接${NC}"
    echo -e "${YELLOW}现在可以断开 USB 线了${NC}"
    echo ""
    echo "使用以下命令运行应用:"
    echo "  npm run android"
    echo "  或"
    echo "  yarn android"
else
    echo ""
    echo -e "${RED}✗ 连接失败${NC}"
    echo ""
    echo "故障排除:"
    echo "1. 确保设备和电脑在同一 WiFi 网络"
    echo "2. 检查设备的 USB 调试是否已启用"
    echo "3. 尝试重启 adb 服务器:"
    echo "   adb kill-server && adb start-server"
    echo "4. 查看详细指南: WIFI_DEBUG_GUIDE.md"
    exit 1
fi
