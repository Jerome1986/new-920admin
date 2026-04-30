/**
 * 订单模块：状态 / 范围 / 支付 等展示文案与 Tag 映射（列表、详情、表格共用）
 */
import type { OrderPaymentMethod, OrderStatus, OrderTarget } from '@/types/order'

export const orderStatusLabel: Record<OrderStatus, string> = {
  PENDING: '待支付',
  PAID: '已支付',
  SHIPPED: '已发货',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  PROCESSING: '处理中',
  REFUNDED: '已退款',
}

export type OrderStatusTagType = 'success' | 'warning' | 'info' | 'danger' | 'primary'

export function orderStatusTagType(s: OrderStatus): OrderStatusTagType {
  const map: Record<OrderStatus, OrderStatusTagType> = {
    PENDING: 'warning',
    PAID: 'success',
    SHIPPED: 'primary',
    COMPLETED: 'success',
    CANCELLED: 'info',
    PROCESSING: 'warning',
    REFUNDED: 'danger',
  }
  return map[s]
}

export const orderTargetLabel: Record<OrderTarget, string> = {
  TOC: 'C端',
  TOB: 'B端',
  ALL: '全部',
}

export const orderPaymentLabel: Record<OrderPaymentMethod, string> = {
  wechat: '微信',
  alipay: '支付宝',
  balance: '余额',
}

export function formatOrderStatusLabel(s: OrderStatus): string {
  return orderStatusLabel[s]
}

export function formatOrderPaymentLabel(p: OrderPaymentMethod | null | undefined): string {
  return p ? orderPaymentLabel[p] : '—'
}
