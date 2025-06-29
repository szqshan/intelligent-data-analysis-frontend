<template>
  <div class="message-list" ref="messageListRef">
    <el-scrollbar ref="scrollbarRef" class="scrollbar">
      <div class="messages-container">
        <!-- 空状态 -->
        <div v-if="messages.length === 0" class="empty-state">
          <el-empty 
            :image-size="120" 
            description="还没有消息，开始聊天吧！"
          >
                         <template #image>
               <el-icon size="120" color="#d3d3d3">
                 <ChatRound />
               </el-icon>
             </template>
          </el-empty>
        </div>

        <!-- 消息列表 -->
        <div 
          v-for="message in messages" 
          :key="message.id" 
          class="message-wrapper"
          :class="{ 'user-message': message.role === 'user' }"
        >
          <div class="message">
            <!-- 头像 -->
            <div class="message-avatar">
              <el-avatar :size="36" :style="getAvatarStyle(message.role)">
                                 <el-icon v-if="message.role === 'user'">
                   <User />
                 </el-icon>
                 <el-icon v-else>
                   <Cpu />
                 </el-icon>
              </el-avatar>
            </div>

            <!-- 消息内容 -->
            <div class="message-content">
              <!-- 消息气泡 -->
              <div 
                class="message-bubble" 
                :class="{ 
                  'user-bubble': message.role === 'user',
                  'assistant-bubble': message.role === 'assistant'
                }"
              >
                <!-- 消息文本 -->
                <div 
                  class="message-text" 
                  v-html="formatMessageContent(message.content)"
                ></div>

                <!-- 工具调用可视化 -->
                <ToolVisualization 
                  v-if="message.tools && message.tools.length > 0"
                  :tools="message.tools"
                  class="message-tools"
                />

                <!-- 流式响应指示器 -->
                <div v-if="isStreamingMessage(message.id)" class="streaming-indicator">
                  <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>

              <!-- 消息元数据 -->
              <div class="message-meta">
                <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                
                <!-- 消息操作按钮 -->
                <div class="message-actions">
                  <el-button-group size="small">
                    <el-button 
                      v-if="message.role === 'assistant'"
                      size="small" 
                      text 
                      @click="copyMessage(message.content)"
                      title="复制消息"
                    >
                      <el-icon><DocumentCopy /></el-icon>
                    </el-button>
                    
                    <el-button 
                      v-if="message.role === 'user'"
                      size="small" 
                      text 
                      @click="resendMessage(message.id)"
                      title="重新发送"
                    >
                      <el-icon><Refresh /></el-icon>
                    </el-button>

                    <el-button 
                      size="small" 
                      text 
                      type="danger"
                      @click="deleteMessage(message.id)"
                      title="删除消息"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </el-button-group>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 加载指示器 -->
        <div v-if="isLoading && !isStreaming" class="loading-wrapper">
          <div class="message">
            <div class="message-avatar">
                             <el-avatar :size="36" style="background: linear-gradient(45deg, #409eff, #67c23a)">
                 <el-icon><Cpu /></el-icon>
               </el-avatar>
            </div>
            <div class="message-content">
              <div class="message-bubble assistant-bubble">
                <div class="loading-indicator">
                  <el-icon class="loading-icon"><Loading /></el-icon>
                  正在思考中...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useAppStore } from '@/stores/app'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import ToolVisualization from './ToolVisualization.vue'

// Props
const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  autoScroll: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['resend-message', 'delete-message'])

// Stores
const chatStore = useChatStore()
const appStore = useAppStore()

// 响应式引用
const messageListRef = ref(null)
const scrollbarRef = ref(null)

// 计算属性
const isStreaming = computed(() => chatStore.isStreaming)

// 配置marked
marked.setOptions({
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext'
    return hljs.highlight(code, { language }).value
  },
  langPrefix: 'hljs language-',
  breaks: true,
  gfm: true
})

// 监听消息变化，自动滚动
watch(
  () => props.messages.length,
  async () => {
    if (props.autoScroll) {
      await nextTick()
      scrollToBottom()
    }
  }
)

// 监听流式响应状态变化
watch(
  () => chatStore.streamingMessageId,
  async () => {
    if (props.autoScroll) {
      await nextTick()
      scrollToBottom()
    }
  }
)

// 格式化消息内容
function formatMessageContent(content) {
  if (!content) return ''
  return marked(content)
}

// 格式化时间
function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  // 一天内显示时间
  if (diff < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  // 超过一天显示日期和时间
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取头像样式
function getAvatarStyle(role) {
  if (role === 'user') {
    return { background: 'linear-gradient(45deg, #409eff, #79bbff)' }
  } else {
    return { background: 'linear-gradient(45deg, #67c23a, #95d475)' }
  }
}

// 判断是否为流式响应消息
function isStreamingMessage(messageId) {
  return chatStore.streamingMessageId === messageId && chatStore.isStreaming
}

// 复制消息
async function copyMessage(content) {
  try {
    // 移除markdown格式，只保留纯文本
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = marked(content)
    const plainText = tempDiv.textContent || tempDiv.innerText || ''
    
    await navigator.clipboard.writeText(plainText)
    appStore.showSuccess('消息已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    appStore.showError('复制失败')
  }
}

// 重新发送消息
function resendMessage(messageId) {
  emit('resend-message', messageId)
}

// 删除消息
function deleteMessage(messageId) {
  emit('delete-message', messageId)
}

// 滚动到底部
function scrollToBottom() {
  if (scrollbarRef.value) {
    scrollbarRef.value.setScrollTop(999999)
  }
}

// 组件挂载后滚动到底部
onMounted(() => {
  if (props.autoScroll) {
    scrollToBottom()
  }
})

// 导出方法供父组件调用
defineExpose({
  scrollToBottom
})
</script>

<style scoped>
.message-list {
  height: 100%;
  background: #f8f9fa;
}

.scrollbar {
  height: 100%;
}

.messages-container {
  padding: 16px;
  min-height: 100%;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
}

.message-wrapper {
  margin-bottom: 16px;
}

.message-wrapper.user-message {
  margin-left: auto;
}

.message {
  display: flex;
  gap: 12px;
  max-width: 80%;
}

.user-message .message {
  flex-direction: row-reverse;
  margin-left: auto;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
  position: relative;
}

.user-bubble {
  background: linear-gradient(135deg, #409eff 0%, #79bbff 100%);
  color: white;
  margin-left: auto;
}

.assistant-bubble {
  background: white;
  color: #303133;
  border: 1px solid #e4e7ed;
}

.message-text {
  line-height: 1.6;
}

.message-text :deep(pre) {
  background: rgba(0, 0, 0, 0.05);
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 8px 0;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.user-bubble .message-text :deep(pre) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.message-text :deep(code) {
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.user-bubble .message-text :deep(code) {
  background: rgba(255, 255, 255, 0.2);
}

.message-text :deep(p) {
  margin: 0 0 8px 0;
}

.message-text :deep(p:last-child) {
  margin-bottom: 0;
}

.message-text :deep(ul),
.message-text :deep(ol) {
  margin: 8px 0;
  padding-left: 20px;
}

.message-text :deep(blockquote) {
  border-left: 4px solid #dcdfe6;
  padding-left: 12px;
  margin: 8px 0;
  color: #909399;
}

.user-bubble .message-text :deep(blockquote) {
  border-left-color: rgba(255, 255, 255, 0.5);
  color: rgba(255, 255, 255, 0.8);
}

.message-tools {
  margin-top: 8px;
}

.streaming-indicator {
  margin-top: 8px;
}

.typing-dots {
  display: flex;
  gap: 4px;
  align-items: center;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #909399;
  animation: typing 1.4s infinite ease-in-out;
}

.user-bubble .typing-dots span {
  background: rgba(255, 255, 255, 0.7);
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
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

.message-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
}

.user-message .message-meta {
  flex-direction: row-reverse;
}

.message-actions {
  opacity: 0;
  transition: opacity 0.3s;
}

.message-wrapper:hover .message-actions {
  opacity: 1;
}

.loading-wrapper {
  margin-bottom: 16px;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .message {
    max-width: 95%;
  }
  
  .messages-container {
    padding: 12px;
  }
  
  .message-bubble {
    padding: 10px 12px;
  }
  
  .message-actions {
    opacity: 1;
  }
}
</style> 