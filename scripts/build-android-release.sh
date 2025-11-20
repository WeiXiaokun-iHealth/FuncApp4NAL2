#!/bin/bash

# Android Release 一键打包脚本
# 用法: ./scripts/build-android-release.sh

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

print_info "开始 Android Release 打包..."
echo ""

# 检查 Android 目录
if [ ! -d "android" ]; then
    print_error "找不到 android 目录"
    exit 1
fi

# 检查签名密钥
if [ ! -f "android/app/release.keystore" ]; then
    print_warning "未找到 release.keystore，将自动创建..."
    keytool -genkeypair -v -storetype PKCS12 \
        -keystore android/app/release.keystore \
        -alias funcapp-nal2-release \
        -keyalg RSA -keysize 2048 -validity 10000 \
        -storepass funcapp123 -keypass funcapp123 \
        -dname "CN=FuncApp NAL2, OU=Development, O=FuncApp, L=Shanghai, ST=Shanghai, C=CN" \
        >/dev/null 2>&1
    print_success "签名密钥创建成功"
fi

# 步骤 1: 自动增加 versionCode (build 号)
print_info "步骤 1/4: 更新 build 号..."
BUILD_GRADLE="android/app/build.gradle"

# 读取当前 versionCode
CURRENT_VERSION_CODE=$(grep "versionCode" "$BUILD_GRADLE" | head -1 | grep -o '[0-9]\+')
NEW_VERSION_CODE=$((CURRENT_VERSION_CODE + 1))

# 更新 versionCode
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/versionCode $CURRENT_VERSION_CODE/versionCode $NEW_VERSION_CODE/" "$BUILD_GRADLE"
else
    # Linux
    sed -i "s/versionCode $CURRENT_VERSION_CODE/versionCode $NEW_VERSION_CODE/" "$BUILD_GRADLE"
fi

print_success "Build 号已更新: $CURRENT_VERSION_CODE → $NEW_VERSION_CODE"

# 步骤 2: 清理构建
print_info "步骤 2/4: 清理构建目录..."
cd android
./gradlew clean >/dev/null 2>&1
print_success "清理完成"

# 步骤 3: 构建 Release APK
print_info "步骤 3/4: 构建 Release APK (这可能需要几分钟)..."
./gradlew assembleRelease

# 步骤 4: 验证输出
print_info "步骤 4/4: 验证构建结果..."
cd "$PROJECT_ROOT"

APK_PATH="android/app/build/outputs/apk/release/app-release.apk"

if [ -f "$APK_PATH" ]; then
    print_success "APK 构建成功！"
    echo ""
    
    # 显示 APK 信息
    APK_SIZE=$(ls -lh "$APK_PATH" | awk '{print $5}')
    print_info "APK 信息:"
    echo "  位置: $APK_PATH"
    echo "  大小: $APK_SIZE"
    echo "  Build 号: $NEW_VERSION_CODE"
    
    # 获取 APK 签名信息
    print_info "签名信息:"
    keytool -printcert -jarfile "$APK_PATH" 2>/dev/null | grep -A 2 "Owner:" || echo "  无法读取签名信息"
    
    echo ""
    print_success "✓ 打包完成！"
    echo ""
    print_info "安装命令:"
    echo "  adb install $APK_PATH"
    echo ""
    print_info "或使用 -r 参数覆盖安装:"
    echo "  adb install -r $APK_PATH"
    echo ""
    
    # 打开 APK 所在目录
    print_info "正在打开 APK 所在目录..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS: 使用 open -R 打开 Finder 并选中文件
        open -R "$APK_PATH"
    else
        # Linux: 尝试使用 xdg-open 打开目录
        APK_DIR=$(dirname "$APK_PATH")
        xdg-open "$APK_DIR" 2>/dev/null || print_warning "无法自动打开目录，请手动查看: $APK_DIR"
    fi
    
else
    print_error "构建失败，未找到 APK 文件"
    exit 1
fi
