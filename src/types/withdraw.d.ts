export type WithdrawStatus = 'APPLYING' | 'REJECTED' | 'PAID'

export type WithdrawUserRole = 'USER' | 'VIP' | 'MANAGER'

export type WithdrawUserStatus = 'ACTIVE' | 'INACTIVE'

// 提现申请关联用户：对应接口返回的 user 字段
export interface WalletWithdrawApplyUser {
  id: string
  openid: string
  nickname: string | null
  avatarUrl: string | null
  mobile: string | null
  gender: number
  role: WithdrawUserRole
  status: WithdrawUserStatus
  referralCode: string
  inviterId: string | null
  storeId: string | null
  score: number
  myCodeUrl: string | null
  lastGiftTime: Date | string | null
  avatarUpdateCount: number | null
  avatarUpdateAt: Date | string | null
  vipLevel: number | null
  vipStartTime: Date | string | null
  vipEndTime: Date | string | null
  vipGift: number | null
  vipDiscount: number | null
  vipMaxUsers: number | null
  createdAt: Date | string
  updatedAt: Date | string
}

// 提现申请列表项：对应后端 WalletWithdrawApply 表结构
export interface WalletWithdrawApplyItem {
  id: number
  withdrawNo: string
  userId: string
  amount: number | string
  status: WithdrawStatus
  payeeName: string | null
  payeeAccount: string | null
  bankName: string | null
  rejectReason: string | null
  createdAt: Date | string
  paidAt: Date | string | null
  updatedAt: Date | string
  user: WalletWithdrawApplyUser | null
}

// 提现申请查询参数：对应提现管理页面筛选与分页
export interface WalletWithdrawApplyQuery {
  // 当前页码
  pageNum: number

  // 每页条数
  pageSize: number

  // 提现状态：ALL 表示全部
  status?: WithdrawStatus | 'ALL'

  // 关键词：提现单号 / 用户ID / 用户电话 / 收款人 / 收款账号 / 银行渠道
  keyword?: string

  // 申请开始时间，格式：YYYY-MM-DD
  createdStartAt?: string

  // 申请结束时间，格式：YYYY-MM-DD
  createdEndAt?: string
}

// 提现申请拒绝参数：对应拒绝提现接口请求体
export interface WalletWithdrawRejectParams {
  // 审核人ID，对应 Admin.id
  reviewerId?: number

  // 拒绝原因
  rejectReason?: string
}

// 提现申请确认打款参数：对应确认打款接口请求体
export interface WalletWithdrawApproveParams {
  // 审核人ID，对应 Admin.id
  reviewerId: number
}
