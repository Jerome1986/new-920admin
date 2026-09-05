import type { PageResult } from '@/types/Gobal'
import type {
  AgentListParams,
  AgentInviteRecordsParams,
  AgentInviteRecordsResult,
  AgentProfile,
  SetAgentPayload,
  SetAgentResult,
  UpdateAgentStatusPayload,
} from '@/types/Agent'
import { request } from '@/utils/request'

export const getAgentProfiles = (params: AgentListParams) => {
  return request<PageResult<AgentProfile>>({
    method: 'GET',
    url: '/agent-profile',
    params,
  })
}

export const setUserAsAgent = (data: SetAgentPayload) => {
  return request<SetAgentResult>({
    method: 'POST',
    url: '/agent-profile/setAgent',
    data,
  })
}

export const updateAgentStatus = (id: string, data: UpdateAgentStatusPayload) => {
  return request<SetAgentResult>({
    method: 'PATCH',
    url: `/agent-profile/status/${id}`,
    data,
    // 启用历史代理时后端可能需要调用微信接口补生成二维码。
    timeout: 30000,
  })
}

/** 后台查询指定代理的邀请权益记录。 */
export const getAgentInviteRecords = (params: AgentInviteRecordsParams) => {
  return request<AgentInviteRecordsResult>({
    method: 'GET',
    url: '/agent-invites/admin/records',
    params,
  })
}

/*
 * 后续代理管理接口预留：
 * - updateAgentRemark(id, remark)：修改后台备注
 *
 * 待后端确定请求路径与参数后在此实现，页面对应入口已在 agent.vue 中预留。
 */
