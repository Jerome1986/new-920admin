<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, CopyDocument, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getAgentInviteRecords } from '@/api/agent'
import PageContainer from '@/components/PageContainer.vue'
import type {
  AgentInviteBenefitStatus,
  AgentInviteRecord,
  AgentInviteSummary,
} from '@/types/Agent'
import { formatTimestamp } from '@/utils/formatTimestamp'

const route = useRoute()
const router = useRouter()
const userId = computed(() => String(route.params.userId || '').trim())
const agentNickname = computed(() => String(route.query.nickname || '代理用户'))
const agentMobile = computed(() => String(route.query.mobile || '--'))

const loading = ref(false)
const records = ref<AgentInviteRecord[]>([])
const total = ref(0)
const agentCode = ref('')
const mobileMatched = ref<boolean | null>(null)
const summary = ref<AgentInviteSummary>({
  totalInvited: 0,
  availableCount: 0,
  usedCount: 0,
  expiredCount: 0,
})
const filters = reactive({
  mobile: '',
  benefitStatus: '' as AgentInviteBenefitStatus | '',
  pageNum: 1,
  pageSize: 10,
})

const summaryCards = computed(() => [
  { label: '累计邀请', value: summary.value.totalInvited, className: 'total' },
  { label: '待使用', value: summary.value.availableCount, className: 'available' },
  { label: '已使用', value: summary.value.usedCount, className: 'used' },
  { label: '已过期', value: summary.value.expiredCount, className: 'expired' },
])

const emptyDescription = computed(() => {
  if (!filters.mobile.trim()) return '暂无邀请记录'
  return mobileMatched.value === false ? '该手机号不是该代理邀请的用户' : '暂无符合条件的邀请记录'
})

function isMobileValid() {
  const value = filters.mobile.trim()
  return !value || /^\d{4}$|^\d{11}$/.test(value)
}

async function loadRecords() {
  if (!userId.value) return
  if (!isMobileValid()) {
    ElMessage.warning('请输入完整11位手机号或手机号后四位')
    return
  }

  loading.value = true
  try {
    const response = await getAgentInviteRecords({
      userId: userId.value,
      mobile: filters.mobile.trim() || undefined,
      benefitStatus: filters.benefitStatus || undefined,
      pageNum: filters.pageNum,
      pageSize: filters.pageSize,
    })
    const data = response.data
    records.value = data.list
    total.value = data.total
    agentCode.value = data.agentCode
    summary.value = data.summary
    mobileMatched.value = data.mobileMatched
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  if (!isMobileValid()) {
    ElMessage.warning('请输入完整11位手机号或手机号后四位')
    return
  }
  filters.pageNum = 1
  loadRecords()
}

function handleReset() {
  filters.mobile = ''
  filters.benefitStatus = ''
  filters.pageNum = 1
  loadRecords()
}

function handleSizeChange() {
  filters.pageNum = 1
  loadRecords()
}

function benefitStatusText(status: AgentInviteBenefitStatus) {
  return { AVAILABLE: '待使用', USED: '已使用', EXPIRED: '已过期' }[status]
}

function benefitStatusType(status: AgentInviteBenefitStatus) {
  return { AVAILABLE: 'warning', USED: 'success', EXPIRED: 'info' }[status] as
    | 'warning'
    | 'success'
    | 'info'
}

function indexMethod(index: number) {
  return (filters.pageNum - 1) * filters.pageSize + index + 1
}

async function copyText(value: string, successMessage: string) {
  if (!value) return
  try {
    await navigator.clipboard.writeText(value)
    ElMessage.success(successMessage)
  } catch {
    ElMessage.warning('复制失败，请手动复制')
  }
}

onMounted(loadRecords)
</script>

<template>
  <PageContainer title="代理邀请记录">
    <template #titleExtra>
      <el-button text type="primary" :icon="ArrowLeft" @click="router.push('/agent')">返回代理管理</el-button>
    </template>

    <div v-if="!userId" class="invalid-page">
      <el-empty description="缺少代理用户ID，无法加载邀请记录">
        <el-button type="primary" @click="router.push('/agent')">返回代理管理</el-button>
      </el-empty>
    </div>

    <div v-else class="invite-page">
      <section class="agent-overview">
        <div class="agent-identity">
          <el-avatar :size="48">{{ agentNickname.slice(0, 1) }}</el-avatar>
          <div class="agent-meta">
            <strong>{{ agentNickname }}</strong>
            <span>{{ agentMobile }} · {{ userId }}</span>
          </div>
        </div>
        <div class="agent-code">
          <span>代理邀请码</span>
          <strong>{{ agentCode || '--' }}</strong>
          <el-button link type="primary" :icon="CopyDocument" :disabled="!agentCode"
            @click="copyText(agentCode, '邀请码已复制')">
            复制
          </el-button>
        </div>
      </section>

      <section class="summary-grid">
        <div v-for="card in summaryCards" :key="card.label" class="summary-card" :class="`summary-card--${card.className}`">
          <span>{{ card.label }}</span>
          <strong>{{ card.value }}</strong>
        </div>
      </section>

      <div class="filters">
        <el-input v-model="filters.mobile" class="mobile-input" maxlength="11" clearable
          placeholder="完整手机号或后四位" @keyup.enter="handleQuery" />
        <el-select v-model="filters.benefitStatus" class="status-select" placeholder="权益状态">
          <el-option label="全部状态" value="" />
          <el-option label="待使用" value="AVAILABLE" />
          <el-option label="已使用" value="USED" />
          <el-option label="已过期" value="EXPIRED" />
        </el-select>
        <el-button type="primary" plain :icon="Search" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <div class="jel-page-table-wrap">
        <el-table v-loading="loading" :data="records" class="jel-data-table jel-table-fill" height="100%" border>
          <el-table-column label="序号" width="70" align="center" type="index" :index="indexMethod" />
          <el-table-column label="受邀手机号" prop="mobile" min-width="140" align="center" />
          <el-table-column label="权益状态" width="110" align="center">
            <template #default="{ row }">
              <el-tag :type="benefitStatusType(row.benefitStatus)" effect="light">
                {{ benefitStatusText(row.benefitStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="领取时间" min-width="175" align="center">
            <template #default="{ row }">{{ formatTimestamp(row.claimedAt, 2) || '--' }}</template>
          </el-table-column>
          <el-table-column label="到期时间" min-width="175" align="center">
            <template #default="{ row }">{{ formatTimestamp(row.expiresAt, 2) || '--' }}</template>
          </el-table-column>
          <el-table-column label="使用时间" min-width="175" align="center">
            <template #default="{ row }">{{ row.usedAt ? formatTimestamp(row.usedAt, 2) : '--' }}</template>
          </el-table-column>
          <el-table-column label="领取记录ID" min-width="180">
            <template #default="{ row }">
              <div class="claim-id">
                <span>{{ row.claimId }}</span>
                <el-button link type="primary" :icon="CopyDocument" @click="copyText(row.claimId, '记录ID已复制')" />
              </div>
            </template>
          </el-table-column>
          <template #empty>
            <div class="jel-table-fill__empty"><el-empty :description="emptyDescription" /></div>
          </template>
        </el-table>
      </div>

      <div class="pager">
        <el-pagination v-model:current-page="filters.pageNum" v-model:page-size="filters.pageSize"
          :page-sizes="[10, 20, 50]" layout="jumper,total,sizes,prev,pager,next" :total="total"
          @size-change="handleSizeChange" @current-change="loadRecords" />
      </div>
    </div>
  </PageContainer>
</template>

<style scoped lang="scss">
.invite-page { display: flex; flex: 1; flex-direction: column; min-height: 0; }
.invalid-page { display: flex; flex: 1; align-items: center; justify-content: center; }
.agent-overview { display: flex; flex-shrink: 0; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 16px; padding: 16px 18px; border: 1px solid $jel-border; border-radius: 10px; background: $jel-surface-muted; }
.agent-identity, .agent-code { display: flex; align-items: center; gap: 12px; }
.agent-meta { display: flex; min-width: 0; flex-direction: column; gap: 5px; }
.agent-meta strong, .agent-code strong { color: $jel-font-title; }
.agent-meta span, .agent-code > span { font-size: 13px; color: $jel-font-dec2; }
.agent-code strong { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 16px; }
.summary-grid { display: grid; flex-shrink: 0; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-bottom: 16px; }
.summary-card { padding: 16px 18px; border: 1px solid $jel-border; border-radius: 10px; background: $jel-surface; }
.summary-card span { display: block; margin-bottom: 8px; font-size: 13px; color: $jel-font-dec2; }
.summary-card strong { font-size: 26px; line-height: 1; color: $jel-font-title; font-variant-numeric: tabular-nums; }
.summary-card--available { border-top: 3px solid #e6a23c; }
.summary-card--used { border-top: 3px solid #67c23a; }
.summary-card--expired { border-top: 3px solid #909399; }
.summary-card--total { border-top: 3px solid $jel-brandColor; }
.filters { display: flex; flex-shrink: 0; flex-wrap: wrap; align-items: center; gap: 10px; margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid $jel-border; }
.mobile-input { width: 240px; }
.status-select { width: 150px; }
.claim-id { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.claim-id span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pager { flex-shrink: 0; margin-top: 16px; }
.pager :deep(.el-pagination) { justify-content: flex-end; }

@media (max-width: 900px) {
  .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .agent-overview { align-items: flex-start; flex-direction: column; }
}
</style>
