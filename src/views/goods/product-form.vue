<script lang="ts" setup>
import { fetchCategoryTree } from '@/api/category'
import { addProductApi, fetchProductDetailApi, phoneModelsFindAllApi, updateProductApi } from '@/api/product'
import ImageUploadGallery from '@/components/ImageUploadGallery.vue'
import ImageUploadSingle from '@/components/ImageUploadSingle.vue'
import PageContainer from '@/components/PageContainer.vue'
import type { CategoryNode, CategoryScope } from '@/types/Category'
import type {
  PhoneModelListItem,
  ProductAddPayload,
  ProductAddSkuPayload,
  ProductDetail,
  ProductHot,
  ProductSkuEditRow,
  ProductSkuItem,
  ProductStatus,
  ProductType,
} from '@/types/Product'
import { parseSkuAttrsToLabelValue } from '@/utils/skuAttrs'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { filterModels } from './composable'

// 全量型号列表（接口），供型号下拉过滤
const modelListRef = ref<PhoneModelListItem[]>([])
const { filteredModels, filterPhoneModel } = filterModels(modelListRef)

const route = useRoute()
const router = useRouter()

// 当前渠道下的分类树
const categoryTreeData = ref<CategoryNode[]>([])
// el-tree-select 字段映射
const categoryTreeProps = {
  value: 'id',
  label: 'name',
  children: 'children',
} as const

// 路由 query.target：TOB / TOC
const target = computed<CategoryScope | null>(() => {
  const t = route.query.target as string
  return t === 'TOB' || t === 'TOC' ? t : null
})

// 编辑时路由 query.id，无则为新增
const productId = computed(() => {
  const raw = route.query.id
  if (raw == null || raw === '') return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
})

// 渠道展示文案
const channelLabel = computed(() => (target.value === 'TOB' ? 'B 端' : 'C 端'))

// 页头：新增 / 编辑
const pageTitle = computed(() =>
  productId.value != null ? `编辑商品 · ${channelLabel.value}` : `新增商品 · ${channelLabel.value}`
)

// 商品主表单
const form = reactive({
  name: '',
  skuNo: '',
  dec: '',
  categoryId: undefined as number | undefined,
  // 与 categoryId 同步，来自树节点
  categoryName: '',
  cover: '',
  images: [] as string[],
  lookNum: 0,
  status: 'ACTIVE' as ProductStatus,
  hot: 'DISABLE' as ProductHot,
  type: 'BOTH' as ProductType,
  models: [] as string[],
})

// 页面初始加载（分类树 + 详情）
const pageLoading = ref(false)
// 保存按钮防重复提交
const submitLoading = ref(false)

// SKU 表格编辑行
const skuRows = ref<ProductSkuEditRow[]>([])

// 接口 SKU 转表格行
function mapSkuToRow(s: ProductSkuItem): ProductSkuEditRow {
  const { label, value } = parseSkuAttrsToLabelValue(s.attrs)
  return {
    id: s.id,
    attrLabel: label,
    attrValue: value,
    costPrice: s.costPrice,
    salePrice: s.salePrice,
    stock: Number(s.stock ?? 0),
    minStock: Number(s.minStock),
    unit: s.unit,
    image: s.image ?? '',
  }
}

// 详情回填主表与 SKU 行
function applyDetail(d: ProductDetail) {
  form.name = d.name
  form.skuNo = d.skuNo
  form.dec = d.dec ?? ''
  form.categoryId = d.categoryId
  form.categoryName =
    d.categoryName ?? findCategoryNameById(categoryTreeData.value, d.categoryId) ?? ''
  form.cover = d.cover
  form.images = (Array.isArray(d.images) ? d.images : []).map((i) => i.url)
  form.lookNum = d.lookNum
  form.status = d.status
  form.hot = d.hot
  form.type = d.type
  form.models = (Array.isArray(d.models) ? d.models : []).map((m) => m.name).filter(Boolean)
  skuRows.value = (Array.isArray(d.skus) ? d.skus : []).map(mapSkuToRow)
}

// 在分类树中按 id 找名称
function findCategoryNameById(nodes: CategoryNode[], id: number | undefined): string {
  if (id == null) return ''
  for (const n of nodes) {
    if (n.id === id) return n.name
    if (n.children?.length) {
      const found = findCategoryNameById(n.children, id)
      if (found) return found
    }
  }
  return ''
}

// 选分类后同步 categoryName
watch(
  () => [form.categoryId, categoryTreeData.value] as const,
  () => {
    if (form.categoryId == null) {
      form.categoryName = ''
      return
    }
    const fromTree = findCategoryNameById(categoryTreeData.value, form.categoryId)
    if (fromTree) form.categoryName = fromTree
  },
  { deep: true },
)

// 返回商品列表（带上 tab，与列表页 ?tab= 一致）
function goodsListLocation() {
  const tab = target.value === 'TOB' || target.value === 'TOC' ? target.value : 'TOC'
  return { path: '/goods' as const, query: { tab } }
}

function goBack() {
  router.push(goodsListLocation())
}

// 型号多选转接口 models 数组
function buildModelsPayload(): { name: string }[] {
  const seen = new Set<string>()
  const out: { name: string }[] = []
  for (const raw of form.models) {
    const name = typeof raw === 'string' ? raw.trim() : ''
    if (!name || seen.has(name)) continue
    seen.add(name)
    out.push({ name })
  }
  return out
}

// 表格行转提交用 SKU
function mapSkuRowToPayload(r: ProductSkuEditRow): ProductAddSkuPayload {
  const sku: ProductAddSkuPayload = {
    attrs: { label: r.attrLabel || '规格', value: r.attrValue },
    costPrice: r.costPrice,
    salePrice: r.salePrice.trim(),
    stock: r.stock,
    minStock: r.minStock,
    unit: r.unit,
    image: r.image.trim() || null,
  }
  if (r.id != null) sku.id = r.id
  return sku
}

// 组装新增/更新请求体
function buildAddPayload(): ProductAddPayload {
  const skus = skuRows.value.map(mapSkuRowToPayload)
  return {
    name: form.name.trim(),
    skuNo: form.skuNo.trim(),
    dec: form.dec?.trim() ? form.dec.trim() : null,
    cover: form.cover.trim(),
    lookNum: form.lookNum,
    status: form.status,
    hot: form.hot,
    type: form.type,
    target: target.value!,
    categoryId: form.categoryId!,
    categoryName: form.categoryName.trim(),
    images: form.images.map((u) => ({ url: u })),
    models: buildModelsPayload(),
    skus,
  }
}

// 表格 row-key
function skuRowKey(row: ProductSkuEditRow) {
  if (row.id != null) return `id-${row.id}`
  return row._clientKey ?? 'row'
}

// 提交：新增或更新商品
async function handleSubmit() {
  const id = productId.value
  submitLoading.value = true
  try {
    const payload = buildAddPayload()
    if (id != null) {
      await updateProductApi(id, payload)
      ElMessage.success('保存成功')
    } else {
      await addProductApi(payload)
      ElMessage.success('商品创建成功')
    }
    router.push(goodsListLocation())
  } catch {
    // request 拦截器已提示
  } finally {
    submitLoading.value = false
  }
}

// 新增一行 SKU
function handleAddSkuRow() {
  skuRows.value.push({
    _clientKey: `sku-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    attrLabel: '规格',
    attrValue: '裸片',
    costPrice: '3.5',
    salePrice: '20',
    stock: 99,
    minStock: 1,
    unit: '片',
    image: 'https://objectstorageapi.gzg.sealos.run/erq1dfin-920/file/1775446430519_7989797979797.jpg',
  })
}

// 删除一行 SKU
function removeSkuRow(index: number) {
  skuRows.value.splice(index, 1)
}

// 拉取型号字典供下拉
function loadPhoneModels() {
  phoneModelsFindAllApi(1, 1500).then((res) => {
    modelListRef.value = res.data.list || []
  })
}

// 进入页：校验 target、拉分类与型号，编辑时拉详情
onMounted(async () => {
  if (!target.value) {
    ElMessage.warning('缺少渠道参数 target')
    router.replace({ path: '/goods', query: { tab: 'TOC' } })
    return
  }
  pageLoading.value = true
  try {
    const treeRes = await fetchCategoryTree(target.value)
    console.log('cate', treeRes)

    categoryTreeData.value = treeRes.data
  } catch {
    categoryTreeData.value = []
    console.error('加载分类失败')
  }
  await loadPhoneModels()
  try {
    if (productId.value != null) {
      const res = await fetchProductDetailApi(productId.value)
      console.log('edit', res.data)

      applyDetail(res.data)
    }
  } catch {
    console.error('加载商品详情失败')
  } finally {
    pageLoading.value = false
  }
})
</script>

<template>
  <PageContainer v-if="target" :title="pageTitle">
    <template #titleExtra>
      <el-button :icon="ArrowLeft" text type="primary" @click="goBack">返回列表</el-button>
    </template>

    <div v-loading="pageLoading" class="product-form-page">
      <el-form :model="form" label-width="108px" class="product-form" @submit.prevent>
        <section class="pf-section">
          <h3 class="pf-section__title">渠道与分类</h3>
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <el-form-item label="销售渠道">
                <el-tag type="info" effect="plain">{{ channelLabel }}</el-tag>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="商品分类" required>
                <el-tree-select v-model="form.categoryId" class="pf-tree-select" :data="categoryTreeData"
                  :props="categoryTreeProps" placeholder="请选择叶子分类" clearable filterable :render-after-expand="false" />
              </el-form-item>
            </el-col>
          </el-row>
        </section>

        <section class="pf-section">
          <h3 class="pf-section__title">基本信息</h3>
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <el-form-item label="商品名称" required>
                <el-input v-model="form.name" placeholder="请输入商品名称" maxlength="600" show-word-limit />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="货号" required>
                <el-input v-model="form.skuNo" placeholder="唯一货号" maxlength="64" show-word-limit />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="描述">
                <el-input v-model="form.dec" type="textarea" :rows="4" placeholder="商品描述" maxlength="2000"
                  show-word-limit />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="封面图" required>
                <ImageUploadSingle v-model="form.cover" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="商品图库">
                <ImageUploadGallery v-model="form.images" :limit="9" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="支持的型号" prop="models">
                <el-select v-model="form.models" multiple filterable :filter-method="filterPhoneModel"
                  placeholder="请选择支持的型号" style="width: 100%">
                  <el-option v-for="item in filteredModels" :key="item.id" :label="item.name" :value="item.name" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </section>

        <section class="pf-section">
          <h3 class="pf-section__title">销售设置</h3>
          <el-row :gutter="20">
            <el-col :xs="24" :md="8">
              <el-form-item label="状态">
                <el-select v-model="form.status" placeholder="上架状态" style="width: 100%">
                  <el-option label="上架" value="ACTIVE" />
                  <el-option label="下架" value="INACTIVE" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="8">
              <el-form-item label="热门">
                <el-select v-model="form.hot" placeholder="是否热门" style="width: 100%">
                  <el-option label="否" value="DISABLE" />
                  <el-option label="是" value="ENABLE" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="8">
              <el-form-item label="可见类型">
                <el-select v-model="form.type" placeholder="type" style="width: 100%">
                  <el-option label="用户端" value="USER" />
                  <el-option label="管理端" value="MANAGER" />
                  <el-option label="会员" value="VIP" />
                  <el-option label="全部" value="BOTH" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="8">
              <el-form-item label="浏览量">
                <el-input-number v-model="form.lookNum" :min="0" :step="1" controls-position="right"
                  style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
        </section>

        <section class="pf-section">
          <div class="pf-section__head">
            <h3 class="pf-section__title">SKU 规格</h3>
            <el-button type="primary" link @click="handleAddSkuRow">添加规格</el-button>
          </div>
          <el-table :data="skuRows" :row-key="skuRowKey" border size="small" class="pf-sku-table"
            empty-text="暂无 SKU，请点击添加规格">
            <el-table-column type="index" label="#" width="48" align="center" />
            <el-table-column label="规格名" min-width="100">
              <template #default="{ row }">
                <el-input v-model="row.attrLabel" placeholder="如：规格" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="规格值" min-width="100">
              <template #default="{ row }">
                <el-input v-model="row.attrValue" placeholder="如：单壳" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="进货价" width="120">
              <template #default="{ row }">
                <el-input v-model="row.costPrice" placeholder="0.00" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="售价" width="120">
              <template #default="{ row }">
                <el-input v-model="row.salePrice" placeholder="0.00" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="库存" width="100">
              <template #default="{ row }">
                <el-input-number v-model="row.stock" :min="0" :step="1" size="small" controls-position="right"
                  class="pf-sku-num" />
              </template>
            </el-table-column>
            <el-table-column label="最低库存" width="100">
              <template #default="{ row }">
                <el-input-number v-model="row.minStock" :min="0" :step="1" size="small" controls-position="right"
                  class="pf-sku-num" />
              </template>
            </el-table-column>
            <el-table-column label="单位" width="100">
              <template #default="{ row }">
                <el-input v-model="row.unit" size="small" controls-position="right" class="pf-sku-num" />
              </template>
            </el-table-column>
            <el-table-column label="SKU 封面" min-width="200" align="center">
              <template #default="{ row }">
                <div class="pf-sku-cover">
                  <ImageUploadSingle v-model="row.image" />
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="72" align="center" fixed="right">
              <template #default="{ $index }">
                <el-button type="danger" link size="small" @click="removeSkuRow($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </section>

        <section class="pf-section pf-actions">
          <el-button @click="goBack">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button>
        </section>
      </el-form>
    </div>
  </PageContainer>
</template>

<style scoped lang="scss">
.product-form-page {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding-right: 4px;
}

.product-form {
  max-width: 960px;
}

.pf-section {
  margin-bottom: 28px;

  &:last-of-type {
    margin-bottom: 0;
  }
}

.pf-section__title {
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.pf-section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;

  .pf-section__title {
    margin: 0;
    padding: 0;
    border: none;
  }
}

.pf-tree-select {
  width: 100%;
}

.pf-sku-table {
  width: 100%;
}

.pf-sku-num {
  width: 100%;
}

// 表格内 SKU 封面区域缩小
.pf-sku-cover {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 4px;
  min-width: 0;
}

.pf-sku-cover :deep(.image-upload-field) {
  align-items: center;
  max-width: 100%;
}

.pf-sku-cover :deep(.image-upload-hint) {
  text-align: center;
  max-width: 180px;
}

.pf-sku-cover :deep(.image-upload-single .el-upload--picture-card),
.pf-sku-cover :deep(.image-upload-single .el-upload-list--picture-card .el-upload-list__item) {
  width: 80px;
  height: 80px;
  line-height: 80px;
}

.pf-sku-cover :deep(.image-upload-single .el-upload-list--picture-card) {
  margin: 0;
}

.pf-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
