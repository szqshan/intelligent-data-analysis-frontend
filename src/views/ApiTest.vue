<template>
  <div class="api-test-page">
    <div class="container">
      <el-card class="test-card">
        <template #header>
          <div class="card-header">
            <h2>API 功能测试</h2>
            <el-tag :type="overallStatus">{{ overallStatusText }}</el-tag>
          </div>
        </template>

        <!-- 用户认证信息输入 -->
        <el-form :model="userForm" :rules="userRules" ref="userFormRef" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="用户ID" prop="userId">
                <el-input v-model="userForm.userId" placeholder="请输入用户ID" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="用户名" prop="username">
                <el-input v-model="userForm.username" placeholder="请输入用户名" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="API密钥" prop="apiKey">
                <el-input 
                  v-model="userForm.apiKey" 
                  type="password" 
                  placeholder="请输入API密钥" 
                  show-password 
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <!-- 测试按钮 -->
        <div class="test-actions">
          <el-button type="primary" @click="runBasicTests" :loading="isRunning">
            <el-icon><Lightning /></el-icon>
            基础功能测试
          </el-button>
          <el-button type="success" @click="runFullTests" :loading="isRunning" :disabled="!hasUserInfo">
            <el-icon><Check /></el-icon>
            完整功能测试
          </el-button>
          <el-button @click="clearResults">
            <el-icon><Delete /></el-icon>
            清空结果
          </el-button>
        </div>

        <!-- 测试结果 -->
        <div class="test-results" v-if="testResults.length > 0">
          <el-divider content-position="left">
            <el-icon><Document /></el-icon>
            测试结果
          </el-divider>

          <div class="results-summary">
            <el-statistic title="总测试数" :value="testResults.length" />
            <el-statistic title="通过数" :value="passedTests" />
            <el-statistic title="失败数" :value="failedTests" />
            <el-statistic title="通过率" :value="passRate" suffix="%" />
          </div>

          <el-table :data="testResults" class="results-table" max-height="400">
            <el-table-column prop="testName" label="测试项目" min-width="150" />
            <el-table-column label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.success ? 'success' : 'danger'" size="small">
                  {{ row.success ? '通过' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="message" label="消息" min-width="200" />
            <el-table-column prop="timestamp" label="时间" width="180">
              <template #default="{ row }">
                {{ formatTime(row.timestamp) }}
              </template>
            </el-table-column>
            <el-table-column label="详情" width="80" align="center">
              <template #default="{ row }">
                <el-button 
                  v-if="row.data" 
                  text 
                  type="primary" 
                  @click="showDetails(row)"
                >
                  查看
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
    </div>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailsVisible" title="测试详情" width="60%">
      <el-scrollbar max-height="400px">
        <pre class="details-content">{{ formattedDetails }}</pre>
      </el-scrollbar>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { APITester, validateUserInfo } from '@/utils/test-api'
import { AUTH_CONSTANTS } from '@/utils/constants'
import { useUserStore } from '@/stores/user'

// 用户存储
const userStore = useUserStore()

// 响应式数据
const isRunning = ref(false)
const testResults = ref([])
const detailsVisible = ref(false)
const selectedDetails = ref(null)
const userFormRef = ref(null)

// 用户表单数据
const userForm = reactive({
  userId: 'test_user_001',
  username: '测试用户',
  apiKey: ''
})

// 表单验证规则
const userRules = {
  userId: [
    { required: true, message: '请输入用户ID', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  apiKey: [
    { required: true, message: '请输入API密钥', trigger: 'blur' }
  ]
}

// 计算属性
const hasUserInfo = computed(() => {
  return userForm.userId && userForm.username && userForm.apiKey
})

const passedTests = computed(() => {
  return testResults.value.filter(r => r.success).length
})

const failedTests = computed(() => {
  return testResults.value.filter(r => !r.success).length
})

const passRate = computed(() => {
  if (testResults.value.length === 0) return 0
  return Math.round((passedTests.value / testResults.value.length) * 100)
})

const overallStatus = computed(() => {
  if (testResults.value.length === 0) return 'info'
  return passRate.value >= 80 ? 'success' : passRate.value >= 60 ? 'warning' : 'danger'
})

const overallStatusText = computed(() => {
  if (testResults.value.length === 0) return '未测试'
  return passRate.value >= 80 ? '测试通过' : passRate.value >= 60 ? '部分通过' : '测试失败'
})

const formattedDetails = computed(() => {
  if (!selectedDetails.value) return ''
  return JSON.stringify(selectedDetails.value, null, 2)
})

// 方法
const runBasicTests = async () => {
  isRunning.value = true
  
  try {
    const tester = new APITester()
    
    // 运行基础测试（不需要用户认证）
    await tester.testHealthCheck()
    tester.testFileValidation()
    
    testResults.value = tester.getResults()
    ElMessage.success(`基础测试完成，${passedTests.value}/${testResults.value.length} 项通过`)
  } catch (error) {
    ElMessage.error(`测试运行失败: ${error.message}`)
    console.error('Test error:', error)
  } finally {
    isRunning.value = false
  }
}

const runFullTests = async () => {
  // 验证用户信息
  const validation = validateUserInfo(userForm)
  if (!validation.isValid) {
    ElMessage.error(validation.errors.join(', '))
    return
  }

  isRunning.value = true
  
  try {
    const tester = new APITester()
    const results = await tester.runAllTests(userForm)
    
    testResults.value = results
    
    if (passRate.value >= 80) {
      ElMessage.success(`完整测试通过，${passedTests.value}/${testResults.value.length} 项通过`)
    } else {
      ElMessage.warning(`测试完成，${passedTests.value}/${testResults.value.length} 项通过，请检查失败项目`)
    }
  } catch (error) {
    ElMessage.error(`测试运行失败: ${error.message}`)
    console.error('Test error:', error)
  } finally {
    isRunning.value = false
  }
}

const clearResults = () => {
  testResults.value = []
  ElMessage.info('测试结果已清空')
}

const showDetails = (row) => {
  selectedDetails.value = row.data
  detailsVisible.value = true
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

// 监听用户表单变化，自动更新用户存储
watch(userForm, (newValue) => {
  userStore.setUserInfo(newValue)
}, { deep: true, immediate: true })
</script>

<style scoped>
.api-test-page {
  padding: 20px;
  min-height: 100vh;
  background: var(--el-bg-color-page);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.test-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  color: var(--el-text-color-primary);
}

.test-actions {
  margin: 20px 0;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.test-results {
  margin-top: 30px;
}

.results-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
  padding: 20px;
  background: var(--el-bg-color);
  border-radius: 8px;
}

.results-table {
  margin-top: 20px;
}

.details-content {
  background: var(--el-fill-color-light);
  padding: 15px;
  border-radius: 6px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.4;
  color: var(--el-text-color-regular);
  white-space: pre-wrap;
  word-wrap: break-word;
}

@media (max-width: 768px) {
  .api-test-page {
    padding: 10px;
  }
  
  .results-summary {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .test-actions {
    flex-direction: column;
  }
}
</style> 