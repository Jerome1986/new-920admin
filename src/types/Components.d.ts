import type UserChannel from "@/views/user/components/UserChannel.vue"
import type RateChannel from "@/views/market/components/RateChannel.vue"

declare module 'vue' {
  export interface GlobalComponents {
    UserChannel: typeof UserChannel
    PointChannel: typeof RateChannel
  }
}

export type JelUserChannel = InstanceType<typeof UserChannel>
export type JelRateChannel = InstanceType<typeof RateChannel>