import React, { useState, useEffect, useRef } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DataParser } from '../utils/DataParser';
import { NAL2Bridge } from '../utils/NAL2Bridge';

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
});
