<script lang="ts" setup>
import { productFindAllApi } from '@/api/product'
import { stockModelAddApi, stockModelFindOne, stockModelUpdate } from '@/api/stockModel'
import PageContainer from '@/components/PageContainer.vue'
import type { ProductListItem, RowList } from '@/types/Product'
import type { StockModel } from '@/types/stockModel'
import { Box, List, Search } from '@element-plus/icons-vue'
import type { TableInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// B 端商品渠道类型，与商品接口一致
const TOB = 'TOB' as const

// 当前路由（读取模板 id 等 query）
const route = useRoute()
// 路由跳转（返回列表等）
const router = useRouter()

// 路由上的模板 空 表示新建，数字表示编辑）
const templateIdQuery = computed(() => {
  const raw = route.query.id
  return Number(raw)
})

// 商品详情
const detail = ref<StockModel>()

// 商品表格加载中
const productsLoading = ref(false)
// 当前页商品行数据
const productList = ref<RowList[]>([])
// 列表本地搜索关键词（仅过滤当前页已加载数据）
const productSearchKeyword = ref('')
// 商品总条数（分页）
const productTotal = ref(0)
// 商品列表分页参数
const productParams = ref({
  pageNum: 1,
  pageSize: 100,
})

// 表格实例，用于清空勾选
const tableRef = ref<TableInstance>()
// 当前勾选的商品行（跨页保留）
const selectedRows = ref<RowList[]>([])

// 组合套餐弹窗显隐
const comboVisible = ref(false)
// 组合套餐名称输入
const comboName = ref('')
// 组合套餐提交中
const comboSubmitting = ref(false)

// 当前页商品按关键词本地过滤（名称、货号、分类）
const displayProductList = computed(() => {
  const k = productSearchKeyword.value.trim().toLowerCase()
  if (!k) return productList.value
  return productList.value.filter((p) => {
    const name = String(p.productName ?? '').toLowerCase()
    const sku = String(p.skuNo ?? '').toLowerCase()
    const cat = String(p.categoryName ?? '').toLowerCase()
    return name.includes(k) || sku.includes(k) || cat.includes(k)
  })
})

// 表格序号：无搜索时按分页连续编号；有搜索时按当前筛选结果编号
// function tableIndexColumn(index: number) {
//   if (productSearchKeyword.value.trim()) return index + 1
//   return (productParams.value.pageNum - 1) * productParams.value.pageSize + index + 1
// }

// 分页拉取 B 端商品列表并补全最低库存默认值
async function loadProducts() {
  productsLoading.value = true
  try {
    const res = await productFindAllApi(
      TOB,
      productParams.value.pageNum,
      productParams.value.pageSize,
      undefined
    )
    // console.log('product', res)
    productList.value = (res.data.list ?? []).flatMap(product =>
      (product.skus ?? []).map(sku => ({
        cover: product.cover,
        categoryId: product.categoryId,
        categoryName: product.categoryName,
        productId: product.id,
        productName: product.name,
        skuNo: product.skuNo,
        skuId: sku.id,
        skuName: sku.attrs.value as string,
        costPrice: sku.costPrice,
        salePrice: sku.salePrice,
        initStock: product.initStock || 1
      }))
    )
    productTotal.value = res.data.total ?? 0
  } catch {
    productList.value = []
    productTotal.value = 0
  } finally {
    productsLoading.value = false
  }
}

// 表格勾选变化
function onSelectionChange(rows: RowList[]) {
  // console.log('table', rows)
  selectedRows.value = rows
}


// 每页条数变化：回到第一页再请求
function handleProductSizeChange() {
  productParams.value.pageNum = 1
  loadProducts()
}

// 翻页
function handleProductPageChange() {
  loadProducts()
}

// 打开「设为组合套餐」弹窗
function openComboDialog() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先勾选至少一件 B 端商品')
    return
  }

  templateIdQuery.value ? comboName.value = detail.value?.name as string : comboName.value = ''
  comboVisible.value = true
}

// 提交组合套餐（接口待接）
async function submitCombo() {
  const name = comboName.value.trim()
  if (!name) {
    ElMessage.warning('请输入组合名称')
    return
  }
  comboSubmitting.value = true
  console.log('submit', selectedRows.value)
  const items = selectedRows.value.map(s => ({
    categoryId: Number(s.categoryId),
    productId: Number(s.productId) as number,
    skuId: Number(s.skuId),
    initStock: s.initStock as number,
  }))
  // 构建参数
  try {
    if (templateIdQuery.value) {
      // 编辑
      console.log('edit')
      await stockModelUpdate(templateIdQuery.value, name, items)
    } else {
      console.log('add')
      // 新增
      await stockModelAddApi(name, items)
    }
    comboVisible.value = false
    await nextTick()
    tableRef.value?.clearSelection()
    ElMessage.success('设置成功')
    goBack()
  } finally {
    comboSubmitting.value = false
  }
}

// 返回库存模板列表页
function goBack() {
  router.push('/stock')
}

// 翻页时（或者 displayProductList 改变时）保持回显
watch(displayProductList, () => {
  nextTick(() => {
    console.log('change')
    const templateProduct = detail.value?.items.map(i => ({ productid: i.productId, skuId: i.skuId, initStock: i.initStock }))
    displayProductList.value.forEach(row => {
      templateProduct?.forEach(p => {
        if (p.skuId === row.skuId) {
          tableRef.value?.toggleRowSelection(row, true)
          row.initStock = p.initStock
        }
      })
    })
  })
})

onMounted(async () => {
  // 1.没有就是新增渲染默认列表
  await loadProducts()
  // 2.如果有ID则拉取详情
  if (templateIdQuery.value) {
    const detailRes = await stockModelFindOne(templateIdQuery.value)
    detail.value = detailRes.data
    const templateProduct = detail.value.items.map(i => ({ productid: i.productId, skuId: i.skuId, initStock: i.initStock }))
    displayProductList.value.forEach(row => {
      templateProduct.forEach(p => {
        if (p.skuId === row.skuId) {
          tableRef.value?.toggleRowSelection(row, true)
          row.initStock = p.initStock
        }
      })
    })
  }
})
</script>

<template>
  <PageContainer title="设置库存模板">
    <template #titleExtra>
      <el-button link type="primary" @click="goBack">返回模板列表</el-button>
    </template>

    <div class="goods-page" v-loading="productsLoading" element-loading-text="加载中...">
      <div class="header">
        <div class="header-left">
          <el-input v-model="productSearchKeyword" class="product-search-input" clearable placeholder="搜索商品名称、货号、分类"
            :prefix-icon="Search" />
          <span v-if="selectedRows.length > 0" class="header-hint">
            已选 <strong>{{ selectedRows.length }}</strong> 件 B 端商品
          </span>
        </div>
        <div class="header-toolbar">
          <el-button type="primary" :icon="Box" :disabled="selectedRows.length === 0" @click="openComboDialog">
            设置
          </el-button>
        </div>
      </div>

      <div class="jel-page-table-wrap">
        <el-table ref="tableRef" :data="displayProductList" class="jel-data-table jel-table-fill" row-key="skuId"
          height="100%" border @selection-change="onSelectionChange">
          <el-table-column type="selection" width="48" align="center" reserve-selection />
          <el-table-column type="index" label="序号" width="58" align="center" />
          <el-table-column label="分类" width="100" align="center">
            <template #default="{ row }">
              {{ row.categoryName ?? '—' }}
            </template>
          </el-table-column>
          <el-table-column label="封面" width="88" align="center">
            <template #default="{ row }">
              <el-image :src="row.cover" fit="cover" class="goods-b2c-cover" :preview-src-list="[row.cover]"
                preview-teleported />
            </template>
          </el-table-column>
          <el-table-column prop="productName" label="商品名称" min-width="140" show-overflow-tooltip />
          <el-table-column prop="skuNo" label="货号" width="130" show-overflow-tooltip />
          <el-table-column prop="skuName" label="规格" width="130" show-overflow-tooltip />
          <el-table-column label="进货价" width="100" align="right">
            <template #default="{ row }">{{ Number(row.costPrice).toFixed(2) }}</template>
          </el-table-column>
          <el-table-column label="售价" width="100" align="right">
            <template #default="{ row }">
              <span class="goods-b2c-price">{{ Number(row.salePrice).toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="初始数量" min-width="140" align="center">
            <template #default="{ row }">
              <el-input-number v-model="row.initStock" :min="0" :max="999999" :step="1" size="small"
                controls-position="right" class="stock-min-stock-input" />
            </template>
          </el-table-column>
          <template #empty>
            <div class="jel-table-fill__empty">
              <el-empty description="暂无商品" />
            </div>
          </template>
        </el-table>
      </div>

      <div class="pager">
        <el-pagination v-model:current-page="productParams.pageNum" v-model:page-size="productParams.pageSize"
          :page-sizes="[100]" layout="total, sizes, prev, pager, next, jumper" :total="productTotal"
          @size-change="handleProductSizeChange" @current-change="handleProductPageChange" />
      </div>
    </div>

    <el-dialog v-model="comboVisible" title="保存为组合套餐" width="440px" align-center append-to-body destroy-on-close
      :close-on-click-modal="false">
      <p class="combo-tip">将把已勾选的 <strong>{{ selectedRows.length }}</strong> 件 B 端商品打包为一个组合。</p>
      <el-form label-width="88px" @submit.prevent>
        <el-form-item label="组合名称" required>
          <el-input v-model="comboName" placeholder="请输入组合名称" maxlength="64" show-word-limit clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="comboVisible = false">取消</el-button>
        <el-button type="primary" :loading="comboSubmitting" @click="submitCombo">确定</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<style scoped lang="scss">
.product-search-input {
  width: 280px;
  max-width: 100%;
}

.goods-page {
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
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.header-hint {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.header-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  margin-left: auto;
}

.combo-tip {
  margin: 0 0 16px;
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

.goods-b2c-cover {
  width: 56px;
  height: 56px;
  border-radius: 8px;
}

.goods-b2c-price {
  font-weight: 600;
  color: $jel-brandColor;
}

.stock-min-stock-input {
  width: 120px;
  max-width: 100%;
}

.pager {
  flex-shrink: 0;
  margin-top: 16px;
}

.pager :deep(.el-pagination) {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px 0;
}
</style>
