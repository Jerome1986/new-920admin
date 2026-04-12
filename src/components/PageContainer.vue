<script setup lang="ts">
defineProps({
  title: {
    required: true,
    type: String
  }
})

defineSlots<{ default?: () => void; extra?: () => void; titleExtra?: () => void }>()
</script>

<template>
  <el-card class="page-container">
    <template #header>
      <div class="header">
        <div class="header-title">
          <span class="header-title__text">{{ title }}</span>
          <div v-if="$slots.titleExtra" class="header-title__extra">
            <slot name="titleExtra"></slot>
          </div>
        </div>
        <div class="extra">
          <slot name="extra"></slot>
        </div>
      </div>
    </template>
    <slot></slot>
  </el-card>
</template>

<style lang="scss" scoped>
/* 占满内容区剩余高度，供列表页表格 height:100% 使用 */
.page-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  min-height: 0;
  box-sizing: border-box;

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    min-width: 0;
  }

  .header-title {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px 12px;
    min-width: 0;
  }

  .header-title__text {
    font-size: 16px;
    font-weight: 600;
    color: var(--jel-font-title, #1e293b);
  }

  .header-title__extra {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }
}

:deep(.el-card__body) {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}
</style>
