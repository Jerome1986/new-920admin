export interface DashboardOverviewSummary {
  orderTotal: number
  productTotal: number
  userTotal: number
  storeTotal: number
  pendingSettlementAmount: number
  applyingWithdrawCount: number
}

export interface DashboardGoodsSummary {
  tobProductCount: number
  tocProductCount: number
  vipPlanCount: number
  categoryCount: number
  stockTemplateCount: number
  phoneModelCount: number
}

export interface DashboardOrdersSummary {
  tocOrderCount: number
  managerOrderCount: number
  storeOrderCount: number
  pendingCount: number
  paidCount: number
  shippedCount: number
  completedCount: number
  cancelledCount: number
  processingCount: number
  refundedCount: number
}

export interface DashboardUsersSummary {
  normalUserCount: number
  vipUserCount: number
  managerUserCount: number
  activeAccountCount: number
  inactiveAccountCount: number
}

export interface DashboardStoresSummary {
  storeCount: number
  boundManagerStoreCount: number
  storeMemberCount: number
  pendingSettlementAmount: number
}

export interface DashboardFinanceSummary {
  settlementRecordCount: number
  pendingSettlementCount: number
  settledCount: number
  applyingWithdrawCount: number
  paidWithdrawCount: number
  withdrawAmount: number
  platformFeeAmount: number
  managerIncomeAmount: number
}

export interface DashboardSummary {
  updatedAt: string
  overview: DashboardOverviewSummary
  goods: DashboardGoodsSummary
  orders: DashboardOrdersSummary
  users: DashboardUsersSummary
  stores: DashboardStoresSummary
  finance: DashboardFinanceSummary
}

export type DashboardStatValueType = 'number' | 'money'

export interface DashboardCoreMetric {
  label: string
  value: number
  unit?: string
  valueType?: DashboardStatValueType
  description: string
}

export interface DashboardModuleStatItem {
  label: string
  value: number
  unit?: string
  valueType?: DashboardStatValueType
}

export interface DashboardModuleStatGroup {
  title: string
  description: string
  items: DashboardModuleStatItem[]
}
