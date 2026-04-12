<script lang="ts" setup>
import { computed, ref } from 'vue'
import { storeMemberDemoList } from '../testData'

/** 全量演示数据，接口对接后替换为请求结果 */
const memberAll = storeMemberDemoList

const currentPage = ref(1)
const pageSize = ref(10)

const memberList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return memberAll.slice(start, start + pageSize.value)
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
      <el-table :data="memberList" class="jel-data-table" border height="100%" style="width: 100%">
        <el-table-column type="index" :index="rowIndex" label="序号" width="60" align="center" />
        <el-table-column prop="nickname" label="昵称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="mobile" label="手机号" width="140" align="center" />
        <el-table-column prop="level" label="会员等级" width="110" align="center" />
        <el-table-column prop="joinedAt" label="入会时间" width="180" align="center" />
      </el-table>
    </div>
    <div class="sd-panel__pager">
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 30, 50]"
        :total="memberAll.length" layout="total, sizes, prev, pager, next, jumper" background
        @size-change="onPageSizeChange" />
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

.sd-panel--fill {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sd-panel__table-wrap {
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
