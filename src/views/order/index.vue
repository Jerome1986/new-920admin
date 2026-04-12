<script lang="ts" setup>
import PageContainer from '@/components/PageContainer.vue'
import OrderProductTable from './components/OrderProductTable.vue'
import OrderVipPlaceholder from './components/OrderVipPlaceholder.vue'
import type { OrderListItem, OrderStatus } from '@/types/order'
import { Search } from '@element-plus/icons-vue'
import { onMounted, ref } from 'vue'

const loading = ref(false)
/** 商品订单 | VIP 订单（字段不同；VIP 仅占位） */
type OrderPageKind = 'product' | 'vip'

const orderType = ref<OrderPageKind>('product')
const searchKeyword = ref('')
/** 默认全部；可选回「全部」 */
const filterStatus = ref<OrderStatus | 'ALL'>('ALL')

const params = ref({
  pageNum: 1,
  pageSize: 10,
})

const total = ref(0)

/** 演示数据：对接 GET /order 后替换 */
const orderList = ref<OrderListItem[]>([])

const mockOrders: OrderListItem[] = [
  {
    id: 'clx01',
    outTradeNo: 'OT2026040512000001',
    transactionId: 'wx_tx_001',
    status: 'PAID',
    target: 'TOC',
    openid: 'oABC',
    userId: 'user_1',
    nickname: '演示用户甲',
    mobile: '13800138001',
    avatarUrl: null,
    totalCount: 3,
    totalPrice: '299.00',
    deductAmount: '20.00',
    actualPayment: '279.00',
    usedScore: 100,
    paymentMethod: 'wechat',
    paymentNo: 'pay_001',
    remark: null,
    createdAt: '2026-04-05T10:00:00.000Z',
    paidAt: '2026-04-05T10:02:00.000Z',
    shippedAt: null,
    completedAt: null,
    cancelledAt: null,
    cancelReason: null,
    updatedAt: '2026-04-05T10:02:00.000Z',
  },
  {
    id: 'clx02',
    outTradeNo: 'OT2026040512000002',
    transactionId: null,
    status: 'PENDING',
    target: 'ALL',
    openid: 'oDEF',
    userId: 'user_2',
    nickname: '演示用户乙',
    mobile: '13900139002',
    avatarUrl: null,
    totalCount: 1,
    totalPrice: '99.00',
    deductAmount: '0.00',
    actualPayment: '99.00',
    usedScore: null,
    paymentMethod: null,
    paymentNo: null,
    remark: '请尽快发货',
    createdAt: '2026-04-05T11:30:00.000Z',
    paidAt: null,
    shippedAt: null,
    completedAt: null,
    cancelledAt: null,
    cancelReason: null,
    updatedAt: '2026-04-05T11:30:00.000Z',
  },
]

/** 拉取列表（对接接口；仅商品订单有数据） */
const orderListGet = () => {
  console.log('orderListGet', {
    orderType: orderType.value,
    params: params.value,
    filterStatus: filterStatus.value,
    searchKeyword: searchKeyword.value,
  })
  loading.value = true
  if (orderType.value === 'vip') {
    orderList.value = []
    total.value = 0
    loading.value = false
    return
  }
  let list = [...mockOrders]
  if (filterStatus.value !== 'ALL') {
    list = list.filter((o) => o.status === filterStatus.value)
  }
  orderList.value = list
  total.value = list.length
  loading.value = false
}

const handleSizeChange = (size: number) => {
  console.log('handleSizeChange', size)
  params.value.pageNum = 1
  params.value.pageSize = size
  orderListGet()
}

const handleCurrentChange = (num: number) => {
  console.log('handleCurrentChange', num)
  orderListGet()
}

const handleSearch = () => {
  console.log('handleSearch', searchKeyword.value)
  params.value.pageNum = 1
  orderListGet()
}

const handleClearSearch = () => {
  console.log('handleClearSearch')
  searchKeyword.value = ''
  params.value.pageNum = 1
  orderListGet()
}

const onFilterStatusChange = () => {
  console.log('onFilterStatusChange', filterStatus.value)
  params.value.pageNum = 1
  orderListGet()
}

const onOrderTypeChange = () => {
  console.log('onOrderTypeChange', orderType.value)
  params.value.pageNum = 1
  orderListGet()
}

const onViewDetail = (row: OrderListItem) => {
  console.log('onViewDetail', row)
}

onMounted(() => orderListGet())
</script>

<template>
  <PageContainer title="订单管理">
    <div class="order-page">
      <div class="header">
        <div class="filters">
          <el-select v-model="orderType" class="filter-select filter-select--type" placeholder="订单类型"
            @change="onOrderTypeChange">
            <el-option label="商品订单" value="product" />
            <el-option label="VIP 订单" value="vip" />
          </el-select>
          <template v-if="orderType === 'product'">
            <el-select v-model="filterStatus" class="filter-select" @change="onFilterStatusChange">
              <el-option label="全部" value="ALL" />
              <el-option label="待支付" value="PENDING" />
              <el-option label="已支付" value="PAID" />
              <el-option label="已发货" value="SHIPPED" />
              <el-option label="已完成" value="COMPLETED" />
              <el-option label="已取消" value="CANCELLED" />
              <el-option label="处理中" value="PROCESSING" />
              <el-option label="已退款" value="REFUNDED" />
            </el-select>
            <el-input v-model="searchKeyword" class="search-input" placeholder="商户订单号 / 手机号 / 用户 ID" clearable
              @clear="handleClearSearch" />
            <el-button type="primary" plain :icon="Search" @click="handleSearch">查询</el-button>
          </template>
        </div>
      </div>

      <OrderVipPlaceholder v-if="orderType === 'vip'" />

      <OrderProductTable v-else v-model:page-num="params.pageNum" v-model:page-size="params.pageSize" :loading="loading"
        :order-list="orderList" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange"
        @view-detail="onViewDetail" />
    </div>
  </PageContainer>
</template>

<style scoped lang="scss">
.order-page {
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

.filter-select--type {
  width: 160px;
}

.search-input {
  width: 280px;
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
</style>
