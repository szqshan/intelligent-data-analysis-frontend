<template>
  <div class="chat-container">
    <!-- 聊天消息区域 -->
    <div class="chat-messages" ref="messagesContainer">
      <div v-for="message in messages" :key="message.id" class="message-wrapper">
        <div :class="['message', message.role]">
          <div class="message-avatar">
            <el-avatar :size="32">
              <el-icon v-if="message.role === 'user'"><User /></el-icon>
              <el-icon v-else><Cpu /></el-icon>
            </el-avatar>
          </div>
          <div class="message-content">
            <div class="message-text" v-html="formatMessage(message.content)"></div>
            <div v-if="message.tools && message.tools.length > 0" class="tool-calls">
              <div v-for="tool in message.tools" :key="tool.id" class="tool-call">
                <el-tag type="info" size="small">
                  <el-icon><Tools /></el-icon>
                  {{ tool.name }}
                </el-tag>
              </div>
            </div>
            <div class="message-time">
              {{ formatTime(message.timestamp) }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="isLoading" class="message-wrapper">
        <div class="message assistant">
          <div class="message-avatar">
            <el-avatar :size="32">
              <el-icon><Cpu /></el-icon>
            </el-avatar>
          </div>
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input">
      <el-input
        v-model="currentMessage"
        type="textarea"
        :rows="3"
        placeholder="请输入您的问题..."
        @keyup.ctrl.enter="sendMessage"
        :disabled="isLoading"
      />
      <div class="input-actions">
        <el-button-group>
          <el-button @click="clearChat" :disabled="isLoading">
            <el-icon><Delete /></el-icon>
            清空对话
          </el-button>
          <el-button @click="exportChat" :disabled="messages.length === 0">
            <el-icon><Download /></el-icon>
            导出对话
          </el-button>
        </el-button-group>
        <el-button type="primary" @click="sendMessage" :disabled="!currentMessage.trim() || isLoading">
          <el-icon><Promotion /></el-icon>
          发送 (Ctrl+Enter)
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

// 响应式数据
const messages = ref([])
const currentMessage = ref('')
const isLoading = ref(false)
const messagesContainer = ref(null)

// 配置marked
marked.setOptions({
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext'
    return hljs.highlight(code, { language }).value
  },
  langPrefix: 'hljs language-'
})

// 示例消息
onMounted(() => {
  messages.value = [
    {
      id: 1,
      role: 'assistant',
      content: '您好！我是智能数据分析助手。我可以帮您：\n\n- 📊 分析数据并生成可视化图表\n- 📈 创建数据报告和洞察\n- 🔧 调用各种数据处理工具\n- 💡 提供数据分析建议\n\n请告诉我您需要什么帮助？',
      timestamp: new Date(),
      tools: []
    }
  ]
})

// 格式化消息内容
const formatMessage = (content) => {
  return marked(content)
}

// 格式化时间
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 发送消息
const sendMessage = async () => {
  if (!currentMessage.value.trim() || isLoading.value) return

  const userMessage = {
    id: Date.now(),
    role: 'user',
    content: currentMessage.value,
    timestamp: new Date(),
    tools: []
  }

  messages.value.push(userMessage)
  const messageText = currentMessage.value
  currentMessage.value = ''
  isLoading.value = true

  // 滚动到底部
  await nextTick()
  scrollToBottom()

  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const assistantMessage = {
      id: Date.now(),
      role: 'assistant',
      content: `您提到了："${messageText}"\n\n这是一个很好的问题！让我为您分析一下：\n\n\`\`\`python\n# 示例代码\nimport pandas as pd\nimport matplotlib.pyplot as plt\n\n# 数据处理示例\ndf = pd.read_csv('data.csv')\nresult = df.groupby('category').sum()\nprint(result)\n\`\`\`\n\n**分析结果：**\n- 数据量：1000条记录\n- 主要趋势：呈上升态势\n- 建议：继续观察数据变化`,
      timestamp: new Date(),
      tools: [
        { id: 1, name: 'pandas_analyzer' },
        { id: 2, name: 'chart_generator' }
      ]
    }

    messages.value.push(assistantMessage)
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('发送消息失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 清空对话
const clearChat = () => {
  messages.value = []
}

// 导出对话
const exportChat = () => {
  const chatContent = messages.value.map(msg => 
    `${msg.role === 'user' ? '用户' : '助手'} [${formatTime(msg.timestamp)}]:\n${msg.content}\n\n`
  ).join('')
  
  const blob = new Blob([chatContent], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `对话记录_${new Date().toISOString().split('T')[0]}.txt`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  padding-bottom: 10px;
}

.message-wrapper {
  margin-bottom: 20px;
}

.message {
  display: flex;
  gap: 12px;
  max-width: 80%;
}

.message.user {
  margin-left: auto;
  flex-direction: row-reverse;
}

.message.user .message-content {
  background: #409eff;
  color: white;
}

.message.assistant .message-content {
  background: white;
  border: 1px solid #e4e7ed;
}

.message-content {
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.message-text {
  line-height: 1.5;
  word-wrap: break-word;
}

.message-text :deep(pre) {
  background: #f6f8fa;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 10px 0;
}

.message-text :deep(code) {
  background: #f6f8fa;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 0.9em;
}

.tool-calls {
  margin-top: 8px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.message.user .message-time {
  color: rgba(255,255,255,0.8);
}

.typing-indicator {
  display: flex;
  gap: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #909399;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 80%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}

.chat-input {
  padding: 20px;
  background: white;
  border-top: 1px solid #e4e7ed;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

@media (max-width: 768px) {
  .message {
    max-width: 95%;
  }
  
  .input-actions {
    flex-direction: column;
    gap: 10px;
  }
}
</style> 