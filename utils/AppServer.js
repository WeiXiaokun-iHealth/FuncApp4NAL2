/**
 * AppServer - App端的HTTP服务器
 * 
 * 功能：
 * 1. 启动HTTP服务器
 * 2. 提供HTTP API接口供Web端调用
 * 3. 处理NAL2函数调用请求
 */

import { NativeModules } from 'react-native';

const { HttpServerModule } = NativeModules;

class AppServer {
  constructor() {
    this.port = 8080;
    this.isRunning = false;
  }

  /**
   * 启动服务器
   * @param {number} port - 端口号
   */
  async start(port = 8080) {
    if (this.isRunning) {
      console.log('[AppServer] 服务器已在运行');
      return { success: true, port: this.port };
    }

    this.port = port;

    try {
      if (HttpServerModule) {
        // 使用原生模块启动服务器
        const result = await HttpServerModule.startServer(port);
        
        if (result.success) {
          this.isRunning = true;
          console.log(`[AppServer] 服务器已启动在端口 ${port}`);
          console.log(`[AppServer] IP地址: ${result.ipAddress}`);
          return result;
        } else {
          throw new Error(result.error || '启动服务器失败');
        }
      } else {
        throw new Error('HttpServerModule 未找到，需要原生实现');
      }
    } catch (error) {
      console.error('[AppServer] 启动服务器失败:', error);
      throw error;
    }
  }

  /**
   * 停止服务器
   */
  async stop() {
    if (!this.isRunning) {
      return { success: true };
    }

    try {
      if (HttpServerModule) {
        await HttpServerModule.stopServer();
        this.isRunning = false;
        console.log('[AppServer] 服务器已停止');
        return { success: true };
      }
    } catch (error) {
      console.error('[AppServer] 停止服务器失败:', error);
      throw error;
    }
  }

  /**
   * 获取服务器状态
   */
  async getStatus() {
    if (HttpServerModule) {
      return await HttpServerModule.getServerStatus();
    }
    
    return {
      isRunning: this.isRunning,
      port: this.port,
      ipAddress: 'Unknown'
    };
  }

  /**
   * 获取本地IP地址
   */
  async getLocalIP() {
    if (HttpServerModule) {
      const status = await HttpServerModule.getServerStatus();
      return status.ipAddress;
    }
    return null;
  }
}

export default new AppServer();
