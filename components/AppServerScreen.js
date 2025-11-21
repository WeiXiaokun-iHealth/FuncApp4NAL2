import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { DataParser } from '../utils/DataParser';
import { NAL2Bridge } from '../utils/NAL2Bridge';
import AppServer from '../utils/AppServer';

export default function AppServerScreen() {
  const APP_NAME = 'FuncApp4NAL2';
  const APP_VERSION = '1.0.0';
  const SERVER_PORT = 8080;
  
  const [inputData, setInputData] = useState('');
  const [outputData, setOutputData] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverRunning, setServerRunning] = useState(false);
  const [serverInfo, setServerInfo] = useState({ ipAddress: 'Unknown', port: SERVER_PORT });
  const [connectedClients, setConnectedClients] = useState(0);

  // 启动服务器
  useEffect(() => {
    startServer();
    
    return () => {
      stopServer();
    };
  }, []);

  const startServer = async (retryPort = SERVER_PORT) => {
    try {
      setLoading(true);
      
      // 启动服务器
      const result = await AppServer.start(retryPort, handleClientMessage);
      
      if (result.success) {
        setServerRunning(true);
        setServerInfo({
          ipAddress: result.ipAddress || 'Unknown',
          port: result.port
        });
        
        // 注册HTTP API处理器
        AppServer.registerHandler('/api/nal2/process', handleNAL2Request);
        
        console.log(`[Server] 服务器已启动: ${result.ipAddress}:${result.port}`);
      }
    } catch (error) {
      console.error('启动服务器失败:', error);
      
      // 检查是否是端口占用错误
      if (error.message && error.message.includes('EADDRINUSE')) {
        // 端口被占用，尝试使用下一个端口
        const nextPort = retryPort + 1;
        if (nextPort <= SERVER_PORT + 10) {
          console.log(`[Server] 端口 ${retryPort} 被占用，尝试端口 ${nextPort}...`);
          await startServer(nextPort);
          return;
        }
      }
      
      Alert.alert(
        '启动失败', 
        '无法启动服务器，请检查:\n1. 是否有其他应用占用端口\n2. 重启应用后重试\n\n错误: ' + error.message,
        [{ text: '确定' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const stopServer = async () => {
    try {
      await AppServer.stop();
      setServerRunning(false);
      setConnectedClients(0);
    } catch (error) {
      console.error('停止服务器失败:', error);
    }
  };

  const handleClientMessage = async (message, clientId) => {
    console.log('[Server] 收到客户端消息:', message, 'from', clientId);
    
    try {
      if (message.type === 'nal2_request') {
        // 处理NAL2请求
        const result = await processNAL2Function(message.data);
        
        // 发送响应
        await AppServer.sendToClient(clientId, {
          type: 'nal2_response',
          sequence_num: message.data.sequence_num,
          result: result
        });
      }
    } catch (error) {
      console.error('[Server] 处理消息失败:', error);
      
      // 发送错误响应
      await AppServer.sendToClient(clientId, {
        type: 'nal2_response',
        sequence_num: message.data?.sequence_num || 0,
        result: {
          sequence_num: message.data?.sequence_num || 0,
          function: message.data?.function || 'unknown',
          return: -1,
          output_parameters: {
            error: error.message
          }
        }
      });
    }
  };

  const handleNAL2Request = async (method, body) => {
    try {
      const requestData = JSON.parse(body);
      const result = await processNAL2Function(requestData);
      return result;
    } catch (error) {
      return {
        sequence_num: 0,
        function: 'unknown',
        return: -1,
        output_parameters: {
          error: error.message
        }
      };
    }
  };

  const processNAL2Function = async (requestData) => {
    try {
      console.log('[App] 处理NAL2请求:', requestData);
      
      // 显示输入
      const inputJson = DataParser.formatInput(requestData);
      setInputData(inputJson);
      
      // 解析输入数据
      const parsedData = DataParser.parseInput(requestData);
      
      // 处理NAL2函数
      const result = await NAL2Bridge.processFunction(parsedData);
      
      console.log('[App] NAL2处理结果:', result);
      
      // 显示输出
      const outputJson = DataParser.formatOutput(result);
      setOutputData(outputJson);
      
      return result;
    } catch (error) {
      console.error('[App] NAL2处理失败:', error);
      
      const errorOutput = DataParser.createErrorOutput(
        requestData.sequence_num || 0,
        requestData.function || 'unknown',
        error.message
      );
      
      const errorJson = DataParser.formatOutput(errorOutput);
      setOutputData(errorJson);
      
      return errorOutput;
    }
  };

  // 更新服务器状态
  useEffect(() => {
    if (serverRunning) {
      const interval = setInterval(async () => {
        try {
          const status = await AppServer.getStatus();
          setConnectedClients(status.connections || 0);
        } catch (error) {
          // 忽略错误
        }
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [serverRunning]);

  const handleRestart = () => {
    Alert.alert(
      '重启服务器',
      '确定要重启服务器吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: async () => {
            await stopServer();
            setTimeout(() => startServer(), 500);
          }
        }
      ]
    );
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
          <Text style={styles.title}>NAL2 App Server</Text>
          
          {/* 应用信息 */}
          <View style={styles.appInfo}>
            <Text style={styles.appInfoText}>应用: {APP_NAME}</Text>
            <Text style={styles.appInfoText}>版本: {APP_VERSION}</Text>
            <Text style={styles.appInfoText}>模式: 服务器模式</Text>
          </View>
          
          {/* 服务器状态 */}
          <View style={styles.serverSection}>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, serverRunning && styles.statusDotRunning]} />
              <Text style={styles.statusText}>
                {serverRunning ? '服务器运行中' : '服务器已停止'}
              </Text>
            </View>
            
            {serverRunning && (
              <View style={styles.serverInfo}>
                <Text style={styles.serverInfoLabel}>服务器地址:</Text>
                <Text style={styles.serverInfoValue}>
                  ws://{serverInfo.ipAddress}:{serverInfo.port}
                </Text>
                <Text style={styles.serverInfoLabel}>HTTP API:</Text>
                <Text style={styles.serverInfoValue}>
                  http://{serverInfo.ipAddress}:{serverInfo.port + 1}/api/nal2/process
                </Text>
                <Text style={styles.serverInfoLabel}>已连接客户端:</Text>
                <Text style={styles.serverInfoValue}>{connectedClients}</Text>
              </View>
            )}
            
            <TouchableOpacity
              style={[styles.button, !serverRunning && styles.buttonDisabled]}
              onPress={handleRestart}
              disabled={!serverRunning || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>重启服务器</Text>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Input区域 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>最近请求 (Input)</Text>
            <View style={styles.textView}>
              <Text style={styles.textViewContent}>
                {inputData || '等待Web端发送请求...'}
              </Text>
            </View>
          </View>
          
          {/* Output区域 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>处理结果 (Output)</Text>
            <View style={styles.textView}>
              <Text style={styles.textViewContent}>
                {outputData || '等待处理结果...'}
              </Text>
            </View>
          </View>

          {/* 连接说明 */}
          <View style={styles.instructionsSection}>
            <Text style={styles.instructionsTitle}>Web端连接方式:</Text>
            <Text style={styles.instructionsText}>
              1. 确保Web端和App在同一局域网
            </Text>
            <Text style={styles.instructionsText}>
              2. 在Web端扫描或手动输入服务器地址
            </Text>
            <Text style={styles.instructionsText}>
              3. 连接成功后即可发送NAL2请求
            </Text>
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
  serverSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    marginRight: 8,
  },
  statusDotRunning: {
    backgroundColor: '#34C759',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  serverInfo: {
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
  },
  serverInfoLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginBottom: 2,
  },
  serverInfoValue: {
    fontSize: 13,
    color: '#007AFF',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonDisabled: {
    backgroundColor: '#999',
    opacity: 0.6,
  },
  buttonText: {
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
  instructionsSection: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 13,
    color: '#1565C0',
    marginBottom: 6,
  },
});
