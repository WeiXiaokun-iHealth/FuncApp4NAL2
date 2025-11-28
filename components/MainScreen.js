import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar,
  ActivityIndicator,
  Alert,
  NativeEventEmitter,
  NativeModules
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DataParser } from '../utils/DataParser';
import { NAL2Bridge } from '../utils/NAL2Bridge';
import { globalVariables } from '../utils/GlobalVariables';

const { Nal2 } = NativeModules;
const nal2Emitter = new NativeEventEmitter(Nal2);

const WS_CONFIG_KEY = '@websocket_config';

export default function MainScreen({ wsConfig, onReconfigure }) {
  const APP_NAME = 'FuncApp4NAL2';
  const APP_VERSION = '1.0.0';
  
  const [inputData, setInputData] = useState('');
  const [outputData, setOutputData] = useState('');
  const [loading, setLoading] = useState(false);
  const [ws, setWs] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const wsRef = useRef(null);
  
  // 全局变量状态
  const [globalVars, setGlobalVars] = useState({
    CFArray: [],
    FreqInCh: [],
    CR: []
  });

  // NAL2日志状态
  const [nal2Logs, setNal2Logs] = useState([]);
  const maxLogs = 50; // 最多保留50条日志

  // WebSocket连接函数
  const connectWebSocket = (url) => {
    console.log('连接 WebSocket:', url);
    
    const websocket = new WebSocket(url);
    
    websocket.onopen = () => {
      console.log('WebSocket已连接');
      setWsConnected(true);
      setReconnecting(false);
      // 注册为App客户端
      websocket.send(JSON.stringify({ type: 'register', client: 'app' }));
    };
    
    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('收到WebSocket消息:', data);
        
        if (data.type === 'registered') {
          console.log('App已注册到WebSocket服务器');
        } else if (data.type === 'process_input') {
          // 收到Web端发送的input，自动处理
          handleAutoProcess(data.input, websocket);
        } else if (data.type === 'nal2_request') {
          // 收到测试系统的NAL2请求
          handleNAL2Request(data.data, websocket);
        }
      } catch (error) {
        console.error('解析WebSocket消息错误:', error);
      }
    };
    
    websocket.onclose = () => {
      console.log('WebSocket已断开');
      setWsConnected(false);
      setReconnecting(false);
    };
    
    websocket.onerror = (error) => {
      console.error('WebSocket错误:', error);
      setReconnecting(false);
    };
    
    wsRef.current = websocket;
    setWs(websocket);
    return websocket;
  };

  // 手动重连WebSocket
  const handleReconnect = () => {
    if (!wsConfig?.url) {
      Alert.alert('错误', '没有可用的 WebSocket 配置');
      return;
    }

    setReconnecting(true);
    
    // 关闭现有连接
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (error) {
        console.log('关闭WebSocket错误:', error);
      }
    }
    
    // 延迟500ms后重新连接
    setTimeout(() => {
      console.log('正在重新连接WebSocket...');
      connectWebSocket(wsConfig.url);
    }, 500);
  };

  // 重新配置 WebSocket
  const handleReconfigure = () => {
    Alert.alert(
      '重新配置',
      '是否要重新扫描并配置 WebSocket 服务？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: async () => {
            // 关闭现有连接
            if (wsRef.current) {
              try {
                wsRef.current.close();
              } catch (error) {
                console.log('关闭WebSocket错误:', error);
              }
            }
            
            // 清除保存的配置
            try {
              await AsyncStorage.removeItem(WS_CONFIG_KEY);
            } catch (error) {
              console.error('清除配置失败:', error);
            }
            
            // 回到配置页面
            if (onReconfigure) {
              onReconfigure();
            }
          }
        }
      ]
    );
  };

  // 初始化WebSocket连接
  useEffect(() => {
    if (wsConfig?.url) {
      connectWebSocket(wsConfig.url);
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [wsConfig]);

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

  // 监听NAL2日志事件
  useEffect(() => {
    console.log('[MainScreen] 正在注册 Nal2Log 事件监听器...');
    
    const subscription = nal2Emitter.addListener('Nal2Log', (logData) => {
      console.log('[MainScreen] 收到 Nal2Log 事件:', logData);
      
      const timestamp = new Date(logData.timestamp).toLocaleTimeString('zh-CN', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3
      });
      
      const logEntry = {
        id: Date.now() + Math.random(),
        timestamp,
        level: logData.level,
        tag: logData.tag,
        message: logData.message
      };
      
      // 输出到控制台
      console.log(`[${logData.level}] ${logData.tag}: ${logData.message}`);
      
      // 添加到日志列表（限制数量）
      setNal2Logs(prevLogs => {
        const newLogs = [logEntry, ...prevLogs];
        return newLogs.slice(0, maxLogs);
      });
    });

    console.log('[MainScreen] Nal2Log 事件监听器已注册');
    
    // 测试：尝试手动触发一个测试日志
    setTimeout(() => {
      console.log('[MainScreen] 测试：尝试调用 Nal2.dllVersion() 来触发日志...');
      if (Nal2 && Nal2.dllVersion) {
        Nal2.dllVersion()
          .then(version => {
            console.log('[MainScreen] dllVersion 调用成功:', version);
          })
          .catch(error => {
            console.log('[MainScreen] dllVersion 调用失败:', error);
          });
      } else {
        console.log('[MainScreen] Nal2 模块或 dllVersion 方法不可用');
      }
    }, 2000);

    return () => {
      console.log('[MainScreen] 移除 Nal2Log 事件监听器');
      subscription.remove();
    };
  }, []);

  // 清空日志
  const handleClearLogs = () => {
    setNal2Logs([]);
  };

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

  // 处理NAL2测试请求
  const handleNAL2Request = async (requestData, websocket) => {
    try {
      console.log('[App] 处理NAL2测试请求:', requestData);
      
      // 解析输入数据
      const parsedData = DataParser.parseInput(requestData);
      
      // 处理NAL2函数
      const result = await NAL2Bridge.processFunction(parsedData);
      
      console.log('[App] NAL2处理结果:', result);
      
      // 发送响应回服务器
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({
          type: 'nal2_response',
          sequence_num: requestData.sequence_num,
          result: result
        }));
      }
      
      return result;
    } catch (error) {
      console.error('[App] NAL2处理失败:', error);
      
      // 发送错误响应
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({
          type: 'nal2_response',
          sequence_num: requestData.sequence_num || 0,
          result: {
            sequence_num: requestData.sequence_num || 0,
            function: requestData.function || 'unknown',
            return: -1,
            output_parameters: {
              error: error.message
            }
          }
        }));
      }
    }
  };

  // 自动处理Web发送的input
  const handleAutoProcess = async (input, websocket) => {
    try {
      // 显示接收到的input
      setInputData(input);
      
      console.log('[App] 收到输入数据:', input);
      
      // 使用DataParser解析输入
      const parsedData = DataParser.parseInput(input);
      console.log('[App] 解析后的数据:', parsedData);
      
      // 使用NAL2Bridge处理函数调用
      const output = await NAL2Bridge.processFunction(parsedData);
      console.log('[App] 处理结果:', output);
      
      // 格式化输出
      const outputJson = DataParser.formatOutput(output);
      setOutputData(outputJson);
      
      // 自动发送处理结果回Web端
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({
          type: 'send_to_web',
          output: outputJson
        }));
        console.log('[App] 已发送结果到Web端');
      }
      
    } catch (error) {
      console.error('[App] 处理输入数据错误:', error);
      
      // 创建错误输出
      const errorOutput = DataParser.createErrorOutput(0, 'unknown', error.message);
      const errorJson = DataParser.formatOutput(errorOutput);
      setOutputData(errorJson);
      
      // 发送错误结果
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({
          type: 'send_to_web',
          output: errorJson
        }));
      }
    }
  };

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
          <Text style={styles.title}>NAL2 函数测试</Text>
          
          {/* 应用信息 */}
          <View style={styles.appInfo}>
            <Text style={styles.appInfoText}>应用: {APP_NAME}</Text>
            <Text style={styles.appInfoText}>版本: {APP_VERSION}</Text>
            <Text style={styles.appInfoText}>接口: {wsConfig?.url || '未配置'}</Text>
          </View>

          {/* NAL2日志区域 */}
          <View style={styles.logsSection}>
            <View style={styles.logsSectionHeader}>
              <Text style={styles.logsSectionTitle}>NAL2 日志 ({nal2Logs.length})</Text>
              <TouchableOpacity
                style={styles.clearLogsButton}
                onPress={handleClearLogs}
                disabled={nal2Logs.length === 0}
              >
                <Text style={[
                  styles.clearLogsButtonText,
                  nal2Logs.length === 0 && styles.clearLogsButtonTextDisabled
                ]}>清空</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.logsScrollView}
              nestedScrollEnabled={true}
            >
              {nal2Logs.length === 0 ? (
                <Text style={styles.noLogsText}>暂无日志</Text>
              ) : (
                nal2Logs.map((log) => (
                  <View key={log.id} style={[
                    styles.logEntry,
                    log.level === 'ERROR' && styles.logEntryError,
                    log.level === 'WARN' && styles.logEntryWarn,
                    log.level === 'INFO' && styles.logEntryInfo
                  ]}>
                    <View style={styles.logHeader}>
                      <Text style={styles.logTimestamp}>{log.timestamp}</Text>
                      <Text style={[
                        styles.logLevel,
                        log.level === 'ERROR' && styles.logLevelError,
                        log.level === 'WARN' && styles.logLevelWarn,
                        log.level === 'INFO' && styles.logLevelInfo
                      ]}>{log.level}</Text>
                    </View>
                    <Text style={styles.logTag}>{log.tag}</Text>
                    <Text style={styles.logMessage}>{log.message}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>

          {/* 全局变量管理区域 */}
          <View style={styles.globalVarsSection}>
            <View style={styles.globalVarsHeader}>
              <Text style={styles.globalVarsTitle}>全局变量</Text>
              <TouchableOpacity
                style={styles.clearAllButton}
                onPress={handleClearAllVariables}
              >
                <Text style={styles.clearAllButtonText}>清空全部</Text>
              </TouchableOpacity>
            </View>
            
            {/* CFArray */}
            <View style={styles.varItem}>
              <View style={styles.varHeader}>
                <Text style={styles.varName}>CFArray (交叉频率)</Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteVariable('CFArray')}
                  disabled={globalVars.CFArray.length === 0}
                >
                  <Text style={[
                    styles.deleteButtonText,
                    globalVars.CFArray.length === 0 && styles.deleteButtonTextDisabled
                  ]}>删除</Text>
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
                  style={styles.deleteButton}
                  onPress={() => handleDeleteVariable('FreqInCh')}
                  disabled={globalVars.FreqInCh.length === 0}
                >
                  <Text style={[
                    styles.deleteButtonText,
                    globalVars.FreqInCh.length === 0 && styles.deleteButtonTextDisabled
                  ]}>删除</Text>
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
                  style={styles.deleteButton}
                  onPress={() => handleDeleteVariable('CR')}
                  disabled={globalVars.CR.length === 0}
                >
                  <Text style={[
                    styles.deleteButtonText,
                    globalVars.CR.length === 0 && styles.deleteButtonTextDisabled
                  ]}>删除</Text>
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
          
          {/* WebSocket状态和控制按钮 */}
          <View style={styles.statusContainer}>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, wsConnected && styles.statusDotConnected]} />
              <Text style={styles.statusText}>
                {reconnecting ? '正在重连...' : (wsConnected ? 'WebSocket已连接' : 'WebSocket断开')}
              </Text>
            </View>
            
            <View style={styles.controlButtons}>
              <TouchableOpacity
                style={[styles.controlButton, reconnecting && styles.controlButtonDisabled]}
                onPress={handleReconnect}
                disabled={reconnecting}
              >
                {reconnecting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.controlButtonText}>
                    {wsConnected ? '重新连接' : '立即连接'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, styles.reconfigButton]}
                onPress={handleReconfigure}
              >
                <Text style={styles.controlButtonText}>重新检索</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Input区域 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Input</Text>
            <View style={styles.textView}>
              <Text style={styles.textViewContent}>
                {inputData || '等待Web端发送参数...'}
              </Text>
            </View>
          </View>
          
          {/* Output区域 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Output</Text>
            <View style={styles.textView}>
              <Text style={styles.textViewContent}>
                {outputData || '等待处理结果...'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    marginBottom: 15,
  },
  appInfo: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  appInfoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  statusContainer: {
    marginBottom: 20,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    marginRight: 8,
  },
  statusDotConnected: {
    backgroundColor: '#34C759',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  controlButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  reconfigButton: {
    backgroundColor: '#FF9500',
  },
  controlButtonDisabled: {
    backgroundColor: '#999',
    opacity: 0.6,
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  textView: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    minHeight: 120,
  },
  textViewContent: {
    fontSize: 11,
    color: '#333',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  globalVarsSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  globalVarsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  globalVarsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  clearAllButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearAllButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  varItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e8e8e8',
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
  deleteButton: {
    backgroundColor: '#FF9500',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  deleteButtonTextDisabled: {
    opacity: 0.4,
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
  logsSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  logsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  clearLogsButton: {
    backgroundColor: '#FF9500',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearLogsButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  clearLogsButtonTextDisabled: {
    opacity: 0.4,
  },
  logsScrollView: {
    maxHeight: 300,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    padding: 8,
  },
  noLogsText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    paddingVertical: 20,
  },
  logEntry: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 8,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  logEntryError: {
    borderLeftColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
  },
  logEntryWarn: {
    borderLeftColor: '#FF9500',
    backgroundColor: '#FFF9F0',
  },
  logEntryInfo: {
    borderLeftColor: '#34C759',
    backgroundColor: '#F0FFF4',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logTimestamp: {
    fontSize: 10,
    color: '#999',
    fontFamily: 'monospace',
  },
  logLevel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#007AFF',
  },
  logLevelError: {
    color: '#FF3B30',
  },
  logLevelWarn: {
    color: '#FF9500',
  },
  logLevelInfo: {
    color: '#34C759',
  },
  logTag: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
    marginBottom: 2,
  },
  logMessage: {
    fontSize: 10,
    color: '#333',
    fontFamily: 'monospace',
    lineHeight: 14,
  },
});
