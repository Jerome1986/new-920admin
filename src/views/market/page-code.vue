<script setup lang="ts">
import { computed, ref } from 'vue'
import { Download, Picture, Refresh, View } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import { createUserFindMoCodeApi } from '@/api/pageCode'

const loading = ref(false)
const qrCodeUrl = ref('')

const hasQrCode = computed(() => Boolean(qrCodeUrl.value))

const createCode = async () => {
  loading.value = true
  try {
    const res = await createUserFindMoCodeApi()
    qrCodeUrl.value = res.data.qrCodeUrl
    ElMessage.success('二维码生成成功')
  } finally {
    loading.value = false
  }
}

const previewCode = () => {
  if (!qrCodeUrl.value) return
  window.open(qrCodeUrl.value, '_blank', 'noopener,noreferrer')
}

const saveCode = () => {
  if (!qrCodeUrl.value) return

  const link = document.createElement('a')
  link.href = qrCodeUrl.value
  link.download = 'user-find-mo-page-code.png'
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <PageContainer title="小程序码管理">
    <template #extra>
      <el-button type="primary" :loading="loading" :icon="hasQrCode ? Refresh : Picture" @click="createCode">
        {{ hasQrCode ? '重新生成' : '生成二维码' }}
      </el-button>
    </template>

    <div class="page-code">
      <section class="code-panel">
        <div class="code-preview" v-loading="loading">
          <el-image v-if="hasQrCode" class="code-image" :src="qrCodeUrl" fit="contain" :preview-src-list="[qrCodeUrl]"
            preview-teleported />
          <el-empty v-else description="暂无二维码">
            <el-button type="primary" :loading="loading" :icon="Picture" @click="createCode">生成二维码</el-button>
          </el-empty>
        </div>

        <div class="code-actions">
          <el-button :disabled="!hasQrCode" :icon="View" @click="previewCode">查看</el-button>
          <el-button type="primary" :disabled="!hasQrCode" :icon="Download" @click="saveCode">保存</el-button>
        </div>
      </section>

      <section class="info-panel">
        <div class="info-title">扫码找膜小程序码</div>
        <div class="info-desc">
          用于用户扫码进入找膜流程，二维码图片由后端生成并维护。
        </div>
        <el-input v-if="hasQrCode" class="url-input" :model-value="qrCodeUrl" readonly>
          <template #prepend>图片链接</template>
        </el-input>
      </section>
    </div>
  </PageContainer>
</template>

<style scoped lang="scss">
.page-code {
  display: grid;
  grid-template-columns: minmax(320px, 420px) minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

.code-panel,
.info-panel {
  border: 1px solid var(--jel-border);
  border-radius: 8px;
  background: var(--jel-surface);
}

.code-panel {
  padding: 24px;
}

.code-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 360px;
  border: 1px dashed var(--jel-border);
  border-radius: 8px;
  background: var(--jel-surface-muted);
}

.code-image {
  width: min(280px, 100%);
  height: 280px;
}

.code-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}

.info-panel {
  padding: 24px;
}

.info-title {
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 600;
  color: var(--jel-font-title);
}

.info-desc {
  max-width: 560px;
  margin-bottom: 20px;
  color: var(--jel-font-dec2);
  line-height: 1.7;
}

.url-input {
  max-width: 720px;
}

@media (max-width: 900px) {
  .page-code {
    grid-template-columns: 1fr;
  }
}
</style>
