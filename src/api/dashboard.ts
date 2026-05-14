import type { DashboardSummary } from '@/types/dashboard'
import { request } from '@/utils/request'

/**
 * 首页统计汇总
 */
export const dashboardSummaryApi = () => {
  return request<DashboardSummary>({
    method: 'GET',
    url: '/dashboard/summary',
  })
}
