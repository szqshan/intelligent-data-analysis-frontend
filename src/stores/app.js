import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  // 状态
  const theme = ref('light')
  const sidebarCollapsed = ref(false)
  const globalLoading = ref(false)
  const loadingText = ref('')
  const appConfig = ref({
    title: '智能数据分析平台',
    version: '1.0.0',
    maxFileSize: 500 * 1024 * 1024, // 500MB
    allowedFileTypes: [
      // 数据文件
      '.csv', '.xlsx', '.xls', '.json', '.txt',
      // 文档文件
      '.pdf', '.doc', '.docx', '.ppt', '.pptx',
      // 图片文件
      '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp',
      // 视频文件
      '.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm',
      // 音频文件
      '.mp3', '.wav', '.flac', '.aac', '.ogg',
      // 其他数据格式
      '.xml', '.yaml', '.yml', '.sql', '.log',
      // 压缩文件
      '.zip', '.rar', '.7z', '.tar', '.gz'
    ],
    // 当前后端支持数据分析的格式
    analyticalFileTypes: [
      '.csv'  // 目前只支持CSV数据分析
    ],
    // 文件格式分类
    fileTypeCategories: {
      analytical: {
        types: ['.csv'],
        label: '可分析数据',
        description: '支持智能数据分析和多轮对话',
        icon: 'DataAnalysis',
        color: '#67c23a'
      },
      data: {
        types: ['.xlsx', '.xls', '.json', '.xml', '.yaml', '.yml', '.sql', '.log'],
        label: '数据文件',
        description: '暂不支持分析，仅支持上传存储',
        icon: 'Document',
        color: '#409eff'
      },
      document: {
        types: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt'],
        label: '文档文件',
        description: '支持上传存储，未来可能支持内容分析',
        icon: 'Document',
        color: '#f56c6c'
      },
      media: {
        types: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mp3', '.wav', '.flac', '.aac', '.ogg'],
        label: '多媒体',
        description: '支持上传存储，未来可能支持内容识别',
        icon: 'Picture',
        color: '#e6a23c'
      },
      archive: {
        types: ['.zip', '.rar', '.7z', '.tar', '.gz'],
        label: '压缩文件',
        description: '支持上传存储',
        icon: 'Box',
        color: '#909399'
      }
    },
    maxConversations: 50
  })
  const notifications = ref([])
  const activeModal = ref(null)

  // 计算属性
  const isDarkMode = computed(() => theme.value === 'dark')
  
  const hasNotifications = computed(() => notifications.value.length > 0)
  
  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.read).length
  )

  // 主题管理
  function setTheme(newTheme) {
    theme.value = newTheme
    // 应用主题到document
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('app-theme', newTheme)
  }

  function toggleTheme() {
    const newTheme = theme.value === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  function initTheme() {
    const savedTheme = localStorage.getItem('app-theme')
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      // 检查系统主题偏好
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
    }
  }

  // 侧边栏管理
  function setSidebarCollapsed(collapsed) {
    sidebarCollapsed.value = collapsed
    localStorage.setItem('sidebar-collapsed', String(collapsed))
  }

  function toggleSidebar() {
    setSidebarCollapsed(!sidebarCollapsed.value)
  }

  function initSidebar() {
    const savedState = localStorage.getItem('sidebar-collapsed')
    if (savedState !== null) {
      sidebarCollapsed.value = savedState === 'true'
    }
  }

  // 全局加载状态管理
  function setGlobalLoading(loading, text = '') {
    globalLoading.value = loading
    loadingText.value = text
  }

  function showLoading(text = '加载中...') {
    setGlobalLoading(true, text)
  }

  function hideLoading() {
    setGlobalLoading(false, '')
  }

  // 应用配置管理
  function updateAppConfig(updates) {
    appConfig.value = { ...appConfig.value, ...updates }
  }

  function resetAppConfig() {
    appConfig.value = {
      title: '智能数据分析平台',
      version: '1.0.0',
      maxFileSize: 500 * 1024 * 1024,
      allowedFileTypes: [
        // 数据文件
        '.csv', '.xlsx', '.xls', '.json', '.txt',
        // 文档文件
        '.pdf', '.doc', '.docx', '.ppt', '.pptx',
        // 图片文件
        '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp',
        // 视频文件
        '.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm',
        // 音频文件
        '.mp3', '.wav', '.flac', '.aac', '.ogg',
        // 其他数据格式
        '.xml', '.yaml', '.yml', '.sql', '.log',
        // 压缩文件
        '.zip', '.rar', '.7z', '.tar', '.gz'
      ],
      // 当前后端支持数据分析的格式
      analyticalFileTypes: [
        '.csv'  // 目前只支持CSV数据分析
      ],
      // 文件格式分类
      fileTypeCategories: {
        analytical: {
          types: ['.csv'],
          label: '可分析数据',
          description: '支持智能数据分析和多轮对话',
          icon: 'DataAnalysis',
          color: '#67c23a'
        },
        data: {
          types: ['.xlsx', '.xls', '.json', '.xml', '.yaml', '.yml', '.sql', '.log'],
          label: '数据文件',
          description: '暂不支持分析，仅支持上传存储',
          icon: 'Document',
          color: '#409eff'
        },
        document: {
          types: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt'],
          label: '文档文件',
          description: '支持上传存储，未来可能支持内容分析',
          icon: 'Document',
          color: '#f56c6c'
        },
        media: {
          types: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mp3', '.wav', '.flac', '.aac', '.ogg'],
          label: '多媒体',
          description: '支持上传存储，未来可能支持内容识别',
          icon: 'Picture',
          color: '#e6a23c'
        },
        archive: {
          types: ['.zip', '.rar', '.7z', '.tar', '.gz'],
          label: '压缩文件',
          description: '支持上传存储',
          icon: 'Box',
          color: '#909399'
        }
      },
      maxConversations: 50
    }
  }

  // 通知管理
  function addNotification(notification) {
    const notificationWithId = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      read: false,
      type: 'info',
      autoClose: true,
      duration: 3000,
      ...notification
    }
    notifications.value.unshift(notificationWithId)
    
    // 自动移除通知
    if (notificationWithId.autoClose) {
      setTimeout(() => {
        removeNotification(notificationWithId.id)
      }, notificationWithId.duration)
    }
    
    return notificationWithId
  }

  function removeNotification(notificationId) {
    notifications.value = notifications.value.filter(n => n.id !== notificationId)
  }

  function markNotificationAsRead(notificationId) {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
    }
  }

  function clearNotifications() {
    notifications.value = []
  }

  function markAllNotificationsAsRead() {
    notifications.value.forEach(n => n.read = true)
  }

  // 模态框管理
  function setActiveModal(modalName) {
    activeModal.value = modalName
  }

  function closeModal() {
    activeModal.value = null
  }

  // 便捷的通知方法
  function showSuccess(message, options = {}) {
    return addNotification({
      type: 'success',
      title: '成功',
      message,
      ...options
    })
  }

  function showError(message, options = {}) {
    return addNotification({
      type: 'error',
      title: '文件上传错误',
      message,
      autoClose: false,
      ...options
    })
  }

  function showWarning(message, options = {}) {
    return addNotification({
      type: 'warning',
      title: '警告',
      message,
      duration: 8000,
      ...options
    })
  }

  function showInfo(message, options = {}) {
    return addNotification({
      type: 'info',
      title: '提示',
      message,
      ...options
    })
  }

  // 初始化应用状态
  function initApp() {
    initTheme()
    initSidebar()
  }

  return {
    // 状态
    theme,
    sidebarCollapsed,
    globalLoading,
    loadingText,
    appConfig,
    notifications,
    activeModal,

    // 计算属性
    isDarkMode,
    hasNotifications,
    unreadNotifications,

    // 主题管理
    setTheme,
    toggleTheme,
    initTheme,

    // 侧边栏管理
    setSidebarCollapsed,
    toggleSidebar,
    initSidebar,

    // 全局加载状态管理
    setGlobalLoading,
    showLoading,
    hideLoading,

    // 应用配置管理
    updateAppConfig,
    resetAppConfig,

    // 通知管理
    addNotification,
    removeNotification,
    markNotificationAsRead,
    clearNotifications,
    markAllNotificationsAsRead,

    // 模态框管理
    setActiveModal,
    closeModal,

    // 便捷的通知方法
    showSuccess,
    showError,
    showWarning,
    showInfo,

    // 初始化
    initApp
  }
}) 