export interface CommissionRule {
  id: string,
  level1Rate: string
  level2Rate: string
  platformRate: string
  totalRate: string
  createdAt: Date
  updatedAt: Date
}

export type CommissionRuleParams = Omit<CommissionRule, 'id' | 'createdAt' | 'updatedAt'>