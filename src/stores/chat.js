import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', () => {
  // 状态
  const conversations = ref([])
  const currentConversationId = ref(null)
  const messages = ref([])
  const isLoading = ref(false)
  const isStreaming = ref(false)
  const streamingMessageId = ref(null)
  const toolCalls = ref([])
  const activeToolCall = ref(null)

  // 计算属性
  const currentConversation = computed(() => {
    return conversations.value.find(conv => conv.id === currentConversationId.value) || null
  })

  const conversationCount = computed(() => conversations.value.length)

  const hasActiveConversation = computed(() => !!currentConversationId.value)

  const currentMessages = computed(() => {
    return messages.value.filter(msg => msg.conversationId === currentConversationId.value)
  })

  const lastMessage = computed(() => {
    const msgs = currentMessages.value
    return msgs.length > 0 ? msgs[msgs.length - 1] : null
  })

  // 对话管理操作
  function setConversations(convs) {
    conversations.value = convs
  }

  function addConversation(conversation) {
    conversations.value.unshift(conversation)
  }

  function updateConversation(conversationId, updates) {
    const index = conversations.value.findIndex(conv => conv.id === conversationId)
    if (index !== -1) {
      conversations.value[index] = { ...conversations.value[index], ...updates }
    }
  }

  function removeConversation(conversationId) {
    conversations.value = conversations.value.filter(conv => conv.id !== conversationId)
    // 如果删除的是当前对话，清空当前对话
    if (currentConversationId.value === conversationId) {
      currentConversationId.value = null
      messages.value = messages.value.filter(msg => msg.conversationId !== conversationId)
    }
  }

  function setCurrentConversation(conversationId) {
    currentConversationId.value = conversationId
  }

  // 消息管理操作
  function setMessages(msgs) {
    messages.value = msgs
  }

  function addMessage(message) {
    const messageWithId = {
      ...message,
      id: message.id || Date.now() + Math.random(),
      timestamp: message.timestamp || new Date(),
      conversationId: message.conversationId || currentConversationId.value
    }
    messages.value.push(messageWithId)
    return messageWithId
  }

  function updateMessage(messageId, updates) {
    const index = messages.value.findIndex(msg => msg.id === messageId)
    if (index !== -1) {
      messages.value[index] = { ...messages.value[index], ...updates }
    }
  }

  function removeMessage(messageId) {
    messages.value = messages.value.filter(msg => msg.id !== messageId)
  }

  function clearMessages(conversationId = null) {
    if (conversationId) {
      messages.value = messages.value.filter(msg => msg.conversationId !== conversationId)
    } else {
      messages.value = []
    }
  }

  // 流式响应状态管理
  function setLoading(loading) {
    isLoading.value = loading
  }

  function setStreaming(streaming, messageId = null) {
    isStreaming.value = streaming
    streamingMessageId.value = messageId
  }

  function appendToStreamingMessage(content) {
    if (streamingMessageId.value) {
      const message = messages.value.find(msg => msg.id === streamingMessageId.value)
      if (message) {
        message.content += content
      }
    }
  }

  // 工具调用状态管理
  function setToolCalls(tools) {
    toolCalls.value = tools
  }

  function addToolCall(toolCall) {
    const toolCallWithId = {
      ...toolCall,
      id: toolCall.id || Date.now() + Math.random(),
      timestamp: toolCall.timestamp || new Date(),
      status: toolCall.status || 'pending'
    }
    toolCalls.value.push(toolCallWithId)
    return toolCallWithId
  }

  function updateToolCall(toolCallId, updates) {
    const index = toolCalls.value.findIndex(tool => tool.id === toolCallId)
    if (index !== -1) {
      toolCalls.value[index] = { ...toolCalls.value[index], ...updates }
    }
  }

  function setActiveToolCall(toolCallId) {
    activeToolCall.value = toolCallId
  }

  function clearToolCalls() {
    toolCalls.value = []
    activeToolCall.value = null
  }

  // 重置所有状态
  function resetChatState() {
    conversations.value = []
    currentConversationId.value = null
    messages.value = []
    isLoading.value = false
    isStreaming.value = false
    streamingMessageId.value = null
    toolCalls.value = []
    activeToolCall.value = null
  }

  return {
    // 状态
    conversations,
    currentConversationId,
    messages,
    isLoading,
    isStreaming,
    streamingMessageId,
    toolCalls,
    activeToolCall,

    // 计算属性
    currentConversation,
    conversationCount,
    hasActiveConversation,
    currentMessages,
    lastMessage,

    // 对话管理操作
    setConversations,
    addConversation,
    updateConversation,
    removeConversation,
    setCurrentConversation,

    // 消息管理操作
    setMessages,
    addMessage,
    updateMessage,
    removeMessage,
    clearMessages,

    // 流式响应状态管理
    setLoading,
    setStreaming,
    appendToStreamingMessage,

    // 工具调用状态管理
    setToolCalls,
    addToolCall,
    updateToolCall,
    setActiveToolCall,
    clearToolCalls,

    // 重置操作
    resetChatState
  }
}) 