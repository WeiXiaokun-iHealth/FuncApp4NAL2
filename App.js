import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar,
  ActivityIndicator 
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import Nal2Module, { processData, realEarInsertionGain } from 'react-native-nal2';

export default function App() {
  const APP_NAME = 'FuncApp4NAL2';
  const APP_VERSION = '1.0.0';
  const WS_URL = 'ws://172.29.2.4:3000';
  
  const [inputData, setInputData] = useState('');
  const [outputData, setOutputData] = useState('');
  const [loading, setLoading] = useState(false);
  const [ws, setWs] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  // WebSocket连接函数
  const connectWebSocket = () => {
    const wsUrl = WS_URL;
    
    const websocket = new WebSocket(wsUrl);
    
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
    
    setWs(websocket);
    return websocket;
  };

  // 手动重连WebSocket
  const handleReconnect = () => {
    setReconnecting(true);
    
    // 关闭现有连接
    if (ws) {
      try {
        ws.close();
      } catch (error) {
        console.log('关闭WebSocket错误:', error);
      }
    }
    
    // 延迟500ms后重新连接
    setTimeout(() => {
      console.log('正在重新连接WebSocket...');
      connectWebSocket();
    }, 500);
  };

  // 初始化WebSocket连接
  useEffect(() => {
    const websocket = connectWebSocket();
    
    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, []);

  // 自动处理Web发送的input
  const handleAutoProcess = async (input, websocket) => {
    try {
      // 显示接收到的input
      setInputData(input);
      
      // 解析input JSON
      let inputData;
      try {
        inputData = JSON.parse(input);
      } catch (parseError) {
        throw new Error(`JSON解析失败: ${parseError.message}. 请检查输入格式，注意不要有多余的逗号。`);
      }
      
      const { sequence_num, function: funcName, input_parameters } = inputData;
      
      // 验证必需字段
      if (!funcName) {
        throw new Error('缺少function字段');
      }
      if (!input_parameters) {
        throw new Error('缺少input_parameters字段');
      }
      
      console.log('处理函数:', funcName);
      console.log('输入参数:', input_parameters);
      
      // 初始化输出结构
      const output = {
        sequence_num: sequence_num,
        result: 0,
        function: funcName,
        return: 0,
        output_parameters: {}
      };
      
      // 根据function名称调用对应的NAL2 API
      if (funcName === 'RealEarInsertionGain_NL2') {
        try {
          console.log('准备调用RealEarInsertionGain_NL2，参数:', input_parameters);
          
          // 调用NAL2模块的realEarInsertionGain方法
            const result = await realEarInsertionGain (
            input_parameters.AC,
            input_parameters.BC,
            input_parameters.L,
            input_parameters.limiting,
            input_parameters.channels,
            input_parameters.direction,
            input_parameters.mic,
            input_parameters.ACother || [],
            input_parameters.noOfAids
          );


        //   const leftResult = await processData({
        //     dateOfBirth: 19640502, // 19640502
        //     adultChil: 0,  // 0 = adult (age >= 15 years), 1 = child (age < 15 years)
        //     experience: 0, // 0 = experienced, 1 = new user
        //     compSpeed: 1, // 0 = slow release, 1 = fast release, 2 = dual
        //     tonal: 1, // 0 = non-tonal language (e.g. English, Spanish, etc), 1 = tonal language (e.g. Mandarin, Cantonese, etc)
        //     gender: 0, // 0 = unknown gender, 1 = male, 2 = female
        //     channels: 18,
        //     bandWidth: 0, //0 = broadband (e.g. speech like), 1 = narrowband (e.g. tone)
        //     selection: 1, // 0 = REIG, 1 = REAG
        //     WBCT: 52, // Suggested value = 52
        //     haType: 3, // 0 = CIC (completely in canal)， 1 = ITC (in the canal)， 2 = ITE (in the ear)， 3 = BTE (behind the ear)
        //     direction: 0, // 0 = 0 degrees， 1 = 45 degrees
        //     mic: 1, // 0 = undisturbed field， 1 = head surface
        //     noOfAids: 2,
        //     // ac: [35, 45, 40, 40, 65, 70, 70, 65, 55],
        //     // bc: [35, 45, 40, 40, 65, 70, 999, 999, 999],
        //     // calcCh: Array(19).fill(1),
        //     // levels: Array.from([50, 65, 80])
        // });
          
          // 设置返回结果
          output.return = 0;
          output.result = 0;
          output.output_parameters.REIG = result.REIG || [];
          
          console.log('NAL2处理成功，REIG:', result.REIG);
        } catch (error) {
          console.error('NAL2处理失败:', error);
          output.return = -1;
          output.result = -1;
          output.output_parameters.error = error.message || String(error);
        }
      } else {
        // 未知函数
        console.warn('未知函数:', funcName);
        output.return = -1;
        output.result = -1;
        output.output_parameters.error = `Unknown function: ${funcName}`;
      }
      
      // 格式化输出
      const outputJson = JSON.stringify(output, null, 2);
      setOutputData(outputJson);
      
      // 自动发送处理结果回Web端
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({
          type: 'send_to_web',
          output: outputJson
        }));
      }
      
    } catch (error) {
      console.error('处理输入数据错误:', error);
      const errorOutput = {
        sequence_num: 0,
        result: -1,
        function: 'unknown',
        return: -1,
        output_parameters: {
          error: error.message
        }
      };
      const errorJson = JSON.stringify(errorOutput, null, 2);
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

  const handleReceiveParams = async () => {
    try {
      setLoading(true);
      
      // 配置本地服务器API地址 - 自动从config.json更新
      const apiUrl = 'http://172.29.2.4:3000/api/current-params';
      
      // 请求API获取参数
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const jsonData = await response.json();
      
      // 显示服务器返回的input
      setInputData(jsonData.input || '');
      // 将input内容自动填充到output（便于测试）
      setOutputData(jsonData.input || '');
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setInputData(`Error: ${error.message}`);
      setOutputData('');
    } finally {
      setLoading(false);
    }
  };

  const handleSendParams = async () => {
    try {
      setLoading(true);
      
      // 配置本地服务器API地址 - 自动从config.json更新
      const apiUrl = 'http://172.29.2.4:3000/api/current-params';
      
      // 将当前output发送到服务器
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: inputData,
          output: outputData
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // 显示成功提示
        setOutputData(outputData + '\n\n✅ 参数已发送到服务器');
        setTimeout(() => {
          setOutputData(outputData);
        }, 2000);
      }
      
    } catch (error) {
      console.error('Error sending data:', error);
      setOutputData(outputData + `\n\n❌ 发送失败: ${error.message}`);
    } finally {
      setLoading(false);
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
            <Text style={styles.appInfoText}>接口: {WS_URL}</Text>
          </View>
          
          {/* WebSocket状态指示和重连按钮 */}
          <View style={styles.statusContainer}>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, wsConnected && styles.statusDotConnected]} />
              <Text style={styles.statusText}>
                {reconnecting ? '正在重连...' : (wsConnected ? 'WebSocket已连接' : 'WebSocket断开')}
              </Text>
            </View>
            
            <TouchableOpacity
              style={[styles.reconnectButton, reconnecting && styles.reconnectButtonDisabled]}
              onPress={handleReconnect}
              disabled={reconnecting}
            >
              {reconnecting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.reconnectButtonText}>
                  {wsConnected ? '重新连接' : '立即连接'}
                </Text>
              )}
            </TouchableOpacity>
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
  reconnectButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  reconnectButtonDisabled: {
    backgroundColor: '#999',
    opacity: 0.6,
  },
  reconnectButtonText: {
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
  },
  textViewScroll: {
    // 不使用ScrollView，直接显示
  },
  textViewContent: {
    fontSize: 11,
    color: '#333',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
});
