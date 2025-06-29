import request from '@/utils/request'

export const userAPI = {
  /**
   * 验证用户认证信息
   * @param {Object} userInfo - 用户认证信息
   * @param {string} userInfo.userId - 用户ID
   * @param {string} userInfo.username - 用户名
   * @param {string} userInfo.apiKey - API密钥
   * @returns {Promise} 验证结果
   */
  validateAuth(userInfo) {
    return request.get('/status', {
      headers: {
        'X-User-ID': userInfo.userId,
        'X-Username': encodeURIComponent(userInfo.username),
        'X-API-Key': userInfo.apiKey
      }
    })
  },

  /**
   * 获取系统状态
   * @returns {Promise} 系统状态信息
   */
  getSystemStatus() {
    return request.get('/status')
  },

  /**
   * 健康检查 (不需要认证)
   * @returns {Promise} 健康检查结果
   */
  healthCheck() {
    return request.get('/health')
  },

  /**
   * 直接验证API密钥格式
   * @param {string} apiKey - API密钥
   * @returns {boolean} 格式是否正确
   */
  validateApiKeyFormat(apiKey) {
    // 移除格式限制，只要不为空即可
    return !!(apiKey && apiKey.trim())
  }
} 