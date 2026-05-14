<script lang="ts" setup>
import { dashboardSummaryApi } from '@/api/dashboard'
import type {
  DashboardCoreMetric,
  DashboardModuleStatGroup,
  DashboardStatValueType,
  DashboardSummary,
} from '@/types/dashboard'
import { formatTimestamp } from '@/utils/formatTimestamp'
import { Refresh } from '@element-plus/icons-vue'
import { computed, onMounted, ref } from 'vue'

// 页面加载状态
const loading = ref(false)
// 首页统计接口返回数据
const summary = ref<DashboardSummary | null>(null)

// 核心概览指标
const coreMetrics = computed<DashboardCoreMetric[]>(() => {
  const overview = summary.value?.overview

  return [
    { label: '订单总数', value: overview?.orderTotal ?? 0, unit: '单', description: '商品、店长与门店订单汇总' },
    { label: '商品总数', value: overview?.productTotal ?? 0, unit: '件', description: 'B端、C端与会员套餐' },
    { label: '用户总数', value: overview?.userTotal ?? 0, unit: '人', description: '普通用户、VIP 与店长' },
    { label: '门店总数', value: overview?.storeTotal ?? 0, unit: '家', description: '已创建门店数量' },
    { label: '待结算金额', value: overview?.pendingSettlementAmount ?? 0, valueType: 'money', description: '门店待结算资金' },
    { label: '提现申请中', value: overview?.applyingWithdrawCount ?? 0, unit: '笔', description: '等待处理的提现申请' },
  ]
})

// 分模块统计卡片
const moduleGroups = computed<DashboardModuleStatGroup[]>(() => {
  const goods = summary.value?.goods
  const orders = summary.value?.orders
  const users = summary.value?.users
  const stores = summary.value?.stores
  const finance = summary.value?.finance

  return [
    {
      title: '商品中心',
      description: '商品、分类、库存模板与型号配置',
      items: [
        { label: 'B端商品', value: goods?.tobProductCount ?? 0, unit: '件' },
        { label: 'C端商品', value: goods?.tocProductCount ?? 0, unit: '件' },
        { label: '会员套餐', value: goods?.vipPlanCount ?? 0, unit: '个' },
        { label: '商品分类', value: goods?.categoryCount ?? 0, unit: '个' },
        { label: '库存模板', value: goods?.stockTemplateCount ?? 0, unit: '套' },
        { label: '型号数量', value: goods?.phoneModelCount ?? 0, unit: '个' },
      ],
    },
    {
      title: '订单中心',
      description: '按订单来源与处理状态汇总',
      items: [
        { label: 'C端商品订单', value: orders?.tocOrderCount ?? 0, unit: '单' },
        { label: '店长订单', value: orders?.managerOrderCount ?? 0, unit: '单' },
        { label: '门店订单', value: orders?.storeOrderCount ?? 0, unit: '单' },
        { label: '待支付', value: orders?.pendingCount ?? 0, unit: '单' },
        { label: '已支付', value: orders?.paidCount ?? 0, unit: '单' },
        { label: '已发货', value: orders?.shippedCount ?? 0, unit: '单' },
        { label: '已完成', value: orders?.completedCount ?? 0, unit: '单' },
        { label: '已取消', value: orders?.cancelledCount ?? 0, unit: '单' },
        { label: '处理中', value: orders?.processingCount ?? 0, unit: '单' },
        { label: '已退款', value: orders?.refundedCount ?? 0, unit: '单' },
      ],
    },
    {
      title: '用户中心',
      description: '用户角色与账号状态概览',
      items: [
        { label: '普通用户', value: users?.normalUserCount ?? 0, unit: '人' },
        { label: 'VIP会员', value: users?.vipUserCount ?? 0, unit: '人' },
        { label: '店长', value: users?.managerUserCount ?? 0, unit: '人' },
        { label: '正常账号', value: users?.activeAccountCount ?? 0, unit: '个' },
        { label: '禁用账号', value: users?.inactiveAccountCount ?? 0, unit: '个' },
      ],
    },
    {
      title: '门店中心',
      description: '门店经营基础数据汇总',
      items: [
        { label: '门店总数', value: stores?.storeCount ?? 0, unit: '家' },
        { label: '已绑定店长门店', value: stores?.boundManagerStoreCount ?? 0, unit: '家' },
        { label: '门店会员数', value: stores?.storeMemberCount ?? 0, unit: '人' },
        { label: '门店待结算资金', value: stores?.pendingSettlementAmount ?? 0, valueType: 'money' },
      ],
    },
    {
      title: '财务中心',
      description: '结算、提现与佣金金额汇总',
      items: [
        { label: '结算记录', value: finance?.settlementRecordCount ?? 0, unit: '条' },
        { label: '待结算', value: finance?.pendingSettlementCount ?? 0, unit: '条' },
        { label: '已结算', value: finance?.settledCount ?? 0, unit: '条' },
        { label: '提现申请中', value: finance?.applyingWithdrawCount ?? 0, unit: '笔' },
        { label: '已打款', value: finance?.paidWithdrawCount ?? 0, unit: '笔' },
        { label: '提现金额', value: finance?.withdrawAmount ?? 0, valueType: 'money' },
        { label: '平台抽成', value: finance?.platformFeeAmount ?? 0, valueType: 'money' },
        { label: '店长应得', value: finance?.managerIncomeAmount ?? 0, valueType: 'money' },
      ],
    },
  ]
})

// 数据更新时间展示
const updatedAtText = computed(() => {
  if (!summary.value?.updatedAt) return '-'
  return formatTimestamp(summary.value.updatedAt, 2) || '-'
})

// 数字千分位格式化
const formatNumber = (value: number) => {
  return new Intl.NumberFormat('zh-CN').format(value)
}

// 金额格式化
const formatMoney = (value: number) => {
  return `¥${new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}`
}

// 统计值格式化
const formatStatValue = (item: { value: number; valueType?: DashboardStatValueType }) => {
  return item.valueType === 'money' ? formatMoney(item.value) : formatNumber(item.value)
}

// 获取首页统计数据
const loadDashboardSummary = async () => {
  console.log('TODO: 请求首页统计聚合接口')
  loading.value = true
  try {
    const res = await dashboardSummaryApi()
    summary.value = res.data
  } catch (error) {
    console.error('dashboard summary load failed', error)
  } finally {
    loading.value = false
  }
}

// 刷新首页统计数据
const handleRefresh = () => {
  console.log('TODO: 刷新首页统计数据')
  void loadDashboardSummary()
}

// 页面初始化加载统计数据
onMounted(() => {
  void loadDashboardSummary()
})
</script>

<template>
  <div class="dashboard-page" v-loading="loading" element-loading-text="加载中...">
    <section class="dashboard-header">
      <div class="dashboard-header__content">
        <h1 class="dashboard-title">首页统计</h1>
        <p class="dashboard-subtitle">基于当前业务模块的运营数据汇总</p>
        <p class="dashboard-updated">更新时间：{{ updatedAtText }}</p>
      </div>
      <el-button type="primary" plain :icon="Refresh" @click="handleRefresh">
        刷新
      </el-button>
    </section>

    <section class="core-grid" aria-label="核心指标">
      <article v-for="metric in coreMetrics" :key="metric.label" class="core-card">
        <div class="core-card__label">{{ metric.label }}</div>
        <div class="core-card__value">
          <span>{{ formatStatValue(metric) }}</span>
          <small v-if="metric.unit">{{ metric.unit }}</small>
        </div>
        <div class="core-card__description">{{ metric.description }}</div>
      </article>
    </section>

    <section class="module-grid" aria-label="模块统计">
      <article v-for="group in moduleGroups" :key="group.title" class="module-card">
        <header class="module-card__header">
          <div>
            <h2 class="module-card__title">{{ group.title }}</h2>
            <p class="module-card__description">{{ group.description }}</p>
          </div>
        </header>

        <div class="module-card__list">
          <div v-for="item in group.items" :key="item.label" class="module-stat-row">
            <span class="module-stat-row__label">{{ item.label }}</span>
            <span class="module-stat-row__value">
              {{ formatStatValue(item) }}
              <small v-if="item.unit">{{ item.unit }}</small>
            </span>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-page {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  background: var(--jel-surface);
  border: 1px solid var(--jel-border);
  border-radius: 8px;
}

.dashboard-header__content {
  min-width: 0;
}

.dashboard-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--jel-font-title);
}

.dashboard-subtitle {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--jel-font-dec2);
}

.dashboard-updated {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--jel-font-dec2);
}

.core-grid,
.module-grid {
  display: grid;
  gap: 14px;
}

.core-grid {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.module-grid {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.core-card,
.module-card {
  background: var(--jel-surface);
  border: 1px solid var(--jel-border);
  border-radius: 8px;
}

.core-card {
  min-width: 0;
  padding: 16px;
}

.core-card__label {
  font-size: 13px;
  color: var(--jel-font-dec2);
}

.core-card__value {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-top: 10px;
  color: var(--jel-font-title);

  span {
    font-size: 26px;
    font-weight: 700;
    line-height: 1.1;
  }

  small {
    font-size: 13px;
    color: var(--jel-font-dec2);
  }
}

.core-card__description {
  margin-top: 10px;
  overflow: hidden;
  font-size: 12px;
  line-height: 1.5;
  color: var(--jel-font-dec2);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.module-card {
  min-width: 0;
  overflow: hidden;
}

.module-card__header {
  padding: 16px 18px 12px;
  border-bottom: 1px solid var(--jel-border);
}

.module-card__title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.35;
  color: var(--jel-font-title);
}

.module-card__description {
  margin: 5px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--jel-font-dec2);
}

.module-card__list {
  display: grid;
  gap: 0;
  padding: 6px 18px 12px;
}

.module-stat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 38px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  &:last-child {
    border-bottom: none;
  }
}

.module-stat-row__label {
  min-width: 0;
  overflow: hidden;
  font-size: 13px;
  color: var(--jel-font-dec);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.module-stat-row__value {
  flex-shrink: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--jel-font-title);

  small {
    margin-left: 2px;
    font-size: 12px;
    font-weight: 400;
    color: var(--jel-font-dec2);
  }
}

@media (max-width: 640px) {
  .dashboard-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .module-grid {
    grid-template-columns: 1fr;
  }
}
</style>
