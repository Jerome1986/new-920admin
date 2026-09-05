// 结算状态：待结算 / 已结算 / 已取消 / 已退款
export type SettlementStatus = 'PENDING' | 'SETTLED' | 'CANCELLED' | 'REFUNDED'

// 结算记录列表项：对应后端 SettlementRecord 表结构
export interface SettlementRecordItem {
  id: number
  storeId: string
  managerId: string
  managerPhone: string
  orderId: string
  orderAmount: number | string
  platformRate: number | string
  platformFee: number | string
  managerIncome: number | string
  totalCommission: number | string
  status: SettlementStatus
  settledAt: Date | string | null
  createdAt: Date | string
}

// 结算记录查询参数：对应结算列表筛选与分页
export interface SettlementRecordQuery {
  pageNum: number
  pageSize: number
  status?: SettlementStatus | 'ALL'
  keyword?: string
  createdStartAt?: string
  createdEndAt?: string
}
