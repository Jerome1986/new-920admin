<script lang="ts" setup>
import {
  createCategoryApi,
  deleteCategoryApi,
  fetchCategoryTree,
  updateCategoryApi
} from '@/api/category'
import PageContainer from '@/components/PageContainer.vue'
import type { CategoryNode, CategoryScope } from '@/types/Category'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, ref, watch } from 'vue'

// B 端 / C 端分类（与接口 target 一致）
const categoryScope = ref<CategoryScope>('TOB')

// 标题旁切换 B/C 分类
function setCategoryScope(scope: CategoryScope) {
  categoryScope.value = scope
}

// el-tree 字段映射
const defaultProps = { children: 'children', label: 'name' }

// 左侧完整分类树
const treeData = ref<CategoryNode[]>([])
// 当前选中的树节点
const currentCategory = ref<CategoryNode | null>(null)

// 右侧子分类表格数据（当前节点 children 排序）
const childList = computed(() => [...(currentCategory.value?.children ?? [])].sort((a, b) => a.sort - b.sort))

// 树中按 id 查找节点
function findNodeInTree(nodes: CategoryNode[], id: number): CategoryNode | null {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children?.length) {
      const found = findNodeInTree(n.children, id)
      if (found) return found
    }
  }
  return null
}

// 整树刷新后按 id 重新选中当前节点
function syncSelectionFromTree(anchorId: number | null) {
  if (anchorId == null) {
    currentCategory.value = null
    return
  }
  currentCategory.value = findNodeInTree(treeData.value, anchorId)
}

// 是否选中一级根节点（总类目）
const isRootSelected = computed(
  () => currentCategory.value != null && currentCategory.value.parentId === 0,
)

// 切换 B/C 时清空选中并重拉树
watch(categoryScope, () => {
  currentCategory.value = null
  loadCategoryTree()
})

// 点击树节点
const handleNodeClick = (data: CategoryNode) => {
  currentCategory.value = data
}

// 弹窗模式：新增根 / 新增子 / 编辑子 / 编辑根
type DialogMode = 'addRoot' | 'addChild' | 'edit' | 'editRoot'

const dialogVisible = ref(false)
const dialogMode = ref<DialogMode>('addRoot')
// 弹窗内表单
const form = ref({ id: null as number | null, name: '', sort: 1 })

// 打开新增总类目
const handleAddRoot = () => {
  dialogMode.value = 'addRoot'
  form.value = { id: null, name: '', sort: 1 }
  dialogVisible.value = true
}

// 打开新增子分类（挂在当前选中节点下）
const handleAddChild = () => {
  if (!currentCategory.value) return
  dialogMode.value = 'addChild'
  form.value = { id: null, name: '', sort: 1 }
  dialogVisible.value = true
}

// 编辑右侧子分类行
const handleEdit = (row: CategoryNode) => {
  dialogMode.value = 'edit'
  form.value = { id: row.id, name: row.name, sort: row.sort }
  dialogVisible.value = true
}

// 编辑当前选中的一级总类目
const handleEditRoot = () => {
  const node = currentCategory.value
  if (!node || node.parentId !== 0) return
  dialogMode.value = 'editRoot'
  form.value = { id: node.id, name: node.name, sort: node.sort }
  dialogVisible.value = true
}

// 删除子分类行并刷新树
const handleDelete = async (row: CategoryNode) => {
  try {
    await ElMessageBox.confirm('确定删除该分类吗？', '提示', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
  } catch {
    return
  }

  const parentId = currentCategory.value?.id ?? null
  try {
    await deleteCategoryApi(row.id)
    ElMessage.success('删除成功')
    await loadCategoryTree()
    syncSelectionFromTree(parentId)
  } catch (error) {
    console.error(error)
    ElMessage.error('删除失败')
  }
}

// 弹窗确定：新增或更新分类
const handleSubmit = async () => {
  const name = form.value.name.trim()
  if (!name) return

  if (dialogMode.value === 'addRoot') {
    try {
      await createCategoryApi({
        name,
        sort: form.value.sort,
        parentId: null,
        target: categoryScope.value
      })
      ElMessage.success('新增成功')
      dialogVisible.value = false
      await loadCategoryTree()
      currentCategory.value = null
    } catch (error) {
      console.error(error)
      ElMessage.error('新增失败')
    }
    return
  }

  if (dialogMode.value === 'addChild') {
    const parent = currentCategory.value
    if (!parent) {
      ElMessage.warning('请先选择父分类')
      return
    }
    const parentId = parent.id
    try {
      await createCategoryApi({
        name,
        sort: form.value.sort,
        parentId,
        target: categoryScope.value
      })
      ElMessage.success('新增成功')
      dialogVisible.value = false
      await loadCategoryTree()
      syncSelectionFromTree(parentId)
    } catch (error) {
      console.error(error)
      ElMessage.error('新增失败')
    }
    return
  }

  if (form.value.id == null) {
    ElMessage.warning('缺少分类 id')
    return
  }

  try {
    await updateCategoryApi(form.value.id, name, form.value.sort)
    ElMessage.success('更新成功')
    dialogVisible.value = false

    const node = findNodeInTree(treeData.value, form.value.id)
    if (node) {
      node.name = name
      node.sort = form.value.sort
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('更新失败')
  }
}

// 弹窗标题
const dialogTitle = () => {
  if (dialogMode.value === 'addRoot') return '新增总类目'
  if (dialogMode.value === 'addChild') return '新增子分类'
  if (dialogMode.value === 'editRoot') return '编辑总类目'
  return '编辑分类'
}

// 拉取当前 scope 下完整分类树
async function loadCategoryTree() {
  const res = await fetchCategoryTree(categoryScope.value)
  treeData.value = res.data
}

// 进入页拉树
onMounted(() => loadCategoryTree())
</script>

<template>
  <PageContainer title="分类管理">
    <template #titleExtra>
      <div class="category-scope-tags" role="tablist" aria-label="分类端切换">
        <el-tag role="tab" :aria-selected="categoryScope === 'TOB'" size="small" effect="plain"
          :type="categoryScope === 'TOB' ? 'primary' : 'info'" class="category-scope-tag"
          :class="{ 'is-active': categoryScope === 'TOB' }" @click="setCategoryScope('TOB')">
          B端分类
        </el-tag>
        <el-tag role="tab" :aria-selected="categoryScope === 'TOC'" size="small" effect="plain"
          :type="categoryScope === 'TOC' ? 'primary' : 'info'" class="category-scope-tag"
          :class="{ 'is-active': categoryScope === 'TOC' }" @click="setCategoryScope('TOC')">
          C端分类
        </el-tag>
      </div>
    </template>
    <div class="category-page">
      <div class="category-body">
        <aside class="category-tree-panel">
          <el-button type="primary" class="category-tree-panel__add" :icon="Plus" @click="handleAddRoot">
            新增总类目
          </el-button>
          <el-tree :key="categoryScope" :data="treeData" node-key="id" :props="defaultProps" highlight-current
            default-expand-all :expand-on-click-node="false" @node-click="handleNodeClick" />
        </aside>

        <div class="category-main">
          <div class="category-main__header">
            <div class="category-main__title">
              <h3>{{ currentCategory?.name || '请选择分类' }}</h3>
              <span class="category-main__meta">层级：{{ currentCategory?.level ?? '—' }}</span>
            </div>
            <div class="category-main__actions">
              <el-button :disabled="!isRootSelected" @click="handleEditRoot">编辑总类目</el-button>
              <el-button type="primary" :disabled="!currentCategory" @click="handleAddChild">新增子分类</el-button>
            </div>
          </div>

          <div class="jel-page-table-wrap">
            <el-table :data="childList" class="jel-data-table jel-table-fill" height="100%" border>
              <el-table-column prop="name" label="分类名称" min-width="160" />
              <el-table-column prop="sort" label="排序" width="100" align="center" />
              <el-table-column label="操作" width="180" align="center" fixed="right">
                <template #default="{ row }">
                  <el-button size="small" @click="handleEdit(row)">编辑</el-button>
                  <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
                </template>
              </el-table-column>
              <template #empty>
                <div class="jel-table-fill__empty">
                  <el-empty description="暂无子分类" />
                </div>
              </template>
            </el-table>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle()" width="480px" class="category-dialog" align-center
      append-to-body destroy-on-close :close-on-click-modal="false">
      <el-form :model="form" label-width="88px" class="category-dialog-form">
        <el-form-item label="分类名称">
          <el-input v-model="form.name" placeholder="请输入分类名称" maxlength="32" show-word-limit clearable />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="1" :max="9999" controls-position="right"
            class="category-dialog-form__sort" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<style scoped lang="scss">
.category-scope-tags {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.category-scope-tag {
  cursor: pointer;
  user-select: none;
  transition:
    opacity 0.2s ease,
    transform 0.15s ease;

  &:not(.is-active) {
    opacity: 0.72;
  }

  &:hover {
    opacity: 1;
  }

  &:active {
    transform: scale(0.97);
  }

  &.is-active {
    opacity: 1;
    font-weight: 500;
  }
}

.category-page {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.category-body {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  border: 1px solid $jel-border;
  border-radius: 8px;
  background: $jel-surface;
}

.category-tree-panel {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 260px;
  padding: 16px;
  background: $jel-surface-muted;
  border-right: 1px solid $jel-border;
}

.category-tree-panel__add {
  width: 100%;
  margin-bottom: 12px;
}

.category-tree-panel :deep(.el-tree) {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 4px 0;
  background: transparent;
  --el-tree-node-hover-bg-color: rgba(241, 245, 249, 0.9);
}

.category-tree-panel :deep(.el-tree-node__content) {
  border-radius: 6px;
}

.category-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  padding: 16px 20px 20px;
  background: $jel-surface;
}

.category-main__header {
  display: flex;
  flex-shrink: 0;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.category-main__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.category-main__title h3 {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 600;
  color: $jel-font-title;
}

.category-main__meta {
  font-size: 13px;
  color: $jel-font-dec2;
}

.category-dialog-form {
  padding: 8px 4px 0;
}

.category-dialog-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px #{$jel-border};
}

.category-dialog-form :deep(.el-input-number .el-input__wrapper) {
  border-radius: 8px;
}

.category-dialog-form__sort {
  width: 100%;
}
</style>
