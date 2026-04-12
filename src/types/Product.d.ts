// 与后端 Product.target / Prisma Target 对齐
export type ProductTarget = 'TOB' | 'TOC'

// 与后端 Product.type 对齐：user / manager / vip / both
export type ProductType = 'USER' | 'MANAGER' | 'VIP' | 'BOTH'

export type ProductStatus = 'ACTIVE' | 'INACTIVE'

export type ProductHot = 'ENABLE' | 'DISABLE'

// 后端返回的商品列表数据
export interface ProductListItem {
  id: number
  name: string
  skuNo: string
  dec?: string | null
  cover: string
  lookNum: number
  status: ProductStatus
  hot: ProductHot
  type: ProductType
  target: ProductTarget
  categoryId: number
  // 展示用：分类名称
  categoryName?: string
  /** 初始配置库存数量 */
  initStock?: number | null
  skus?: ProductSkuItem[]
}

// 库存列表商品行内展平数据
export interface RowList {
  cover: string
  categoryId: number
  // 展示用：分类名称
  categoryName?: string
  productId: number
  productName: string
  skuNo: string
  skuId: number
  skuName: string
  costPrice: string
  salePrice: string
  /** 初始配置库存 */
  initStock?: number
}

// SKU 规格：后端多为 { label, value }，旧数据可能为键值对
export type ProductSkuAttrs =
  | Record<string, string>
  | { label: string; value: string }
  | Record<string, unknown>

// SKU（attrs 与 Prisma Json 对齐）
export interface ProductSkuItem {
  id: number
  productId: number
  costPrice: string
  salePrice: string
  stock: number
  minStock: number
  image?: string | null
  attrs: ProductSkuAttrs
  unit: string
}

export interface ProductImageItem {
  id: number
  productId: number
  url: string
}

export interface ProductModelItem {
  id: number
  productId: number
  name: string
}

/** 通用型号主表 `phone_model`（与 Prisma `PhoneModel` 对齐） */
export interface PhoneModel {
  id: number
  /** 唯一 */
  name: string
  /** ISO 8601 字符串（接口序列化后的 DateTime） */
  createdAt: string
  /** ISO 8601 字符串（接口序列化后的 DateTime） */
  updatedAt: string
}

/** GET /phone-model 列表/字典行（与 `PhoneModel` 一致，与商品无关联、无 productId） */
export type PhoneModelListItem = PhoneModel

// 商品详情（含关联表）
export interface ProductDetail extends ProductListItem {
  skus: ProductSkuItem[]
  images: ProductImageItem[]
  models: ProductModelItem[]
}

// 新增/更新商品 SKU 行；更新时带 id 便于后端识别增删改
export interface ProductAddSkuPayload {
  // 已有 SKU 更新时传入，新增行不传
  id?: number
  attrs: { label: string; value: string }
  costPrice: string
  salePrice: string
  stock: number
  minStock: number
  unit: string
  image?: string | null
}

// 新增商品 POST /product/add 请求体
export interface ProductAddPayload {
  name: string
  skuNo: string
  dec?: string | null
  cover: string
  lookNum: number
  status: ProductStatus
  hot: ProductHot
  type: ProductType
  target: ProductTarget
  categoryId: number
  // 分类名称（与 categoryId 对应，便于后端展示或冗余存储）
  categoryName: string
  // 图库：每项为 { url }
  images: { url: string }[]
  // 支持的型号：每项为 { name }
  models: { name: string }[]
  skus: ProductAddSkuPayload[]
}

// 商品列表页 Tab：B 端 / C 端 / 会员套餐
export type GoodsTab = 'TOB' | 'TOC' | 'VIP'

// 编辑页 SKU 表格行（与接口 attrs.label/value 对应）
export interface ProductSkuEditRow {
  id?: number
  // 本地新增行无 id 时用于表格 row-key
  _clientKey?: string
  attrLabel: string
  attrValue: string
  costPrice: string
  salePrice: string
  stock: number
  minStock: number
  unit: string
  image: string
}
