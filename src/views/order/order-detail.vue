<script lang="ts" setup>
import PageContainer from '@/components/PageContainer.vue'
import type { OrderDetail } from '@/types/order'
import { orderDetailApi } from '@/api/order'
import {
  orderPaymentLabel as paymentLabel,
  orderStatusLabel as statusLabel,
  orderStatusTagType as statusTagType,
  orderTargetLabel as targetLabel,
} from './orderDisplay'
import { formatTimestamp } from '@/utils/formatTimestamp'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute() // 订单详情：路由参数
const router = useRouter() // 订单详情：返回列表等跳转

const outTradeNo = computed(() => {
  console.log(route.params)
  return String(route.params.outTradeNo ?? '')
}) // 订单详情：路由中的商户订单号

const loading = ref(false) // 订单详情：整页加载
const detail = ref<OrderDetail | null>(null) // 订单详情：接口返回的完整订单

// 订单详情：页头标题
const pageTitle = computed(() =>
  detail.value?.outTradeNo ? `订单详情 · ${detail.value.outTradeNo}` : '订单详情',
)

// 订单详情：发货与物流表单（完整版，对接接口）
const shipLogisticsForm = ref({
  expressCompany: '',
  trackingNumber: '',
  note: '',
})

// 订单详情：提交发货+物流（占位）
const onSubmitShipWithLogistics = () => { }

// 订单详情：重置物流表单（占位）
const onResetShipLogisticsForm = () => { }

// 订单详情：拉取详情数据
const orderDetailGet = async () => {

  if (!outTradeNo.value) {
    ElMessage.warning('缺少订单 ID')
    return
  }
  loading.value = true
  try {
    const res = await orderDetailApi(outTradeNo.value)
    detail.value = res.data
  } catch (e) {
    console.error(e)
    detail.value = null
    ElMessage.error('加载订单详情失败')
  } finally {
    loading.value = false
  }
}

// 订单详情：进入页面拉取
onMounted(() => orderDetailGet())
</script>

<template>
  <PageContainer :title="pageTitle">
    <template #titleExtra>
      <el-button :icon="ArrowLeft" text type="primary" @click="router.push('/order')">返回列表</el-button>
    </template>

    <div class="order-detail" v-loading="loading">
      <template v-if="detail">
        <div class="order-detail__summary">
          <div class="order-detail__summary-row">
            <span class="order-detail__muted">内部 ID</span>
            <code class="order-detail__code">{{ detail.id }}</code>
          </div>
          <div class="order-detail__summary-row">
            <span class="order-detail__muted">商户订单号</span>
            <code class="order-detail__code">{{ detail.outTradeNo }}</code>
          </div>
          <div class="order-detail__summary-row">
            <span class="order-detail__muted">状态</span>
            <el-tag :type="statusTagType(detail.status)" size="small" effect="light">
              {{ statusLabel[detail.status] }}
            </el-tag>
          </div>
        </div>

        <el-descriptions title="订单信息" :column="2" border size="large" class="order-detail__desc">
          <el-descriptions-item label="微信 openid" :span="2">
            <span class="order-detail__mono">{{ detail.openid }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="用户 ID">{{ detail.userId }}</el-descriptions-item>
          <el-descriptions-item label="订单类型">{{ targetLabel[detail.target] }}</el-descriptions-item>
          <el-descriptions-item label="用户昵称">{{ detail.nickname }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ detail.mobile }}</el-descriptions-item>
          <el-descriptions-item label="总件数">{{ detail.totalCount }}</el-descriptions-item>
          <el-descriptions-item label="微信交易号" :span="2">
            {{ detail.transactionId || '—' }}
          </el-descriptions-item>
          <el-descriptions-item label="原价合计">
            <span class="order-detail__money">{{ Number(detail.totalPrice).toFixed(2) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="优惠/抵扣">
            {{ Number(detail.deductAmount).toFixed(2) }}
          </el-descriptions-item>
          <el-descriptions-item label="实付金额">
            <span class="order-detail__money order-detail__money--strong">{{ Number(detail.actualPayment).toFixed(2) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="抵扣积分">
            {{ detail.usedScore != null ? detail.usedScore : '—' }}
          </el-descriptions-item>
          <el-descriptions-item label="支付方式">
            {{ detail.paymentMethod ? paymentLabel[detail.paymentMethod] : '—' }}
          </el-descriptions-item>
          <el-descriptions-item label="支付单号">{{ detail.paymentNo || '—' }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ detail.remark || '—' }}</el-descriptions-item>
        </el-descriptions>

        <el-descriptions title="时间节点" :column="2" border size="large" class="order-detail__desc">
          <el-descriptions-item label="下单时间">
            {{ formatTimestamp(detail.createdAt, 2) }}
          </el-descriptions-item>
          <el-descriptions-item label="支付时间">
            {{ detail.paidAt ? formatTimestamp(detail.paidAt, 2) : '—' }}
          </el-descriptions-item>
          <el-descriptions-item label="发货时间">
            {{ detail.shippedAt ? formatTimestamp(detail.shippedAt, 2) : '—' }}
          </el-descriptions-item>
          <el-descriptions-item label="完成时间">
            {{ detail.completedAt ? formatTimestamp(detail.completedAt, 2) : '—' }}
          </el-descriptions-item>
          <el-descriptions-item label="取消时间">
            {{ detail.cancelledAt ? formatTimestamp(detail.cancelledAt, 2) : '—' }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ formatTimestamp(detail.updatedAt, 2) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="detail.cancelReason" label="取消原因" :span="2">
            {{ detail.cancelReason }}
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="detail.address" class="order-detail__block">
          <h3 class="order-detail__block-title">收货地址</h3>
          <el-descriptions :column="2" border size="large" class="order-detail__desc">
            <el-descriptions-item label="收货人">{{ detail.address.name }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ detail.address.mobile }}</el-descriptions-item>
            <el-descriptions-item label="省市区" :span="2">
              {{ detail.address.province }} {{ detail.address.city }} {{ detail.address.county }}
            </el-descriptions-item>
            <el-descriptions-item label="详细地址" :span="2">{{ detail.address.detail }}</el-descriptions-item>
            <el-descriptions-item label="邮编">{{ detail.address.postalCode || '—' }}</el-descriptions-item>
            <el-descriptions-item label="区号">{{ detail.address.nationalCode || '—' }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 已支付：完整发货（含物流），与列表快捷发货并存 -->
        <div v-if="detail.status === 'PAID'" class="order-detail__ship">
          <div class="order-detail__ship-head">
            <h3 class="order-detail__ship-title">发货与物流</h3>
            <p class="order-detail__ship-lead">
              填写承运商与运单号后提交发货；对接接口后在此调用「发货 + 物流」能力。
            </p>
          </div>
          <el-form :model="shipLogisticsForm" label-position="right" label-width="100px"
            class="order-detail__ship-form">
            <el-form-item label="物流公司">
              <el-select v-model="shipLogisticsForm.expressCompany" class="order-detail__ship-field"
                placeholder="请选择或输入物流公司" filterable allow-create default-first-option>
                <el-option label="顺丰速运" value="SF" />
                <el-option label="中通快递" value="ZTO" />
                <el-option label="圆通速递" value="YTO" />
                <el-option label="韵达快递" value="YD" />
                <el-option label="申通快递" value="STO" />
              </el-select>
            </el-form-item>
            <el-form-item label="运单号">
              <el-input v-model="shipLogisticsForm.trackingNumber" class="order-detail__ship-field"
                placeholder="请输入物流运单号" maxlength="64" show-word-limit clearable />
            </el-form-item>
            <el-form-item label="发货备注">
              <el-input v-model="shipLogisticsForm.note" type="textarea" :rows="3" maxlength="200" show-word-limit
                placeholder="选填：仓库备注、包装说明等" />
            </el-form-item>
            <el-form-item class="order-detail__ship-actions">
              <el-button type="primary" @click="onSubmitShipWithLogistics">确认发货</el-button>
              <el-button @click="onResetShipLogisticsForm">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div class="order-detail__block">
          <h3 class="order-detail__block-title">商品明细</h3>
          <el-table :data="detail.products" class="jel-data-table" border style="width: 100%">
            <el-table-column type="index" label="序号" width="56" align="center" />
            <el-table-column prop="name" label="商品名称" min-width="160" show-overflow-tooltip />
            <el-table-column prop="skuNo" label="SKU 编号" width="140" show-overflow-tooltip />
            <el-table-column prop="skuName" label="SKU 名称" width="120" show-overflow-tooltip />
            <el-table-column prop="model" label="型号" width="100" show-overflow-tooltip />
            <el-table-column label="单价" width="100" align="right">
              <template #default="{ row }">{{ Number(row.price).toFixed(2) }}</template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="80" align="center" />
            <el-table-column label="小计" width="110" align="right">
              <template #default="{ row }">
                {{ Number(Number(row.price) * row.quantity).toFixed(2) }}
              </template>
            </el-table-column>
            <template #empty>
              <el-empty description="暂无商品明细" />
            </template>
          </el-table>
        </div>
      </template>

      <div v-else-if="!loading" class="order-detail__empty">
        <el-empty description="未找到订单" />
      </div>
    </div>
  </PageContainer>
</template>

<style scoped lang="scss">
// 订单详情：可滚动内容区（与页头区分）
.order-detail {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

// 订单详情：顶部摘要条
.order-detail__summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 28px;
  padding: 12px 16px;
  border: 1px solid $jel-border;
  border-radius: 8px;
  background: $jel-surface-muted;
}

// 订单详情：摘要行
.order-detail__summary-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;

  &:first-child {
    flex: 1;
    min-width: 0;
  }
}

// 订单详情：摘要辅助文案色
.order-detail__muted {
  color: $jel-font-dec2;
  flex-shrink: 0;
}

// 订单详情：等宽订单号展示
.order-detail__code {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  color: $jel-font-title;
  background: $jel-surface;
  border: 1px solid $jel-border;
  word-break: break-all;
}

// 订单详情：openid 等长串等宽
.order-detail__mono {
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 13px;
  word-break: break-all;
}

// 订单详情：el-descriptions 区块
.order-detail__desc {
  margin-top: 0;
}

// 订单详情：金额列
.order-detail__money {
  font-variant-numeric: tabular-nums;

  &--strong {
    font-weight: 600;
    color: $jel-brandColor;
  }
}

// 订单详情：地址 / 商品等大区块
.order-detail__block {
  padding: 4px 0 0;
}

// 订单详情：分块小标题（地址、商品等）
.order-detail__block-title {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
  color: $jel-font-title;
}

// 订单详情：发货与物流表单卡片
.order-detail__ship {
  padding: 16px 18px;
  border-radius: 10px;
  border: 1px solid rgba(59, 130, 246, 0.18);
  background: linear-gradient(165deg,
      rgba(239, 246, 255, 0.75) 0%,
      rgba(248, 250, 252, 0.95) 55%,
      #ffffff 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

// 订单详情：发货区块标题区
.order-detail__ship-head {
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

// 订单详情：发货卡片标题
.order-detail__ship-title {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 600;
  color: $jel-font-title;
}

// 订单详情：发货说明文案
.order-detail__ship-lead {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: $jel-font-dec2;
}

// 订单详情：物流表单
.order-detail__ship-form {
  max-width: 560px;
}

// 订单详情：物流表单项宽度
.order-detail__ship-field {
  width: 100%;
  max-width: 420px;
}

// 订单详情：发货操作按钮行
.order-detail__ship-actions {
  margin-bottom: 0;

  :deep(.el-form-item__content) {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
  }
}

// 订单详情：无数据占位
.order-detail__empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
}
</style>
