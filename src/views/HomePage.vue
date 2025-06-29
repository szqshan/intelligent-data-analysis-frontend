<template>
  <div class="home-page">
    <div class="welcome-section">
      <div class="hero">
        <div class="hero-icon">
          <el-icon :size="80" color="#409EFF">
            <TrendCharts />
          </el-icon>
        </div>
        <h1 class="hero-title">欢迎使用智能数据分析系统</h1>
        <p class="hero-description">
          基于AI的智能数据分析平台，为您提供强大的数据洞察能力
        </p>
        <div class="quick-actions">
          <el-button type="primary" size="large" @click="$router.push('/chat')">
            <el-icon><ChatLineRound /></el-icon>
            开始智能对话
          </el-button>
          <el-button size="large" @click="$router.push('/reports')">
            <el-icon><Document /></el-icon>
            查看报告
          </el-button>
        </div>
      </div>
    </div>

    <div class="features-section">
      <div class="section-container">
        <el-row :gutter="24">
          <el-col :span="6" v-for="feature in features" :key="feature.id">
            <el-card shadow="hover" class="feature-card">
              <div class="feature-icon">
                <el-icon :size="40" :color="feature.color">
                  <component :is="feature.icon" />
                </el-icon>
              </div>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
              <el-button text type="primary" @click="$router.push(feature.path)">
                了解更多 <el-icon><ArrowRight /></el-icon>
              </el-button>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>

    <div class="stats-section">
      <div class="section-container">
        <el-row :gutter="24">
          <el-col :span="6" v-for="stat in stats" :key="stat.label">
            <div class="stat-item">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 功能特性
const features = ref([
  {
    id: 1,
    title: '智能对话',
    description: '与AI助手对话，获取数据分析洞察',
    icon: 'ChatLineRound',
    color: '#409EFF',
    path: '/chat'
  },
  {
    id: 2,
    title: '报告中心',
    description: '管理和查看生成的数据分析报告',
    icon: 'Document',
    color: '#67C23A',
    path: '/reports'
  },
  {
    id: 3,
    title: '工具面板',
    description: '使用各种数据处理和分析工具',
    icon: 'Tools',
    color: '#E6A23C',
    path: '/tools'
  },
  {
    id: 4,
    title: '系统设置',
    description: '配置系统参数和个人偏好',
    icon: 'Setting',
    color: '#909399',
    path: '/settings'
  }
])

// 统计数据
const stats = ref([
  { label: '已处理数据集', value: '128' },
  { label: '生成报告数', value: '89' },
  { label: '活跃用户', value: '2.5K' },
  { label: '系统运行时间', value: '99.9%' }
])
</script>

<style scoped>
.home-page {
  padding: 0;
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.welcome-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 60px 20px;
  text-align: center;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-icon {
  margin-bottom: 24px;
}

.hero-title {
  font-size: 36px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: white;
}

.hero-description {
  font-size: 16px;
  margin: 0 0 32px 0;
  opacity: 0.9;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.quick-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.features-section {
  padding: 40px 20px;
  background: #f8fafc;
  flex: 1;
  width: 100%;
}

.section-container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.feature-card {
  text-align: center;
  height: 200px;
  transition: transform 0.3s;
  margin-bottom: 16px;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.feature-icon {
  margin-bottom: 20px;
}

.feature-card h3 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 18px;
}

.feature-card p {
  color: #606266;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.stats-section {
  padding: 40px 20px;
  background: white;
  width: 100%;
}

.stat-item {
  text-align: center;
  padding: 20px;
}

.stat-value {
  font-size: 36px;
  font-weight: 600;
  color: #409EFF;
  margin-bottom: 8px;
}

.stat-label {
  color: #606266;
  font-size: 14px;
}

/* 响应式设计 */
/* 超大屏幕 (1920px+) */
@media (min-width: 1920px) {
  .welcome-section {
    padding: 80px 40px;
  }
  
  .features-section,
  .stats-section {
    padding: 60px 40px;
  }
  
  .hero-title {
    font-size: 42px;
  }
  
  .hero-description {
    font-size: 18px;
    max-width: 600px;
  }
}

/* 大屏幕 (1200px-1919px) */
@media (min-width: 1200px) and (max-width: 1919px) {
  .welcome-section {
    padding: 70px 30px;
  }
  
  .features-section,
  .stats-section {
    padding: 50px 30px;
  }
}

/* 中等屏幕 (992px-1199px) */
@media (min-width: 992px) and (max-width: 1199px) {
  .features-section .el-col {
    margin-bottom: 20px;
  }
  
  .feature-card {
    height: 220px;
  }
}

/* 小屏幕 (768px-991px) */
@media (min-width: 768px) and (max-width: 991px) {
  .features-section .el-row .el-col {
    width: 50% !important;
    flex: 0 0 50%;
    max-width: 50%;
    margin-bottom: 20px;
  }
  
  .stats-section .el-row .el-col {
    width: 50% !important;
    flex: 0 0 50%;
    max-width: 50%;
    margin-bottom: 16px;
  }
  
  .feature-card {
    height: 200px;
  }
  
  .welcome-section {
    padding: 50px 20px;
  }
}

/* 超小屏幕 (576px-767px) */
@media (max-width: 767px) {
  .features-section .el-row .el-col,
  .stats-section .el-row .el-col {
    width: 100% !important;
    flex: 0 0 100%;
    max-width: 100%;
    margin-bottom: 16px;
  }
  
  .hero-title {
    font-size: 28px;
  }
  
  .hero-description {
    font-size: 14px;
  }
  
  .quick-actions {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  
  .features-section,
  .welcome-section,
  .stats-section {
    padding: 30px 15px;
  }
  
  .feature-card {
    height: auto;
    min-height: 180px;
  }
  
  .stat-value {
    font-size: 28px;
  }
}

/* 极小屏幕 (≤575px) */
@media (max-width: 575px) {
  .welcome-section {
    padding: 40px 15px;
    min-height: 350px;
  }
  
  .hero-title {
    font-size: 24px;
  }
  
  .hero-description {
    font-size: 13px;
  }
  
  .quick-actions .el-button {
    width: 100%;
    max-width: 200px;
  }
  
  .features-section,
  .stats-section {
    padding: 25px 10px;
  }
}
</style> 