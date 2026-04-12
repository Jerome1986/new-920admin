<script lang="ts" setup>
import type { VipPlanListItem } from '@/types/VipPlan'
import { formatTimestamp } from '@/utils/formatTimestamp'
import { Delete, Edit } from '@element-plus/icons-vue'

// 会员套餐表格数据源
defineProps<{
  data: VipPlanListItem[]
}>()

// 查看 / 编辑 / 删除
const emit = defineEmits<{
  edit: [row: VipPlanListItem]
  delete: [row: VipPlanListItem]
}>()

// 售价列格式化为 ¥x.xx
function formatPrice(v: string) {
  return `¥${Number(v).toFixed(2)}`
}
</script>

<template>
  <el-table :data="data" class="jel-data-table jel-table-fill" height="100%" border :scrollbar-always-on="true">
    <el-table-column type="index" label="序号" width="56" align="center" />
    <el-table-column prop="level" label="等级" width="72" align="center" />
    <el-table-column prop="levelText" label="等级名称" min-width="120" show-overflow-tooltip />
    <el-table-column label="售价" width="110" align="right">
      <template #default="{ row }">{{ formatPrice(row.price) }}</template>
    </el-table-column>
    <el-table-column label="折扣" width="88" align="center">
      <template #default="{ row }">{{ Number(row.discount).toFixed(2) }}</template>
    </el-table-column>
    <el-table-column prop="term" label="期限说明" width="120" show-overflow-tooltip />
    <el-table-column prop="rights" label="权益说明" min-width="160" show-overflow-tooltip />
    <el-table-column label="返现比例" width="100" align="center">
      <template #default="{ row }">{{ Number(row.cashbackRate).toFixed(2) }}</template>
    </el-table-column>
    <el-table-column prop="maxUsers" label="可绑定人数" width="110" align="center" />
    <el-table-column prop="limit" label="限购/限额" width="100" align="center" />
    <el-table-column label="状态" width="88" align="center">
      <template #default="{ row }">
        <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'" size="small">
          {{ row.status === 'ACTIVE' ? '启用' : '停用' }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="创建时间" width="168" align="center">
      <template #default="{ row }">
        <span class="goods-member-time">{{ formatTimestamp(row.createdAt, 2) }}</span>
      </template>
    </el-table-column>
    <el-table-column label="更新时间" width="168" align="center">
      <template #default="{ row }">
        <span class="goods-member-time">{{ formatTimestamp(row.updatedAt, 2) }}</span>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="168" align="center" fixed="right">
      <template #default="{ row }">
        <div class="goods-member-actions">
          <el-tooltip content="编辑" placement="top">
            <el-button :icon="Edit" circle plain type="primary" @click="emit('edit', row)" />
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button :icon="Delete" circle plain type="danger" @click="emit('delete', row)" />
          </el-tooltip>
        </div>
      </template>
    </el-table-column>
    <template #empty>
      <div class="jel-table-fill__empty">
        <el-empty description="暂无会员套餐" />
      </div>
    </template>
  </el-table>
</template>

<style scoped lang="scss">
.goods-member-time {
  font-size: 13px;
  color: $jel-font-dec2;
}

.goods-member-actions {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.goods-member-actions :deep(.el-button) {
  margin: 0;
}
</style>
