#!/bin/bash

# 正常运行App脚本（不清除metro缓存）

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 默认设备 IP（可以在运行时覆盖）
DEVICE_IP="${1:-172.29.2.68}"
DEVICE_PORT="5555"
DEVICE_ADDRESS="${DEVICE_IP}:${DEVICE_PORT}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  FuncApp4NAL2 正常运行${NC}"
echo -e "${BLUE}  (保留Metro缓存)${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 函数：检查设备是否已连接
check_device_connected() {
    if adb devices | grep -q "${DEVICE_ADDRESS}.*device$"; then
        return 0
    else
        return 1
    fi
}

# 函数：连接设备
connect_device() {
    echo -e "${YELLOW}正在连接到设备 ${DEVICE_ADDRESS}...${NC}"
    
    if adb connect ${DEVICE_ADDRESS} > /dev/null 2>&1; then
        sleep 2
        if check_device_connected; then
            echo -e "${GREEN}✓ 成功连接到设备${NC}"
            return 0
        else
            echo -e "${RED}✗ 连接失败${NC}"
            return 1
        fi
    else
        echo -e "${RED}✗ 连接失败${NC}"
        return 1
    fi
}

# 函数：检查并启用 TCP/IP 模式（如果设备通过 USB 连接）
enable_tcpip_if_usb() {
    USB_DEVICES=$(adb devices | grep -v "List of devices" | grep -v "${DEVICE_ADDRESS}" | grep "device$" | awk '{print $1}')
    
    if [ -n "$USB_DEVICES" ]; then
        echo -e "${YELLOW}检测到 USB 连接的设备${NC}"
        for DEVICE in $USB_DEVICES; do
            if [[ ! "$DEVICE" =~ ":" ]]; then
                echo -e "${YELLOW}正在为设备 ${DEVICE} 启用 TCP/IP 模式...${NC}"
                adb -s ${DEVICE} tcpip ${DEVICE_PORT}
                sleep 2
                echo -e "${GREEN}✓ TCP/IP 模式已启用${NC}"
                sleep 1
            fi
        done
    fi
}

# 步骤 1: 检查设备连接
echo -e "${BLUE}步骤 1: 检查设备连接${NC}"
if check_device_connected; then
    echo -e "${GREEN}✓ 设备 ${DEVICE_ADDRESS} 已连接${NC}"
else
    echo -e "${YELLOW}设备未连接，尝试连接...${NC}"
    enable_tcpip_if_usb
    
    if ! connect_device; then
        echo -e "${RED}无法连接到设备 ${DEVICE_ADDRESS}${NC}"
        echo -e "${YELLOW}用法: $0 [设备IP]${NC}"
        echo -e "  示例: $0 192.168.1.100"
        exit 1
    fi
fi
echo ""

# 步骤 2: 检查Metro是否运行
echo -e "${BLUE}步骤 2: 检查Metro bundler${NC}"
if lsof -i :8081 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Metro bundler 正在运行${NC}"
else
    echo -e "${YELLOW}Metro bundler 未运行，正在启动...${NC}"
    npx react-native start > /dev/null 2>&1 &
    METRO_PID=$!
    echo -e "${GREEN}✓ Metro bundler 已启动 (PID: ${METRO_PID})${NC}"
    sleep 3
fi
echo ""

# 步骤 3: 安装并启动App
echo -e "${BLUE}步骤 3: 安装并启动App${NC}"
if npx react-native run-android --deviceId=${DEVICE_ADDRESS}; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}   ✓ 应用已成功启动！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${BLUE}提示：${NC}"
    echo -e "  - 设备地址: ${DEVICE_ADDRESS}"
    echo -e "  - Metro bundler 运行在端口 8081"
    echo -e "  - HTTP服务器将在App中自动启动"
    echo ""
else
    echo -e "${RED}应用启动失败${NC}"
    exit 1
fi
