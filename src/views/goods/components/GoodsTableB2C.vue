<script lang="ts" setup>
import type { ProductListItem } from '@/types/Product'
import { Delete, Edit, View } from '@element-plus/icons-vue'

// B/C 端商品表格数据源
defineProps<{
  data: ProductListItem[]
}>()

// 查看 / 编辑 / 删除
const emit = defineEmits<{
  view: [row: ProductListItem]
  edit: [row: ProductListItem]
  delete: [row: ProductListItem]
}>()
</script>

<template>
  <el-table :data="data" class="jel-data-table jel-table-fill" height="100%" border>
    <el-table-column type="index" label="序号" width="58" align="center" />
    <el-table-column label="封面" width="88" align="center">
      <template #default="{ row }">
        <el-image :src="row.cover" fit="cover" class="goods-b2c-cover" :preview-src-list="[row.cover]"
          preview-teleported />
      </template>
    </el-table-column>
    <el-table-column prop="name" label="商品名称" min-width="140" show-overflow-tooltip />
    <el-table-column prop="skuNo" label="货号" width="130" show-overflow-tooltip />
    <el-table-column label="分类" width="100" align="center">
      <template #default="{ row }">
        {{ row.categoryName ?? '—' }}
      </template>
    </el-table-column>
    <el-table-column label="浏览" width="80" align="center" prop="lookNum" />
    <el-table-column label="热门" width="72" align="center">
      <template #default="{ row }">{{ row.hot === 'ENABLE' ? '是' : '否' }}</template>
    </el-table-column>
    <el-table-column label="状态" width="88" align="center">
      <template #default="{ row }">
        <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'" size="small">
          {{ row.status === 'ACTIVE' ? '上架' : '下架' }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="168" align="center" fixed="right">
      <template #default="{ row }">
        <div class="goods-b2c-actions">
          <el-tooltip content="查看" placement="top">
            <el-button :icon="View" circle plain type="info" @click="emit('view', row)" />
          </el-tooltip>
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
        <el-empty description="暂无商品" />
      </div>
    </template>
  </el-table>
</template>

<style scoped lang="scss">
.goods-b2c-cover {
  width: 56px;
  height: 56px;
  border-radius: 8px;
}

.goods-b2c-price {
  font-weight: 600;
  color: $jel-brandColor;
}

.goods-b2c-actions {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.goods-b2c-actions :deep(.el-button) {
  margin: 0;
}
</style>
