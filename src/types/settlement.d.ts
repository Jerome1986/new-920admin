// 结算状态：待结算 / 已结算 / 已取消 / 已退款
export type SettlementStatus = 'PENDING' | 'SETTLED' | 'CANCELLED' | 'REFUNDED'

// 结算记录列表项：对应后端 SettlementRecord 表结构
export interface SettlementRecordItem {
  id: number
  storeId: string
  managerId: string
  orderId: string
  orderAmount: number
  platformRate: number
  platformFee: number
  managerIncome: number
  totalCommission: number
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
