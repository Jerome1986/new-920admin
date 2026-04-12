import type { ProductListItem } from "./Product"

export interface StockModel {
  id: number
  name: string
  status: 'ACTIVE' | 'INACTIVE'
  items: StockModelProduct[]
  createdAt?: Date
  updatedAt?: Date
}


export interface StockModelProduct {
  id?: number
  stockModelId?: number
  categoryId: number
  productId: number
  skuId: number
  initStock: number
  stockModel?: StockModel
  product?: ProductListItem
}