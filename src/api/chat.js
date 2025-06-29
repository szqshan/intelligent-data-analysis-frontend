import request, { getAuthHeaders } from '@/utils/request'

export const chatAPI = {
  /**
   * 创建新对话
   * @param {Object} data - 对话数据
   * @param {string} data.description - 对话描述 (可选)
   * @returns {Promise} 创建的对话信息
   */
  createConversation(data = {}) {
    return request.post('/conversations/create', {
      description: data.description || undefined
    })
  },

  /**
   * 获取用户的对话列表
   * @returns {Promise} 对话列表
   */
  getConversations() {
    return request.get('/conversations/list')
  },

  /**
   * 获取当前对话
   * @returns {Promise} 当前对话信息
   */
  getCurrentConversation() {
    return request.get('/conversations/current')
  },

  /**
   * 切换对话
   * @param {string} conversationId - 对话ID
   * @returns {Promise} 切换结果
   */
  switchConversation(conversationId) {
    return request.post('/conversations/switch', {
      conversation_id: conversationId
    })
  },

  /**
   * 获取对话的消息列表
   * @param {string} conversationId - 对话ID
   * @returns {Promise} 消息列表
   */
  getMessages(conversationId) {
    return request.get(`/conversations/${conversationId}/messages`)
  },

  /**
   * 发送流式分析请求
   * @param {Object} data - 分析数据
   * @param {string} data.query - 查询内容
   * @param {string} data.conversationId - 对话ID (可选)
   * @returns {Promise<Response>} 流式响应对象
   */
  async sendStreamAnalysis(data) {
    const baseURL = request.defaults.baseURL || 'http://localhost:5000/api'
    
    // 获取认证headers
    const authHeaders = getAuthHeaders()
    const headers = {
      ...authHeaders,
      'Accept': 'text/event-stream',
      'Cache-Control': 'no-cache'
    }

    const body = JSON.stringify({
      query: data.query,
      conversation_id: data.conversationId || null
    })

    // 使用fetch支持流式响应
    const response = await fetch(`${baseURL}/analyze-stream`, {
      method: 'POST',
      headers,
      body
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    return response
  },

  /**
   * 删除对话
   * @param {string} conversationId - 对话ID
   * @returns {Promise} 删除结果
   */
  deleteConversation(conversationId) {
    return request.delete(`/conversations/${conversationId}`)
  },

  /**
   * 更新对话信息
   * @param {string} conversationId - 对话ID
   * @param {Object} data - 更新数据
   * @param {string} data.title - 新标题
   * @param {string} data.description - 新描述
   * @returns {Promise} 更新结果
   */
  updateConversation(conversationId, data) {
    return request.put(`/conversations/${conversationId}`, data)
  }
} 