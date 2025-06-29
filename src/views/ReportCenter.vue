<template>
  <div class="report-center">
    <div class="header">
      <h2>报告中心</h2>
      <el-button type="primary" @click="createReport">
        <el-icon><Plus /></el-icon>
        新建报告
      </el-button>
    </div>

    <div class="filters">
      <el-row :gutter="16">
        <el-col :span="6">
          <el-select v-model="filterType" placeholder="报告类型">
            <el-option label="全部类型" value=""></el-option>
            <el-option label="数据分析" value="analysis"></el-option>
            <el-option label="可视化" value="visualization"></el-option>
            <el-option label="统计报告" value="statistics"></el-option>
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            placeholder="选择日期范围"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-col>
        <el-col :span="6">
          <el-input v-model="searchKeyword" placeholder="搜索报告名称">
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
      </el-row>
    </div>

    <div class="report-list">
      <el-row :gutter="16">
        <el-col :span="8" v-for="report in filteredReports" :key="report.id">
          <el-card class="report-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="report-title">{{ report.title }}</span>
                <el-dropdown>
                  <el-button type="text">
                    <el-icon><MoreFilled /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="viewReport(report)">
                        <el-icon><View /></el-icon>查看
                      </el-dropdown-item>
                      <el-dropdown-item @click="downloadReport(report)">
                        <el-icon><Download /></el-icon>下载
                      </el-dropdown-item>
                      <el-dropdown-item @click="shareReport(report)">
                        <el-icon><Share /></el-icon>分享
                      </el-dropdown-item>
                      <el-dropdown-item divided @click="deleteReport(report)">
                        <el-icon><Delete /></el-icon>删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
            
            <div class="report-content">
              <div class="report-type">
                <el-tag :type="getTypeColor(report.type)">{{ getTypeName(report.type) }}</el-tag>
              </div>
              <div class="report-description">{{ report.description }}</div>
              <div class="report-meta">
                <div class="meta-item">
                  <el-icon><Calendar /></el-icon>
                  {{ formatDate(report.createdAt) }}
                </div>
                <div class="meta-item">
                  <el-icon><Files /></el-icon>
                  {{ report.size }}
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 空状态 -->
    <el-empty v-if="filteredReports.length === 0" description="暂无报告数据">
      <el-button type="primary" @click="createReport">创建第一个报告</el-button>
    </el-empty>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const filterType = ref('')
const dateRange = ref([])
const searchKeyword = ref('')

// 示例报告数据
const reports = ref([
  {
    id: 1,
    title: '2024年销售数据分析报告',
    type: 'analysis',
    description: '对2024年销售数据进行全面分析，包含趋势分析、区域对比等内容',
    createdAt: new Date('2024-06-25'),
    size: '2.5MB'
  },
  {
    id: 2,
    title: '用户行为可视化报告',
    type: 'visualization',
    description: '用户访问路径、停留时间、转化漏斗等可视化图表集合',
    createdAt: new Date('2024-06-24'),
    size: '1.8MB'
  },
  {
    id: 3,
    title: '月度统计汇总',
    type: 'statistics',
    description: '包含各项关键指标的月度统计数据和同比环比分析',
    createdAt: new Date('2024-06-23'),
    size: '987KB'
  }
])

// 过滤后的报告
const filteredReports = computed(() => {
  let filtered = reports.value

  // 按类型过滤
  if (filterType.value) {
    filtered = filtered.filter(report => report.type === filterType.value)
  }

  // 按关键词搜索
  if (searchKeyword.value) {
    filtered = filtered.filter(report => 
      report.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      report.description.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  // 按日期范围过滤
  if (dateRange.value && dateRange.value.length === 2) {
    const [startDate, endDate] = dateRange.value
    filtered = filtered.filter(report => {
      const reportDate = report.createdAt.toISOString().split('T')[0]
      return reportDate >= startDate && reportDate <= endDate
    })
  }

  return filtered
})

// 获取类型名称
const getTypeName = (type) => {
  const typeMap = {
    analysis: '数据分析',
    visualization: '可视化',
    statistics: '统计报告'
  }
  return typeMap[type] || type
}

// 获取类型颜色
const getTypeColor = (type) => {
  const colorMap = {
    analysis: 'primary',
    visualization: 'success',
    statistics: 'warning'
  }
  return colorMap[type] || ''
}

// 格式化日期
const formatDate = (date) => {
  return date.toLocaleDateString('zh-CN')
}

// 创建报告
const createReport = () => {
  console.log('创建新报告')
}

// 查看报告
const viewReport = (report) => {
  console.log('查看报告:', report.title)
}

// 下载报告
const downloadReport = (report) => {
  console.log('下载报告:', report.title)
}

// 分享报告
const shareReport = (report) => {
  console.log('分享报告:', report.title)
}

// 删除报告
const deleteReport = (report) => {
  console.log('删除报告:', report.title)
}
</script>

<style scoped>
.report-center {
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

.filters {
  margin-bottom: 20px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.report-list {
  margin-bottom: 20px;
}

.report-card {
  margin-bottom: 16px;
  transition: transform 0.2s;
}

.report-card:hover {
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.report-title {
  font-weight: 600;
  color: #303133;
}

.report-content {
  height: 120px;
  display: flex;
  flex-direction: column;
}

.report-type {
  margin-bottom: 8px;
}

.report-description {
  flex: 1;
  color: #606266;
  font-size: 14px;
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.report-meta {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 12px;
}
</style> 