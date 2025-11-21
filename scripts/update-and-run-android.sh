#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  NAL2 模块更新和 Android 重新运行${NC}"
echo -e "${BLUE}========================================${NC}"

# 1. 进入 NAL2 模块目录并打包
echo -e "\n${GREEN}[1/4]${NC} 打包 NAL2 模块..."
cd modules/nal2

# 删除旧的打包文件
rm -f react-native-nal2-*.tgz

# 打包新版本
PACK_FILE="react-native-nal2-0.0.0.tgz"
if yarn pack --filename "$PACK_FILE"; then
    echo -e "${GREEN}✓ 模块打包成功: $PACK_FILE${NC}"
else
    echo -e "${RED}✗ 模块打包失败${NC}"
    exit 1
fi

# 返回项目根目录
cd ../..

# 2. 删除旧模块
echo -e "\n${GREEN}[2/5]${NC} 清理旧模块..."
rm -rf node_modules/react-native-nal2
echo -e "${GREEN}✓ 旧模块清理完成${NC}"

# 3. 解压并安装新模块
echo -e "\n${GREEN}[3/5]${NC} 安装更新后的模块到 node_modules..."
mkdir -p node_modules/react-native-nal2
if tar -xzf "modules/nal2/$PACK_FILE" -C node_modules/react-native-nal2 --strip-components=1; then
    echo -e "${GREEN}✓ 模块安装成功${NC}"
else
    echo -e "${RED}✗ 模块安装失败${NC}"
    exit 1
fi

# 4. 清理 Android 缓存
echo -e "\n${GREEN}[4/5]${NC} 清理 Android 缓存..."
cd android
./gradlew clean
cd ..
echo -e "${GREEN}✓ Android 缓存清理完成${NC}"

# 5. 卸载旧版本应用（如果存在）
echo -e "\n${GREEN}[5/6]${NC} 卸载旧版本应用..."
if adb uninstall com.funcapp.nal2 2>/dev/null; then
    echo -e "${GREEN}✓ 旧版本应用已卸载${NC}"
else
    echo -e "${BLUE}ℹ 未发现旧版本应用（可能未安装）${NC}"
fi

# 6. 重新运行 Android
echo -e "\n${GREEN}[6/6]${NC} 重新编译并运行 Android 应用..."
echo -e "${BLUE}这可能需要几分钟时间...${NC}\n"

if yarn android; then
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}  ✓ Android 应用启动成功！${NC}"
    echo -e "${GREEN}========================================${NC}"
else
    echo -e "\n${RED}========================================${NC}"
    echo -e "${RED}  ✗ Android 应用启动失败${NC}"
    echo -e "${RED}========================================${NC}"
    exit 1
fi
