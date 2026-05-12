import type { PageResult } from '@/types/Gobal'
import type { SettlementRecordItem, SettlementRecordQuery } from '@/types/settlement'
import { request } from '@/utils/request'

/**
 * 获取结算记录列表
 * @param params 结算列表筛选与分页参数
 */
export const settlementRecordFindAllApi = (params: SettlementRecordQuery) => {
  return request<PageResult<SettlementRecordItem>>({
    method: 'GET',
    url: '/settlementRecord',
    params
  })
}
