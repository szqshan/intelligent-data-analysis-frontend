<template>
  <div class="file-upload-component">
    <!-- 拖拽上传区域 -->
    <div 
      ref="dropZoneRef"
      class="drop-zone"
      :class="{ 
        'drop-active': isDragOver, 
        'drop-disabled': isDisabled,
        'has-files': hasFiles 
      }"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @click="triggerFileSelect"
    >
      <div class="drop-zone-content">
        <div v-if="!hasFiles" class="drop-zone-empty">
          <el-icon class="upload-icon" size="48">
            <Upload />
          </el-icon>
          <div class="drop-zone-text">
            <p class="primary-text">
              拖拽文件到此处，或 
              <span class="link-text">点击选择文件</span>
            </p>
            <p class="secondary-text">
              支持多种格式，单个文件最大 {{ maxSizeMB }}MB
            </p>
          </div>
        </div>

        <!-- 文件列表 -->
        <div v-else class="file-list">
          <div 
            v-for="file in fileList" 
            :key="file.id" 
            class="file-item"
            :class="{ 'file-uploading': file.status === 'uploading' }"
          >
            <!-- 文件图标和信息 -->
            <div class="file-info">
              <div class="file-icon">
                <el-icon size="24" :color="getFileTypeColor(file.type)">
                  <component :is="getFileTypeIcon(file.type)" />
                </el-icon>
              </div>
              
              <div class="file-details">
                <div class="file-name" :title="file.name">{{ file.name }}</div>
                <div class="file-meta">
                  {{ formatFileSize(file.size) }} • {{ getFileTypeLabel(file.type) }}
                  <span v-if="file.status === 'uploading' && file.speed > 0" class="upload-speed">
                    • {{ formatSpeed(file.speed) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 文件预览 -->
            <div v-if="canPreview(file)" class="file-preview" @click="openPreview(file)">
              <img 
                v-if="isImage(file)" 
                :src="file.previewUrl" 
                :alt="file.name"
                class="preview-image"
              />
              <div v-else class="preview-placeholder">
                <el-icon><View /></el-icon>
                预览
              </div>
            </div>

            <!-- 上传状态和操作 -->
            <div class="file-actions">
              <!-- 上传进度 -->
              <div v-if="file.status === 'uploading'" class="upload-progress">
                <el-progress 
                  :percentage="file.progress" 
                  :stroke-width="4"
                  status="active"
                  class="progress-bar"
                />
                <div class="progress-text">
                  {{ file.progress }}%
                </div>
              </div>

              <!-- 完成状态 -->
              <div v-else-if="file.status === 'completed'" class="upload-completed">
                <el-icon color="#67c23a"><CircleCheck /></el-icon>
                <span>已完成</span>
              </div>

              <!-- 错误状态 -->
              <div v-else-if="file.status === 'failed'" class="upload-failed">
                <el-icon color="#f56c6c"><CircleClose /></el-icon>
                <span>失败</span>
              </div>

              <!-- 待上传状态 -->
              <div v-else class="upload-pending">
                <el-icon color="#909399"><Clock /></el-icon>
                <span>等待</span>
              </div>

              <!-- 删除按钮 -->
              <el-button 
                size="small" 
                text 
                type="danger" 
                @click="removeFile(file.id)"
                :disabled="file.status === 'uploading'"
                class="remove-button"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInputRef"
      type="file"
      :accept="acceptedTypes"
      :multiple="multiple"
      @change="handleFileSelect"
      style="display: none"
    />

    <!-- 批量操作按钮 -->
    <div v-if="hasFiles" class="batch-actions">
      <div class="batch-info">
        共 {{ fileList.length }} 个文件
      </div>
      
      <div class="batch-buttons">
        <el-button 
          size="small" 
          @click="clearAllFiles"
          :disabled="hasUploading"
        >
          清空
        </el-button>
        
        <el-button 
          size="small" 
          type="primary" 
          @click="startUpload"
          :disabled="!hasPendingFiles || hasUploading"
          :loading="hasUploading"
        >
          <el-icon><Upload /></el-icon>
          开始上传
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'

// Props
const props = defineProps({
  multiple: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  maxFiles: {
    type: Number,
    default: 10
  }
})

// Emits
const emit = defineEmits(['file-added', 'file-removed', 'upload-complete'])

// Stores
const appStore = useAppStore()

// 响应式引用
const dropZoneRef = ref(null)
const fileInputRef = ref(null)
const isDragOver = ref(false)
const fileList = ref([])

// 计算属性
const isDisabled = computed(() => props.disabled)
const hasFiles = computed(() => fileList.value.length > 0)
const hasUploading = computed(() => fileList.value.some(file => file.status === 'uploading'))
const hasPendingFiles = computed(() => fileList.value.some(file => file.status === 'pending'))

const maxSizeMB = computed(() => 
  Math.round((appStore.appConfig?.maxFileSize || 10485760) / (1024 * 1024))
)

const acceptedTypes = computed(() => 
  (appStore.appConfig?.allowedFileTypes || []).join(',')
)

// 文件类型相关方法
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

function isImage(file) {
  return file.type?.startsWith('image/')
}

function canPreview(file) {
  return isImage(file)
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatSpeed(bytesPerSecond) {
  return formatFileSize(bytesPerSecond) + '/s'
}

// 预览相关方法
function createPreviewUrl(file) {
  if (isImage(file)) {
    return URL.createObjectURL(file.raw || file)
  }
  return null
}

function openPreview(file) {
  // 简单的预览功能
  if (file.previewUrl) {
    window.open(file.previewUrl, '_blank')
  }
}

// 拖拽相关方法
function handleDragOver(e) {
  e.preventDefault()
  if (!isDisabled.value) {
    isDragOver.value = true
  }
}

function handleDragEnter(e) {
  e.preventDefault()
  if (!isDisabled.value) {
    isDragOver.value = true
  }
}

function handleDragLeave(e) {
  e.preventDefault()
  isDragOver.value = false
}

function handleDrop(e) {
  e.preventDefault()
  isDragOver.value = false
  
  if (isDisabled.value) return
  
  const files = Array.from(e.dataTransfer.files)
  if (files.length > 0) {
    addFiles(files)
  }
}

// 文件选择和处理
function triggerFileSelect() {
  if (!isDisabled.value && fileInputRef.value) {
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

function addFiles(files) {
  if (fileList.value.length + files.length > props.maxFiles) {
    appStore.showError(`最多只能选择 ${props.maxFiles} 个文件`)
    return
  }
  
  for (const file of files) {
    const fileItem = {
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      raw: file,
      status: 'pending',
      progress: 0,
      speed: 0,
      previewUrl: createPreviewUrl(file)
    }
    
    fileList.value.push(fileItem)
    emit('file-added', fileItem)
  }
}

function removeFile(fileId) {
  const index = fileList.value.findIndex(file => file.id === fileId)
  if (index !== -1) {
    const file = fileList.value[index]
    
    if (file.previewUrl) {
      URL.revokeObjectURL(file.previewUrl)
    }
    
    fileList.value.splice(index, 1)
    emit('file-removed', file)
  }
}

function clearAllFiles() {
  fileList.value.forEach(file => {
    if (file.previewUrl) {
      URL.revokeObjectURL(file.previewUrl)
    }
  })
  
  fileList.value = []
}

async function startUpload() {
  if (!hasPendingFiles.value) return
  
  try {
    const pendingFiles = fileList.value.filter(file => file.status === 'pending')
    
    for (const file of pendingFiles) {
      file.status = 'uploading'
      
      try {
        await simulateUpload(file)
        file.status = 'completed'
        file.progress = 100
      } catch (error) {
        file.status = 'failed'
      }
    }
    
    emit('upload-complete', fileList.value)
  } catch (error) {
    appStore.showError('上传过程中发生错误')
  }
}

// 模拟上传过程
function simulateUpload(file) {
  return new Promise((resolve) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15
      file.progress = Math.min(Math.round(progress), 100)
      file.speed = 1024 * 1024 * (0.5 + Math.random())
      
      if (progress >= 100) {
        clearInterval(interval)
        resolve()
      }
    }, 200)
  })
}
</script>

<style scoped>
.file-upload-component {
  width: 100%;
}

.drop-zone {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  background-color: #fafafa;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drop-zone:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.drop-zone.drop-active {
  border-color: #409eff;
  background-color: #e6f7ff;
  transform: scale(1.02);
}

.drop-zone.drop-disabled {
  border-color: #e4e7ed;
  background-color: #f5f7fa;
  cursor: not-allowed;
  opacity: 0.6;
}

.drop-zone.has-files {
  border-style: solid;
  padding: 16px;
  min-height: auto;
}

.drop-zone-content {
  width: 100%;
}

.drop-zone-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-icon {
  color: #409eff;
}

.drop-zone-text {
  color: #606266;
}

.primary-text {
  font-size: 16px;
  margin: 0 0 8px;
}

.link-text {
  color: #409eff;
  cursor: pointer;
}

.secondary-text {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background-color: #fff;
  transition: all 0.3s ease;
}

.file-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.1);
}

.file-item.file-uploading {
  border-color: #409eff;
  background-color: #f0f9ff;
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
  gap: 4px;
}

.upload-speed {
  color: #409eff;
}

.file-preview {
  width: 40px;
  height: 40px;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.file-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.upload-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 100px;
}

.progress-bar {
  width: 80px;
}

.progress-text {
  font-size: 12px;
  color: #409eff;
  white-space: nowrap;
}

.upload-completed,
.upload-failed,
.upload-pending {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  white-space: nowrap;
}

.upload-completed {
  color: #67c23a;
}

.upload-failed {
  color: #f56c6c;
}

.upload-pending {
  color: #909399;
}

.remove-button {
  padding: 4px;
}

.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.batch-info {
  font-size: 14px;
  color: #606266;
}

.batch-buttons {
  display: flex;
  gap: 8px;
}
</style> 