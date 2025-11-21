#!/bin/bash

# HTTP服务器架构 - 重新编译和测试脚本（支持WiFi设备）

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
echo -e "${BLUE}  FuncApp4NAL2 HTTP服务器${NC}"
echo -e "${BLUE}  重新编译和测试（WiFi设备支持）${NC}"
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
                echo -e "${YELLOW}提示：现在可以拔掉 USB 线了${NC}"
                sleep 1
            fi
        done
    fi
}

# 步骤 0: 检查设备连接
echo -e "${BLUE}步骤 0: 检查设备连接${NC}"
if check_device_connected; then
    echo -e "${GREEN}✓ 设备 ${DEVICE_ADDRESS} 已连接${NC}"
else
    echo -e "${YELLOW}设备未连接，尝试连接...${NC}"
    enable_tcpip_if_usb
    
    if ! connect_device; then
        echo -e "${RED}无法连接到设备 ${DEVICE_ADDRESS}${NC}"
        echo -e "${YELLOW}请确保：${NC}"
        echo -e "  1. 设备和电脑在同一 WiFi 网络"
        echo -e "  2. 设备已开启 USB 调试"
        echo -e "  3. 设备 IP 地址正确: ${DEVICE_IP}"
        echo ""
        echo -e "${YELLOW}用法: $0 [设备IP]${NC}"
        echo -e "  示例: $0 192.168.1.100"
        exit 1
    fi
fi
echo ""

# 步骤 1: 清理旧的构建
echo -e "${BLUE}步骤 1: 清理旧的构建${NC}"
cd android
./gradlew clean
cd ..
echo -e "${GREEN}✓ 清理完成${NC}"
echo ""

# 步骤 2: 编译新版本
echo -e "${BLUE}步骤 2: 编译Android应用${NC}"
cd android
./gradlew assembleDebug
cd ..
echo -e "${GREEN}✓ 编译完成${NC}"
echo ""

# 步骤 3: 卸载旧版本
echo -e "${BLUE}步骤 3: 卸载旧版本${NC}"
adb -s ${DEVICE_ADDRESS} uninstall com.funcapp.nal2 2>/dev/null || echo -e "${YELLOW}未安装旧版本${NC}"
echo -e "${GREEN}✓ 卸载完成${NC}"
echo ""

# 步骤 4: 安装新版本
echo -e "${BLUE}步骤 4: 安装新版本${NC}"
adb -s ${DEVICE_ADDRESS} install android/app/build/outputs/apk/debug/app-debug.apk
echo -e "${GREEN}✓ 安装完成${NC}"
echo ""

# 步骤 5: 启动App
echo -e "${BLUE}步骤 5: 启动应用${NC}"
adb -s ${DEVICE_ADDRESS} shell am start -n com.funcapp.nal2/.MainActivity
echo -e "${GREEN}✓ 应用已启动${NC}"
echo ""

# 步骤 6: 等待启动
echo -e "${BLUE}步骤 6: 等待服务器启动（10秒）${NC}"
sleep 10
echo -e "${GREEN}✓ 等待完成${NC}"
echo ""

# 步骤 7: 检查服务器日志
echo -e "${BLUE}步骤 7: 查看服务器日志${NC}"
echo -e "${YELLOW}查看最近的日志（20行）...${NC}"
echo ""
adb -s ${DEVICE_ADDRESS} logcat -t 100 | grep -E "(HttpServerModule|HttpServer|服务器)" | tail -20

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  测试HTTP服务器${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 步骤 8: 尝试获取服务器信息
echo -e "${YELLOW}提示：请查看手机App界面获取服务器IP和端口${NC}"
echo ""
echo -e "${YELLOW}测试命令示例：${NC}"
echo -e "  ${GREEN}# 健康检查${NC}"
echo -e "  curl http://手机IP:8080/health"
echo ""
echo -e "  ${GREEN}# 测试NAL2 API${NC}"
echo -e "  curl -X POST http://手机IP:8080/api/nal2/process \\"
echo -e "    -H \"Content-Type: application/json\" \\"
echo -e "    -d '{\"sequence_num\":1,\"function\":\"dllVersion\",\"input_parameters\":{}}'"
echo ""

# 步骤 9: 持续查看日志
echo -e "${BLUE}========================================${NC}"
echo -e "${YELLOW}按 Ctrl+C 停止查看日志${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}实时日志:${NC}"
adb -s ${DEVICE_ADDRESS} logcat | grep -E "(HttpServerModule|HttpServer|服务器)"
