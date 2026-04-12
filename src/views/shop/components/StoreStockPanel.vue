<script lang="ts" setup>
import { computed, ref } from 'vue'
import type { StoreInventoryItem } from '@/types/store';
import { formatTimestamp } from '@/utils/formatTimestamp';

const props = withDefaults(defineProps<{
  inventory: StoreInventoryItem[]
}>(), {
  inventory: () => []
})

const stockAll = ref<StoreInventoryItem[]>(props.inventory || [])

const currentPage = ref(1)
const pageSize = ref(20)

const stockList = computed(() => {
  console.log('stock', stockAll.value)

  const start = (currentPage.value - 1) * pageSize.value
  return stockAll.value.slice(start, start + pageSize.value)
})

function rowIndex(index: number) {
  return (currentPage.value - 1) * pageSize.value + index + 1
}

function onPageSizeChange() {
  currentPage.value = 1
}
</script>

<template>
  <div class="sd-panel sd-panel--fill">
    <div class="sd-panel__table-wrap">
      <el-table :data="stockList" class="jel-data-table" border height="100%" style="width: 100%">
        <el-table-column type="index" :index="rowIndex" label="序号" width="60" align="center" />
        <el-table-column prop="productName" label="商品名称" min-width="140" align="center" show-overflow-tooltip />
        <el-table-column prop="skuValue" label="规格" width="100" align="center" />
        <el-table-column prop="stock" label="当前库存" width="120" align="center" />
        <el-table-column label="成本价" width="120" align="center">
          <template #default="{ row }">
            {{ Number(row.costPrice).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="售价" width="120" align="center">
          <template #default="{ row }">
            {{ Number(row.salePrice).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="已卖出" prop="soldCount" width="120" align="center"></el-table-column>
        <el-table-column label="更新时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatTimestamp(row.updatedAt, 2) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="sd-panel__pager">
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[20, 40, 80, 100]"
        :total="stockAll.length" layout="total, sizes, prev, pager, next, jumper" background
        @size-change="onPageSizeChange" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.sd-panel {
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
  max-width: 1600px;
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
