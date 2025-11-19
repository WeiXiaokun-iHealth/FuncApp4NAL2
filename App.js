import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WebSocketConfigScreen from './components/WebSocketConfigScreen';
import MainScreen from './components/MainScreen';

const WS_CONFIG_KEY = '@websocket_config';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [wsConfig, setWsConfig] = useState(null);
  const [showConfig, setShowConfig] = useState(false);

  // 加载保存的配置
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const savedConfig = await AsyncStorage.getItem(WS_CONFIG_KEY);
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        console.log('加载已保存的配置:', config);
        setWsConfig(config);
        setShowConfig(false);
      } else {
        console.log('未找到保存的配置，显示配置页面');
        setShowConfig(true);
      }
    } catch (error) {
      console.error('加载配置失败:', error);
      setShowConfig(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 配置完成处理
  const handleConfigComplete = (config) => {
    console.log('配置完成:', config);
    setWsConfig(config);
    setShowConfig(false);
  };

  // 重新配置处理
  const handleReconfigure = () => {
    console.log('重新配置');
    setWsConfig(null);
    setShowConfig(true);
  };

  // 加载中显示
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // 显示配置页面或主页面
  if (showConfig || !wsConfig) {
    return <WebSocketConfigScreen onConfigComplete={handleConfigComplete} />;
  }

  return <MainScreen wsConfig={wsConfig} onReconfigure={handleReconfigure} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
