<template>
  <div class="file-manager">
    <!-- 拖拽上传覆盖层 -->
    <!-- <DropZone 
      :disabled="isUploading"
      :max-files="maxFiles"
      @files-dropped="handleFilesDropped"
    /> -->

    <!-- 文件选择触发器 -->
    <div class="file-trigger" v-if="!hasFiles && showTrigger">
      <el-button 
        @click="triggerFileSelect"
        :disabled="isUploading"
        size="small"
        type="primary"
        plain
      >
        <el-icon><Folder /></el-icon>
        选择文件
      </el-button>
      
      <span class="trigger-hint">或拖拽文件到此处</span>
    </div>

    <!-- 文件列表展示 -->
    <div v-if="hasFiles" class="file-list-container">
      <!-- 文件列表 -->
      <div class="file-list">
        <TransitionGroup name="file-item" tag="div">
          <div 
            v-for="file in fileList" 
            :key="file.id" 
            class="file-item"
            :class="{ 
              'uploading': file.status === 'uploading',
              'completed': file.status === 'completed',
              'failed': file.status === 'failed'
            }"
          >
            <!-- 文件图标和信息 -->
            <div class="file-info">
              <div class="file-icon">
                <el-icon size="20" :color="getFileTypeColor(file.type)">
                  <component :is="getFileTypeIcon(file.type)" />
                </el-icon>
              </div>
              
              <div class="file-details">
                <div class="file-name" :title="file.name">{{ file.name }}</div>
                <div class="file-meta">
                  <span class="file-size">{{ formatFileSize(file.size) }}</span>
                  <span class="file-type">{{ getFileTypeLabel(file.type) }}</span>
                  <span v-if="file.status === 'uploading' && file.speed > 0" class="upload-speed">
                    {{ formatSpeed(file.speed) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 文件预览 -->
            <div v-if="canPreview(file)" class="file-preview" @click="previewFile(file)">
              <img 
                v-if="isImage(file)" 
                :src="file.previewUrl" 
                :alt="file.name"
                class="preview-image"
                @error="handleImageError"
              />
              <div v-else class="preview-placeholder">
                <el-icon><View /></el-icon>
              </div>
            </div>

            <!-- 文件状态 -->
            <div class="file-status">
              <!-- 上传进度 -->
              <div v-if="file.status === 'uploading'" class="status-uploading">
                <div class="progress-container">
                  <el-progress 
                    :percentage="file.progress" 
                    :stroke-width="6"
                    :show-text="false"
                    status="active"
                    class="progress-bar"
                  />
                  <span class="progress-text">{{ file.progress }}%</span>
                </div>
                <div v-if="file.remainingTime > 0" class="remaining-time">
                  剩余 {{ formatRemainingTime(file.remainingTime) }}
                </div>
              </div>

              <!-- 完成状态 -->
              <div v-else-if="file.status === 'completed'" class="status-completed">
                <el-icon color="#67c23a" size="16"><CircleCheck /></el-icon>
                <span>上传完成</span>
              </div>

              <!-- 失败状态 -->
              <div v-else-if="file.status === 'failed'" class="status-failed">
                <el-icon color="#f56c6c" size="16"><CircleClose /></el-icon>
                <span>上传失败</span>
                <el-button 
                  size="small" 
                  text 
                  type="primary" 
                  @click="retryUpload(file)"
                  class="retry-button"
                >
                  重试
                </el-button>
              </div>

              <!-- 等待状态 -->
              <div v-else class="status-pending">
                <el-icon color="#909399" size="16"><Clock /></el-icon>
                <span>等待上传</span>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="file-actions">
              <el-dropdown trigger="click" size="small">
                <el-button size="small" text>
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item 
                      v-if="canPreview(file)"
                      @click="previewFile(file)"
                      icon="View"
                    >
                      预览
                    </el-dropdown-item>
                    <el-dropdown-item 
                      v-if="file.status === 'failed'"
                      @click="retryUpload(file)"
                      icon="Refresh"
                    >
                      重试上传
                    </el-dropdown-item>
                    <el-dropdown-item 
                      @click="removeFile(file.id)"
                      :disabled="file.status === 'uploading'"
                      icon="Delete"
                      divided
                    >
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </TransitionGroup>
      </div>

      <!-- 添加更多文件按钮 -->
      <div class="add-more-section">
        <el-button 
          @click="triggerFileSelect"
          :disabled="isUploading || fileList.length >= maxFiles"
          size="small"
          text
          type="primary"
        >
          <el-icon><Plus /></el-icon>
          添加更多文件
        </el-button>
        
        <span v-if="fileList.length >= maxFiles" class="limit-hint">
          已达到最大文件数量限制
        </span>
      </div>

      <!-- 批量操作区域 -->
      <div class="batch-actions">
        <div class="batch-info">
          <span class="file-count">共 {{ fileList.length }} 个文件</span>
          <span class="total-size">总大小 {{ formatFileSize(totalSize) }}</span>
          <span v-if="uploadProgress.total > 0" class="upload-progress">
            进度: {{ Math.round((uploadProgress.completed / uploadProgress.total) * 100) }}%
          </span>
        </div>
        
        <div class="batch-buttons">
          <el-button 
            size="small" 
            @click="clearAllFiles"
            :disabled="isUploading"
          >
            <el-icon><Delete /></el-icon>
            清空全部
          </el-button>
          
          <el-button 
            size="small" 
            type="primary" 
            @click="startBatchUpload"
            :disabled="!hasPendingFiles || isUploading"
            :loading="isUploading"
          >
            <el-icon><Upload /></el-icon>
            {{ isUploading ? '上传中...' : '开始上传' }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInputRef"
      type="file"
      :accept="acceptedTypes"
      multiple
      @change="handleFileSelect"
      style="display: none"
    />

    <!-- 文件预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      :title="previewFile?.name"
      width="80%"
      :show-close="true"
      class="file-preview-dialog"
    >
      <div class="preview-content">
        <img 
          v-if="previewFileData && isImage(previewFileData)" 
          :src="previewFileData.previewUrl" 
          :alt="previewFileData.name"
          class="preview-full-image"
        />
        
        <div v-else class="preview-unsupported">
          <el-icon size="64"><Document /></el-icon>
          <p>此文件类型暂不支持预览</p>
          <p>{{ previewFileData?.name }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useUpload } from '@/composables/useUpload'
// import DropZone from './DropZone.vue'

// Props
const props = defineProps({
  showTrigger: {
    type: Boolean,
    default: true
  },
  maxFiles: {
    type: Number,
    default: 10
  },
  autoUpload: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'files-added', 
  'files-removed', 
  'upload-start', 
  'upload-progress', 
  'upload-complete',
  'upload-error'
])

// Stores & Composables
const appStore = useAppStore()
const { formatFileSize, formatSpeed, formatRemainingTime } = useUpload()

// 响应式引用
const fileInputRef = ref(null)
const fileList = ref([])
const isUploading = ref(false)
const uploadProgress = ref({ completed: 0, total: 0 })
const previewDialogVisible = ref(false)
const previewFileData = ref(null)

// 计算属性
const hasFiles = computed(() => fileList.value.length > 0)
const hasPendingFiles = computed(() => fileList.value.some(file => file.status === 'pending'))

const totalSize = computed(() => 
  fileList.value.reduce((sum, file) => sum + file.size, 0)
)

const acceptedTypes = computed(() => 
  (appStore.appConfig?.allowedFileTypes || []).join(',')
)

// 文件类型工具方法
function getFileTypeIcon(fileType) {
  const type = fileType?.toLowerCase() || ''
  
  if (type.includes('image')) return 'Picture'
  if (type.includes('pdf')) return 'Document'
  if (type.includes('text')) return 'DocumentCopy'
  if (type.includes('video')) return 'VideoPlay'
  if (type.includes('audio')) return 'Headphones'
  if (type.includes('zip') || type.includes('rar')) return 'FolderZip'
  if (type.includes('excel') || type.includes('spreadsheet')) return 'Grid'
  if (type.includes('word') || type.includes('document')) return 'Document'
  
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
  if (type.includes('zip') || type.includes('rar')) return '压缩包'
  if (type.includes('excel') || type.includes('spreadsheet')) return 'Excel'
  if (type.includes('word') || type.includes('document')) return 'Word'
  
  return '文件'
}

function isImage(file) {
  return file.type?.startsWith('image/')
}

function canPreview(file) {
  return isImage(file)
}

// 文件预览
function createPreviewUrl(file) {
  if (isImage(file)) {
    return URL.createObjectURL(file.raw || file)
  }
  return null
}

function previewFile(file) {
  previewFileData.value = file
  previewDialogVisible.value = true
}

function handleImageError(e) {
  console.warn('图片预览加载失败:', e)
}

// 文件操作
function triggerFileSelect() {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

function handleFileSelect(e) {
  const files = Array.from(e.target.files)
  if (files.length > 0) {
    addFiles(files)
  }
  e.target.value = ''
}

function handleFilesDropped(files) {
  addFiles(files)
}

function addFiles(files) {
  if (fileList.value.length + files.length > props.maxFiles) {
    appStore.showError(`最多只能选择 ${props.maxFiles} 个文件`)
    return
  }
  
  const newFiles = []
  
  for (const file of files) {
    // 验证文件
    const validation = validateFile(file)
    if (!validation.isValid) {
      appStore.showError(`文件 "${file.name}" 验证失败: ${validation.errors.join(', ')}`)
      continue
    }
    
    const fileItem = {
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      raw: file,
      status: 'pending',
      progress: 0,
      speed: 0,
      remainingTime: 0,
      previewUrl: createPreviewUrl(file),
      error: null
    }
    
    fileList.value.push(fileItem)
    newFiles.push(fileItem)
  }
  
  if (newFiles.length > 0) {
    emit('files-added', newFiles)
    
    if (props.autoUpload) {
      startBatchUpload()
    }
  }
}

function validateFile(file) {
  const errors = []
  const config = appStore.appConfig || {}

  // 检查文件大小
  if (file.size > (config.maxFileSize || 10485760)) {
    const maxSizeMB = Math.round((config.maxFileSize || 10485760) / (1024 * 1024))
    errors.push(`文件大小超出限制 (最大 ${maxSizeMB}MB)`)
  }

  // 检查文件类型
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
  const allowedTypes = config.allowedFileTypes || ['.jpg', '.png', '.pdf', '.txt', '.docx']
  if (!allowedTypes.includes(fileExtension)) {
    errors.push(`不支持的文件类型: ${fileExtension}`)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

function removeFile(fileId) {
  const index = fileList.value.findIndex(file => file.id === fileId)
  if (index !== -1) {
    const file = fileList.value[index]
    
    // 释放预览URL
    if (file.previewUrl) {
      URL.revokeObjectURL(file.previewUrl)
    }
    
    fileList.value.splice(index, 1)
    emit('files-removed', [file])
  }
}

function clearAllFiles() {
  // 释放所有预览URL
  fileList.value.forEach(file => {
    if (file.previewUrl) {
      URL.revokeObjectURL(file.previewUrl)
    }
  })
  
  const removedFiles = [...fileList.value]
  fileList.value = []
  uploadProgress.value = { completed: 0, total: 0 }
  
  emit('files-removed', removedFiles)
}

// 上传处理
async function startBatchUpload() {
  if (!hasPendingFiles.value || isUploading.value) return
  
  isUploading.value = true
  const pendingFiles = fileList.value.filter(file => file.status === 'pending')
  
  uploadProgress.value = {
    completed: 0,
    total: pendingFiles.length
  }
  
  emit('upload-start', pendingFiles)
  
  try {
    for (const file of pendingFiles) {
      try {
        await uploadSingleFile(file)
        uploadProgress.value.completed++
        emit('upload-progress', {
          file,
          completed: uploadProgress.value.completed,
          total: uploadProgress.value.total
        })
      } catch (error) {
        emit('upload-error', { file, error })
      }
    }
    
    emit('upload-complete', fileList.value)
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
    file.error = error.message
    throw error
  }
}

function simulateUpload(file) {
  return new Promise((resolve, reject) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 10
      file.progress = Math.min(Math.round(progress), 95)
      file.speed = 1024 * 1024 * (0.5 + Math.random())
      file.remainingTime = (100 - file.progress) / 10
      
      if (progress >= 95) {
        clearInterval(interval)
        setTimeout(() => {
          if (Math.random() > 0.1) { // 90%成功率
            file.progress = 100
            resolve()
          } else {
            reject(new Error('模拟上传失败'))
          }
        }, 200)
      }
    }, 100)
  })
}

function retryUpload(file) {
  if (isUploading.value) return
  
  file.status = 'pending'
  file.progress = 0
  file.speed = 0
  file.remainingTime = 0
  file.error = null
  
  // 自动开始上传
  startBatchUpload()
}

// 清理工作
onUnmounted(() => {
  // 清理所有预览URL
  fileList.value.forEach(file => {
    if (file.previewUrl) {
      URL.revokeObjectURL(file.previewUrl)
    }
  })
})

// 暴露方法给父组件
defineExpose({
  addFiles,
  clearAllFiles,
  startBatchUpload,
  getFileList: () => fileList.value,
  getCompletedFiles: () => fileList.value.filter(f => f.status === 'completed')
})
</script>

<style scoped>
.file-manager {
  width: 100%;
}

.file-trigger {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  background-color: #fafafa;
  transition: all 0.3s ease;
}

.file-trigger:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.trigger-hint {
  color: #909399;
  font-size: 14px;
}

.file-list-container {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background-color: #fff;
  overflow: hidden;
}

.file-list {
  max-height: 300px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f7fa;
  transition: all 0.3s ease;
}

.file-item:last-child {
  border-bottom: none;
}

.file-item:hover {
  background-color: #f8f9fa;
}

.file-item.uploading {
  background-color: #f0f9ff;
}

.file-item.completed {
  background-color: #f0f9ff;
}

.file-item.failed {
  background-color: #fef2f2;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.file-icon {
  flex-shrink: 0;
}

.file-details {
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
}

.upload-speed {
  color: #409eff;
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

.preview-image {
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
  min-width: 120px;
}

.status-uploading {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  width: 80px;
}

.progress-text {
  font-size: 12px;
  color: #409eff;
  white-space: nowrap;
}

.remaining-time {
  font-size: 11px;
  color: #909399;
}

.status-completed,
.status-failed,
.status-pending {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.status-completed {
  color: #67c23a;
}

.status-failed {
  color: #f56c6c;
}

.status-pending {
  color: #909399;
}

.retry-button {
  margin-left: 8px;
  padding: 0 4px;
}

.file-actions {
  flex-shrink: 0;
}

.add-more-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f7fa;
  background-color: #fafafa;
}

.limit-hint {
  font-size: 12px;
  color: #f56c6c;
}

.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8f9fa;
}

.batch-info {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: #606266;
}

.upload-progress {
  color: #409eff;
  font-weight: 500;
}

.batch-buttons {
  display: flex;
  gap: 8px;
}

/* 过渡动画 */
.file-item-enter-active,
.file-item-leave-active {
  transition: all 0.3s ease;
}

.file-item-enter-from,
.file-item-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.file-item-move {
  transition: transform 0.3s ease;
}

/* 预览对话框 */
.file-preview-dialog .preview-content {
  text-align: center;
}

.preview-full-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

.preview-unsupported {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px;
  color: #909399;
}
</style> 