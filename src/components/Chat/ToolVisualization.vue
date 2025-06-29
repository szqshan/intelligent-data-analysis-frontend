<template>
  <div class="tool-visualization">
    <div class="tool-header">
      <el-icon class="tool-icon"><Tools /></el-icon>
      <span class="tool-title">工具调用</span>
      <el-tag :type="getStatusType(overallStatus)" size="small">
        {{ getStatusText(overallStatus) }}
      </el-tag>
    </div>

    <div class="tool-list">
      <div 
        v-for="tool in tools" 
        :key="tool.id" 
        class="tool-item"
        :class="{ 'active': tool.status === 'executing' }"
      >
        <div class="tool-info">
          <div class="tool-name">
            <el-icon :class="getToolIconClass(tool.status)">
              <component :is="getToolIcon(tool.status)" />
            </el-icon>
            {{ getToolDisplayName(tool.name) }}
          </div>
          
          <div class="tool-meta">
            <el-tag :type="getStatusType(tool.status)" size="small">
              {{ getStatusText(tool.status) }}
            </el-tag>
            <span v-if="tool.duration" class="tool-duration">
              {{ formatDuration(tool.duration) }}
            </span>
          </div>
        </div>

        <!-- 工具执行进度 -->
        <div v-if="tool.status === 'executing'" class="tool-progress">
          <el-progress 
            :percentage="tool.progress || 0" 
            :show-text="false" 
            :stroke-width="4"
            :color="progressColor"
          />
          <span class="progress-text">{{ tool.progressText || '执行中...' }}</span>
        </div>

        <!-- 工具参数 -->
        <div v-if="tool.parameters && showDetails" class="tool-parameters">
          <div class="parameters-header">
            <span>参数：</span>
            <el-button 
              size="small" 
              text 
              @click="toggleParameters(tool.id)"
            >
              <el-icon>
                <component :is="tool.showParams ? 'ArrowUp' : 'ArrowDown'" />
              </el-icon>
            </el-button>
          </div>
          
          <div v-if="tool.showParams" class="parameters-content">
            <pre class="parameters-json">{{ formatParameters(tool.parameters) }}</pre>
          </div>
        </div>

        <!-- 工具结果 -->
        <div v-if="tool.result && tool.status === 'completed'" class="tool-result">
          <div class="result-header">
            <el-icon class="success-icon"><CircleCheck /></el-icon>
            <span>执行结果</span>
          </div>
          <div class="result-content">
            <div v-if="tool.result.type === 'chart'" class="result-chart">
              <img :src="tool.result.data" alt="生成的图表" class="chart-image" />
            </div>
            <div v-else-if="tool.result.type === 'data'" class="result-data">
              <el-table :data="tool.result.data.slice(0, 5)" size="small" max-height="200">
                <el-table-column 
                  v-for="column in tool.result.columns" 
                  :key="column"
                  :prop="column" 
                  :label="column"
                  show-overflow-tooltip
                />
              </el-table>
              <div v-if="tool.result.data.length > 5" class="data-more">
                还有 {{ tool.result.data.length - 5 }} 行数据...
              </div>
            </div>
            <div v-else class="result-text">
              {{ tool.result.summary || '执行成功' }}
            </div>
          </div>
        </div>

        <!-- 错误信息 -->
        <div v-if="tool.error && tool.status === 'failed'" class="tool-error">
          <div class="error-header">
            <el-icon class="error-icon"><CircleClose /></el-icon>
            <span>执行失败</span>
          </div>
          <div class="error-content">
            {{ tool.error }}
          </div>
        </div>
      </div>
    </div>

    <!-- 展开/收起按钮 -->
    <div v-if="tools.length > 1" class="tool-actions">
      <el-button 
        size="small" 
        text 
        @click="showDetails = !showDetails"
      >
        <el-icon>
          <component :is="showDetails ? 'ArrowUp' : 'ArrowDown'" />
        </el-icon>
        {{ showDetails ? '收起详情' : '展开详情' }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  tools: {
    type: Array,
    required: true,
    default: () => []
  }
})

// 响应式数据
const showDetails = ref(false)

// 计算整体状态
const overallStatus = computed(() => {
  if (props.tools.some(tool => tool.status === 'executing')) {
    return 'executing'
  }
  if (props.tools.some(tool => tool.status === 'failed')) {
    return 'failed'
  }
  if (props.tools.every(tool => tool.status === 'completed')) {
    return 'completed'
  }
  return 'pending'
})

// 进度条颜色
const progressColor = computed(() => {
  return [
    { color: '#6f7ad3', percentage: 20 },
    { color: '#1989fa', percentage: 40 },
    { color: '#5cb87a', percentage: 60 },
    { color: '#e6a23c', percentage: 80 },
    { color: '#67c23a', percentage: 100 }
  ]
})

// 获取状态类型
function getStatusType(status) {
  const statusMap = {
    pending: 'info',
    executing: 'warning',
    completed: 'success',
    failed: 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    pending: '等待中',
    executing: '执行中',
    completed: '已完成',
    failed: '执行失败'
  }
  return statusMap[status] || '未知状态'
}

// 获取工具图标
function getToolIcon(status) {
  const iconMap = {
    pending: 'Clock',
    executing: 'Loading',
    completed: 'CircleCheck',
    failed: 'CircleClose'
  }
  return iconMap[status] || 'Tools'
}

// 获取工具图标样式类
function getToolIconClass(status) {
  const classMap = {
    pending: 'pending-icon',
    executing: 'executing-icon',
    completed: 'success-icon',
    failed: 'error-icon'
  }
  return classMap[status] || ''
}

// 获取工具显示名称
function getToolDisplayName(name) {
  const nameMap = {
    'pandas_analyzer': '数据分析器',
    'chart_generator': '图表生成器',
    'file_processor': '文件处理器',
    'data_cleaner': '数据清洗器',
    'statistical_analyzer': '统计分析器'
  }
  return nameMap[name] || name
}

// 格式化参数
function formatParameters(params) {
  return JSON.stringify(params, null, 2)
}

// 格式化持续时间
function formatDuration(ms) {
  if (ms < 1000) {
    return `${ms}ms`
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`
  } else {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }
}

// 切换参数显示
function toggleParameters(toolId) {
  const tool = props.tools.find(t => t.id === toolId)
  if (tool) {
    tool.showParams = !tool.showParams
  }
}
</script>

<style scoped>
.tool-visualization {
  background: rgba(64, 158, 255, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.2);
  border-radius: 8px;
  padding: 12px;
  margin: 8px 0;
}

.tool-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 500;
}

.tool-icon {
  color: #409eff;
}

.tool-title {
  flex: 1;
  color: #303133;
}

.tool-list {
  space-y: 8px;
}

.tool-item {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 10px;
  transition: all 0.3s ease;
}

.tool-item.active {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.tool-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.tool-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  color: #303133;
}

.tool-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.tool-duration {
  color: #909399;
}

.tool-progress {
  margin-bottom: 8px;
}

.progress-text {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  display: block;
}

.tool-parameters {
  margin-top: 8px;
  border-top: 1px solid #f0f0f0;
  padding-top: 8px;
}

.parameters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.parameters-content {
  background: #f8f9fa;
  border-radius: 4px;
  padding: 8px;
}

.parameters-json {
  margin: 0;
  font-size: 11px;
  color: #606266;
  white-space: pre-wrap;
  word-break: break-all;
}

.tool-result {
  margin-top: 8px;
  border-top: 1px solid #f0f0f0;
  padding-top: 8px;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #67c23a;
}

.result-content {
  background: #f8f9fa;
  border-radius: 4px;
  padding: 8px;
}

.result-chart {
  text-align: center;
}

.chart-image {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.result-data {
  font-size: 12px;
}

.data-more {
  text-align: center;
  color: #909399;
  font-size: 11px;
  margin-top: 8px;
}

.result-text {
  font-size: 12px;
  color: #606266;
  line-height: 1.4;
}

.tool-error {
  margin-top: 8px;
  border-top: 1px solid #f0f0f0;
  padding-top: 8px;
}

.error-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #f56c6c;
}

.error-content {
  background: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 4px;
  padding: 8px;
  font-size: 12px;
  color: #f56c6c;
  line-height: 1.4;
}

.tool-actions {
  text-align: center;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(64, 158, 255, 0.2);
}

/* 图标动画 */
.executing-icon {
  animation: spin 1s linear infinite;
  color: #e6a23c;
}

.success-icon {
  color: #67c23a;
}

.error-icon {
  color: #f56c6c;
}

.pending-icon {
  color: #909399;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tool-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .tool-meta {
    width: 100%;
    justify-content: space-between;
  }
  
  .parameters-json {
    font-size: 10px;
  }
}
</style> 