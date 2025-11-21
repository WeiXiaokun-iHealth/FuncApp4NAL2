package com.funcapp4nal2;

import android.content.Context;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import com.nal2.Nal2Module;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import javax.annotation.Nonnull;

/**
 * 简单的HTTP服务器模块 - 不使用WebSocket
 * App作为HTTP服务器，Web端通过HTTP POST请求调用NAL2功能
 */
public class HttpServerModule extends ReactContextBaseJavaModule {
    private static final String TAG = "HttpServerModule";
    private static final String MODULE_NAME = "HttpServerModule";

    private final ReactApplicationContext reactContext;
    private ServerSocket serverSocket;
    private ExecutorService executorService;
    private Thread serverThread;
    private boolean isRunning = false;
    private int serverPort = 8080;
    private Nal2Module nal2Module;

    public HttpServerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.nal2Module = new Nal2Module(reactContext);
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
     * 启动HTTP服务器
     */
    @ReactMethod
    public void startServer(int port, Promise promise) {
        if (isRunning) {
            Log.d(TAG, "服务器已在运行: " + serverPort);
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putInt("port", serverPort);
            result.putString("ipAddress", getLocalIpAddress());
            promise.resolve(result);
            return;
        }

        try {
            serverPort = port;

            // 创建ServerSocket
            serverSocket = new ServerSocket();
            serverSocket.setReuseAddress(true);
            serverSocket.bind(new InetSocketAddress(port));

            // 创建线程池
            executorService = Executors.newFixedThreadPool(10);

            isRunning = true;

            Log.d(TAG, "HTTP服务器启动成功: " + getLocalIpAddress() + ":" + port);

            // 在后台线程中接受连接
            serverThread = new Thread(new ServerRunnable());
            serverThread.start();

            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putInt("port", port);
            result.putString("ipAddress", getLocalIpAddress());

            promise.resolve(result);

        } catch (IOException e) {
            Log.e(TAG, "启动服务器失败", e);

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
            isRunning = false;

            if (serverSocket != null && !serverSocket.isClosed()) {
                serverSocket.close();
            }

            if (executorService != null) {
                executorService.shutdown();
            }

            if (serverThread != null) {
                serverThread.interrupt();
            }

            Log.d(TAG, "服务器已停止");

            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            promise.resolve(result);

        } catch (Exception e) {
            Log.e(TAG, "停止服务器失败", e);
            promise.reject("STOP_SERVER_ERROR", e.getMessage(), e);
        }
    }

    /**
     * 获取服务器状态
     */
    @ReactMethod
    public void getServerStatus(Promise promise) {
        WritableMap status = Arguments.createMap();
        status.putBoolean("isRunning", isRunning);
        status.putInt("port", serverPort);
        status.putString("ipAddress", getLocalIpAddress());
        promise.resolve(status);
    }

    // 辅助方法：发送JSON响应
    private void sendJSONResponse(OutputStream out, int statusCode, String json) throws IOException {
        byte[] jsonBytes = json.getBytes(StandardCharsets.UTF_8);

        PrintWriter writer = new PrintWriter(out, true);
        writer.println("HTTP/1.1 " + statusCode + " OK");
        writer.println("Content-Type: application/json; charset=utf-8");
        writer.println("Content-Length: " + jsonBytes.length);
        writer.println("Access-Control-Allow-Origin: *");
        writer.println("Connection: close");
        writer.println();
        writer.flush();

        out.write(jsonBytes);
        out.flush();
    }

    /**
     * 获取本地IP地址
     */
    private String getLocalIpAddress() {
        try {
            // 尝试获取WiFi IP
            WifiManager wifiManager = (WifiManager) reactContext.getApplicationContext()
                    .getSystemService(Context.WIFI_SERVICE);
            if (wifiManager != null) {
                WifiInfo wifiInfo = wifiManager.getConnectionInfo();
                int ipAddress = wifiInfo.getIpAddress();

                if (ipAddress != 0) {
                    return String.format("%d.%d.%d.%d",
                            (ipAddress & 0xff),
                            (ipAddress >> 8 & 0xff),
                            (ipAddress >> 16 & 0xff),
                            (ipAddress >> 24 & 0xff));
                }
            }

            // 如果WiFi获取失败，尝试遍历所有网络接口
            java.util.Enumeration<java.net.NetworkInterface> interfaces = java.net.NetworkInterface
                    .getNetworkInterfaces();

            while (interfaces.hasMoreElements()) {
                java.net.NetworkInterface ni = interfaces.nextElement();
                java.util.Enumeration<java.net.InetAddress> addresses = ni.getInetAddresses();

                while (addresses.hasMoreElements()) {
                    java.net.InetAddress addr = addresses.nextElement();

                    if (!addr.isLoopbackAddress() && addr instanceof java.net.Inet4Address) {
                        return addr.getHostAddress();
                    }
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "获取IP地址失败", e);
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
     * 服务器运行线程
     */
    private class ServerRunnable implements Runnable {
        @Override
        public void run() {
            Log.d(TAG, "服务器线程启动");

            while (isRunning && serverSocket != null && !serverSocket.isClosed()) {
                try {
                    Socket clientSocket = serverSocket.accept();
                    Log.d(TAG, "接受新连接: " + clientSocket.getRemoteSocketAddress());

                    // 在线程池中处理请求
                    executorService.execute(new HttpRequestHandler(clientSocket));

                } catch (IOException e) {
                    if (isRunning) {
                        Log.e(TAG, "接受连接失败", e);
                    }
                }
            }

            Log.d(TAG, "服务器线程退出");
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
                        new InputStreamReader(clientSocket.getInputStream(), StandardCharsets.UTF_8));
                OutputStream out = clientSocket.getOutputStream();

                // 读取请求行
                String requestLine = in.readLine();
                if (requestLine == null) {
                    clientSocket.close();
                    return;
                }

                Log.d(TAG, "收到请求: " + requestLine);

                String[] requestParts = requestLine.split(" ");
                if (requestParts.length < 2) {
                    sendError(out, 400, "Bad Request");
                    return;
                }

                String method = requestParts[0];
                String path = requestParts[1];

                // 读取请求头
                int contentLength = 0;
                String line;
                while ((line = in.readLine()) != null && !line.isEmpty()) {
                    if (line.startsWith("Content-Length:")) {
                        contentLength = Integer.parseInt(line.substring(15).trim());
                    }
                }

                // 读取请求体
                String body = "";
                if (contentLength > 0) {
                    char[] bodyChars = new char[contentLength];
                    int read = in.read(bodyChars, 0, contentLength);
                    body = new String(bodyChars, 0, read);
                }

                Log.d(TAG, "请求体: " + body);

                // 处理不同的路径
                if (path.equals("/api/nal2/process") || path.equals("/api/nal2")) {
                    if (method.equals("POST")) {
                        // NAL2请求：不在这里关闭socket，等RN处理完后再关闭
                        handleNAL2Request(clientSocket, out, body);
                        return; // 不执行finally块
                    } else if (method.equals("OPTIONS")) {
                        handleCORS(out);
                    } else {
                        sendError(out, 405, "Method Not Allowed");
                    }
                } else if (path.equals("/") || path.equals("/health")) {
                    handleHealthCheck(out);
                } else {
                    sendError(out, 404, "Not Found");
                }

            } catch (Exception e) {
                Log.e(TAG, "处理请求失败", e);
            } finally {
                // 只有非NAL2请求才在这里关闭socket
                try {
                    if (!clientSocket.isClosed()) {
                        clientSocket.close();
                    }
                } catch (IOException e) {
                    Log.e(TAG, "关闭连接失败", e);
                }
            }
        }

        private void handleNAL2Request(Socket socket, OutputStream out, String body) throws IOException {
            long startTime = System.currentTimeMillis();

            try {
                Log.d(TAG, "收到NAL2请求，请求体长度: " + body.length());

                // 使用Promise同步调用Nal2Module
                final String[] responseStr = new String[1];
                final Exception[] error = new Exception[1];
                final Object lock = new Object();
                final boolean[] completed = new boolean[1];

                Promise promise = new Promise() {
                    @Override
                    public void resolve(Object value) {
                        synchronized (lock) {
                            responseStr[0] = value.toString();
                            completed[0] = true;
                            lock.notify();
                        }
                    }

                    @Override
                    public void reject(String code, String message) {
                        synchronized (lock) {
                            error[0] = new Exception(message);
                            completed[0] = true;
                            lock.notify();
                        }
                    }

                    @Override
                    public void reject(String code, String message, Throwable throwable) {
                        synchronized (lock) {
                            error[0] = new Exception(message, throwable);
                            completed[0] = true;
                            lock.notify();
                        }
                    }

                    @Override
                    public void reject(String code, Throwable throwable) {
                        synchronized (lock) {
                            error[0] = new Exception(throwable);
                            completed[0] = true;
                            lock.notify();
                        }
                    }

                    @Override
                    public void reject(Throwable throwable) {
                        synchronized (lock) {
                            error[0] = new Exception(throwable);
                            completed[0] = true;
                            lock.notify();
                        }
                    }

                    @Override
                    public void reject(String message) {
                        synchronized (lock) {
                            error[0] = new Exception(message);
                            completed[0] = true;
                            lock.notify();
                        }
                    }

                    @Override
                    public void reject(String code, String message, Throwable throwable, WritableMap userInfo) {
                        synchronized (lock) {
                            error[0] = new Exception(message, throwable);
                            completed[0] = true;
                            lock.notify();
                        }
                    }

                    @Override
                    public void reject(String code, String message, WritableMap userInfo) {
                        synchronized (lock) {
                            error[0] = new Exception(message);
                            completed[0] = true;
                            lock.notify();
                        }
                    }

                    @Override
                    public void reject(String code, Throwable throwable, WritableMap userInfo) {
                        synchronized (lock) {
                            error[0] = new Exception(throwable);
                            completed[0] = true;
                            lock.notify();
                        }
                    }

                    @Override
                    public void reject(String message, WritableMap userInfo) {
                        synchronized (lock) {
                            error[0] = new Exception(message);
                            completed[0] = true;
                            lock.notify();
                        }
                    }

                    @Override
                    public void reject(Throwable throwable, WritableMap userInfo) {
                        synchronized (lock) {
                            error[0] = new Exception(throwable);
                            completed[0] = true;
                            lock.notify();
                        }
                    }
                };

                // 调用Nal2Module的processRequestSync方法
                nal2Module.processRequestSync(body, promise);

                // 等待结果（最多30秒）
                synchronized (lock) {
                    if (!completed[0]) {
                        lock.wait(30000);
                    }
                }

                long processingTime = System.currentTimeMillis() - startTime;
                Log.d(TAG, "NAL2处理完成，耗时: " + processingTime + "ms");

                if (error[0] != null) {
                    throw error[0];
                }

                if (responseStr[0] == null) {
                    throw new Exception("处理超时");
                }

                // 发送响应
                sendJSONResponse(out, 200, responseStr[0]);

            } catch (Exception e) {
                Log.e(TAG, "处理NAL2请求失败", e);

                // 返回错误响应
                try {
                    JSONObject errorResponse = new JSONObject();
                    errorResponse.put("return", -1);
                    errorResponse.put("error", e.getMessage());
                    sendJSONResponse(out, 500, errorResponse.toString());
                } catch (Exception e2) {
                    sendError(out, 500, "Internal Server Error: " + e.getMessage());
                }
            } finally {
                // 关闭socket
                try {
                    socket.close();
                } catch (IOException e) {
                    Log.e(TAG, "关闭socket失败", e);
                }
            }
        }

        private void handleHealthCheck(OutputStream out) throws IOException {
            try {
                JSONObject response = new JSONObject();
                response.put("status", "ok");
                response.put("server", "FuncApp4NAL2");
                response.put("version", "2.0.0");

                sendJSONResponse(out, 200, response.toString());
            } catch (Exception e) {
                sendError(out, 500, "Internal Server Error");
            }
        }

        private void handleCORS(OutputStream out) throws IOException {
            PrintWriter writer = new PrintWriter(out, true);
            writer.println("HTTP/1.1 200 OK");
            writer.println("Access-Control-Allow-Origin: *");
            writer.println("Access-Control-Allow-Methods: GET, POST, OPTIONS");
            writer.println("Access-Control-Allow-Headers: Content-Type");
            writer.println("Content-Length: 0");
            writer.println();
            writer.flush();
        }

        private void sendError(OutputStream out, int statusCode, String message) throws IOException {
            String response = "{\"error\":\"" + message + "\"}";
            byte[] responseBytes = response.getBytes(StandardCharsets.UTF_8);

            PrintWriter writer = new PrintWriter(out, true);
            writer.println("HTTP/1.1 " + statusCode + " " + message);
            writer.println("Content-Type: application/json; charset=utf-8");
            writer.println("Content-Length: " + responseBytes.length);
            writer.println("Access-Control-Allow-Origin: *");
            writer.println("Connection: close");
            writer.println();
            writer.flush();

            out.write(responseBytes);
            out.flush();
        }
    }
}
