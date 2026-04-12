<script lang="ts" setup>
import { fetchProductDetailApi } from '@/api/product'
import type { ProductDetail, ProductType, ProductTarget } from '@/types/Product'
import { formatSkuAttrsDisplay } from '@/utils/skuAttrs'
import { computed, ref, watch } from 'vue'

// 抽屉显隐、当前查看的商品 id
const props = defineProps<{
  modelValue: boolean
  productId: number | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// 与 v-model 同步
const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

// 详情请求中
const loading = ref(false)
// 商品详情数据
const detail = ref<ProductDetail | null>(null)

// Product.type 文案
function typeLabel(t: ProductType): string {
  const map: Record<ProductType, string> = {
    USER: '用户端',
    MANAGER: '管理端',
    VIP: '会员',
    BOTH: '全部渠道',
  }
  return map[t] ?? t
}

// Product.target 文案
function targetLabel(t: ProductTarget): string {
  return t === 'TOB' ? 'B 端' : 'C 端'
}

// 金额展示两位小数
function priceStr(v: string | null | undefined): string {
  if (v == null || v === '') return '—'
  const n = Number(v)
  return Number.isFinite(n) ? n.toFixed(2) : String(v)
}

// 详情里价格字段是否有值（有则展示该行）
function hasPriceField(v: string | null | undefined): boolean {
  if (v == null) return false
  return String(v).trim() !== ''
}

// 按 productId 拉商品详情
async function loadDetail() {
  if (props.productId == null) {
    detail.value = null
    return
  }
  loading.value = true
  detail.value = null
  try {
    const res = await fetchProductDetailApi(props.productId)
    const r = res.data
    detail.value = {
      ...r,
      skus: Array.isArray(r.skus) ? r.skus : [],
      images: Array.isArray(r.images) ? r.images : [],
      models: Array.isArray(r.models) ? r.models : [],
    }
  } finally {
    loading.value = false
  }
}

// 打开且有效 id 时拉详情；关闭清空
watch(
  () => [props.modelValue, props.productId] as const,
  ([open, id]) => {
    if (open && id != null) void loadDetail()
    if (!open) detail.value = null
  }
)
</script>

<template>
  <el-drawer v-model="visible" title="商品详情" direction="rtl" :size="720" class="product-detail-drawer" destroy-on-close>
    <div v-loading="loading" class="pdd-body">
      <template v-if="detail">
        <div class="pdd-hero">
          <el-image :src="detail.cover" fit="cover" class="pdd-hero__cover" :preview-src-list="[detail.cover]"
            preview-teleported />
          <div class="pdd-hero__main">
            <h2 class="pdd-hero__title">{{ detail.name }}</h2>
            <p class="pdd-hero__sku">货号 {{ detail.skuNo }}</p>
            <div class="pdd-hero__tags">
              <el-tag :type="detail.status === 'ACTIVE' ? 'success' : 'info'" size="small">
                {{ detail.status === 'ACTIVE' ? '上架' : '下架' }}
              </el-tag>
              <el-tag v-if="detail.hot === 'ENABLE'" type="warning" size="small">热门</el-tag>
              <el-tag size="small" effect="plain">{{ targetLabel(detail.target) }}</el-tag>
              <el-tag size="small" effect="plain">{{ typeLabel(detail.type) }}</el-tag>
            </div>
          </div>
        </div>

        <section class="pdd-section">
          <h3 class="pdd-section__title">基本信息</h3>
          <el-descriptions :column="1" border size="small" class="pdd-desc" label-width="104px">
            <el-descriptions-item label="分类">
              {{ detail.categoryName ?? '—' }}
              <span class="pdd-muted">（{{ detail.skuNo }}）</span>
            </el-descriptions-item>
            <el-descriptions-item label="浏览量">{{ detail.lookNum }}</el-descriptions-item>
            <el-descriptions-item label="描述">
              <div class="pdd-text-block">{{ detail.dec?.trim() ? detail.dec : '—' }}</div>
            </el-descriptions-item>
          </el-descriptions>
        </section>

        <section class="pdd-section">
          <h3 class="pdd-section__title">SKU 规格</h3>
          <el-table :data="detail.skus" border size="small" class="pdd-table" empty-text="暂无 SKU">
            <el-table-column type="index" label="#" width="48" align="center" />
            <el-table-column label="规格属性" min-width="120">
              <template #default="{ row }">
                <span class="pdd-attrs">{{ formatSkuAttrsDisplay(row.attrs) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="进货价" width="100" align="right">
              <template #default="{ row }">{{ priceStr(row.costPrice) }}</template>
            </el-table-column>
            <el-table-column label="售价" width="100" align="right">
              <template #default="{ row }">{{ priceStr(row.salePrice) }}</template>
            </el-table-column>
            <el-table-column prop="stock" label="库存" width="80" align="center" />
            <el-table-column prop="minStock" label="最低库存" width="80" align="center" />
            <el-table-column prop="unit" label="单位" width="72" align="center" />
            <el-table-column label="图" width="72" align="center">
              <template #default="{ row }">
                <el-image v-if="row.image" :src="row.image" fit="cover" class="pdd-sku-img"
                  :preview-src-list="[row.image]" preview-teleported />
                <span v-else class="pdd-muted">—</span>
              </template>
            </el-table-column>
          </el-table>
        </section>

        <section class="pdd-section">
          <h3 class="pdd-section__title">商品图库</h3>
          <div v-if="detail.images.length" class="pdd-gallery">
            <el-image v-for="img in detail.images" :key="img.id" :src="img.url" fit="cover" class="pdd-gallery__item"
              :preview-src-list="detail.images.map((i) => i.url)" preview-teleported />
          </div>
          <el-empty v-else description="暂无图片" :image-size="72" />
        </section>

        <section class="pdd-section">
          <h3 class="pdd-section__title">适用型号</h3>
          <div v-if="detail.models.length" class="pdd-models">
            <el-tag v-for="m in detail.models" :key="m.id" type="info" effect="plain" class="pdd-model-tag">
              {{ m.name }}
            </el-tag>
          </div>
          <el-empty v-else description="暂无型号" :image-size="72" />
        </section>
      </template>

      <el-empty v-else-if="!loading" description="暂无数据" />
    </div>
  </el-drawer>
</template>

<style scoped lang="scss">
.product-detail-drawer :deep(.el-drawer__body) {
  padding: 0 20px 24px;
  overflow: auto;
}

.pdd-body {
  min-height: 120px;
}

.pdd-hero {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.pdd-hero__cover {
  width: 112px;
  height: 112px;
  flex-shrink: 0;
  border-radius: 8px;
}

.pdd-hero__main {
  min-width: 0;
  flex: 1;
}

.pdd-hero__title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.35;
  color: var(--el-text-color-primary);
}

.pdd-hero__sku {
  margin: 0 0 10px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.pdd-hero__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pdd-section {
  margin-bottom: 22px;

  &:last-child {
    margin-bottom: 0;
  }
}

.pdd-section__title {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.pdd-desc {
  width: 100%;

  :deep(.el-descriptions__label) {
    min-width: 104px;
    white-space: nowrap;
  }
}

.pdd-muted {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.pdd-text-block {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;
}

.pdd-table {
  width: 100%;
}

.pdd-attrs {
  font-size: 13px;
  line-height: 1.45;
}

.pdd-sku-img {
  width: 40px;
  height: 40px;
  border-radius: 4px;
}

.pdd-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.pdd-gallery__item {
  width: 96px;
  height: 96px;
  border-radius: 8px;
}

.pdd-models {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pdd-model-tag {
  margin: 0;
}
</style>
