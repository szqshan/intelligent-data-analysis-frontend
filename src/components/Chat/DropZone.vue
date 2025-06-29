<template>
  <div 
    class="drop-zone-overlay"
    :class="{ 
      'active': isActive,
      'visible': isVisible 
    }"
    @drop="handleDrop"
    @dragover="handleDragOver"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
  >
    <div class="drop-zone-content">
      <div class="drop-zone-icon">
        <el-icon size="80">
          <Upload />
        </el-icon>
      </div>
      
      <div class="drop-zone-text">
        <h3>拖拽文件到此处上传</h3>
        <p>支持多种文件格式，可同时上传多个文件</p>
        <div class="supported-formats">
          <el-tag v-for="format in supportedFormats" :key="format" size="small" type="info">
            {{ format }}
          </el-tag>
        </div>
      </div>

      <div class="drop-zone-stats">
        <div class="stat-item">
          <span class="stat-label">最大单文件大小</span>
          <span class="stat-value">{{ maxFileSize }}MB</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">最大文件数量</span>
          <span class="stat-value">{{ maxFiles }}个</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'

// Props
const props = defineProps({
  maxFiles: {
    type: Number,
    default: 10
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['files-dropped'])

// Stores
const appStore = useAppStore()

// 响应式引用
const isActive = ref(false)
const isVisible = ref(false)
const dragCounter = ref(0)

// 计算属性
const supportedFormats = computed(() => {
  const types = appStore.appConfig?.allowedFileTypes || ['.jpg', '.png', '.pdf', '.txt', '.docx']
  return types.map(type => type.replace('.', '').toUpperCase()).slice(0, 6)
})

const maxFileSize = computed(() => 
  Math.round((appStore.appConfig?.maxFileSize || 10485760) / (1024 * 1024))
)

const maxFiles = computed(() => props.maxFiles)

// 拖拽事件处理
function handleDragEnter(e) {
  e.preventDefault()
  e.stopPropagation()
  
  if (props.disabled) return
  
  dragCounter.value++
  
  if (dragCounter.value === 1) {
    isVisible.value = true
    setTimeout(() => {
      isActive.value = true
    }, 50)
  }
}

function handleDragOver(e) {
  e.preventDefault()
  e.stopPropagation()
  
  if (props.disabled) return
  
  isVisible.value = true
  isActive.value = true
}

function handleDragLeave(e) {
  e.preventDefault()
  e.stopPropagation()
  
  dragCounter.value--
  
  if (dragCounter.value <= 0) {
    dragCounter.value = 0
    isActive.value = false
    setTimeout(() => {
      if (dragCounter.value === 0) {
        isVisible.value = false
      }
    }, 200)
  }
}

function handleDrop(e) {
  e.preventDefault()
  e.stopPropagation()
  
  dragCounter.value = 0
  isActive.value = false
  isVisible.value = false
  
  if (props.disabled) return
  
  const files = Array.from(e.dataTransfer.files)
  
  if (files.length > 0) {
    emit('files-dropped', files)
  }
}

// 全局拖拽事件监听
function handleGlobalDragEnter(e) {
  // 检查是否包含文件
  const hasFiles = e.dataTransfer?.types?.includes('Files')
  if (hasFiles && !props.disabled) {
    handleDragEnter(e)
  }
}

function handleGlobalDragLeave(e) {
  // 检查是否离开了窗口
  if (e.clientX === 0 && e.clientY === 0) {
    dragCounter.value = 0
    isActive.value = false
    isVisible.value = false
  }
}

// 生命周期
onMounted(() => {
  // 阻止浏览器默认的拖拽行为
  document.addEventListener('dragover', (e) => e.preventDefault())
  document.addEventListener('drop', (e) => e.preventDefault())
  
  // 监听全局拖拽事件
  document.addEventListener('dragenter', handleGlobalDragEnter)
  document.addEventListener('dragleave', handleGlobalDragLeave)
})

onUnmounted(() => {
  document.removeEventListener('dragover', (e) => e.preventDefault())
  document.removeEventListener('drop', (e) => e.preventDefault())
  document.removeEventListener('dragenter', handleGlobalDragEnter)
  document.removeEventListener('dragleave', handleGlobalDragLeave)
})
</script>

<style scoped>
.drop-zone-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(64, 158, 255, 0.1);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  pointer-events: none;
}

.drop-zone-overlay.visible {
  opacity: 1;
  visibility: visible;
  pointer-events: all;
}

.drop-zone-overlay.active {
  background-color: rgba(64, 158, 255, 0.2);
}

.drop-zone-content {
  background: white;
  border: 3px dashed #409eff;
  border-radius: 16px;
  padding: 60px 40px;
  text-align: center;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  transform: scale(0.9);
  transition: all 0.3s ease;
}

.drop-zone-overlay.active .drop-zone-content {
  transform: scale(1);
  border-color: #67c23a;
  border-width: 4px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
}

.drop-zone-icon {
  color: #409eff;
  margin-bottom: 24px;
  transition: all 0.3s ease;
}

.drop-zone-overlay.active .drop-zone-icon {
  color: #67c23a;
  transform: scale(1.1);
}

.drop-zone-text h3 {
  color: #303133;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 12px;
  transition: color 0.3s ease;
}

.drop-zone-overlay.active .drop-zone-text h3 {
  color: #67c23a;
}

.drop-zone-text p {
  color: #606266;
  font-size: 16px;
  margin: 0 0 20px;
  line-height: 1.5;
}

.supported-formats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 24px;
}

.drop-zone-stats {
  display: flex;
  justify-content: space-around;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
}

.stat-value {
  font-size: 16px;
  color: #409eff;
  font-weight: 600;
}

.drop-zone-overlay.active .stat-value {
  color: #67c23a;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .drop-zone-content {
    padding: 40px 24px;
    max-width: 90%;
  }
  
  .drop-zone-text h3 {
    font-size: 20px;
  }
  
  .drop-zone-text p {
    font-size: 14px;
  }
  
  .drop-zone-stats {
    flex-direction: column;
    gap: 16px;
  }
}

/* 动画效果 */
@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -8px, 0);
  }
  70% {
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
}

.drop-zone-overlay.active .drop-zone-icon {
  animation: bounce 1s ease infinite;
}
</style> 