/**
 * NAL2Bridge.js
 * NAL2桥接模块 - 将解析的数据映射到NAL2原生模块调用
 */

const { DataParser } = require('./DataParser');

// 这里的NAL2函数导入在React Native环境中才有效
// 测试环境需要mock
let nal2Module = {};
let isTestMode = false;

try {
  nal2Module = require('react-native-nal2');
} catch (e) {
  // 测试环境，使用mock
  isTestMode = true;
  console.log('[NAL2Bridge] Running in test mode with mocks');
  
  // 创建mock函数
  const createMockArray = (size) => Array(size).fill(0);
  const createMockSuccess = () => Promise.resolve(true);
  
  nal2Module = {
    dllVersion: () => Promise.resolve({ major: 1, minor: 0 }),
    realEarInsertionGain: () => Promise.resolve({ REIG: createMockArray(19) }),
    realEarAidedGain: () => Promise.resolve(createMockArray(19)),
    tccCouplerGain: () => Promise.resolve({ TccGain: createMockArray(19), lineType: createMockArray(19) }),
    earSimulatorGain: () => Promise.resolve({ ESG: createMockArray(19), lineType: createMockArray(19) }),
    crossOverFrequencies: () => Promise.resolve(createMockArray(19)),
    centerFrequencies: () => Promise.resolve(createMockArray(18)),
    compressionThreshold: () => Promise.resolve(createMockArray(19)),
    setBWC: createMockSuccess,
    setAdultChild: createMockSuccess,
    setExperience: createMockSuccess,
    setCompSpeed: createMockSuccess,
    setTonalLanguage: createMockSuccess,
    setGender: createMockSuccess,
    getRECDhIndiv: () => Promise.resolve(createMockArray(19)),
    getRECDhIndiv9: () => Promise.resolve(createMockArray(9)),
    getRECDtIndiv: () => Promise.resolve(createMockArray(19)),
    getRECDtIndiv9: () => Promise.resolve(createMockArray(9)),
    setRECDhIndiv: createMockSuccess,
    setRECDhIndiv9: createMockSuccess,
    setRECDtIndiv: createMockSuccess,
    setRECDtIndiv9: createMockSuccess,
    compressionRatio: () => Promise.resolve(createMockArray(19)),
    getMPO: () => Promise.resolve(createMockArray(19)),
    // 未实现的函数mock
    getRealEarInputOutputCurve: () => Promise.resolve({ REIO: createMockArray(100), REIOunl: createMockArray(100) }),
    getTccInputOutputCurve: () => Promise.resolve({ TccIO: createMockArray(100), TccIOunl: createMockArray(100), lineType: createMockArray(100) }),
    getEarSimulatorInputOutputCurve: () => Promise.resolve({ ESIO: createMockArray(100), ESIOunl: createMockArray(100), lineType: createMockArray(100) }),
    getSpeechOGram: () => Promise.resolve({ Speech_rms: createMockArray(19), Speech_max: createMockArray(19), Speech_min: createMockArray(19), Speech_thresh: createMockArray(19) }),
    getAidedThreshold: () => Promise.resolve(createMockArray(19)),
    getREDDindiv: () => Promise.resolve(createMockArray(19)),
    getREDDindiv9: () => Promise.resolve(createMockArray(9)),
    getREURindiv: () => Promise.resolve(createMockArray(19)),
    getREURindiv9: () => Promise.resolve(createMockArray(9)),
    setREDDindiv: createMockSuccess,
    setREDDindiv9: createMockSuccess,
    setREURindiv: createMockSuccess,
    setREURindiv9: createMockSuccess,
    getGainAt: () => Promise.resolve(10.5),
    getReturnValues: () => Promise.resolve({ MAF: createMockArray(19), BWC: createMockArray(19), ESCD: createMockArray(19) }),
    getTubing: () => Promise.resolve(createMockArray(19)),
    getTubing9: () => Promise.resolve(createMockArray(9)),
    getVentOut: () => Promise.resolve(createMockArray(19)),
    getVentOut9: () => Promise.resolve(createMockArray(9)),
    getMLE: () => Promise.resolve(createMockArray(19)),
    getSI: () => Promise.resolve(0.85),
    getSII: () => Promise.resolve(0.72),
  };
}

// 不再单独解构，直接使用nal2Module调用
// 这样可以统一测试模式和React Native模式的行为

class NAL2Bridge {
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
        case 'dllVersion':
          result = await this.handleDllVersion(input_parameters);
          outputParameters = { major: result.major, minor: result.minor };
          break;

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
          // TccCouplerGain返回对象包含TccGain和lineType
          outputParameters = { 
            TccGain: result.TccGain || result,
            lineType: result.lineType || []
          };
          break;

        case 'EarSimulatorGain_NL2':
          result = await this.handleEarSimulatorGain(input_parameters);
          // EarSimulatorGain返回对象包含ESG和lineType
          outputParameters = { 
            ESG: result.ESG || result,
            lineType: result.lineType || []
          };
          break;

        case 'RealEarInputOutputCurve_NL2':
          result = await this.handleRealEarInputOutputCurve(input_parameters);
          outputParameters = result;
          break;

        case 'TccInputOutputCurve_NL2':
          result = await this.handleTccInputOutputCurve(input_parameters);
          outputParameters = result;
          break;

        case 'EarSimulatorInputOutputCurve_NL2':
          result = await this.handleEarSimulatorInputOutputCurve(input_parameters);
          outputParameters = result;
          break;

        case 'Speech_o_Gram_NL2':
          result = await this.handleSpeechOGram(input_parameters);
          outputParameters = result;
          break;

        case 'AidedThreshold_NL2':
          result = await this.handleAidedThreshold(input_parameters);
          outputParameters = { AT: result };
          break;

        case 'GetREDDindiv':
          result = await this.handleGetREDDindiv(input_parameters);
          outputParameters = { REDD: result };
          break;

        case 'GetREDDindiv9':
          result = await this.handleGetREDDindiv9(input_parameters);
          outputParameters = { REDD: result };
          break;

        case 'GetREURindiv':
          result = await this.handleGetREURindiv(input_parameters);
          outputParameters = { REUR: result };
          break;

        case 'GetREURindiv9':
          result = await this.handleGetREURindiv9(input_parameters);
          outputParameters = { REUR: result };
          break;

        case 'SetREDDindiv':
          result = await this.handleSetREDDindiv(input_parameters);
          outputParameters = { success: true };
          break;

        case 'SetREDDindiv9':
          result = await this.handleSetREDDindiv9(input_parameters);
          outputParameters = { success: true };
          break;

        case 'SetREURindiv':
          result = await this.handleSetREURindiv(input_parameters);
          outputParameters = { success: true };
          break;

        case 'SetREURindiv9':
          result = await this.handleSetREURindiv9(input_parameters);
          outputParameters = { success: true };
          break;

        case 'GainAt_NL2':
          result = await this.handleGainAt(input_parameters);
          outputParameters = { gain: result };
          break;

        case 'GetMLE':
          result = await this.handleGetMLE(input_parameters);
          outputParameters = { MLE: result };
          break;

        case 'ReturnValues_NL2':
          result = await this.handleReturnValues(input_parameters);
          outputParameters = result;
          break;

        case 'GetTubing_NL2':
          result = await this.handleGetTubing(input_parameters);
          outputParameters = { Tubing: result };
          break;

        case 'GetTubing9_NL2':
          result = await this.handleGetTubing9(input_parameters);
          outputParameters = { Tubing: result };
          break;

        case 'GetVentOut_NL2':
          result = await this.handleGetVentOut(input_parameters);
          outputParameters = { VentOut: result };
          break;

        case 'GetVentOut9_NL2':
          result = await this.handleGetVentOut9(input_parameters);
          outputParameters = { VentOut: result };
          break;

        case 'Get_SI_NL2':
          result = await this.handleGetSI(input_parameters);
          outputParameters = { SI: result };
          break;

        case 'Get_SII':
          result = await this.handleGetSII(input_parameters);
          outputParameters = { SII: result };
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

  static async handleDllVersion(params) {
    return await nal2Module.dllVersion();
  }

  static async handleCrossOverFrequencies(params) {
    DataParser.validateParameters(params, ['channels', 'AC', 'BC']);
    return await nal2Module.crossOverFrequencies(
      params.channels,
      params.AC,
      params.BC
    );
  }

  static async handleCenterFrequencies(params) {
    DataParser.validateParameters(params, ['channels', 'CFArray']);
    return await nal2Module.centerFrequencies(
      params.channels,
      params.CFArray
    );
  }

  static async handleCompressionThreshold(params) {
    DataParser.validateParameters(params, ['WBCT', 'aidType', 'direction', 'mic', 'calcCh']);
    return await nal2Module.compressionThreshold(
      params.WBCT,
      params.aidType,
      params.direction,
      params.mic,
      params.calcCh
    );
  }

  static async handleSetBWC(params) {
    DataParser.validateParameters(params, ['channels', 'crossOver', 'bandwidth', 'selection']);
    return await nal2Module.setBWC(
      params.channels,
      params.crossOver,
      params.bandwidth,
      params.selection
    );
  }

  static async handleSetAdultChild(params) {
    DataParser.validateParameters(params, ['adultChild', 'dateOfBirth']);
    return await nal2Module.setAdultChild(
      params.adultChild,
      params.dateOfBirth
    );
  }

  static async handleSetExperience(params) {
    DataParser.validateParameters(params, ['experience']);
    return await nal2Module.setExperience(params.experience);
  }

  static async handleSetCompSpeed(params) {
    DataParser.validateParameters(params, ['compSpeed']);
    return await nal2Module.setCompSpeed(params.compSpeed);
  }

  static async handleSetTonalLanguage(params) {
    DataParser.validateParameters(params, ['tonal']);
    return await nal2Module.setTonalLanguage(params.tonal);
  }

  static async handleSetGender(params) {
    DataParser.validateParameters(params, ['gender']);
    return await nal2Module.setGender(params.gender);
  }

  static async handleGetRECDh(params) {
    DataParser.validateParameters(params, ['RECDmeasType', 'dateOfBirth', 'aidType', 'tubing', 'coupler', 'fittingDepth']);
    return await nal2Module.getRECDhIndiv(
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
    return await nal2Module.getRECDhIndiv9(
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
    return await nal2Module.getRECDtIndiv(
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
    return await nal2Module.getRECDtIndiv9(
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
    return await nal2Module.setRECDhIndiv(params.RECDh);
  }

  static async handleSetRECDh9(params) {
    DataParser.validateParameters(params, ['RECDh']);
    return await nal2Module.setRECDhIndiv9(params.RECDh);
  }

  static async handleSetRECDt(params) {
    DataParser.validateParameters(params, ['RECDt']);
    return await nal2Module.setRECDtIndiv(params.RECDt);
  }

  static async handleSetRECDt9(params) {
    DataParser.validateParameters(params, ['RECDt']);
    return await nal2Module.setRECDtIndiv9(params.RECDt);
  }

  static async handleCompressionRatio(params) {
    DataParser.validateParameters(params, ['CR', 'channels', 'centerFreq', 'AC', 'BC', 'direction', 'mic', 'limiting', 'ACother', 'noOfAids']);
    return await nal2Module.compressionRatio(
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
    return await nal2Module.getMPO(
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
    DataParser.validateParameters(params, ['AC', 'BC', 'L', 'limiting', 'channels', 'direction', 'mic', 'ACother', 'noOfAids']);
    return await nal2Module.realEarAidedGain(
      params.AC,
      params.BC,
      params.L,
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
    const L = params.L || 65;
    const result = await nal2Module.realEarInsertionGain(
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
    return result.REIG || result;
  }

  static async handleTccCouplerGain(params) {
    DataParser.validateParameters(params, ['AC', 'BC', 'L', 'limiting', 'channels', 'direction', 'mic', 'target', 'aidType', 'ACother', 'noOfAids', 'tubing', 'vent', 'RECDmeasType']);
    const result = await nal2Module.tccCouplerGain(
      params.AC,
      params.BC,
      params.L,
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
    return result.TccGain ? result : { TccGain: result, lineType: [] };
  }

  static async handleEarSimulatorGain(params) {
    DataParser.validateParameters(params, ['AC', 'BC', 'L', 'direction', 'mic', 'limiting', 'channels', 'target', 'aidType', 'ACother', 'noOfAids', 'tubing', 'vent', 'RECDmeasType']);
    const result = await nal2Module.earSimulatorGain(
      params.AC,
      params.BC,
      params.L,
      params.direction,
      params.mic,
      params.limiting,
      params.channels,
      params.target,
      params.aidType,
      params.ACother,
      params.noOfAids,
      params.tubing,
      params.vent,
      params.RECDmeasType
    );
    return result.ESG ? result : { ESG: result, lineType: [] };
  }

  static async handleRealEarInputOutputCurve(params) {
    DataParser.validateParameters(params, ['AC', 'BC', 'graphFreq', 'startLevel', 'finishLevel', 'limiting', 'channels', 'direction', 'mic', 'target', 'ACother', 'noOfAids']);
    return await nal2Module.getRealEarInputOutputCurve(
      params.AC,
      params.BC,
      params.graphFreq,
      params.startLevel,
      params.finishLevel,
      params.limiting,
      params.channels,
      params.direction,
      params.mic,
      params.target,
      params.ACother,
      params.noOfAids
    );
  }

  static async handleTccInputOutputCurve(params) {
    DataParser.validateParameters(params, ['AC', 'BC', 'graphFreq', 'startLevel', 'finishLevel', 'limiting', 'channels', 'direction', 'mic', 'target', 'aidType', 'ACother', 'noOfAids', 'tubing', 'vent', 'RECDmeasType']);
    return await nal2Module.getTccInputOutputCurve(
      params.AC,
      params.BC,
      params.graphFreq,
      params.startLevel,
      params.finishLevel,
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

  static async handleEarSimulatorInputOutputCurve(params) {
    DataParser.validateParameters(params, ['AC', 'BC', 'graphFreq', 'startLevel', 'finishLevel', 'limiting', 'channels', 'direction', 'mic', 'target', 'aidType', 'ACother', 'noOfAids', 'tubing', 'vent', 'RECDmeasType']);
    return await nal2Module.getEarSimulatorInputOutputCurve(
      params.AC,
      params.BC,
      params.graphFreq,
      params.startLevel,
      params.finishLevel,
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

  static async handleSpeechOGram(params) {
    DataParser.validateParameters(params, ['AC', 'BC', 'L', 'limiting', 'channels', 'direction', 'mic', 'ACother', 'noOfAids']);
    return await nal2Module.getSpeechOGram(
      params.AC,
      params.BC,
      params.L,
      params.limiting,
      params.channels,
      params.direction,
      params.mic,
      params.ACother,
      params.noOfAids
    );
  }

  static async handleAidedThreshold(params) {
    DataParser.validateParameters(params, ['AC', 'BC', 'CT', 'dbOption', 'ACother', 'noOfAids', 'limiting', 'channels', 'direction', 'mic']);
    return await nal2Module.getAidedThreshold(
      params.AC,
      params.BC,
      params.CT,
      params.dbOption,
      params.ACother,
      params.noOfAids,
      params.limiting,
      params.channels,
      params.direction,
      params.mic
    );
  }

  static async handleGetREDDindiv(params) {
    DataParser.validateParameters(params, ['defValues']);
    return await nal2Module.getREDDindiv(params.defValues);
  }

  static async handleGetREDDindiv9(params) {
    DataParser.validateParameters(params, ['defValues']);
    return await nal2Module.getREDDindiv9(params.defValues);
  }

  static async handleGetREURindiv(params) {
    DataParser.validateParameters(params, ['defValues', 'dateOfBirth', 'direction', 'mic']);
    return await nal2Module.getREURindiv(
      params.defValues,
      params.dateOfBirth,
      params.direction,
      params.mic
    );
  }

  static async handleGetREURindiv9(params) {
    DataParser.validateParameters(params, ['defValues', 'dateOfBirth', 'direction', 'mic']);
    return await nal2Module.getREURindiv9(
      params.defValues,
      params.dateOfBirth,
      params.direction,
      params.mic
    );
  }

  static async handleSetREDDindiv(params) {
    DataParser.validateParameters(params, ['REDD', 'defValues']);
    return await nal2Module.setREDDindiv(params.REDD, params.defValues);
  }

  static async handleSetREDDindiv9(params) {
    DataParser.validateParameters(params, ['REDD', 'defValues']);
    return await nal2Module.setREDDindiv9(params.REDD, params.defValues);
  }

  static async handleSetREURindiv(params) {
    DataParser.validateParameters(params, ['REUR', 'defValues', 'dateOfBirth', 'direction', 'mic']);
    return await nal2Module.setREURindiv(
      params.REUR,
      params.defValues,
      params.dateOfBirth,
      params.direction,
      params.mic
    );
  }

  static async handleSetREURindiv9(params) {
    DataParser.validateParameters(params, ['REUR', 'defValues', 'dateOfBirth', 'direction', 'mic']);
    return await nal2Module.setREURindiv9(
      params.REUR,
      params.defValues,
      params.dateOfBirth,
      params.direction,
      params.mic
    );
  }

  static async handleGainAt(params) {
    DataParser.validateParameters(params, ['freqRequired', 'targetType', 'AC', 'BC', 'L', 'limiting', 'channels', 'direction', 'mic', 'ACother', 'noOfAids', 'bandWidth', 'target', 'aidType', 'tubing', 'vent', 'RECDmeasType']);
    return await nal2Module.getGainAt(
      params.freqRequired,
      params.targetType,
      params.AC,
      params.BC,
      params.L,
      params.limiting,
      params.channels,
      params.direction,
      params.mic,
      params.ACother,
      params.noOfAids,
      params.bandWidth,
      params.target,
      params.aidType,
      params.tubing,
      params.vent,
      params.RECDmeasType
    );
  }

  static async handleGetMLE(params) {
    DataParser.validateParameters(params, ['aidType', 'direction', 'mic']);
    return await nal2Module.getMLE(
      params.aidType,
      params.direction,
      params.mic
    );
  }

  static async handleReturnValues(params) {
    return await nal2Module.getReturnValues();
  }

  static async handleGetTubing(params) {
    DataParser.validateParameters(params, ['tubing']);
    return await nal2Module.getTubing(params.tubing);
  }

  static async handleGetTubing9(params) {
    DataParser.validateParameters(params, ['tubing']);
    return await nal2Module.getTubing9(params.tubing);
  }

  static async handleGetVentOut(params) {
    DataParser.validateParameters(params, ['vent']);
    return await nal2Module.getVentOut(params.vent);
  }

  static async handleGetVentOut9(params) {
    DataParser.validateParameters(params, ['vent']);
    return await nal2Module.getVentOut9(params.vent);
  }

  static async handleGetSI(params) {
    DataParser.validateParameters(params, ['s', 'REAG', 'Limit']);
    return await nal2Module.getSI(
      params.s,
      params.REAG,
      params.Limit
    );
  }

  static async handleGetSII(params) {
    DataParser.validateParameters(params, ['nCompSpeed', 'Speech_thresh', 's', 'REAG', 'REAGp', 'REAGm', 'REUR']);
    return await nal2Module.getSII(
      params.nCompSpeed,
      params.Speech_thresh,
      params.s,
      params.REAG,
      params.REAGp,
      params.REAGm,
      params.REUR
    );
  }
}

module.exports = { NAL2Bridge };
