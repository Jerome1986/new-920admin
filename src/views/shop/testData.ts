/** 门店详情页各区域演示数据（集中维护，便于联调前滚动与布局测试） */

export interface StoreStockRow {
  skuName: string
  spec: string
  quantity: number
  updatedAt: string
}

export interface StoreMemberRow {
  nickname: string
  mobile: string
  level: string
  joinedAt: string
}

export interface StoreFinanceFlowRow {
  time: string
  type: '收入' | '支出'
  amount: string
  balance: string
  remark: string
}

/** 门店档案：静态展示与编辑初始值 */
export const storeBasicDemo = {
  internalId: 'cmj0demo01storeid0001abcdefghij',
  parentLabel: '无（顶级门店）',
  logoUrl: 'https://placehold.co/160x160/f8fafc/64748b?text=Logo',
  qrUrl: 'https://placehold.co/140x140/ffffff/94a3b8?text=QR',
  stockTemplate: '#12',
  pendingSettle: '¥12888.00',
  createdAt: '2026-01-15 10:30:00',
  updatedAt: '2026-04-01 18:20:00',
  editForm: {
    name: '旗舰店（演示）',
    phone: '13800138000',
    address: '上海市浦东新区某某路 888 号 1 层（演示地址）',
  },
  managerInitial: {
    name: '张三',
    phone: '13800138000',
  },
  managerOptions: [
    { label: '李四', value: 'lisi', phone: '13911110001' },
    { label: '王五', value: 'wangwu', phone: '13911110002' },
  ],
} as const

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

/** 库存：多行便于表格区域滚动 */
export const storeStockDemoList: StoreStockRow[] = (() => {
  const base: Omit<StoreStockRow, 'updatedAt'>[] = [
    { skuName: '经典拿铁', spec: '大杯 / 热', quantity: 120 },
    { skuName: '美式咖啡', spec: '中杯 / 冰', quantity: 86 },
    { skuName: '焦糖玛奇朵', spec: '大杯 / 少糖', quantity: 45 },
    { skuName: '燕麦拿铁', spec: '大杯 / 热', quantity: 62 },
    { skuName: '抹茶拿铁', spec: '中杯 / 冰', quantity: 38 },
    { skuName: '芝士蛋糕', spec: '切片', quantity: 24 },
    { skuName: '可颂面包', spec: '原味', quantity: 55 },
    { skuName: '提拉米苏', spec: '盒装', quantity: 18 },
    { skuName: '冰摇柠檬茶', spec: '大杯 / 少冰', quantity: 72 },
    { skuName: '珍珠奶茶', spec: '大杯 / 半糖', quantity: 95 },
    { skuName: '杨枝甘露', spec: '中杯', quantity: 41 },
    { skuName: '鲜榨橙汁', spec: '瓶装 300ml', quantity: 33 },
    { skuName: '矿泉水', spec: '550ml', quantity: 200 },
    { skuName: '三明治套餐', spec: '培根蛋', quantity: 28 },
    { skuName: '贝果', spec: '全麦', quantity: 40 },
    { skuName: '司康饼', spec: '蔓越莓', quantity: 22 },
    { skuName: '手冲咖啡豆', spec: '埃塞俄比亚 200g', quantity: 15 },
    { skuName: '挂耳咖啡', spec: '混合装 10 包', quantity: 48 },
    { skuName: '保温杯', spec: '500ml 磨砂黑', quantity: 12 },
    { skuName: '帆布袋', spec: '门店限定', quantity: 30 },
    { skuName: '礼品卡', spec: '面值 100', quantity: 60 },
    { skuName: '浓缩液', spec: '30ml×6', quantity: 44 },
    { skuName: '糖浆', spec: '香草 750ml', quantity: 19 },
    { skuName: '牛奶', spec: '1L 全脂', quantity: 36 },
    { skuName: '燕麦奶', spec: '1L', quantity: 27 },
    { skuName: '纸杯', spec: '12oz 带盖', quantity: 500 },
    { skuName: '吸管', spec: '可降解', quantity: 800 },
    { skuName: '餐巾纸', spec: '盒装', quantity: 90 },
    { skuName: '清洁耗材', spec: '消毒液 5L', quantity: 8 },
    { skuName: '备用 POS 纸', spec: '热敏 80mm', quantity: 25 },
  ]
  return base.map((row, i) => {
    const d = 1 + (i % 28)
    const h = 9 + (i % 10)
    const m = (i * 7) % 60
    return {
      ...row,
      updatedAt: `2026-04-${pad2(d)} ${pad2(h)}:${pad2(m)}:00`,
    }
  })
})()

/** 会员：多行便于表格区域滚动 */
export const storeMemberDemoList: StoreMemberRow[] = (() => {
  const levels = ['普通', '银卡', '金卡', '黑卡'] as const
  const names = [
    '王小明',
    '李晓红',
    '陈志强',
    '刘芳',
    '赵敏',
    '周杰',
    '吴磊',
    '郑洁',
    '孙悦',
    '马超',
    '黄蓉',
    '林峰',
    '何静',
    '高翔',
    '梁爽',
    '宋佳',
    '唐宁',
    '许巍',
    '韩雪',
    '冯巩',
    '邓超',
    '范伟',
    '蒋欣',
    '蔡明',
    '潘玮柏',
    '袁泉',
    '于和伟',
    '董洁',
    '余文乐',
    '姚晨',
  ]
  return names.map((nickname, i) => {
    const y = 2024 + (i % 2)
    const mo = 1 + (i % 12)
    const day = 1 + (i % 28)
    return {
      nickname,
      mobile: `138${String(10000000 + i * 137).slice(0, 8)}`,
      level: levels[i % levels.length] as StoreMemberRow['level'],
      joinedAt: `${y}-${pad2(mo)}-${pad2(day)}`,
    }
  })
})()

/** 资金汇总（演示，模板侧会加 ¥ 前缀） */
export const storeFinanceSummaryDemo = {
  turnover: '256,880.50',
  settleable: '12,345.67',
} as const

/** 资金流水：多行便于表格区域滚动 */
export const storeFinanceFlowDemoList: StoreFinanceFlowRow[] = (() => {
  const rows: StoreFinanceFlowRow[] = []
  const types: Array<'收入' | '支出'> = ['收入', '支出']
  for (let i = 0; i < 32; i++) {
    const t = types[i % types.length]!
    const amt = t === '收入' ? 50 + (i % 20) * 12.5 : 10 + (i % 15) * 3.2
    const sign = t === '收入' ? '+' : '-'
    const bal = 100000 + i * 420 - (i % 3) * 80
    const d = 1 + (i % 30)
    const h = 8 + (i % 12)
    const m = (i * 5) % 60
    rows.push({
      time: `2026-03-${pad2(d)} ${pad2(h)}:${pad2(m)}:${pad2(i % 60)}`,
      type: t,
      amount: `${sign}${amt.toFixed(2)}`,
      balance: bal.toFixed(2),
      remark:
        t === '收入'
          ? `订单 #${920000 + i} 实收`
          : `手续费 / 退款 #${880000 + i}`,
    })
  }
  return rows
})()
