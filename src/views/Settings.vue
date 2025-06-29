<template>
  <div class="settings">
    <div class="header">
      <h2>系统设置</h2>
      <el-button type="primary" @click="saveSettings">
        <el-icon><Check /></el-icon>
        保存设置
      </el-button>
    </div>

    <el-tabs v-model="activeTab" class="settings-tabs">
      <el-tab-pane label="基础设置" name="basic">
        <div class="settings-section">
          <h3>API配置</h3>
          <el-form :model="settings.api" label-width="120px">
            <el-form-item label="API服务器">
              <el-input v-model="settings.api.baseUrl" placeholder="http://localhost:8000" />
            </el-form-item>
            <el-form-item label="API密钥">
              <el-input v-model="settings.api.apiKey" type="password" placeholder="请输入API密钥" show-password />
            </el-form-item>
            <el-form-item label="请求超时">
              <el-input-number v-model="settings.api.timeout" :min="5" :max="300" :step="5" />
              <span style="margin-left: 8px; color: #909399;">秒</span>
            </el-form-item>
          </el-form>
        </div>

        <el-divider />

        <div class="settings-section">
          <h3>界面设置</h3>
          <el-form :model="settings.ui" label-width="120px">
            <el-form-item label="主题模式">
              <el-radio-group v-model="settings.ui.theme">
                <el-radio value="light">浅色模式</el-radio>
                <el-radio value="dark">深色模式</el-radio>
                <el-radio value="auto">跟随系统</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="语言">
              <el-select v-model="settings.ui.language">
                <el-option label="简体中文" value="zh-CN" />
                <el-option label="English" value="en-US" />
              </el-select>
            </el-form-item>
            <el-form-item label="字体大小">
              <el-slider v-model="settings.ui.fontSize" :min="12" :max="18" show-stops />
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <el-tab-pane label="数据处理" name="data">
        <div class="settings-section">
          <h3>默认配置</h3>
          <el-form :model="settings.data" label-width="150px">
            <el-form-item label="默认数据格式">
              <el-select v-model="settings.data.defaultFormat">
                <el-option label="CSV" value="csv" />
                <el-option label="JSON" value="json" />
                <el-option label="Excel" value="xlsx" />
              </el-select>
            </el-form-item>
            <el-form-item label="最大文件大小">
              <el-input-number v-model="settings.data.maxFileSize" :min="1" :max="1024" />
              <span style="margin-left: 8px; color: #909399;">MB</span>
            </el-form-item>
            <el-form-item label="自动保存间隔">
              <el-input-number v-model="settings.data.autoSaveInterval" :min="30" :max="600" :step="30" />
              <span style="margin-left: 8px; color: #909399;">秒</span>
            </el-form-item>
            <el-form-item label="启用数据缓存">
              <el-switch v-model="settings.data.enableCache" />
            </el-form-item>
          </el-form>
        </div>

        <el-divider />

        <div class="settings-section">
          <h3>数据安全</h3>
          <el-form :model="settings.security" label-width="150px">
            <el-form-item label="数据加密">
              <el-switch v-model="settings.security.enableEncryption" />
            </el-form-item>
            <el-form-item label="访问日志">
              <el-switch v-model="settings.security.enableAuditLog" />
            </el-form-item>
            <el-form-item label="会话超时">
              <el-input-number v-model="settings.security.sessionTimeout" :min="5" :max="480" :step="5" />
              <span style="margin-left: 8px; color: #909399;">分钟</span>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <el-tab-pane label="通知设置" name="notifications">
        <div class="settings-section">
          <h3>任务通知</h3>
          <el-form :model="settings.notifications" label-width="150px">
            <el-form-item label="任务完成通知">
              <el-switch v-model="settings.notifications.taskCompletion" />
            </el-form-item>
            <el-form-item label="错误提醒">
              <el-switch v-model="settings.notifications.errorAlerts" />
            </el-form-item>
            <el-form-item label="系统维护通知">
              <el-switch v-model="settings.notifications.systemMaintenance" />
            </el-form-item>
            <el-form-item label="邮件通知">
              <el-switch v-model="settings.notifications.emailNotifications" />
            </el-form-item>
          </el-form>
        </div>

        <el-divider />

        <div class="settings-section">
          <h3>邮件配置</h3>
          <el-form :model="settings.email" label-width="150px">
            <el-form-item label="邮箱地址">
              <el-input v-model="settings.email.address" placeholder="your@email.com" />
            </el-form-item>
            <el-form-item label="SMTP服务器">
              <el-input v-model="settings.email.smtpServer" placeholder="smtp.gmail.com" />
            </el-form-item>
            <el-form-item label="端口">
              <el-input-number v-model="settings.email.port" :min="1" :max="65535" />
            </el-form-item>
            <el-form-item label="使用SSL">
              <el-switch v-model="settings.email.useSSL" />
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <el-tab-pane label="关于系统" name="about">
        <div class="about-section">
          <div class="system-info">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>系统信息</span>
                </div>
              </template>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="系统版本">v0.1.0</el-descriptions-item>
                <el-descriptions-item label="构建时间">2024-06-29</el-descriptions-item>
                <el-descriptions-item label="Vue版本">3.5.17</el-descriptions-item>
                <el-descriptions-item label="Element Plus版本">2.10.2</el-descriptions-item>
                <el-descriptions-item label="运行环境">{{ userAgent }}</el-descriptions-item>
                <el-descriptions-item label="屏幕分辨率">{{ screenResolution }}</el-descriptions-item>
              </el-descriptions>
            </el-card>
          </div>

          <div class="actions-section">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>系统操作</span>
                </div>
              </template>
              <div class="action-buttons">
                <el-button type="info" @click="exportSettings">
                  <el-icon><Download /></el-icon>
                  导出配置
                </el-button>
                <el-button type="warning" @click="importSettings">
                  <el-icon><Upload /></el-icon>
                  导入配置
                </el-button>
                <el-button type="danger" @click="resetSettings">
                  <el-icon><RefreshLeft /></el-icon>
                  重置设置
                </el-button>
              </div>
            </el-card>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const activeTab = ref('basic')

// 设置数据
const settings = ref({
  api: {
    baseUrl: 'http://localhost:8000',
    apiKey: '',
    timeout: 30
  },
  ui: {
    theme: 'light',
    language: 'zh-CN',
    fontSize: 14
  },
  data: {
    defaultFormat: 'csv',
    maxFileSize: 100,
    autoSaveInterval: 120,
    enableCache: true
  },
  security: {
    enableEncryption: true,
    enableAuditLog: true,
    sessionTimeout: 60
  },
  notifications: {
    taskCompletion: true,
    errorAlerts: true,
    systemMaintenance: true,
    emailNotifications: false
  },
  email: {
    address: '',
    smtpServer: '',
    port: 587,
    useSSL: true
  }
})

// 系统信息
const userAgent = computed(() => {
  return navigator.userAgent.includes('Chrome') ? 'Chrome' : 
         navigator.userAgent.includes('Firefox') ? 'Firefox' : 
         navigator.userAgent.includes('Safari') ? 'Safari' : 'Unknown'
})

const screenResolution = computed(() => {
  return `${screen.width} x ${screen.height}`
})

// 页面加载时读取设置
onMounted(() => {
  loadSettings()
})

// 加载设置
const loadSettings = () => {
  const savedSettings = localStorage.getItem('app-settings')
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings)
      Object.assign(settings.value, parsed)
    } catch (error) {
      console.error('加载设置失败:', error)
    }
  }
}

// 保存设置
const saveSettings = () => {
  try {
    localStorage.setItem('app-settings', JSON.stringify(settings.value))
    ElMessage.success('设置保存成功')
  } catch (error) {
    console.error('保存设置失败:', error)
    ElMessage.error('设置保存失败')
  }
}

// 导出设置
const exportSettings = () => {
  const dataStr = JSON.stringify(settings.value, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `settings-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// 导入设置
const importSettings = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result)
          Object.assign(settings.value, imported)
          ElMessage.success('配置导入成功')
        } catch (error) {
          ElMessage.error('配置文件格式错误')
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

// 重置设置
const resetSettings = () => {
  ElMessageBox.confirm('确定要重置所有设置吗？此操作不可撤销。', '确认重置', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    localStorage.removeItem('app-settings')
    // 重置为默认值
    settings.value = {
      api: {
        baseUrl: 'http://localhost:8000',
        apiKey: '',
        timeout: 30
      },
      ui: {
        theme: 'light',
        language: 'zh-CN',
        fontSize: 14
      },
      data: {
        defaultFormat: 'csv',
        maxFileSize: 100,
        autoSaveInterval: 120,
        enableCache: true
      },
      security: {
        enableEncryption: true,
        enableAuditLog: true,
        sessionTimeout: 60
      },
      notifications: {
        taskCompletion: true,
        errorAlerts: true,
        systemMaintenance: true,
        emailNotifications: false
      },
      email: {
        address: '',
        smtpServer: '',
        port: 587,
        useSSL: true
      }
    }
    ElMessage.success('设置已重置')
  }).catch(() => {
    // 用户取消操作
  })
}
</script>

<style scoped>
.settings {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  color: #303133;
}

.settings-tabs {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.settings-section {
  margin-bottom: 30px;
}

.settings-section h3 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 16px;
}

.about-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.system-info,
.actions-section {
  width: 100%;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-header {
  font-weight: 600;
  color: #303133;
}

@media (max-width: 768px) {
  .about-section {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: row;
    justify-content: space-around;
  }
}
</style> 