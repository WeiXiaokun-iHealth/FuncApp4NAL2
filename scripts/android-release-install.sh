#!/bin/bash

# Android Release 打包、安装并打开目录脚本
# 用法: ./scripts/android-release-install.sh

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 获取项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

APK_PATH="android/app/build/outputs/apk/release/app-release.apk"

echo ""
print_info "======================================"
print_info "Android Release 打包、安装并打开目录"
print_info "======================================"
echo ""

# 步骤 1: 检查设备连接
print_info "步骤 1/4: 检查设备连接..."
if ! command -v adb &> /dev/null; then
    print_error "未找到 adb 命令，请确保 Android SDK 已安装"
    exit 1
fi

DEVICE_COUNT=$(adb devices | grep -v "List of devices" | grep "device$" | wc -l | tr -d ' ')

if [ "$DEVICE_COUNT" -eq 0 ]; then
    print_warning "未检测到已连接的 Android 设备"
    print_info "请确保："
    echo "  1. 设备已通过 USB 连接"
    echo "  2. 设备已开启 USB 调试"
    echo "  3. 已授权此计算机的 USB 调试权限"
    echo ""
    read -p "是否跳过安装步骤，仅构建 APK？(y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "已取消操作"
        exit 1
    fi
    SKIP_INSTALL=true
else
    print_success "检测到 $DEVICE_COUNT 个已连接设备"
    adb devices | grep "device$"
    echo ""
    SKIP_INSTALL=false
fi

# 步骤 2: 构建 Release APK
print_info "步骤 2/4: 构建 Release APK..."
echo ""

# 调用现有的构建脚本
bash scripts/build-android-release.sh

echo ""
print_success "APK 构建完成"

# 步骤 3: 安装到设备
if [ "$SKIP_INSTALL" = false ]; then
    print_info "步骤 3/4: 安装 APK 到设备..."
    
    if [ ! -f "$APK_PATH" ]; then
        print_error "APK 文件不存在: $APK_PATH"
        exit 1
    fi
    
    # 使用 -r 参数进行覆盖安装
    print_info "正在安装 (覆盖模式)..."
    if adb install -r "$APK_PATH"; then
        print_success "APK 安装成功"
        
        # 获取包名
        PACKAGE_NAME=$(grep "applicationId" android/app/build.gradle | head -1 | awk -F'"' '{print $2}')
        
        if [ -n "$PACKAGE_NAME" ]; then
            echo ""
            print_info "应用信息："
            echo "  包名: $PACKAGE_NAME"
            echo ""
            print_info "可以使用以下命令启动应用："
            echo "  adb shell am start -n $PACKAGE_NAME/.MainActivity"
            echo ""
            
            # 询问是否立即启动应用
            read -p "是否立即启动应用？(Y/n) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Nn]$ ]]; then
                print_info "正在启动应用..."
                adb shell am start -n "$PACKAGE_NAME/.MainActivity" 2>/dev/null || \
                adb shell monkey -p "$PACKAGE_NAME" -c android.intent.category.LAUNCHER 1 2>/dev/null || \
                print_warning "无法自动启动应用，请手动打开"
            fi
        fi
    else
        print_error "APK 安装失败"
        print_info "请尝试："
        echo "  1. 卸载旧版本后重新安装"
        echo "  2. 检查设备存储空间"
        echo "  3. 检查签名是否匹配"
        exit 1
    fi
else
    print_warning "步骤 3/4: 跳过安装 (未检测到设备)"
fi

# 步骤 4: 打开 APK 所在目录
echo ""
print_info "步骤 4/4: 打开 APK 所在目录..."

if [ -f "$APK_PATH" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS: 使用 open -R 打开 Finder 并选中文件
        open -R "$APK_PATH"
        print_success "已在 Finder 中打开并选中 APK 文件"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux: 尝试使用 xdg-open 打开目录
        APK_DIR=$(dirname "$APK_PATH")
        if xdg-open "$APK_DIR" 2>/dev/null; then
            print_success "已打开 APK 所在目录"
        else
            print_warning "无法自动打开目录"
            print_info "APK 路径: $APK_PATH"
        fi
    else
        print_warning "未知操作系统，无法自动打开目录"
        print_info "APK 路径: $APK_PATH"
    fi
else
    print_error "APK 文件不存在: $APK_PATH"
    exit 1
fi

echo ""
print_success "======================================"
print_success "所有步骤完成！"
print_success "======================================"
echo ""

# 显示摘要信息
print_info "摘要："
echo "  ✓ APK 已构建"
if [ "$SKIP_INSTALL" = false ]; then
    echo "  ✓ APK 已安装到设备"
else
    echo "  - APK 安装已跳过"
fi
echo "  ✓ APK 目录已打开"
echo ""
print_info "APK 位置: $APK_PATH"
echo ""
