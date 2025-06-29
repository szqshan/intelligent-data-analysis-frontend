<template>
  <div class="tools-panel">
    <div class="header">
      <h2>工具面板</h2>
      <el-input v-model="searchKeyword" placeholder="搜索工具" class="search-input">
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <div class="tool-categories">
      <el-tabs v-model="activeCategory" @tab-click="handleTabClick">
        <el-tab-pane label="全部工具" name="all">
          <div class="tools-grid">
            <div v-for="tool in filteredTools" :key="tool.id" class="tool-card">
              <el-card shadow="hover" @click="selectTool(tool)">
                <div class="tool-icon">
                  <el-icon :size="32" :color="tool.color">
                    <component :is="tool.icon" />
                  </el-icon>
                </div>
                <div class="tool-info">
                  <h3>{{ tool.name }}</h3>
                  <p>{{ tool.description }}</p>
                  <div class="tool-meta">
                    <el-tag size="small" :type="tool.status === 'active' ? 'success' : 'info'">
                      {{ tool.status === 'active' ? '运行中' : '就绪' }}
                    </el-tag>
                    <span class="usage-count">使用 {{ tool.usageCount }} 次</span>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="数据处理" name="data">
          <div class="tools-grid">
            <div v-for="tool in getToolsByCategory('data')" :key="tool.id" class="tool-card">
              <el-card shadow="hover" @click="selectTool(tool)">
                <div class="tool-icon">
                  <el-icon :size="32" :color="tool.color">
                    <component :is="tool.icon" />
                  </el-icon>
                </div>
                <div class="tool-info">
                  <h3>{{ tool.name }}</h3>
                  <p>{{ tool.description }}</p>
                </div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="可视化" name="visualization">
          <div class="tools-grid">
            <div v-for="tool in getToolsByCategory('visualization')" :key="tool.id" class="tool-card">
              <el-card shadow="hover" @click="selectTool(tool)">
                <div class="tool-icon">
                  <el-icon :size="32" :color="tool.color">
                    <component :is="tool.icon" />
                  </el-icon>
                </div>
                <div class="tool-info">
                  <h3>{{ tool.name }}</h3>
                  <p>{{ tool.description }}</p>
                </div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="机器学习" name="ml">
          <div class="tools-grid">
            <div v-for="tool in getToolsByCategory('ml')" :key="tool.id" class="tool-card">
              <el-card shadow="hover" @click="selectTool(tool)">
                <div class="tool-icon">
                  <el-icon :size="32" :color="tool.color">
                    <component :is="tool.icon" />
                  </el-icon>
                </div>
                <div class="tool-info">
                  <h3>{{ tool.name }}</h3>
                  <p>{{ tool.description }}</p>
                </div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 工具详情弹窗 -->
    <el-dialog v-model="toolDialogVisible" :title="selectedTool?.name" width="600px">
      <div v-if="selectedTool" class="tool-details">
        <div class="tool-header">
          <div class="tool-icon-large">
            <el-icon :size="48" :color="selectedTool.color">
              <component :is="selectedTool.icon" />
            </el-icon>
          </div>
          <div class="tool-basic-info">
            <h3>{{ selectedTool.name }}</h3>
            <p>{{ selectedTool.description }}</p>
            <div class="tool-tags">
              <el-tag v-for="tag in selectedTool.tags" :key="tag" size="small">{{ tag }}</el-tag>
            </div>
          </div>
        </div>
        
        <el-divider />
        
        <div class="tool-parameters">
          <h4>参数配置</h4>
          <el-form :model="toolParams" label-width="100px">
            <el-form-item v-for="param in selectedTool.parameters" :key="param.name" :label="param.label">
              <el-input v-if="param.type === 'text'" v-model="toolParams[param.name]" :placeholder="param.placeholder" />
              <el-select v-else-if="param.type === 'select'" v-model="toolParams[param.name]" :placeholder="param.placeholder">
                <el-option v-for="option in param.options" :key="option.value" :label="option.label" :value="option.value" />
              </el-select>
              <el-switch v-else-if="param.type === 'boolean'" v-model="toolParams[param.name]" />
            </el-form-item>
          </el-form>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="toolDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="executeTool">执行工具</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'

const activeCategory = ref('all')
const searchKeyword = ref('')
const toolDialogVisible = ref(false)
const selectedTool = ref(null)
const toolParams = reactive({})

// 工具数据
const tools = ref([
  {
    id: 1,
    name: 'Pandas分析器',
    description: '使用Pandas进行数据清洗、转换和基础分析',
    category: 'data',
    icon: 'DataAnalysis',
    color: '#409EFF',
    status: 'ready',
    usageCount: 156,
    tags: ['数据清洗', '数据转换', 'Python'],
    parameters: [
      { name: 'file_path', label: '文件路径', type: 'text', placeholder: '请输入CSV文件路径' },
      { name: 'delimiter', label: '分隔符', type: 'select', options: [
        { label: '逗号(,)', value: ',' },
        { label: '分号(;)', value: ';' },
        { label: '制表符', value: '\t' }
      ]},
      { name: 'header', label: '包含标题行', type: 'boolean' }
    ]
  },
  {
    id: 2,
    name: '图表生成器',
    description: '生成各种类型的数据可视化图表',
    category: 'visualization',
    icon: 'PieChart',
    color: '#67C23A',
    status: 'active',
    usageCount: 89,
    tags: ['可视化', '图表', 'Matplotlib'],
    parameters: [
      { name: 'chart_type', label: '图表类型', type: 'select', options: [
        { label: '柱状图', value: 'bar' },
        { label: '折线图', value: 'line' },
        { label: '饼图', value: 'pie' },
        { label: '散点图', value: 'scatter' }
      ]},
      { name: 'title', label: '图表标题', type: 'text', placeholder: '请输入图表标题' }
    ]
  },
  {
    id: 3,
    name: '机器学习模型',
    description: '训练和评估机器学习模型',
    category: 'ml',
    icon: 'Connection',
    color: '#E6A23C',
    status: 'ready',
    usageCount: 34,
    tags: ['机器学习', 'Sklearn', '模型训练'],
    parameters: [
      { name: 'model_type', label: '模型类型', type: 'select', options: [
        { label: '线性回归', value: 'linear' },
        { label: '随机森林', value: 'rf' },
        { label: 'SVM', value: 'svm' }
      ]},
      { name: 'test_size', label: '测试集比例', type: 'text', placeholder: '0.2' }
    ]
  },
  {
    id: 4,
    name: '统计分析',
    description: '执行描述性统计和推断统计分析',
    category: 'data',
    icon: 'TrendCharts',
    color: '#909399',
    status: 'ready',
    usageCount: 78,
    tags: ['统计学', '假设检验', '描述性统计'],
    parameters: [
      { name: 'confidence_level', label: '置信水平', type: 'select', options: [
        { label: '90%', value: 0.9 },
        { label: '95%', value: 0.95 },
        { label: '99%', value: 0.99 }
      ]}
    ]
  }
])

// 过滤后的工具
const filteredTools = computed(() => {
  let filtered = tools.value

  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(tool => tool.category === activeCategory.value)
  }

  if (searchKeyword.value) {
    filtered = filtered.filter(tool => 
      tool.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      tool.tags.some(tag => tag.toLowerCase().includes(searchKeyword.value.toLowerCase()))
    )
  }

  return filtered
})

// 根据分类获取工具
const getToolsByCategory = (category) => {
  return tools.value.filter(tool => tool.category === category)
}

// 选择工具
const selectTool = (tool) => {
  selectedTool.value = tool
  // 初始化参数
  Object.keys(toolParams).forEach(key => delete toolParams[key])
  tool.parameters.forEach(param => {
    toolParams[param.name] = param.type === 'boolean' ? false : ''
  })
  toolDialogVisible.value = true
}

// 执行工具
const executeTool = () => {
  console.log('执行工具:', selectedTool.value.name, '参数:', toolParams)
  toolDialogVisible.value = false
  // 更新使用次数
  selectedTool.value.usageCount++
}

// 标签页切换
const handleTabClick = (tab) => {
  console.log('切换到分类:', tab.props.name)
}
</script>

<style scoped>
.tools-panel {
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

.search-input {
  width: 300px;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.tool-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.tool-card:hover {
  transform: translateY(-2px);
}

.tool-card .el-card {
  height: 100%;
}

.tool-card .el-card__body {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.tool-icon {
  flex-shrink: 0;
}

.tool-info {
  flex: 1;
}

.tool-info h3 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 16px;
}

.tool-info p {
  margin: 0 0 12px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.4;
}

.tool-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.usage-count {
  color: #909399;
  font-size: 12px;
}

.tool-details {
  padding: 0;
}

.tool-header {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.tool-icon-large {
  flex-shrink: 0;
}

.tool-basic-info {
  flex: 1;
}

.tool-basic-info h3 {
  margin: 0 0 8px 0;
  color: #303133;
}

.tool-basic-info p {
  margin: 0 0 12px 0;
  color: #606266;
  line-height: 1.5;
}

.tool-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tool-parameters h4 {
  margin: 0 0 16px 0;
  color: #303133;
}
</style> 