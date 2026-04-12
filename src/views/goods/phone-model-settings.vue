<script lang="ts" setup>
import { phoneSettingDeleteApi, phoneSettingFindAllApi } from '@/api/product'
import PageContainer from '@/components/PageContainer.vue'
import ModelChannel from '@/views/goods/components/ModelChannel.vue'
import type { PhoneModel } from '@/types/Product'
import { Delete, Edit, Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, ref } from 'vue'

const modelList = ref<PhoneModel[]>([])
const loading = ref(false)
const total = ref(0)
const searchKeyword = ref('')
const params = ref({
  pageNum: 1,
  pageSize: 10,
})

const dialogRef = ref<InstanceType<typeof ModelChannel> | null>(null)

async function loadList() {
  loading.value = true
  try {
    const kw = searchKeyword.value.trim()
    const res = await phoneSettingFindAllApi(params.value.pageNum, params.value.pageSize, kw || undefined)
    modelList.value = res.data.list ?? []
    total.value = res.data.total ?? 0
  } catch (e) {
    console.error(e)
    modelList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  dialogRef.value?.openAdd()
}

function handleEdit(row: PhoneModel) {
  dialogRef.value?.openEdit(row)
}

async function handleDelete(row: PhoneModel) {
  try {
    await ElMessageBox.confirm(`确定删除型号「${row.name}」吗？`, '提示', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      confirmButtonClass: 'el-button--danger',
    })
  } catch {
    return
  }
  try {
    await phoneSettingDeleteApi(row.id)
    ElMessage.success('已删除')
    await loadList()
  } catch {
    /* request 已提示 */
  }
}

async function handleSearch() {
  params.value.pageNum = 1
  await loadList()
}

async function handleClearSearch() {
  searchKeyword.value = ''
  params.value.pageNum = 1
  await loadList()
}

function handleSizeChange() {
  params.value.pageNum = 1
  loadList()
}

function handleCurrentChange() {
  loadList()
}

function handleSuccess() {
  loadList()
}

onMounted(() => loadList())
</script>

<template>
  <PageContainer title="型号设置">
    <div class="pms-page">
      <div class="header">
        <div class="header-left">
          <div class="search">
            <el-input v-model="searchKeyword" class="search-input" placeholder="型号名称" clearable
              @keyup.enter="handleSearch" @clear="handleClearSearch" />
            <el-button type="primary" plain :icon="Search" @click="handleSearch">查询</el-button>
          </div>
        </div>
        <div class="header-toolbar">
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增型号</el-button>
        </div>
      </div>

      <div class="jel-page-table-wrap">
        <el-table :data="modelList" v-loading="loading" class="jel-data-table jel-table-fill" height="100%" border>
          <el-table-column label="序号" type="index" width="60" align="center" />
          <el-table-column label="型号名称" prop="name" min-width="180" show-overflow-tooltip align="center" />
          <el-table-column label="操作" align="center" width="160">
            <template #default="{ row }">
              <div class="pms-actions">
                <el-button :icon="Edit" circle plain type="primary" @click="handleEdit(row)" />
                <el-button :icon="Delete" circle plain type="danger" @click="handleDelete(row)" />
              </div>
            </template>
          </el-table-column>
          <template #empty>
            <div class="jel-table-fill__empty">
              <el-empty description="暂无型号数据" />
            </div>
          </template>
        </el-table>
      </div>

      <div class="pms-pager">
        <el-pagination v-model:current-page="params.pageNum" v-model:page-size="params.pageSize"
          :page-sizes="[10, 30, 50, 100]" layout="total, sizes, prev, pager, next, jumper" :total="total"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </div>

    <ModelChannel ref="dialogRef" @success="handleSuccess" />
  </PageContainer>
</template>

<style scoped lang="scss">
.pms-page {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  width: 100%;
}

.header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 16px;
  width: 100%;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--el-border-color);
}

.header-left {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
  flex: 1;
  min-width: 0;
}

.header-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  margin-left: auto;
}

.search {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.search-input {
  width: 260px;
  max-width: 100%;
}

.pms-actions {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.pms-actions :deep(.el-button) {
  margin: 0;
}

.pms-pager {
  flex-shrink: 0;
  margin-top: 16px;
}

.pms-pager :deep(.el-pagination) {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px 0;
}
</style>
