#!/usr/bin/env python3
"""
NAL2 WebSocket Python Client Demo

这个脚本演示了如何使用Python连接到NAL2 WebSocket服务器，
发送input参数并接收处理结果。

使用前请确保：
1. 安装依赖: pip install websocket-client
2. WebSocket服务器正在运行 (默认 ws://172.29.1.253:3000)
3. App端已连接并准备好处理请求
"""

import websocket
import json
import time
import sys
import threading
from typing import Optional, Callable


class NAL2WebSocketClient:
    """NAL2 WebSocket客户端"""
    
    def __init__(self, url: str = "ws://172.29.1.253:3000", client_type: str = "web"):
        """
        初始化WebSocket客户端
        
        Args:
            url: WebSocket服务器地址
            client_type: 客户端类型 ("web" 或 "app")
        """
        self.url = url
        self.client_type = client_type
        self.ws: Optional[websocket.WebSocketApp] = None
        self.connected = False
        self.registered = False
        self.response_callback: Optional[Callable] = None
        self.reconnect_attempts = 0
        self.max_reconnect_attempts = 10
        
    def on_open(self, ws):
        """连接建立时的回调"""
        print(f"✅ WebSocket已连接到 {self.url}")
        self.connected = True
        self.reconnect_attempts = 0
        
        # 注册客户端
        register_msg = {
            "type": "register",
            "client": self.client_type
        }
        ws.send(json.dumps(register_msg))
        print(f"📤 发送注册消息: client={self.client_type}")
        
    def on_message(self, ws, message):
        """接收消息时的回调"""
        try:
            data = json.loads(message)
            msg_type = data.get('type')
            
            print(f"📨 收到消息: type={msg_type}")
            
            if msg_type == 'registered':
                self.registered = True
                print(f"✅ 已注册为 {data.get('client')} 客户端")
                
            elif msg_type == 'receive_output':
                # 收到处理结果
                output = data.get('output')
                print("=" * 60)
                print("📥 收到处理结果:")
                print(output)
                print("=" * 60)
                
                # 调用回调函数
                if self.response_callback:
                    self.response_callback(output)
                    
            elif msg_type == 'error':
                error_msg = data.get('message', '未知错误')
                print(f"❌ 服务器错误: {error_msg}")
                
            elif msg_type == 'process_input':
                # 如果是App客户端，需要处理input
                if self.client_type == 'app':
                    input_data = data.get('input')
                    print(f"📥 收到处理请求:")
                    print(input_data)
                    
                    # 这里应该调用实际的处理逻辑
                    # 示例：直接返回输入
                    output = self.process_input(input_data)
                    
                    # 发送结果
                    self.send_output(output)
                    
        except json.JSONDecodeError as e:
            print(f"❌ JSON解析错误: {e}")
        except Exception as e:
            print(f"❌ 处理消息时出错: {e}")
            
    def on_error(self, ws, error):
        """错误时的回调"""
        print(f"❌ WebSocket错误: {error}")
        
    def on_close(self, ws, close_status_code, close_msg):
        """连接关闭时的回调"""
        print(f"⚠️  连接已关闭 [code={close_status_code}] {close_msg or ''}")
        self.connected = False
        self.registered = False
        
        # 自动重连
        if self.reconnect_attempts < self.max_reconnect_attempts:
            self.reconnect_attempts += 1
            delay = min(2 ** self.reconnect_attempts, 30)
            print(f"🔄 {delay}秒后尝试重连 (尝试 {self.reconnect_attempts}/{self.max_reconnect_attempts})...")
            time.sleep(delay)
            self.connect()
        else:
            print("❌ 达到最大重连次数，停止重连")
            
    def connect(self):
        """建立WebSocket连接"""
        print(f"🔌 正在连接到 {self.url}...")
        self.ws = websocket.WebSocketApp(
            self.url,
            on_open=self.on_open,
            on_message=self.on_message,
            on_error=self.on_error,
            on_close=self.on_close
        )
        
        # 在新线程中运行
        wst = threading.Thread(target=self.ws.run_forever)
        wst.daemon = True
        wst.start()
        
        # 等待连接建立
        timeout = 5
        start_time = time.time()
        while not self.registered and time.time() - start_time < timeout:
            time.sleep(0.1)
            
        if not self.registered:
            print("⚠️  连接超时")
            return False
            
        return True
        
    def send_input(self, input_data: str, callback: Optional[Callable] = None):
        """
        发送input给App处理
        
        Args:
            input_data: 输入参数（JSON字符串）
            callback: 接收结果的回调函数
        """
        if not self.connected or not self.registered:
            print("❌ 未连接到服务器")
            return False
            
        if self.client_type != "web":
            print("❌ 只有web客户端可以发送input")
            return False
            
        self.response_callback = callback
        
        message = {
            "type": "send_to_app",
            "input": input_data
        }
        
        try:
            self.ws.send(json.dumps(message))
            print("📤 已发送input给App处理")
            return True
        except Exception as e:
            print(f"❌ 发送失败: {e}")
            return False
            
    def send_output(self, output_data: str):
        """
        发送处理结果给Web
        
        Args:
            output_data: 输出结果（JSON字符串）
        """
        if not self.connected or not self.registered:
            print("❌ 未连接到服务器")
            return False
            
        if self.client_type != "app":
            print("❌ 只有app客户端可以发送output")
            return False
            
        message = {
            "type": "send_to_web",
            "output": output_data
        }
        
        try:
            self.ws.send(json.dumps(message))
            print("📤 已发送output给Web")
            return True
        except Exception as e:
            print(f"❌ 发送失败: {e}")
            return False
            
    def process_input(self, input_data: str) -> str:
        """
        处理input数据（App客户端需要实现此方法）
        
        Args:
            input_data: 输入参数
            
        Returns:
            处理后的结果
        """
        # 这里应该实现实际的处理逻辑
        # 示例：解析JSON，调用NAL2函数，返回结果
        print("⚙️  处理input...")
        
        try:
            input_obj = json.loads(input_data)
            function_name = input_obj.get('function', 'unknown')
            print(f"   函数: {function_name}")
            
            # TODO: 在这里调用实际的NAL2处理逻辑
            # 示例返回
            output_obj = {
                "sequence_num": input_obj.get('sequence_num'),
                "result": 0,
                "function": function_name,
                "return": 0,
                "output_parameters": {
                    "processed": True,
                    "message": "Processed by Python client"
                }
            }
            
            return json.dumps(output_obj, indent=2)
            
        except Exception as e:
            print(f"❌ 处理失败: {e}")
            # 返回错误结果
            error_output = {
                "result": -1,
                "error": str(e)
            }
            return json.dumps(error_output)
            
    def close(self):
        """关闭连接"""
        if self.ws:
            self.ws.close()
            print("🔌 连接已关闭")


def demo_web_client():
    """演示Web客户端用法"""
    print("\n" + "=" * 60)
    print("🌐 Web客户端Demo - 发送input并接收结果")
    print("=" * 60 + "\n")
    
    # 创建Web客户端
    client = NAL2WebSocketClient(url="ws://172.29.1.253:3000", client_type="web")
    
    # 连接
    if not client.connect():
        print("连接失败")
        return
        
    # 准备输入参数（NAL2函数调用示例）
    input_data = {
        "sequence_num": 123,
        "function": "RealEarInsertionGain_NL2",
        "input_parameters": {
            "AC": [35, 45, 40, 40, 65, 70, 70, 65, 55],
            "BC": [35, 45, 40, 40, 65, 70, 999, 999, 999],
            "L": 52,
            "limiting": 2,
            "channels": 18,
            "direction": 0,
            "mic": 1,
            "ACother": [35, 45, 40, 40, 65, 70, 70, 65, 55],
            "noOfAids": 1
        }
    }
    
    input_json = json.dumps(input_data, indent=2)
    
    print("📋 准备发送的参数:")
    print(input_json)
    print()
    
    # 定义结果回调函数
    result_received = threading.Event()
    
    def on_result(output):
        print("\n✅ 处理完成！")
        result_received.set()
    
    # 发送请求
    client.send_input(input_json, callback=on_result)
    
    # 等待结果（最多30秒）
    print("⏳ 等待App处理结果...")
    if result_received.wait(timeout=30):
        print("\n✨ Demo完成")
    else:
        print("\n⚠️  等待超时，可能App未连接")
    
    # 保持连接一段时间以查看结果
    time.sleep(2)
    
    # 关闭连接
    client.close()


def demo_app_client():
    """演示App客户端用法"""
    print("\n" + "=" * 60)
    print("📱 App客户端Demo - 接收input并返回结果")
    print("=" * 60 + "\n")
    
    # 创建App客户端
    client = NAL2WebSocketClient(url="ws://172.29.1.253:3000", client_type="app")
    
    # 连接
    if not client.connect():
        print("连接失败")
        return
        
    print("✅ App客户端已就绪，等待处理请求...")
    print("💡 提示: 在Web界面发送请求或使用其他客户端发送")
    print("按 Ctrl+C 退出\n")
    
    try:
        # 保持运行
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n👋 退出...")
        client.close()


def main():
    """主函数"""
    print("""
╔═══════════════════════════════════════════════════════════════╗
║          NAL2 WebSocket Python Client Demo                    ║
╚═══════════════════════════════════════════════════════════════╝
    """)
    
    print("请选择客户端类型:")
    print("1. Web客户端 (发送input，接收output)")
    print("2. App客户端 (接收input，发送output)")
    print("0. 退出")
    print()
    
    choice = input("请输入选择 (0-2): ").strip()
    
    if choice == "1":
        demo_web_client()
    elif choice == "2":
        demo_app_client()
    elif choice == "0":
        print("👋 再见!")
    else:
        print("❌ 无效的选择")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 程序已退出")
    except Exception as e:
        print(f"\n❌ 发生错误: {e}")
        import traceback
        traceback.print_exc()
