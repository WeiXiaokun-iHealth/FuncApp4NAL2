/**
 * DataParser.js
 * 数据解析模块 - 解析来自WebSocket的JSON数据
 */

class DataParser {
  /**
   * 解析输入的JSON字符串
   * @param {string} jsonString - JSON字符串
   * @returns {Object} 解析后的数据对象
   * @throws {Error} 解析失败时抛出错误
   */
  static parseInput(jsonString) {
    try {
      const data = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      
      // 验证必需字段
      if (!data.function) {
        throw new Error('缺少必需字段: function');
      }
      
      if (!data.input_parameters) {
        throw new Error('缺少必需字段: input_parameters');
      }
      
      return {
        sequence_num: data.sequence_num || 0,
        function: data.function,
        input_parameters: data.input_parameters
      };
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`JSON解析失败: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 创建输出响应对象
   * @param {number} sequence_num - 序列号
   * @param {string} functionName - 函数名称
   * @param {number} returnCode - 返回码 (0表示成功, -1表示失败)
   * @param {Object} outputParameters - 输出参数
   * @returns {Object} 格式化的输出对象
   */
  static createOutput(sequence_num, functionName, returnCode, outputParameters) {
    return {
      sequence_num: sequence_num,
      result: returnCode,
      function: functionName,
      return: returnCode,
      output_parameters: outputParameters || {}
    };
  }

  /**
   * 创建错误输出
   * @param {number} sequence_num - 序列号
   * @param {string} functionName - 函数名称
   * @param {string} errorMessage - 错误消息
   * @returns {Object} 错误输出对象
   */
  static createErrorOutput(sequence_num, functionName, errorMessage) {
    return this.createOutput(sequence_num, functionName, -1, {
      error: errorMessage
    });
  }

  /**
   * 格式化输出为JSON字符串
   * @param {Object} output - 输出对象
   * @returns {string} 格式化的JSON字符串
   */
  static formatOutput(output) {
    return JSON.stringify(output, null, 2);
  }

  /**
   * 验证参数是否存在
   * @param {Object} params - 参数对象
   * @param {Array<string>} requiredFields - 必需字段列表
   * @throws {Error} 缺少必需字段时抛出错误
   */
  static validateParameters(params, requiredFields) {
    for (const field of requiredFields) {
      if (params[field] === undefined) {
        throw new Error(`缺少必需参数: ${field}`);
      }
    }
  }

  /**
   * 确保数组参数的默认值
   * @param {*} value - 原始值
   * @param {number} size - 数组大小
   * @param {*} defaultValue - 默认值
   * @returns {Array} 数组
   */
  static ensureArray(value, size, defaultValue = 0) {
    if (Array.isArray(value)) {
      return value;
    }
    return Array(size).fill(defaultValue);
  }

  /**
   * 安全地获取数组参数
   * @param {Object} params - 参数对象
   * @param {string} key - 参数键名
   * @param {number} defaultSize - 默认数组大小
   * @param {*} defaultValue - 默认值
   * @returns {Array} 数组
   */
  static getArrayParam(params, key, defaultSize = 9, defaultValue = 0) {
    if (params[key] !== undefined) {
      return Array.isArray(params[key]) ? params[key] : [params[key]];
    }
    return Array(defaultSize).fill(defaultValue);
  }

  /**
   * 安全地获取数值参数
   * @param {Object} params - 参数对象
   * @param {string} key - 参数键名
   * @param {number} defaultValue - 默认值
   * @returns {number} 数值
   */
  static getNumberParam(params, key, defaultValue = 0) {
    return params[key] !== undefined ? Number(params[key]) : defaultValue;
  }

  /**
   * 简单的parseData方法，适配测试
   * @param {Object} data - JSON数据对象
   * @returns {Object} 解析后的数据
   */
  static parseData(data) {
    return this.parseInput(data);
  }
}

module.exports = { DataParser };
