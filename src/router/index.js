// 导入页面组件
import HomePage from '../views/HomePage.vue'
import ChatInterface from '../views/ChatInterface.vue'
import ReportCenter from '../views/ReportCenter.vue'
import ToolsPanel from '../views/ToolsPanel.vue'
import Settings from '../views/Settings.vue'

export const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: {
      title: '首页',
      icon: 'HomeFilled'
    }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: ChatInterface,
    meta: {
      title: '智能对话',
      icon: 'ChatLineRound'
    }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: ReportCenter,
    meta: {
      title: '报告中心',
      icon: 'Document'
    }
  },
  {
    path: '/tools',
    name: 'Tools',
    component: ToolsPanel,
    meta: {
      title: '工具面板',
      icon: 'Tools'
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: {
      title: '系统设置',
      icon: 'Setting'
    }
  }
]

export default routes 