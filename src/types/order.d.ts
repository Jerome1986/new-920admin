/** 与后端 Prisma Order / 枚举对齐（商品订单） */

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'PROCESSING'
  | 'REFUNDED'

export type OrderPaymentMethod = 'wechat' | 'alipay' | 'balance'

export type OrderTarget = 'TOC' | 'TOB' | 'ALL'

/** 列表页行（主表字段子集，对接接口后可直接映射） */
export interface OrderListItem {
  id: string
  outTradeNo: string
  transactionId: string | null
  status: OrderStatus
  target: OrderTarget
  openid: string
  userId: string
  nickname: string
  mobile: string
  avatarUrl: string | null
  totalCount: number
  totalPrice: string
  deductAmount: string
  actualPayment: string
  usedScore: number | null
  paymentMethod: OrderPaymentMethod | null
  paymentNo: string | null
  remark: string | null
  createdAt: string
  paidAt: string | null
  shippedAt: string | null
  completedAt: string | null
  cancelledAt: string | null
  cancelReason: string | null
  updatedAt: string
}
