import type { PointRule } from "@/types/points"
import { request } from "@/utils/request"

// 获取积分规则列表
export const pointsRuleFindAllApi = () => {
  return request<PointRule[]>({
    method: 'GET',
    url: '/rate-rule'
  })
}

/**
 * 新增积分规则
 * @param earnRate 
 * @param useRate 
 * @param maxUsePercent 
 */
export const pointsRuleAddApi = (earnRate: number, useRate: number, maxUsePercent: number) => {
  return request<{ id: string }>({
    method: 'POST',
    url: '/rate-rule/add',
    data: { earnRate, useRate, maxUsePercent }
  })
}

/**
 * 更新积分规则
 * @param id 
 * @param earnRate 
 * @param useRate 
 * @param maxUsePercent 
 */
export const pointsRuleUpdateApi = (id: string, earnRate: number, useRate: number, maxUsePercent: number) => {
  return request<PointRule>({
    method: 'PATCH',
    url: `/rate-rule/${id}`,
    data: { earnRate, useRate, maxUsePercent }
  })
}

/**
 * 删除积分规则
 * @param id 
 */
export const pointsRuleDeleteApi = (id: string) => {
  return request({
    method: 'DELETE',
    url: `/rate-rule/delete/${id}`
  })
}
