/**
 * GlobalVariables.js
 * 全局变量管理器 - 管理SDK要求不可修改的全局变量
 * 
 * 根据SDK文档要求，以下变量一旦生成后不应再修改：
 * - CFArray: CrossOverFrequencies (交叉频率数组)
 * - FreqInCh: 频率所在通道映射数组
 * - CT: CompressionThreshold (压缩阈值数组，三分之一倍频程下的压缩阈值)
 */

class GlobalVariablesManager {
  constructor() {
    // 初始化三个全局变量为空数组
    this.CFArray = [];
    this.FreqInCh = [];
    this.CT = [];
    
    // 监听器列表，用于通知UI更新
    this.listeners = [];
  }

  /**
   * 设置 CFArray (交叉频率数组)
   * @param {Array} value - 新的CFArray值
   */
  setCFArray(value) {
    if (!Array.isArray(value)) {
      console.warn('[GlobalVariables] CFArray必须是数组类型');
      return;
    }
    this.CFArray = [...value];
    this.notifyListeners();
    console.log('[GlobalVariables] CFArray已更新:', this.CFArray);
  }

  /**
   * 设置 FreqInCh (频率通道映射数组)
   * @param {Array} value - 新的FreqInCh值
   */
  setFreqInCh(value) {
    if (!Array.isArray(value)) {
      console.warn('[GlobalVariables] FreqInCh必须是数组类型');
      return;
    }
    this.FreqInCh = [...value];
    this.notifyListeners();
    console.log('[GlobalVariables] FreqInCh已更新:', this.FreqInCh);
  }

  /**
   * 设置 CT (压缩阈值数组)
   * @param {Array} value - 新的CT值
   */
  setCT(value) {
    if (!Array.isArray(value)) {
      console.warn('[GlobalVariables] CT必须是数组类型');
      return;
    }
    this.CT = [...value];
    this.notifyListeners();
    console.log('[GlobalVariables] CT已更新:', this.CT);
  }

  /**
   * 获取 CFArray
   * @returns {Array} CFArray的副本
   */
  getCFArray() {
    return [...this.CFArray];
  }

  /**
   * 获取 FreqInCh
   * @returns {Array} FreqInCh的副本
   */
  getFreqInCh() {
    return [...this.FreqInCh];
  }

  /**
   * 获取 CT
   * @returns {Array} CT的副本
   */
  getCT() {
    return [...this.CT];
  }

  /**
   * 删除 CFArray
   */
  deleteCFArray() {
    this.CFArray = [];
    this.notifyListeners();
    console.log('[GlobalVariables] CFArray已删除');
  }

  /**
   * 删除 FreqInCh
   */
  deleteFreqInCh() {
    this.FreqInCh = [];
    this.notifyListeners();
    console.log('[GlobalVariables] FreqInCh已删除');
  }

  /**
   * 删除 CT
   */
  deleteCT() {
    this.CT = [];
    this.notifyListeners();
    console.log('[GlobalVariables] CT已删除');
  }

  /**
   * 获取所有全局变量的状态
   * @returns {Object} 包含所有全局变量的对象
   */
  getAllVariables() {
    return {
      CFArray: this.getCFArray(),
      FreqInCh: this.getFreqInCh(),
      CT: this.getCT()
    };
  }

  /**
   * 清空所有全局变量
   */
  clearAll() {
    this.CFArray = [];
    this.FreqInCh = [];
    this.CT = [];
    this.notifyListeners();
    console.log('[GlobalVariables] 所有全局变量已清空');
  }

  /**
   * 添加监听器
   * @param {Function} listener - 监听器函数
   */
  addListener(listener) {
    if (typeof listener === 'function') {
      this.listeners.push(listener);
    }
  }

  /**
   * 移除监听器
   * @param {Function} listener - 要移除的监听器函数
   */
  removeListener(listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * 通知所有监听器
   */
  notifyListeners() {
    const variables = this.getAllVariables();
    this.listeners.forEach(listener => {
      try {
        listener(variables);
      } catch (error) {
        console.error('[GlobalVariables] 监听器执行错误:', error);
      }
    });
  }

  /**
   * 获取变量的统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      CFArray: {
        length: this.CFArray.length,
        isEmpty: this.CFArray.length === 0
      },
      FreqInCh: {
        length: this.FreqInCh.length,
        isEmpty: this.FreqInCh.length === 0
      },
      CT: {
        length: this.CT.length,
        isEmpty: this.CT.length === 0
      }
    };
  }
}

// 创建单例实例
const globalVariables = new GlobalVariablesManager();

// 导出单例和类
module.exports = {
  globalVariables,
  GlobalVariablesManager
};
