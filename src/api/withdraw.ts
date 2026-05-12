import type { PageResult } from '@/types/Gobal'
import type {
  WalletWithdrawApplyItem,
  WalletWithdrawApplyQuery,
  WalletWithdrawApproveParams,
  WalletWithdrawRejectParams
} from '@/types/withdraw'
import { request } from '@/utils/request'

/**
 * 获取提现申请列表
 * @param params 提现列表筛选与分页参数
 */
export const walletWithdrawApplyFindAllApi = (params: WalletWithdrawApplyQuery) => {
  return request<PageResult<WalletWithdrawApplyItem>>({
    method: 'GET',
    url: '/wallet-withdraw-apply',
    params
  })
}

/**
 * 获取提现申请详情
 * @param id 提现申请ID
 */
export const walletWithdrawApplyDetailApi = (id: number | string) => {
  return request<WalletWithdrawApplyItem>({
    method: 'GET',
    url: `/wallet-withdraw-apply/detail/${id}`
  })
}

/**
 * 拒绝提现申请
 * @param id 提现申请ID
 * @param data 拒绝参数
 */
export const walletWithdrawApplyRejectApi = (id: number | string, data: WalletWithdrawRejectParams) => {
  return request<WalletWithdrawApplyItem>({
    method: 'PATCH',
    url: `/wallet-withdraw-apply/reject/${id}`,
    data
  })
}

/**
 * 确认提现打款
 * @param id 提现申请ID
 * @param data 确认打款参数
 */
export const walletWithdrawApplyApproveApi = (id: number | string, data: WalletWithdrawApproveParams) => {
  return request<WalletWithdrawApplyItem>({
    method: 'PATCH',
    url: `/wallet-withdraw-apply/approve/${id}`,
    data
  })
}
