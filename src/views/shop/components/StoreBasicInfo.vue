<script setup lang="ts">
import { Check, CircleClose, EditPen, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import type { ManagerLevel, StoreDetail } from '@/types/store';
import { removeStoreManagerApi, setStoreManagerApi, storeEditBasicInfoApi } from '@/api/store';
import { formatTimestamp } from '@/utils/formatTimestamp';


const props = withDefaults(defineProps<{
  storeBasic?: StoreDetail
}>(), {})

/** 是否处于「编辑门店」内联编辑（门店名称 / 联系电话 / 门店地址） */
const isEditingStore = ref(false)

/** 进入编辑前快照，用于取消还原 */
const editFormSnapshot = ref(null)

/** 店长操作弹窗：remove 解除 | assign 设定 */
type DialogMode = 'remove' | 'assign'
const managerDialogVisible = ref(false)
const managerDialogMode = ref<DialogMode>('assign')

/** 当前店长展示（接接口后与详情同步；空表示无店长） */
const managerName = ref(props.storeBasic?.managerName)
const managerPhone = ref(props.storeBasic?.manager?.mobile)
const managerLevel = ref<ManagerLevel | ''>('MANAGER_PRIMARY')

const managerLevelOptions: { label: string; value: ManagerLevel }[] = [
  { label: '基础店长', value: 'MANAGER_PRIMARY' },
  { label: '高级店长', value: 'MANAGER_SENIOR' },
]

const hasManager = computed(() => !!(managerName.value))

/** 编辑表单 */
const editForm = ref({ ...props.storeBasic })


// 开始编辑
function startEditStore() {
  console.log(editForm.value);
  editFormSnapshot.value = JSON.parse(JSON.stringify(editForm.value))
  isEditingStore.value = true
}

// 取消编辑
function cancelEditStore() {
  if (editFormSnapshot.value) {
    editForm.value = JSON.parse(JSON.stringify(editFormSnapshot.value))
  }
  isEditingStore.value = false
  editFormSnapshot.value = null
}

const emits = defineEmits(['updateManager'])

// 保存编辑
async function saveEditStore() {
  console.log('edit')
  // 1.验证表单
  if (!editForm.value.name) {
    ElMessage.error('门店名称不可为空')
    return
  }

  if (!editForm.value.address) {
    ElMessage.error('门店地址不可为空')
    return
  }

  if (!editForm.value.phone) {
    ElMessage.error('门店地址不可为空')
    return
  }

  // 2.提交保存
  if (props.storeBasic?.id) {
    console.log('id', props.storeBasic?.id);

    try {
      await storeEditBasicInfoApi(
        props.storeBasic?.id,
        editForm.value.name,
        editForm.value.address,
        editForm.value.phone
      )
    } catch (err) {
      console.error(err)
      return
    }
  } else {
    ElMessage.error('缺少门店ID')
    return
  }
  ElMessage.success('已保存')
  isEditingStore.value = false
  editFormSnapshot.value = null
}

// 设定/解除店长
function openManagerDialog(mode: DialogMode) {
  managerDialogMode.value = mode
  managerDialogVisible.value = true
}

// 提交店长信息
async function submitManagerDialog() {
  // 先确保门店存在
  if (!props.storeBasic) return
  const storeId = props.storeBasic.id

  // 1. 移除店长模式
  if (managerDialogMode.value === 'remove') {
    try {
      await removeStoreManagerApi(storeId, props.storeBasic?.managerId)
      managerName.value = ''
      managerPhone.value = ''
      ElMessage.success('解除店长成功')
      managerDialogVisible.value = false
    } catch (err) {
      console.error(err)
    }
    return
  }

  // 2. 设置店长模式
  if (!managerName.value) {
    ElMessage.error('店长名称不可为空')
    return
  }

  if (!managerPhone.value) {
    ElMessage.error('店长电话不可为空')
    return
  }

  const selectedManagerLevel = managerLevel.value
  if (!selectedManagerLevel) {
    ElMessage.error('请选择店长等级')
    return
  }

  // 提交
  try {
    await setStoreManagerApi(storeId, managerName.value, managerPhone.value, selectedManagerLevel)
    ElMessage.success('设置店长成功')
    managerDialogVisible.value = false
  } catch (err) {
    console.error('设置店长失败', err)
    ElMessage.error('设置店长失败')
  }
  emits('updateManager')
}

</script>

<template>
  <div class="sd-panel sd-panel--basic">
    <header class="sd-basic__head">
      <div class="sd-basic__head-text">
        <h3 class="sd-basic__head-title">门店档案</h3>
        <p class="sd-basic__head-desc">
          <template v-if="!isEditingStore">
            以下为当前门店资料；门店名称、电话、地址请在「门店与联系」右侧编辑。
            <template v-if="hasManager">已有店长时点「解除店长」可取消店长身份。</template>
            <template v-else>尚无店长时点「设定店长」从用户列表中指定。</template>
          </template>
          <template v-else>正在编辑「门店与联系」中的名称、电话与地址，完成后请在同一行点「保存」或「取消」。</template>
        </p>
      </div>
    </header>

    <el-descriptions :column="2" border size="default" class="sd-desc sd-desc--with-extra">
      <template #title>门店与联系</template>
      <template #extra>
        <div class="sd-desc__extra-actions">
          <template v-if="!isEditingStore">
            <el-button type="primary" size="small" :icon="EditPen" @click="startEditStore">编辑门店</el-button>
          </template>
          <template v-else>
            <el-button size="small" @click="cancelEditStore">取消</el-button>
            <el-button type="primary" size="small" :icon="Check" @click="saveEditStore">保存</el-button>
          </template>
        </div>
      </template>
      <el-descriptions-item label="内部 ID" :span="2">
        <span class="sd-desc-mono">{{ editForm.id }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="门店名称">
        <el-input v-if="isEditingStore" v-model="editForm.name" maxlength="64" show-word-limit placeholder="请输入门店名称"
          class="sd-desc-field" />
        <template v-else>{{ editForm.name }}</template>
      </el-descriptions-item>
      <el-descriptions-item label="经营状态">
        <el-tag type="success" size="small" effect="light">{{ editForm.status }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="联系电话">
        <el-input v-if="isEditingStore" v-model="editForm.phone" maxlength="20" placeholder="请输入联系电话"
          class="sd-desc-field" />
        <template v-else>{{ editForm.phone }}</template>
      </el-descriptions-item>
      <el-descriptions-item label="门店地址" :span="2">
        <el-input v-if="isEditingStore" v-model="editForm.address" type="textarea" :rows="3" maxlength="200"
          show-word-limit placeholder="请输入详细地址" class="sd-desc-field" />
        <template v-else>{{ editForm.address }}</template>
      </el-descriptions-item>
    </el-descriptions>

    <el-descriptions :column="2" border size="large" class="sd-desc sd-desc--with-extra">
      <template #title>店长</template>
      <template #extra>
        <div v-if="!isEditingStore" class="sd-desc__extra-actions">
          <el-button v-if="hasManager" type="danger" plain size="small" :icon="CircleClose"
            @click="openManagerDialog('remove')">
            解除店长
          </el-button>
          <el-button v-else type="primary" plain size="small" :icon="User" @click="openManagerDialog('assign')">
            设定店长
          </el-button>
        </div>
      </template>
      <el-descriptions-item label="店长姓名">{{ managerName || '—' }}</el-descriptions-item>
      <el-descriptions-item label="店长电话">{{ managerPhone || '—' }}</el-descriptions-item>
    </el-descriptions>

    <!-- <el-descriptions title="组织关系" :column="1" border size="large" class="sd-desc">
      <el-descriptions-item label="上级门店 ID">
        <span class="sd-desc-mono">{{ storeBasicDemo.parentLabel }}</span>
      </el-descriptions-item>
    </el-descriptions> -->

    <el-descriptions title="形象与收款" :column="1" border size="large" class="sd-desc">
      <el-descriptions-item label="门店 Logo">
        <div class="sd-desc-media" v-if="storeBasic?.logo">
          <img :src="storeBasic?.logo" alt="" />
        </div>
      </el-descriptions-item>
      <el-descriptions-item label="收款二维码">
        <div class="sd-desc-media sd-desc-media--qr" v-if="storeBasic?.qrCodeUrl">
          <img :src="storeBasic?.qrCodeUrl" alt="" />
        </div>
      </el-descriptions-item>
    </el-descriptions>

    <el-descriptions title="库存与账务" :column="2" border size="large" class="sd-desc">
      <el-descriptions-item label="库存模板">{{ editForm.inventoryModel?.name }}</el-descriptions-item>
      <el-descriptions-item label="待结算金额">
        <span class="sd-desc-money">{{ Number(editForm.manager?.settle_balance ?? 0).toFixed(2) }}</span>
      </el-descriptions-item>
    </el-descriptions>

    <el-descriptions title="系统时间" :column="2" border size="large" class="sd-desc sd-desc--last">
      <el-descriptions-item label="创建时间">{{ formatTimestamp(editForm.createdAt!, 2) }}</el-descriptions-item>
      <el-descriptions-item label="更新时间">{{ formatTimestamp(editForm.updatedAt!, 2) }}</el-descriptions-item>
    </el-descriptions>

    <!-- 解除店长 / 设定店长 -->
    <el-dialog v-model="managerDialogVisible" :title="managerDialogMode === 'remove' ? '解除店长' : '设定店长'"
      width="min(440px, 92vw)" align-center destroy-on-close>
      <template v-if="managerDialogMode === 'remove'">
        <p class="sd-dialog-lead">
          确认解除当前门店店长「<strong>{{ managerName }}</strong>」？解除后将不再拥有店长权限，可稍后再「设定店长」。
        </p>
        <el-alert type="warning" :closable="false" show-icon>演示：确认后本地清空展示，请对接解除店长接口。</el-alert>
      </template>
      <template v-else>
        <p class="sd-dialog-lead">该门店尚无店长，请从用户列表中选择一人担任店长。根据电话匹配，如无注册不可设置为店长。</p>
        <el-form label-width="96px">
          <el-form-item label="店长" required>
            <el-input v-model="managerPhone" placeholder="请输入电话"></el-input>
          </el-form-item>
          <el-form-item label="姓名" required>
            <el-input v-model="managerName" placeholder="请输入真实姓名"></el-input>
          </el-form-item>
          <el-form-item label="等级" required>
            <el-select v-model="managerLevel" placeholder="请选择店长等级" clearable style="width: 100%">
              <el-option v-for="opt in managerLevelOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <el-button @click="managerDialogVisible = false">取消</el-button>
        <el-button :type="managerDialogMode === 'remove' ? 'danger' : 'primary'" @click="submitManagerDialog">
          {{ managerDialogMode === 'remove' ? '确认解除' : '确定' }}
        </el-button>
      </template>
    </el-dialog>
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

.sd-panel--basic {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-bottom: 8px;
}

.sd-basic__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px 20px;
  margin-bottom: 18px;
  padding: 14px 16px;
  border-radius: 10px;
  background: $jel-surface-muted;
  border: 1px solid $jel-border;
}

.sd-basic__head-text {
  flex: 1;
  min-width: 200px;
}

.sd-basic__head-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: $jel-font-title;
}

.sd-basic__head-desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: $jel-font-dec2;
}

.sd-desc--with-extra :deep(.el-descriptions__header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.sd-desc--with-extra :deep(.el-descriptions__title) {
  flex: 1;
  min-width: 0;
}

.sd-desc__extra-actions {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.sd-desc-field {
  width: 100%;
}

.sd-desc-field :deep(.el-input__wrapper),
.sd-desc-field :deep(.el-textarea__inner) {
  width: 100%;
}

.sd-dialog-lead {
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.5;
  color: $jel-font-dec2;
}

.sd-desc {
  margin-bottom: 18px;

  &:last-child,
  &.sd-desc--last {
    margin-bottom: 0;
  }

  :deep(.el-descriptions__header) {
    margin-bottom: 12px;
  }

  :deep(.el-descriptions__title) {
    font-size: 14px;
    font-weight: 600;
    color: $jel-font-title;
  }

  :deep(.el-descriptions__label) {
    width: 128px !important;
    max-width: 40%;
    color: $jel-font-dec2 !important;
    font-weight: 500 !important;
    background-color: $jel-surface-muted !important;
  }

  :deep(.el-descriptions__content) {
    color: $jel-font-title !important;
    word-break: break-word;
  }

  :deep(.el-descriptions__cell) {
    padding-bottom: 12px !important;
  }
}

.sd-desc-mono {
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 13px;
}

.sd-desc-money {
  font-size: 16px;
  font-weight: 600;
  color: $jel-brandColor;
  font-variant-numeric: tabular-nums;
}

.sd-desc-media {
  display: inline-block;
  max-width: 200px;
  margin-top: 4px;
  border-radius: 8px;
  border: 1px solid $jel-border;
  overflow: hidden;
  background: $jel-surface;

  img {
    display: block;
    width: 100%;
    height: auto;
  }
}

.sd-desc-media--qr {
  max-width: 160px;
}
</style>
