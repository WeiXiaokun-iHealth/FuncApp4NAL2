#!/usr/bin/env node

/**
 * WebSocket服务器连接测试工具
 * 
 * 使用方法:
 * node scripts/test-server-connection.js 172.29.2.68:8081
 */

const WebSocket = require('ws');

// 获取服务器地址
const serverAddress = process.argv[2] || '172.29.2.68:8081';
const wsUrl = serverAddress.startsWith('ws://') ? serverAddress : `ws://${serverAddress}`;

console.log('='.repeat(60));
console.log('WebSocket服务器连接测试');
console.log('='.repeat(60));
console.log(`目标地址: ${wsUrl}`);
console.log('');

// 测试开始时间
const startTime = Date.now();
let connectionAttempted = false;

// 创建WebSocket连接
console.log('⏳ 正在连接...');
const ws = new WebSocket(wsUrl, {
  handshakeTimeout: 5000
});

// 连接超时
const timeout = setTimeout(() => {
  if (!connectionAttempted) {
    console.log('❌ 连接超时（5秒）');
    console.log('');
    console.log('可能的原因:');
    console.log('1. IP地址或端口不正确');
    console.log('2. 手机和电脑不在同一局域网');
    console.log('3. 防火墙阻止连接');
    console.log('4. 服务器实际未启动');
    process.exit(1);
  }
}, 5000);

ws.on('open', () => {
  connectionAttempted = true;
  clearTimeout(timeout);
  const duration = Date.now() - startTime;
  
  console.log(`✅ 连接成功！（耗时: ${duration}ms）`);
  console.log('');
  console.log('📤 发送测试消息...');
  
  // 发送测试消息
  const testMessage = {
    type: 'nal2_request',
    data: {
      sequence_num: 1,
      function: 'dllVersion',
      input_parameters: {}
    }
  };
  
  ws.send(JSON.stringify(testMessage));
  console.log('已发送:', JSON.stringify(testMessage, null, 2));
  
  // 等待响应
  setTimeout(() => {
    console.log('');
    console.log('⚠️ 5秒内未收到响应');
    console.log('可能原因: 服务器未正确处理消息');
    ws.close();
    process.exit(0);
  }, 5000);
});

ws.on('message', (data) => {
  console.log('');
  console.log('📥 收到响应:');
  try {
    const parsed = JSON.parse(data);
    console.log(JSON.stringify(parsed, null, 2));
  } catch (e) {
    console.log(data.toString());
  }
  
  console.log('');
  console.log('✅ 测试成功！服务器工作正常。');
  ws.close();
  process.exit(0);
});

ws.on('error', (error) => {
  connectionAttempted = true;
  clearTimeout(timeout);
  
  console.log('❌ 连接错误:');
  console.log(error.message);
  console.log('');
  
  if (error.code === 'ECONNREFUSED') {
    console.log('错误分析: 连接被拒绝');
    console.log('可能原因:');
    console.log('1. 服务器未真正启动');
    console.log('2. 端口不正确');
    console.log('3. IP地址错误');
  } else if (error.code === 'ETIMEDOUT') {
    console.log('错误分析: 连接超时');
    console.log('可能原因:');
    console.log('1. 不在同一局域网');
    console.log('2. 防火墙阻止');
    console.log('3. 网络问题');
  } else if (error.code === 'EHOSTUNREACH') {
    console.log('错误分析: 主机不可达');
    console.log('可能原因:');
    console.log('1. IP地址错误');
    console.log('2. 设备不在线');
    console.log('3. 网络路由问题');
  }
  
  console.log('');
  console.log('解决建议:');
  console.log('1. 确认手机App显示的IP地址');
  console.log('2. 确保手机和电脑连接同一WiFi');
  console.log('3. 尝试ping手机IP: ping ' + serverAddress.split(':')[0]);
  console.log('4. 检查手机App是否显示"服务器运行中"');
  
  process.exit(1);
});

ws.on('close', (code, reason) => {
  if (!connectionAttempted) {
    console.log('❌ 连接关闭');
    if (reason) {
      console.log('原因:', reason.toString());
    }
  }
});

// 处理进程退出
process.on('SIGINT', () => {
  console.log('');
  console.log('测试中断');
  ws.close();
  process.exit(0);
});
