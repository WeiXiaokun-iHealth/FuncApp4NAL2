# NAL2 参数管理服务器

这是一个本地 HTTP 服务器，用于管理 NAL2 参数。支持局域网访问，提供 Web 界面和 API 接口。

## 🚀 快速开始

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 启动服务器

```bash
npm start
```

**✨ 启动时自动功能**：

- 自动检测当前电脑的 IP 地址
- 自动更新 `config.json` 配置文件
- 自动更新 App.js 中的所有 IP 配置（WebSocket URL 和 API URLs）

或使用 nodemon 自动重启（开发模式）：

```bash
npm run dev
```

### 3. 访问

服务器启动后，可以通过以下方式访问：

- **本地访问**: http://localhost:3000
- **局域网访问**: http://你的 IP 地址:3000
- **App API**: http://你的 IP 地址:3000/api/current-params

## 📡 API 接口

### 获取当前参数

```
GET /api/current-params
```

返回示例：

```json
{
  "input": "参数内容...",
  "output": "处理结果..."
}
```

### 设置当前参数

```
POST /api/current-params
Content-Type: application/json

{
  "input": "参数内容...",
  "output": "处理结果..."
}
```

### 获取历史记录

```
GET /api/history
```

### 保存到历史

```
POST /api/history
Content-Type: application/json

{
  "input": "参数内容...",
  "output": "处理结果...",
  "name": "记录名称（可选）"
}
```

### 更新历史记录

```
PUT /api/history/:id
Content-Type: application/json

{
  "input": "更新的参数...",
  "output": "更新的结果...",
  "name": "新名称（可选）"
}
```

### 删除历史记录

```
DELETE /api/history/:id
```

## 🌐 Web 界面功能

访问 http://localhost:3000 可以看到 Web 管理界面：

- **Input 输入框**: 输入 NAL2 参数（JSON 格式）
- **Output 输出框**: 显示处理结果（JSON 格式）
- **保存到历史**: 将当前参数保存到历史记录
- **设置为当前参数**: 将当前参数设为活动参数（供 App 调用）
- **历史记录列表**: 右侧显示所有历史记录
  - 点击记录可加载到输入框
  - 可更新现有记录
  - 可删除不需要的记录

## 📱 与 App 集成

1. 确保手机和电脑在同一局域网
2. 获取电脑的 IP 地址
3. 在 App 中配置 API 地址：`http://你的IP:3000/api/current-params`
4. App 点击"接收参数"按钮即可获取当前参数

## 💾 数据存储

数据存储在 `server/data.json` 文件中，包括：

- 当前活动参数
- 历史记录（最多 50 条）

## 🔧 配置

可以在 `server.js` 中修改：

- `PORT`: 服务器端口（默认 3000）
- 历史记录数量限制（默认 50 条）

## 📝 注意事项

1. 服务器需要保持运行状态才能提供服务
2. 确保防火墙允许 3000 端口的访问
3. JSON 格式的参数需要正确格式化
4. 数据存储在本地文件，服务器重启数据不会丢失
