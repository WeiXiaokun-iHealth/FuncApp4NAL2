#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
更新 Nal2Module.kt 中所有返回复杂对象的 case
"""

import re

# 读取文件
with open('Nal2Module.kt', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 在 mergeJsonObject 之前添加所有转换方法
converter_methods = '''
  // 辅助方法：将 TccCouplerGainResult 转换为 JSONObject
  private fun tccCouplerGainResultToJSON(
          result: Nal2Manager.TccCouplerGainResult
  ): JSONObject {
    val output = JSONObject()
    output.put("TccGain", doubleArrayToJSONArray(result.TccGain))
    output.put("lineType", intArrayToJSONArray(result.lineType))
    return output
  }

  // 辅助方法：将 EarSimulatorGainResult 转换为 JSONObject
  private fun earSimulatorGainResultToJSON(
          result: Nal2Manager.EarSimulatorGainResult
  ): JSONObject {
    val output = JSONObject()
    output.put("ESG", doubleArrayToJSONArray(result.ESG))
    output.put("lineType", intArrayToJSONArray(result.lineType))
    return output
  }

  // 辅助方法：将 InputOutputCurveResult 转换为 JSONObject
  private fun inputOutputCurveResultToJSON(
          result: Nal2Manager.InputOutputCurveResult
  ): JSONObject {
    val output = JSONObject()
    output.put("REIO", doubleArrayToJSONArray(result.IO))
    output.put("REIOunl", doubleArrayToJSONArray(result.IOunl))
    return output
  }

  // 辅助方法：将 TccInputOutputCurveResult 转换为 JSONObject
  private fun tccInputOutputCurveResultToJSON(
          result: Nal2Manager.TccInputOutputCurveResult
  ): JSONObject {
    val output = JSONObject()
    output.put("TccIO", doubleArrayToJSONArray(result.TccIO))
    output.put("TccIOunl", doubleArrayToJSONArray(result.TccIOunl))
    output.put("lineType", intArrayToJSONArray(result.lineType))
    return output
  }

  // 辅助方法：将 EarSimulatorInputOutputCurveResult 转换为 JSONObject
  private fun earSimulatorInputOutputCurveResultToJSON(
          result: Nal2Manager.EarSimulatorInputOutputCurveResult
  ): JSONObject {
    val output = JSONObject()
    output.put("ESIO", doubleArrayToJSONArray(result.ESIO))
    output.put("ESIOunl", doubleArrayToJSONArray(result.ESIOunl))
    output.put("lineType", intArrayToJSONArray(result.lineType))
    return output
  }

  // 辅助方法：将 SpeechOGramResult 转换为 JSONObject
  private fun speechOGramResultToJSON(
          result: Nal2Manager.SpeechOGramResult
  ): JSONObject {
    val output = JSONObject()
    output.put("Speech_rms", doubleArrayToJSONArray(result.Speech_rms))
    output.put("Speech_max", doubleArrayToJSONArray(result.Speech_max))
    output.put("Speech_min", doubleArrayToJSONArray(result.Speech_min))
    output.put("Speech_thresh", doubleArrayToJSONArray(result.Speech_thresh))
    return output
  }

  // 辅助方法：将 ReturnValuesResult 转换为 JSONObject
  private fun returnValuesResultToJSON(
          result: Nal2Manager.ReturnValuesResult
  ): JSONObject {
    val output = JSONObject()
    output.put("MAF", doubleArrayToJSONArray(result.MAF))
    output.put("BWC", doubleArrayToJSONArray(result.BWC))
    output.put("ESCD", doubleArrayToJSONArray(result.ESCD))
    return output
  }
'''

# 在 mergeJsonObject 之前插入
content = content.replace('  // 辅助方法：合并JSONObject\n  private fun mergeJsonObject',
                          converter_methods + '\n  // 辅助方法：合并JSONObject\n  private fun mergeJsonObject')

# 2. 修改 TccCouplerGain_NL2
pattern = r'("TccCouplerGain_NL2" -> \{.*?)(output\.put\("TccGain".*?\n.*?output\.put\("lineType".*?\n)'
replacement = r'\1val resultJson = tccCouplerGainResultToJSON(result)\n        mergeJsonObject(resultJson, output)\n'
content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# 3. 修改 EarSimulatorGain_NL2
pattern = r'("EarSimulatorGain_NL2" -> \{.*?)(output\.put\("ESG".*?\n.*?output\.put\("lineType".*?\n)'
replacement = r'\1val resultJson = earSimulatorGainResultToJSON(result)\n        mergeJsonObject(resultJson, output)\n'
content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# 4. 修改 RealEarInputOutputCurve_NL2
pattern = r'("RealEarInputOutputCurve_NL2" -> \{.*?)(output\.put\("REIO".*?\n.*?output\.put\("REIOunl".*?\n)'
replacement = r'\1val resultJson = inputOutputCurveResultToJSON(result)\n        mergeJsonObject(resultJson, output)\n'
content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# 5. 修改 TccInputOutputCurve_NL2
pattern = r'("TccInputOutputCurve_NL2" -> \{.*?)(output\.put\("TccIO".*?\n.*?output\.put\("TccIOunl".*?\n.*?output\.put\("lineType".*?\n)'
replacement = r'\1val resultJson = tccInputOutputCurveResultToJSON(result)\n        mergeJsonObject(resultJson, output)\n'
content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# 6. 修改 EarSimulatorInputOutputCurve_NL2
pattern = r'("EarSimulatorInputOutputCurve_NL2" -> \{.*?)(output\.put\("ESIO".*?\n.*?output\.put\("ESIOunl".*?\n.*?output\.put\("lineType".*?\n)'
replacement = r'\1val resultJson = earSimulatorInputOutputCurveResultToJSON(result)\n        mergeJsonObject(resultJson, output)\n'
content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# 7. 修改 Speech_o_Gram_NL2
pattern = r'("Speech_o_Gram_NL2" -> \{.*?)(output\.put\("Speech_rms".*?\n.*?output\.put\("Speech_max".*?\n.*?output\.put\("Speech_min".*?\n.*?output\.put\("Speech_thresh".*?\n)'
replacement = r'\1val resultJson = speechOGramResultToJSON(result)\n        mergeJsonObject(resultJson, output)\n'
content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# 8. 修改 ReturnValues_NL2
pattern = r'("ReturnValues_NL2" -> \{.*?)(output\.put\("MAF".*?\n.*?output\.put\("BWC".*?\n.*?output\.put\("ESCD".*?\n)'
replacement = r'\1val resultJson = returnValuesResultToJSON(result)\n        mergeJsonObject(resultJson, output)\n'
content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# 写回文件
with open('Nal2Module.kt', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ 所有修改完成！")
print("已添加 7 个转换方法")
print("已修改 7 个 case 使用合并方式")
