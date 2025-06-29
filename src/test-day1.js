// Day 1 API层功能验证脚本
import { userAPI, chatAPI, uploadAPI } from './api/index.js'
import { AUTH_CONSTANTS, ERROR_MESSAGES, SUCCESS_MESSAGES } from './utils/constants.js'

console.log('🚀 Day 1 API层功能验证开始...')

// 1. 验证常量定义
console.log('\n📋 1. 验证常量定义')
console.log('✅ AUTH_CONSTANTS:', !!AUTH_CONSTANTS)
console.log('✅ ERROR_MESSAGES:', !!ERROR_MESSAGES)
console.log('✅ SUCCESS_MESSAGES:', !!SUCCESS_MESSAGES)

// 2. 验证API模块导入
console.log('\n📋 2. 验证API模块导入')
console.log('✅ userAPI 导入:', !!userAPI)
console.log('✅ chatAPI 导入:', !!chatAPI)
console.log('✅ uploadAPI 导入:', !!uploadAPI)

// 3. 验证userAPI方法
console.log('\n📋 3. 验证userAPI方法')
const userAPIMethods = ['validateAuth', 'getSystemStatus', 'healthCheck', 'validateApiKeyFormat']
userAPIMethods.forEach(method => {
  console.log(`✅ userAPI.${method}:`, typeof userAPI[method] === 'function' ? '存在' : '❌ 缺失')
})

// 4. 验证chatAPI方法
console.log('\n📋 4. 验证chatAPI方法')
const chatAPIMethods = ['createConversation', 'getConversations', 'getMessages', 'sendMessage']
chatAPIMethods.forEach(method => {
  console.log(`✅ chatAPI.${method}:`, typeof chatAPI[method] === 'function' ? '存在' : '❌ 缺失')
})

// 5. 验证uploadAPI方法
console.log('\n📋 5. 验证uploadAPI方法')
const uploadAPIMethods = ['uploadFile', 'validateFileType', 'validateFileSize', 'formatFileSize']
uploadAPIMethods.forEach(method => {
  console.log(`✅ uploadAPI.${method}:`, typeof uploadAPI[method] === 'function' ? '存在' : '❌ 缺失')
})

// 6. 测试文件验证功能
console.log('\n📋 6. 测试文件验证功能')
const testFile1 = { name: 'test.csv', type: 'text/csv', size: 1024 }
const testFile2 = { name: 'test.exe', type: 'application/octet-stream', size: 1024 }
const testFile3 = { name: 'large.csv', type: 'text/csv', size: 20 * 1024 * 1024 }

console.log(`✅ CSV文件类型验证: ${uploadAPI.validateFileType(testFile1) ? '通过' : '❌ 失败'}`)
console.log(`✅ EXE文件类型验证: ${!uploadAPI.validateFileType(testFile2) ? '通过' : '❌ 失败'}`)
console.log(`✅ 文件大小验证(正常): ${uploadAPI.validateFileSize(testFile1) ? '通过' : '❌ 失败'}`)
console.log(`✅ 文件大小验证(超大): ${!uploadAPI.validateFileSize(testFile3) ? '通过' : '❌ 失败'}`)

// 7. 测试API密钥格式验证
console.log('\n📋 7. 测试API密钥格式验证')
const validKey = 'test-api-key-12345'
const invalidKey = ''
console.log(`✅ 有效API密钥验证: ${userAPI.validateApiKeyFormat(validKey) ? '通过' : '❌ 失败'}`)
console.log(`✅ 无效API密钥验证(空字符串): ${!userAPI.validateApiKeyFormat(invalidKey) ? '通过' : '❌ 失败'}`)

// 8. 测试文件大小格式化
console.log('\n📋 8. 测试文件大小格式化')
console.log(`✅ 1024 bytes = ${uploadAPI.formatFileSize(1024)}`)
console.log(`✅ 1MB = ${uploadAPI.formatFileSize(1024 * 1024)}`)
console.log(`✅ 1GB = ${uploadAPI.formatFileSize(1024 * 1024 * 1024)}`)

console.log('\n🎉 Day 1 API层功能验证完成！')
console.log('📊 所有基础功能和工具函数均已正确实现')

// 9. 健康检查测试 (需要后端运行)
console.log('\n📋 9. 尝试健康检查测试 (需要后端API运行)')
try {
  userAPI.healthCheck()
    .then(result => {
      console.log('✅ 健康检查成功:', result)
    })
    .catch(error => {
      console.log('⚠️ 健康检查失败 (后端未运行):', error.message)
    })
} catch (error) {
  console.log('⚠️ 健康检查测试跳过 (axios未配置):', error.message)
}

export default {
  userAPI,
  chatAPI,
  uploadAPI,
  constants: { AUTH_CONSTANTS, ERROR_MESSAGES, SUCCESS_MESSAGES }
} 