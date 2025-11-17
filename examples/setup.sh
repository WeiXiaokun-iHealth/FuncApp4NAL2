#!/bin/bash

echo "🚀 设置 NAL2 Python 示例环境"
echo "================================"

# 检查 Python3 是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ 未找到 python3，请先安装 Python 3"
    echo "   macOS: brew install python3"
    exit 1
fi

echo "✅ 找到 Python: $(python3 --version)"

# 创建虚拟环境
echo ""
echo "📦 创建虚拟环境..."
python3 -m venv venv

# 激活虚拟环境
echo "🔧 激活虚拟环境..."
source venv/bin/activate

# 安装依赖
echo "📥 安装依赖..."
pip install --upgrade pip
pip install -r requirements.txt
pip install jupyter ipykernel

# 注册 kernel 到 Jupyter
echo "🔧 配置 Jupyter kernel..."
python -m ipykernel install --user --name=nal2-venv --display-name "Python (NAL2)"

echo ""
echo "================================"
echo "✅ 设置完成！"
echo "================================"
echo ""
echo "使用方法:"
echo ""
echo "1. 激活虚拟环境:"
echo "   source venv/bin/activate"
echo ""
echo "2a. 启动 Jupyter Notebook:"
echo "   jupyter notebook"
echo ""
echo "2b. 或运行命令行脚本:"
echo "   python python_websocket_client.py"
echo ""
echo "3. 使用完毕后，退出虚拟环境:"
echo "   deactivate"
echo ""
