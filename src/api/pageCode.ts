import { request } from '@/utils/request'

export interface PageCodeResult {
  qrCodeUrl: string
}

// 生成扫码找膜小程序码
export const createUserFindMoCodeApi = () => {
  return request<PageCodeResult>({
    method: 'POST',
    url: '/page-code/user-find-mo'
  })
}
