<script lang="ts" setup>
import { userFindAll, userSearchApi } from '@/api/user'
import PageContainer from '@/components/PageContainer.vue'
import type { UserInfo, UserRole } from '@/types/User'
import { formatTimestamp } from '@/utils/formatTimestamp'
import { formatGender, formatName, formatRole } from '@/utils/mapping'
import { Edit, Search } from '@element-plus/icons-vue'
import { onMounted, ref } from 'vue'
import UserChannel from './components/UserChannel.vue'
import type { JelUserChannel } from '@/types/Components'
import { ElMessage } from 'element-plus'


// 弹窗组件
const dialog = ref<JelUserChannel>()
// 分页
const params = ref({
  pageNum: 1,
  pageSize: 10
})

const total = ref(0)

// 条数改变
const handleSizeChange = (size: number) => {
  console.log(size)
  params.value.pageNum = 1
  // 如果搜索有值就请求搜索结果，反之直接渲染
  if (searchValue.value) {
    searchMaterialGet()
  } else {
    userListGet(params.value.pageNum, params.value.pageSize)
  }
}

// 页数改变
const handleCurrentChange = (pageNum: number) => {
  console.log(pageNum)
  if (searchValue.value) {
    searchMaterialGet()
  } else {
    userListGet(params.value.pageNum, params.value.pageSize)
  }
}

// 搜索
const searchValue = ref('')
const searchMaterialGet = async () => {
  loading.value = true
  params.value.pageNum = 1
  const searchRes = await userSearchApi(searchValue.value, params.value.pageNum, params.value.pageSize)
  console.log('search', searchRes)
  userList.value = searchRes.data.list
  total.value = searchRes.data.total
  loading.value = false
}

// 清除搜索
const handleClearSearch = () => {
  params.value.pageNum = 1
  searchValue.value = ''
  userListGet(params.value.pageNum, params.value.pageSize)
}

// 用户数据
const loading = ref(false)
const userList = ref<UserInfo[]>([])
const userListGet = async (pageNum: number, pageSize: number) => {
  loading.value = true
  const res = await userFindAll(pageNum, pageSize)
  userList.value = res.data.list
  total.value = res.data.total
  loading.value = false
}

// 编辑
const onEditChannel = (row: UserInfo) => {
  dialog.value?.open(row)
}

// 提交成功
const handleSuccess = () => {
  console.log('success')
  ElMessage.success('保存成功')
  userListGet(params.value.pageNum, params.value.pageSize)
}

onMounted(() => userListGet(params.value.pageNum, params.value.pageSize))
</script>

<template>
  <!-- 非会员用户 -->
  <PageContainer title="用户列表">
    <div class="user-page">
      <div class="header">
        <div class="search">
          <el-input v-model="searchValue" class="search-input" placeholder="手机号 / 邀请码" clearable
            @clear="handleClearSearch" />
          <el-button type="primary" @click="searchMaterialGet" plain :icon="Search">查询</el-button>
        </div>
      </div>
      <div class="jel-page-table-wrap">
        <el-table :data="userList" class="jel-data-table jel-table-fill" height="100%" style="width: 100%"
          v-loading="loading" border>
          <el-table-column label="序号" align="center" width="60" type="index"></el-table-column>
          <el-table-column label="头像" align="center" prop="avatarUrl" width="80">
            <template #default="{ row }">
              <img style="width: 50px; height: 50px; border-radius: 8px" :src="row.avatarUrl" alt="avatar" />
            </template>
          </el-table-column>
          <el-table-column label="昵称" align="center" prop="nickname" width="120">
            <template #default="{ row }">
              {{ formatName(row.nickname) }}
            </template>
          </el-table-column>
          <el-table-column label="性别" align="center" prop="gender" width="60">
            <template #default="{ row }">
              {{ formatGender(row.gender) }}
            </template>
          </el-table-column>
          <el-table-column label="手机号" align="center" prop="mobile"></el-table-column>
          <el-table-column label="角色" align="center" prop="role">
            <template #default="{ row }">
              {{ formatRole(row.role) }}
            </template>
          </el-table-column>
          <el-table-column label="邀请码" align="center" prop="referralCode"></el-table-column>
          <el-table-column label="上级" align="center">
            <template #default="{ row }">
              {{ row.inviter?.mobile ?? '无' }}
            </template>
          </el-table-column>
          <el-table-column label="积分" align="center" prop="score"> </el-table-column>
          <el-table-column label="注册时间" align="center" prop="createdAt" width="160">
            <template #default="{ row }">
              {{ formatTimestamp(row.createdAt, 2) }}
            </template>
          </el-table-column>
          <el-table-column label="账号状态" align="center" prop="status">
            <template #default="{ row }">
              {{ row.status === 'ACTIVE' ? '正常' : '禁用' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="160">
            <template #default="{ row }">
              <el-button :icon="Edit" circle plain type="primary" @click="onEditChannel(row)"></el-button>
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
        <el-pagination v-model:current-page="params.pageNum" v-model:page-size="params.pageSize"
          :page-sizes="[1, 10, 30, 50, 100]" layout="jumper,total, sizes, prev, pager, next " :total="total"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </div>
  </PageContainer>
  <!-- 编辑组件 -->
  <UserChannel ref="dialog" @success="handleSuccess"></UserChannel>
</template>

<style scoped lang="scss">
/* ---------- 页面骨架：表格占满卡片内剩余高度 ---------- */
.user-page {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.pager {
  flex-shrink: 0;
  margin-top: 16px;
}

/* ---------- 搜索区：与卡片白底一体，细线分隔表格，无整块灰底 ---------- */
.header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid $jel-border;
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

.search :deep(.el-input__wrapper) {
  border-radius: 8px;
  background-color: #fff !important;
  box-shadow: 0 0 0 1px #{$jel-border};
  transition:
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.search :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(148, 163, 184, 0.55);
}

/* ---------- 分页：右对齐（与表格之间不再加横线） ---------- */
.pager :deep(.el-pagination) {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px 0;
}
</style>
