import { ref, computed, nextTick } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { chatAPI } from '@/api/chat'

export function useChat() {
  const chatStore = useChatStore()
  const userStore = useUserStore()
  const appStore = useAppStore()

  // 响应式引用
  const isInitialized = ref(false)
  const error = ref(null)

  // 计算属性
  const currentConversation = computed(() => chatStore.currentConversation)
  const messages = computed(() => chatStore.currentMessages)
  const isLoading = computed(() => chatStore.isLoading)
  const isStreaming = computed(() => chatStore.isStreaming)

  // 初始化聊天
  async function initializeChat() {
    try {
      if (!userStore.isAuthenticated) {
        throw new Error('用户未认证')
      }

      appStore.showLoading('初始化聊天...')
      
      // 获取对话列表
      const conversationsResult = await chatAPI.getConversations()
      chatStore.setConversations(conversationsResult.data || [])

      // 获取当前对话
      try {
        const currentResult = await chatAPI.getCurrentConversation()
        if (currentResult.data && currentResult.data.id) {
          chatStore.setCurrentConversation(currentResult.data.id)
          
          // 加载当前对话的消息
          const messagesResult = await chatAPI.getMessages(currentResult.data.id)
          chatStore.setMessages(messagesResult.data || [])
        }
      } catch (currentError) {
        console.log('没有当前对话，将创建新对话')
      }

      isInitialized.value = true
      error.value = null
    } catch (err) {
      console.error('初始化聊天失败:', err)
      error.value = err.message
      appStore.showError(`初始化聊天失败: ${err.message}`)
    } finally {
      appStore.hideLoading()
    }
  }

  // 创建新对话
  async function createConversation(description = '') {
    try {
      chatStore.setLoading(true)
      
      const result = await chatAPI.createConversation({ description })
      const newConversation = result.data

      chatStore.addConversation(newConversation)
      chatStore.setCurrentConversation(newConversation.id)
      chatStore.clearMessages(newConversation.id)

      appStore.showSuccess('新对话创建成功')
      return newConversation
    } catch (err) {
      console.error('创建对话失败:', err)
      appStore.showError(`创建对话失败: ${err.message}`)
      throw err
    } finally {
      chatStore.setLoading(false)
    }
  }

  // 切换对话
  async function switchConversation(conversationId) {
    try {
      chatStore.setLoading(true)
      
      await chatAPI.switchConversation(conversationId)
      chatStore.setCurrentConversation(conversationId)

      // 加载对话消息
      const messagesResult = await chatAPI.getMessages(conversationId)
      chatStore.setMessages(messagesResult.data || [])

      return true
    } catch (err) {
      console.error('切换对话失败:', err)
      appStore.showError(`切换对话失败: ${err.message}`)
      return false
    } finally {
      chatStore.setLoading(false)
    }
  }

  // 发送消息
  async function sendMessage(content, options = {}) {
    try {
      if (!content.trim()) {
        throw new Error('消息内容不能为空')
      }

      if (!chatStore.hasActiveConversation) {
        // 自动创建新对话
        await createConversation()
      }

      // 添加用户消息
      const userMessage = chatStore.addMessage({
        role: 'user',
        content: content.trim(),
        conversationId: chatStore.currentConversationId
      })

      // 创建AI响应消息
      const assistantMessage = chatStore.addMessage({
        role: 'assistant',
        content: '',
        conversationId: chatStore.currentConversationId,
        tools: []
      })

      chatStore.setStreaming(true, assistantMessage.id)

      // 发送流式请求
      const response = await chatAPI.sendStreamAnalysis({
        query: content,
        conversationId: chatStore.currentConversationId
      })

      await processStreamResponse(response, assistantMessage.id)
      
      return { userMessage, assistantMessage }
    } catch (err) {
      console.error('发送消息失败:', err)
      appStore.showError(`发送消息失败: ${err.message}`)
      chatStore.setStreaming(false)
      throw err
    }
  }

  // 处理流式响应
  async function processStreamResponse(response, messageId) {
    try {
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            
            if (data === '[DONE]') {
              chatStore.setStreaming(false)
              continue
            }

            try {
              const parsed = JSON.parse(data)
              
              if (parsed.type === 'content') {
                chatStore.appendToStreamingMessage(parsed.content)
              } else if (parsed.type === 'tool_call') {
                handleToolCall(parsed.tool_call, messageId)
              } else if (parsed.type === 'error') {
                throw new Error(parsed.message)
              }
            } catch (parseError) {
              console.warn('解析SSE数据失败:', parseError)
            }
          }
        }
      }
    } catch (err) {
      console.error('处理流式响应失败:', err)
      chatStore.setStreaming(false)
      throw err
    }
  }

  // 处理工具调用
  function handleToolCall(toolCall, messageId) {
    const toolCallId = chatStore.addToolCall({
      ...toolCall,
      messageId,
      status: 'executing'
    })

    chatStore.setActiveToolCall(toolCallId.id)

    // 更新消息的工具调用
    const message = chatStore.messages.find(msg => msg.id === messageId)
    if (message) {
      if (!message.tools) {
        message.tools = []
      }
      message.tools.push({
        id: toolCallId.id,
        name: toolCall.name,
        status: 'executing'
      })
    }
  }

  // 删除对话
  async function deleteConversation(conversationId) {
    try {
      await chatAPI.deleteConversation(conversationId)
      chatStore.removeConversation(conversationId)
      appStore.showSuccess('对话已删除')
      
      // 如果删除的是当前对话，尝试切换到其他对话
      if (chatStore.conversations.length > 0) {
        await switchConversation(chatStore.conversations[0].id)
      }
    } catch (err) {
      console.error('删除对话失败:', err)
      appStore.showError(`删除对话失败: ${err.message}`)
    }
  }

  // 清空当前对话消息
  function clearCurrentMessages() {
    if (chatStore.hasActiveConversation) {
      chatStore.clearMessages(chatStore.currentConversationId)
      appStore.showSuccess('对话消息已清空')
    }
  }

  // 导出对话
  function exportConversation(conversationId = null) {
    const targetId = conversationId || chatStore.currentConversationId
    const messages = chatStore.messages.filter(msg => msg.conversationId === targetId)
    
    if (messages.length === 0) {
      appStore.showWarning('没有消息可导出')
      return
    }

    const conversation = chatStore.conversations.find(conv => conv.id === targetId)
    const title = conversation?.title || `对话_${targetId}`
    
    const content = messages.map(msg => {
      const role = msg.role === 'user' ? '用户' : 'AI助手'
      const time = new Date(msg.timestamp).toLocaleString('zh-CN')
      return `[${role}] ${time}\n${msg.content}\n\n`
    }).join('')

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title}_${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)

    appStore.showSuccess('对话已导出')
  }

  // 重新发送消息
  async function resendMessage(messageId) {
    const message = chatStore.messages.find(msg => msg.id === messageId)
    if (message && message.role === 'user') {
      await sendMessage(message.content)
    }
  }

  return {
    // 状态
    isInitialized,
    error,
    
    // 计算属性
    currentConversation,
    messages,
    isLoading,
    isStreaming,

    // 方法
    initializeChat,
    createConversation,
    switchConversation,
    sendMessage,
    deleteConversation,
    clearCurrentMessages,
    exportConversation,
    resendMessage
  }
} 