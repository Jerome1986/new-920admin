import type { CommonStatus, UserInfo } from '@/types/User'
import type { StockModel } from './stockModel'

// 新增门店表单类型
export interface StoreCreateForm {
  /** 门店名称 */
  name: string
  /** 门店地址 */
  address: string
  /** 门店联系电话 */
  phone: string
  /** 管理员用户ID */
  managerId: string
  /** 管理员姓名 */
  managerName: string
  /** 库存模板ID */
  inventoryTemplateId: string | number
}

// 门店列表类型
export interface StoreList {
  id: string
  /** 门店名称 */
  name: string
  /** 门店地址 */
  address: string
  /** 管理员姓名 */
  managerName: string
  /** 门店联系电话 */
  phone: string
  /** 当前门店下的所有会员 */
  users: UserInfo[]
  /** 当前门店店长信息 */
  manager: UserInfo
  /** 门店钱包 */
  wallet: Wallet
  /** 创建时间 */
  createdAt: Date
}

// 门店详情
export interface StoreDetail {
  id: string
  name: string
  logo: string | null
  address: string
  phone: string
  qrCodeUrl: string | null
  managerId: string
  managerName: string | null
  manager: UserInfo
  parentStoreId: string | null
  status: CommonStatus
  inventoryTemplateId: number | null
  inventory: StoreInventoryItem[] | null
  inventoryModel: InventroyModel
  createdAt: string
  updatedAt: string
}

// 库存模版
export interface InventroyModel {
  id: number
  name: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: Date
  updatedAt: Date
}

// 门店库存项类型
export interface StoreInventoryItem {
  /** 库存记录ID */
  id: string
  /** 门店ID */
  storeId: string
  /** SKU ID */
  skuId: number
  /** 规格名称 */
  skuValue: string
  /** 商品名称 */
  productName: string
  /** 成本价 */
  costPrice: string
  /** 销售价 */
  salePrice: string
  /** 库存数量 */
  stock: number
  /** 锁定库存 */
  lockedStock: number
  /** 已售出数量 */
  soldCount: number
  /** 状态：ACTIVE-正常 / INACTIVE-禁用 */
  status: 'ACTIVE' | 'INACTIVE'
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

// 门店钱包
export interface Wallet {
  balance: number
  availableBalance: number
  frozenBalance: number
}

