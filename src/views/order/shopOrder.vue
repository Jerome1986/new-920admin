<script lang="ts" setup>
import PageContainer from '@/components/PageContainer.vue'
import { storeServiceOrderFindAllApi } from '@/api/order'
import type { StoreServiceOrderListItem, StoreServiceOrderStatus } from '@/types/order'
import { formatOrderPaymentLabel as formatPaymentLabel } from './orderDisplay'
import { formatTimestamp } from '@/utils/formatTimestamp'
import { Search, RefreshRight } from '@element-plus/icons-vue'
import { onMounted, ref } from 'vue'

const loading = ref(false)
const searchKeyword = ref('')
const filterStatus = ref<StoreServiceOrderStatus | 'ALL'>('ALL')

const params = ref({
  pageNum: 1,
  pageSize: 30,
})

const total = ref(0)
const orderList = ref<StoreServiceOrderListItem[]>([])

const serviceStatusLabel: Record<StoreServiceOrderStatus, string> = {
  PENDING: '待支付',
  PAID: '已支付',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
}

const serviceStatusTagType: Record<StoreServiceOrderStatus, 'success' | 'warning' | 'info'> = {
  PENDING: 'warning',
  PAID: 'success',
  COMPLETED: 'success',
  CANCELLED: 'info',
}

const formatMoney = (value: string | number | null | undefined) => {
  const amount = Number(value ?? 0)
  return Number.isFinite(amount) ? amount.toFixed(2) : '0.00'
}

const formatTime = (value: string | null | undefined) => {
  return value ? (formatTimestamp(value, 2) ?? '—') : '—'
}

const formatStatusLabel = (status: StoreServiceOrderStatus) => serviceStatusLabel[status] ?? status

const getStatusTagType = (status: StoreServiceOrderStatus) => serviceStatusTagType[status] ?? 'info'

const getStoreName = (row: StoreServiceOrderListItem) => row.store?.name || row.storeId

const orderListGet = async () => {
  loading.value = true
  try {
    const res = await storeServiceOrderFindAllApi(
      filterStatus.value,
      params.value.pageNum,
      params.value.pageSize,
      searchKeyword.value.trim() || undefined,
    )
    orderList.value = res.data.list
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (size: number) => {
  params.value.pageNum = 1
  params.value.pageSize = size
  orderListGet()
}

const handleCurrentChange = () => {
  orderListGet()
}

const handleSearch = () => {
  params.value.pageNum = 1
  orderListGet()
}

const handleClearSearch = () => {
  searchKeyword.value = ''
  params.value.pageNum = 1
  orderListGet()
}

const onFilterStatusChange = () => {
  params.value.pageNum = 1
  orderListGet()
}

const handleReset = () => {
  filterStatus.value = 'ALL'
  searchKeyword.value = ''
  params.value.pageNum = 1
  orderListGet()
}

onMounted(() => orderListGet())
</script>

<template>
  <PageContainer title="门店订单">
    <div class="shop-order-page">
      <div class="header">
        <div class="filters">
          <el-select v-model="filterStatus" class="filter-select" @change="onFilterStatusChange">
            <el-option label="全部" value="ALL" />
            <el-option label="待支付" value="PENDING" />
            <el-option label="已支付" value="PAID" />
            <el-option label="已完成" value="COMPLETED" />
            <el-option label="已取消" value="CANCELLED" />
          </el-select>
          <el-input v-model="searchKeyword" class="search-input" placeholder="订单号 / 手机号 / 门店 ID" clearable
            @clear="handleClearSearch" @keyup.enter="handleSearch" />
          <el-button type="primary" plain :icon="Search" @click="handleSearch">查询</el-button>
          <el-button plain :icon="RefreshRight" @click="handleReset">重置</el-button>
        </div>
      </div>

      <div class="shop-order-panel">
        <div class="jel-page-table-wrap">
          <el-table :data="orderList" class="jel-data-table jel-table-fill" height="100%" style="width: 100%" border
            v-loading="loading">
            <el-table-column type="index" label="序号" width="58" align="center" />
            <el-table-column prop="outTradeNo" label="订单编号" min-width="168" align="center" show-overflow-tooltip />
            <el-table-column label="状态" width="96" align="center">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)" size="small" effect="light">
                  {{ formatStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="门店" min-width="150" align="center" show-overflow-tooltip>
              <template #default="{ row }">
                {{ getStoreName(row) }}
              </template>
            </el-table-column>
            <el-table-column prop="memberPhone" label="会员手机号" width="124" align="center">
              <template #default="{ row }">
                {{ row.memberPhone || '—' }}
              </template>
            </el-table-column>
            <el-table-column prop="productName" label="商品名称" min-width="160" align="center" show-overflow-tooltip>
              <template #default="{ row }">
                <div class="product-cell">
                  <el-image v-if="row.productCover" class="product-cover" :src="row.productCover" fit="cover" />
                  <span>{{ row.productName || '—' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="skuNo" label="货号" min-width="120" align="center" show-overflow-tooltip />
            <el-table-column label="原价" width="104" align="right">
              <template #default="{ row }">
                ¥{{ formatMoney(row.originalPrice) }}
              </template>
            </el-table-column>
            <el-table-column label="实付金额" width="108" align="right">
              <template #default="{ row }">
                <span class="order-money">¥{{ formatMoney(row.actualPayment) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="支付方式" width="88" align="center">
              <template #default="{ row }">
                {{ formatPaymentLabel(row.paymentMethod) }}
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="120" align="center" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.remark || '—' }}
              </template>
            </el-table-column>
            <el-table-column label="支付时间" width="168" align="center">
              <template #default="{ row }">
                {{ formatTime(row.paidAt) }}
              </template>
            </el-table-column>
            <el-table-column label="完成时间" width="168" align="center">
              <template #default="{ row }">
                {{ formatTime(row.completedAt) }}
              </template>
            </el-table-column>
            <el-table-column label="下单时间" width="168" align="center" fixed="right">
              <template #default="{ row }">
                {{ formatTime(row.createdAt) }}
              </template>
            </el-table-column>
            <template #empty>
              <div class="jel-table-fill__empty">
                <el-empty description="暂无门店订单" />
              </div>
            </template>
          </el-table>
        </div>

        <div class="pager">
          <el-pagination v-model:current-page="params.pageNum" v-model:page-size="params.pageSize"
            :page-sizes="[30, 50, 100]" layout="jumper,total, sizes, prev, pager, next" :total="total"
            @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<style scoped lang="scss">
.shop-order-page {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.header {
  display: flex;
  flex-wrap: wrap;
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
  width: 320px;
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

.shop-order-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.product-cell {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  gap: 8px;
  vertical-align: middle;
}

.product-cover {
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  overflow: hidden;
  border: 1px solid $jel-border;
  border-radius: 6px;
  background-color: #f8fafc;
}

.product-cell span {
  overflow: hidden;
  min-width: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-money {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: $jel-brandColor;
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
