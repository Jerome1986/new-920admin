<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { getAgentProfiles, setUserAsAgent, updateAgentStatus } from '@/api/agent'
import { userSearchApi } from '@/api/user'
import PageContainer from '@/components/PageContainer.vue'
import type { AgentProfile, AgentStatusFilter } from '@/types/Agent'
import type { UserInfo } from '@/types/User'
import { formatTimestamp } from '@/utils/formatTimestamp'
import { useUserStore } from '@/stores'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const loading = ref(false)
const agentList = ref<AgentProfile[]>([])
const total = ref(0)
const filters = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: 'ALL' as AgentStatusFilter,
  openedRange: [] as Date[],
})

function dateBoundary(date: Date, end = false) {
  const value = new Date(date)
  if (end) value.setHours(23, 59, 59, 999)
  else value.setHours(0, 0, 0, 0)
  return value.toISOString()
}

async function loadAgents() {
  loading.value = true
  try {
    const [start, end] = filters.openedRange
    const response = await getAgentProfiles({
      pageNum: filters.pageNum,
      pageSize: filters.pageSize,
      status: filters.status,
      keyword: filters.keyword.trim() || undefined,
      openedStartAt: start ? dateBoundary(start) : undefined,
      openedEndAt: end ? dateBoundary(end, true) : undefined,
    })
    agentList.value = response.data.list
    total.value = response.data.total
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  filters.pageNum = 1
  loadAgents()
}

function handleReset() {
  filters.keyword = ''
  filters.status = 'ALL'
  filters.openedRange = []
  filters.pageNum = 1
  loadAgents()
}

function handleSizeChange() {
  filters.pageNum = 1
  loadAgents()
}

const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const submitting = ref(false)
const userSearching = ref(false)
const userOptions = ref<UserInfo[]>([])
const selectedUser = computed(() => userOptions.value.find((item) => item.id === form.userId))
const form = reactive({ userId: '', remark: '' })
const rules: FormRules = {
  userId: [{ required: true, message: '请选择已注册用户', trigger: 'change' }],
  remark: [{ max: 200, message: '备注不能超过200个字符', trigger: 'blur' }],
}
const lastCreatedCode = ref('')
const detailVisible = ref(false)
const currentAgent = ref<AgentProfile>()
const statusUpdatingId = ref('')
const disableVisible = ref(false)
const disableReason = ref('')
const disableTarget = ref<AgentProfile>()

function showAgentDetail(row: AgentProfile) {
  currentAgent.value = row
  detailVisible.value = true
}

function showInviteRecords(row: AgentProfile) {
  router.push({
    path: `/agent/invites/${row.userId}`,
    query: {
      nickname: row.user?.nickname || undefined,
      mobile: row.user?.mobile || undefined,
    },
  })
}

/** 后端补充修改备注接口后，在此接入并于成功后刷新当前页。 */
function editAgentRemark(row: AgentProfile) {
  currentAgent.value = row
  ElMessage.info('修改备注接口待后端补充')
}

function openDisableDialog(row: AgentProfile) {
  disableTarget.value = row
  disableReason.value = ''
  disableVisible.value = true
}

async function submitDisable() {
  const row = disableTarget.value
  if (!row || statusUpdatingId.value) return
  statusUpdatingId.value = row.id
  try {
    await updateAgentStatus(row.id, {
      status: 'DISABLED',
      operatorId: userStore.userInfo?.id,
      disabledReason: disableReason.value.trim() || undefined,
    })
    disableVisible.value = false
    ElMessage.success('代理已停用')
    await loadAgents()
  } finally {
    statusUpdatingId.value = ''
  }
}

async function enableAgent(row: AgentProfile) {
  try {
    await ElMessageBox.confirm(
      '启用后将恢复其代理资格，并继续使用原邀请码。',
      '确认启用该代理吗？',
      { type: 'warning', confirmButtonText: '确认启用', cancelButtonText: '取消' },
    )
  } catch {
    return
  }

  if (statusUpdatingId.value) return
  statusUpdatingId.value = row.id
  try {
    await updateAgentStatus(row.id, {
      status: 'ACTIVE',
      operatorId: userStore.userInfo?.id,
    })
    ElMessage.success('代理已启用')
    await loadAgents()
  } finally {
    statusUpdatingId.value = ''
  }
}

function openCreateDialog() {
  form.userId = ''
  form.remark = ''
  userOptions.value = []
  dialogVisible.value = true
}

async function searchUsers(keyword: string) {
  const value = keyword.trim()
  if (!value) {
    userOptions.value = []
    return
  }
  userSearching.value = true
  try {
    const response = await userSearchApi(value, 1, 20)
    userOptions.value = response.data.list
  } finally {
    userSearching.value = false
  }
}

async function submitAgent() {
  if (submitting.value || !(await formRef.value?.validate().catch(() => false))) return
  submitting.value = true
  try {
    const response = await setUserAsAgent({
      userId: form.userId,
      remark: form.remark.trim() || undefined,
    })
    lastCreatedCode.value = response.data.agentCode
    dialogVisible.value = false
    filters.pageNum = 1
    await loadAgents()
    ElMessage.success(`代理设置成功，邀请码：${response.data.agentCode}`)
  } finally {
    submitting.value = false
  }
}

onMounted(loadAgents)
</script>

<template>
  <PageContainer title="代理管理">
    <template #extra>
      <el-button type="primary" :icon="Plus" @click="openCreateDialog">新增代理</el-button>
    </template>

    <div class="agent-page">
      <el-alert v-if="lastCreatedCode" class="created-alert" type="success" :closable="true"
        @close="lastCreatedCode = ''">
        <template #title>
          <span>代理设置成功，邀请码：{{ lastCreatedCode }}</span>
        </template>
      </el-alert>

      <div class="filters">
        <el-input v-model="filters.keyword" class="keyword-input" placeholder="用户ID / 邀请码 / 备注 / 昵称 / 手机号"
          clearable @keyup.enter="handleQuery" />
        <el-select v-model="filters.status" class="status-select" placeholder="代理状态">
          <el-option label="全部状态" value="ALL" />
          <el-option label="已启用" value="ACTIVE" />
          <el-option label="已停用" value="DISABLED" />
        </el-select>
        <el-date-picker v-model="filters.openedRange" type="daterange" range-separator="至" start-placeholder="开通开始日期"
          end-placeholder="开通结束日期" :clearable="true" />
        <el-button type="primary" plain :icon="Search" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <div class="jel-page-table-wrap">
        <el-table v-loading="loading" :data="agentList" class="jel-data-table jel-table-fill" height="100%" border>
          <el-table-column label="用户信息" min-width="190">
            <template #default="{ row }">
              <div class="user-cell">
                <el-avatar :size="42" :src="row.user?.avatarUrl || undefined">{{ row.user?.nickname?.slice(0, 1) || '用' }}</el-avatar>
                <div class="user-meta">
                  <span class="user-name">{{ row.user?.nickname || '未设置昵称' }}</span>
                  <span>{{ row.user?.mobile || '--' }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="用户ID" prop="userId" min-width="180" show-overflow-tooltip />
          <el-table-column label="代理邀请码" min-width="140" align="center">
            <template #default="{ row }">{{ row.agentCode }}</template>
          </el-table-column>
          <el-table-column label="邀请码二维码" width="120" align="center">
            <template #default="{ row }">
              <el-image v-if="row.agentCodeUrl" class="agent-code-image" :src="row.agentCodeUrl"
                :preview-src-list="[row.agentCodeUrl]" preview-teleported fit="cover" />
              <span v-else>--</span>
            </template>
          </el-table-column>
          <el-table-column label="代理状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'danger'" effect="light">
                {{ row.status === 'ACTIVE' ? '已启用' : '已停用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="后台备注" prop="remark" min-width="150" show-overflow-tooltip>
            <template #default="{ row }">{{ row.remark || '--' }}</template>
          </el-table-column>
          <el-table-column label="开通时间" min-width="170">
            <template #default="{ row }">{{ formatTimestamp(row.openedAt, 2) || '--' }}</template>
          </el-table-column>
          <el-table-column label="停用时间" min-width="170">
            <template #default="{ row }">{{ row.disabledAt ? formatTimestamp(row.disabledAt, 2) : '--' }}</template>
          </el-table-column>
          <el-table-column label="停用原因" min-width="140" show-overflow-tooltip>
            <template #default="{ row }">{{ row.disabledReason || '--' }}</template>
          </el-table-column>
          <el-table-column label="操作" width="300" fixed="right" align="center">
            <template #default="{ row }">
              <div class="row-actions">
                <el-button link type="primary" @click="showInviteRecords(row)">邀请记录</el-button>
                <el-button link type="primary" @click="showAgentDetail(row)">详情</el-button>
                <el-button link type="primary" @click="editAgentRemark(row)">修改备注</el-button>
                <el-button v-if="row.status === 'ACTIVE'" link type="danger"
                  :loading="statusUpdatingId === row.id" @click="openDisableDialog(row)">停用</el-button>
                <el-button v-else link type="success" :loading="statusUpdatingId === row.id"
                  @click="enableAgent(row)">启用</el-button>
              </div>
            </template>
          </el-table-column>
          <template #empty><el-empty description="没有代理数据" /></template>
        </el-table>
      </div>

      <div class="pager">
        <el-pagination v-model:current-page="filters.pageNum" v-model:page-size="filters.pageSize"
          :page-sizes="[10, 30, 50, 100]" layout="jumper,total,sizes,prev,pager,next" :total="total"
          @size-change="handleSizeChange" @current-change="loadAgents" />
      </div>
    </div>
  </PageContainer>

  <el-dialog v-model="dialogVisible" title="新增代理" width="560px" destroy-on-close @closed="formRef?.clearValidate()">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="选择用户" prop="userId">
        <el-select v-model="form.userId" class="full-width" filterable remote reserve-keyword clearable
          placeholder="请输入手机号或邀请码搜索" :remote-method="searchUsers" :loading="userSearching">
          <el-option v-for="user in userOptions" :key="user.id" :label="`${user.nickname || '未设置昵称'} / ${user.mobile}`"
            :value="user.id">
            <div class="user-option">
              <span>{{ user.nickname || '未设置昵称' }}</span>
              <span class="option-mobile">{{ user.mobile }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="selectedUser" label="用户信息">
        <div class="selected-user">
          <el-avatar :size="44" :src="selectedUser.avatarUrl || undefined">{{ selectedUser.nickname?.slice(0, 1) || '用' }}</el-avatar>
          <div>
            <div>{{ selectedUser.nickname || '未设置昵称' }} · {{ selectedUser.mobile }}</div>
            <div class="selected-user-id">{{ selectedUser.id }}</div>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="后台备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" :rows="4" maxlength="200" show-word-limit
          placeholder="选填，最多200个字符" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="submitting" @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="submitAgent">确认设置</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="disableVisible" title="确认停用该代理吗？" width="500px" :close-on-click-modal="false">
    <el-alert type="warning" :closable="false" show-icon
      title="停用后用户将暂时失去代理资格，但原邀请码和二维码会保留。" />
    <el-form class="disable-form" label-position="top">
      <el-form-item label="停用原因">
        <el-input v-model="disableReason" type="textarea" :rows="4" maxlength="200" show-word-limit
          placeholder="选填，请填写停用原因" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="Boolean(statusUpdatingId)" @click="disableVisible = false">取消</el-button>
      <el-button type="danger" :loading="statusUpdatingId === disableTarget?.id" @click="submitDisable">确认停用</el-button>
    </template>
  </el-dialog>

  <el-drawer v-model="detailVisible" title="代理详情" size="520px">
    <el-descriptions v-if="currentAgent" :column="1" border label-width="110px">
      <el-descriptions-item label="用户信息">
        {{ currentAgent.user?.nickname || '未设置昵称' }} / {{ currentAgent.user?.mobile || '--' }}
      </el-descriptions-item>
      <el-descriptions-item label="用户ID">{{ currentAgent.userId }}</el-descriptions-item>
      <el-descriptions-item label="代理邀请码">{{ currentAgent.agentCode }}</el-descriptions-item>
      <el-descriptions-item label="邀请码二维码">
        <el-image v-if="currentAgent.agentCodeUrl" class="detail-code-image" :src="currentAgent.agentCodeUrl"
          :preview-src-list="[currentAgent.agentCodeUrl]" preview-teleported fit="contain" />
        <span v-else>--</span>
      </el-descriptions-item>
      <el-descriptions-item label="代理状态">
        <el-tag :type="currentAgent.status === 'ACTIVE' ? 'success' : 'danger'">
          {{ currentAgent.status === 'ACTIVE' ? '已启用' : '已停用' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="后台备注">{{ currentAgent.remark || '--' }}</el-descriptions-item>
      <el-descriptions-item label="开通时间">{{ formatTimestamp(currentAgent.openedAt, 2) || '--' }}</el-descriptions-item>
      <el-descriptions-item label="停用时间">
        {{ currentAgent.disabledAt ? formatTimestamp(currentAgent.disabledAt, 2) : '--' }}
      </el-descriptions-item>
      <el-descriptions-item label="停用原因">{{ currentAgent.disabledReason || '--' }}</el-descriptions-item>
    </el-descriptions>
  </el-drawer>
</template>

<style scoped lang="scss">
.agent-page { display: flex; flex: 1; flex-direction: column; min-height: 0; }
.created-alert { flex-shrink: 0; margin-bottom: 14px; }
.created-alert :deep(.el-alert__title) { display: flex; align-items: center; gap: 8px; }
.filters { display: flex; flex-shrink: 0; flex-wrap: wrap; align-items: center; gap: 10px; margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid $jel-border; }
.keyword-input { width: 300px; }
.status-select { width: 130px; }
.pager { flex-shrink: 0; margin-top: 16px; }
.pager :deep(.el-pagination) { justify-content: flex-end; }
.user-cell, .selected-user { display: flex; align-items: center; gap: 10px; }
.user-meta { display: flex; flex-direction: column; min-width: 0; color: var(--jel-font-dec2); }
.user-name { overflow: hidden; color: var(--jel-font-title); text-overflow: ellipsis; white-space: nowrap; }
.full-width { width: 100%; }
.user-option { display: flex; justify-content: space-between; gap: 16px; }
.option-mobile, .selected-user-id { color: var(--jel-font-dec2); }
.selected-user-id { max-width: 390px; overflow: hidden; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.row-actions { display: flex; align-items: center; justify-content: center; white-space: nowrap; }
.agent-code-image { width: 56px; height: 56px; border-radius: 4px; cursor: zoom-in; }
.detail-code-image { width: 180px; height: 180px; cursor: zoom-in; }
.disable-form { margin-top: 18px; }
</style>
