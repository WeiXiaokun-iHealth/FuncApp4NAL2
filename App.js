import React, { useEffect } from 'react';
import { NativeEventEmitter, NativeModules } from 'react-native';
import HttpServerScreen from './components/HttpServerScreen';

/**
 * FuncApp4NAL2 - 新架构
 * 
 * App 作为服务器模式:
 * - App 启动时自动创建 WebSocket 服务器
 * - App 提供 HTTP API 接口
 * - Web 端作为客户端连接 App
 * - Web 端通过扫描或手动输入连接 App
 * 
 * 优点:
 * - 简化架构，无需独立服务器
 * - App 端完全自主，不依赖外部服务
 * - 更灵活的部署方式
 */
export default function App() {
  useEffect(() => {
    // 设置 NAL2 日志监听器
    const { Nal2 } = NativeModules;
    if (Nal2) {
      const eventEmitter = new NativeEventEmitter(Nal2);
      
      const logSubscription = eventEmitter.addListener('Nal2Log', (event) => {
        const { tag, level, message, timestamp } = event;
        const time = new Date(timestamp).toLocaleTimeString();
        
        // 根据日志级别使用不同的 console 方法
        const logPrefix = `[${time}] [${tag}]`;
        switch (level) {
          case 'ERROR':
            console.error(`${logPrefix} ${message}`);
            break;
          case 'WARN':
            console.warn(`${logPrefix} ${message}`);
            break;
          case 'INFO':
            console.info(`${logPrefix} ${message}`);
            break;
          case 'DEBUG':
            console.log(`${logPrefix} ${message}`);
            break;
          default:
            console.log(`${logPrefix} ${message}`);
        }
      });

      console.log('✅ NAL2 日志监听器已启动');

      // 清理函数
      return () => {
        logSubscription.remove();
        console.log('🔴 NAL2 日志监听器已停止');
      };
    } else {
      console.warn('⚠️ Nal2 模块未找到，日志监听器未启动');
    }
  }, []);

  return <HttpServerScreen />;
}
