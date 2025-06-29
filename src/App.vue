<template>
  <div id="app">
    <el-container class="app-container">
      <!-- 侧边栏 -->
      <el-aside :width="sidebarCollapsed ? '64px' : '200px'" class="sidebar">
        <div class="sidebar-header">
          <div v-if="!sidebarCollapsed" class="logo">
            <el-icon :size="24"><TrendCharts /></el-icon>
            <span>智能数据分析</span>
          </div>
          <el-button 
            v-if="!sidebarCollapsed"
            type="text" 
            @click="toggleSidebar"
            class="collapse-btn"
          >
            <el-icon><Fold /></el-icon>
          </el-button>
          <el-button 
            v-else
            type="text" 
            @click="toggleSidebar"
            class="expand-btn"
          >
            <el-icon><Expand /></el-icon>
          </el-button>
        </div>
        
        <el-menu
          :default-active="$route.path"
          :collapse="sidebarCollapsed"
          @select="handleMenuSelect"
          class="sidebar-menu"
        >
          <el-menu-item index="/">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/chat">
            <el-icon><ChatLineRound /></el-icon>
            <span>智能对话</span>
          </el-menu-item>
          <el-menu-item index="/reports">
            <el-icon><Document /></el-icon>
            <span>报告中心</span>
          </el-menu-item>
          <el-menu-item index="/tools">
            <el-icon><Tools /></el-icon>
            <span>工具面板</span>
          </el-menu-item>
          <el-menu-item index="/settings">
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-container>
        <!-- 顶部导航栏 -->
        <el-header height="60px" class="header">
          <div class="header-left">
            <el-breadcrumb separator="/" class="breadcrumb">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ getCurrentPageTitle() }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          
          <div class="header-right">
            <el-space>
              <!-- 通知按钮 -->
              <el-badge :value="notificationCount" :hidden="notificationCount === 0" class="notification-badge">
                <el-button type="text" @click="showNotifications">
                  <el-icon :size="18"><Bell /></el-icon>
                </el-button>
              </el-badge>
              
              <!-- 用户头像菜单 -->
              <el-dropdown @command="handleUserMenuCommand">
                <div class="user-avatar">
                  <el-avatar :size="32">
                    <el-icon><User /></el-icon>
                  </el-avatar>
                  <span v-if="!sidebarCollapsed" class="username">Admin</span>
                </div>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="profile">
                      <el-icon><User /></el-icon>个人资料
                    </el-dropdown-item>
                    <el-dropdown-item command="settings">
                      <el-icon><Setting /></el-icon>设置
                    </el-dropdown-item>
                    <el-dropdown-item divided command="logout">
                      <el-icon><SwitchButton /></el-icon>退出登录
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-space>
          </div>
        </el-header>

        <!-- 主要内容区域 -->
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>

    <!-- 通知抽屉 -->
    <el-drawer v-model="notificationDrawer" title="通知中心" size="400px">
      <div class="notifications">
        <div v-for="notification in notifications" :key="notification.id" class="notification-item">
          <div class="notification-content">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-message">{{ notification.message }}</div>
            <div class="notification-time">{{ formatTime(notification.time) }}</div>
          </div>
          <el-button type="text" @click="removeNotification(notification.id)">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
        
        <el-empty v-if="notifications.length === 0" description="暂无通知" :image-size="80" />
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 侧边栏状态
const sidebarCollapsed = ref(false)
const notificationDrawer = ref(false)

// 通知数据
const notifications = ref([
  {
    id: 1,
    title: '任务完成',
    message: '数据分析报告已生成完成',
    time: new Date(),
    type: 'success'
  },
  {
    id: 2,
    title: '系统更新',
    message: '系统将在今晚进行维护升级',
    time: new Date(Date.now() - 3600000),
    type: 'info'
  }
])

// 通知数量
const notificationCount = computed(() => notifications.value.length)

// 切换侧边栏
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

// 菜单选择处理
const handleMenuSelect = (index) => {
  router.push(index)
}

// 获取当前页面标题
const getCurrentPageTitle = () => {
  const routeMap = {
    '/': '首页',
    '/chat': '智能对话',
    '/reports': '报告中心',
    '/tools': '工具面板',
    '/settings': '系统设置'
  }
  return routeMap[route.path] || '未知页面'
}

// 显示通知
const showNotifications = () => {
  notificationDrawer.value = true
}

// 用户菜单命令处理
const handleUserMenuCommand = (command) => {
  switch (command) {
    case 'profile':
      console.log('查看个人资料')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      console.log('退出登录')
      break
  }
}

// 移除通知
const removeNotification = (id) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

// 格式化时间
const formatTime = (time) => {
  const now = new Date()
  const diff = now - time
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  return `${days}天前`
}

// 页面加载完成
onMounted(() => {
  console.log('智能数据分析系统已启动')
})
</script>

<style scoped>
.app-container {
  height: 100vh;
}

.sidebar {
  background: #001428;
  transition: width 0.3s;
  overflow: hidden;
}

.sidebar-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid #1f2937;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-weight: 600;
  font-size: 16px;
}

.collapse-btn, .expand-btn {
  color: #9ca3af;
}

.sidebar-menu {
  border: none;
  background: transparent;
}

.sidebar-menu .el-menu-item {
  color: #9ca3af;
}

.sidebar-menu .el-menu-item:hover {
  background-color: #1f2937;
  color: #ffffff;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #3b82f6;
  color: #ffffff;
}

.header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.header-left .breadcrumb {
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
}

.notification-badge {
  cursor: pointer;
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.user-avatar:hover {
  background-color: #f3f4f6;
}

.username {
  font-size: 14px;
  color: #374151;
}

.main-content {
  background: #f9fafb;
  padding: 0;
  overflow: auto;
}

.notifications {
  padding: 0;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.notification-message {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 8px;
}

.notification-time {
  color: #9ca3af;
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .sidebar {
    width: 180px !important;
  }
  
  .header {
    padding: 0 20px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 64px !important;
  }
  
  .user-avatar .username {
    display: none;
  }
  
  .header {
    padding: 0 16px;
  }
  
  .breadcrumb {
    display: none;
  }
}

/* 确保容器充满整个屏幕 */
#app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.app-container {
  width: 100%;
  height: 100vh;
  max-width: none;
}

/* 确保主内容区域自适应 */
.el-container:last-child {
  flex: 1;
  min-width: 0;
}

/* 全局样式调整 */
:deep(.el-menu--collapse .el-menu-item span) {
  display: none;
}

:deep(.el-menu--collapse .el-menu-item .el-icon) {
  margin: 0;
}
</style>
