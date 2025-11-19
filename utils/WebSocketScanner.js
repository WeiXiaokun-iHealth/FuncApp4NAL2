/**
 * WebSocket Scanner
 * 扫描附近的 WebSocket 服务
 */

// 常见的WebSocket端口列表
const COMMON_PORTS = [3000, 8080, 8000, 3001, 5000, 9000];

// 扫描超时时间（毫秒）
const SCAN_TIMEOUT = 5000;

export class WebSocketScanner {
  /**
   * 扫描本地网络中的 WebSocket 服务
   * @param {string} baseIP - 基础IP地址（如 192.168.1）
   * @param {number} startHost - 起始主机号
   * @param {number} endHost - 结束主机号
   * @returns {Promise<Array>} 可用的 WebSocket 服务列表
   */
  static async scanNetwork(baseIP = null, startHost = 1, endHost = 255) {
    const availableServers = [];
    
    // 如果没有提供基础IP，尝试获取本地IP
    if (!baseIP) {
      // 在React Native中，我们可以扫描常见的本地网络段
      const commonNetworks = ['192.168.1', '192.168.0', '172.20.10', '10.0.0'];
      
      for (const network of commonNetworks) {
        const results = await this.scanIPRange(network, startHost, Math.min(endHost, 10));
        availableServers.push(...results);
        
        // 如果找到服务，停止扫描其他网段
        if (availableServers.length > 0) {
          break;
        }
      }
    } else {
      const results = await this.scanIPRange(baseIP, startHost, endHost);
      availableServers.push(...results);
    }
    
    return availableServers;
  }

  /**
   * 扫描指定IP范围
   */
  static async scanIPRange(baseIP, startHost, endHost) {
    const availableServers = [];
    const scanPromises = [];
    
    // 限制并发扫描数量以避免性能问题
    const maxConcurrent = 5;
    
    for (let host = startHost; host <= endHost; host++) {
      const ip = `${baseIP}.${host}`;
      
      for (const port of COMMON_PORTS) {
        scanPromises.push(this.checkWebSocketServer(ip, port));
        
        // 控制并发数量
        if (scanPromises.length >= maxConcurrent) {
          const results = await Promise.all(scanPromises);
          availableServers.push(...results.filter(r => r !== null));
          scanPromises.length = 0;
        }
      }
    }
    
    // 处理剩余的扫描任务
    if (scanPromises.length > 0) {
      const results = await Promise.all(scanPromises);
      availableServers.push(...results.filter(r => r !== null));
    }
    
    return availableServers;
  }

  /**
   * 检查指定 IP 和端口是否有 WebSocket 服务
   */
  static async checkWebSocketServer(ip, port) {
    return new Promise((resolve) => {
      const wsUrl = `ws://${ip}:${port}`;
      let resolved = false;
      let ws = null;
      
      console.log(`[扫描] 检查 ${wsUrl}...`);
      
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          console.log(`[扫描] ${wsUrl} 超时`);
          if (ws) {
            try {
              ws.close();
            } catch (e) {}
          }
          resolve(null);
        }
      }, SCAN_TIMEOUT);
      
      try {
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          if (!resolved) {
            console.log(`[扫描] ${wsUrl} 连接成功！`);
            resolved = true;
            clearTimeout(timeout);
            
            // 直接返回结果，不等待消息响应
            try {
              ws.close();
            } catch (e) {}
            
            resolve({
              ip,
              port,
              url: wsUrl,
              name: `WebSocket Server (${ip}:${port})`,
              status: 'available'
            });
          }
        };
        
        ws.onerror = (error) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            console.log(`[扫描] ${wsUrl} 连接错误`);
            try {
              ws.close();
            } catch (e) {}
            resolve(null);
          }
        };
        
        ws.onclose = () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            console.log(`[扫描] ${wsUrl} 连接关闭`);
            resolve(null);
          }
        };
      } catch (error) {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          console.log(`[扫描] ${wsUrl} 异常:`, error.message);
          resolve(null);
        }
      }
    });
  }

  /**
   * 测试指定的 WebSocket URL 是否可用
   */
  static async testWebSocketURL(url) {
    return new Promise((resolve) => {
      let ws = null;
      console.log(`[测试] 测试地址 ${url}...`);
      
      const timeout = setTimeout(() => {
        console.log(`[测试] ${url} 超时`);
        if (ws) {
          try {
            ws.close();
          } catch (e) {}
        }
        resolve(false);
      }, SCAN_TIMEOUT);
      
      try {
        ws = new WebSocket(url);
        
        ws.onopen = () => {
          console.log(`[测试] ${url} 连接成功！`);
          clearTimeout(timeout);
          try {
            ws.close();
          } catch (e) {}
          resolve(true);
        };
        
        ws.onerror = (error) => {
          console.log(`[测试] ${url} 连接错误`);
          clearTimeout(timeout);
          try {
            ws.close();
          } catch (e) {}
          resolve(false);
        };
      } catch (error) {
        console.log(`[测试] ${url} 异常:`, error.message);
        clearTimeout(timeout);
        resolve(false);
      }
    });
  }

  /**
   * 快速扫描常用地址
   */
  static async quickScan() {
    console.log('[快速扫描] 开始扫描...');
    
    const quickAddresses = [
      { ip: '192.168.1.106', port: 3000 },
      { ip: '192.168.0.106', port: 3000 },
      { ip: '172.20.10.2', port: 3000 },
      { ip: '172.29.0.106', port: 3000 },
      { ip: '10.0.0.2', port: 3000 },
      { ip: 'localhost', port: 3000 },
      { ip: '127.0.0.1', port: 3000 },
    ];
    
    console.log('[快速扫描] 扫描地址列表:', quickAddresses.map(a => `${a.ip}:${a.port}`).join(', '));
    
    // 逐个扫描，避免并发问题
    const results = [];
    for (const { ip, port } of quickAddresses) {
      const result = await this.checkWebSocketServer(ip, port);
      if (result) {
        results.push(result);
      }
    }
    
    console.log(`[快速扫描] 完成，找到 ${results.length} 个服务`);
    return results;
  }
}
