import React from 'react';
import HttpServerScreen from './components/HttpServerScreen';

/**
 * FuncApp4NAL2 - 新架构
 * 
 * App 作为服务器模式:
 * - App 启动时自动创建 WebSocket 服务器
 * - App 提供 HTTP API 接口
 * - Web 端作为客户端连接 App
 * - Web 端通过扫描或手动输入连接 App
 * 
 * 优点:
 * - 简化架构，无需独立服务器
 * - App 端完全自主，不依赖外部服务
 * - 更灵活的部署方式
 */
export default function App() {
  return <HttpServerScreen />;
}
