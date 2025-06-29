import axios from 'axios'
import { ElMessage } from 'element-plus'

const API_BASE_URL = 'http://localhost:5000/api'

// 创建axios实例
const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 获取用户Store的函数
let getUserStore = null

// 动态导入用户存储
async function initUserStore() {
  if (!getUserStore) {
    try {
      const { useUserStore } = await import('@/stores/user')
      getUserStore = useUserStore
    } catch (error) {
      console.warn('Failed to load user store:', error)
    }
  }
  return getUserStore
}

// 初始化用户存储
initUserStore()

// 设置用户Store访问器（向后兼容）
export const setUserStoreAccessor = (accessor) => {
  getUserStore = accessor
}

// 请求拦截器 - 添加认证信息
request.interceptors.request.use(
  config => {
    if (getUserStore) {
      const userStore = getUserStore()
      if (userStore && userStore.userId && userStore.username && userStore.apiKey) {
        config.headers['X-User-ID'] = userStore.userId
        config.headers['X-Username'] = encodeURIComponent(userStore.username)
        config.headers['X-API-Key'] = userStore.apiKey
      }
    }
    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 为fetch请求提供Headers生成函数
export const getAuthHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  }
  
  if (getUserStore) {
    const userStore = getUserStore()
    if (userStore && userStore.userId && userStore.username && userStore.apiKey) {
      headers['X-User-ID'] = userStore.userId
      headers['X-Username'] = encodeURIComponent(userStore.username)
      headers['X-API-Key'] = userStore.apiKey
    }
  }
  
  return headers
}

// 响应拦截器 - 统一错误处理
request.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('Response error:', error)
    
    let message = '请求失败'
    
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          if (data?.error_code === 'MISSING_CREDENTIALS') {
            message = '缺少必需的用户认证信息'
          } else if (data?.error_code === 'INVALID_CREDENTIALS') {
            message = '用户认证信息无效'
          } else {
            message = '认证失败，请检查您的凭据'
          }
          break
        case 403:
          message = '权限不足'
          break
        case 404:
          message = '请求的资源不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        default:
          message = data?.message || `HTTP ${status}: ${error.response.statusText}`
      }
    } else if (error.request) {
      message = '网络连接失败，请检查网络连接'
    } else {
      message = error.message || '未知错误'
    }
    
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default request 