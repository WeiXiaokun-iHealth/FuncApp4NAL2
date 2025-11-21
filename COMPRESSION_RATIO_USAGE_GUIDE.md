# CompressionRatio_NL2 使用指南

## 问题描述

调用 `CompressionRatio_NL2` 时 App 闪退。

## 根本原因

根据 SDK 文档，`CompressionRatio_NL2` 要求在调用前**必须先执行**以下函数来初始化 SDK 状态：

**Requires: 23, 21, 34, 35, 36, 37, 38**

- 23 = setBWC
- 21 = CompressionThreshold_NL2
- 34 = SetAdultChild
- 35 = SetExperience
- 36 = SetCompSpeed
- 37 = SetTonalLanguage
- 38 = SetGender

## 正确的调用顺序

### 步骤 1: 设置用户属性 (函数 34-38)

```javascript
// 1. 设置成人/儿童
await SetAdultChild({
  adultChild: 0, // 0=成人, 1=儿童
  dateOfBirth: 19800101,
});

// 2. 设置经验
await SetExperience({
  experience: 0, // 0=新用户, 1=有经验
});

// 3. 设置压缩速度
await SetCompSpeed({
  compSpeed: 1, // 0=慢, 1=中, 2=快
});

// 4. 设置音调语言
await SetTonalLanguage({
  tonal: 0, // 0=非音调语言, 1=音调语言
});

// 5. 设置性别
await SetGender({
  gender: 0, // 0=男, 1=女
});
```

### 步骤 2: 获取中心频率 (函数 20)

```javascript
// 获取实际的中心频率值
const centerFreqResult = await CenterFrequencies({
  channels: 18,
});
// 返回如: [250, 500, 750, 1000, 1500, 2000, 3000, 4000, 6000, ...]
```

### 步骤 3: 获取交叉频率并设置 BWC (函数 19, 23)

```javascript
// 获取交叉频率
const crossOverResult = await CrossOverFrequencies_NL2({
  channels: 18,
  AC: [35.0, 45.0, 40.0, 40.0, 65.0, 70.0, 70.0, 65.0, 55.0],
  BC: [35.0, 45.0, 40.0, 40.0, 65.0, 70.0, 999.0, 999.0, 999.0],
});

// 设置 BWC
await setBWC({
  channels: 18,
  crossOver: crossOverResult.crossOverFreq,
});
```

### 步骤 4: 设置压缩阈值 (函数 21)

```javascript
await CompressionThreshold_NL2({
  WBCT: 0,
  aidType: 0,
  direction: 0,
  mic: 0,
  calcCh: [1], // 或实际需要的通道
});
```

### 步骤 5: 现在可以调用 CompressionRatio_NL2 (函数 22)

```javascript
const compressionRatio = await CompressionRatio_NL2({
  channels: 18,
  centreFreq: centerFreqResult.centreFreq, // 使用步骤2获取的实际频率
  AC: [35.0, 45.0, 40.0, 40.0, 65.0, 70.0, 70.0, 65.0, 55.0],
  BC: [35.0, 45.0, 40.0, 40.0, 65.0, 70.0, 999.0, 999.0, 999.0],
  direction: 0,
  mic: 0,
  limiting: 0,
  ACother: [35.0, 45.0, 40.0, 40.0, 65.0, 70.0, 70.0, 65.0, 55.0],
  noOfAids: 0,
});
```

## 完整示例代码

```javascript
async function testCompressionRatio() {
  try {
    // 1. 设置所有必需的用户属性
    await SetAdultChild({ adultChild: 0, dateOfBirth: 19800101 });
    await SetExperience({ experience: 0 });
    await SetCompSpeed({ compSpeed: 1 });
    await SetTonalLanguage({ tonal: 0 });
    await SetGender({ gender: 0 });

    // 2. 获取中心频率
    const centerFreqResult = await CenterFrequencies({ channels: 18 });
    console.log("Center Frequencies:", centerFreqResult.centreFreq);

    // 3. 获取交叉频率并设置 BWC
    const crossOverResult = await CrossOverFrequencies_NL2({
      channels: 18,
      AC: [35.0, 45.0, 40.0, 40.0, 65.0, 70.0, 70.0, 65.0, 55.0],
      BC: [35.0, 45.0, 40.0, 40.0, 65.0, 70.0, 999.0, 999.0, 999.0],
    });

    await setBWC({
      channels: 18,
      crossOver: crossOverResult.crossOverFreq,
    });

    // 4. 设置压缩阈值
    await CompressionThreshold_NL2({
      WBCT: 0,
      aidType: 0,
      direction: 0,
      mic: 0,
      calcCh: [1],
    });

    // 5. 现在可以安全调用 CompressionRatio_NL2
    const compressionRatio = await CompressionRatio_NL2({
      channels: 18,
      centreFreq: centerFreqResult.centreFreq, // 使用实际频率!
      AC: [35.0, 45.0, 40.0, 40.0, 65.0, 70.0, 70.0, 65.0, 55.0],
      BC: [35.0, 45.0, 40.0, 40.0, 65.0, 70.0, 999.0, 999.0, 999.0],
      direction: 0,
      mic: 0,
      limiting: 0,
      ACother: [35.0, 45.0, 40.0, 40.0, 65.0, 70.0, 70.0, 65.0, 55.0],
      noOfAids: 0,
    });

    console.log("Compression Ratio:", compressionRatio);
    return compressionRatio;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
```

## 关键点总结

1. **不能直接调用** `CompressionRatio_NL2` - 会导致闪退
2. **必须先设置** SDK 状态（函数 34-38, 23, 21）
3. **centreFreq 必须是实际频率值**（从 `CenterFrequencies` 获取），而不是 `[0,1,2,3...]`
4. **调用顺序很重要** - 按上述步骤依次执行

## 测试数据修改建议

当前测试数据 `input_json_data/22_CompressionRatio_NL2_data.json` 使用的是错误的 centreFreq 值。

建议创建一个测试序列，而不是单独测试 CompressionRatio_NL2。
