<script lang="ts" setup>
import { vipPorductDetailApi, vipProductAddApi, vipProductUpdateApi } from '@/api/product'
import PageContainer from '@/components/PageContainer.vue'
import type { CommonStatus } from '@/types/User'
import type { VipPlanListItem } from '@/types/VipPlan'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// 路由：返回商品管理
const router = useRouter()
const route = useRoute()

// 页头标题（会员套餐无详情，仅新增）


const planId = computed(() => {
  const raw = route.query.id
  return Number(raw)
})

const pageTitle = computed(() => planId.value ? '编辑套餐' : '新增套餐')

// 会员套餐表单字段
const form = ref({
  level: 1,
  levelText: '',
  price: '',
  discount: 0,
  term: '',
  rights: '',
  status: 'ACTIVE' as CommonStatus,
  cashbackRate: 0,
  maxUsers: 0,
  limit: 0,
})

// 回填信息
function applyDetail(d: VipPlanListItem) {
  const { id, createdAt, updatedAt, ...rest } = d
  form.value = { ...form.value, ...rest }
}

// 返回商品列表（会员 Tab）
function goBack() {
  router.push({ path: '/goods', query: { tab: 'VIP' } })
}

// 提交保存（接口待接）
async function handleSubmit() {
  // 待接保存接口
  if (!planId.value) {
    await vipProductAddApi(form.value)
    ElMessage.success('新增成功')
  } else {
    const result = await vipProductUpdateApi(planId.value, form.value)
    console.log('update', result)

    ElMessage.success('保存成功')
  }
  router.push({ path: '/goods', query: { tab: 'VIP' } })
}

const pageLoading = ref(false)
onMounted(async () => {
  console.log('id', planId.value)
  if (planId.value) {
    pageLoading.value = true
    try {
      const detail = await vipPorductDetailApi(planId.value)
      applyDetail(detail.data)
    } finally {
      pageLoading.value = false
    }
  }
})
</script>

<template>
  <PageContainer :title="pageTitle">
    <template #titleExtra>
      <el-button :icon="ArrowLeft" text type="primary" @click="goBack">返回列表</el-button>
    </template>

    <div class="vip-plan-form-page" v-loading="pageLoading" element-loading-text="加载中...">
      <el-form label-width="120px" class="vip-plan-form" @submit.prevent>
        <section class="vf-section">
          <h3 class="vf-section__title">套餐信息</h3>
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <el-form-item label="等级数值" required>
                <el-input-number v-model="form.level" :min="1" :step="1" controls-position="right"
                  style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="等级名称" required>
                <el-input v-model="form.levelText" placeholder="如：黄金会员" maxlength="64" show-word-limit />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="价格" required>
                <el-input v-model="form.price" placeholder="套餐售价" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="会员折扣">
                <el-input-number v-model="form.discount" :min="0" :max="1" :precision="2" :step="0.01"
                  style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="套餐期限">
                <el-input v-model="form.term" placeholder="如：12 个月" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="状态">
                <el-select v-model="form.status" placeholder="状态" style="width: 100%">
                  <el-option label="启用" value="ACTIVE" />
                  <el-option label="停用" value="INACTIVE" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="权益说明">
                <el-input v-model="form.rights" type="textarea" :rows="4" placeholder="套餐包含的权益描述" maxlength="2000"
                  show-word-limit />
              </el-form-item>
            </el-col>
          </el-row>
        </section>

        <section class="vf-section">
          <h3 class="vf-section__title">规则与限制</h3>
          <el-row :gutter="20">
            <el-col :xs="24" :md="8">
              <el-form-item label="返现比例">
                <el-input-number v-model="form.cashbackRate" :min="0" :precision="2" :step="0.01" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="8">
              <el-form-item label="最大人数">
                <el-input-number v-model="form.maxUsers" :min="0" :step="1" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="8">
              <el-form-item label="每月限制">
                <el-input-number v-model="form.limit" :min="0" :step="1" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
        </section>

        <section class="vf-section vf-actions">
          <el-button @click="goBack">取消</el-button>
          <el-button type="primary" @click="handleSubmit">保存</el-button>
        </section>
      </el-form>
    </div>
  </PageContainer>
</template>

<style scoped lang="scss">
.vip-plan-form-page {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding-right: 4px;
}

.vip-plan-form {
  max-width: 880px;
}

.vf-section {
  margin-bottom: 28px;

  &:last-of-type {
    margin-bottom: 0;
  }
}

.vf-section__title {
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.vf-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
