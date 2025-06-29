import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { uploadAPI } from '@/api/upload'

export function useUpload() {
  const appStore = useAppStore()

  // 响应式引用
  const uploadQueue = ref([])
  const uploadHistory = ref([])
  const isUploading = ref(false)
  const uploadProgress = ref(0)

  // 计算属性
  const hasActiveUploads = computed(() => 
    uploadQueue.value.some(upload => upload.status === 'uploading')
  )

  const completedUploads = computed(() =>
    uploadHistory.value.filter(upload => upload.status === 'completed')
  )

  const failedUploads = computed(() =>
    uploadHistory.value.filter(upload => upload.status === 'failed')
  )

  // 文件验证
  function validateFile(file) {
    const errors = []

    // 检查文件是否为空
    if (!file || file.size === 0) {
      errors.push('文件为空或无效')
      return { isValid: false, errors }
    }

    // 检查文件大小
    if (file.size > appStore.appConfig.maxFileSize) {
      const maxSizeMB = Math.round(appStore.appConfig.maxFileSize / (1024 * 1024))
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
      errors.push(`文件大小 ${fileSizeMB}MB 超出限制，最大允许 ${maxSizeMB}MB`)
    }

    // 检查文件类型
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
    if (!appStore.appConfig.allowedFileTypes.includes(fileExtension)) {
      const supportedTypes = appStore.appConfig.allowedFileTypes.join(', ')
      errors.push(`不支持的文件类型 "${fileExtension}"，支持的格式: ${supportedTypes}`)
    }

    // 检查文件名
    if (file.name.length > 255) {
      errors.push(`文件名长度 ${file.name.length} 字符超出限制，最大 255 字符`)
    }

    // 检查文件名是否包含非法字符
    const invalidChars = /[<>:"/\\|?*]/
    if (invalidChars.test(file.name)) {
      errors.push('文件名包含非法字符，请避免使用 < > : " / \\ | ? *')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // 添加文件到上传队列
  function addToUploadQueue(files) {
    const fileArray = Array.isArray(files) ? files : Array.from(files)
    const validFiles = []

    for (const file of fileArray) {
      const validation = validateFile(file)
      
      if (validation.isValid) {
        const uploadItem = {
          id: Date.now() + Math.random(),
          file,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          status: 'pending',
          progress: 0,
          uploadedBytes: 0,
          speed: 0,
          remainingTime: 0,
          startTime: null,
          endTime: null,
          error: null,
          result: null
        }
        
        uploadQueue.value.push(uploadItem)
        validFiles.push(uploadItem)
      } else {
        appStore.showError(`文件 "${file.name}" 验证失败: ${validation.errors.join(', ')}`)
      }
    }

    if (validFiles.length > 0) {
      appStore.showSuccess(`已添加 ${validFiles.length} 个文件到上传队列`)
    }

    return validFiles
  }

  // 上传单个文件
  async function uploadSingleFile(uploadItem) {
    try {
      uploadItem.status = 'uploading'
      uploadItem.startTime = new Date()
      
      const formData = new FormData()
      formData.append('file', uploadItem.file)
      formData.append('filename', uploadItem.fileName)

      // 创建进度追踪
      const startTime = Date.now()
      let lastLoaded = 0
      let lastTime = startTime

      const onProgress = (progressEvent) => {
        const currentTime = Date.now()
        const timeElapsed = currentTime - lastTime
        
        if (timeElapsed >= 500) { // 每500ms更新一次
          const loaded = progressEvent.loaded || 0
          const total = progressEvent.total || uploadItem.fileSize
          const bytesThisInterval = loaded - lastLoaded
          
          // 计算上传速度 (bytes/second)
          const speed = timeElapsed > 0 ? (bytesThisInterval / timeElapsed) * 1000 : 0
          
          // 计算剩余时间
          const remainingBytes = total - loaded
          const remainingTime = speed > 0 ? remainingBytes / speed : 0

          uploadItem.progress = Math.round((loaded / total) * 100)
          uploadItem.uploadedBytes = loaded
          uploadItem.speed = speed
          uploadItem.remainingTime = remainingTime

          lastLoaded = loaded
          lastTime = currentTime
        }
      }

      // 调用上传API
      const result = await uploadAPI.uploadFile(formData, {
        onUploadProgress: onProgress
      })

      uploadItem.status = 'completed'
      uploadItem.endTime = new Date()
      uploadItem.result = result.data
      uploadItem.progress = 100

      // 移动到历史记录
      uploadHistory.value.unshift(uploadItem)
      removeFromQueue(uploadItem.id)

      appStore.showSuccess(`文件 "${uploadItem.fileName}" 上传成功`)
      return result.data

    } catch (error) {
      uploadItem.status = 'failed'
      uploadItem.endTime = new Date()
      uploadItem.error = error.message || '上传失败'

      // 移动到历史记录
      uploadHistory.value.unshift(uploadItem)
      removeFromQueue(uploadItem.id)

      appStore.showError(`文件 "${uploadItem.fileName}" 上传失败: ${uploadItem.error}`)
      throw error
    }
  }

  // 批量上传
  async function uploadFiles(maxConcurrent = 3) {
    if (uploadQueue.value.length === 0) {
      appStore.showWarning('没有文件需要上传')
      return
    }

    isUploading.value = true
    const pendingFiles = uploadQueue.value.filter(item => item.status === 'pending')
    const results = []

    try {
      // 分批并发上传
      for (let i = 0; i < pendingFiles.length; i += maxConcurrent) {
        const batch = pendingFiles.slice(i, i + maxConcurrent)
        const batchPromises = batch.map(uploadItem => uploadSingleFile(uploadItem))
        
        const batchResults = await Promise.allSettled(batchPromises)
        results.push(...batchResults)

        // 更新总体进度
        const completedCount = i + batch.length
        uploadProgress.value = Math.round((completedCount / pendingFiles.length) * 100)
      }

      const successCount = results.filter(r => r.status === 'fulfilled').length
      const failCount = results.filter(r => r.status === 'rejected').length

      if (successCount > 0) {
        appStore.showSuccess(`成功上传 ${successCount} 个文件`)
      }
      if (failCount > 0) {
        appStore.showError(`${failCount} 个文件上传失败`)
      }

    } catch (error) {
      console.error('批量上传失败:', error)
      appStore.showError('批量上传过程中发生错误')
    } finally {
      isUploading.value = false
      uploadProgress.value = 0
    }
  }

  // 从队列中移除文件
  function removeFromQueue(uploadId) {
    const index = uploadQueue.value.findIndex(item => item.id === uploadId)
    if (index !== -1) {
      uploadQueue.value.splice(index, 1)
    }
  }

  // 取消上传
  function cancelUpload(uploadId) {
    const uploadItem = uploadQueue.value.find(item => item.id === uploadId)
    if (uploadItem) {
      uploadItem.status = 'cancelled'
      removeFromQueue(uploadId)
      appStore.showInfo(`已取消上传: ${uploadItem.fileName}`)
    }
  }

  // 重试上传
  async function retryUpload(uploadId) {
    const uploadItem = uploadHistory.value.find(item => item.id === uploadId)
    if (uploadItem && uploadItem.status === 'failed') {
      // 重置状态并添加回队列
      uploadItem.status = 'pending'
      uploadItem.progress = 0
      uploadItem.error = null
      uploadItem.startTime = null
      uploadItem.endTime = null

      uploadQueue.value.push(uploadItem)
      
      // 从历史记录移除
      const historyIndex = uploadHistory.value.findIndex(item => item.id === uploadId)
      if (historyIndex !== -1) {
        uploadHistory.value.splice(historyIndex, 1)
      }

      appStore.showInfo(`已重新添加文件到上传队列: ${uploadItem.fileName}`)
    }
  }

  // 清空队列
  function clearQueue() {
    uploadQueue.value = []
    appStore.showSuccess('上传队列已清空')
  }

  // 清空历史记录
  function clearHistory() {
    uploadHistory.value = []
    appStore.showSuccess('上传历史已清空')
  }

  // 格式化文件大小
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 格式化上传速度
  function formatSpeed(bytesPerSecond) {
    return formatFileSize(bytesPerSecond) + '/s'
  }

  // 格式化剩余时间
  function formatRemainingTime(seconds) {
    if (seconds < 60) {
      return `${Math.round(seconds)}秒`
    } else if (seconds < 3600) {
      return `${Math.round(seconds / 60)}分钟`
    } else {
      return `${Math.round(seconds / 3600)}小时`
    }
  }

  // 获取上传统计
  const uploadStats = computed(() => ({
    total: uploadHistory.value.length,
    completed: completedUploads.value.length,
    failed: failedUploads.value.length,
    pending: uploadQueue.value.length,
    totalSize: uploadHistory.value.reduce((sum, item) => sum + item.fileSize, 0),
    completedSize: completedUploads.value.reduce((sum, item) => sum + item.fileSize, 0)
  }))

  // 获取文件格式分类信息
  function getFileTypeCategory(fileExtension) {
    const categories = appStore.appConfig.fileTypeCategories
    
    for (const [categoryKey, category] of Object.entries(categories)) {
      if (category.types.includes(fileExtension.toLowerCase())) {
        return {
          key: categoryKey,
          ...category
        }
      }
    }
    
    return {
      key: 'unknown',
      types: [],
      label: '未知格式',
      description: '未知文件格式',
      icon: 'Document',
      color: '#909399'
    }
  }

  // 检查文件是否可以进行数据分析
  function canAnalyzeFile(file) {
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
    return appStore.appConfig.analyticalFileTypes.includes(fileExtension)
  }

  // 检查文件类型能力
  function getFileCapabilities(file) {
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
    const category = getFileTypeCategory(fileExtension)
    const canAnalyze = canAnalyzeFile(file)
    
    return {
      canAnalyze,
      canUpload: true, // 所有支持的格式都可以上传
      category,
      fileExtension,
      capabilities: {
        dataAnalysis: canAnalyze,
        storage: true,
        preview: file.type?.startsWith('image/') || false
      }
    }
  }

  return {
    // 状态
    uploadQueue,
    uploadHistory,
    isUploading,
    uploadProgress,

    // 计算属性
    hasActiveUploads,
    completedUploads,
    failedUploads,
    uploadStats,

    // 方法
    validateFile,
    addToUploadQueue,
    uploadFiles,
    uploadSingleFile,
    removeFromQueue,
    cancelUpload,
    retryUpload,
    clearQueue,
    clearHistory,

    // 工具方法
    formatFileSize,
    formatSpeed,
    formatRemainingTime,

    // 新添加的方法
    getFileTypeCategory,
    canAnalyzeFile,
    getFileCapabilities
  }
} 