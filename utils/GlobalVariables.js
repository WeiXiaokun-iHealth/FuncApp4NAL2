/**
 * GlobalVariables.js
 * 全局变量管理器 - 管理SDK要求不可修改的全局变量
 * 
 * 根据SDK文档要求，以下变量一旦生成后不应再修改：
 * - CFArray: CrossOverFrequencies (交叉频率数组)
 * - FreqInCh: 频率所在通道映射数组
 * - CR: CompressionRatio (压缩比数组)
 */

class GlobalVariablesManager {
  constructor() {
    // 初始化三个全局变量为空数组
    this.CFArray = [];
    this.FreqInCh = [];
    this.CR = [];
    
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
   * 设置 CR (压缩比数组)
   * @param {Array} value - 新的CR值
   */
  setCR(value) {
    if (!Array.isArray(value)) {
      console.warn('[GlobalVariables] CR必须是数组类型');
      return;
    }
    this.CR = [...value];
    this.notifyListeners();
    console.log('[GlobalVariables] CR已更新:', this.CR);
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
   * 获取 CR
   * @returns {Array} CR的副本
   */
  getCR() {
    return [...this.CR];
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
   * 删除 CR
   */
  deleteCR() {
    this.CR = [];
    this.notifyListeners();
    console.log('[GlobalVariables] CR已删除');
  }

  /**
   * 获取所有全局变量的状态
   * @returns {Object} 包含所有全局变量的对象
   */
  getAllVariables() {
    return {
      CFArray: this.getCFArray(),
      FreqInCh: this.getFreqInCh(),
      CR: this.getCR()
    };
  }

  /**
   * 清空所有全局变量
   */
  clearAll() {
    this.CFArray = [];
    this.FreqInCh = [];
    this.CR = [];
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
      CR: {
        length: this.CR.length,
        isEmpty: this.CR.length === 0
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
