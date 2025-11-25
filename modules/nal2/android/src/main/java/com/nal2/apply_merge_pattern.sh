#!/bin/bash
# 应用合并模式到所有Result类函数的脚本

cd "$(dirname "$0")"

echo "开始修改 Nal2Module.kt..."

# 1. 在 mergeJsonObject 之前添加所有转换方法
if ! grep -q "tccCouplerGainResultToJSON" Nal2Module.kt; then
    echo "添加转换方法..."
    # 这里手动添加会很复杂，建议直接使用 Python 脚本或手动编辑
    python3 update_all_cases.py
    echo "✅ 转换方法已添加"
else
    echo "✅ 转换方法已存在"
fi

# 2. 验证修改
echo ""
echo "验证修改结果..."
grep -c "ResultToJSON" Nal2Module.kt | xargs -I {} echo "转换方法数量: {}"
grep -c "mergeJsonObject(resultJson, output)" Nal2Module.kt | xargs -I {} echo "使用合并模式的case数量: {}"

echo ""
echo "✅ 修改完成！"
