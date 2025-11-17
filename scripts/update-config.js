#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * 获取当前设备的WiFi IP地址
 * @returns {string|null} IP地址或null
 */
function getCurrentIP() {
  const interfaces = os.networkInterfaces();
  
  // 优先查找WiFi接口 (en0在macOS上通常是WiFi)
  const wifiInterfaces = ['en0', 'en1', 'Wi-Fi', 'WLAN'];
  
  for (const name of wifiInterfaces) {
    if (interfaces[name]) {
      for (const iface of interfaces[name]) {
        // 只获取IPv4地址，排除内部地址
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  }
  
  // 如果没找到WiFi接口，查找其他非内部IPv4地址
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return null;
}

// 读取配置文件
const configPath = path.join(__dirname, '..', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// 获取当前IP地址
const currentIP = getCurrentIP();

if (currentIP) {
  console.log(`🔍 检测到当前IP地址: ${currentIP}`);
  
  if (config.serverIP !== currentIP) {
    console.log(`📝 更新config.json中的IP: ${config.serverIP} -> ${currentIP}`);
    config.serverIP = currentIP;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  } else {
    console.log(`✅ config.json中的IP已是最新`);
  }
} else {
  console.log('⚠️  未检测到可用IP地址，使用config.json中的配置');
}

const { serverIP, serverPort, metroPort } = config;

console.log('📝 更新配置中...');
console.log(`   服务器IP: ${serverIP}`);
console.log(`   服务器端口: ${serverPort}`);
console.log(`   Metro端口: ${metroPort}`);

// 更新App.js
const appJsPath = path.join(__dirname, '..', 'App.js');
let appJsContent = fs.readFileSync(appJsPath, 'utf8');

let updateCount = 0;

// 1. 更新WebSocket URL
const wsUrlPattern = /const WS_URL = ['"]ws:\/\/[\d\.]+:\d+['"];/;
const newWsUrl = `const WS_URL = 'ws://${serverIP}:${serverPort}';`;

if (wsUrlPattern.test(appJsContent)) {
  appJsContent = appJsContent.replace(wsUrlPattern, newWsUrl);
  updateCount++;
  console.log(`✅ 更新 WS_URL: ws://${serverIP}:${serverPort}`);
}

// 2. 更新所有 API URL（使用全局替换）
// 匹配 http://IP:端口 的格式
const apiUrlPattern = /http:\/\/[\d\.]+:\d+/g;
const newApiUrl = `http://${serverIP}:${serverPort}`;

const matches = appJsContent.match(apiUrlPattern);
if (matches && matches.length > 0) {
  appJsContent = appJsContent.replace(apiUrlPattern, newApiUrl);
  updateCount += matches.length;
  console.log(`✅ 更新 ${matches.length} 个 API URL: ${newApiUrl}`);
}

if (updateCount > 0) {
  fs.writeFileSync(appJsPath, appJsContent);
  console.log(`✅ App.js 已更新（共 ${updateCount} 处）`);
} else {
  console.log('⚠️  App.js 中未找到需要更新的 IP 配置');
}

// server.js会在启动时自动从config.json读取配置，无需手动更新
console.log('✅ server.js 会自动读取config.json');

console.log('\n🎉 配置更新完成！');
console.log(`\n📱 App API地址: http://${serverIP}:${serverPort}/api/current-params`);
console.log(`🌐 Web界面地址: http://${serverIP}:${serverPort}`);
console.log(`🔧 Metro Bundler: http://${serverIP}:${metroPort}\n`);
