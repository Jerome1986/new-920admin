<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useUserStore } from '@/stores'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

/** 退出登录 */
async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定退出当前账号吗？', '提示', {
      type: 'warning',
      confirmButtonText: '退出',
      cancelButtonText: '取消',
      confirmButtonClass: 'el-button--danger',
    })
    await userStore.clearToken()
    await router.push('/login')
    ElMessage.success('已退出登录')
  } catch {
    /* 取消 */
  }
}

/** 侧栏当前激活路由 */
const activeMenu = ref(route.path)

function handleMenuSelect(index: string) {
  activeMenu.value = index
  router.push(index)
}

/** 侧栏菜单数据 */
const menuList = ref([
  { title: '数据中心', icon: 'icon-charts-line', children: [{ name: '首页统计', path: '/dashboard' }] },
  {
    title: '商品中心',
    icon: 'icon-goods',
    children: [
      { name: '商品管理', path: '/goods' },
      { name: '分类管理', path: '/category' },
      { name: '库存模板', path: '/stock' },
      { name: '型号设置', path: '/phone-model-settings' },
    ],
  },
  {
    title: '订单中心',
    icon: 'icon-order',
    children: [
      { name: '订单管理', path: '/order' },
      { name: '门店订单', path: '/shopOrder' },
      { name: '店长订单', path: '/managerOrder' },
    ],
  },
  {
    title: '用户中心',
    icon: 'icon-customer',
    children: [
      { name: '用户管理', path: '/user' },
      { name: '会员体系', path: '/member' },
    ],
  },
  {
    title: '门店中心',
    icon: 'icon-store',
    children: [
      { name: '门店管理', path: '/shop' },
      { name: '员工管理', path: '/staff' },
    ],
  },
  {
    title: '财务中心',
    icon: 'icon-money-bank',
    children: [
      { name: '佣金设置', path: '/commission' },
      { name: '结算管理', path: '/settle' },
    ],
  },
  {
    title: '营销中心',
    icon: 'icon-discount',
    children: [
      { name: '积分管理', path: '/point' },
      { name: '活动管理', path: '/activity' },
    ],
  },
  {
    title: '系统管理',
    icon: 'icon-settings',
    children: [{ name: '菜单管理', path: '/menu' }],
  },
])
</script>

<template>
  <!-- 根布局 -->
  <div class="admin-layout">
    <!-- 左侧栏 -->
    <div class="sidebar">
      <!-- Logo 行 -->
      <div class="logo">
        <div class="logo-mark" aria-hidden="true" />
        <span class="logo-title">企业管理系统</span>
      </div>

      <!-- 导航菜单 -->
      <el-menu v-model="activeMenu" background-color="var(--jel-sidebar-bg)" text-color="var(--jel-menu-text)"
        active-text-color="var(--jel-menu-active-text)" @select="handleMenuSelect">
        <el-sub-menu v-for="(group, idx) in menuList" :key="idx" :index="String(idx)">
          <template #title>
            <i class="iconfont menu-group-icon" :class="group.icon" />
            <span class="menu-group-title">{{ group.title }}</span>
          </template>
          <el-menu-item v-for="item in group.children" :key="item.path" :index="item.path">
            {{ item.name }}
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div>

    <!-- 右侧：主区域 -->
    <div class="main-wrapper">
      <!-- 顶栏 -->
      <div class="header">
        <div class="header-welcome">欢迎登录</div>

        <!-- 顶栏右侧：用户 + 退出 -->
        <div class="header-user">
          <div class="header-user-info">
            <span class="header-user-icon" aria-hidden="true">
              <i class="iconfont icon-customer" />
            </span>
            <span class="header-user-name">{{ userStore.userInfo?.username }}</span>
          </div>
          <el-button link class="header-logout-btn" @click="handleLogout">退出</el-button>
        </div>
      </div>

      <!-- 内容区（路由出口） -->
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* ---------- 根布局：左栏 + 右侧主区域 ---------- */
.admin-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* ---------- 左侧栏（白底、右侧整块阴影） ---------- */
.sidebar {
  z-index: 1;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 200px;
  background: var(--jel-sidebar-bg);
  box-shadow: var(--jel-shadow-sidebar);
}

/* 侧栏顶部：Logo + 标题行（与下方菜单无分隔线） */
.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  height: var(--jel-bar-height);
  padding: 0 16px;
  background: var(--jel-sidebar-bg);
}

/* Logo 占位色块（可换 .logo-img） */
.logo-mark {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--jel-brand) 0%, var(--el-color-primary-dark-2) 100%);
  box-shadow: 0 1px 3px rgba(214, 39, 49, 0.25);
}

/* 系统标题文案 */
.logo-title {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--jel-font-title);
  line-height: 1.25;
}

/* 替换为图片 Logo 时使用 */
.logo-img {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
}

/* 菜单分组：左侧图标 */
.menu-group-icon {
  margin-right: 8px;
  font-size: 18px;
}

/* 菜单分组：标题文字 */
.menu-group-title {
  font-weight: 500;
}

/* ---------- 右侧：浅灰底 + 顶栏 + 内容区 ---------- */
.main-wrapper {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  background: var(--jel-main-tint);
}

/* 顶栏：白底、底部分割线 */
.header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  height: var(--jel-bar-height);
  padding: 0 24px;
  background: var(--jel-header-bg);
  border-bottom: 1px solid var(--jel-border);
}

/* 顶栏左侧：欢迎语 */
.header-welcome {
  font-size: 14px;
  line-height: 1;
  color: var(--jel-font-dec2);
}

/* 顶栏右侧：整块（用户信息 + 退出） */
.header-user {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 32px;
  min-width: 0;
  font-size: 14px;
  line-height: 1;
}

/* 用户信息：图标 + 昵称一行 */
.header-user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

/* 用户圆形图标框 */
.header-user-icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--jel-border);
  border-radius: 50%;
  color: var(--jel-font-title);
  line-height: 1;

  .iconfont {
    font-size: 15px;
  }
}

/* 用户昵称（过长省略） */
.header-user-name {
  max-width: 160px;
  overflow: hidden;
  font-weight: 400;
  color: var(--jel-font-title);
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 退出：正文色 link 按钮 */
.header-user :deep(.header-logout-btn) {
  margin: 0;
  padding: 4px 2px;
  font-size: 14px;
  font-weight: 400;
  color: var(--jel-font-title);

  &:hover,
  &:focus {
    color: var(--jel-font-title);
    opacity: 0.75;
  }
}

/* 路由页面内容区（flex 子项可撑满剩余高度，内部再各自滚动） */
.content {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  padding: 20px 24px 24px;
  overflow-x: hidden;
  overflow-y: auto;
}

/* ---------- 侧栏内 Element 菜单（穿透样式） ---------- */
:deep(.el-menu) {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  border-right: none;
  background-color: transparent !important;
}

/* 菜单项 / 分组标题：默认字色与悬停底 */
:deep(.el-sub-menu__title),
:deep(.el-menu-item) {
  color: var(--jel-menu-text) !important;

  &:hover {
    background-color: var(--jel-menu-hover-bg) !important;
  }
}

/* 当前选中子菜单项 */
:deep(.el-menu-item.is-active) {
  font-weight: 600;
  color: var(--jel-menu-active-text) !important;
  background-color: var(--jel-menu-active-bg) !important;
  border-radius: 6px;
  margin: 2px 8px;
  width: auto;
}
</style>
