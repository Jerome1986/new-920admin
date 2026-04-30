<script lang="ts" setup>
// VIP 订单占位区：仅展示空态，与商品订单表格区分
</script>

<template>
  <div class="order-vip-blank" />
</template>

<style scoped lang="scss">
// VIP 订单：空白占位区域样式
.order-vip-blank {
  flex: 1;
  min-height: 240px;
  border-radius: 8px;
  border: 1px dashed $jel-border;
  background: $jel-surface-muted;
}
</style>
