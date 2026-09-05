export type AgentStatus = 'ACTIVE' | 'DISABLED'

export type AgentStatusFilter = AgentStatus | 'ALL'

export interface AgentUser {
  id: string
  nickname: string | null
  avatarUrl: string | null
  mobile: string
  role: string
  status: string
}

export interface AgentProfile {
  id: string
  userId: string
  agentCode: string
  agentCodeUrl: string | null
  status: AgentStatus
  openedBy: number | null
  openedAt: string
  disabledBy: number | null
  disabledAt: string | null
  disabledReason: string | null
  remark: string | null
  createdAt: string
  updatedAt: string
  user: AgentUser
}

export interface AgentListParams {
  pageNum: number
  pageSize: number
  status?: AgentStatusFilter
  keyword?: string
  openedStartAt?: string
  openedEndAt?: string
}

export interface SetAgentPayload {
  userId: string
  remark?: string
}

export interface UpdateAgentStatusPayload {
  status: AgentStatus
  operatorId?: number
  disabledReason?: string
}

export type SetAgentResult = Omit<AgentProfile, 'user'>

export type AgentInviteBenefitStatus = 'AVAILABLE' | 'USED' | 'EXPIRED'

export interface AgentInviteRecord {
  claimId: string
  mobile: string
  claimedAt: string
  expiresAt: string
  benefitStatus: AgentInviteBenefitStatus
  usedAt: string | null
}

export interface AgentInviteSummary {
  totalInvited: number
  availableCount: number
  usedCount: number
  expiredCount: number
}

export interface AgentInviteRecordsParams {
  userId: string
  mobile?: string
  benefitStatus?: AgentInviteBenefitStatus
  pageNum: number
  pageSize: number
}

export interface AgentInviteRecordsResult {
  agentCode: string
  summary: AgentInviteSummary
  list: AgentInviteRecord[]
  total: number
  pageNum: number
  pageSize: number
  hasMore: boolean
  mobileMatched: boolean | null
}
