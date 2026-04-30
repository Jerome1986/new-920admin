<script lang="ts" setup>
import { storeDeleteApi, storeFindAll } from '@/api/store';
import type { StoreList } from '@/types/store';
import { formatTimestamp } from '@/utils/formatTimestamp';
import { Delete, Edit, View } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()

const searchValue = ref('')
const loading = ref(false)

const storeList = ref<StoreList[]>([])
const params = ref({
  pageNum: 1,
  pageSize: 10
})
const total = ref(0)
// 获取门店列表
const storeListGet = async () => {
  const res = await storeFindAll(params.value.pageNum, params.value.pageSize)
  console.log('store', res)

  storeList.value = res.data.list
  total.value = res.data.total
}

// 分页处理
const handleSizeChange = (size: number) => {
  params.value.pageNum = 1
  params.value.pageSize = size
  storeListGet()
}

const handleCurrentChange = (num: number) => {
  params.value.pageNum = num
  storeListGet()
}

// 搜索
const searchMaterialGet = () => {
  console.log('serach')

}
const handleClear = () => {
  searchValue.value = ''
}

// 跳转新增门店
const onAddChannel = () => {
  router.push('/shop/create')
}

// 跳转门店详情
const onViewDetail = (row: StoreList) => {
  router.push(`/shop/detail/${row.id}`)
}

// 删除门店
const onDeletDetail = async (row: StoreList) => {
  await ElMessageBox.confirm(`确定删除「${row.name}」吗？删除后不可恢复。`, '提示', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    confirmButtonClass: 'el-button--danger',
  })
  try {
    // 调用删除
    await storeDeleteApi(row.id)
    ElMessage.success('已删除')
    storeListGet()
  } catch (err) {
    console.error(err)
  }
}

onMounted(() => storeListGet())
</script>

<template>
  <PageContainer title="门店管理">
    <div class="header">
      <!--   搜索   -->
      <div class="search">
        <el-input v-model="searchValue" style="width: 240px; margin-right: 8px" placeholder="根据门店id或门店电话搜索" clearable
          @clear="handleClear" />
        <el-button type="primary" @click="searchMaterialGet" plain>查询</el-button>
      </div>
      <el-button type="primary" @click="onAddChannel" plain>添加门店</el-button>
    </div>
    <div class="jel-page-table-wrap">
      <el-table :data="storeList" class="jel-data-table jel-table-fill" style="width: 100%" height="100%"
        v-loading="loading" border>
        <el-table-column label="序号" align="center" width="60" type="index"></el-table-column>
        <el-table-column label="门店名称" align="center" prop="name"></el-table-column>
        <el-table-column label="门店地址" align="center" prop="address"></el-table-column>
        <el-table-column label="店长" align="center" prop="managerName"></el-table-column>
        <el-table-column label="联系方式" align="center" prop="phone"></el-table-column>
        <el-table-column label="会员数量" align="center" prop="settleBalance">
          <template #default="{ row }">
            {{ row.users.length }}
          </template>
        </el-table-column>
        <el-table-column label="资金（待结算）" align="center" prop="settleBalance">
          <template #default="{ row }">
            {{ Number(row.wallet.balance).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createdAt">
          <template #default="{ row }">
            {{ formatTimestamp(row.createdAt, 2) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="160">
          <template #default="{ row }">
            <el-button :icon="View" circle plain type="default" @click="onViewDetail(row)"></el-button>
            <el-button :icon="Delete" circle plain type="danger" @click="onDeletDetail(row)"></el-button>
          </template>
        </el-table-column>
        <template #empty>
          <div class="jel-table-fill__empty">
            <el-empty description="没有数据" />
          </div>
        </template>
      </el-table>
    </div>
    <!-- 页码 -->
    <div class="pager">
      <el-pagination style="margin-top: 20px; justify-content: flex-end" v-model:current-page="params.pageNum"
        v-model:page-size="params.pageSize" :page-sizes="[10, 30, 50, 100]"
        layout="jumper,total, sizes, prev, pager, next " :total="total" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </div>
  </PageContainer>
</template>

<style scoped lang="scss">
.page-container {
  .header {
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    color: $jel-font-title;

    .right {
      display: flex;
      gap: 16px;
    }
  }
}
</style>