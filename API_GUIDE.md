# NAL2 HTTP API 调用文档

本文档详细说明如何通过 HTTP API 调用 NAL2 助听器算法功能。

## 获取 API 地址

### 从 App 获取 IP 和端口

1. **启动 App**：运行 React Native App（参考 README.md）
2. **查看服务器地址**：在 App 界面中显示的 HTTP Server 地址
3. **记录地址**：例如 `http://192.168.1.100:8080`

**注意：**

- IP 地址是设备在局域网中的地址
- 端口号通常为 8080
- 确保调用方与 App 在同一网络中

## NAL2 函数调用 API

### 接口信息

**端点：** `POST /api/nal2/process`

**完整地址：** `http://{APP_IP}:{APP_PORT}/api/nal2/process`

例如：`http://192.168.1.100:8080/api/nal2/process`

### 请求格式

**Content-Type:** `application/json`

**请求体结构：**

```json
{
  "sequence_num": 1,
  "function": "函数名称",
  "input_parameters": {
    "参数名1": "参数值1",
    "参数名2": "参数值2"
  }
}
```

**字段说明：**

| 字段             | 类型   | 必填 | 说明                           |
| ---------------- | ------ | ---- | ------------------------------ |
| sequence_num     | number | 是   | 请求序列号，用于匹配请求和响应 |
| function         | string | 是   | NAL2 函数名称                  |
| input_parameters | object | 是   | 输入参数对象，根据函数而不同   |

### 响应格式

**成功响应：**

```json
{
  "sequence_num": 1,
  "function": "函数名称",
  "return": 0,
  "output_parameters": {
    "输出参数名1": "输出值1",
    "输出参数名2": "输出值2"
  }
}
```

**错误响应：**

```json
{
  "sequence_num": 1,
  "function": "函数名称",
  "return": -1,
  "output_parameters": {
    "error": "错误描述信息"
  }
}
```

**字段说明：**

| 字段              | 类型   | 说明                            |
| ----------------- | ------ | ------------------------------- |
| sequence_num      | number | 与请求对应的序列号              |
| function          | string | 函数名称                        |
| return            | number | 返回码，0 表示成功，-1 表示失败 |
| output_parameters | object | 输出参数对象                    |

## 使用示例

### 示例 1：获取 DLL 版本

**请求：**

```bash
curl -X POST http://192.168.1.100:8080/api/nal2/process \
  -H "Content-Type: application/json" \
  -d '{
    "sequence_num": 1,
    "function": "dllVersion",
    "input_parameters": {}
  }'
```

**响应：**

```json
{
  "sequence_num": 1,
  "function": "dllVersion",
  "return": 0,
  "output_parameters": {
    "version": "1.0.0.0"
  }
}
```

### 示例 2：计算真耳插入增益

**请求：**

```bash
curl -X POST http://192.168.1.100:8080/api/nal2/process \
  -H "Content-Type: application/json" \
  -d '{
    "sequence_num": 2,
    "function": "RealEarInsertionGain_NL2",
    "input_parameters": {
      "HL": [10, 15, 20, 25, 30, 35, 40],
      "side": "left",
      "age": 65,
      "gender": "male"
    }
  }'
```

**响应：**

```json
{
  "sequence_num": 2,
  "function": "RealEarInsertionGain_NL2",
  "return": 0,
  "output_parameters": {
    "gains": [5.2, 7.8, 10.5, 13.2, 15.9, 18.6, 21.3],
    "frequencies": [250, 500, 1000, 2000, 3000, 4000, 6000]
  }
}
```

### 示例 3：Python 调用

```python
import requests
import json

# App 的 IP 和端口
APP_IP = "192.168.1.100"
APP_PORT = 8080
BASE_URL = f"http://{APP_IP}:{APP_PORT}"

def call_nal2_api(function_name, input_params, sequence_num=1):
    """
    调用 NAL2 API

    Args:
        function_name: NAL2 函数名称
        input_params: 输入参数字典
        sequence_num: 序列号

    Returns:
        API 响应的 JSON 对象
    """
    url = f"{BASE_URL}/api/nal2/process"

    payload = {
        "sequence_num": sequence_num,
        "function": function_name,
        "input_parameters": input_params
    }

    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"请求失败: {e}")
        return None

# 使用示例
if __name__ == "__main__":
    # 获取 DLL 版本
    result = call_nal2_api("dllVersion", {})
    print("DLL 版本:", result)

    # 计算增益
    hearing_loss = [10, 15, 20, 25, 30, 35, 40]
    result = call_nal2_api(
        "RealEarInsertionGain_NL2",
        {
            "HL": hearing_loss,
            "side": "left",
            "age": 65,
            "gender": "male"
        },
        sequence_num=2
    )
    print("增益计算结果:", result)
```

### 示例 4：JavaScript 调用

```javascript
// App 的 IP 和端口
const APP_IP = "192.168.1.100";
const APP_PORT = 8080;
const BASE_URL = `http://${APP_IP}:${APP_PORT}`;

/**
 * 调用 NAL2 API
 * @param {string} functionName - NAL2 函数名称
 * @param {object} inputParams - 输入参数对象
 * @param {number} sequenceNum - 序列号
 * @returns {Promise<object>} API 响应
 */
async function callNAL2API(functionName, inputParams, sequenceNum = 1) {
  const url = `${BASE_URL}/api/nal2/process`;

  const payload = {
    sequence_num: sequenceNum,
    function: functionName,
    input_parameters: inputParams,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("请求失败:", error);
    return null;
  }
}

// 使用示例
async function main() {
  // 获取 DLL 版本
  const versionResult = await callNAL2API("dllVersion", {});
  console.log("DLL 版本:", versionResult);

  // 计算增益
  const hearingLoss = [10, 15, 20, 25, 30, 35, 40];
  const gainResult = await callNAL2API(
    "RealEarInsertionGain_NL2",
    {
      HL: hearingLoss,
      side: "left",
      age: 65,
      gender: "male",
    },
    2
  );
  console.log("增益计算结果:", gainResult);
}

main();
```

## 错误处理

### 常见错误

| 错误信息           | 原因                 | 解决方法                    |
| ------------------ | -------------------- | --------------------------- |
| Connection refused | App 未运行或地址错误 | 确认 App 运行并检查 IP/端口 |
| Timeout            | 请求超时（>30 秒）   | 检查网络连接，简化请求参数  |
| return: -1         | 函数执行失败         | 检查输入参数是否正确        |
| Invalid parameters | 参数格式或类型错误   | 参考 NAL2 文档检查参数格式  |

### 错误处理建议

```python
def call_nal2_with_retry(function_name, input_params, max_retries=3):
    """带重试机制的 API 调用"""
    for attempt in range(max_retries):
        try:
            result = call_nal2_api(function_name, input_params)

            if result and result.get("return") == 0:
                return result
            elif result and result.get("return") == -1:
                error_msg = result.get("output_parameters", {}).get("error", "未知错误")
                print(f"API 返回错误: {error_msg}")
                return None
            else:
                print(f"尝试 {attempt + 1}/{max_retries} 失败，重试中...")

        except Exception as e:
            print(f"尝试 {attempt + 1}/{max_retries} 异常: {e}")

        if attempt < max_retries - 1:
            time.sleep(1)  # 等待 1 秒后重试

    return None
```

## 注意事项

1. **App 必须运行**：调用 API 前确保 App 已启动并显示服务器地址
2. **网络连接**：确保调用方与 App 设备在同一局域网
3. **超时设置**：建议设置请求超时时间为 30 秒
4. **序列号管理**：使用唯一的 sequence_num 便于追踪和调试
5. **参数验证**：调用前验证输入参数的格式和范围
6. **错误重试**：网络不稳定时建议实现重试机制

## 相关资源

- **使用文档**：查看 `README.md` 了解如何启动 App 和服务器
- **NAL2 函数文档**：查看 `NAL-NL2 DLL Ver 1.0.0.0 documentation.pdf`
- **测试数据**：参考 `input_json_data/` 目录中的示例数据
- **测试说明**：查看 `tests/README.md` 了解自动化测试

## 技术支持

遇到问题时：

1. 检查 App 是否正常运行
2. 验证 IP 地址和端口号是否正确
3. 确认网络连接状态
4. 查看 App 日志获取详细错误信息
