import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CommissionRule } from '@/types/CommissionRule'
import { commissionRuleFind } from '@/api/commissionRule'

export const useCommissionStore = defineStore('commission', () => {
  // 佣金参数
  const commission = ref<CommissionRule>({
    id: 0,
    level1Rate: '0',
    level2Rate: '0',
    platformRate: '0',
    totalRate: '0',
    createdAt: new Date(),
    updatedAt: new Date()
  })

  // 获取佣金设置
  const commissionGet = async () => {
    const res = await commissionRuleFind()
    commission.value = res.data
  }

  // 保存佣金设置
  const setCommission = (value: CommissionRule) => {
    commission.value = { ...commission.value, ...value }
  }

  // 保存总佣金数
  const setTotalRate = (value: string) => {
    commission.value.totalRate = value
  }

  return {
    commission,
    commissionGet,
    setCommission,
    setTotalRate
  }
})