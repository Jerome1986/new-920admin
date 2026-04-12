import type { CategoryNode, CategoryScope } from "@/types/Category"
import type { PageResult } from "@/types/Gobal"
import { request } from "@/utils/request"

/**
 * 获取分类树
 * @param target - 分类类型  TOB/TOC
 * @returns 
 */
export const fetchCategoryTree = (target: CategoryScope) => {
  return request<CategoryNode[]>({
    method: 'GET',
    url: '/category/tree',
    params: { target }
  })
}

/**
 * 根据类型和层级来获取分类
 * @param target 
 * @param pageNum 
 * @param pageSize 
 * @param parentId 
 * @param level 
 */
export const categoryFindAllByLevel = (
  target: CategoryScope,
  pageNum?: number,
  pageSize?: number,
  parentId?: number,
  level?: number
) => {
  return request<PageResult<CategoryNode>>({
    method: 'GET',
    url: '/category',
    params: { pageNum, pageSize, parentId, level, target },
  })
}

/**
 * 更新分类
 * @param cateId - 分类ID
 */
export const updateCategoryApi = (cateId: number, name: string, sort: number) => {
  return request<CategoryNode>({
    method: 'PATCH',
    url: `/category/${cateId}`,
    data: { name, sort }
  })
}

/** 新增分类（根节点 parentId 传 null；字段以后端为准） */
export const createCategoryApi = (payload: {
  name: string
  sort: number
  parentId: number | null
  target: CategoryScope
}) => {
  return request<CategoryNode>({
    method: 'POST',
    url: '/category/add',
    data: payload
  })
}

/** 删除分类 */
export const deleteCategoryApi = (cateId: number) => {
  return request<void>({
    method: 'DELETE',
    url: `/category/${cateId}`
  })
}

