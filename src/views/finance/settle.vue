<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import PageContainer from '@/components/PageContainer.vue'
import { formatTimestamp } from '@/utils/formatTimestamp'
import type { SettlementRecordItem, SettlementStatus } from '@/types/settlement'
import { settlementRecordFindAllApi } from '@/api/settlementRecord'
import { Refresh, Search, View } from '@element-plus/icons-vue'

// 结算列表：表格加载状态
const loading = ref(false)

// 结算列表：关键词筛选（订单ID / 门店ID / 店长ID）
const keyword = ref('')

// 结算列表：状态筛选
const filterStatus = ref<SettlementStatus | 'ALL'>('ALL')

// 结算列表：创建时间范围筛选
const createdRange = ref<[Date, Date] | null>(null)

// 结算列表：分页参数
const params = ref({
  pageNum: 1,
  pageSize: 10
})

// 结算列表：接口返回数据
const settlementList = ref<SettlementRecordItem[]>([])

// 结算列表：总条数
const total = ref(0)

// 结算列表：状态文案与标签类型映射
const statusMap: Record<SettlementStatus, { label: string; type: 'primary' | 'success' | 'info' | 'warning' | 'danger' }> = {
  PENDING: { label: '待结算', type: 'warning' },
  SETTLED: { label: '已结算', type: 'success' },
  CANCELLED: { label: '已取消', type: 'info' },
  REFUNDED: { label: '已退款', type: 'danger' }
}

// 结算列表：获取状态标签配置
const getStatusMeta = (status: string) => {
  return statusMap[status as SettlementStatus] ?? { label: '未知', type: 'info' as const }
}

// 结算列表：金额格式化
const formatMoney = (value: number | string | null | undefined) => {
  const amount = Number(value ?? 0)
  return `¥${amount.toFixed(2)}`
}

// 结算列表：平台抽成比例格式化
const formatRate = (value: number | string | null | undefined) => {
  const rate = Number(value ?? 0)
  return `${rate.toFixed(2)}%`
}

// 结算列表：时间格式化，空值显示占位符
const formatDateTime = (value: Date | string | null) => {
  if (!value) return '-'
  return formatTimestamp(value, 2)
}

// 结算列表：日期参数格式化
const formatDateParam = (value: Date) => {
  return formatTimestamp(value, 1) || ''
}

// 结算列表：组装接口查询参数
const buildQueryParams = () => {
  const range = createdRange.value

  return {
    pageNum: params.value.pageNum,
    pageSize: params.value.pageSize,
    status: filterStatus.value,
    keyword: keyword.value.trim() || undefined,
    createdStartAt: range ? formatDateParam(range[0]) : undefined,
    createdEndAt: range ? formatDateParam(range[1]) : undefined
  }
}

// 结算列表：请求接口获取列表
const settlementListGet = async () => {
  loading.value = true
  try {
    const queryParams = buildQueryParams()
    const res = await settlementRecordFindAllApi(queryParams)
    settlementList.value = res.data.list
    total.value = res.data.total
    console.log('settlement list get', queryParams)
  } finally {
    loading.value = false
  }
}

// 结算列表：查询
const handleSearch = () => {
  params.value.pageNum = 1
  settlementListGet()
}

// 结算列表：重置筛选
const handleReset = () => {
  keyword.value = ''
  filterStatus.value = 'ALL'
  createdRange.value = null
  params.value.pageNum = 1
  settlementListGet()
}

// 结算列表：分页条数变化
const handleSizeChange = (size: number) => {
  params.value.pageNum = 1
  params.value.pageSize = size
  settlementListGet()
}

// 结算列表：当前页变化
const handleCurrentChange = (pageNum: number) => {
  params.value.pageNum = pageNum
  settlementListGet()
}

// 结算列表：查看详情占位函数
const onViewDetail = (row: SettlementRecordItem) => {
  console.log('settlement view detail', row)
}

// 结算列表：页面初始化请求
onMounted(() => settlementListGet())
</script>

<template>
  <PageContainer title="结算管理">
    <div class="settle-page">
      <div class="header">
        <div class="filters">
          <el-select v-model="filterStatus" class="filter-select" placeholder="结算状态">
            <el-option label="全部" value="ALL" />
            <el-option label="待结算" value="PENDING" />
            <el-option label="已结算" value="SETTLED" />
            <el-option label="已取消" value="CANCELLED" />
            <el-option label="已退款" value="REFUNDED" />
          </el-select>
          <el-input v-model="keyword" class="search-input" placeholder="订单ID / 门店ID / 店长ID" clearable
            @clear="handleSearch" />
          <el-date-picker v-model="createdRange" class="date-range" type="daterange" range-separator="至"
            start-placeholder="创建开始" end-placeholder="创建结束" />
          <el-button type="primary" plain :icon="Search" @click="handleSearch">查询</el-button>
          <el-button plain :icon="Refresh" @click="handleReset">重置</el-button>
        </div>
      </div>

      <div class="jel-page-table-wrap">
        <el-table :data="settlementList" class="jel-data-table jel-table-fill" height="100%" style="width: 100%"
          v-loading="loading" border>
          <el-table-column label="序号" align="center" type="index" width="60" />
          <el-table-column label="订单ID" align="center" prop="orderId" min-width="160" show-overflow-tooltip />
          <el-table-column label="门店ID" align="center" prop="storeId" min-width="180" show-overflow-tooltip />
          <el-table-column label="店长ID" align="center" prop="managerId" min-width="180" show-overflow-tooltip />
          <el-table-column label="订单金额" align="center" prop="orderAmount" width="120">
            <template #default="{ row }">
              <span class="money-text">{{ formatMoney(row.orderAmount) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="平台抽成比例" align="center" prop="platformRate" width="120">
            <template #default="{ row }">
              {{ formatRate(row.platformRate) }}
            </template>
          </el-table-column>
          <el-table-column label="平台抽成金额" align="center" prop="platformFee" width="130">
            <template #default="{ row }">
              <span class="money-text">{{ formatMoney(row.platformFee) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="店长应得" align="center" prop="managerIncome" width="120">
            <template #default="{ row }">
              <span class="money-text money-text--income">{{ formatMoney(row.managerIncome) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="上级佣金" align="center" prop="totalCommission" width="120">
            <template #default="{ row }">
              <span class="money-text">{{ formatMoney(row.totalCommission) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center" prop="status" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusMeta(row.status).type" effect="light">
                {{ getStatusMeta(row.status).label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="结算时间" align="center" prop="settledAt" width="160">
            <template #default="{ row }">
              {{ formatDateTime(row.settledAt) }}
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createdAt" width="160">
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="90" fixed="right">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button :icon="View" circle plain type="primary" @click="onViewDetail(row)" />
              </div>
            </template>
          </el-table-column>
          <template #empty>
            <div class="jel-table-fill__empty">
              <el-empty description="没有结算记录" />
            </div>
          </template>
        </el-table>
      </div>

      <div class="pager">
        <el-pagination v-model:current-page="params.pageNum" v-model:page-size="params.pageSize"
          :page-sizes="[10, 30, 50, 100]" layout="jumper,total, sizes, prev, pager, next" :total="total"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </div>
  </PageContainer>
</template>

<style scoped lang="scss">
.settle-page {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid $jel-border;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.filter-select {
  width: 140px;
}

.search-input {
  width: 260px;
  max-width: 100%;
}

.date-range {
  width: 300px;
  max-width: 100%;
}

.filters :deep(.el-input__wrapper) {
  border-radius: 8px;
  background-color: #fff !important;
  box-shadow: 0 0 0 1px #{$jel-border};
  transition:
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.filters :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(148, 163, 184, 0.55);
}

.money-text {
  font-weight: 600;
  color: #334155;
}

.money-text--income {
  color: #16a34a;
}

.table-actions {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.pager {
  flex-shrink: 0;
  margin-top: 16px;
}

.pager :deep(.el-pagination) {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px 0;
}
</style>
