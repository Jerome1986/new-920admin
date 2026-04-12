// 性别转换


export const formatGender = (gender: number) => {
  switch (gender) {
    case 1:
      return '男'
    case 2:
      return '女'
    default:
      return '未知'
  }
}

// 角色映射
export const formatRole = (levelText: string): string => {
  switch (levelText) {
    case 'USER':
      return '普通用户'
    case 'VIP':
      return '会员'
    case 'MANAGER':
      return '店长'
    default:
      return '未知身份'
  }
}


// 店长订单状态转换
export const formatStoreOrderState = (state: string) => {
  switch (state) {
    case 'pending':
      return '未结算'
    case 'finished':
      return '已结算'
  }
}

// 姓名映射
export const formatName = (name: string) => {
  if (!name) return '未填写'
  return name
}

// 映射百分比
export const displayValue = (cashbackRate: number) => {
  if (!cashbackRate) return '未设置'
  return (cashbackRate * 100).toFixed(0) + '%'
}
