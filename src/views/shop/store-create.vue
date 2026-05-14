<script lang="ts" setup>
import { stockModelFindAll } from '@/api/stockModel'
import { storeCreateApi } from '@/api/store'
import { userFindAll } from '@/api/user'
import PageContainer from '@/components/PageContainer.vue'
import type { StoreCreateForm } from '@/types/store'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 表单字段（提交时对接接口）
const form = ref<StoreCreateForm>({
  name: '',
  address: '',
  phone: '',
  managerId: '',
  managerName: '',
  managerLevel: 'MANAGER_PRIMARY',
  inventoryTemplateId: '',
})

// 店长候选：用户列表（接口待接）
const managerUserOptions = ref<{ label: string; value: string | number }[]>([])

const managerLevelOptions = [
  { label: '基础店长', value: 'MANAGER_PRIMARY' },
  { label: '高级店长', value: 'MANAGER_SENIOR' },
]

// 库存模板下拉（接口待接）
const stockTemplateOptions = ref<{ label: string; value: string | number }[]>([])

// 拉取用户列表供店长选择
const loadManagerUserOptions = async () => {
  console.log('loadManagerUserOptions')
  const user = await userFindAll(1, 1000)
  managerUserOptions.value = user.data.list.map(u => ({
    label: u.mobile,
    value: u.id
  }))
}
const options = ref<{ label: string; value: string | number }[]>([])
const loading = ref(false)
const remoteMethod = (query: string) => {
  console.log(query)

  if (query) {
    loading.value = true
    setTimeout(() => {
      loading.value = false
      options.value = managerUserOptions.value.filter((item) => {
        return item.label.toLowerCase().includes(query.toLowerCase().trim())
      })
    }, 1000)
  } else {
    options.value = []
  }
}

// 拉取库存模板列表
const loadStockTemplateOptions = async () => {
  console.log('loadStockTemplateOptions')
  const res = await stockModelFindAll()
  stockTemplateOptions.value = res.data.map(model => ({
    label: model.name,
    value: model.id
  }))
}

// 返回门店列表
const goBack = () => {
  router.push('/shop')
}

// 提交新增门店
const handleSubmit = async () => {
  console.log('submit store', form.value)
  const res = await storeCreateApi(form.value)
  if (res.code === 200) {
    ElMessage.success('新增成功')
    goBack()
  } else {
    ElMessage.error('新增失败')
  }
}

onMounted(() => {
  loadManagerUserOptions()
  loadStockTemplateOptions()
})
</script>

<template>
  <PageContainer title="新增门店">
    <template #titleExtra>
      <el-button :icon="ArrowLeft" text type="primary" @click="goBack">返回列表</el-button>
    </template>

    <div class="store-create-page">
      <el-form label-width="120px" class="store-create-form" @submit.prevent>
        <section class="sc-section">
          <h3 class="sc-section__title">门店信息</h3>
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <el-form-item label="门店名称" required>
                <el-input v-model="form.name" placeholder="请输入门店名称" maxlength="64" show-word-limit clearable />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="联系电话" required>
                <el-input v-model="form.phone" placeholder="请输入联系电话" maxlength="20" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="门店地址" required>
                <el-input v-model="form.address" type="textarea" :rows="3" placeholder="请输入门店详细地址" maxlength="200"
                  show-word-limit />
              </el-form-item>
            </el-col>
          </el-row>
        </section>

        <section class="sc-section">
          <h3 class="sc-section__title">店长与库存</h3>
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <el-form-item label="店长选择" required>
                <el-select-v2 v-model="form.managerId" clearable filterable remote reserve-keyword
                  placeholder="请输入店长平台注册的电话" :remote-method="remoteMethod" :loading="loading" :options="options"
                  style="width: 240px">
                  <template #loading>
                    <svg class="circular" viewBox="0 0 50 50">
                      <circle class="path" cx="25" cy="25" r="20" fill="none" />
                    </svg>
                  </template>
                </el-select-v2>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="店长姓名">
                <el-input v-model="form.managerName" placeholder="请输入店长真实姓名" maxlength="32" show-word-limit clearable />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="店长等级" required>
                <el-select v-model="form.managerLevel" placeholder="请选择店长等级" clearable style="width: 100%">
                  <el-option v-for="opt in managerLevelOptions" :key="opt.value" :label="opt.label"
                    :value="opt.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="初始化库存">
                <el-select v-model="form.inventoryTemplateId" placeholder="请选择库存模版" clearable style="width: 100%">
                  <el-option v-for="opt in stockTemplateOptions" :key="opt.value" :label="opt.label"
                    :value="opt.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </section>

        <section class="sc-section sc-actions">
          <el-button @click="goBack">取消</el-button>
          <el-button type="primary" @click="handleSubmit">保存</el-button>
        </section>
      </el-form>
    </div>
  </PageContainer>
</template>

<style scoped lang="scss">
.store-create-page {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding-right: 4px;
}

.store-create-form {
  max-width: 880px;
}

.sc-section {
  margin-bottom: 28px;

  &:last-of-type {
    margin-bottom: 0;
  }
}

.sc-section__title {
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.sc-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.el-select-dropdown__loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  font-size: 20px;
}

/*下拉框加载动画*/
.circular {
  display: inline;
  height: 30px;
  width: 30px;
  animation: loading-rotate 2s linear infinite;
}

.path {
  animation: loading-dash 1.5s ease-in-out infinite;
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  stroke-width: 2;
  stroke: var(--el-color-primary);
  stroke-linecap: round;
}

.loading-path .dot1 {
  transform: translate(3.75px, 3.75px);
  fill: var(--el-color-primary);
  animation: custom-spin-move 1s infinite linear alternate;
  opacity: 0.3;
}

.loading-path .dot2 {
  transform: translate(calc(100% - 3.75px), 3.75px);
  fill: var(--el-color-primary);
  animation: custom-spin-move 1s infinite linear alternate;
  opacity: 0.3;
  animation-delay: 0.4s;
}

.loading-path .dot3 {
  transform: translate(3.75px, calc(100% - 3.75px));
  fill: var(--el-color-primary);
  animation: custom-spin-move 1s infinite linear alternate;
  opacity: 0.3;
  animation-delay: 1.2s;
}

.loading-path .dot4 {
  transform: translate(calc(100% - 3.75px), calc(100% - 3.75px));
  fill: var(--el-color-primary);
  animation: custom-spin-move 1s infinite linear alternate;
  opacity: 0.3;
  animation-delay: 0.8s;
}

@keyframes loading-rotate {
  to {
    transform: rotate(360deg);
  }
}

@keyframes loading-dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -40px;
  }

  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -120px;
  }
}

@keyframes custom-spin-move {
  to {
    opacity: 1;
  }
}
</style>
