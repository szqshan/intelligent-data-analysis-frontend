// 应用程序常量定义

// API相关常量
export const API_CONSTANTS = {
  BASE_URL: 'http://localhost:5000/api',
  TIMEOUT: 30000,
  RETRY_TIMES: 3,
  RETRY_DELAY: 1000
}

// 认证相关常量
export const AUTH_CONSTANTS = {
  API_KEY_PATTERN: /^.+$/, // 移除格式限制，任何非空字符串都可以
  STORAGE_KEYS: {
    USER_ID: 'userId',
    USERNAME: 'username',
    API_KEY: 'apiKey',
    LAST_CONVERSATION_ID: 'lastConversationId'
  }
}

// 文件上传相关常量
export const UPLOAD_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_EXTENSIONS: ['.csv', '.xlsx', '.xls', '.json', '.txt', '.pdf'],
  SUPPORTED_MIME_TYPES: [
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/json',
    'text/plain',
    'application/pdf'
  ]
}

// 消息相关常量
export const MESSAGE_CONSTANTS = {
  ROLES: {
    USER: 'user',
    ASSISTANT: 'assistant',
    SYSTEM: 'system'
  },
  TYPES: {
    TEXT: 'text',
    FILE: 'file',
    TOOL_CALL: 'tool_call',
    TOOL_RESULT: 'tool_result'
  },
  STATUS: {
    SENDING: 'sending',
    SENT: 'sent',
    FAILED: 'failed',
    RECEIVED: 'received'
  }
}

// 工具调用相关常量
export const TOOL_CONSTANTS = {
  STATUS: {
    PENDING: 'pending',
    RUNNING: 'running',
    COMPLETED: 'completed',
    FAILED: 'failed'
  },
  RESULT_TYPES: {
    TEXT: 'text',
    JSON: 'json',
    CHART: 'chart',
    TABLE: 'table',
    IMAGE: 'image'
  }
}

// UI相关常量
export const UI_CONSTANTS = {
  THEME: {
    LIGHT: 'light',
    DARK: 'dark',
    AUTO: 'auto'
  },
  BREAKPOINTS: {
    XS: 480,
    SM: 576,
    MD: 768,
    LG: 992,
    XL: 1200,
    XXL: 1600
  },
  ANIMATION_DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  }
}

// 错误代码常量
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_FAILED: 'AUTH_FAILED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  MISSING_CREDENTIALS: 'MISSING_CREDENTIALS',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  UNSUPPORTED_FILE_TYPE: 'UNSUPPORTED_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  API_RATE_LIMIT: 'API_RATE_LIMIT',
  SERVER_ERROR: 'SERVER_ERROR'
}

// 成功消息常量
export const SUCCESS_MESSAGES = {
  AUTH_SUCCESS: '认证成功',
  FILE_UPLOADED: '文件上传成功',
  MESSAGE_SENT: '消息发送成功',
  CONVERSATION_CREATED: '对话创建成功',
  CONVERSATION_DELETED: '对话删除成功',
  SETTINGS_SAVED: '设置保存成功'
}

// 错误消息常量
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络连接',
  AUTH_FAILED: '认证失败，请检查您的凭据',
  INVALID_API_KEY: 'API密钥不能为空',
  MISSING_CREDENTIALS: '请填写完整的用户认证信息',
  FILE_TOO_LARGE: '文件大小超过限制',
  UNSUPPORTED_FILE_TYPE: '不支持的文件类型',
  UPLOAD_FAILED: '文件上传失败',
  SEND_MESSAGE_FAILED: '消息发送失败',
  LOAD_CONVERSATIONS_FAILED: '加载对话列表失败',
  LOAD_MESSAGES_FAILED: '加载消息失败'
} 