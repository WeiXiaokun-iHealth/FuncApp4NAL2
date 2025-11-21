#!/bin/bash

# Android WiFi 设备一键运行脚本
# 用于通过 WiFi 连接 Android 设备并运行应用

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
echo -e "${BLUE}   Android WiFi 设备一键运行脚本${NC}"
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
    
    # 尝试连接
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
    # 检查是否有 USB 连接的设备
    USB_DEVICES=$(adb devices | grep -v "List of devices" | grep -v "${DEVICE_ADDRESS}" | grep "device$" | awk '{print $1}')
    
    if [ -n "$USB_DEVICES" ]; then
        echo -e "${YELLOW}检测到 USB 连接的设备${NC}"
        for DEVICE in $USB_DEVICES; do
            if [[ ! "$DEVICE" =~ ":" ]]; then
                echo -e "${YELLOW}正在为设备 ${DEVICE} 启用 TCP/IP 模式...${NC}"
                adb -s ${DEVICE} tcpip ${DEVICE_PORT}
                sleep 2
                echo -e "${GREEN}✓ TCP/IP 模式已启用${NC}"
                echo -e "${YELLOW}提示：现在可以拔掉 USB 线了${NC}"
                sleep 1
            fi
        done
    fi
}

# 步骤 1: 检查设备连接状态
echo -e "${BLUE}步骤 1: 检查设备连接状态${NC}"
if check_device_connected; then
    echo -e "${GREEN}✓ 设备 ${DEVICE_ADDRESS} 已连接${NC}"
else
    echo -e "${YELLOW}设备未连接，尝试连接...${NC}"
    
    # 如果有 USB 设备，先启用 TCP/IP
    enable_tcpip_if_usb
    
    # 尝试连接
    if ! connect_device; then
        echo -e "${RED}无法连接到设备 ${DEVICE_ADDRESS}${NC}"
        echo -e "${YELLOW}请确保：${NC}"
        echo -e "  1. 设备和电脑在同一 WiFi 网络"
        echo -e "  2. 设备已开启 USB 调试"
        echo -e "  3. 设备 IP 地址正确: ${DEVICE_IP}"
        echo -e ""
        echo -e "${YELLOW}如果需要首次设置，请：${NC}"
        echo -e "  1. 用 USB 线连接设备"
        echo -e "  2. 运行此脚本"
        echo -e "  3. 脚本会自动启用 WiFi 调试"
        exit 1
    fi
fi

echo ""

# 步骤 2: 显示已连接的设备
echo -e "${BLUE}步骤 2: 已连接的设备${NC}"
adb devices -l
echo ""

# 步骤 3: 运行应用
echo -e "${BLUE}步骤 3: 运行应用${NC}"
echo -e "${YELLOW}正在构建并安装应用到设备 ${DEVICE_ADDRESS}...${NC}"

# 检查是否需要启动 Metro bundler
if ! lsof -i :8081 > /dev/null 2>&1; then
    echo -e "${YELLOW}Metro bundler 未运行，将在后台启动...${NC}"
    npx react-native start > /dev/null 2>&1 &
    METRO_PID=$!
    echo -e "${GREEN}✓ Metro bundler 已启动 (PID: ${METRO_PID})${NC}"
    sleep 3
fi

# 运行应用
if npx react-native run-android --deviceId=${DEVICE_ADDRESS}; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}   ✓ 应用已成功启动！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${BLUE}提示：${NC}"
    echo -e "  - 设备地址: ${DEVICE_ADDRESS}"
    echo -e "  - Metro bundler 运行在端口 8081"
    echo -e "  - 按 Ctrl+C 停止 Metro bundler"
    echo ""
    echo -e "${YELLOW}如需断开设备连接，运行：${NC}"
    echo -e "  adb disconnect ${DEVICE_ADDRESS}"
else
    echo -e "${RED}应用启动失败${NC}"
    exit 1
fi
