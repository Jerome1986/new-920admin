<script lang="ts" setup>
import { phoneSettingAddApi, phoneSettingUpdateApi } from '@/api/product'
import type { PhoneModelListItem } from '@/types/Product'
import { ElMessage } from 'element-plus'
import { ref, reactive } from 'vue'

const emit = defineEmits<{
  success: []
}>()

const visible = ref(false)
const submitting = ref(false)
const form = reactive({
  id: undefined as number | undefined,
  name: '',
})

function openAdd() {
  form.id = undefined
  form.name = ''
  visible.value = true
}

function openEdit(row: PhoneModelListItem) {
  form.id = row.id
  form.name = row.name
  visible.value = true
}

async function handleSubmit() {
  const name = form.name.trim()
  if (!name) return
  submitting.value = true
  try {
    if (form.id != null) {
      await phoneSettingUpdateApi(form.id, name)
      ElMessage.success('已保存')
    } else {
      await phoneSettingAddApi(name)
      ElMessage.success('已新增')
    }
    visible.value = false
    emit('success')
  } finally {
    submitting.value = false
  }
}

defineExpose({ openAdd, openEdit })
</script>

<template>
  <el-dialog v-model="visible" :title="form.id != null ? '编辑型号' : '新增型号'" width="420px" align-center
    append-to-body destroy-on-close :close-on-click-modal="false" @closed="form.name = ''">
    <el-form :model="form" label-width="88px" @submit.prevent>
      <el-form-item label="型号名称" required>
        <el-input v-model="form.name" placeholder="请输入型号名称" maxlength="64" show-word-limit clearable />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>
