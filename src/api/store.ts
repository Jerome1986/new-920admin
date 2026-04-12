import type { PageResult } from "@/types/Gobal";
import type { StoreCreateForm, StoreDetail, StoreList } from "@/types/store";
import { request } from "@/utils/request";

/**
 * 新增门店
 * @param formData 
 */
export const storeCreateApi = (formData: StoreCreateForm) => {
  return request<{ storeId: string }>({
    method: 'POST',
    url: '/store/add',
    data: formData
  })
}

/**
 * 获取所有门店
 * @param pageNum 
 * @param pageSize 
 */
export const storeFindAll = (pageNum: number, pageSize: number) => {
  return request<PageResult<StoreList>>({
    method: 'GET',
    url: '/store',
    params: { pageNum, pageSize }
  })
}

/**
 * 删除当前门店
 * @param storeId 
 */
export const storeDeleteApi = (storeId: string) => {
  return request({
    method: 'DELETE',
    url: `/store/${storeId}`
  })
}

/**
 * 门店详情
 * @param storeId 
 */
export const storeDetailApi = (storeId: string) => {
  return request<StoreDetail>({
    method: 'GET',
    url: `/store/detail/${storeId}`
  })
}

/**
 * 更新门店基础信息
 * @param storeId 
 * @param data 
 */
export const storeEditBasicInfoApi = (storeId: string, name: string, address: string, phone: string) => {
  return request<StoreDetail>({
    method: 'PATCH',
    url: `/store/basicInfo/${storeId}`,
    data: { name, address, phone }
  })
}

/**
 * 解除店长
 * @param storeId 
 * @param managerId 
 */
export const removeStoreManagerApi = (storeId: string, managerId: string) => {
  return request({
    method: 'PATCH',
    url: `/store/remove/${storeId}`,
    data: { managerId }
  })
}

/**
 * 设定店长
 * @param storeId 
 * @param managerName 
 * @param managerPhone 
 */
export const setStoreManagerApi = (storeId: string, managerName: string, managerPhone: string) => {
  return request<StoreDetail>({
    method: 'PATCH',
    url: `/store/setManager/${storeId}`,
    data: { managerName, managerPhone }
  })
}