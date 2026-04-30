<script lang="ts" setup>
import type { OrderListItem, OrderStatus } from '@/types/order';
import { Search } from '@element-plus/icons-vue';
import { onMounted, ref } from 'vue';
import OrderProductTable from './components/OrderProductTable.vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { orderFindAllApi, orderShipApi } from '@/api/order';


// 订单列表：页面跳转
const router = useRouter()
// 订单列表：分页
const params = ref({
  pageNum: 1,
  pageSize: 30,
})
// 订单列表：表格 loading
const loading = ref(false)
// 订单列表：订单状态筛选
const filterStatus = ref<OrderStatus | 'ALL'>('ALL')
// 订单列表：搜索关键词
const searchKeyword = ref('')
const total = ref(0) // 订单列表：总条数

const orderList = ref<OrderListItem[]>([]) // 订单列表：表格数据

const orderListGet = async () => {
  console.log('order')
  const res = await orderFindAllApi(filterStatus.value, 'TOB', params.value.pageNum, params.value.pageSize)
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

onMounted(() => orderListGet())
</script>

<template>
  <PageContainer title="订单管理">
    <div class="order-page">
      <div class="header">
        <div class="filters">
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
        </div>
      </div>

      <OrderProductTable v-model:page-num="params.pageNum" v-model:page-size="params.pageSize" :loading="loading"
        :order-list="orderList" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange"
        @view-detail="onViewDetail" @ship="onShipOrder" />
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