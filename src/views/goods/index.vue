<script lang="ts" setup>
import { fetchCategoryTree } from '@/api/category'
import { deleteProductApi, productFindAllApi, productSearch, vipProductDeleteApi, vipProductFindAllApi } from '@/api/product'
import PageContainer from '@/components/PageContainer.vue'
import GoodsTableB2C from '@/views/goods/components/GoodsTableB2C.vue'
import GoodsTableMember from '@/views/goods/components/GoodsTableMember.vue'
import ProductDetailDrawer from '@/views/goods/components/ProductDetailDrawer.vue'
import type { CategoryNode } from '@/types/Category'
import type { GoodsTab, ProductListItem } from '@/types/Product'
import type { VipPlanListItem } from '@/types/VipPlan'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// 路由 query.tab 与列表 Tab 同步（TOB / TOC / VIP）
function parseGoodsTab(raw: unknown): GoodsTab {
  const t = typeof raw === 'string' ? raw : ''
  if (t === 'TOB' || t === 'TOC' || t === 'VIP') return t
  return 'TOB'
}

const route = useRoute()
const router = useRouter()

// 顶部 Tab：B 端 / C 端 / 会员产品（与 ?tab= 一致）
const activeTab = ref<GoodsTab>(parseGoodsTab(route.query.tab))
// B/C 端商品列表数据
const productList = ref<ProductListItem[]>([])
// 会员套餐列表数据
const vipPlanList = ref<VipPlanListItem[]>([])
// B/C 列表分页总条数
const total = ref(0)

// 列表分页：页码、每页条数
const params = ref({
  pageNum: 1,
  pageSize: 10,
})

// 商品名称/货号搜索关键字
const searchKeyword = ref('')

// 点击查询：回到第一页并拉列表
async function handleSearch() {
  params.value.pageNum = 1
  await loadData()
}

// 清空搜索并刷新列表
async function handleClearSearch() {
  params.value.pageNum = 1
  searchKeyword.value = ''
  await loadData()
}

// 当前 Tab 下分类树（仅 B/C 使用）
const categoryTreeData = ref<CategoryNode[]>([])
// 分类筛选：选中的叶子 id，未选为全部分类
const selectedCategoryId = ref<number | undefined>(undefined)

// el-tree-select 字段映射
const categoryTreeProps = {
  value: 'id',
  label: 'name',
  children: 'children',
} as const

// 搜索框占位文案
const searchPlaceholder = computed(() => '商品名称 / 货号')

// 顶部新增按钮文案
const addButtonText = computed(() =>
  activeTab.value === 'VIP' ? '新增套餐' : '新增商品'
)

// 按当前 Tab 请求列表（会员走套餐接口，B/C 走商品接口）
async function loadData() {
  if (activeTab.value === 'VIP') {
    vipPlanList.value = []
    total.value = 0
    const res = await vipProductFindAllApi()
    vipPlanList.value = res.data
    return
  }

  const kw = searchKeyword.value.trim()
  const res = kw
    ? await productSearch(
      selectedCategoryId.value as number,
      kw,
      params.value.pageNum,
      params.value.pageSize,
      activeTab.value
    )
    : await productFindAllApi(
      activeTab.value,
      params.value.pageNum,
      params.value.pageSize,
      selectedCategoryId.value
    )
  productList.value = res.data.list
  console.log('product', productList.value)

  total.value = res.data.total
}

const pageLoading = ref(false)
// 切换 B/C/会员 Tab：重置筛选并拉分类树（B/C）与列表
async function setTab(tab: GoodsTab) {
  pageLoading.value = true
  try {
    activeTab.value = tab
    params.value.pageNum = 1
    searchKeyword.value = ''
    if (tab === 'TOB' || tab === 'TOC') {
      selectedCategoryId.value = undefined
      categoryTreeData.value = []
      await Promise.all([
        fetchCategoryTree(tab).then((res) => {
          categoryTreeData.value = res.data
        }),
        loadData(),
      ])
    } else {
      await loadData()
    }
  } finally {
    router.replace({ path: '/goods', query: { tab } })
    pageLoading.value = false
  }
}

// 分类下拉变更：回到第一页再拉列表
function onCategoryFilterChange() {
  params.value.pageNum = 1
  loadData()
}

// 分页：每页条数变化
function handleSizeChange(size: number) {
  params.value.pageSize = size
  params.value.pageNum = 1
  loadData()
}

// 分页：当前页码变化
function handleCurrentChange(page: number) {
  params.value.pageNum = page
  loadData()
}

// 新增：会员套餐表单，B/C 进商品表单并带 target
function handleCreate() {
  if (activeTab.value === 'VIP') {
    router.push({ path: '/goods/vip-plan/edit' })
    return
  }
  router.push({ path: '/goods/product/edit', query: { target: activeTab.value } })
}

// 商品详情抽屉是否打开
const productDetailVisible = ref(false)
// 详情抽屉当前商品 id
const productDetailId = ref<number | null>(null)

// 打开商品详情抽屉
function handleView(row: ProductListItem) {
  productDetailId.value = row.id
  productDetailVisible.value = true
}

// 跳转编辑商品（带当前 Tab 的 target）
function handleEdit(row: ProductListItem) {
  router.push({
    path: '/goods/product/edit',
    query: { target: activeTab.value, id: String(row.id) },
  })
}

// 删除商品并刷新列表
async function handleDelete(row: ProductListItem) {
  try {
    await ElMessageBox.confirm(`确定删除「${row.name}」吗？删除后不可恢复。`, '提示', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      confirmButtonClass: 'el-button--danger',
    })
  } catch {
    return
  }
  try {
    await deleteProductApi(row.id)
    ElMessage.success('已删除')
    await loadData()
  } catch {
    // request 拦截器已提示
  }
}

// 跳转会员套餐表单（无详情，与新增同页）
function handleMemberEdit(_row: VipPlanListItem) {
  console.log(_row)
  router.push({ path: '/goods/vip-plan/edit', query: { id: _row.id } })
}

// 删除会员套餐（接口待接）
async function handleMemberDelete(row: VipPlanListItem) {
  try {
    await ElMessageBox.confirm(`确定删除「${row.levelText}」套餐吗？`, '提示', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      confirmButtonClass: 'el-button--danger',
    })
  } catch {
    return
  }
  await vipProductDeleteApi(row.id as number)
  ElMessage.success('已删除')
  await loadData()
}

// 进入页
onMounted(async () => {
  pageLoading.value = true
  try {
    activeTab.value = parseGoodsTab(route.query.tab)
    if (activeTab.value === 'TOB' || activeTab.value === 'TOC') {
      await Promise.all([
        fetchCategoryTree(activeTab.value).then((res) => {
          categoryTreeData.value = res.data
        }),
        loadData(),
      ])
    } else {
      await loadData()
    }
  } finally {
    pageLoading.value = false
  }
})
</script>

<template>
  <PageContainer title="商品管理">
    <template #titleExtra>
      <div class="goods-tabs" role="tablist" aria-label="商品渠道">
        <el-tag role="tab" :aria-selected="activeTab === 'TOB'" size="default" effect="plain"
          :type="activeTab === 'TOB' ? 'primary' : 'info'" class="goods-tab-tag"
          :class="{ 'is-active': activeTab === 'TOB' }" @click="setTab('TOB')">
          B端商品
        </el-tag>
        <el-tag role="tab" :aria-selected="activeTab === 'TOC'" size="default" effect="plain"
          :type="activeTab === 'TOC' ? 'primary' : 'info'" class="goods-tab-tag"
          :class="{ 'is-active': activeTab === 'TOC' }" @click="setTab('TOC')">
          C端商品
        </el-tag>
        <el-tag role="tab" :aria-selected="activeTab === 'VIP'" size="default" effect="plain"
          :type="activeTab === 'VIP' ? 'primary' : 'info'" class="goods-tab-tag"
          :class="{ 'is-active': activeTab === 'VIP' }" @click="setTab('VIP')">
          会员产品
        </el-tag>
      </div>
    </template>

    <div class="goods-page" v-loading="pageLoading" element-loading-text="加载中...">
      <div class="header">
        <div v-if="activeTab !== 'VIP'" class="header-left">
          <div class="search">
            <el-input v-model="searchKeyword" class="search-input" :placeholder="searchPlaceholder" clearable
              @keyup.enter="handleSearch" @clear="handleClearSearch" />
            <el-button type="primary" plain :icon="Search" @click="handleSearch">查询</el-button>
          </div>
          <div class="header-filter">
            <span class="header-filter__label">分类</span>
            <el-tree-select v-model="selectedCategoryId" class="goods-category-filter" :data="categoryTreeData"
              :props="categoryTreeProps" placeholder="全部分类" clearable filterable :render-after-expand="false"
              @change="onCategoryFilterChange" />
          </div>
        </div>
        <div class="header-toolbar">
          <el-button type="primary" :icon="Plus" @click="handleCreate">
            {{ addButtonText }}
          </el-button>
        </div>
      </div>

      <div class="jel-page-table-wrap">
        <GoodsTableB2C v-show="activeTab !== 'VIP'" :data="productList" @view="handleView" @edit="handleEdit"
          @delete="handleDelete" />
        <GoodsTableMember v-show="activeTab === 'VIP'" :data="vipPlanList" @edit="handleMemberEdit"
          @delete="handleMemberDelete" />
      </div>

      <div v-if="activeTab !== 'VIP'" class="pager">
        <el-pagination v-model:current-page="params.pageNum" v-model:page-size="params.pageSize"
          :page-sizes="[1, 10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" :total="total"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </div>

    <ProductDetailDrawer v-model="productDetailVisible" :product-id="productDetailId" />
  </PageContainer>
</template>

<style scoped lang="scss">
.goods-tabs {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.goods-tab-tag {
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

.goods-page {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.pager {
  flex-shrink: 0;
  margin-top: 16px;
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

.header-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.header-filter__label {
  flex-shrink: 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.goods-category-filter {
  width: 220px;
  max-width: 100%;
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

.pager :deep(.el-pagination) {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px 0;
}
</style>
