import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  // 状态
  const userId = ref('')
  const username = ref('')
  const apiKey = ref('')
  const isAuthenticated = ref(false)

  // 计算属性
  const userInfo = computed(() => ({
    userId: userId.value,
    username: username.value,
    apiKey: apiKey.value
  }))

  const hasValidAuth = computed(() => {
    return !!(userId.value && username.value && apiKey.value)
  })

  // 操作
  function setUserInfo(userInfo) {
    userId.value = userInfo.userId || ''
    username.value = userInfo.username || ''
    apiKey.value = userInfo.apiKey || ''
    isAuthenticated.value = hasValidAuth.value
  }

  function clearUserInfo() {
    userId.value = ''
    username.value = ''
    apiKey.value = ''
    isAuthenticated.value = false
  }

  function updateApiKey(newApiKey) {
    apiKey.value = newApiKey
    isAuthenticated.value = hasValidAuth.value
  }

  return {
    // 状态
    userId,
    username,
    apiKey,
    isAuthenticated,
    
    // 计算属性
    userInfo,
    hasValidAuth,
    
    // 操作
    setUserInfo,
    clearUserInfo,
    updateApiKey
  }
}) 