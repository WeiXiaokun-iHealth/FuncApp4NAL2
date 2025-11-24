# NAL2 日志系统使用指南

## 概述

NAL2 应用已集成统一的日志管理系统，提供完整的日志记录、存储、查询和导出功能。

## 核心特性

### 1. 日志级别

- **DEBUG**: 调试信息
- **INFO**: 一般信息
- **WARN**: 警告信息
- **ERROR**: 错误信息
- **FATAL**: 致命错误

### 2. 业务模块

- **APP**: 应用生命周期
- **SERVER**: HTTP 服务器
- **NAL2**: NAL2 业务逻辑
- **NETWORK**: 网络请求
- **DATABASE**: 数据库操作
- **UI**: UI 交互
- **SYSTEM**: 系统事件

### 3. 功能特点

- ✅ 自动持久化到 AsyncStorage
- ✅ 内存限制（默认 1000 条）
- ✅ 实时监听器
- ✅ 日志过滤和搜索
- ✅ 多格式导出（JSON/TXT/CSV）
- ✅ 安全的 JSON 序列化（处理循环引用）
- ✅ 自动输出到控制台

## 基本使用

### 导入日志系统

```javascript
import logger, { LogLevel, LogModule } from "./utils/Logger";
```

### 记录日志

#### 方式 1: 使用快捷方法

```javascript
// INFO级别
logger.info(LogModule.SERVER, "服务器启动成功", {
  port: 8080,
  ip: "192.168.1.1",
});

// ERROR级别
logger.error(LogModule.NAL2, "处理失败", {
  error: error.message,
  stack: error.stack,
});

// WARN级别
logger.warn(LogModule.NETWORK, "网络延迟较高", { latency: 500 });

// DEBUG级别
logger.debug(LogModule.APP, "调试信息", { state: "active" });

// FATAL级别
logger.fatal(LogModule.SYSTEM, "系统崩溃", { reason: "Out of memory" });
```

#### 方式 2: 使用通用 log 方法

```javascript
logger.log(LogLevel.INFO, LogModule.SERVER, "消息内容", { 附加数据 });
```

## 高级功能

### 1. 添加监听器

```javascript
// 添加监听器监听所有新日志
const removeListener = logger.addListener((logEntry) => {
  console.log("新日志:", logEntry);
  // 可以在这里更新UI或执行其他操作
});

// 取消监听
removeListener();
```

### 2. 获取日志

```javascript
// 获取所有日志
const allLogs = logger.getLogs();

// 过滤日志
const filteredLogs = logger.filterLogs({
  level: LogLevel.ERROR, // 按级别过滤
  module: LogModule.NAL2, // 按模块过滤
  keyword: "失败", // 关键词搜索
  startTime: "2024-01-01", // 开始时间
  endTime: "2024-12-31", // 结束时间
});
```

### 3. 导出日志

```javascript
// 导出为JSON格式
const result = await logger.exportLogs("json");

// 导出为TXT格式
const result = await logger.exportLogs("txt");

// 导出为CSV格式
const result = await logger.exportLogs("csv");

if (result.success) {
  console.log("日志已导出到:", result.path);
} else {
  console.error("导出失败:", result.error);
}
```

### 4. 清除日志

```javascript
await logger.clearLogs();
```

### 5. 获取统计信息

```javascript
const stats = logger.getStatistics();
console.log("总日志数:", stats.total);
console.log("按级别统计:", stats.byLevel);
console.log("按模块统计:", stats.byModule);
```

## 在业务模块中的应用示例

### AppServer.js

```javascript
import logger, { LogModule } from './Logger';

async start(port) {
  logger.info(LogModule.SERVER, `正在启动服务器，端口 ${port}`);

  try {
    const result = await HttpServerModule.startServer(port);
    logger.info(LogModule.SERVER, '服务器已启动', {
      port,
      ipAddress: result.ipAddress
    });
  } catch (error) {
    logger.error(LogModule.SERVER, '启动服务器失败', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}
```

### NAL2Bridge.js

```javascript
import logger, { LogModule } from './Logger';

static async processFunction(parsedData) {
  const { sequence_num, function: functionName } = parsedData;

  logger.info(LogModule.NAL2, `开始处理NAL2函数: ${functionName}`, {
    sequence_num,
    functionName
  });

  try {
    // 处理逻辑...
    logger.info(LogModule.NAL2, `NAL2函数处理成功: ${functionName}`);
  } catch (error) {
    logger.error(LogModule.NAL2, `NAL2函数处理失败: ${functionName}`, {
      error: error.message,
      stack: error.stack
    });
  }
}
```

### React 组件中使用

```javascript
import logger, { LogModule } from "../utils/Logger";

const MyComponent = () => {
  const handleClick = () => {
    logger.info(LogModule.UI, "用户点击按钮", { buttonId: "submit" });
  };

  return <Button onPress={handleClick}>提交</Button>;
};
```

## 日志格式

### 内存中的日志对象

```javascript
{
  id: 1234567890.123,                    // 唯一ID
  timestamp: "2024-01-01T12:00:00.000Z", // ISO时间戳
  timestampLocal: "2024/01/01 12:00:00", // 本地化时间
  level: "INFO",                          // 日志级别
  module: "SERVER",                       // 业务模块
  message: "服务器启动成功",              // 日志消息
  data: "{\"port\":8080}",               // 附加数据（JSON字符串）
  platform: "android"                     // 平台信息
}
```

### 导出的 TXT 格式

```
[2024/01/01 12:00:00][INFO][SERVER] 服务器启动成功
Data: {"port":8080,"ip":"192.168.1.1"}

[2024/01/01 12:00:05][ERROR][NAL2] 处理失败
Data: {"error":"Invalid parameter","stack":"..."}
```

### 导出的 CSV 格式

```csv
Timestamp,Level,Module,Message,Data
"2024/01/01 12:00:00","INFO","SERVER","服务器启动成功","{""port"":8080}"
"2024/01/01 12:00:05","ERROR","NAL2","处理失败","{""error"":""Invalid parameter""}"
```

## 性能考虑

1. **内存管理**: 默认保留最近 1000 条日志，超出自动删除
2. **异步持久化**: 不阻塞主线程
3. **安全序列化**: 自动处理循环引用，避免崩溃
4. **批量加载**: 从 AsyncStorage 加载时批量读取

## 最佳实践

1. **合理选择日志级别**

   - DEBUG: 详细的调试信息，生产环境可关闭
   - INFO: 重要的业务流程节点
   - WARN: 需要注意但不影响功能的问题
   - ERROR: 错误但应用可继续运行
   - FATAL: 严重错误，应用可能无法继续

2. **提供足够的上下文**

   ```javascript
   // ❌ 不好
   logger.error(LogModule.NAL2, "失败");

   // ✅ 好
   logger.error(LogModule.NAL2, "NAL2函数处理失败", {
     functionName: "dllVersion",
     sequence_num: 123,
     error: error.message,
     stack: error.stack,
   });
   ```

3. **避免敏感信息**

   ```javascript
   // ❌ 不要记录敏感信息
   logger.info(LogModule.USER, "用户登录", {
     password: "123456", // 危险！
   });

   // ✅ 只记录必要信息
   logger.info(LogModule.USER, "用户登录", {
     userId: "12345",
     timestamp: new Date(),
   });
   ```

4. **定期清理日志**
   - 在适当的时机清理过期日志
   - 可以设置自动清理策略

## 故障排查

### 日志未显示

1. 检查是否正确导入 Logger
2. 确认 Logger 已初始化（自动初始化）
3. 检查日志监听器是否正确设置

### 导出失败

1. 检查存储权限
2. 确认目标目录存在
3. 查看错误信息

### 性能问题

1. 减少日志数量限制
2. 关闭 DEBUG 级别日志
3. 减少附加数据大小

## 示例代码

查看以下文件获取完整示例：

- `utils/AppServer.js` - 服务器日志
- `utils/NAL2Bridge.js` - NAL2 业务日志
- `components/HttpServerScreen.js` - UI 日志集成

## 技术支持

如有问题，请查看：

- 日志系统源码：`utils/Logger.js`
- 本文档：`utils/LOGGER_README.md`
