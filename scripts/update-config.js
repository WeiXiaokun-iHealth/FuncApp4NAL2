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
  if (config.serverIP !== currentIP) {
    config.serverIP = currentIP;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }
}

const { serverIP, serverPort } = config;

// 更新App.js
const appJsPath = path.join(__dirname, '..', 'App.js');
let appJsContent = fs.readFileSync(appJsPath, 'utf8');

// 1. 更新WebSocket URL
const wsUrlPattern = /const WS_URL = ['"]ws:\/\/[\d\.]+:\d+['"];/;
const newWsUrl = `const WS_URL = 'ws://${serverIP}:${serverPort}';`;

if (wsUrlPattern.test(appJsContent)) {
  appJsContent = appJsContent.replace(wsUrlPattern, newWsUrl);
}

// 2. 更新所有 API URL
const apiUrlPattern = /http:\/\/[\d\.]+:\d+/g;
const newApiUrl = `http://${serverIP}:${serverPort}`;
appJsContent = appJsContent.replace(apiUrlPattern, newApiUrl);

fs.writeFileSync(appJsPath, appJsContent);
