import request from '@/utils/request'

export const uploadAPI = {
  /**
   * 上传文件
   * @param {File} file - 要上传的文件
   * @param {string} userId - 用户ID
   * @param {string} username - 用户名
   * @param {Function} onProgress - 上传进度回调函数
   * @returns {Promise} 上传结果
   */
  uploadFile(file, userId, username, onProgress = null) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', userId)
    formData.append('username', username)

    return request.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.lengthComputable && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      }
    })
  },

  /**
   * 获取支持的文件类型
   * @returns {Array} 支持的文件类型列表
   */
  getSupportedFileTypes() {
    return [
      { ext: '.csv', type: 'text/csv', description: 'CSV文件' },
      { ext: '.xlsx', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', description: 'Excel文件' },
      { ext: '.xls', type: 'application/vnd.ms-excel', description: 'Excel文件 (旧版)' },
      { ext: '.json', type: 'application/json', description: 'JSON文件' },
      { ext: '.txt', type: 'text/plain', description: '文本文件' },
      { ext: '.pdf', type: 'application/pdf', description: 'PDF文件' }
    ]
  },

  /**
   * 验证文件类型
   * @param {File} file - 要验证的文件
   * @returns {boolean} 是否支持该文件类型
   */
  validateFileType(file) {
    const supportedTypes = this.getSupportedFileTypes()
    const fileName = file.name.toLowerCase()
    
    return supportedTypes.some(type => 
      fileName.endsWith(type.ext) || file.type === type.type
    )
  },

  /**
   * 验证文件大小
   * @param {File} file - 要验证的文件
   * @param {number} maxSizeMB - 最大文件大小 (MB)，默认10MB
   * @returns {boolean} 文件大小是否合法
   */
  validateFileSize(file, maxSizeMB = 10) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    return file.size <= maxSizeBytes
  },

  /**
   * 格式化文件大小显示
   * @param {number} bytes - 文件大小 (字节)
   * @returns {string} 格式化后的文件大小字符串
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  /**
   * 获取文件图标类型
   * @param {string} fileName - 文件名
   * @returns {string} 图标类型
   */
  getFileIcon(fileName) {
    const ext = fileName.toLowerCase().split('.').pop()
    
    const iconMap = {
      'csv': 'document-data',
      'xlsx': 'document-data',
      'xls': 'document-data',
      'json': 'document-code',
      'txt': 'document-text',
      'pdf': 'document-pdf'
    }
    
    return iconMap[ext] || 'document'
  }
} 