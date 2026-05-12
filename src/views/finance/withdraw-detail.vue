<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, CircleClose, Money } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import { walletWithdrawApplyApproveApi, walletWithdrawApplyDetailApi, walletWithdrawApplyRejectApi } from '@/api/withdraw'
import { formatTimestamp } from '@/utils/formatTimestamp'
import { useUserStore } from '@/stores'
import type { WalletWithdrawApplyItem, WithdrawStatus } from '@/types/withdraw'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 提现详情：页面加载状态
const loading = ref(false)

// 提现详情：当前提现申请详情
const detail = ref<WalletWithdrawApplyItem | null>(null)

// 提现详情：处理按钮提交状态
const actionLoading = ref(false)

// 提现详情：状态文案与标签类型映射
const statusMap: Record<WithdrawStatus, { label: string; type: 'primary' | 'success' | 'info' | 'warning' | 'danger' }> = {
  APPLYING: { label: '申请中', type: 'warning' },
  REJECTED: { label: '已拒绝', type: 'danger' },
  PAID: { label: '已打款', type: 'success' }
}

// 提现详情：获取状态标签配置
const getStatusMeta = (status: string | null | undefined) => {
  if (!status) return { label: '-', type: 'info' as const }
  return statusMap[status as WithdrawStatus] ?? { label: status, type: 'info' as const }
}

// 提现详情：金额格式化
const formatMoney = (value: number | string | null | undefined) => {
  const amount = Number(value ?? 0)
  return `¥${amount.toFixed(2)}`
}

// 提现详情：时间格式化，空值显示占位符
const formatDateTime = (value: Date | string | null | undefined) => {
  if (!value) return '-'
  return formatTimestamp(value, 2)
}

// 提现详情：普通文本格式化，空值显示占位符
const formatText = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === '') return '-'
  return value
}

// 提现详情：用户角色格式化
const formatUserRole = (role: string | null | undefined) => {
  const roleMap: Record<string, string> = {
    USER: '普通用户',
    VIP: '会员',
    MANAGER: '店长'
  }

  return role ? (roleMap[role] ?? role) : '-'
}

// 提现详情：用户状态格式化
const formatUserStatus = (status: string | null | undefined) => {
  const statusMap: Record<string, string> = {
    ACTIVE: '正常',
    INACTIVE: '停用'
  }

  return status ? (statusMap[status] ?? status) : '-'
}

// 提现详情：请求接口获取详情
const withdrawDetailGet = async () => {
  const id = String(route.params.id || '')
  if (!id) return

  loading.value = true
  try {
    const res = await walletWithdrawApplyDetailApi(id)
    detail.value = res.data
  } finally {
    loading.value = false
  }
}

// 提现详情：返回列表
const goBack = () => {
  router.push('/withdraw')
}

// 提现详情：获取当前管理员ID
const getReviewerId = () => {
  const reviewerId = userStore.userInfo?.id
  if (!reviewerId) {
    ElMessage.warning('未获取到当前管理员信息')
    return null
  }

  return reviewerId
}

// 提现详情：拒绝提现申请
const handleReject = async () => {
  if (!detail.value) return

  const withdrawId = detail.value.id
  const reviewerId = getReviewerId()
  if (!reviewerId) return

  const rejectReason = detail.value.rejectReason?.trim() || ''
  if (!rejectReason) {
    ElMessage.warning('请填写拒绝原因')
    return
  }

  try {
    await ElMessageBox.confirm('确定拒绝该提现申请吗？', '拒绝提现', {
      type: 'warning',
      confirmButtonText: '确认拒绝',
      cancelButtonText: '取消',
      confirmButtonClass: 'el-button--danger'
    })
  } catch {
    return
  }

  actionLoading.value = true
  try {
    await walletWithdrawApplyRejectApi(withdrawId, {
      reviewerId,
      rejectReason
    })
    ElMessage.success('已拒绝提现申请')
    goBack()
  } finally {
    actionLoading.value = false
  }
}

// 提现详情：确认提现打款
const handleApprove = async () => {
  if (!detail.value) return

  const withdrawId = detail.value.id
  const reviewerId = getReviewerId()
  if (!reviewerId) return

  try {
    await ElMessageBox.confirm('确定已完成该提现打款吗？', '确认打款', {
      type: 'warning',
      confirmButtonText: '确认打款',
      cancelButtonText: '取消'
    })
  } catch {
    return
  }

  actionLoading.value = true
  try {
    await walletWithdrawApplyApproveApi(withdrawId, { reviewerId })
    ElMessage.success('已确认打款')
    goBack()
  } finally {
    actionLoading.value = false
  }
}

// 提现详情：页面初始化请求
onMounted(() => withdrawDetailGet())
</script>

<template>
  <PageContainer title="提现申请详情">
    <template #extra>
      <el-button :icon="ArrowLeft" text type="primary" @click="goBack">返回列表</el-button>
    </template>

    <div v-loading="loading" class="withdraw-detail-page">
      <el-empty v-if="!loading && !detail" description="未找到提现申请" />

      <template v-if="detail">
        <div class="detail-head">
          <div class="detail-head__main">
            <span class="detail-head__label">提现单号</span>
            <span class="detail-head__no">{{ detail.withdrawNo }}</span>
          </div>
          <el-tag :type="getStatusMeta(detail.status).type" effect="light" size="large">
            {{ getStatusMeta(detail.status).label }}
          </el-tag>
        </div>

        <el-form :model="detail" label-width="104px" label-position="right" class="withdraw-form">
          <div class="form-section">
            <div class="form-section__title">申请信息</div>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="提现单号">
                  <el-input v-model="detail.withdrawNo" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="申请用户ID">
                  <el-input v-model="detail.userId" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="提现金额">
                  <el-input :model-value="formatMoney(detail.amount)" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="申请状态">
                  <el-input :model-value="getStatusMeta(detail.status).label" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="申请时间">
                  <el-input :model-value="formatDateTime(detail.createdAt)" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="更新时间">
                  <el-input :model-value="formatDateTime(detail.updatedAt)" disabled />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <div class="form-section">
            <div class="form-section__title">用户信息</div>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="用户昵称">
                  <el-input :model-value="formatText(detail.user?.nickname)" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="用户电话">
                  <el-input :model-value="formatText(detail.user?.mobile)" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="用户角色">
                  <el-input :model-value="formatUserRole(detail.user?.role)" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="账号状态">
                  <el-input :model-value="formatUserStatus(detail.user?.status)" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="用户积分">
                  <el-input :model-value="formatText(detail.user?.score)" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邀请码">
                  <el-input :model-value="formatText(detail.user?.referralCode)" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="门店ID">
                  <el-input :model-value="formatText(detail.user?.storeId)" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="注册时间">
                  <el-input :model-value="formatDateTime(detail.user?.createdAt)" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="openid">
                  <el-input :model-value="formatText(detail.user?.openid)" disabled />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <div class="form-section">
            <div class="form-section__title">收款信息</div>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="收款人姓名">
                  <el-input v-model="detail.payeeName" placeholder="请输入收款人姓名" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="银行 / 渠道">
                  <el-input v-model="detail.bankName" placeholder="银行、微信或支付宝" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="收款账号">
                  <el-input v-model="detail.payeeAccount" placeholder="银行卡号 / openid / 支付宝账号" clearable />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <div class="form-section">
            <div class="form-section__title">处理信息</div>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="打款时间">
                  <el-input :model-value="formatDateTime(detail.paidAt)" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="拒绝原因">
                  <el-input v-model="detail.rejectReason" type="textarea" :rows="4" placeholder="状态为已拒绝时填写原因"
                    maxlength="200" show-word-limit />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-form>

        <div class="detail-actions">
          <el-button :icon="CircleClose" plain :loading="actionLoading" :disabled="detail.status !== 'APPLYING'"
            @click="handleReject">拒绝</el-button>
          <el-button :icon="Money" type="success" :loading="actionLoading" :disabled="detail.status !== 'APPLYING'"
            @click="handleApprove">确认打款</el-button>
        </div>
      </template>
    </div>
  </PageContainer>
</template>

<style scoped lang="scss">
.withdraw-detail-page {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.detail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
  padding: 14px 16px;
  border: 1px solid $jel-border;
  border-radius: 8px;
  background: #fff;
}

.detail-head__main {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.detail-head__label {
  flex-shrink: 0;
  font-size: 13px;
  color: #64748b;
}

.detail-head__no {
  overflow: hidden;
  font-size: 16px;
  font-weight: 700;
  color: #334155;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.withdraw-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-section {
  padding: 16px 16px 4px;
  border: 1px solid $jel-border;
  border-radius: 8px;
  background: #fff;
}

.form-section__title {
  margin-bottom: 14px;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.withdraw-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.withdraw-form :deep(.el-form-item__label) {
  color: #64748b;
}

.withdraw-form :deep(.el-input__wrapper),
.withdraw-form :deep(.el-textarea__inner) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px #{$jel-border};
}

.detail-actions {
  display: flex;
  flex-shrink: 0;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
  padding: 14px 0 0;
}
</style>
