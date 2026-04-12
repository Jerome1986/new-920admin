<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'
import { storeFinanceFlowDemoList, storeFinanceSummaryDemo } from '../testData'

/** 汇总：营业额（毛流水等）、可结算（扣佣等之后实际可结金额）（演示，接口对接后赋值） */
const summary = ref({ ...storeFinanceSummaryDemo })

/** 全量流水演示数据，接口对接后替换为请求结果 */
const flowAll = storeFinanceFlowDemoList

const currentPage = ref(1)
const pageSize = ref(10)

const flowList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return flowAll.slice(start, start + pageSize.value)
})

function rowIndex(index: number) {
  return (currentPage.value - 1) * pageSize.value + index + 1
}

function onPageSizeChange() {
  currentPage.value = 1
}
</script>

<template>
  <div class="sd-panel sd-panel--finance sd-panel--fill">
    <div class="sd-finance-head">
      <div class="sd-finance-summary">
        <span class="sd-finance-summary__label">汇总</span>
        <span class="sd-finance-summary__item" title="门店订单等产生的营业额（未扣佣前）">
          营业额 <strong>¥{{ summary.turnover }}</strong>
        </span>
        <span class="sd-finance-summary__item sd-finance-summary__item--muted" title="已扣除平台抽佣等费用后的可结算金额">
          可结算 ¥{{ summary.settleable }}
        </span>
      </div>
    </div>

    <div class="sd-finance-table-wrap">
      <div class="sd-finance-table-inner">
        <el-table :data="flowList" class="jel-data-table sd-finance-table" border height="100%" style="width: 100%">
          <el-table-column type="index" :index="rowIndex" label="序号" width="56" align="center" />
          <el-table-column prop="time" label="时间" width="176" align="center" />
          <el-table-column prop="type" label="类型" width="88" align="center">
            <template #default="{ row }">
              <el-tag :type="row.type === '收入' ? 'success' : 'info'" size="small">{{ row.type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="金额" width="120" align="right" />
          <el-table-column prop="balance" label="账户余额" width="120" align="right" />
          <el-table-column prop="remark" label="备注" min-width="140" show-overflow-tooltip />
        </el-table>
      </div>
      <div class="sd-finance-pager">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 30, 50]"
          :total="flowAll.length" layout="total, sizes, prev, pager, next, jumper" background
          @size-change="onPageSizeChange" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sd-panel {
  max-width: 1600px;
  padding: 16px;
  border: 1px solid $jel-border;
  border-radius: 8px;
  background: $jel-surface;
}

.sd-panel--finance {
  border-color: var(--el-border-color-lighter);
  background: $jel-surface;
}

.sd-panel--fill {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.sd-finance-head {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 12px 16px;
  margin-bottom: 14px;
  padding-bottom: 14px;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.sd-finance-table-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
  border-radius: 8px;
  padding: 12px;
  background: linear-gradient(165deg,
      rgba(239, 246, 255, 0.65) 0%,
      rgba(248, 250, 252, 0.9) 45%,
      #ffffff 100%);
  border: 1px solid rgba(59, 130, 246, 0.1);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.75);
}

.sd-finance-table-inner {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.sd-finance-table {
  --el-table-border-color: rgba(148, 163, 184, 0.22);
  --el-table-header-bg-color: rgba(241, 245, 249, 0.85);
  border-radius: 6px;
  overflow: hidden;
}

.sd-finance-pager {
  display: flex;
  flex-shrink: 0;
  justify-content: flex-end;
}

.sd-finance-summary {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px 20px;
  min-width: 0;
}

.sd-finance-summary__label {
  font-size: 14px;
  font-weight: 600;
  color: $jel-font-title;
  margin-right: 4px;
}

.sd-finance-summary__item {
  font-size: 14px;
  color: $jel-font-title;

  strong {
    color: var(--el-color-primary);
    font-variant-numeric: tabular-nums;
  }

  &--muted {
    font-size: 13px;
    color: $jel-font-dec2;
    font-weight: 500;
  }
}
</style>
