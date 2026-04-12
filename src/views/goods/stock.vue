<script lang="ts" setup>
import { stockModelDelte, stockModelFindAll } from '@/api/stockModel'
import PageContainer from '@/components/PageContainer.vue'
import type { StockModel } from '@/types/stockModel'
import { formatTimestamp } from '@/utils/formatTimestamp'
import { Delete, Edit, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

// 路由实例，用于跳转模板编辑页
const router = useRouter()

// 列表加载中状态
const loading = ref(false)
// 库存模板表格数据
const list = ref<StockModel[]>([])

// 拉取库存模板列表并赋给表格
async function stockModelGet() {
  loading.value = true
  try {
    const res = await stockModelFindAll()
    console.log('list', res)
    list.value = res.data
  } finally {
    loading.value = false
  }
}

// 新增模板
function handleAdd() {
  router.push({ path: '/stock/template/edit' })
}

// 编辑指定行：带模板 id 进入编辑页
function handleEdit(row: StockModel) {
  router.push({ path: '/stock/template/edit', query: { id: String(row.id) } })
}

// 删除模板（确认后刷新列表，具体删除接口待接）
async function handleDelete(row: StockModel) {
  try {
    await ElMessageBox.confirm(`确定删除模板「${row.name}」吗？`, '提示', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      confirmButtonClass: 'el-button--danger',
    })

    await stockModelDelte(row.id)
  } catch {
    return
  }
  ElMessage.success('已删除')
  stockModelGet()
}

// 进入页面时加载模板列表
onMounted(() => stockModelGet())
</script>

<template>
  <PageContainer title="库存模板">
    <template #extra>
      <el-button type="primary" :icon="Plus" @click="handleAdd">添加模板</el-button>
    </template>

    <div class="goods-page" v-loading="loading" element-loading-text="加载中...">
      <div class="jel-page-table-wrap">
        <el-table :data="list" class="jel-data-table jel-table-fill" row-key="id" height="100%" border>
          <el-table-column type="index" label="序号" width="58" align="center" />
          <el-table-column prop="name" label="模板名称" min-width="200" show-overflow-tooltip />
          <el-table-column label="已有商品" width="180" align="center">
            <template #default="{ row }">
              {{ row.items.length }}
            </template>
          </el-table-column>
          <el-table-column label="更新时间" width="180" align="center">
            <template #default="{ row }">
              {{ formatTimestamp(row.updatedAt, 2) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="140" align="center" fixed="right">
            <template #default="{ row }">
              <div class="tpl-actions">
                <el-tooltip content="编辑" placement="top">
                  <el-button :icon="Edit" circle plain type="primary" @click="handleEdit(row)" />
                </el-tooltip>
                <el-tooltip content="删除" placement="top">
                  <el-button :icon="Delete" circle plain type="danger" @click="handleDelete(row)" />
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
          <template #empty>
            <div class="jel-table-fill__empty">
              <el-empty description="暂无库存模板，请点击右上角添加" />
            </div>
          </template>
        </el-table>
      </div>
    </div>
  </PageContainer>
</template>

<style scoped lang="scss">
.goods-page {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  width: 100%;
}

.tpl-actions {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.tpl-actions :deep(.el-button) {
  margin: 0;
}
</style>
