<script lang="ts" setup>
import PageContainer from '@/components/PageContainer.vue'
import type { StoreDetail, StoreInventoryItem } from '@/types/store'
import StoreBasicInfo from './components/StoreBasicInfo.vue'
import StoreFinancePanel from './components/StoreFinancePanel.vue'
import StoreMemberPanel from './components/StoreMemberPanel.vue'
import StoreStockPanel from './components/StoreStockPanel.vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeDetailApi } from '@/api/store'

const route = useRoute()
const router = useRouter()

const storeId = computed(() => String(route.params.id ?? ''))
const activeTab = ref('basic')

// 门店数据
const store = ref<StoreDetail | null>()
// 门店库存
const inventory = ref<StoreInventoryItem[]>([])

const storeDetailGet = async (storeId: string) => {
  const res = await storeDetailApi(storeId)
  console.log('storeData', res)
  store.value = res.data
  inventory.value = res.data.inventory || []
}

const pageTitle = computed(() =>
  store.value?.name && store.value.name !== '—' ? `门店详情 · ${store.value.name}` : '门店详情',
)

const handleUpdateManager = () => {
  storeDetailGet(storeId.value)
}


onMounted(() => {
  storeDetailGet(storeId.value)
})
</script>

<template>
  <PageContainer :title="pageTitle">
    <template #titleExtra>
      <el-button :icon="ArrowLeft" text type="primary" @click="router.push('/shop')">返回列表</el-button>
    </template>

    <div class="store-detail">
      <div class="store-detail__summary">
        <div class="store-detail__summary-row">
          <span class="store-detail__muted">内部 ID</span>
          <code class="store-detail__code">{{ store?.id }}</code>
        </div>
        <div class="store-detail__summary-row">
          <span class="store-detail__muted">状态</span>
          <el-tag type="success" size="small" effect="light">{{ store?.status }}</el-tag>
        </div>
        <div class="store-detail__summary-row">
          <span class="store-detail__muted">待结算</span>
          <span class="store-detail__money">{{ Number(store?.manager?.settle_balance ?? 0).toFixed(2) }}</span>
        </div>
      </div>

      <el-tabs v-model="activeTab" class="store-detail__tabs" v-if="store?.id">
        <el-tab-pane label="基础信息" name="basic">
          <StoreBasicInfo :storeBasic="store" @updateManager="handleUpdateManager" />
        </el-tab-pane>
        <el-tab-pane label="库存管理" name="stock">
          <StoreStockPanel :inventory="inventory" />
        </el-tab-pane>
        <el-tab-pane label="会员管理" name="member">
          <StoreMemberPanel />
        </el-tab-pane>
        <el-tab-pane label="资金管理" name="finance">
          <StoreFinancePanel />
        </el-tab-pane>
      </el-tabs>
    </div>
  </PageContainer>
</template>

<style scoped lang="scss">
.store-detail {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;

  &__summary {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px 28px;
    margin-bottom: 16px;
    padding: 12px 16px;
    border: 1px solid $jel-border;
    border-radius: 8px;
    background: $jel-surface-muted;
  }

  &__summary-row {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;

    &:first-child {
      flex: 1;
      min-width: 0;
    }
  }

  &__muted {
    color: $jel-font-dec2;
    flex-shrink: 0;
  }

  &__code {
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
    color: $jel-font-title;
    background: $jel-surface;
    border: 1px solid $jel-border;
    word-break: break-all;
  }

  &__money {
    font-weight: 600;
    color: $jel-brandColor;
    font-variant-numeric: tabular-nums;
  }

  &__tabs {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    min-width: 0;

    :deep(.el-tabs) {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }

    :deep(.el-tabs__header) {
      flex-shrink: 0;
    }

    :deep(.el-tabs__content) {
      flex: 1;
      min-height: 0;
      overflow: hidden;
      padding-top: 16px;
      display: flex;
      flex-direction: column;
    }

    :deep(.el-tab-pane) {
      flex: 1;
      min-height: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
