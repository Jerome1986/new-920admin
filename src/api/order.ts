import type { PageResult } from "@/types/Gobal"
import type { OrderDetail, OrderListItem, OrderStatus, OrderTarget, StoreServiceOrderListItem, StoreServiceOrderStatus } from "@/types/order"
import { request } from "@/utils/request"

/**
 * 获取商品订单
 * @param status 
 * @param target 
 * @param pageNum 
 * @param pageSize 
 */
export const orderFindAllApi = (status: OrderStatus | 'ALL', target: OrderTarget, pageNum: number, pageSize: number) => {
  return request<PageResult<OrderListItem>>({
    method: 'GET',
    url: '/order',
    params: { status, target, pageNum, pageSize }
  })
}

/** 商品订单详情 */
export const orderDetailApi = (outTradeNo: string) => {
  return request<OrderDetail>({
    method: 'GET',
    url: `/order/detail/${outTradeNo}`,
  })
}

/** 已支付订单：标记发货（状态 → SHIPPED） */
export const orderShipApi = (outTradeNo: string, status: OrderStatus) => {
  return request<OrderDetail>({
    method: 'PATCH',
    url: `/order/status/${outTradeNo}`,
    data: { status }
  })
}

/** 线下贴膜订单列表 */
export const storeServiceOrderFindAllApi = (
  status: StoreServiceOrderStatus | 'ALL',
  pageNum: number,
  pageSize: number,
  keyword?: string
) => {
  return request<PageResult<StoreServiceOrderListItem>>({
    method: 'GET',
    url: '/store-service-order',
    params: { status, pageNum, pageSize, keyword }
  })
}
