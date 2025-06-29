// API功能测试文件
import { userAPI, chatAPI, uploadAPI } from '@/api'
import { AUTH_CONSTANTS, ERROR_MESSAGES } from './constants'

/**
 * API测试工具类
 */
export class APITester {
  constructor() {
    this.testResults = []
  }

  /**
   * 添加测试结果
   */
  addResult(testName, success, message, data = null) {
    this.testResults.push({
      testName,
      success,
      message,
      data,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * 获取测试结果
   */
  getResults() {
    return this.testResults
  }

  /**
   * 清空测试结果
   */
  clearResults() {
    this.testResults = []
  }

  /**
   * 打印测试结果
   */
  printResults() {
    console.log('=== API 测试结果 ===')
    this.testResults.forEach((result, index) => {
      const status = result.success ? '✅ PASS' : '❌ FAIL'
      console.log(`${index + 1}. ${result.testName}: ${status}`)
      console.log(`   消息: ${result.message}`)
      if (result.data) {
        console.log(`   数据:`, result.data)
      }
      console.log('')
    })

    const passCount = this.testResults.filter(r => r.success).length
    const totalCount = this.testResults.length
    console.log(`总计: ${passCount}/${totalCount} 通过`)
  }

  /**
   * 测试健康检查API
   */
  async testHealthCheck() {
    try {
      const result = await userAPI.healthCheck()
      this.addResult(
        '健康检查',
        true,
        '健康检查通过',
        result
      )
      return true
    } catch (error) {
      this.addResult(
        '健康检查',
        false,
        `健康检查失败: ${error.message}`,
        error
      )
      return false
    }
  }

  /**
   * 测试用户认证API
   */
  async testUserAuth(userInfo) {
    // 1. 测试API密钥格式验证
    const isValidFormat = userAPI.validateApiKeyFormat(userInfo.apiKey)
    this.addResult(
      'API密钥格式验证',
      isValidFormat,
      isValidFormat ? 'API密钥格式正确' : 'API密钥格式不正确'
    )

    if (!isValidFormat) {
      return false
    }

    // 2. 测试认证验证
    try {
      const result = await userAPI.validateAuth(userInfo)
      this.addResult(
        '用户认证验证',
        true,
        '用户认证成功',
        result
      )
      return true
    } catch (error) {
      this.addResult(
        '用户认证验证',
        false,
        `用户认证失败: ${error.message}`,
        error
      )
      return false
    }
  }

  /**
   * 测试对话管理API
   */
  async testConversationAPI(userInfo) {
    try {
      // 1. 创建对话
      const createResult = await chatAPI.createConversation({
        description: '这是一个API测试对话'
      })

      this.addResult(
        '创建对话',
        true,
        '对话创建成功',
        createResult
      )

      // 2. 获取对话列表
      const listResult = await chatAPI.getConversations()
      this.addResult(
        '获取对话列表',
        true,
        `获取到 ${listResult.conversations?.length || 0} 个对话`,
        listResult
      )

      // 3. 获取当前对话
      const currentResult = await chatAPI.getCurrentConversation()
      this.addResult(
        '获取当前对话',
        true,
        '当前对话获取成功',
        currentResult
      )

      return createResult.conversation?.conversation_id || null
    } catch (error) {
      this.addResult(
        '对话管理API测试',
        false,
        `对话管理API测试失败: ${error.message}`,
        error
      )
      return null
    }
  }

  /**
   * 测试文件验证功能
   */
  testFileValidation() {
    // 创建测试文件对象
    const testFiles = [
      { name: 'test.csv', size: 1024, type: 'text/csv' },
      { name: 'test.xlsx', size: 2048, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
      { name: 'test.exe', size: 1024, type: 'application/octet-stream' },
      { name: 'large.csv', size: 20 * 1024 * 1024, type: 'text/csv' }
    ]

    testFiles.forEach(file => {
      // 测试文件类型验证
      const isValidType = uploadAPI.validateFileType(file)
      this.addResult(
        `文件类型验证 (${file.name})`,
        file.name === 'test.exe' ? !isValidType : isValidType,
        `文件 ${file.name} 类型验证${isValidType ? '通过' : '失败'}`
      )

      // 测试文件大小验证
      const isValidSize = uploadAPI.validateFileSize(file)
      this.addResult(
        `文件大小验证 (${file.name})`,
        file.name === 'large.csv' ? !isValidSize : isValidSize,
        `文件 ${file.name} 大小验证${isValidSize ? '通过' : '失败'} (${uploadAPI.formatFileSize(file.size)})`
      )
    })
  }

  /**
   * 运行所有测试
   */
  async runAllTests(userInfo = null) {
    console.log('开始运行API测试...')
    this.clearResults()

    // 1. 健康检查测试
    await this.testHealthCheck()

    // 2. 文件验证测试
    this.testFileValidation()

    // 如果提供了用户信息，进行认证相关测试
    if (userInfo) {
      // 3. 用户认证测试
      const authSuccess = await this.testUserAuth(userInfo)

      // 4. 对话管理测试（需要认证成功）
      if (authSuccess) {
        await this.testConversationAPI(userInfo)
      }
    } else {
      this.addResult(
        '用户认证测试',
        false,
        '跳过用户认证测试 (未提供用户信息)'
      )
    }

    this.printResults()
    return this.getResults()
  }
}

/**
 * 快速API测试函数
 */
export async function quickAPITest(userInfo = null) {
  const tester = new APITester()
  return await tester.runAllTests(userInfo)
}

/**
 * 测试用户认证信息格式
 */
export function validateUserInfo(userInfo) {
  const errors = []

  if (!userInfo) {
    errors.push('用户信息不能为空')
    return { isValid: false, errors }
  }

  if (!userInfo.userId || typeof userInfo.userId !== 'string') {
    errors.push('用户ID必须是非空字符串')
  }

  if (!userInfo.username || typeof userInfo.username !== 'string') {
    errors.push('用户名必须是非空字符串')
  }

  if (!userInfo.apiKey || typeof userInfo.apiKey !== 'string') {
    errors.push('API密钥必须是非空字符串')
  } else if (!userInfo.apiKey.trim()) {
    errors.push('API密钥不能为空')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
} 