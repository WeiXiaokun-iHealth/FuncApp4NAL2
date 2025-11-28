import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Clipboard,
  NativeModules,
  NativeEventEmitter,
  AppState,
  Alert,
  Platform,
  Share,
  PermissionsAndroid,
  Modal,
  Dimensions
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import RNFS from 'react-native-fs';
import Constants from 'expo-constants';
import AppServer from '../utils/AppServer';
import { NAL2Bridge } from '../utils/NAL2Bridge';
import logger, { LogModule } from '../utils/Logger';
import { globalVariables } from '../utils/GlobalVariables';

const { HttpServerModule } = NativeModules;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Import version info from app.json
const APP_CONFIG = require('../app.json');
const APP_VERSION = APP_CONFIG.expo.version;
// 动态获取构建号 (versionCode for Android, buildNumber for iOS)
const BUILD_NUMBER = Platform.OS === 'android' 
  ? Constants.manifest?.android?.versionCode?.toString() || Constants.nativeBuildVersion || '未知'
  : Constants.manifest?.ios?.buildNumber || Constants.nativeBuildVersion || '未知';

// JSON格式化函数
const formatJSON = (str) => {
  try {
    const obj = JSON.parse(str);
    return JSON.stringify(obj, null, 2);
  } catch (e) {
    return str;
  }
};

export default function HttpServerScreen() {
  const APP_NAME = 'FuncApp4NAL2';
  const DEFAULT_PORT = 8080;
  
  const [serverStatus, setServerStatus] = useState({
    isRunning: false,
    ipAddress: '未知',
    port: DEFAULT_PORT
  });
  const [lastRequest, setLastRequest] = useState(null);
  const [lastResponse, setLastResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logs, setLogs] = useState([]);
  const [isLogsExpanded, setIsLogsExpanded] = useState(false);
  const [isDownloadingLogs, setIsDownloadingLogs] = useState(false);
  const [isRequestExampleExpanded, setIsRequestExampleExpanded] = useState(false);
  const [isVersionExpanded, setIsVersionExpanded] = useState(true);
  const [isLastRequestExpanded, setIsLastRequestExpanded] = useState(false);
  const [isLastResponseExpanded, setIsLastResponseExpanded] = useState(false);
  const [showFullScreenLogs, setShowFullScreenLogs] = useState(false);
  
  // 全局变量状态
  const [globalVars, setGlobalVars] = useState({
    CFArray: [],
    FreqInCh: [],
    CR: []
  });
  const [isGlobalVarsExpanded, setIsGlobalVarsExpanded] = useState(true);
  
  const appState = useRef(AppState.currentState);
  const eventEmitterRef = useRef(null);
  const subscriptionRef = useRef(null);
  const addLogRef = useRef(null);

  // 添加日志函数
  const addLog = (type, message) => {
    const timestamp = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    setLogs(prevLogs => {
      const newLog = { timestamp, type, message };
      // 保留最近500条日志（增加到500条以捕获更多信息）
      const updatedLogs = [newLog, ...prevLogs].slice(0, 500);
      return updatedLogs;
    });
  };

  // 保持addLog函数的引用
  addLogRef.current = addLog;

  // 监听全局变量变化
  useEffect(() => {
    const handleGlobalVarsChange = (vars) => {
      setGlobalVars(vars);
    };
    
    // 添加监听器
    globalVariables.addListener(handleGlobalVarsChange);
    
    // 初始化时获取当前值
    setGlobalVars(globalVariables.getAllVariables());
    
    // 清理监听器
    return () => {
      globalVariables.removeListener(handleGlobalVarsChange);
    };
  }, []);

  // 删除单个全局变量
  const handleDeleteVariable = (varName) => {
    Alert.alert(
      '确认删除',
      `确定要删除 ${varName} 吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            switch(varName) {
              case 'CFArray':
                globalVariables.deleteCFArray();
                break;
              case 'FreqInCh':
                globalVariables.deleteFreqInCh();
                break;
              case 'CR':
                globalVariables.deleteCR();
                break;
            }
          }
        }
      ]
    );
  };

  // 清空所有全局变量
  const handleClearAllVariables = () => {
    Alert.alert(
      '确认清空',
      '确定要清空所有全局变量吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清空',
          style: 'destructive',
          onPress: () => {
            globalVariables.clearAll();
          }
        }
      ]
    );
  };

  // 拦截console输出 - 在组件挂载时立即设置
  useEffect(() => {
    // 保存原始的console方法
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const originalConsoleInfo = console.info;

    // 安全的JSON序列化函数
    const safeStringify = (obj) => {
      try {
        if (obj === null) return 'null';
        if (obj === undefined) return 'undefined';
        if (typeof obj !== 'object') return String(obj);
        
        // 处理循环引用
        const seen = new WeakSet();
        return JSON.stringify(obj, (key, value) => {
          if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
              return '[Circular]';
            }
            seen.add(value);
          }
          return value;
        });
      } catch (error) {
        return String(obj);
      }
    };

    // 重写console.log
    console.log = (...args) => {
      originalConsoleLog(...args);
      try {
        const message = args.map(arg => 
          typeof arg === 'object' ? safeStringify(arg) : String(arg)
        ).join(' ');
        if (addLogRef.current) {
          addLogRef.current('info', `[LOG] ${message}`);
        }
      } catch (error) {
        // 静默失败，不影响原始console.log
      }
    };

    // 重写console.error
    console.error = (...args) => {
      originalConsoleError(...args);
      try {
        const message = args.map(arg => 
          typeof arg === 'object' ? safeStringify(arg) : String(arg)
        ).join(' ');
        if (addLogRef.current) {
          addLogRef.current('error', `[ERROR] ${message}`);
        }
      } catch (error) {
        // 静默失败
      }
    };

    // 重写console.warn
    console.warn = (...args) => {
      originalConsoleWarn(...args);
      try {
        const message = args.map(arg => 
          typeof arg === 'object' ? safeStringify(arg) : String(arg)
        ).join(' ');
        if (addLogRef.current) {
          addLogRef.current('error', `[WARN] ${message}`);
        }
      } catch (error) {
        // 静默失败
      }
    };

    // 重写console.info
    console.info = (...args) => {
      originalConsoleInfo(...args);
      try {
        const message = args.map(arg => 
          typeof arg === 'object' ? safeStringify(arg) : String(arg)
        ).join(' ');
        if (addLogRef.current) {
          addLogRef.current('info', `[INFO] ${message}`);
        }
      } catch (error) {
        // 静默失败
      }
    };

    // 清理函数：恢复原始console方法
    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      console.info = originalConsoleInfo;
    };
  }, []); // 空依赖数组，确保只在组件挂载时设置一次

  // 启动HTTP服务器
  useEffect(() => {
    let isMounted = true;
    
    const initServer = async () => {
      try {
        console.log('[HttpServer] 正在启动服务器...');
        addLog('info', '正在启动HTTP服务器...');
        setLoading(true);

        // 设置事件监听（只设置一次）
        if (HttpServerModule && !eventEmitterRef.current) {
          eventEmitterRef.current = new NativeEventEmitter(HttpServerModule);
          subscriptionRef.current = eventEmitterRef.current.addListener('onHttpRequest', async (data) => {
            const requestStartTime = Date.now();
            
            if (isMounted) {
              // 处理请求
              const { requestId, requestBody } = data;
              
              if (requestBody) {
                setLastRequest(requestBody);
                
                // 1️⃣ HTTP收到的原始数据
                logger.info(LogModule.NETWORK, '1️⃣ HTTP收到数据', {
                  requestId,
                  rawData: requestBody
                });
                addLog('info', `1️⃣ HTTP收到: ${requestBody}`);
                
                let responseJson;
                let sendError = false;
                
                try {
                  // 解析请求
                  const inputData = JSON.parse(requestBody);
                  
                  // 2️⃣ 解析后发给NAL2前的数据
                  logger.info(LogModule.NETWORK, '2️⃣ 发送给NAL2', {
                    requestId,
                    nal2Input: inputData
                  });
                  addLog('info', `2️⃣ NAL2输入: ${JSON.stringify(inputData)}`);
                  
                  // 处理
                  const result = await NAL2Bridge.processFunction(inputData);
                  
                  // 3️⃣ NAL2处理后的数据
                  const processingTime = Date.now() - requestStartTime;
                  logger.info(LogModule.NETWORK, '3️⃣ NAL2返回数据', {
                    requestId,
                    processingTime: `${processingTime}ms`,
                    nal2Output: result
                  });
                  addLog('success', `3️⃣ NAL2输出: ${JSON.stringify(result)}`);
                  
                  responseJson = JSON.stringify(result);
                  setLastResponse(responseJson);
                  
                } catch (error) {
                  const processingTime = Date.now() - requestStartTime;
                  
                  // 记录处理失败
                  logger.error(LogModule.NETWORK, '❌ NAL2请求处理失败', {
                    requestId,
                    error: error.message,
                    stack: error.stack,
                    processingTime: `${processingTime}ms`
                  });
                  addLog('error', `❌ 请求处理失败: ${error.message}`);
                  sendError = true;
                  
                  // 生成错误响应
                  try {
                    const inputData = JSON.parse(requestBody);
                    responseJson = JSON.stringify({
                      sequence_num: inputData.sequence_num || 0,
                      function: inputData.function || 'Unknown',
                      return: -1,
                      result: -1,
                      output_parameters: {
                        error: error.message || '处理失败'
                      }
                    });
                    setLastResponse(responseJson);
                  } catch (e2) {
                    // 如果连JSON解析都失败，使用最基本的错误响应
                    responseJson = JSON.stringify({
                      return: -1,
                      result: -1,
                      output_parameters: { error: 'Processing failed' }
                    });
                  }
                }
                
                // 4️⃣ 返回给调用端的数据（原生层已经处理响应发送）
                const totalTime = Date.now() - requestStartTime;
                logger.info(LogModule.NETWORK, '4️⃣ 返回给调用端', {
                  requestId,
                  totalTime: `${totalTime}ms`,
                  responseData: responseJson
                });
                addLog('info', `4️⃣ HTTP返回: ${responseJson} (${totalTime}ms)`);
              }
            }
          });
        }

        // 启动服务器（HTTP请求会在原生层自动处理）
        const result = await AppServer.start(DEFAULT_PORT);
        
        if (isMounted && result.success) {
          console.log('[HttpServer] 服务器启动成功:', result);
          addLog('success', `服务器启动成功 - ${result.ipAddress}:${result.port}`);
          setServerStatus({
            isRunning: true,
            ipAddress: result.ipAddress || '未知',
            port: result.port || DEFAULT_PORT
          });
        }
      } catch (error) {
        console.error('[HttpServer] 启动服务器失败:', error);
        addLog('error', `服务器启动失败: ${error.message}`);
        if (isMounted) {
          setServerStatus(prev => ({ ...prev, isRunning: false }));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initServer();

    // 监听应用前后台切换
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      if (subscription) {
        subscription.remove();
      }
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
      }
      AppServer.stop().catch(err => console.error('停止服务器失败:', err));
    };
  }, []);

  // 处理应用状态变化
  const handleAppStateChange = async (nextAppState) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('[HttpServer] 应用返回前台，检查服务器状态...');
      // 应用返回前台，自动检查并恢复服务器
      await checkAndRestoreServer();
    }
    appState.current = nextAppState;
  };

  // 检查并恢复服务器
  const checkAndRestoreServer = async () => {
    try {
      console.log('[HttpServer] 检查服务器状态...');
      
      // 直接调用start，它会自动检查状态并处理
      const result = await AppServer.start(DEFAULT_PORT);
      
      if (result.success) {
        console.log('[HttpServer] 服务器状态正常');
        setServerStatus({
          isRunning: true,
          ipAddress: result.ipAddress || '未知',
          port: result.port || DEFAULT_PORT
        });
      }
    } catch (error) {
      console.error('[HttpServer] 检查服务器失败:', error);
      // 获取实际状态
      try {
        const status = await AppServer.getStatus();
        setServerStatus({
          isRunning: status.isRunning,
          ipAddress: status.ipAddress || '未知',
          port: status.port || DEFAULT_PORT
        });
      } catch (statusError) {
        setServerStatus(prev => ({ ...prev, isRunning: false }));
      }
    }
  };


  // 刷新服务器状态（如果服务器停止则尝试重启）
  const refreshServerStatus = async () => {
    setRefreshing(true);
    try {
      console.log('[HttpServer] 刷新服务器状态...');
      
      // 直接调用start，它会自动检查状态并处理
      const result = await AppServer.start(DEFAULT_PORT);
      
      if (result.success) {
        console.log('[HttpServer] 服务器状态刷新成功');
        setServerStatus({
          isRunning: true,
          ipAddress: result.ipAddress || '未知',
          port: result.port || DEFAULT_PORT
        });
      }
    } catch (error) {
      console.error('[HttpServer] 刷新失败:', error);
      // 获取实际状态
      try {
        const status = await AppServer.getStatus();
        setServerStatus({
          isRunning: status.isRunning,
          ipAddress: status.ipAddress || '未知',
          port: status.port || DEFAULT_PORT
        });
      } catch (statusError) {
        setServerStatus(prev => ({ ...prev, isRunning: false }));
      }
    } finally {
      setRefreshing(false);
    }
  };

  // 复制API地址
  const copyApiUrl = () => {
    const url = `http://${serverStatus.ipAddress}:${serverStatus.port}/api/nal2/process`;
    Clipboard.setString(url);
    addLog('info', 'API地址已复制到剪贴板');
  };

  // 请求存储权限
  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: '存储权限请求',
          message: '应用需要存储权限来保存日志文件到下载文件夹',
          buttonNeutral: '稍后询问',
          buttonNegative: '拒绝',
          buttonPositive: '允许',
        }
      );
      
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('存储权限已授予');
        return true;
      } else {
        console.log('存储权限被拒绝');
        return false;
      }
    } catch (err) {
      console.warn('请求权限出错:', err);
      return false;
    }
  };

  // 导出日志
  const downloadLogs = async () => {
    if (logs.length === 0) {
      Alert.alert('提示', '当前没有日志可导出');
      return;
    }

    setIsDownloadingLogs(true);
    
    // 先请求存储权限
    const hasPermission = await requestStoragePermission();
    
    if (!hasPermission) {
      Alert.alert(
        '权限被拒绝',
        '需要存储权限才能保存日志文件。请在系统设置中授予应用存储权限。',
        [{ text: '确定' }]
      );
      addLog('error', '存储权限被拒绝');
      setIsDownloadingLogs(false);
      return;
    }

    try {
      // 生成日志内容
      const logContent = logs
        .map(log => `[${log.timestamp}] [${log.type.toUpperCase()}] ${log.message}`)
        .reverse() // 按时间顺序排列
        .join('\n');

      const timestamp = new Date().getTime();
      const fileName = `nal2-logs-${timestamp}.txt`;
      
      // Android 10+ 使用外部存储目录（兼容分区存储）
      const downloadPath = Platform.OS === 'android'
        ? `${RNFS.ExternalStorageDirectoryPath}/Download/${fileName}`
        : `${RNFS.DocumentDirectoryPath}/${fileName}`;

      // 写入文件到下载目录
      await RNFS.writeFile(downloadPath, logContent, 'utf8');

      addLog('success', `日志已保存到下载文件夹: ${fileName}`);
      
      // 显示成功提示
      Alert.alert(
        '下载成功',
        `日志文件已保存到:\n\n下载文件夹/${fileName}\n\n您可以在文件管理器的"下载"文件夹中找到它。`,
        [{ text: '确定' }]
      );

    } catch (error) {
      console.error('导出日志失败:', error);
      addLog('error', `导出日志失败: ${error.message}`);
      
      // 如果直接写入失败，尝试使用缓存目录+分享的方式作为备选
      try {
        const fileName = `nal2-logs-${new Date().getTime()}.txt`;
        const cachePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
        
        const logContent = logs
          .map(log => `[${log.timestamp}] [${log.type.toUpperCase()}] ${log.message}`)
          .reverse()
          .join('\n');
        
        await RNFS.writeFile(cachePath, logContent, 'utf8');
        
        const shareResult = await Share.share({
          title: '保存NAL2日志',
          message: `请在分享选项中选择一个应用来保存或发送日志文件\n\n文件名: ${fileName}`,
          url: `file://${cachePath}`,
        });

        if (shareResult.action === Share.sharedAction) {
          addLog('info', '日志文件已通过分享功能导出');
        }

        // 延迟清理缓存
        setTimeout(async () => {
          try {
            const exists = await RNFS.exists(cachePath);
            if (exists) {
              await RNFS.unlink(cachePath);
            }
          } catch (cleanupError) {
            console.log('清理缓存文件失败:', cleanupError);
          }
        }, 10000);
        
      } catch (fallbackError) {
        Alert.alert('导出失败', '无法导出日志文件，请检查存储权限');
      }
    } finally {
      setIsDownloadingLogs(false);
    }
  };

  // 清除日志
  const clearLogs = () => {
    Alert.alert(
      '确认清除',
      '确定要清除所有日志吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清除',
          style: 'destructive',
          onPress: () => {
            setLogs([]);
            addLog('info', '日志已清除');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>正在启动HTTP服务器...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <ExpoStatusBar style="auto" />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* 标题 */}
          <Text style={styles.title}>NAL2 HTTP API 服务器</Text>
          
          {/* 服务器状态卡片 */}
          <View style={[styles.card, styles.statusCard]}>
            <View style={styles.statusHeader}>
              <View style={[styles.statusDot, serverStatus.isRunning && styles.statusDotActive]} />
              <Text style={styles.statusTitle}>
                {serverStatus.isRunning ? '服务器运行中' : '服务器已停止'}
              </Text>
              <TouchableOpacity 
                style={styles.refreshButton} 
                onPress={refreshServerStatus}
                disabled={refreshing}
              >
                {refreshing ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Text style={styles.refreshButtonText}>🔄 刷新</Text>
                )}
              </TouchableOpacity>
            </View>
            
            {serverStatus.isRunning && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>IP地址</Text>
                  <Text style={styles.infoValue}>{serverStatus.ipAddress}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>端口</Text>
                  <Text style={styles.infoValue}>{serverStatus.port}</Text>
                </View>
              </>
            )}
          </View>

          {/* 全局变量管理区域 */}
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.collapsibleHeader} 
              onPress={() => setIsGlobalVarsExpanded(!isGlobalVarsExpanded)}
              activeOpacity={0.7}
            >
              <Text style={styles.cardTitle}>🔧 全局变量</Text>
              <View style={styles.headerRight}>
                {isGlobalVarsExpanded && (
                  <TouchableOpacity
                    style={styles.clearAllButtonSmall}
                    onPress={handleClearAllVariables}
                  >
                    <Text style={styles.clearAllButtonSmallText}>清空全部</Text>
                  </TouchableOpacity>
                )}
                <Text style={styles.expandIcon}>
                  {isGlobalVarsExpanded ? '∨' : '»'}
                </Text>
              </View>
            </TouchableOpacity>
            
            {isGlobalVarsExpanded && (
              <View style={styles.globalVarsContent}>
                {/* CFArray */}
                <View style={styles.varItem}>
                  <View style={styles.varHeader}>
                    <Text style={styles.varName}>CFArray (交叉频率)</Text>
                    <TouchableOpacity
                      style={[styles.deleteButtonSmall, globalVars.CFArray.length === 0 && styles.deleteButtonDisabled]}
                      onPress={() => handleDeleteVariable('CFArray')}
                      disabled={globalVars.CFArray.length === 0}
                    >
                      <Text style={styles.deleteButtonSmallText}>删除</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.varValue}>
                    {globalVars.CFArray.length > 0 
                      ? `[${globalVars.CFArray.map(v => v.toFixed(2)).join(', ')}]`
                      : '空 []'}
                  </Text>
                  <Text style={styles.varInfo}>长度: {globalVars.CFArray.length}</Text>
                </View>

                {/* FreqInCh */}
                <View style={styles.varItem}>
                  <View style={styles.varHeader}>
                    <Text style={styles.varName}>FreqInCh (频率通道映射)</Text>
                    <TouchableOpacity
                      style={[styles.deleteButtonSmall, globalVars.FreqInCh.length === 0 && styles.deleteButtonDisabled]}
                      onPress={() => handleDeleteVariable('FreqInCh')}
                      disabled={globalVars.FreqInCh.length === 0}
                    >
                      <Text style={styles.deleteButtonSmallText}>删除</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.varValue}>
                    {globalVars.FreqInCh.length > 0 
                      ? `[${globalVars.FreqInCh.join(', ')}]`
                      : '空 []'}
                  </Text>
                  <Text style={styles.varInfo}>长度: {globalVars.FreqInCh.length}</Text>
                </View>

                {/* CR */}
                <View style={styles.varItem}>
                  <View style={styles.varHeader}>
                    <Text style={styles.varName}>CR (压缩比)</Text>
                    <TouchableOpacity
                      style={[styles.deleteButtonSmall, globalVars.CR.length === 0 && styles.deleteButtonDisabled]}
                      onPress={() => handleDeleteVariable('CR')}
                      disabled={globalVars.CR.length === 0}
                    >
                      <Text style={styles.deleteButtonSmallText}>删除</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.varValue}>
                    {globalVars.CR.length > 0 
                      ? `[${globalVars.CR.map(v => v.toFixed(2)).join(', ')}]`
                      : '空 []'}
                  </Text>
                  <Text style={styles.varInfo}>长度: {globalVars.CR.length}</Text>
                </View>
              </View>
            )}
          </View>

          {/* API端点卡片 */}
          {serverStatus.isRunning && (
            <View style={[styles.card, styles.apiCard]}>
              <Text style={styles.cardTitle}>📡 API 端点</Text>
              
              <View style={styles.apiEndpoint}>
                <Text style={styles.apiMethod}>POST</Text>
                <Text style={styles.apiUrl}>
                  http://{serverStatus.ipAddress}:{serverStatus.port}/api/nal2/process
                </Text>
              </View>

              <TouchableOpacity style={styles.copyButton} onPress={copyApiUrl}>
                <Text style={styles.copyButtonText}>📋 复制 API 地址</Text>
              </TouchableOpacity>

              {/* 可折叠的请求示例 */}
              <View style={styles.collapsibleSection}>
                <TouchableOpacity 
                  style={styles.collapsibleHeader} 
                  onPress={() => setIsRequestExampleExpanded(!isRequestExampleExpanded)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.exampleTitle}>请求示例</Text>
                  <Text style={styles.expandIcon}>
                    {isRequestExampleExpanded ? '∨' : '»'}
                  </Text>
                </TouchableOpacity>

                {isRequestExampleExpanded && (
                  <View style={styles.codeBlock}>
                    <Text style={styles.codeText}>{`{
  "sequence_num": 1,
  "function": "dllVersion",
  "input_parameters": {}
}`}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* 最近请求 - 可折叠 */}
          {lastRequest && (
            <View style={styles.card}>
              <TouchableOpacity 
                style={styles.collapsibleHeader} 
                onPress={() => setIsLastRequestExpanded(!isLastRequestExpanded)}
                activeOpacity={0.7}
              >
                <Text style={styles.cardTitle}>📥 最近请求</Text>
                <Text style={styles.expandIcon}>
                  {isLastRequestExpanded ? '∨' : '»'}
                </Text>
              </TouchableOpacity>
              
              {isLastRequestExpanded && (
                <ScrollView 
                  style={styles.largeCodeContainer}
                  nestedScrollEnabled={true}
                >
                  <Text style={styles.codeText}>{formatJSON(lastRequest)}</Text>
                </ScrollView>
              )}
            </View>
          )}

          {/* 最近响应 - 可折叠 */}
          {lastResponse && (
            <View style={styles.card}>
              <TouchableOpacity 
                style={styles.collapsibleHeader} 
                onPress={() => setIsLastResponseExpanded(!isLastResponseExpanded)}
                activeOpacity={0.7}
              >
                <Text style={styles.cardTitle}>📤 最近响应</Text>
                <Text style={styles.expandIcon}>
                  {isLastResponseExpanded ? '∨' : '»'}
                </Text>
              </TouchableOpacity>
              
              {isLastResponseExpanded && (
                <ScrollView 
                  style={styles.largeCodeContainer}
                  nestedScrollEnabled={true}
                >
                  <Text style={styles.codeText}>{formatJSON(lastResponse)}</Text>
                </ScrollView>
              )}
            </View>
          )}

          {/* 版本信息卡片 - 可折叠 */}
          <View style={[styles.card, styles.versionCard]}>
            <TouchableOpacity 
              style={styles.collapsibleHeader} 
              onPress={() => setIsVersionExpanded(!isVersionExpanded)}
              activeOpacity={0.7}
            >
              <Text style={styles.cardTitle}>📱 版本信息</Text>
              <Text style={styles.expandIcon}>
                {isVersionExpanded ? '∨' : '»'}
              </Text>
            </TouchableOpacity>
            
            {isVersionExpanded && (
              <View style={styles.versionInfo}>
                <View style={styles.versionRow}>
                  <Text style={styles.versionLabel}>应用名称</Text>
                  <Text style={styles.versionValue}>{APP_NAME}</Text>
                </View>
                <View style={styles.versionRow}>
                  <Text style={styles.versionLabel}>版本号</Text>
                  <Text style={styles.versionValue}>v{APP_VERSION}</Text>
                </View>
                <View style={styles.versionRow}>
                  <Text style={styles.versionLabel}>构建号</Text>
                  <Text style={styles.versionValue}>Build {BUILD_NUMBER}</Text>
                </View>
              </View>
            )}
          </View>

          {/* 日志查看器 */}
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.collapsibleHeader} 
              onPress={() => setIsLogsExpanded(!isLogsExpanded)}
              activeOpacity={0.7}
            >
              <Text style={styles.cardTitle}>
                📋 应用日志 ({logs.length})
              </Text>
              <Text style={styles.expandIcon}>
                {isLogsExpanded ? '∨' : '»'}
              </Text>
            </TouchableOpacity>

            {isLogsExpanded && (
              <>
                <View style={styles.logActions}>
                  <TouchableOpacity 
                    style={[styles.logButton, styles.downloadButton]} 
                    onPress={downloadLogs}
                    disabled={isDownloadingLogs || logs.length === 0}
                  >
                    {isDownloadingLogs ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.logButtonText}>💾 下载日志</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.logButton, styles.clearButton]} 
                    onPress={clearLogs}
                    disabled={logs.length === 0}
                  >
                    <Text style={styles.logButtonText}>🗑️ 清除日志</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.logButton, styles.fullScreenButton]} 
                    onPress={() => setShowFullScreenLogs(true)}
                    disabled={logs.length === 0}
                  >
                    <Text style={styles.logButtonText}>🔍 全屏查看</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView 
                  style={styles.logContainer}
                  nestedScrollEnabled={true}
                >
                  {logs.length === 0 ? (
                    <Text style={styles.noLogsText}>暂无日志</Text>
                  ) : (
                    logs.slice(0, 50).map((log, index) => (
                      <View key={index} style={styles.logEntry}>
                        <Text style={styles.logTimestamp}>{log.timestamp}</Text>
                        <Text style={[
                          styles.logMessage,
                          log.type === 'error' && styles.logError,
                          log.type === 'success' && styles.logSuccess,
                          log.type === 'info' && styles.logInfo,
                        ]}>
                          {log.message}
                        </Text>
                      </View>
                    ))
                  )}
                  {logs.length > 50 && (
                    <Text style={styles.moreLogsText}>
                      还有 {logs.length - 50} 条日志，请使用全屏查看
                    </Text>
                  )}
                </ScrollView>
              </>
            )}
          </View>

          {/* 应用信息 */}
          <View style={styles.appInfo}>
            <Text style={styles.appInfoText}>{APP_NAME} v{APP_VERSION} (Build {BUILD_NUMBER})</Text>
            <Text style={styles.appInfoText}>HTTP API Server</Text>
          </View>
        </View>
      </ScrollView>

      {/* 全屏日志查看器 Modal */}
      <Modal
        visible={showFullScreenLogs}
        animationType="slide"
        onRequestClose={() => setShowFullScreenLogs(false)}
      >
        <View style={styles.fullScreenContainer}>
          <View style={styles.fullScreenHeader}>
            <Text style={styles.fullScreenTitle}>应用日志 ({logs.length})</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowFullScreenLogs(false)}
            >
              <Text style={styles.closeButtonText}>✕ 关闭</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.fullScreenActions}>
            <TouchableOpacity 
              style={[styles.logButton, styles.downloadButton]} 
              onPress={downloadLogs}
              disabled={isDownloadingLogs || logs.length === 0}
            >
              {isDownloadingLogs ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.logButtonText}>💾 下载日志</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.logButton, styles.clearButton]} 
              onPress={clearLogs}
              disabled={logs.length === 0}
            >
              <Text style={styles.logButtonText}>🗑️ 清除日志</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.fullScreenLogContainer}>
            {logs.length === 0 ? (
              <Text style={styles.noLogsText}>暂无日志</Text>
            ) : (
              logs.map((log, index) => {
                // 尝试格式化 JSON 消息
                let displayMessage = log.message;
                let isJSON = false;
                
                // 检测消息中是否包含 JSON
                const jsonMatch = log.message.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  try {
                    const jsonPart = jsonMatch[0];
                    const formattedJSON = formatJSON(jsonPart);
                    displayMessage = log.message.replace(jsonPart, '\n' + formattedJSON);
                    isJSON = true;
                  } catch (e) {
                    // 保持原样
                  }
                }

                return (
                  <View key={index} style={styles.fullScreenLogEntry}>
                    <Text style={styles.logTimestamp}>{log.timestamp}</Text>
                    <Text style={[
                      styles.fullScreenLogMessage,
                      log.type === 'error' && styles.logError,
                      log.type === 'success' && styles.logSuccess,
                      log.type === 'info' && styles.logInfo,
                    ]}>
                      {displayMessage}
                    </Text>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    marginRight: 10,
  },
  statusDotActive: {
    backgroundColor: '#34C759',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'monospace',
  },
  apiCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  apiEndpoint: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    marginTop: 12,
  },
  apiMethod: {
    fontSize: 12,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  apiUrl: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  copyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  collapsibleSection: {
    marginTop: 8,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    minHeight: 44,
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  expandIcon: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  codeBlock: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginTop: 8,
  },
  codeText: {
    fontSize: 11,
    color: '#333',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  largeCodeContainer: {
    maxHeight: 400,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginTop: 12,
  },
  appInfo: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  appInfoText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  versionCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  versionInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  versionLabel: {
    fontSize: 14,
    color: '#666',
  },
  versionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  logActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 12,
  },
  logButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  downloadButton: {
    backgroundColor: '#34C759',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  fullScreenButton: {
    backgroundColor: '#007AFF',
  },
  logButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  logContainer: {
    maxHeight: 300,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  noLogsText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    paddingVertical: 20,
  },
  moreLogsText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    paddingVertical: 10,
    fontStyle: 'italic',
  },
  logEntry: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  logTimestamp: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  logMessage: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  logError: {
    color: '#FF3B30',
  },
  logSuccess: {
    color: '#34C759',
  },
  logInfo: {
    color: '#007AFF',
  },
  // 全屏日志查看器样式
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 20,
  },
  fullScreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
  },
  fullScreenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  fullScreenActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  fullScreenLogContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  fullScreenLogEntry: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  fullScreenLogMessage: {
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  // 全局变量样式
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearAllButtonSmall: {
    backgroundColor: '#FF3B30',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearAllButtonSmallText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  globalVarsContent: {
    marginTop: 12,
  },
  varItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  varHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  varName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
  deleteButtonSmall: {
    backgroundColor: '#FF9500',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  deleteButtonSmallText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  deleteButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.5,
  },
  varValue: {
    fontSize: 10,
    color: '#333',
    fontFamily: 'monospace',
    marginBottom: 6,
    lineHeight: 14,
  },
  varInfo: {
    fontSize: 10,
    color: '#999',
  },
});
