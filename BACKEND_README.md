# 🚀 智能数据库分析系统 - 后端文档

一个基于Python Flask和Anthropic Claude AI的智能数据库分析系统，支持CSV数据导入、AI智能分析、多轮对话和历史记录管理。

## 🚨 重要版本更新

### 🎯 **v1.1.3 新功能：AI自动标题生成**

**全新的对话体验：**
- ✨ **AI智能标题生成**：创建对话时无需手动输入标题，AI会根据您的第一条消息自动生成合适的标题
- 🎯 **智能降级机制**：AI生成 → 关键词映射 → 智能提取 → 时间戳，确保标题生成的可靠性
- 🎨 **前端体验优化**：简化对话创建流程，仅需输入可选的对话描述
- 🔄 **支持Claude Sonnet 4**：使用最新的AI模型进行标题生成

### ⚠️ **v1.1.1 重大变更：删除访客模式**

**从此版本开始，系统仅支持付费用户访问！**

#### 📋 必需字段
现在所有用户**必须**提供以下三个字段才能使用系统：
1. **用户ID** - 您的唯一标识符
2. **用户名** - 您的显示名称  
3. **API密钥** - 有效的Anthropic Claude API Key

#### 🔒 安全改进
- ✅ 删除了基于IP和User-Agent的临时访客ID生成
- ✅ 强制要求每个请求都提供API Key
- ✅ 添加了更严格的用户认证验证
- ✅ 提供了清晰的错误代码和消息

#### 💰 成本控制
- ✅ 每个API调用都有明确的成本归属
- ✅ 不再有"免费试用"或"访客模式"
- ✅ 确保所有API使用都可追溯到具体用户

#### 🖥️ 前端界面变更
- ✅ 添加了醒目的付费用户提醒横幅
- ✅ 所有输入框都标明"必需"
- ✅ 加强了API Key验证逻辑
- ✅ 统一了请求头构建方式

**⚠️ 迁移提醒：** 如果您之前使用访客模式，现在需要获取Anthropic API Key才能继续使用系统。

## 🌟 核心功能

- 📊 **智能数据分析**：基于Anthropic Claude AI的智能数据分析和洞察
- 🤖 **AI标题生成**：用户发送第一条消息时AI自动生成对话标题，支持智能降级机制
- 📁 **多格式文件支持**：支持CSV、Excel、JSON、TSV、TXT等多种文件格式
- 🔍 **数据质量评估**：智能检测数据质量问题，提供0-100分的综合评分
- 🧹 **自动数据清洗**：智能处理缺失值、重复数据、异常值等问题
- 🔗 **多表支持**：单次会话中可分析多个数据表，支持跨表查询
- 📋 **表结构查看**：直接获取表的详细结构信息，包含列定义、样本数据、统计信息
- 💬 **多轮对话**：支持与AI进行多轮对话，保持上下文连续性
- 📚 **对话历史管理**：完整的对话历史记录和管理功能
- 👥 **多用户支持**：支持多用户隔离，每个用户有独立的数据空间
- 🔄 **流式响应**：支持AI响应的流式输出，提升用户体验
- 🌐 **Web界面**：提供直观的Web测试界面

## 📁 项目结构

```
DataAnalyzer1.1/
├── backend/                    # 后端服务
│   ├── app.py                 # Flask主应用文件
│   ├── conversation_history.py # 对话历史管理
│   ├── datatest1_7_5.py       # 数据分析核心
│   ├── user_middleware.py     # 用户管理中间件
│   └── data/                  # 后端数据目录
├── data/                      # 用户数据存储目录
├── logs/                      # 系统日志目录
├── test_frontend.html         # Web测试界面
├── start.py                   # 系统启动脚本
├── requirements.txt           # Python依赖
├── .gitignore                # Git忽略文件
└── README.md                 # 项目文档
```

## ⚡ 快速开始

### 1. 环境要求

- Python 3.7+
- 现代浏览器（Chrome、Firefox、Edge等）
- Anthropic API密钥

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 环境配置

创建 `.env` 文件并添加以下配置：

```env
# 服务器配置
ANTHROPIC_BASE_URL=https://api.anthropic.com  # 可选，自定义API地址
HOST=0.0.0.0                                  # 服务器主机地址
PORT=5000                                     # 服务器端口

# 注意：不再支持全局API Key配置
# ANTHROPIC_API_KEY=sk-your-api-key-here  # 已完全移除
```

**🔑 重要变更（v1.1.1）：**
- ❌ **完全移除**全局共享的API Key支持
- ✅ **强制要求**每个用户在前端提供自己的API Key
- ✅ **访客模式已删除**，所有用户必须提供完整认证信息
- ✅ 确保数据隔离和成本控制

### 4. 启动系统

```bash
python start.py
```

启动后会自动：
- 启动Flask后端服务（http://localhost:5000）
- 打开Web测试界面（test_frontend.html）

### 🌐 云主机部署测试

如果您已将系统部署到云主机，可以使用专门的云主机测试页面：

- **云主机测试页面**: `test_frontend_cloud.html`
- **功能特点**:
  - 🚀 一键快速连接测试
  - 📊 实时响应时间监控
  - 🔧 详细的故障排查提示
  - 📋 完整的部署检查清单

## 🚀 使用指南

### 📱 Web界面使用

1. 启动系统后，浏览器会自动打开测试页面
2. **⚠️ 重要：** 在"用户信息设置"区域**必须**填写所有三个字段：
   - **用户ID**（必需，如：`user001`）
   - **用户名**（必需，如：`张三`）
   - **API密钥**（必需，如：`sk-ant-api-your-key-here`）
3. 点击"设置用户信息"（系统会验证所有字段是否完整）
4. 创建新对话（可选填写对话描述，标题将在发送首条消息时自动生成）
5. 上传CSV数据文件
6. 查看表结构信息（自动显示或点击"🔄 刷新表列表"）
7. 开始AI数据分析对话（此时AI会自动为对话生成合适的标题）

**🔑 获取API密钥：**
- 访问 [Anthropic Console](https://console.anthropic.com/)
- 创建账户并获取API Key
- API Key格式：`sk-ant-api-xxxxx`

### 💻 API调用示例

```javascript
// 快速开始示例
const response = await fetch('http://localhost:5000/api/analyze-stream', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-User-ID': 'user001',
        'X-Username': '张三',
        'X-API-Key': 'sk-ant-api-your-key-here'
    },
    body: JSON.stringify({
        query: '请分析这个数据集的基本统计信息'
    })
});
```

**👉 [查看完整API调用示例](./API_EXAMPLES.md)**

## 📡 API 接口文档

### 基础信息

- **基础URL**: `http://localhost:5000/api`
- **认证方式**: 用户ID、用户名和API密钥（通过请求头或参数传递）
- **数据格式**: JSON
- **CORS**: 支持跨域请求

### 主要接口

#### 1. 系统状态接口
- `GET /api/health` - 健康检查（无需认证）
- `GET /api/status` - 获取系统状态（需要认证）

#### 2. 数据管理接口
- `POST /api/upload` - 上传数据文件
- `GET /api/tables` - 获取当前会话的数据表列表
- `GET /api/tables/{table_name}` - 获取指定表的结构信息

#### 3. 数据分析接口
- `POST /api/analyze-stream` - 流式数据分析（主要接口）
- `POST /api/analyze` - 非流式数据分析

#### 4. 对话管理接口
- `POST /api/conversations` - 创建新对话
- `GET /api/conversations` - 获取对话列表
- `GET /api/conversations/{conversation_id}` - 获取指定对话详情
- `PUT /api/conversations/{conversation_id}` - 更新对话信息
- `DELETE /api/conversations/{conversation_id}` - 删除对话
- `POST /api/conversations/{conversation_id}/switch` - 切换到指定对话

#### 5. 消息管理接口
- `GET /api/conversations/{conversation_id}/messages` - 获取对话消息列表
- `POST /api/conversations/{conversation_id}/messages` - 添加消息到对话
- `DELETE /api/messages/{message_id}` - 删除指定消息

### 📚 详细API示例

**👉 [查看完整API调用示例文档](./API_EXAMPLES.md)**

## 💻 开发指南

### 系统架构

系统采用前后端分离架构：

```
┌─────────────────┐    HTTP/WebSocket    ┌─────────────────┐
│                 │ ◄─────────────────► │                 │
│   前端 (Vue3)   │                     │  后端 (Flask)   │
│                 │                     │                 │
└─────────────────┘                     └─────────────────┘
                                                  │
                                                  ▼
                                        ┌─────────────────┐
                                        │                 │
                                        │ Anthropic API   │
                                        │                 │
                                        └─────────────────┘
```

### 核心模块

1. **app.py** - Flask主应用，处理HTTP请求和路由
2. **datatest1_7_5.py** - 数据分析核心模块，集成Claude AI
3. **conversation_history.py** - 对话历史管理模块
4. **user_middleware.py** - 用户认证和权限管理中间件

### 数据流程

```
用户输入 → 前端验证 → 后端接收 → 用户认证 → 数据分析 → AI处理 → 流式返回 → 前端展示
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

**📖 相关文档：**
- **[前端架构文档](./README.md)** - 现代化Vue3前端架构设计
- **[API调用示例](./API_EXAMPLES.md)** - 完整的API调用示例和代码
- **[数据处理功能说明](./DATA_PROCESSING_FEATURE.md)** - 多格式支持和数据清洗功能详解
- **[多表功能说明](./MULTI_TABLE_FEATURE.md)** - 多表支持和跨表查询功能说明 