<script lang="ts" setup>
import { updateUserInfoApi } from '@/api/user';
import type { CommonStatus, UserInfo, UserRole } from '@/types/User'
import { ref } from 'vue'

const emit = defineEmits<{
  success: []
}>()

const dialogVisible = ref(false)
const dialogTitle = ref('编辑用户')

const formModel = ref({
  id: '',
  nickname: '',
  mobile: '',
  score: 0,
  gender: 0,
  role: 'USER' as UserRole,
  referralCode: '',
  inviterCode: '',
  status: 'ACTIVE' as CommonStatus,
})


const open = (row?: UserInfo) => {
  dialogTitle.value = row ? '编辑用户' : '新增用户'
  if (row) {
    formModel.value = {
      id: row.id as string,
      nickname: row.nickname as string,
      mobile: row.mobile,
      score: row.score,
      gender: row.gender,
      role: row.role,
      referralCode: row.referralCode ?? '',
      inviterCode: row.inviterCode ?? '',
      status: row.status,
    }
  }
  dialogVisible.value = true
}

const onSubmit = async () => {
  // 更新用户信息
  const update = await updateUserInfoApi(
    formModel.value.id,
    formModel.value.nickname,
    formModel.value.gender,
    formModel.value.score,
    formModel.value.status
  )
  console.log('upUserInfo', update)

  emit('success')
  dialogVisible.value = false
}

defineExpose({ open })
</script>

<template>
  <div class="user-channel">
    <el-dialog v-model="dialogVisible" :title="dialogTitle" class="user-channel-dialog jel-dialog-fixed-shell"
      align-center append-to-body destroy-on-close :close-on-click-modal="false">
      <div class="user-channel-dialog__scroll">
        <el-form ref="formRef" :model="formModel" label-position="right" label-width="100px" class="user-channel-form">
          <el-form-item label="微信昵称" prop="nickname">
            <el-input v-model="formModel.nickname" placeholder="请输入真实姓名" maxlength="32" show-word-limit />
          </el-form-item>

          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="formModel.mobile" placeholder="请输入手机号" disabled />
          </el-form-item>

          <el-form-item label="积分" prop="score">
            <el-input-number v-model="formModel.score" :min="0" :max="99999999" :step="1" controls-position="right"
              class="user-channel-form__number" />
          </el-form-item>

          <el-form-item label="性别" prop="gender">
            <el-select v-model="formModel.gender" placeholder="请选择性别" clearable>
              <el-option :value="0" label="未知" />
              <el-option :value="1" label="男" />
              <el-option :value="2" label="女" />
            </el-select>
          </el-form-item>

          <el-form-item label="角色" prop="role">
            <el-select v-model="formModel.role" placeholder="请选择角色" disabled>
              <el-option value="USER" label="普通用户" />
              <el-option value="VIP" label="会员" />
              <el-option value="MANAGER" label="店长" />
            </el-select>
          </el-form-item>

          <el-form-item label="邀请码" prop="referralCode">
            <el-input v-model="formModel.referralCode" placeholder="邀请码" disabled />
          </el-form-item>

          <el-form-item label="上级邀请码" prop="inviterCode">
            <el-input v-model="formModel.inviterCode" placeholder="上级邀请码" disabled />
          </el-form-item>

          <el-form-item label="账号状态" prop="status">
            <el-select v-model="formModel.status" placeholder="请选择账号状态">
              <el-option value="ACTIVE" label="正常" />
              <el-option value="INACTIVE" label="禁用" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="user-channel-dialog__footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="onSubmit">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
/* 宽度由全局 .jel-dialog-fixed-shell + --jel-dialog-fixed-width；本组件只负责圆角与阴影 */
.user-channel-dialog {
  :deep(.el-dialog) {
    padding: 0;
    border-radius: 12px;
    overflow: hidden;
    box-shadow:
      0 12px 32px rgba(15, 23, 42, 0.12),
      0 2px 8px rgba(15, 23, 42, 0.06);
  }

  :deep(.el-dialog__header) {
    padding: 16px 20px;
    margin-right: 0;
    border-bottom: 1px solid $jel-border;
    background: $jel-surface;
  }

  :deep(.el-dialog__title) {
    font-size: 16px;
    font-weight: 600;
    line-height: 1.4;
    color: $jel-font-title;
  }

  :deep(.el-dialog__headerbtn) {
    top: 4px;
    width: 40px;
    height: 40px;
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }

  :deep(.el-dialog__footer) {
    padding: 0;
  }
}

.user-channel-dialog__scroll {
  box-sizing: border-box;
  width: 100%;
  height: $jel-dialog-body-fixed-height;
  padding: 20px 20px 8px;
  overflow-x: hidden;
  overflow-y: auto;
  background: $jel-surface;

  /* 滚动条与页面主色协调 */
  scrollbar-width: thin;
  scrollbar-color: rgba($jel-font-dec2, 0.45) transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba($jel-font-dec2, 0.35);
    border-radius: 6px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: rgba($jel-font-dec2, 0.55);
  }
}

.user-channel-form {
  padding-right: 4px;

  :deep(.el-form-item) {
    margin-bottom: 18px;
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
    color: $jel-font-dec2;
  }

  :deep(.el-input__wrapper),
  :deep(.el-select .el-input__wrapper) {
    border-radius: 8px;
    background-color: #fff !important;
    box-shadow: 0 0 0 1px #{$jel-border};
    transition:
      box-shadow 0.2s ease,
      border-color 0.2s ease;
  }

  :deep(.el-input__wrapper:hover),
  :deep(.el-select .el-input__wrapper:hover) {
    box-shadow: 0 0 0 1px rgba(148, 163, 184, 0.55);
  }

  :deep(.el-input__wrapper.is-focus),
  :deep(.el-select .el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px rgba($jel-brandColor, 0.45);
  }

  :deep(.el-input.is-disabled .el-input__wrapper) {
    background-color: $jel-surface-muted !important;
    box-shadow: 0 0 0 1px #{$jel-border};
  }

  :deep(.el-select),
  :deep(.el-input) {
    width: 100%;
  }
}

.user-channel-form__number {
  width: 100%;

  :deep(.el-input__wrapper) {
    padding-left: 12px;
  }
}

.user-channel-dialog__footer {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
  padding: 12px 20px;
  background: $jel-surface-muted;
  border-top: 1px solid $jel-border;
}
</style>
