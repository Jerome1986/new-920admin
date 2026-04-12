/** B 端商城 / C 端分类维护维度 */
export type CategoryScope = 'TOB' | 'TOC'

/** 分类树节点 */
export interface CategoryNode {
  id: number
  name: string
  parentId: number | null
  level: number
  sort: number
  target: CategoryScope

  createdAt: Date
  updatedAt: Date
  children?: CategoryNode[]
}
