<script lang="ts" setup>
import PageContainer from '@/components/PageContainer.vue'
import OrderProductTable from './components/OrderProductTable.vue'
import OrderVipPlaceholder from './components/OrderVipPlaceholder.vue'
import type { OrderListItem, OrderStatus } from '@/types/order'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { orderFindAllApi, orderShipApi } from '@/api/order'

const router = useRouter() // 订单列表：页面跳转

const loading = ref(false) // 订单列表：表格 loading
// 订单列表：订单类型联合类型（商品 / VIP）
type OrderPageKind = 'product' | 'vip'

const orderType = ref<OrderPageKind>('product') // 订单列表：订单类型（商品 / VIP）
const searchKeyword = ref('') // 订单列表：搜索关键词
const filterStatus = ref<OrderStatus | 'ALL'>('ALL') // 订单列表：订单状态筛选

// 订单列表：分页
const params = ref({
  pageNum: 1,
  pageSize: 30,
})

const total = ref(0) // 订单列表：总条数

const orderList = ref<OrderListItem[]>([]) // 订单列表：表格数据

// 订单列表：请求列表数据
const orderListGet = async () => {
  const res = await orderFindAllApi(filterStatus.value, 'TOC', params.value.pageNum, params.value.pageSize)
  console.log('list', res)

  orderList.value = res.data.list
  total.value = res.data.total
}

// 订单列表：分页-每页条数
const handleSizeChange = (size: number) => {
  console.log('handleSizeChange', size)
  params.value.pageNum = 1
  params.value.pageSize = size
  orderListGet()
}

// 订单列表：分页-当前页
const handleCurrentChange = (num: number) => {
  console.log('handleCurrentChange', num)
  orderListGet()
}

// 订单列表：搜索查询
const handleSearch = () => {
  console.log('handleSearch', searchKeyword.value)
  params.value.pageNum = 1
  orderListGet()
}

// 订单列表：清空搜索
const handleClearSearch = () => {
  console.log('handleClearSearch')
  searchKeyword.value = ''
  params.value.pageNum = 1
  orderListGet()
}

// 订单列表：订单状态变更
const onFilterStatusChange = () => {
  console.log('onFilterStatusChange', filterStatus.value)
  params.value.pageNum = 1
  orderListGet()
}

// 订单列表：商品单 / VIP 切换
const onOrderTypeChange = () => {
  console.log('onOrderTypeChange', orderType.value)
  params.value.pageNum = 1
  orderListGet()
}

// 订单列表：跳转详情页
const onViewDetail = (row: OrderListItem) => {
  console.log(row.outTradeNo)

  router.push(`/order/detail/${row.outTradeNo}`)
}

// 订单列表：快捷发货（无物流表单）
const onShipOrder = async (row: OrderListItem) => {
  try {
    await ElMessageBox.confirm(`确认对订单「${row.outTradeNo}」发货？`, '发货确认', {
      type: 'warning',
      confirmButtonText: '确认发货',
      cancelButtonText: '取消',
    })
    await orderShipApi(row.outTradeNo, 'SHIPPED')
    ElMessage.success('已发货')
    await orderListGet()
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
    }
  }
}

// 订单列表：首屏拉取
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
        @view-detail="onViewDetail" @ship="onShipOrder" />
    </div>
  </PageContainer>
</template>

<style scoped lang="scss">
// 订单列表：页面根布局（与筛选区、表格区区分）
.order-page {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

// 订单列表：顶栏筛选条
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

// 订单列表：筛选项容器
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
