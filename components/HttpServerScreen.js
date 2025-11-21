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
  AppState
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import AppServer from '../utils/AppServer';
import { NAL2Bridge } from '../utils/NAL2Bridge';

const { HttpServerModule } = NativeModules;

export default function HttpServerScreen() {
  const APP_NAME = 'FuncApp4NAL2';
  const APP_VERSION = '2.0.0';
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
  const appState = useRef(AppState.currentState);
  const eventEmitterRef = useRef(null);
  const subscriptionRef = useRef(null);

  // 启动HTTP服务器
  useEffect(() => {
    let isMounted = true;
    
    const initServer = async () => {
      try {
        console.log('[HttpServer] 正在启动服务器...');
        setLoading(true);

        // 设置事件监听（只设置一次）
        if (HttpServerModule && !eventEmitterRef.current) {
          eventEmitterRef.current = new NativeEventEmitter(HttpServerModule);
          subscriptionRef.current = eventEmitterRef.current.addListener('onHttpRequest', async (data) => {
            console.log('[HttpServer] 收到HTTP请求事件:', data);
            if (isMounted) {
              // 处理请求
              const { requestId, requestBody } = data;
              
              if (requestBody) {
                setLastRequest(requestBody);
                
                let responseJson;
                let sendError = false;
                
                try {
                  // 使用NAL2Bridge处理请求
                  const inputData = JSON.parse(requestBody);
                  console.log('[HttpServer] 调用NAL2Bridge处理:', inputData);
                  
                  const result = await NAL2Bridge.processFunction(inputData);
                  responseJson = JSON.stringify(result);
                  
                  console.log('[HttpServer] NAL2处理完成');
                  setLastResponse(responseJson);
                  
                } catch (error) {
                  console.error('[HttpServer] NAL2处理失败:', error);
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
                
                // 统一发送响应（只调用一次sendResponse）
                if (requestId !== undefined && HttpServerModule && responseJson) {
                  try {
                    await HttpServerModule.sendResponse(requestId, responseJson);
                    console.log('[HttpServer] 已发送HTTP响应:', sendError ? '错误响应' : '成功响应');
                  } catch (sendErr) {
                    console.error('[HttpServer] 发送响应失败:', sendErr.message);
                    // sendResponse失败不再重试，避免重复
                  }
                }
              }
            }
          });
        }

        // 启动服务器（HTTP请求会在原生层自动处理）
        const result = await AppServer.start(DEFAULT_PORT);
        
        if (isMounted && result.success) {
          console.log('[HttpServer] 服务器启动成功:', result);
          setServerStatus({
            isRunning: true,
            ipAddress: result.ipAddress || '未知',
            port: result.port || DEFAULT_PORT
          });
        }
      } catch (error) {
        console.error('[HttpServer] 启动服务器失败:', error);
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

              <View style={styles.apiExample}>
                <Text style={styles.exampleTitle}>请求示例</Text>
                <View style={styles.codeBlock}>
                  <Text style={styles.codeText}>{`{
  "sequence_num": 1,
  "function": "dllVersion",
  "input_parameters": {}
}`}</Text>
                </View>
              </View>
            </View>
          )}

          {/* 最近请求 */}
          {lastRequest && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📥 最近请求</Text>
              <View style={styles.codeBlock}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <Text style={styles.codeText}>{lastRequest}</Text>
                </ScrollView>
              </View>
            </View>
          )}

          {/* 最近响应 */}
          {lastResponse && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📤 最近响应</Text>
              <View style={styles.codeBlock}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <Text style={styles.codeText}>{lastResponse}</Text>
                </ScrollView>
              </View>
            </View>
          )}

          {/* 应用信息 */}
          <View style={styles.appInfo}>
            <Text style={styles.appInfoText}>{APP_NAME} v{APP_VERSION}</Text>
            <Text style={styles.appInfoText}>HTTP API Server</Text>
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
    marginBottom: 12,
  },
  apiEndpoint: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
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
  apiExample: {
    marginTop: 8,
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  codeBlock: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  codeText: {
    fontSize: 11,
    color: '#333',
    fontFamily: 'monospace',
    lineHeight: 16,
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
});
