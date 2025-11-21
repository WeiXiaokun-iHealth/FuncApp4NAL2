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
    this.port = port;

    try {
      if (HttpServerModule) {
        // 先检查实际状态
        const status = await HttpServerModule.getServerStatus();
        
        // 如果服务器实际已在运行，直接返回成功
        if (status.isRunning) {
          this.isRunning = true;
          console.log('[AppServer] 服务器已在运行，返回当前状态');
          return {
            success: true,
            port: status.port || port,
            ipAddress: status.ipAddress || 'Unknown'
          };
        }
        
        // 服务器未运行，尝试启动
        console.log(`[AppServer] 正在启动服务器，端口 ${port}...`);
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
      // 如果是端口占用错误，说明服务器实际已在运行
      if (error.message && error.message.includes('EADDRINUSE')) {
        console.log('[AppServer] 端口已被占用，服务器可能已在运行');
        // 再次检查状态
        try {
          const status = await HttpServerModule.getServerStatus();
          if (status.isRunning) {
            this.isRunning = true;
            return {
              success: true,
              port: status.port || port,
              ipAddress: status.ipAddress || 'Unknown'
            };
          }
        } catch (statusError) {
          console.error('[AppServer] 检查状态失败:', statusError);
        }
      }
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
