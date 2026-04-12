import type { StockModel, StockModelProduct } from "@/types/stockModel";
import { request } from "@/utils/request";

/**
 * 新增库存模板
 * @param name 
 * @param items 
 */
export const stockModelAddApi = (name: string, items: StockModelProduct[]) => {
  return request({
    method: 'POST',
    url: '/stock-model/add',
    data: { name, items }
  })
}

// 获取库存模板
export const stockModelFindAll = () => {
  return request<StockModel[]>({
    method: 'GET',
    url: '/stock-model'
  })
}

// 获取库存模板详情
export const stockModelFindOne = (id: number) => {
  return request<StockModel>({
    method: 'GET',
    url: `/stock-model/detail/${id}`
  })
}

// 更新库存模版
export const stockModelUpdate = (id: number, name: string, items: StockModelProduct[]) => {
  return request({
    method: 'PATCH',
    url: `/stock-model/update/${id}`,
    data: { name, items }
  })
}

// 删除库存模板
export const stockModelDelte = (id: number) => {
  return request({
    method: 'DELETE',
    url: `/stock-model/del/${id}`
  })
}