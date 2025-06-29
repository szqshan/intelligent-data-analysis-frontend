// API模块统一导出
export { userAPI } from './user'
export { chatAPI } from './chat'
export { uploadAPI } from './upload'

// 导出request实例，供其他模块使用
export { default as request } from '@/utils/request'

// API基础配置
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  TIMEOUT: 30000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FILE_TYPES: [
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/json',
    'text/plain',
    'application/pdf'
  ]
} 