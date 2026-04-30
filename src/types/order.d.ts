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

/** 订单商品行（order_product） */
export interface OrderProductItem {
  id: string
  orderId: string
  productId: number
  model: string | null
  skuNo: string
  name: string
  price: string
  quantity: number
  image: string | null
  skuId: number | null
  skuName: string | null
}

/** 订单收货地址（order_address） */
export interface OrderAddressItem {
  id: string
  orderId: string
  name: string
  mobile: string
  province: string
  city: string
  county: string
  postalCode: string | null
  nationalCode: string | null
  detail: string
}

/** 商品订单详情：主表 + 明细 + 地址 */
export interface OrderDetail extends OrderListItem {
  products: OrderProductItem[]
  address: OrderAddressItem | null
}

