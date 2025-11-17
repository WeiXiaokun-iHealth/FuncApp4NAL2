/**
 * NAL2Bridge.js
 * NAL2桥接模块 - 将解析的数据映射到NAL2原生模块调用
 */

import { DataParser } from './DataParser';
import {
  crossOverFrequencies,
  centerFrequencies,
  compressionThreshold,
  setBWC,
  setAdultChild,
  setExperience,
  setCompSpeed,
  setTonalLanguage,
  setGender,
  getRECDhIndiv,
  getRECDhIndiv9,
  getRECDtIndiv,
  getRECDtIndiv9,
  setRECDhIndiv,
  setRECDhIndiv9,
  setRECDtIndiv,
  setRECDtIndiv9,
  compressionRatio,
  getMPO,
  realEarAidedGain,
  realEarInsertionGain,
  tccCouplerGain,
  earSimulatorGain
} from 'react-native-nal2';

export class NAL2Bridge {
  /**
   * 处理输入数据并调用相应的NAL2函数
   * @param {Object} parsedData - 已解析的数据对象
   * @returns {Promise<Object>} 输出对象
   */
  static async processFunction(parsedData) {
    const { sequence_num, function: functionName, input_parameters } = parsedData;

    try {
      console.log(`[NAL2Bridge] 处理函数: ${functionName}`);
      console.log(`[NAL2Bridge] 输入参数:`, input_parameters);

      let result;
      let outputParameters = {};

      // 根据函数名调用相应的处理方法
      switch (functionName) {
        case 'CrossOverFrequencies_NL2':
          result = await this.handleCrossOverFrequencies(input_parameters);
          outputParameters = { crossOverFreq: result };
          break;

        case 'CenterFrequencies':
          result = await this.handleCenterFrequencies(input_parameters);
          outputParameters = { centerFreq: result };
          break;

        case 'CompressionThreshold_NL2':
          result = await this.handleCompressionThreshold(input_parameters);
          outputParameters = { CT: result };
          break;

        case 'setBWC':
          result = await this.handleSetBWC(input_parameters);
          outputParameters = { success: true };
          break;

        case 'SetAdultChild':
          result = await this.handleSetAdultChild(input_parameters);
          outputParameters = { success: true };
          break;

        case 'SetExperience':
          result = await this.handleSetExperience(input_parameters);
          outputParameters = { success: true };
          break;

        case 'SetCompSpeed':
          result = await this.handleSetCompSpeed(input_parameters);
          outputParameters = { success: true };
          break;

        case 'SetTonalLanguage':
          result = await this.handleSetTonalLanguage(input_parameters);
          outputParameters = { success: true };
          break;

        case 'SetGender':
          result = await this.handleSetGender(input_parameters);
          outputParameters = { success: true };
          break;

        case 'GetRECDh_indiv_NL2':
          result = await this.handleGetRECDh(input_parameters);
          outputParameters = { RECDh: result };
          break;

        case 'GetRECDh_indiv9_NL2':
          result = await this.handleGetRECDh9(input_parameters);
          outputParameters = { RECDh: result };
          break;

        case 'GetRECDt_indiv_NL2':
          result = await this.handleGetRECDt(input_parameters);
          outputParameters = { RECDt: result };
          break;

        case 'GetRECDt_indiv9_NL2':
          result = await this.handleGetRECDt9(input_parameters);
          outputParameters = { RECDt: result };
          break;

        case 'SetRECDh_indiv_NL2':
          result = await this.handleSetRECDh(input_parameters);
          outputParameters = { success: true };
          break;

        case 'SetRECDh_indiv9_NL2':
          result = await this.handleSetRECDh9(input_parameters);
          outputParameters = { success: true };
          break;

        case 'SetRECDt_indiv_NL2':
          result = await this.handleSetRECDt(input_parameters);
          outputParameters = { success: true };
          break;

        case 'SetRECDt_indiv9_NL2':
          result = await this.handleSetRECDt9(input_parameters);
          outputParameters = { success: true };
          break;

        case 'CompressionRatio_NL2':
          result = await this.handleCompressionRatio(input_parameters);
          outputParameters = { CR: result };
          break;

        case 'getMPO_NL2':
          result = await this.handleGetMPO(input_parameters);
          outputParameters = { MPO: result };
          break;

        case 'RealEarAidedGain_NL2':
          result = await this.handleRealEarAidedGain(input_parameters);
          outputParameters = { REAG: result };
          break;

        case 'RealEarInsertionGain_NL2':
          result = await this.handleRealEarInsertionGain(input_parameters);
          outputParameters = { REIG: result };
          break;

        case 'TccCouplerGain_NL2':
          result = await this.handleTccCouplerGain(input_parameters);
          outputParameters = { TccGain: result };
          break;

        case 'EarSimulatorGain_NL2':
          result = await this.handleEarSimulatorGain(input_parameters);
          outputParameters = { EarSimGain: result };
          break;

        default:
          throw new Error(`未知函数: ${functionName}`);
      }

      console.log(`[NAL2Bridge] 处理成功:`, outputParameters);
      return DataParser.createOutput(sequence_num, functionName, 0, outputParameters);

    } catch (error) {
      console.error(`[NAL2Bridge] 处理失败:`, error);
      return DataParser.createErrorOutput(sequence_num, functionName, error.message);
    }
  }

  // ==================== 具体函数处理方法 ====================

  static async handleCrossOverFrequencies(params) {
    DataParser.validateParameters(params, ['channels', 'AC', 'BC']);
    return await crossOverFrequencies(
      params.channels,
      params.AC,
      params.BC
    );
  }

  static async handleCenterFrequencies(params) {
    DataParser.validateParameters(params, ['channels', 'CFArray']);
    return await centerFrequencies(
      params.channels,
      params.CFArray
    );
  }

  static async handleCompressionThreshold(params) {
    DataParser.validateParameters(params, ['WBCT', 'aidType', 'direction', 'mic', 'calcCh']);
    return await compressionThreshold(
      params.WBCT,
      params.aidType,
      params.direction,
      params.mic,
      params.calcCh
    );
  }

  static async handleSetBWC(params) {
    DataParser.validateParameters(params, ['channels', 'crossOver', 'bandwidth', 'selection']);
    return await setBWC(
      params.channels,
      params.crossOver,
      params.bandwidth,
      params.selection
    );
  }

  static async handleSetAdultChild(params) {
    DataParser.validateParameters(params, ['adultChild', 'dateOfBirth']);
    return await setAdultChild(
      params.adultChild,
      params.dateOfBirth
    );
  }

  static async handleSetExperience(params) {
    DataParser.validateParameters(params, ['experience']);
    return await setExperience(params.experience);
  }

  static async handleSetCompSpeed(params) {
    DataParser.validateParameters(params, ['compSpeed']);
    return await setCompSpeed(params.compSpeed);
  }

  static async handleSetTonalLanguage(params) {
    DataParser.validateParameters(params, ['tonal']);
    return await setTonalLanguage(params.tonal);
  }

  static async handleSetGender(params) {
    DataParser.validateParameters(params, ['gender']);
    return await setGender(params.gender);
  }

  static async handleGetRECDh(params) {
    DataParser.validateParameters(params, ['RECDmeasType', 'dateOfBirth', 'aidType', 'tubing', 'coupler', 'fittingDepth']);
    return await getRECDhIndiv(
      params.RECDmeasType,
      params.dateOfBirth,
      params.aidType,
      params.tubing,
      params.coupler,
      params.fittingDepth
    );
  }

  static async handleGetRECDh9(params) {
    DataParser.validateParameters(params, ['RECDmeasType', 'dateOfBirth', 'aidType', 'tubing', 'coupler', 'fittingDepth']);
    return await getRECDhIndiv9(
      params.RECDmeasType,
      params.dateOfBirth,
      params.aidType,
      params.tubing,
      params.coupler,
      params.fittingDepth
    );
  }

  static async handleGetRECDt(params) {
    DataParser.validateParameters(params, ['RECDmeasType', 'dateOfBirth', 'aidType', 'tubing', 'vent', 'earpiece', 'coupler', 'fittingDepth']);
    return await getRECDtIndiv(
      params.RECDmeasType,
      params.dateOfBirth,
      params.aidType,
      params.tubing,
      params.vent,
      params.earpiece,
      params.coupler,
      params.fittingDepth
    );
  }

  static async handleGetRECDt9(params) {
    DataParser.validateParameters(params, ['RECDmeasType', 'dateOfBirth', 'aidType', 'tubing', 'vent', 'earpiece', 'coupler', 'fittingDepth']);
    return await getRECDtIndiv9(
      params.RECDmeasType,
      params.dateOfBirth,
      params.aidType,
      params.tubing,
      params.vent,
      params.earpiece,
      params.coupler,
      params.fittingDepth
    );
  }

  static async handleSetRECDh(params) {
    DataParser.validateParameters(params, ['RECDh']);
    return await setRECDhIndiv(params.RECDh);
  }

  static async handleSetRECDh9(params) {
    DataParser.validateParameters(params, ['RECDh']);
    return await setRECDhIndiv9(params.RECDh);
  }

  static async handleSetRECDt(params) {
    DataParser.validateParameters(params, ['RECDt']);
    return await setRECDtIndiv(params.RECDt);
  }

  static async handleSetRECDt9(params) {
    DataParser.validateParameters(params, ['RECDt']);
    return await setRECDtIndiv9(params.RECDt);
  }

  static async handleCompressionRatio(params) {
    DataParser.validateParameters(params, ['CR', 'channels', 'centerFreq', 'AC', 'BC', 'direction', 'mic', 'limiting', 'ACother', 'noOfAids']);
    return await compressionRatio(
      params.CR,
      params.channels,
      params.centerFreq,
      params.AC,
      params.BC,
      params.direction,
      params.mic,
      params.limiting,
      params.ACother,
      params.noOfAids
    );
  }

  static async handleGetMPO(params) {
    DataParser.validateParameters(params, ['type', 'AC', 'BC', 'channels', 'limiting', 'ACother', 'direction', 'mic', 'noOfAids']);
    return await getMPO(
      params.type,
      params.AC,
      params.BC,
      params.channels,
      params.limiting,
      params.ACother,
      params.direction,
      params.mic,
      params.noOfAids
    );
  }

  static async handleRealEarAidedGain(params) {
    DataParser.validateParameters(params, ['AC', 'BC', 'limiting', 'channels', 'direction', 'mic', 'ACother', 'noOfAids']);
    return await realEarAidedGain(
      params.AC,
      params.BC,
      params.limiting,
      params.channels,
      params.direction,
      params.mic,
      params.ACother,
      params.noOfAids
    );
  }

  static async handleRealEarInsertionGain(params) {
    DataParser.validateParameters(params, ['AC', 'BC', 'limiting', 'channels', 'direction', 'mic', 'ACother', 'noOfAids']);
    // RealEarInsertionGain_NL2 需要 L 参数（声级），默认使用65dB
    const L = params.L || 65;
    const result = await realEarInsertionGain(
      params.AC,
      params.BC,
      L,
      params.limiting,
      params.channels,
      params.direction,
      params.mic,
      params.ACother || [],
      params.noOfAids
    );
    // 函数返回 { REIG: number[] }，需要提取 REIG 数组
    return result.REIG || result;
  }

  static async handleTccCouplerGain(params) {
    DataParser.validateParameters(params, ['AC', 'BC', 'speechLevel', 'limiting', 'channels', 'direction', 'mic', 'target', 'aidType', 'ACother', 'noOfAids', 'tubing', 'vent', 'RECDmeasType']);
    return await tccCouplerGain(
      params.AC,
      params.BC,
      params.speechLevel,
      params.limiting,
      params.channels,
      params.direction,
      params.mic,
      params.target,
      params.aidType,
      params.ACother,
      params.noOfAids,
      params.tubing,
      params.vent,
      params.RECDmeasType
    );
  }

  static async handleEarSimulatorGain(params) {
    DataParser.validateParameters(params, ['AC', 'BC', 'speechLevel', 'direction', 'boost', 'limiting', 'channels', 'target', 'mic', 'aidType', 'ACother', 'noOfAids', 'tubing', 'vent', 'RECDmeasType']);
    return await earSimulatorGain(
      params.AC,
      params.BC,
      params.speechLevel,
      params.direction,
      params.boost,
      params.limiting,
      params.channels,
      params.target,
      params.mic,
      params.aidType,
      params.ACother,
      params.noOfAids,
      params.tubing,
      params.vent,
      params.RECDmeasType
    );
  }
}
