<script lang="ts" setup>
import { storeVipFindAll } from '@/api/store'
import type { UserInfo } from '@/types/User'
import { formatTimestamp } from '@/utils/formatTimestamp'
import { formatName } from '@/utils/mapping'
import { onMounted, ref, watch } from 'vue'

const props = defineProps<{
  inviterId?: string | null
}>()

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const memberList = ref<UserInfo[]>([])

async function loadMemberList() {
  if (!props.inviterId) {
    memberList.value = []
    total.value = 0
    return
  }

  loading.value = true
  try {
    const res = await storeVipFindAll(props.inviterId, currentPage.value, pageSize.value)
    memberList.value = res.data.list
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

function rowIndex(index: number) {
  return (currentPage.value - 1) * pageSize.value + index + 1
}

function onPageSizeChange() {
  currentPage.value = 1
  loadMemberList()
}

function onCurrentPageChange() {
  loadMemberList()
}

watch(() => props.inviterId, () => {
  currentPage.value = 1
  loadMemberList()
})

onMounted(() => {
  loadMemberList()
})

function formatVipLevel(level: number | null) {
  if (level == null) return '-'
  const levelMap: Record<number, string> = {
    1: '基础会员',
    2: '高级会员',
    3: '至尊会员',
  }
  return levelMap[level] ?? String(level)
}

function formatMemberTime(time: Date | string | null) {
  return time ? formatTimestamp(time, 2) : '-'
}
</script>

<template>
  <div class="sd-panel sd-panel--fill">
    <div class="sd-panel__table-wrap">
      <el-table :data="memberList" class="jel-data-table" border height="100%" style="width: 100%"
        v-loading="loading">
        <el-table-column type="index" :index="rowIndex" label="序号" width="60" align="center" />
        <el-table-column prop="nickname" label="昵称" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">
            {{ formatName(row.nickname) }}
          </template>
        </el-table-column>
        <el-table-column prop="mobile" label="手机号" width="140" align="center" />
        <el-table-column prop="vipLevel" label="会员等级" width="110" align="center">
          <template #default="{ row }">
            {{ formatVipLevel(row.vipLevel) }}
          </template>
        </el-table-column>
        <el-table-column prop="vipStartTime" label="入会时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatMemberTime(row.vipStartTime) }}
          </template>
        </el-table-column>
        <template #empty>
          <div class="jel-table-fill__empty">
            <el-empty description="没有数据" />
          </div>
        </template>
      </el-table>
    </div>
    <div class="sd-panel__pager">
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 30, 50]"
        :total="total" layout="total, sizes, prev, pager, next, jumper" background @size-change="onPageSizeChange"
        @current-change="onCurrentPageChange" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.sd-panel {
  max-width: 1600px;
  padding: 16px;
  border: 1px solid $jel-border;
  border-radius: 8px;
  background: $jel-surface;
}

.sd-panel--fill {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sd-panel__table-wrap {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.sd-panel__pager {
  display: flex;
  flex-shrink: 0;
  justify-content: flex-end;
}
</style>
