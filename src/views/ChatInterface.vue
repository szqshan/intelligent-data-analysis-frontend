<template>
  <div class="chat-interface">
    <!-- 消息列表区域 -->
    <div class="messages-area">
      <MessageList
        :messages="messages"
        :is-loading="isLoading"
        :auto-scroll="true"
        @resend-message="handleResendMessage"
        @delete-message="handleDeleteMessage"
        ref="messageListRef"
      />
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <MessageInput
        :messages="messages"
        :is-loading="isLoading"
        @send-message="handleSendMessage"
        @clear-messages="handleClearMessages"
        @export-chat="handleExportChat"
        @upload-files="handleUploadFiles"
        ref="messageInputRef"
      />
    </div>

    <!-- 全局加载遮罩 -->
    <el-loading 
      v-loading="globalLoading"
      :text="loadingText"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useChatStore } from '@/stores/chat'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { useChat } from '@/composables/useChat'
import { useUpload } from '@/composables/useUpload'
import MessageList from '@/components/Chat/MessageList.vue'
import MessageInput from '@/components/Chat/MessageInput.vue'

// Stores
const chatStore = useChatStore()
const userStore = useUserStore()
const appStore = useAppStore()

// Composables
const chat = useChat()
const upload = useUpload()

// 响应式引用
const messageListRef = ref(null)
const messageInputRef = ref(null)

// 计算属性
const messages = computed(() => chat.messages.value)
const isLoading = computed(() => chat.isLoading.value || chat.isStreaming.value)
const globalLoading = computed(() => appStore.globalLoading)
const loadingText = computed(() => appStore.loadingText)

// 初始化聊天
async function initializeChat() {
  try {
    if (!userStore.isAuthenticated) {
      appStore.showError('请先登录后再使用聊天功能')
      return
    }

    await chat.initializeChat()
    appStore.showSuccess('聊天初始化成功')
  } catch (error) {
    console.error('初始化聊天失败:', error)
    appStore.showError(`初始化聊天失败: ${error.message}`)
  }
}

// 处理发送消息
async function handleSendMessage(content, options = {}) {
  try {
    if (!content.trim()) {
      appStore.showWarning('请输入消息内容')
      return
    }

    await chat.sendMessage(content, options)
    
    // 滚动到底部
    if (messageListRef.value) {
      messageListRef.value.scrollToBottom()
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    // 错误处理已在useChat中完成
  }
}

// 处理重新发送消息
async function handleResendMessage(messageId) {
  try {
    await chat.resendMessage(messageId)
  } catch (error) {
    console.error('重新发送消息失败:', error)
  }
}

// 处理删除消息
function handleDeleteMessage(messageId) {
  chatStore.removeMessage(messageId)
  appStore.showSuccess('消息已删除')
}

// 处理清空消息
function handleClearMessages() {
  ElMessageBox.confirm(
    '确定要清空当前对话的所有消息吗？此操作不可恢复。',
    '确认清空',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    chat.clearCurrentMessages()
  }).catch(() => {
    // 用户取消
  })
}

// 处理导出对话
function handleExportChat() {
  try {
    chat.exportConversation()
  } catch (error) {
    console.error('导出对话失败:', error)
    appStore.showError('导出对话失败')
  }
}

// 处理文件上传
async function handleUploadFiles(files) {
  try {
    // 添加文件到上传队列
    const uploadItems = upload.addToUploadQueue(files)
    
    if (uploadItems.length > 0) {
      // 开始上传
      await upload.uploadFiles()
      
      // 可以在这里处理上传成功后的逻辑
      // 比如自动发送消息提及已上传的文件
      const fileNames = uploadItems.map(item => item.fileName).join(', ')
      const message = `已上传文件: ${fileNames}`
      
      // 可选：自动发送一条消息
      // await handleSendMessage(message)
    }
  } catch (error) {
    console.error('文件上传失败:', error)
    appStore.showError('文件上传失败')
  }
}

// 键盘快捷键处理
function handleKeyboardShortcuts(event) {
  // Ctrl/Cmd + N: 新建对话
  if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
    event.preventDefault()
    createNewConversation()
  }
  
  // Ctrl/Cmd + E: 导出对话
  if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
    event.preventDefault()
    handleExportChat()
  }
  
  // Ctrl/Cmd + K: 清空对话
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault()
    handleClearMessages()
  }
}

// 创建新对话
async function createNewConversation() {
  try {
    const conversation = await chat.createConversation('新对话')
    appStore.showSuccess(`新对话 "${conversation.title}" 创建成功`)
    
    // 聚焦输入框
    if (messageInputRef.value) {
      messageInputRef.value.focusInput()
    }
  } catch (error) {
    console.error('创建新对话失败:', error)
  }
}

// 组件挂载
onMounted(async () => {
  // 初始化应用状态
  appStore.initApp()
  
  // 初始化聊天
  await initializeChat()
  
  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeyboardShortcuts)
  
  // 聚焦输入框
  if (messageInputRef.value) {
    messageInputRef.value.focusInput()
  }
})

// 组件卸载
onUnmounted(() => {
  // 移除键盘事件监听
  document.removeEventListener('keydown', handleKeyboardShortcuts)
})
</script>

<style scoped>
.chat-interface {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8f9fa;
}

.messages-area {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.input-area {
  flex-shrink: 0;
  border-top: 1px solid #e4e7ed;
  background: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-interface {
    height: 100vh;
  }
}

/* 暗色主题支持 */
[data-theme="dark"] .chat-interface {
  background: #1a1a1a;
}

[data-theme="dark"] .input-area {
  background: #1f1f1f;
  border-top-color: #3a3a3a;
}
</style> 