package com.funcapp4nal2;

import android.content.Context;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.ByteBuffer;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import javax.annotation.Nonnull;

public class AppServerModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "AppServerModule";

    private final ReactApplicationContext reactContext;
    private NAL2WebSocketServer webSocketServer;
    private HttpServerThread httpServerThread;
    private int serverPort = 8080;
    private boolean isRunning = false;
    private Map<String, WebSocket> connectedClients = new HashMap<>();
    private int clientIdCounter = 0;

    public AppServerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Nonnull
    @Override
    public String getName() {
        return MODULE_NAME;
    }

    /**
     * 添加监听器（NativeEventEmitter需要）
     */
    @ReactMethod
    public void addListener(String eventName) {
        // Keep: 用于RN内置事件系统
    }

    /**
     * 移除监听器（NativeEventEmitter需要）
     */
    @ReactMethod
    public void removeListeners(Integer count) {
        // Keep: 用于RN内置事件系统
    }

    /**
     * 启动服务器（WebSocket + HTTP）
     */
    @ReactMethod
    public void startServer(int port, Promise promise) {
        if (isRunning) {
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putInt("port", serverPort);
            result.putString("ipAddress", getLocalIpAddress());
            promise.resolve(result);
            return;
        }

        try {
            serverPort = port;

            // 启动WebSocket服务器
            webSocketServer = new NAL2WebSocketServer(new InetSocketAddress(port));
            webSocketServer.start();

            // 启动HTTP服务器（在相同端口）
            httpServerThread = new HttpServerThread(port);
            httpServerThread.start();

            isRunning = true;

            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putInt("port", port);
            result.putString("ipAddress", getLocalIpAddress());

            promise.resolve(result);

        } catch (Exception e) {
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", false);
            result.putString("error", e.getMessage());
            promise.reject("START_SERVER_ERROR", e.getMessage(), e);
        }
    }

    /**
     * 停止服务器
     */
    @ReactMethod
    public void stopServer(Promise promise) {
        try {
            if (webSocketServer != null) {
                webSocketServer.stop();
                webSocketServer = null;
            }

            if (httpServerThread != null) {
                httpServerThread.stopServer();
                httpServerThread = null;
            }

            connectedClients.clear();
            isRunning = false;

            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            promise.resolve(result);

        } catch (Exception e) {
            promise.reject("STOP_SERVER_ERROR", e.getMessage(), e);
        }
    }

    /**
     * 发送WebSocket消息给指定客户端
     */
    @ReactMethod
    public void sendWebSocketMessage(String clientId, String message, Promise promise) {
        try {
            WebSocket client = connectedClients.get(clientId);
            if (client != null && client.isOpen()) {
                client.send(message);
                promise.resolve(true);
            } else {
                promise.reject("SEND_ERROR", "Client not found or disconnected");
            }
        } catch (Exception e) {
            promise.reject("SEND_ERROR", e.getMessage(), e);
        }
    }

    /**
     * 广播消息给所有客户端
     */
    @ReactMethod
    public void broadcastWebSocketMessage(String message, Promise promise) {
        try {
            if (webSocketServer != null) {
                webSocketServer.broadcast(message);
                promise.resolve(true);
            } else {
                promise.reject("BROADCAST_ERROR", "Server not running");
            }
        } catch (Exception e) {
            promise.reject("BROADCAST_ERROR", e.getMessage(), e);
        }
    }

    /**
     * 发送HTTP响应
     */
    @ReactMethod
    public void sendHttpResponse(String requestId, ReadableMap response, Promise promise) {
        // HTTP响应通过HttpServerThread处理
        promise.resolve(true);
    }

    /**
     * 获取服务器状态
     */
    @ReactMethod
    public void getServerStatus(Promise promise) {
        WritableMap status = Arguments.createMap();
        status.putBoolean("isRunning", isRunning);
        status.putInt("port", serverPort);
        status.putInt("connections", connectedClients.size());
        status.putString("ipAddress", getLocalIpAddress());
        promise.resolve(status);
    }

    /**
     * 获取本地IP地址
     */
    private String getLocalIpAddress() {
        try {
            WifiManager wifiManager = (WifiManager) reactContext.getApplicationContext()
                    .getSystemService(Context.WIFI_SERVICE);
            if (wifiManager != null) {
                WifiInfo wifiInfo = wifiManager.getConnectionInfo();
                int ipAddress = wifiInfo.getIpAddress();
                return String.format("%d.%d.%d.%d",
                        (ipAddress & 0xff),
                        (ipAddress >> 8 & 0xff),
                        (ipAddress >> 16 & 0xff),
                        (ipAddress >> 24 & 0xff));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "Unknown";
    }

    /**
     * 发送事件到React Native
     */
    private void sendEvent(String eventName, WritableMap params) {
        if (reactContext.hasActiveCatalystInstance()) {
            reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(eventName, params);
        }
    }

    /**
     * WebSocket服务器实现
     */
    private class NAL2WebSocketServer extends WebSocketServer {
        public NAL2WebSocketServer(InetSocketAddress address) {
            super(address);
        }

        @Override
        public void onOpen(WebSocket conn, ClientHandshake handshake) {
            String clientId = "client_" + (++clientIdCounter);
            connectedClients.put(clientId, conn);
            conn.setAttachment(clientId);

            WritableMap params = Arguments.createMap();
            params.putString("clientId", clientId);
            sendEvent("onClientConnected", params);
        }

        @Override
        public void onClose(WebSocket conn, int code, String reason, boolean remote) {
            String clientId = conn.getAttachment();
            if (clientId != null) {
                connectedClients.remove(clientId);

                WritableMap params = Arguments.createMap();
                params.putString("clientId", clientId);
                sendEvent("onClientDisconnected", params);
            }
        }

        @Override
        public void onMessage(WebSocket conn, String message) {
            String clientId = conn.getAttachment();

            WritableMap params = Arguments.createMap();
            params.putString("clientId", clientId);
            params.putString("message", message);
            sendEvent("onWebSocketMessage", params);
        }

        @Override
        public void onMessage(WebSocket conn, ByteBuffer message) {
            // Handle binary messages if needed
        }

        @Override
        public void onError(WebSocket conn, Exception ex) {
            ex.printStackTrace();
        }

        @Override
        public void onStart() {
            System.out.println("WebSocket server started successfully");
        }
    }

    /**
     * HTTP服务器线程
     */
    private class HttpServerThread extends Thread {
        private ServerSocket serverSocket;
        private boolean running = true;
        private ExecutorService executorService = Executors.newFixedThreadPool(10);

        public HttpServerThread(int port) throws IOException {
            this.serverSocket = new ServerSocket(port + 1); // HTTP在不同端口
        }

        @Override
        public void run() {
            while (running) {
                try {
                    Socket clientSocket = serverSocket.accept();
                    executorService.execute(new HttpRequestHandler(clientSocket));
                } catch (IOException e) {
                    if (running) {
                        e.printStackTrace();
                    }
                }
            }
        }

        public void stopServer() {
            running = false;
            try {
                if (serverSocket != null && !serverSocket.isClosed()) {
                    serverSocket.close();
                }
                executorService.shutdown();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * HTTP请求处理器
     */
    private class HttpRequestHandler implements Runnable {
        private Socket clientSocket;

        public HttpRequestHandler(Socket socket) {
            this.clientSocket = socket;
        }

        @Override
        public void run() {
            try {
                BufferedReader in = new BufferedReader(
                        new InputStreamReader(clientSocket.getInputStream()));
                OutputStream out = clientSocket.getOutputStream();

                // 读取HTTP请求
                String requestLine = in.readLine();
                if (requestLine == null)
                    return;

                String[] requestParts = requestLine.split(" ");
                String method = requestParts[0];
                String path = requestParts[1];

                // 读取请求头
                StringBuilder headers = new StringBuilder();
                String line;
                int contentLength = 0;
                while ((line = in.readLine()) != null && !line.isEmpty()) {
                    headers.append(line).append("\n");
                    if (line.startsWith("Content-Length:")) {
                        contentLength = Integer.parseInt(line.substring(15).trim());
                    }
                }

                // 读取请求体
                String body = "";
                if (contentLength > 0) {
                    char[] bodyChars = new char[contentLength];
                    in.read(bodyChars, 0, contentLength);
                    body = new String(bodyChars);
                }

                // 触发HTTP请求事件
                WritableMap params = Arguments.createMap();
                params.putString("requestId", String.valueOf(System.currentTimeMillis()));
                params.putString("method", method);
                params.putString("path", path);
                params.putString("body", body);
                sendEvent("onHttpRequest", params);

                // 发送简单响应（实际响应由JS层处理）
                String response = "HTTP/1.1 200 OK\r\n" +
                        "Content-Type: application/json\r\n" +
                        "Access-Control-Allow-Origin: *\r\n" +
                        "\r\n" +
                        "{\"status\":\"received\"}";
                out.write(response.getBytes());
                out.flush();

            } catch (IOException e) {
                e.printStackTrace();
            } finally {
                try {
                    clientSocket.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
