/**
 * 统一日志管理系统
 * 提供完整的日志记录、存储、查询和导出功能
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

// 日志级别
export const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  FATAL: 'FATAL',
};

// 业务模块标识
export const LogModule = {
  APP: 'APP',              // 应用生命周期
  SERVER: 'SERVER',        // HTTP服务器
  NAL2: 'NAL2',           // NAL2业务逻辑
  NETWORK: 'NETWORK',      // 网络请求
  DATABASE: 'DATABASE',    // 数据库操作
  UI: 'UI',               // UI交互
  SYSTEM: 'SYSTEM',       // 系统事件
};

class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // 内存中最多保留1000条日志
    this.listeners = new Set();
    this.logFile = null;
    this.persistEnabled = true; // 是否启用持久化
    this.initialized = false;
  }

  /**
   * 初始化日志系统
   */
  async init() {
    if (this.initialized) return;
    
    try {
      // 从AsyncStorage加载历史日志
      await this.loadLogs();
      this.initialized = true;
      this.log(LogLevel.INFO, LogModule.SYSTEM, '日志系统初始化成功');
    } catch (error) {
      console.error('日志系统初始化失败:', error);
    }
  }

  /**
   * 记录日志
   * @param {string} level - 日志级别
   * @param {string} module - 业务模块
   * @param {string} message - 日志消息
   * @param {object} data - 附加数据
   */
  log(level, module, message, data = null) {
    const logEntry = {
      id: Date.now() + Math.random(), // 唯一ID
      timestamp: new Date().toISOString(),
      timestampLocal: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
      level,
      module,
      message,
      data: data ? this.safeStringify(data) : null,
      platform: Platform.OS,
    };

    // 添加到内存
    this.logs.unshift(logEntry);
    
    // 限制内存中的日志数量
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // 通知监听器
    this.notifyListeners(logEntry);

    // 异步持久化（不阻塞主线程）
    if (this.persistEnabled) {
      this.persistLog(logEntry).catch(err => {
        console.error('持久化日志失败:', err);
      });
    }

    // 同时输出到console（用于调试）
    this.consoleOutput(logEntry);
  }

  /**
   * DEBUG级别日志
   */
  debug(module, message, data) {
    this.log(LogLevel.DEBUG, module, message, data);
  }

  /**
   * INFO级别日志
   */
  info(module, message, data) {
    this.log(LogLevel.INFO, module, message, data);
  }

  /**
   * WARN级别日志
   */
  warn(module, message, data) {
    this.log(LogLevel.WARN, module, message, data);
  }

  /**
   * ERROR级别日志
   */
  error(module, message, data) {
    this.log(LogLevel.ERROR, module, message, data);
  }

  /**
   * FATAL级别日志
   */
  fatal(module, message, data) {
    this.log(LogLevel.FATAL, module, message, data);
  }

  /**
   * 安全的JSON序列化
   */
  safeStringify(obj) {
    try {
      if (obj === null) return 'null';
      if (obj === undefined) return 'undefined';
      if (typeof obj !== 'object') return String(obj);
      
      const seen = new WeakSet();
      return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
        }
        return value;
      });
    } catch (error) {
      return String(obj);
    }
  }

  /**
   * 输出到控制台
   */
  consoleOutput(logEntry) {
    const prefix = `[${logEntry.timestampLocal}][${logEntry.level}][${logEntry.module}]`;
    const message = logEntry.message;
    
    switch (logEntry.level) {
      case LogLevel.DEBUG:
        console.log(prefix, message, logEntry.data || '');
        break;
      case LogLevel.INFO:
        console.info(prefix, message, logEntry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, logEntry.data || '');
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(prefix, message, logEntry.data || '');
        break;
      default:
        console.log(prefix, message, logEntry.data || '');
    }
  }

  /**
   * 持久化日志到AsyncStorage
   */
  async persistLog(logEntry) {
    try {
      const key = `@log:${logEntry.id}`;
      await AsyncStorage.setItem(key, JSON.stringify(logEntry));
    } catch (error) {
      console.error('持久化日志失败:', error);
    }
  }

  /**
   * 从AsyncStorage加载日志
   */
  async loadLogs() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const logKeys = keys.filter(key => key.startsWith('@log:'));
      
      if (logKeys.length === 0) return;

      const items = await AsyncStorage.multiGet(logKeys);
      const loadedLogs = items
        .map(([key, value]) => {
          try {
            return JSON.parse(value);
          } catch {
            return null;
          }
        })
        .filter(log => log !== null)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      this.logs = loadedLogs.slice(0, this.maxLogs);
    } catch (error) {
      console.error('加载日志失败:', error);
    }
  }

  /**
   * 获取所有日志
   */
  getLogs() {
    return [...this.logs];
  }

  /**
   * 根据条件筛选日志
   */
  filterLogs({ level, module, startTime, endTime, keyword }) {
    return this.logs.filter(log => {
      if (level && log.level !== level) return false;
      if (module && log.module !== module) return false;
      if (startTime && new Date(log.timestamp) < new Date(startTime)) return false;
      if (endTime && new Date(log.timestamp) > new Date(endTime)) return false;
      if (keyword) {
        const searchText = `${log.message} ${log.data || ''}`.toLowerCase();
        if (!searchText.includes(keyword.toLowerCase())) return false;
      }
      return true;
    });
  }

  /**
   * 清除所有日志
   */
  async clearLogs() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const logKeys = keys.filter(key => key.startsWith('@log:'));
      
      if (logKeys.length > 0) {
        await AsyncStorage.multiRemove(logKeys);
      }
      
      this.logs = [];
      this.notifyListeners({ type: 'clear' });
      this.log(LogLevel.INFO, LogModule.SYSTEM, '日志已清空');
    } catch (error) {
      console.error('清除日志失败:', error);
    }
  }

  /**
   * 导出日志到文件
   */
  async exportLogs(format = 'json') {
    try {
      const timestamp = Date.now();
      const fileName = `nal2-logs-${timestamp}.${format}`;
      let content;

      if (format === 'json') {
        content = JSON.stringify(this.logs, null, 2);
      } else if (format === 'txt') {
        content = this.logs.map(log => {
          const dataStr = log.data ? `\nData: ${log.data}` : '';
          return `[${log.timestampLocal}][${log.level}][${log.module}] ${log.message}${dataStr}`;
        }).join('\n\n');
      } else if (format === 'csv') {
        const header = 'Timestamp,Level,Module,Message,Data\n';
        const rows = this.logs.map(log => {
          const message = log.message.replace(/"/g, '""');
          const data = (log.data || '').replace(/"/g, '""');
          return `"${log.timestampLocal}","${log.level}","${log.module}","${message}","${data}"`;
        }).join('\n');
        content = header + rows;
      }

      const filePath = Platform.OS === 'android'
        ? `${RNFS.ExternalStorageDirectoryPath}/Download/${fileName}`
        : `${RNFS.DocumentDirectoryPath}/${fileName}`;

      await RNFS.writeFile(filePath, content, 'utf8');
      
      return {
        success: true,
        path: filePath,
        fileName,
      };
    } catch (error) {
      console.error('导出日志失败:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 添加日志监听器
   */
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * 通知所有监听器
   */
  notifyListeners(logEntry) {
    this.listeners.forEach(callback => {
      try {
        callback(logEntry);
      } catch (error) {
        console.error('日志监听器执行失败:', error);
      }
    });
  }

  /**
   * 获取日志统计信息
   */
  getStatistics() {
    const stats = {
      total: this.logs.length,
      byLevel: {},
      byModule: {},
    };

    this.logs.forEach(log => {
      // 按级别统计
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
      // 按模块统计
      stats.byModule[log.module] = (stats.byModule[log.module] || 0) + 1;
    });

    return stats;
  }
}

// 创建单例
const logger = new Logger();

// 自动初始化
logger.init();

export default logger;
