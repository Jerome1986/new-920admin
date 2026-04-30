<script lang="ts" setup>
import type { OrderListItem } from '@/types/order'
import { formatOrderPaymentLabel as formatPaymentLabel, formatOrderStatusLabel as formatStatusLabel, orderStatusTagType as statusTagType } from '../orderDisplay'
import { formatTimestamp } from '@/utils/formatTimestamp'
import { Van, View } from '@element-plus/icons-vue'

defineProps<{
  loading: boolean
  orderList: OrderListItem[]
  total: number
}>() // 商品订单表格：父传子数据

const pageNum = defineModel<number>('pageNum', { required: true }) // 商品订单表格：当前页（双向）
const pageSize = defineModel<number>('pageSize', { required: true }) // 商品订单表格：每页条数（双向）

const emit = defineEmits<{
  sizeChange: [size: number]
  currentChange: [page: number]
  viewDetail: [row: OrderListItem]
  ship: [row: OrderListItem]
}>() // 商品订单表格：向父同步分页 / 详情 / 发货

// 商品订单表格：分页-每页条数 → 父
const onSizeChange = (size: number) => emit('sizeChange', size)
// 商品订单表格：分页-页码 → 父
const onCurrentChange = (page: number) => emit('currentChange', page)
// 商品订单表格：操作-详情
const onViewDetail = (row: OrderListItem) => emit('viewDetail', row)
// 商品订单表格：操作-快捷发货
const onShip = (row: OrderListItem) => emit('ship', row)

// 商品订单表格：是否显示发货按钮（已支付）
const canShip = (row: OrderListItem) => row.status === 'PAID'
</script>

<template>
  <div class="order-product-panel">
    <div class="jel-page-table-wrap">
      <el-table :data="orderList" class="jel-data-table jel-table-fill" height="100%" style="width: 100%" border
        v-loading="loading">
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
        <el-table-column label="积分抵扣" width="100" align="right">
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
        <el-table-column label="操作" width="132" align="center" fixed="right">
          <template #default="{ row }">
            <div class="order-actions">
              <el-button v-if="canShip(row)" :icon="Van" circle plain type="success" title="发货" @click="onShip(row)" />
              <el-button :icon="View" circle plain type="primary" title="详情" @click="onViewDetail(row)" />
            </div>
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
      <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :page-sizes="[30, 50, 100]"
        layout="jumper,total, sizes, prev, pager, next" :total="total" @size-change="onSizeChange"
        @current-change="onCurrentChange" />
    </div>
  </div>
</template>

<style scoped lang="scss">
// 商品订单表格：表格+分页容器
.order-product-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

// 商品订单表格：操作列按钮组
.order-actions {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

// 商品订单表格：实付金额强调
.order-money {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: $jel-brandColor;
}

// 商品订单表格：底部分页
.pager {
  flex-shrink: 0;
  margin-top: 16px;
}

// 商品订单表格：分页右对齐
.pager :deep(.el-pagination) {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px 0;
}
</style>
