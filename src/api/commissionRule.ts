import type { CommissionRule, CommissionRuleParams } from "@/types/CommissionRule"
import { request } from "@/utils/request"

// 获取佣金规则
export const commissionRuleFind = () => {
  return request<CommissionRule>({
    method: 'GET',
    url: '/commission-rule'
  })
}

/**
 * 更新佣金规则
 * @param id 
 * @param formData 
 */
export const commissionRuleUpdateApi = (id: string, formData: CommissionRuleParams) => {
  return request<CommissionRule>({
    method: 'PATCH',
    url: `/commission-rule/${id}`,
    data: formData
  })
}

/**
 * 设置总佣金
 * @param id 
 * @param totalRate 
 */
export const settingTotalRateApi = (id: string, totalRate: string) => {
  return request({
    method: 'PATCH',
    url: `/commission-rule/totalRate/${id}`,
    data: { totalRate }
  })
}