import type { CommonStatus } from '@/types/User'

/**
 * 通用状态枚举（与 Prisma 中的 commonStatus 对应）
 */
export type commonStatus = "ENABLE" | "DISABLE"


/** 会员套餐列表行 */
export interface VipPlanListItem {
  id?: number
  /** 会员等级 */
  level: number
  /** 会员名称 */
  levelText: string
  /** 价格 */
  price: string
  /** 会员折扣 */
  discount: number
  /** 套餐期限 */
  term: string
  /** 套餐权益 */
  rights: string
  /** 套餐状态 */
  status: CommonStatus
  /** 返现比例 */
  cashbackRate: number
  /** 最大使用人数 */
  maxUsers: number
  /** 每月限制 */
  limit: number
  createdAt?: Date
  updatedAt?: Date
}
