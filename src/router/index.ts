import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'
import { useUserStore } from '@/stores'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 登录
    { path: '/login', component: () => import('@/views/login/index.vue') },
    {
      path: '/',
      component: Layout,
      redirect: '/dashboard',
      children: [
        // 数据中心
        { path: '/dashboard', component: () => import('@/views/dashboard/index.vue') },

        // 商品中心
        { path: '/goods', component: () => import('@/views/goods/index.vue') },
        { path: '/goods/product/edit', component: () => import('@/views/goods/product-form.vue') },
        { path: '/goods/vip-plan/edit', component: () => import('@/views/goods/vip-plan-form.vue') },
        { path: '/category', component: () => import('@/views/goods/category.vue') },
        { path: '/stock', component: () => import('@/views/goods/stock.vue') },
        { path: '/stock/template/edit', component: () => import('@/views/goods/stock-template-edit.vue') },
        { path: '/phone-model-settings', component: () => import('@/views/goods/phone-model-settings.vue') },

        // 订单中心
        { path: '/order/detail/:outTradeNo', component: () => import('@/views/order/order-detail.vue') },
        { path: '/order', component: () => import('@/views/order/index.vue') },
        { path: '/shopOrder', component: () => import('@/views/order/shopOrder.vue') },
        { path: '/managerOrder', component: () => import('@/views/order/managerOrder.vue') },

        // 用户中心
        { path: '/user', component: () => import('@/views/user/index.vue') },
        { path: '/member', component: () => import('@/views/user/member.vue') },

        // 门店中心
        { path: '/shop/create', component: () => import('@/views/shop/store-create.vue') },
        { path: '/shop/detail/:id', component: () => import('@/views/shop/storeDetail.vue') },
        { path: '/shop', component: () => import('@/views/shop/index.vue') },
        { path: '/staff', component: () => import('@/views/shop/staff.vue') },

        // 财务中心
        { path: '/commission', component: () => import('@/views/finance/commission.vue') },
        { path: '/settle', component: () => import('@/views/finance/settle.vue') },

        // 营销中心
        { path: '/point', component: () => import('@/views/market/point.vue') },
        { path: '/activity', component: () => import('@/views/market/activity.vue') },

        // 系统管理
        { path: '/menu', component: () => import('@/views/system/menu.vue') },
      ],
    },
  ]
})


// 路由守卫
router.beforeEach((to) => {
  const userStore = useUserStore()

  if ((!userStore.token) && to.path !== '/login') {
    return '/login'
  }
})

export default router
