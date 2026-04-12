<script lang="ts" setup>
import type { OrderListItem, OrderStatus } from '@/types/order'
import { formatTimestamp } from '@/utils/formatTimestamp'
import { View } from '@element-plus/icons-vue'

defineProps<{
  loading: boolean
  orderList: OrderListItem[]
  total: number
}>()

const pageNum = defineModel<number>('pageNum', { required: true })
const pageSize = defineModel<number>('pageSize', { required: true })

const emit = defineEmits<{
  sizeChange: [size: number]
  currentChange: [page: number]
  viewDetail: [row: OrderListItem]
}>()

const statusLabel: Record<OrderStatus, string> = {
  PENDING: '待支付',
  PAID: '已支付',
  SHIPPED: '已发货',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  PROCESSING: '处理中',
  REFUNDED: '已退款',
}

const statusTagType = (s: OrderStatus): 'success' | 'warning' | 'info' | 'danger' | 'primary' => {
  const map: Record<OrderStatus, 'success' | 'warning' | 'info' | 'danger' | 'primary'> = {
    PENDING: 'warning',
    PAID: 'success',
    SHIPPED: 'primary',
    COMPLETED: 'success',
    CANCELLED: 'info',
    PROCESSING: 'warning',
    REFUNDED: 'danger',
  }
  return map[s]
}

const paymentLabel: Record<NonNullable<OrderListItem['paymentMethod']>, string> = {
  wechat: '微信',
  alipay: '支付宝',
  balance: '余额',
}

const formatStatusLabel = (s: OrderStatus) => statusLabel[s]
const formatPaymentLabel = (p: OrderListItem['paymentMethod']) =>
  p ? paymentLabel[p] : '—'

const onSizeChange = (size: number) => emit('sizeChange', size)
const onCurrentChange = (page: number) => emit('currentChange', page)
const onViewDetail = (row: OrderListItem) => emit('viewDetail', row)
</script>

<template>
  <div class="order-product-panel">
    <div class="jel-page-table-wrap">
      <el-table
        :data="orderList"
        class="jel-data-table jel-table-fill"
        height="100%"
        style="width: 100%"
        border
        v-loading="loading"
      >
        <el-table-column type="index" label="序号" width="58" align="center" />
        <el-table-column prop="outTradeNo" label="商户订单号" min-width="168" align="center" show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small" effect="light">
              {{ formatStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="用户昵称" width="120" align="center" show-overflow-tooltip />
        <el-table-column prop="mobile" label="手机号" width="124" align="center" />
        <el-table-column prop="totalCount" label="总件数" width="80" align="center" />
        <el-table-column label="原价合计" width="108" align="right">
          <template #default="{ row }">
            ¥{{ Number(row.totalPrice).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="优惠抵扣" width="100" align="right">
          <template #default="{ row }">
            ¥{{ Number(row.deductAmount).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="实付金额" width="108" align="right">
          <template #default="{ row }">
            <span class="order-money">¥{{ Number(row.actualPayment).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="支付方式" width="88" align="center">
          <template #default="{ row }">
            {{ formatPaymentLabel(row.paymentMethod) }}
          </template>
        </el-table-column>
        <el-table-column label="下单时间" width="168" align="center">
          <template #default="{ row }">
            {{ formatTimestamp(row.createdAt, 2) }}
          </template>
        </el-table-column>
        <el-table-column label="支付时间" width="168" align="center">
          <template #default="{ row }">
            {{ row.paidAt ? formatTimestamp(row.paidAt, 2) : '—' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="88" align="center" fixed="right">
          <template #default="{ row }">
            <el-button :icon="View" circle plain type="primary" @click="onViewDetail(row)" />
          </template>
        </el-table-column>
        <template #empty>
          <div class="jel-table-fill__empty">
            <el-empty description="暂无订单" />
          </div>
        </template>
      </el-table>
    </div>

    <div class="pager">
      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :page-sizes="[10, 30, 50, 100]"
        layout="jumper,total, sizes, prev, pager, next"
        :total="total"
        @size-change="onSizeChange"
        @current-change="onCurrentChange"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.order-product-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
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
