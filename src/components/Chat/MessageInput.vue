<template>
  <div class="message-input">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button-group size="small">
          <el-button 
            @click="clearMessages" 
            :disabled="isLoading || messages.length === 0"
            title="清空对话"
          >
            <el-icon><Delete /></el-icon>
            清空
          </el-button>
          
          <el-button 
            @click="exportChat" 
            :disabled="messages.length === 0"
            title="导出对话"
          >
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </el-button-group>

        <!-- 文件上传 -->
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :show-file-list="false"
          :accept="acceptedFileTypes"
          :multiple="true"
          :on-change="handleFileSelect"
          class="upload-button"
        >
                     <el-button size="small" :disabled="isLoading">
             <el-icon><Folder /></el-icon>
             附件
           </el-button>
        </el-upload>
      </div>

      <div class="toolbar-right">
        <el-tag v-if="selectedFiles.length > 0" type="success" size="small">
          已选择 {{ selectedFiles.length }} 个文件
          <el-button 
            size="small" 
            text 
            @click="clearSelectedFiles"
            style="margin-left: 4px;"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </el-tag>
      </div>
    </div>

    <!-- 已选择的文件列表 -->
    <div v-if="selectedFiles.length > 0" class="selected-files">
      <div 
        v-for="file in selectedFiles" 
        :key="file.uid" 
        class="file-item"
      >
        <el-icon><Document /></el-icon>
        <span class="file-name">{{ file.name }}</span>
        <span class="file-size">({{ formatFileSize(file.size) }})</span>
        <el-button 
          size="small" 
          text 
          type="danger" 
          @click="removeFile(file.uid)"
        >
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <el-input
        ref="inputRef"
        v-model="messageText"
        type="textarea"
        :rows="inputRows"
        :maxlength="maxLength"
        :placeholder="inputPlaceholder"
        :disabled="isLoading"
        resize="none"
        @keydown="handleKeydown"
        @input="handleInput"
        class="message-textarea"
      />
      
      <!-- 字符计数 -->
      <div class="char-count" v-if="showCharCount">
        {{ messageText.length }} / {{ maxLength }}
      </div>
    </div>

    <!-- 发送按钮区域 -->
    <div class="send-area">
      <div class="send-actions">
        <div class="send-hint">
          <span>{{ sendHint }}</span>
        </div>
        
        <el-button
          type="primary"
          :loading="isLoading"
          :disabled="!canSend"
          @click="sendMessage"
          class="send-button"
        >
          <el-icon v-if="!isLoading"><Promotion /></el-icon>
          {{ sendButtonText }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useUpload } from '@/composables/useUpload'

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
  maxLength: {
    type: Number,
    default: 2000
  },
  minRows: {
    type: Number,
    default: 2
  },
  maxRows: {
    type: Number,
    default: 6
  },
  autoFocus: {
    type: Boolean,
    default: true
  },
  showCharCount: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['send-message', 'clear-messages', 'export-chat', 'upload-files'])

// Stores
const appStore = useAppStore()
const uploadComposable = useUpload()

// 响应式引用
const inputRef = ref(null)
const uploadRef = ref(null)
const messageText = ref('')
const selectedFiles = ref([])
const inputRows = ref(props.minRows)

// 计算属性
const canSend = computed(() => {
  return (messageText.value.trim() || selectedFiles.value.length > 0) && !props.isLoading
})

const sendButtonText = computed(() => {
  if (props.isLoading) return '发送中...'
  if (selectedFiles.value.length > 0) return '发送文件'
  return '发送'
})

const inputPlaceholder = computed(() => {
  if (props.isLoading) return '正在处理中，请稍候...'
  return '请输入您的问题... (Ctrl/Cmd + Enter 发送)'
})

const sendHint = computed(() => {
  if (selectedFiles.value.length > 0) {
    return `Ctrl/Cmd + Enter 发送消息和 ${selectedFiles.value.length} 个文件`
  }
  return 'Ctrl/Cmd + Enter 发送消息'
})

const acceptedFileTypes = computed(() => {
  return appStore.appConfig.allowedFileTypes.join(',')
})

// 监听输入内容变化，动态调整行数
watch(messageText, (newValue) => {
  nextTick(() => {
    adjustTextareaHeight()
  })
})

// 处理键盘事件
function handleKeydown(event) {
  // Ctrl/Cmd + Enter 发送消息
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault()
    sendMessage()
    return
  }

  // Shift + Enter 换行
  if (event.shiftKey && event.key === 'Enter') {
    // 默认行为，允许换行
    return
  }

  // 单独 Enter 键的处理
  if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
    // 在移动设备上允许换行，在桌面设备上发送
    if (window.innerWidth <= 768) {
      // 移动设备，允许换行
      return
    } else {
      // 桌面设备，发送消息
      event.preventDefault()
      sendMessage()
    }
  }
}

// 处理输入变化
function handleInput() {
  // 这里可以添加输入验证逻辑
}

// 动态调整文本框高度
function adjustTextareaHeight() {
  if (!inputRef.value || !inputRef.value.textarea) return

  const textarea = inputRef.value.textarea
  const lineHeight = parseInt(getComputedStyle(textarea).lineHeight)
  const lines = messageText.value.split('\n').length
  const contentLines = Math.max(lines, messageText.value.length / 50) // 估算行数
  
  const targetRows = Math.min(Math.max(Math.ceil(contentLines), props.minRows), props.maxRows)
  
  if (targetRows !== inputRows.value) {
    inputRows.value = targetRows
  }
}

// 发送消息
async function sendMessage() {
  if (!canSend.value) return

  const content = messageText.value.trim()
  const files = [...selectedFiles.value]

  // 清空输入
  messageText.value = ''
  selectedFiles.value = []
  inputRows.value = props.minRows

  try {
    // 如果有文件，先上传文件
    if (files.length > 0) {
      emit('upload-files', files)
    }

    // 发送消息
    if (content) {
      emit('send-message', content, { files })
    }

    // 重新聚焦输入框
    focusInput()
  } catch (error) {
    console.error('发送消息失败:', error)
    // 恢复输入内容
    messageText.value = content
    selectedFiles.value = files
  }
}

// 清空消息
function clearMessages() {
  emit('clear-messages')
}

// 导出对话
function exportChat() {
  emit('export-chat')
}

// 处理文件选择
function handleFileSelect(file, fileList) {
  // 验证文件
  const validation = uploadComposable.validateFile(file.raw)
  
  if (!validation.isValid) {
    appStore.showError(`文件 "${file.name}" 验证失败: ${validation.errors.join(', ')}`)
    return
  }

  // 检查是否已存在
  const exists = selectedFiles.value.some(f => 
    f.name === file.name && f.size === file.size
  )
  
  if (exists) {
    appStore.showWarning(`文件 "${file.name}" 已存在`)
    return
  }

  // 添加到选中列表
  selectedFiles.value.push({
    uid: file.uid,
    name: file.name,
    size: file.size,
    raw: file.raw
  })

  appStore.showSuccess(`已添加文件: ${file.name}`)
}

// 移除文件
function removeFile(uid) {
  const index = selectedFiles.value.findIndex(f => f.uid === uid)
  if (index !== -1) {
    const file = selectedFiles.value[index]
    selectedFiles.value.splice(index, 1)
    appStore.showInfo(`已移除文件: ${file.name}`)
  }
}

// 清空选中的文件
function clearSelectedFiles() {
  selectedFiles.value = []
  appStore.showInfo('已清空选中的文件')
}

// 格式化文件大小
function formatFileSize(bytes) {
  return uploadComposable.formatFileSize(bytes)
}

// 聚焦输入框
function focusInput() {
  nextTick(() => {
    if (inputRef.value && inputRef.value.textarea) {
      inputRef.value.textarea.focus()
    }
  })
}

// 组件挂载后聚焦
onMounted(() => {
  if (props.autoFocus) {
    focusInput()
  }
})

// 导出方法供父组件调用
defineExpose({
  focusInput,
  clearInput: () => {
    messageText.value = ''
    selectedFiles.value = []
    inputRows.value = props.minRows
  }
})
</script>

<style scoped>
.message-input {
  background: white;
  border-top: 1px solid #e4e7ed;
  padding: 16px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-button {
  display: inline-block;
}

.selected-files {
  margin-bottom: 12px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.file-item:not(:last-child) {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 8px;
  margin-bottom: 4px;
}

.file-name {
  flex: 1;
  font-size: 14px;
  color: #303133;
  word-break: break-all;
}

.file-size {
  font-size: 12px;
  color: #909399;
}

.input-area {
  position: relative;
}

.message-textarea {
  transition: all 0.3s ease;
}

.message-textarea :deep(.el-textarea__inner) {
  padding-right: 60px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  line-height: 1.5;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.message-textarea :deep(.el-textarea__inner):focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.char-count {
  position: absolute;
  right: 8px;
  bottom: 8px;
  font-size: 12px;
  color: #c0c4cc;
  pointer-events: none;
  z-index: 1;
}

.send-area {
  margin-top: 12px;
}

.send-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.send-hint {
  font-size: 12px;
  color: #909399;
}

.send-button {
  min-width: 80px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.send-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .message-input {
    padding: 12px;
  }
  
  .toolbar {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
  
  .toolbar-left,
  .toolbar-right {
    justify-content: center;
  }
  
  .send-actions {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
  
  .send-button {
    width: 100%;
  }
  
  .char-count {
    position: static;
    text-align: right;
    margin-top: 4px;
  }
  
  .message-textarea :deep(.el-textarea__inner) {
    padding-right: 12px;
  }
}

/* 暗色主题支持 */
[data-theme="dark"] .message-input {
  background: #1f1f1f;
  border-top-color: #3a3a3a;
}

[data-theme="dark"] .selected-files {
  background: #2a2a2a;
  border-color: #3a3a3a;
}

[data-theme="dark"] .file-item {
  color: #e4e7ed;
}

[data-theme="dark"] .file-item:not(:last-child) {
  border-bottom-color: #3a3a3a;
}

[data-theme="dark"] .message-textarea :deep(.el-textarea__inner) {
  background: #2a2a2a;
  border-color: #3a3a3a;
  color: #e4e7ed;
}

[data-theme="dark"] .message-textarea :deep(.el-textarea__inner):focus {
  border-color: #409eff;
}
</style> 