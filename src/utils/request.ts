/**
 * @description Axios 混合增强封装
 * - 拦截器统一处理 token 注入、业务错误、401 登录跳转
 * - request 函数支持泛型，直接返回业务 data
 * - 方便维护与类型安全
 */

import axios from 'axios'
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { useUserStore } from '@/stores'

// ======================== 基础配置 ========================
// export const baseURL = 'http://localhost:3000/api'
export const baseURL = 'https://api.920keji.com/api'

const instance: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000
})

// ======================== 类型定义 ========================

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

/**
 * HTTP 错误体里 data.message 可能是字符串，也可能是字符串数组（如校验错误）
 */
function normalizeHttpErrorMessage(message: unknown): string {
  if (message == null) return ''
  if (typeof message === 'string') return message.trim() || ''
  if (Array.isArray(message)) {
    const parts = message
      .map((item) => {
        if (typeof item === 'string') return item.trim()
        if (item != null && typeof item === 'object' && 'message' in item) {
          return String((item as { message: unknown }).message).trim()
        }
        return String(item).trim()
      })
      .filter(Boolean)
    return parts.join('；')
  }
  return String(message)
}

// ======================== 拦截器 ========================

// 请求拦截器：注入 token
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.set('Authorization', userStore.token)
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：统一处理业务逻辑
instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { code, message } = response.data
    if (code === 200) {
      return response // 这里返回原始 response，用外层 request 统一解耦
    }
    ElMessage.error(message || '服务异常')
    return Promise.reject(new Error(message || '接口异常'))
  },
  (error) => {
    const rawMsg = error.response?.data && typeof error.response.data === 'object'
      ? (error.response.data as { message?: unknown }).message
      : undefined
    const fromBody = normalizeHttpErrorMessage(rawMsg)
    const msg = fromBody || error.message || '服务异常'
    ElMessage.error(msg)

    if (error.response?.status === 401) {
      const userStore = useUserStore()
      userStore.clearToken?.()
      router.push('/login').then((r) => console.log(r))
    }
    return Promise.reject(error)
  }
)

// ======================== request 函数 ========================

/**
 * @description 类型安全请求函数
 * @template T 返回业务数据类型
 * @param config AxiosRequestConfig
 * @returns Promise<T>
 */
export async function request<T = unknown>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
  try {
    const response = await instance.request<ApiResponse<T>>(config)
    // 返回整个 response.data，包括 code / message / data
    return response.data
  } catch (error) {
    throw error
  }
}