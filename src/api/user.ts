import type { PageResult } from "@/types/Gobal";
import type { CommonStatus, LoginResult, UserInfo, UserRole } from "@/types/User";
import { request } from "@/utils/request";

/**
 * 登录
 * @param username - 用户名
 * @param password - 密码
 */
export const loginApi = (username: string, password: string) => {
  return request<LoginResult>({
    method: 'POST',
    url: '/admin/login',
    data: { username, password }
  })
}

/**
 * 查询所有用户
 * @param role 
 * @param pageNum 
 * @param pageSize 
 * @returns 
 */
export const userFindAll = (pageNum: number, pageSize: number, role?: UserRole) => {
  return request<PageResult<UserInfo>>({
    method: 'GET',
    url: '/user',
    params: { pageNum, pageSize, role }
  })
}

/**
 * 根据指定用户更新用户信息
 * @param userId 
 * @param nickname 
 * @param gender 
 * @param score 
 * @param status 
 * @returns 
 */
export const updateUserInfoApi = (userId: string, nickname: string, gender: number, score: number, status: CommonStatus) => {
  return request<UserInfo>({
    method: 'PATCH',
    url: `user/${userId}`,
    data: { nickname, gender, score, status }
  })
}

/**
 * 搜索用户（手机号/邀请码）
 * @param role 
 * @param searchVal 
 * @param pageNum 
 * @param pageSize 
 */
export const userSearchApi = (searchVal: string, pageNum: number, pageSize: number, role?: UserRole) => {
  return request<PageResult<UserInfo>>({
    method: 'GET',
    url: '/user/search',
    params: { searchVal, pageNum, pageSize, role }
  })
}

