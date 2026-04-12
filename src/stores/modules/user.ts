import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { AdminInfo } from '@/types/User'

export const useUserStore = defineStore(
  'user',
  () => {
    const userInfo = ref<AdminInfo>()

    const token = ref('')
    const setToken = (val: string) => {
      token.value = val
    }
    const clearToken = () => {
      token.value = ''
    }

    return {
      userInfo,
      token,
      setToken,
      clearToken
    }
  },
  {
    persist: true, // 持久化
  },
)
