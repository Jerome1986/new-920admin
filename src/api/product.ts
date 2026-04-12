import type { PageResult } from "@/types/Gobal";
import type { PhoneModel, PhoneModelListItem, ProductAddPayload, ProductDetail, ProductListItem } from "@/types/Product";
import type { VipPlanListItem } from "@/types/VipPlan";
import { request } from "@/utils/request";

/**
 * 根据商品类型和分类ID获取商品
 * @param target 
 * @param pageNum 
 * @param pageSize 
 * @param categoryId 
 */
export const productFindAllApi = (
  target: string,
  pageNum: number,
  pageSize: number,
  categoryId?: number | null
) => {
  return request<PageResult<ProductListItem>>({
    method: 'GET',
    url: `/product/target/${categoryId}`,
    params: {
      target,
      pageNum,
      pageSize,
    },
  })
}

/**
 * 搜索商品
 * @param categoryId 
 * @param searchVal 
 * @param pageNum 
 * @param pageSize 
 * @param target 
 */
export const productSearch = (categoryId: number, searchVal: string, pageNum: number, pageSize: number, target: string) => {
  return request<PageResult<ProductListItem>>({
    method: 'GET',
    url: `/product/search/${categoryId}`,
    params: { searchVal, pageNum, pageSize, target }
  })
}

// 商品详情
export const fetchProductDetailApi = (id: number) => {
  return request<ProductDetail>({
    method: 'GET',
    url: `/product/detail/${id}`,
  })
}

// 新增商品
export const addProductApi = (payload: ProductAddPayload) => {
  return request<unknown>({
    method: 'POST',
    url: '/product/add',
    data: payload,
  })
}

// 更新指定商品（请求体与新增一致）
export const updateProductApi = (productId: number, payload: ProductAddPayload) => {
  return request<ProductListItem>({
    method: 'PATCH',
    url: `/product/${productId}`,
    data: payload,
  })
}

// 获取商品型号（keyword 可选，传则按名称筛选，由后端约定参数名）
export const phoneModelsFindAllApi = (
  pageNum: number = 1,
  pageSize: number = 100,
  keyword?: string
) => {
  const kw = keyword?.trim()
  return request<PageResult<PhoneModelListItem>>({
    method: 'GET',
    url: '/phone-model',
    params: {
      pageNum,
      pageSize,
      ...(kw ? { keyword: kw } : {}),
    },
  })
}

// 删除商品
export const deleteProductApi = (productId: number) => {
  return request({
    method: 'DELETE',
    url: `/product/${productId}`
  })
}

// 会员产品
export const vipProductFindAllApi = () => {
  return request<VipPlanListItem[]>({
    method: 'GET',
    url: '/vip-plan'
  })
}

// 添加会员产品
export const vipProductAddApi = (planData: VipPlanListItem) => {
  return request<{ id: number }>({
    method: 'POST',
    url: '/vip-plan/add',
    data: planData
  })
}

// 获取会员产品详情
export const vipPorductDetailApi = (planId: number) => {
  return request<VipPlanListItem>({
    method: 'GET',
    url: `/vip-plan/detail/${planId}`
  })
}

// 更新指定会员产品
export const vipProductUpdateApi = (planId: number, data: VipPlanListItem) => {
  return request<VipPlanListItem>({
    method: 'PATCH',
    url: `/vip-plan/${planId}`,
    data
  })
}

// 删除会员产品
export const vipProductDeleteApi = (planId: number) => {
  return request({
    method: 'DELETE',
    url: `/vip-plan/${planId}`,
  })
}

// 一次性获取所有型号配置
export const phoneSettingFindAllApi = (pageNum: number, pageSize: number, kw?: string) => {
  return request<PageResult<PhoneModel>>({
    method: 'GET',
    url: '/phone-model',
    params: { pageNum, pageSize, kw }
  })
}

/**
 * 新增型号
 * @param name 
 */
export const phoneSettingAddApi = (name: string) => {
  return request<{ id: number }>({
    method: 'POST',
    url: '/phone-model/add',
    data: { name }
  })
}

export const phoneSettingUpdateApi = (id: number, name: string) => {
  return request<PhoneModel>({
    method: 'PATCH',
    url: `/phone-model/${id}`,
    data: { name }
  })
}

export const phoneSettingDeleteApi = (id: number) => {
  return request({
    method: 'DELETE',
    url: `/phone-model/${id}`,
  })
}
