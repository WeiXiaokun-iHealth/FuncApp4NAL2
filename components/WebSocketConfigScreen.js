import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebSocketScanner } from '../utils/WebSocketScanner';

const WS_CONFIG_KEY = '@websocket_config';

export default function WebSocketConfigScreen({ onConfigComplete }) {
  const [scanning, setScanning] = useState(false);
  const [availableServers, setAvailableServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState(null);
  const [manualUrl, setManualUrl] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  useEffect(() => {
    // 自动开始快速扫描
    handleQuickScan();
  }, []);

  // 快速扫描常用地址
  const handleQuickScan = async () => {
    setScanning(true);
    try {
      console.log('开始快速扫描...');
      const servers = await WebSocketScanner.quickScan();
      console.log('扫描结果:', servers);
      setAvailableServers(servers);
      
      if (servers.length === 0) {
        Alert.alert(
          '未找到服务',
          '未找到可用的 WebSocket 服务，请尝试手动输入或完整扫描',
          [{ text: '确定' }]
        );
      }
    } catch (error) {
      console.error('快速扫描失败:', error);
      Alert.alert('扫描失败', error.message);
    } finally {
      setScanning(false);
    }
  };

  // 完整网络扫描
  const handleFullScan = async () => {
    Alert.alert(
      '完整扫描',
      '完整扫描可能需要较长时间，是否继续？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: async () => {
            setScanning(true);
            try {
              console.log('开始完整扫描...');
              const servers = await WebSocketScanner.scanNetwork(null, 1, 20);
              console.log('完整扫描结果:', servers);
              setAvailableServers(servers);
              
              if (servers.length === 0) {
                Alert.alert('未找到服务', '未找到可用的 WebSocket 服务');
              }
            } catch (error) {
              console.error('完整扫描失败:', error);
              Alert.alert('扫描失败', error.message);
            } finally {
              setScanning(false);
            }
          }
        }
      ]
    );
  };

  // 选择服务器
  const handleSelectServer = (server) => {
    setSelectedServer(server);
  };

  // 手动连接
  const handleManualConnect = async () => {
    if (!manualUrl.trim()) {
      Alert.alert('错误', '请输入 WebSocket 地址');
      return;
    }

    setScanning(true);
    try {
      // 验证URL格式
      let url = manualUrl.trim();
      if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
        url = `ws://${url}`;
      }

      console.log('测试手动输入的地址:', url);
      const isAvailable = await WebSocketScanner.testWebSocketURL(url);
      
      if (isAvailable) {
        const server = {
          url,
          name: `手动输入 (${url})`,
          status: 'available'
        };
        setSelectedServer(server);
        Alert.alert('成功', '连接测试成功！', [
          {
            text: '确定',
            onPress: () => handleConfirmConnection(server)
          }
        ]);
      } else {
        Alert.alert('连接失败', '无法连接到指定的 WebSocket 服务');
      }
    } catch (error) {
      console.error('手动连接测试失败:', error);
      Alert.alert('错误', error.message);
    } finally {
      setScanning(false);
    }
  };

  // 确认连接
  const handleConfirmConnection = async (server = selectedServer) => {
    if (!server) {
      Alert.alert('错误', '请选择一个服务器');
      return;
    }

    try {
      // 保存配置
      const config = {
        url: server.url,
        name: server.name,
        timestamp: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(WS_CONFIG_KEY, JSON.stringify(config));
      console.log('WebSocket 配置已保存:', config);
      
      // 通知父组件配置完成
      if (onConfigComplete) {
        onConfigComplete(config);
      }
    } catch (error) {
      console.error('保存配置失败:', error);
      Alert.alert('错误', '保存配置失败: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* 标题 */}
          <Text style={styles.title}>WebSocket 配置</Text>
          <Text style={styles.subtitle}>请选择或输入 WebSocket 服务地址</Text>

          {/* 扫描按钮 */}
          <View style={styles.scanButtons}>
            <TouchableOpacity
              style={[styles.scanButton, scanning && styles.scanButtonDisabled]}
              onPress={handleQuickScan}
              disabled={scanning}
            >
              <Text style={styles.scanButtonText}>
                {scanning ? '扫描中...' : '快速扫描'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.scanButton, styles.scanButtonSecondary, scanning && styles.scanButtonDisabled]}
              onPress={handleFullScan}
              disabled={scanning}
            >
              <Text style={styles.scanButtonText}>完整扫描</Text>
            </TouchableOpacity>
          </View>

          {/* 扫描状态 */}
          {scanning && (
            <View style={styles.scanningIndicator}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.scanningText}>正在扫描附近的服务...</Text>
            </View>
          )}

          {/* 可用服务列表 */}
          {availableServers.length > 0 && (
            <View style={styles.serverList}>
              <Text style={styles.sectionTitle}>
                找到 {availableServers.length} 个可用服务
              </Text>
              
              {availableServers.map((server, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.serverItem,
                    selectedServer?.url === server.url && styles.serverItemSelected
                  ]}
                  onPress={() => handleSelectServer(server)}
                >
                  <View style={styles.serverInfo}>
                    <Text style={styles.serverName}>{server.name}</Text>
                    <Text style={styles.serverUrl}>{server.url}</Text>
                  </View>
                  {selectedServer?.url === server.url && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* 手动输入 */}
          <View style={styles.manualSection}>
            <TouchableOpacity
              style={styles.manualToggle}
              onPress={() => setShowManualInput(!showManualInput)}
            >
              <Text style={styles.manualToggleText}>
                {showManualInput ? '▼' : '▶'} 手动输入地址
              </Text>
            </TouchableOpacity>

            {showManualInput && (
              <View style={styles.manualInput}>
                <TextInput
                  style={styles.input}
                  placeholder="例如: 192.168.1.100:3000"
                  value={manualUrl}
                  onChangeText={setManualUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={[styles.testButton, scanning && styles.testButtonDisabled]}
                  onPress={handleManualConnect}
                  disabled={scanning}
                >
                  <Text style={styles.testButtonText}>
                    {scanning ? '测试中...' : '测试连接'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* 确认按钮 */}
          {selectedServer && (
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => handleConfirmConnection()}
            >
              <Text style={styles.confirmButtonText}>确认并连接</Text>
            </TouchableOpacity>
          )}

          {/* 提示信息 */}
          <View style={styles.tips}>
            <Text style={styles.tipsTitle}>提示:</Text>
            <Text style={styles.tipsText}>
              • 确保手机和服务器在同一网络下{'\n'}
              • WebSocket 服务需要正在运行{'\n'}
              • 快速扫描会检查常用地址{'\n'}
              • 完整扫描会花费更长时间
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  scanButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  scanButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  scanButtonSecondary: {
    backgroundColor: '#5856D6',
  },
  scanButtonDisabled: {
    backgroundColor: '#999',
    opacity: 0.6,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scanningIndicator: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
  },
  scanningText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  serverList: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  serverItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  serverItemSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  serverInfo: {
    flex: 1,
  },
  serverName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  serverUrl: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'monospace',
  },
  checkmark: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  manualSection: {
    marginBottom: 20,
  },
  manualToggle: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
  },
  manualToggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
  },
  manualInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  testButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  testButtonDisabled: {
    backgroundColor: '#999',
    opacity: 0.6,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#FF9500',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  tips: {
    backgroundColor: '#FFF9E6',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#996600',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
});
