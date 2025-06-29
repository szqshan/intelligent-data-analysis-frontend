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

    <!-- 增强的文件列表 -->
    <div v-if="selectedFiles.length > 0" class="enhanced-file-list">
      <div class="file-list-header">
        <span class="file-count">已选择 {{ selectedFiles.length }} 个文件</span>
        <el-button 
          size="small" 
          text 
          @click="clearSelectedFiles"
        >
          <el-icon><Close /></el-icon>
          清空
        </el-button>
      </div>
      
      <div class="file-items">
        <div 
          v-for="file in selectedFiles" 
          :key="file.uid || file.id" 
          class="enhanced-file-item"
          :class="{
            'uploading': file.status === 'uploading',
            'completed': file.status === 'completed',
            'failed': file.status === 'failed'
          }"
        >
          <!-- 文件图标 -->
          <div class="file-icon">
            <el-icon size="20" :color="getFileTypeColor(file.type || file.raw?.type)">
              <component :is="getFileTypeIcon(file.type || file.raw?.type)" />
            </el-icon>
          </div>
          
          <!-- 文件信息 -->
          <div class="file-info">
            <div class="file-name" :title="file.name">{{ file.name }}</div>
            <div class="file-meta">
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
              <span class="file-type">{{ getFileTypeLabel(file.type || file.raw?.type) }}</span>
              <!-- 分析能力标识 -->
              <span v-if="file.capabilities?.canAnalyze" class="analysis-badge">
                <el-icon size="12"><TrendCharts /></el-icon>
                可分析
              </span>
              <span v-else-if="file.capabilities?.category" class="category-badge" :style="{ color: file.capabilities.category.color }">
                {{ file.capabilities.category.label }}
              </span>
            </div>
          </div>
          
          <!-- 文件预览 -->
          <div v-if="canPreview(file)" class="file-preview" @click="previewFile(file)">
            <img 
              v-if="isImageFile(file)" 
              :src="file.previewUrl" 
              :alt="file.name"
              class="preview-thumb"
            />
            <div v-else class="preview-placeholder">
              <el-icon><View /></el-icon>
            </div>
          </div>
          
          <!-- 上传状态 -->
          <div class="file-status">
            <div v-if="file.status === 'uploading'" class="status-uploading">
              <el-progress 
                :percentage="file.progress || 0" 
                :stroke-width="4"
                :show-text="false"
                status="active"
              />
              <span class="progress-text">{{ file.progress || 0 }}%</span>
            </div>
            <div v-else-if="file.status === 'completed'" class="status-completed">
              <el-icon color="#67c23a"><CircleCheck /></el-icon>
            </div>
            <div v-else-if="file.status === 'failed'" class="status-failed">
              <el-icon color="#f56c6c"><CircleClose /></el-icon>
            </div>
            <div v-else class="status-pending">
              <el-icon color="#909399"><Clock /></el-icon>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="file-actions">
            <el-button 
              size="small" 
              text 
              type="danger" 
              @click="removeFile(file.uid || file.id)"
              :disabled="file.status === 'uploading'"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 批量操作 -->
      <div class="file-batch-actions">
        <div class="batch-info">
          总大小: {{ formatFileSize(totalFileSize) }}
        </div>
        <div class="batch-buttons">
          <el-button 
            size="small" 
            @click="startBatchUpload"
            :disabled="!hasPendingFiles || isUploading"
            :loading="isUploading"
            type="primary"
          >
            <el-icon><Upload /></el-icon>
            {{ isUploading ? '上传中...' : '开始上传' }}
          </el-button>
        </div>
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
const isUploading = ref(false)

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

const totalFileSize = computed(() => 
  selectedFiles.value.reduce((sum, file) => sum + file.size, 0)
)

const hasPendingFiles = computed(() => 
  selectedFiles.value.some(file => !file.status || file.status === 'pending')
)

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
    // 显示详细的错误信息
    const errorDetails = validation.errors.map(error => `• ${error}`).join('\n')
    appStore.showError(`文件 "${file.name}" 验证失败:\n${errorDetails}`, {
      title: '文件格式或大小错误',
      duration: 10000, // 显示10秒
      autoClose: false
    })
    return false // 阻止文件被添加到Element Plus的文件列表
  }

  // 检查是否已存在
  const exists = selectedFiles.value.some(f => 
    f.name === file.name && f.size === file.size
  )
  
  if (exists) {
    appStore.showWarning(`文件 "${file.name}" 已存在，请选择不同的文件`, {
      duration: 5000
    })
    return false
  }

  // 获取文件能力信息
  const capabilities = uploadComposable.getFileCapabilities(file.raw)

  // 创建预览URL
  let previewUrl = null
  if (file.raw && file.raw.type.startsWith('image/')) {
    previewUrl = URL.createObjectURL(file.raw)
  }

  // 添加到选中列表
  selectedFiles.value.push({
    uid: file.uid,
    name: file.name,
    size: file.size,
    type: file.raw?.type,
    raw: file.raw,
    status: 'pending',
    progress: 0,
    previewUrl,
    capabilities // 添加能力信息
  })

  // 根据分析能力显示不同的提示
  if (capabilities.canAnalyze) {
    appStore.showSuccess(`已成功添加可分析文件: ${file.name} (${formatFileSize(file.size)})`, {
      duration: 3000
    })
  } else {
    appStore.showInfo(`已添加文件: ${file.name} (${formatFileSize(file.size)}) - ${capabilities.category.description}`, {
      duration: 5000
    })
  }
  
  return true
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
  // 释放预览URL
  selectedFiles.value.forEach(file => {
    if (file.previewUrl) {
      URL.revokeObjectURL(file.previewUrl)
    }
  })
  
  selectedFiles.value = []
  appStore.showInfo('已清空选中的文件')
}

// 文件类型工具方法
function getFileTypeIcon(fileType) {
  const type = fileType?.toLowerCase() || ''
  
  if (type.includes('image')) return 'Picture'
  if (type.includes('pdf')) return 'Document'
  if (type.includes('text')) return 'DocumentCopy'
  if (type.includes('video')) return 'VideoPlay'
  if (type.includes('audio')) return 'Headphones'
  
  return 'Document'
}

function getFileTypeColor(fileType) {
  const type = fileType?.toLowerCase() || ''
  
  if (type.includes('image')) return '#67c23a'
  if (type.includes('pdf')) return '#f56c6c'
  if (type.includes('text')) return '#409eff'
  if (type.includes('video')) return '#e6a23c'
  if (type.includes('audio')) return '#909399'
  
  return '#909399'
}

function getFileTypeLabel(fileType) {
  const type = fileType?.toLowerCase() || ''
  
  if (type.includes('image')) return '图片'
  if (type.includes('pdf')) return 'PDF'
  if (type.includes('text')) return '文本'
  if (type.includes('video')) return '视频'
  if (type.includes('audio')) return '音频'
  
  return '文件'
}

function isImageFile(file) {
  return file.type?.startsWith('image/') || file.raw?.type?.startsWith('image/')
}

function canPreview(file) {
  return isImageFile(file) && file.previewUrl
}

function previewFile(file) {
  if (file.previewUrl) {
    window.open(file.previewUrl, '_blank')
  }
}

// 批量上传功能
async function startBatchUpload() {
  if (!hasPendingFiles.value || isUploading.value) return
  
  isUploading.value = true
  
  try {
    const pendingFiles = selectedFiles.value.filter(f => !f.status || f.status === 'pending')
    
    for (const file of pendingFiles) {
      try {
        await uploadSingleFile(file)
      } catch (error) {
        console.error(`文件 ${file.name} 上传失败:`, error)
      }
    }
    
    const completedFiles = selectedFiles.value.filter(f => f.status === 'completed')
    if (completedFiles.length > 0) {
      appStore.showSuccess(`成功上传 ${completedFiles.length} 个文件`)
    }
  } finally {
    isUploading.value = false
  }
}

async function uploadSingleFile(file) {
  file.status = 'uploading'
  file.progress = 0
  
  try {
    // 模拟上传过程
    await simulateUpload(file)
    file.status = 'completed'
    file.progress = 100
  } catch (error) {
    file.status = 'failed'
    throw error
  }
}

function simulateUpload(file) {
  return new Promise((resolve, reject) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15
      file.progress = Math.min(Math.round(progress), 100)
      
      if (progress >= 100) {
        clearInterval(interval)
        if (Math.random() > 0.1) {
          resolve()
        } else {
          reject(new Error('模拟上传失败'))
        }
      }
    }, 200)
  })
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

.enhanced-file-list {
  margin-bottom: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.file-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.file-count {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.file-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.enhanced-file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
}

.enhanced-file-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.1);
}

.enhanced-file-item.uploading {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.enhanced-file-item.completed {
  border-color: #67c23a;
  background-color: #f0f9ff;
}

.enhanced-file-item.failed {
  border-color: #f56c6c;
  background-color: #fef2f2;
}

.file-icon {
  flex-shrink: 0;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.file-meta {
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.analysis-badge {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  background-color: #f0f9ff;
  color: #67c23a;
  border: 1px solid #b3e19d;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  background-color: rgba(144, 147, 153, 0.1);
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
}

.file-preview {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  transition: all 0.3s ease;
}

.file-preview:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.preview-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-placeholder {
  font-size: 12px;
  color: #909399;
}

.file-status {
  flex-shrink: 0;
  min-width: 80px;
}

.status-uploading {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-uploading .el-progress {
  width: 50px;
}

.progress-text {
  font-size: 12px;
  color: #409eff;
  white-space: nowrap;
}

.status-completed,
.status-failed,
.status-pending {
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-actions {
  flex-shrink: 0;
}

.file-batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid #e4e7ed;
}

.batch-info {
  font-size: 14px;
  color: #606266;
}

.batch-buttons {
  display: flex;
  gap: 8px;
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