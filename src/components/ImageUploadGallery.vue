<script lang="ts" setup>
import { UPLOAD_ACTION, parseUploadResponseUrl } from '@/api/upload'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { UploadFile, UploadProps, UploadUserFile } from 'element-plus'
import { computed, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string[]
    limit?: number
    /** 显示在上传区域下方的说明文案 */
    hint?: string
  }>(),
  { limit: 9 }
)

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const fileList = ref<UploadUserFile[]>([])

watch(
  () => props.modelValue,
  (urls) => {
    fileList.value = (urls ?? []).map((url, i) => ({
      name: `img-${i}`,
      url,
    }))
  },
  { immediate: true, deep: true }
)

const remain = computed(() => Math.max(0, props.limit - (props.modelValue?.length ?? 0)))

const handleSuccess: UploadProps['onSuccess'] = (response) => {
  const url = parseUploadResponseUrl(response)
  if (!url) {
    ElMessage.error('上传成功但未解析到图片地址，请检查接口返回')
    return
  }
  emit('update:modelValue', [...(props.modelValue ?? []), url])
}

const handleError: UploadProps['onError'] = () => {
  ElMessage.error('上传失败')
}

const handleRemove: UploadProps['onRemove'] = (file: UploadFile) => {
  const url =
    file.url ??
    parseUploadResponseUrl(file.response) ??
    undefined
  if (url) {
    emit(
      'update:modelValue',
      (props.modelValue ?? []).filter((u) => u !== url)
    )
  } else {
    emit('update:modelValue', (props.modelValue ?? []).slice(0, -1))
  }
}
</script>

<template>
  <div class="image-upload-field">
    <el-upload
      :action="UPLOAD_ACTION"
      name="file"
      :file-list="fileList"
      list-type="picture-card"
      :limit="limit"
      accept="image/*"
      multiple
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-remove="handleRemove"
      class="image-upload-gallery"
    >
      <el-icon v-if="remain > 0"><Plus /></el-icon>
    </el-upload>
    <p v-if="hint" class="image-upload-hint">{{ hint }}</p>
  </div>
</template>

<style scoped lang="scss">
.image-upload-field {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 100%;
}

.image-upload-hint {
  margin: 8px 0 0;
  font-size: 12px;
  line-height: 1.45;
  color: var(--el-text-color-secondary);
  max-width: 100%;
}

.image-upload-gallery :deep(.el-upload) {
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
}

.image-upload-gallery :deep(.el-upload-list--picture-card .el-upload-list__item) {
  border-radius: 8px;
}
</style>
