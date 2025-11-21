/**
 * NAL2自动化单元测试
 * 自动读取input_json_data目录中的所有JSON文件并执行测试
 */

const fs = require('fs');
const path = require('path');
const { NAL2Bridge } = require('../utils/NAL2Bridge');
const { DataParser } = require('../utils/DataParser');

// 测试配置
const TEST_CONFIG = {
  jsonDataDir: path.join(__dirname, '../input_json_data'),
  testResultsDir: path.join(__dirname, 'results'),
  timeout: 10000, // 10秒超时
};

// 测试结果统计
const testStats = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  results: [],
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * 打印彩色日志
 */
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * 函数依赖关系映射
 * 格式: { 'functionName': ['requiredFunction1', 'requiredFunction2', ...] }
 */
const functionDependencies = {
  // CompressionRatio_NL2 需要: 23, 21, 34, 35, 36, 37, 38
  'CompressionRatio_NL2': [
    'SetAdultChild',
    'SetExperience',
    'SetCompSpeed',
    'SetTonalLanguage',
    'SetGender',
    'setBWC',
    'CompressionThreshold_NL2'
  ],
  // setBWC 需要先执行 CrossOverFrequencies_NL2
  'setBWC': ['CrossOverFrequencies_NL2'],
  // CompressionThreshold_NL2 需要: 16, 23, 43 或 44, 17 或 18, 21, 34, 35, 36, 37, 38
  'CompressionThreshold_NL2': [
    'SetAdultChild',
    'SetExperience',
    'SetCompSpeed',
    'SetTonalLanguage',
    'SetGender'
  ]
};

/**
 * 从文件名提取函数名
 */
function extractFunctionName(fileName) {
  // 例如: "22_CompressionRatio_NL2_data.json" -> "CompressionRatio_NL2"
  const match = fileName.match(/\d+_(.+)_data\.json$/);
  return match ? match[1] : null;
}

/**
 * 按依赖关系排序测试文件
 */
function sortTestFilesByDependencies(files) {
  const sorted = [];
  const added = new Set();
  const fileMap = new Map();
  
  // 创建文件名到路径的映射
  files.forEach(filePath => {
    const fileName = path.basename(filePath);
    const funcName = extractFunctionName(fileName);
    if (funcName) {
      fileMap.set(funcName, filePath);
    }
  });
  
  // 递归添加函数及其依赖
  function addWithDependencies(filePath) {
    const fileName = path.basename(filePath);
    const funcName = extractFunctionName(fileName);
    
    // 如果已添加，跳过
    if (added.has(fileName)) {
      return;
    }
    
    // 先添加依赖
    const deps = functionDependencies[funcName] || [];
    for (const depName of deps) {
      const depFile = fileMap.get(depName);
      if (depFile) {
        addWithDependencies(depFile);
      }
    }
    
    // 然后添加当前文件
    sorted.push(filePath);
    added.add(fileName);
  }
  
  // 处理所有文件
  files.forEach(filePath => {
    addWithDependencies(filePath);
  });
  
  return sorted;
}

/**
 * 获取所有JSON测试文件（按依赖关系排序）
 */
function getTestFiles() {
  try {
    const files = fs.readdirSync(TEST_CONFIG.jsonDataDir);
    const testFiles = files
      .filter(file => file.endsWith('_data.json'))
      .map(file => path.join(TEST_CONFIG.jsonDataDir, file))
      .sort(); // 先按字母排序作为基础
    
    // 按依赖关系重新排序
    const sortedFiles = sortTestFilesByDependencies(testFiles);
    
    log(`\n📋 测试执行顺序（按依赖关系）:`, colors.cyan);
    sortedFiles.forEach((file, index) => {
      const fileName = path.basename(file);
      const funcName = extractFunctionName(fileName);
      const deps = functionDependencies[funcName];
      if (deps && deps.length > 0) {
        log(`  ${index + 1}. ${funcName} (依赖: ${deps.join(', ')})`, colors.yellow);
      } else {
        log(`  ${index + 1}. ${funcName}`, colors.blue);
      }
    });
    log('');
    
    return sortedFiles;
  } catch (error) {
    log(`❌ 无法读取测试文件目录: ${error.message}`, colors.red);
    return [];
  }
}

/**
 * 读取JSON测试数据
 */
function loadTestData(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    log(`❌ 无法读取文件 ${filePath}: ${error.message}`, colors.red);
    return null;
  }
}

/**
 * 验证输出结果
 */
function validateOutput(output, functionName) {
  const validations = {
    passed: true,
    errors: [],
  };

  // 检查基本结构
  if (!output || typeof output !== 'object') {
    validations.passed = false;
    validations.errors.push('输出不是有效对象');
    return validations;
  }

  // 检查是否有错误
  if (output.error) {
    validations.passed = false;
    validations.errors.push(`函数返回错误: ${output.error}`);
    return validations;
  }

  // 检查sequence_num
  if (typeof output.sequence_num !== 'number') {
    validations.errors.push('缺少sequence_num');
  }

  // 检查function名称
  if (output.function !== functionName) {
    validations.errors.push(`函数名不匹配: 期望${functionName}, 实际${output.function}`);
  }

  // 检查output_parameters
  if (!output.output_parameters) {
    validations.errors.push('缺少output_parameters');
  }

  // 函数特定验证
  validateFunctionSpecificOutput(output, functionName, validations);

  validations.passed = validations.errors.length === 0;
  return validations;
}

/**
 * 函数特定输出验证
 */
function validateFunctionSpecificOutput(output, functionName, validations) {
  const params = output.output_parameters;
  if (!params) return;

  // 数组长度验证
  const arrayLengthRules = {
    // 19元素数组
    'RealEarInsertionGain_NL2': { REIG: 19 },
    'RealEarAidedGain_NL2': { REAG: 19 },
    'TccCouplerGain_NL2': { TccGain: 19, lineType: 19 },
    'EarSimulatorGain_NL2': { ESG: 19, lineType: 19 },
    'AidedThreshold_NL2': { AT: 19 },
    'GetREDDindiv': { REDD: 19 },
    'GetREURindiv': { REUR: 19 },
    
    // 9元素数组
    'GetREDDindiv9': { REDD: 9 },
    'GetREURindiv9': { REUR: 9 },
    'GetRECDh_indiv9_NL2': { RECDh: 9 },
    'GetRECDt_indiv9_NL2': { RECDt: 9 },
    
    // 100元素数组 (I/O曲线)
    'RealEarInputOutputCurve_NL2': { REIO: 100, REIOunl: 100 },
    'TccInputOutputCurve_NL2': { TccIO: 100, TccIOunl: 100, lineType: 100 },
    'EarSimulatorInputOutputCurve_NL2': { ESIO: 100, ESIOunl: 100, lineType: 100 },
    
    // 多个数组
    'Speech_o_Gram_NL2': { 
      Speech_rms: 19, 
      Speech_max: 19, 
      Speech_min: 19, 
      Speech_thresh: 19 
    },
    'ReturnValues_NL2': { MAF: 19, BWC: 19, ESCD: 19 },
  };

  const rules = arrayLengthRules[functionName];
  if (rules) {
    for (const [key, expectedLength] of Object.entries(rules)) {
      if (params[key]) {
        if (!Array.isArray(params[key])) {
          validations.errors.push(`${key}应该是数组`);
        } else if (params[key].length !== expectedLength) {
          validations.errors.push(
            `${key}长度错误: 期望${expectedLength}, 实际${params[key].length}`
          );
        }
      } else {
        validations.errors.push(`缺少输出参数: ${key}`);
      }
    }
  }

  // 单值返回函数
  const singleValueFunctions = ['GainAt_NL2', 'Get_SI_NL2', 'Get_SII'];
  if (singleValueFunctions.includes(functionName)) {
    const valueKey = Object.keys(params)[0];
    if (valueKey && typeof params[valueKey] !== 'number') {
      validations.errors.push('应返回单个数值');
    }
  }

  // Set函数应返回success
  if (functionName.startsWith('Set')) {
    if (params.success !== true) {
      validations.errors.push('Set函数应返回success: true');
    }
  }
}

/**
 * 执行单个测试
 */
async function runSingleTest(filePath) {
  const fileName = path.basename(filePath);
  const testName = fileName.replace('_data.json', '');
  
  log(`\n📋 测试: ${testName}`, colors.cyan);
  
  const testResult = {
    name: testName,
    file: fileName,
    status: 'pending',
    duration: 0,
    error: null,
    validation: null,
  };

  try {
    // 读取测试数据
    const testData = loadTestData(filePath);
    if (!testData) {
      testResult.status = 'failed';
      testResult.error = '无法读取测试数据';
      return testResult;
    }

    // 解析数据
    const parsed = DataParser.parseData(testData);
    if (!parsed) {
      testResult.status = 'failed';
      testResult.error = '数据解析失败';
      return testResult;
    }

    log(`  函数: ${parsed.function}`, colors.blue);
    log(`  序号: ${parsed.sequence_num}`, colors.blue);

    // 执行函数调用
    const startTime = Date.now();
    const output = await Promise.race([
      NAL2Bridge.processFunction(parsed),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('超时')), TEST_CONFIG.timeout)
      ),
    ]);
    const endTime = Date.now();
    testResult.duration = endTime - startTime;

    // 验证输出
    const validation = validateOutput(output, parsed.function);
    testResult.validation = validation;

    if (validation.passed) {
      testResult.status = 'passed';
      log(`  ✅ 通过 (${testResult.duration}ms)`, colors.green);
    } else {
      testResult.status = 'failed';
      testResult.error = validation.errors.join(', ');
      log(`  ❌ 失败: ${testResult.error}`, colors.red);
      validation.errors.forEach(err => {
        log(`     - ${err}`, colors.red);
      });
    }
  } catch (error) {
    testResult.status = 'failed';
    testResult.error = error.message;
    log(`  ❌ 异常: ${error.message}`, colors.red);
  }

  return testResult;
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  log('\n╔════════════════════════════════════════╗', colors.cyan);
  log('║   NAL2自动化单元测试开始执行          ║', colors.cyan);
  log('╚════════════════════════════════════════╝\n', colors.cyan);

  const testFiles = getTestFiles();
  log(`📁 找到 ${testFiles.length} 个测试文件\n`, colors.yellow);

  testStats.total = testFiles.length;

  // 执行所有测试
  for (const filePath of testFiles) {
    const result = await runSingleTest(filePath);
    testStats.results.push(result);

    if (result.status === 'passed') {
      testStats.passed++;
    } else if (result.status === 'failed') {
      testStats.failed++;
    } else {
      testStats.skipped++;
    }
  }

  // 生成报告
  generateReport();
}

/**
 * 生成测试报告
 */
function generateReport() {
  log('\n╔════════════════════════════════════════╗', colors.cyan);
  log('║           测试结果汇总                 ║', colors.cyan);
  log('╚════════════════════════════════════════╝\n', colors.cyan);

  log(`总测试数: ${testStats.total}`, colors.blue);
  log(`✅ 通过: ${testStats.passed}`, colors.green);
  log(`❌ 失败: ${testStats.failed}`, colors.red);
  log(`⏭️  跳过: ${testStats.skipped}`, colors.yellow);

  const passRate = ((testStats.passed / testStats.total) * 100).toFixed(2);
  log(`\n📊 通过率: ${passRate}%\n`, colors.cyan);

  // 失败的测试详情
  if (testStats.failed > 0) {
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.red);
    log('失败的测试:', colors.red);
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', colors.red);
    
    testStats.results
      .filter(r => r.status === 'failed')
      .forEach((result, index) => {
        log(`${index + 1}. ${result.name}`, colors.red);
        log(`   错误: ${result.error}\n`, colors.red);
      });
  }

  // 保存JSON报告
  saveJsonReport();
}

/**
 * 保存JSON格式的测试报告
 */
function saveJsonReport() {
  try {
    // 确保results目录存在
    if (!fs.existsSync(TEST_CONFIG.testResultsDir)) {
      fs.mkdirSync(TEST_CONFIG.testResultsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(
      TEST_CONFIG.testResultsDir,
      `test_report_${timestamp}.json`
    );

    const report = {
      timestamp: new Date().toISOString(),
      stats: {
        total: testStats.total,
        passed: testStats.passed,
        failed: testStats.failed,
        skipped: testStats.skipped,
        passRate: ((testStats.passed / testStats.total) * 100).toFixed(2) + '%',
      },
      results: testStats.results,
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    log(`\n💾 测试报告已保存: ${reportPath}`, colors.green);
  } catch (error) {
    log(`\n⚠️  保存报告失败: ${error.message}`, colors.yellow);
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    await runAllTests();
    
    // 退出码: 0=成功, 1=有失败
    process.exit(testStats.failed > 0 ? 1 : 0);
  } catch (error) {
    log(`\n💥 测试执行失败: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  }
}

// 执行测试
if (require.main === module) {
  main();
}

module.exports = { runAllTests, runSingleTest };
