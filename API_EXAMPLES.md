# 📖 API调用示例代码文档

本文档提供了智能数据库分析系统所有API接口的详细调用示例，主要以JavaScript和curl为主。

> **🚨 重要更新 (v1.1.3)：** 新增AI自动标题生成功能，创建对话时不再需要手动输入对话名称！

> **🚨 重要更新 (v1.1.1)：** 系统已删除访客模式，所有API接口强制要求用户ID、用户名和API密钥！

**📋 快速导航：**
- [🔧 基础配置](#基础配置)
- [🔐 用户认证](#用户认证)  
- [🏥 系统状态接口](#系统状态接口)
- [📁 数据管理接口](#数据管理接口)
- [🤖 数据分析接口](#数据分析接口)
- [💬 对话管理接口](#对话管理接口)
- [📝 消息管理接口](#消息管理接口)
- [📚 前端消息处理示例](#前端消息处理示例)
- [❌ 错误处理](#错误处理)
- [🎯 完整示例](#完整示例)
- [📋 API接口总览](#api接口总览)

## 🔧 基础配置

### JavaScript 配置

```javascript
// API基础配置
const API_BASE_URL = 'http://localhost:5000/api';

// ⚠️ v1.1.1重要变更：所有字段都是必需的！
const USER_CONFIG = {
    userId: 'user123',                           // 必需
    username: '张三',                            // 必需
    apiKey: 'sk-ant-api-your-api-key-here'      // 必需 - Anthropic API Key
};

// 通用请求头 - 强制要求所有认证信息
const getHeaders = (additionalHeaders = {}) => {
    // v1.1.1: 验证所有必需字段
    if (!USER_CONFIG.userId || !USER_CONFIG.username || !USER_CONFIG.apiKey) {
        throw new Error('用户ID、用户名和API密钥都是必需的！');
    }
    
    return {
        'Content-Type': 'application/json',
        'X-User-ID': USER_CONFIG.userId,
        'X-Username': encodeURIComponent(USER_CONFIG.username),
        'X-API-Key': USER_CONFIG.apiKey,
        ...additionalHeaders
    };
};

// 通用错误处理
const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // v1.1.1: 处理新的认证错误码
        if (response.status === 401) {
            switch (errorData.error_code) {
                case 'MISSING_CREDENTIALS':
                    throw new Error('缺少必需的用户认证信息：用户ID、用户名和API密钥都是必需的');
                case 'INVALID_CREDENTIALS':
                    throw new Error('用户认证信息无效：请检查用户ID和API密钥');
                default:
                    throw new Error('认证失败：' + (errorData.message || '请提供有效的用户信息'));
            }
        }
        
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
};
```

## 🔐 用户认证

**⚠️ v1.1.1重大变更：不再支持访客模式，所有三个字段都是必需的！**

### 方式1：请求头认证（推荐）

```javascript
// JavaScript - 所有字段都必需
const response = await fetch(`${API_BASE_URL}/status`, {
    method: 'GET',
    headers: {
        'X-User-ID': 'user123',                    // 必需
        'X-Username': encodeURIComponent('张三'),   // 必需
        'X-API-Key': 'sk-ant-api-your-key-here'   // 必需
    }
});
```

```bash
# curl - 必须包含所有认证信息
curl -X GET "http://localhost:5000/api/status" \
  -H "X-User-ID: user123" \
  -H "X-Username: %E5%BC%A0%E4%B8%89" \
  -H "X-API-Key: sk-ant-api-your-api-key-here"
```

## 🏥 系统状态接口

### GET /api/health - 健康检查

**注意：健康检查接口不需要认证**

```javascript
// JavaScript
async function checkHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await handleResponse(response);
        console.log('系统状态:', data);
        return data;
    } catch (error) {
        console.error('健康检查失败:', error);
        throw error;
    }
}
```

```bash
# curl
curl -X GET "http://localhost:5000/api/health"
```

### GET /api/status - 获取系统状态

**需要完整认证信息**

```javascript
// JavaScript
async function getSystemStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/status`, {
            method: 'GET',
            headers: getHeaders()
        });
        
        const data = await handleResponse(response);
        console.log('系统状态:', data);
        return data;
    } catch (error) {
        console.error('获取系统状态失败:', error);
        throw error;
    }
}
```

```bash
# curl
curl -X GET "http://localhost:5000/api/status" \
  -H "X-User-ID: user123" \
  -H "X-Username: %E5%BC%A0%E4%B8%89" \
  -H "X-API-Key: sk-ant-api-your-api-key-here"
```

## 📁 数据管理接口

### POST /api/upload - 上传数据文件

```javascript
// JavaScript
async function uploadFile(file) {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', USER_CONFIG.userId);
        formData.append('username', USER_CONFIG.username);
        
        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            headers: {
                'X-User-ID': USER_CONFIG.userId,
                'X-Username': encodeURIComponent(USER_CONFIG.username),
                'X-API-Key': USER_CONFIG.apiKey
            },
            body: formData
        });
        
        const data = await handleResponse(response);
        console.log('文件上传成功:', data);
        return data;
    } catch (error) {
        console.error('文件上传失败:', error);
        throw error;
    }
}
```

```bash
# curl
curl -X POST "http://localhost:5000/api/upload" \
  -H "X-User-ID: user123" \
  -H "X-Username: %E5%BC%A0%E4%B8%89" \
  -H "X-API-Key: sk-ant-api-your-api-key-here" \
  -F "file=@/path/to/your/data.csv" \
  -F "userId=user123" \
  -F "username=张三"
```

### GET /api/tables-info - 获取表结构信息

```javascript
// JavaScript
async function getTablesInfo() {
    try {
        const response = await fetch(`${API_BASE_URL}/tables-info`, {
            method: 'GET',
            headers: getHeaders()
        });
        
        const data = await handleResponse(response);
        console.log('表结构信息:', data);
        return data;
    } catch (error) {
        console.error('获取表结构信息失败:', error);
        throw error;
    }
}
```

```bash
# curl
curl -X GET "http://localhost:5000/api/tables-info" \
  -H "X-User-ID: user123" \
  -H "X-Username: %E5%BC%A0%E4%B8%89" \
  -H "X-API-Key: sk-ant-api-your-api-key-here"
```

**响应示例：**
```json
{
    "success": true,
    "message": "成功获取 2 个表的信息",
    "data": {
        "database_path": "/path/to/user/database.db",
        "total_tables": 2,
        "summary": "当前对话中共有 2 个数据表...",
        "tables": [
            {
                "table_name": "sales_data_20241223_143022",
                "original_filename": "sales_data.csv",
                "description": "从文件 sales_data.csv 导入的数据表",
                "row_count": 1500,
                "created_at": "2024-12-23T14:30:22.123456",
                "columns": [
                    {"name": "id", "type": "INTEGER"},
                    {"name": "product_name", "type": "TEXT"},
                    {"name": "price", "type": "REAL"},
                    {"name": "sale_date", "type": "TEXT"},
                    {"name": "quantity", "type": "INTEGER"}
                ],
                "sample_data": [
                    {
                        "id": 1,
                        "product_name": "iPhone 15",
                        "price": 999.99,
                        "sale_date": "2024-01-15",
                        "quantity": 2
                    },
                    {
                        "id": 2,
                        "product_name": "MacBook Pro",
                        "price": 2499.99,
                        "sale_date": "2024-01-16",
                        "quantity": 1
                    }
                ]
            }
        ]
    }
}
```

## 🤖 数据分析接口

### POST /api/analyze-stream - 流式AI数据分析

```javascript
// JavaScript - 流式响应处理
async function analyzeDataStream(query, conversationId = null) {
    try {
        const response = await fetch(`${API_BASE_URL}/analyze-stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'X-User-ID': USER_CONFIG.userId,
                'X-Username': encodeURIComponent(USER_CONFIG.username),
                'X-API-Key': USER_CONFIG.apiKey
            },
            body: JSON.stringify({
                query: query,
                userId: USER_CONFIG.userId,
                username: USER_CONFIG.username,
                conversation_id: conversationId
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // 处理流式响应
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                    console.log('流式分析完成');
                    break;
                }
                
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                
                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (trimmedLine === '' || !trimmedLine.startsWith('data: ')) {
                        continue;
                    }
                    
                    try {
                        const jsonStr = trimmedLine.slice(6);
                        if (jsonStr === '[DONE]') {
                            console.log('收到完成信号');
                            break;
                        }
                        
                        const data = JSON.parse(jsonStr);
                        handleStreamMessage(data);
                    } catch (parseError) {
                        console.error('解析流数据失败:', parseError);
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    } catch (error) {
        console.error('流式分析失败:', error);
        throw error;
    }
}

// 处理流式消息
function handleStreamMessage(data) {
    const { type, message, content, tool, result } = data;
    
    switch (type) {
        case 'status':
            console.log('[状态]', message);
            break;
        case 'ai_response':
            console.log('[AI回复]', content);
            break;
        case 'tool_result':
            console.log('[工具结果]', tool, result);
            break;
        case 'error':
            console.error('[错误]', message);
            break;
        default:
            console.log('[其他]', data);
    }
}
```

## 💬 对话管理接口

### POST /api/conversations/create - 创建新对话

**⚠️ v1.1.3 重要变更：**
- **删除 `conversation_name` 参数**：对话标题将在用户发送第一条消息时由AI自动生成
- **保留 `conversation_description` 参数**：用户可选填写对话描述
- **注意：创建对话不需要API Key认证**

```javascript
// JavaScript - v1.1.3 更新
async function createConversation(description = '') {
    try {
        const response = await fetch(`${API_BASE_URL}/conversations/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                // conversation_name: name,  // v1.1.3: 已删除，改为AI自动生成
                conversation_description: description
            })
        });
        
        const data = await handleResponse(response);
        console.log('对话创建成功:', data);
        // 新创建的对话标题默认为"新对话"，将在首条消息时自动更新
        console.log('标题生成说明: 对话标题将在您发送第一条消息时由AI自动生成');
        return data;
    } catch (error) {
        console.error('创建对话失败:', error);
        throw error;
    }
}
```

```bash
# curl - v1.1.3 更新
curl -X POST "http://localhost:5000/api/conversations/create" \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_description": "这是一个测试对话"
  }'
```

**响应示例：**
```json
{
    "success": true,
    "conversation_id": "conv_20250124_143025_123",
    "conversation_name": "新对话",
    "description": "这是一个测试对话",
    "message": "对话创建成功，标题将在您发送第一条消息时自动生成"
}
```
```

### GET /api/conversations/list - 获取对话列表

**注意：获取对话列表不需要API Key认证**

```javascript
// JavaScript
async function getConversationsList() {
    try {
        const response = await fetch(`${API_BASE_URL}/conversations/list`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await handleResponse(response);
        console.log('对话列表:', data);
        return data;
    } catch (error) {
        console.error('获取对话列表失败:', error);
        throw error;
    }
}
```

### POST /api/conversations/switch - 切换当前对话

**注意：切换对话不需要API Key认证**

```javascript
// JavaScript
async function switchConversation(conversationId) {
    try {
        const response = await fetch(`${API_BASE_URL}/conversations/switch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                conversation_id: conversationId
            })
        });
        
        const data = await handleResponse(response);
        console.log('对话切换成功:', data);
        return data;
    } catch (error) {
        console.error('切换对话失败:', error);
        throw error;
    }
}
```

### GET /api/conversations/current - 获取当前对话

**注意：获取当前对话不需要API Key认证**

```javascript
// JavaScript
async function getCurrentConversation() {
    try {
        const response = await fetch(`${API_BASE_URL}/conversations/current`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await handleResponse(response);
        console.log('当前对话:', data);
        return data;
    } catch (error) {
        console.error('获取当前对话失败:', error);
        throw error;
    }
}
```

### GET /api/conversations - 获取对话历史（分页）

**需要认证**

```javascript
// JavaScript
async function getConversationsHistory(limit = 10, offset = 0) {
    try {
        const response = await fetch(`${API_BASE_URL}/conversations?limit=${limit}&offset=${offset}`, {
            method: 'GET',
            headers: getHeaders()
        });
        
        const data = await handleResponse(response);
        console.log('对话历史:', data);
        return data;
    } catch (error) {
        console.error('获取对话历史失败:', error);
        throw error;
    }
}
```

### GET /api/conversations/{conversationId} - 获取对话详情

**需要认证**

```javascript
// JavaScript
async function getConversationDetail(conversationId) {
    try {
        const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
            method: 'GET',
            headers: getHeaders()
        });
        
        const data = await handleResponse(response);
        console.log('对话详情:', data);
        return data;
    } catch (error) {
        console.error('获取对话详情失败:', error);
        throw error;
    }
}
```

### DELETE /api/conversations/{conversationId} - 删除对话

**需要认证**

```javascript
// JavaScript
async function deleteConversation(conversationId) {
    try {
        if (!confirm('确定要删除这个对话吗？此操作无法撤销！')) {
            return false;
        }
        
        const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        
        const data = await handleResponse(response);
        console.log('对话删除成功:', data);
        return data;
    } catch (error) {
        console.error('删除对话失败:', error);
        throw error;
    }
}
```

### GET /api/conversations/recent - 获取最近对话

**需要认证**

```javascript
// JavaScript
async function getRecentConversations(limit = 5) {
    try {
        const response = await fetch(`${API_BASE_URL}/conversations/recent?limit=${limit}`, {
            method: 'GET',
            headers: getHeaders()
        });
        
        const data = await handleResponse(response);
        console.log('最近对话:', data);
        return data;
    } catch (error) {
        console.error('获取最近对话失败:', error);
        throw error;
    }
}
```

### GET /api/conversations/stats - 获取对话统计

**需要认证**

```javascript
// JavaScript
async function getConversationStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/conversations/stats`, {
            method: 'GET',
            headers: getHeaders()
        });
        
        const data = await handleResponse(response);
        console.log('对话统计:', data);
        return data;
    } catch (error) {
        console.error('获取对话统计失败:', error);
        throw error;
    }
}
```

## 📝 消息管理接口

### POST /api/conversations/{conversationId}/messages/{messageId}/edit - 编辑消息

**需要认证**

```javascript
// JavaScript
async function editMessage(conversationId, messageId, newContent) {
    try {
        const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages/${messageId}/edit`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                new_content: newContent
            })
        });
        
        const data = await handleResponse(response);
        console.log('消息编辑成功:', data);
        return data;
    } catch (error) {
        console.error('编辑消息失败:', error);
        throw error;
    }
}
```

### POST /api/conversations/{conversationId}/messages/{messageId}/delete - 删除/撤销消息

**需要认证**

```javascript
// JavaScript
async function deleteMessage(conversationId, messageId) {
    try {
        if (!confirm('确定要删除这条消息吗？此操作无法撤销！')) {
            return false;
        }
        
        const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages/${messageId}/delete`, {
            method: 'POST',
            headers: getHeaders()
        });
        
        const data = await handleResponse(response);
        console.log('消息删除成功:', data);
        return data;
    } catch (error) {
        console.error('删除消息失败:', error);
        throw error;
    }
}
```

## 📚 前端消息处理示例

### 获取和解析不同角色的消息数据

```javascript
// 获取对话历史记录数据
async function getConversationHistory(conversationId) {
    try {
        const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
            method: 'GET',
            headers: {
                'X-User-ID': USER_CONFIG.userId,
                'X-Username': USER_CONFIG.username,
                'X-API-Key': USER_CONFIG.apiKey
            }
        });
        
        const data = await response.json();
        return data.messages || [];
    } catch (error) {
        console.error('获取对话历史失败:', error);
        return [];
    }
}

// 解析和分类消息数据
function parseMessages(messages) {
    const parsedMessages = [];
    
    messages.forEach(message => {
        const messageData = {
            id: message.id,
            timestamp: message.timestamp,
            role: message.role,
            originalContent: message.content,
            messageType: null,
            textContent: [],
            toolCalls: [],
            toolResults: []
        };
        
        // 根据role和content类型判断消息类型
        if (message.role === 'user') {
            // 检查是否包含工具结果
            const hasToolResult = message.content.some(c => c.type === 'tool_result');
            if (hasToolResult) {
                messageData.messageType = 'tool-result';
                // 提取工具结果数据
                message.content.forEach(item => {
                    if (item.type === 'tool_result') {
                        messageData.toolResults.push({
                            toolUseId: item.tool_use_id,
                            content: item.content
                        });
                    }
                });
            } else {
                messageData.messageType = 'user-input';
                // 提取用户文本输入
                message.content.forEach(item => {
                    if (item.type === 'text') {
                        messageData.textContent.push(item.text);
                    }
                });
            }
        } 
        else if (message.role === 'assistant') {
            const hasToolUse = message.content.some(c => c.type === 'tool_use');
            const hasText = message.content.some(c => c.type === 'text');
            
            if (hasToolUse && hasText) {
                messageData.messageType = 'ai-with-tools';
            } else if (hasToolUse) {
                messageData.messageType = 'ai-tool-only';
            } else {
                messageData.messageType = 'ai-response';
            }
            
            // 提取AI文本回复和工具调用
            message.content.forEach(item => {
                if (item.type === 'text') {
                    messageData.textContent.push(item.text);
                } else if (item.type === 'tool_use') {
                    messageData.toolCalls.push({
                        id: item.id,
                        name: item.name,
                        input: item.input
                    });
                }
            });
        }
        
        parsedMessages.push(messageData);
    });
    
    return parsedMessages;
}

// 按消息类型分组数据
function groupMessagesByType(parsedMessages) {
    const grouped = {
        userInputs: [],
        aiResponses: [],
        aiWithTools: [],
        toolResults: []
    };
    
    parsedMessages.forEach(msg => {
        switch(msg.messageType) {
            case 'user-input':
                grouped.userInputs.push(msg);
                break;
            case 'ai-response':
                grouped.aiResponses.push(msg);
                break;
            case 'ai-with-tools':
            case 'ai-tool-only':
                grouped.aiWithTools.push(msg);
                break;
            case 'tool-result':
                grouped.toolResults.push(msg);
                break;
        }
    });
    
    return grouped;
}

// 获取工具调用和结果的配对数据
function getToolCallPairs(parsedMessages) {
    const pairs = [];
    
    // 找到所有工具调用
    const toolCalls = parsedMessages
        .filter(msg => msg.toolCalls.length > 0)
        .flatMap(msg => msg.toolCalls.map(tool => ({
            ...tool,
            timestamp: msg.timestamp,
            messageId: msg.id
        })));
    
    // 找到对应的工具结果
    toolCalls.forEach(toolCall => {
        const result = parsedMessages
            .filter(msg => msg.toolResults.length > 0)
            .flatMap(msg => msg.toolResults.map(result => ({
                ...result,
                timestamp: msg.timestamp,
                messageId: msg.id
            })))
            .find(result => result.toolUseId === toolCall.id);
        
        pairs.push({
            call: toolCall,
            result: result || null
        });
    });
    
    return pairs;
}
```

### 前端消息渲染示例

```javascript
// 渲染不同类型的消息到前端界面
function renderMessage(messageData) {
    const messageContainer = document.createElement('div');
    messageContainer.className = `message ${messageData.messageType}`;
    
    switch (messageData.messageType) {
        case 'user-input':
            messageContainer.innerHTML = `
                <div class="user-message">
                    <div class="message-content">${messageData.textContent.join(' ')}</div>
                    <div class="message-time">${new Date(messageData.timestamp).toLocaleString()}</div>
                </div>
            `;
            break;
            
        case 'ai-response':
            messageContainer.innerHTML = `
                <div class="ai-message">
                    <div class="message-content">${messageData.textContent.join(' ')}</div>
                    <div class="message-time">${new Date(messageData.timestamp).toLocaleString()}</div>
                </div>
            `;
            break;
            
        case 'ai-with-tools':
            const toolsHtml = messageData.toolCalls.map(tool => 
                `<div class="tool-call">🔧 调用: ${tool.name}</div>`
            ).join('');
            messageContainer.innerHTML = `
                <div class="ai-message">
                    <div class="message-content">${messageData.textContent.join(' ')}</div>
                    ${toolsHtml}
                    <div class="message-time">${new Date(messageData.timestamp).toLocaleString()}</div>
                </div>
            `;
            break;
            
        case 'tool-result':
            const resultsHtml = messageData.toolResults.map(result => 
                `<div class="tool-result">⚙️ 结果: ${JSON.stringify(result.content)}</div>`
            ).join('');
            messageContainer.innerHTML = `
                <div class="tool-message">
                    ${resultsHtml}
                    <div class="message-time">${new Date(messageData.timestamp).toLocaleString()}</div>
                </div>
            `;
            break;
    }
    
    return messageContainer;
}

// 渲染整个对话
function renderConversation(messages) {
    const chatContainer = document.getElementById('chat-container');
    chatContainer.innerHTML = '';
    
    const parsedMessages = parseMessages(messages);
    parsedMessages.forEach(messageData => {
        const messageElement = renderMessage(messageData);
        chatContainer.appendChild(messageElement);
    });
    
    // 滚动到底部
    chatContainer.scrollTop = chatContainer.scrollHeight;
}
```

## ❌ 错误处理

### v1.1.1 新增错误代码

```javascript
// 处理新的认证错误
function handleAuthError(response, errorData) {
    switch (errorData.error_code) {
        case 'MISSING_CREDENTIALS':
            return '缺少必需的认证信息：请提供用户ID、用户名和API密钥';
        case 'INVALID_CREDENTIALS':
            return '认证信息无效：请检查用户ID和API密钥是否正确';
        case 'AUTH_ERROR':
            return '认证失败：' + errorData.message;
        default:
            return '未知认证错误：' + errorData.message;
    }
}

// 统一错误处理
async function safeApiCall(apiFunction, ...args) {
    try {
        return await apiFunction(...args);
    } catch (error) {
        if (error.message.includes('用户ID、用户名和API密钥都是必需的')) {
            console.error('❌ 配置错误:', error.message);
            alert('请先在用户配置中设置完整的认证信息！');
        } else if (error.message.includes('认证')) {
            console.error('❌ 认证错误:', error.message);
            alert('认证失败，请检查您的用户信息和API密钥！');
        } else {
            console.error('❌ API调用失败:', error.message);
            alert('操作失败：' + error.message);
        }
        throw error;
    }
}
```

## 🎯 完整示例

### 端到端数据分析流程

```javascript
// 完整的数据分析流程示例
async function completeAnalysisWorkflow() {
    try {
        console.log('🚀 开始完整的数据分析流程...');
        
        // 1. 检查系统状态
        const systemStatus = await safeApiCall(getSystemStatus);
        console.log('✅ 系统状态正常:', systemStatus);
        
        // 2. 创建新对话 (v1.1.3: 不再需要手动设置名称)
        const conversation = await safeApiCall(createConversation, '自动化数据分析流程');
        console.log('✅ 对话创建成功:', conversation.conversation_id);
        console.log('📝 对话标题将在发送第一条消息时自动生成');
        
        // 3. 上传数据文件（假设用户已选择文件）
        const fileInput = document.getElementById('data-file');
        if (fileInput.files[0]) {
            const uploadResult = await safeApiCall(uploadFile, fileInput.files[0]);
            console.log('✅ 文件上传成功:', uploadResult);
        }
        
        // 4. 开始AI分析
        await safeApiCall(analyzeDataStream, '请分析数据的基本统计信息并生成报告', conversation.conversation_id);
        console.log('✅ AI分析完成');
        
        // 5. 获取对话历史
        const history = await safeApiCall(getConversationDetail, conversation.conversation_id);
        console.log('✅ 对话历史获取成功:', history);
        
        // 6. 解析和展示消息
        const parsedMessages = parseMessages(history.messages);
        renderConversation(history.messages);
        console.log('✅ 消息解析和渲染完成');
        
        // 7. 演示消息管理功能（可选）
        if (history.messages.length > 0) {
            const lastMessage = history.messages[history.messages.length - 1];
            console.log('💬 演示消息管理功能...');
            
            // 编辑最后一条消息（如果是用户消息）
            if (lastMessage.role === 'user') {
                await safeApiCall(editMessage, conversation.conversation_id, lastMessage.id, '这是编辑后的消息');
                console.log('✅ 消息编辑演示完成');
            }
            
            // 注意：实际使用中请谨慎删除消息和对话
            // await safeApiCall(deleteMessage, conversation.conversation_id, lastMessage.id);
            // await safeApiCall(deleteConversation, conversation.conversation_id);
        }
        
        console.log('🎉 完整流程执行成功！');
        
    } catch (error) {
        console.error('❌ 流程执行失败:', error);
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 设置用户配置
    USER_CONFIG.userId = 'your_user_id';
    USER_CONFIG.username = 'your_username';
    USER_CONFIG.apiKey = 'sk-ant-api-your-api-key-here';
    
    // 可以调用完整流程
    // completeAnalysisWorkflow();
});
```

---

## 📋 API接口总览

### 🏥 系统状态接口

| 接口 | 方法 | 描述 | 认证要求 | 用途 |
|------|------|------|----------|------|
| `/api/health` | GET | 系统健康检查 | ❌ 无 | 检查服务是否运行正常 |
| `/api/status` | GET | 获取系统状态 | ✅ 完整认证 | 获取用户数据库连接状态和统计信息 |

### 📁 数据管理接口

| 接口 | 方法 | 描述 | 认证要求 | 用途 |
|------|------|------|----------|------|
| `/api/upload` | POST | 上传CSV数据文件 | ✅ 完整认证 | 上传数据文件到用户专属数据库 |
| `/api/tables-info` | GET | 获取表结构信息 | ✅ 完整认证 | 获取当前对话中所有表的详细结构信息 |

### 🤖 数据分析接口

| 接口 | 方法 | 描述 | 认证要求 | 用途 |
|------|------|------|----------|------|
| `/api/analyze-stream` | POST | 流式AI数据分析 | ✅ 完整认证 | 实时流式AI数据分析和问答 |

### 💬 对话管理接口

| 接口 | 方法 | 描述 | 认证要求 | 用途 |
|------|------|------|----------|------|
| `/api/conversations/create` | POST | 创建新对话 | ❌ 无 | 创建新的对话会话 |
| `/api/conversations/list` | GET | 获取对话列表 | ❌ 无 | 获取用户的所有对话列表 |
| `/api/conversations/switch` | POST | 切换当前对话 | ❌ 无 | 切换到指定的对话 |
| `/api/conversations/current` | GET | 获取当前对话 | ❌ 无 | 获取当前活跃对话信息 |
| `/api/conversations` | GET | 获取对话历史（分页） | ✅ 完整认证 | 分页获取对话历史记录 |
| `/api/conversations/{id}` | GET | 获取对话详情 | ✅ 完整认证 | 获取特定对话的详细消息 |
| `/api/conversations/{id}` | DELETE | 删除对话 | ✅ 完整认证 | 永久删除指定对话 |
| `/api/conversations/recent` | GET | 获取最近对话 | ✅ 完整认证 | 获取最近的几个对话 |
| `/api/conversations/stats` | GET | 获取对话统计 | ✅ 完整认证 | 获取用户对话统计信息 |

### 📝 消息管理接口

| 接口 | 方法 | 描述 | 认证要求 | 用途 |
|------|------|------|----------|------|
| `/api/conversations/{cid}/messages/{mid}/edit` | POST | 编辑消息 | ✅ 完整认证 | 编辑指定消息的内容 |
| `/api/conversations/{cid}/messages/{mid}/delete` | POST | 删除消息 | ✅ 完整认证 | 删除/撤销指定消息 |

### 🚨 已移除的接口

以下接口在前端测试页面中被使用，但后端实际**不提供**：

| 接口 | 状态 | 说明 |
|------|------|------|
| `/api/latest-report` | ❌ 已移除 | 获取最新报告功能不存在于后端，用户可通过AI分析直接生成报告 |

**✅ 已恢复的接口：**
- `/api/tables-info` - 现已提供，可获取详细的表结构信息

### 认证机制说明

**✅ 需要完整认证的接口：**
- 系统状态查询
- 数据上传和分析
- 对话详情、删除、统计
- 消息管理

**❌ 不需要认证的接口：**
- 健康检查
- 对话基本管理（创建、列表、切换、当前）

**🔑 完整认证要求：**
```javascript
{
    'X-User-ID': 'user123',                    // 必需
    'X-Username': encodeURIComponent('用户名'), // 必需
    'X-API-Key': 'sk-ant-api-your-key-here'   // 必需
}
```

### 接口功能总结

**🏗️ 数据流程：**
1. **健康检查** → **系统状态** → **上传数据** → **AI分析**
2. **创建对话** → **切换对话** → **分析数据** → **查看历史**
3. **编辑消息** → **删除消息** → **删除对话**

**💡 最佳实践：**
- 先检查健康状态，再进行其他操作
- 上传数据前检查系统状态
- 进行AI分析前确保有活跃对话
- 定期获取对话统计信息了解使用情况
- 谨慎使用删除功能，删除操作不可逆

**⚠️ 注意事项：**
1. **API密钥安全**：确保API密钥不在客户端代码中硬编码
2. **成本控制**：每个用户使用独立API密钥，确保成本隔离
3. **数据隔离**：所有数据操作都在用户专属目录中进行
4. **错误处理**：妥善处理认证错误和API调用失败
5. **流式响应**：AI分析接口使用流式响应，需要特殊处理

本文档涵盖了后端实际提供的所有API接口，包括最新的v1.1.1认证要求、完整的消息管理功能和前端处理示例。
