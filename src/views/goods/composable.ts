import type { PhoneModelListItem } from '@/types/Product'
import type { Ref } from 'vue'
import { ref, watch } from 'vue'

// 型号下拉：自定义 filter-method，与接口返回的型号列表联动
export const filterModels = (sourceList: Ref<PhoneModelListItem[] | null | undefined>) => {
  // 过滤后的下拉选项
  const filteredModels = ref<PhoneModelListItem[]>([])
  // 上一次输入的搜索词（source 变化时重算）
  const lastQuery = ref('')

  // 归一化字符串：小写、去空格与 -_
  const normalize = (str: string) =>
    str.toLowerCase().replace(/\s+/g, '').replace(/[-_]/g, '')

  // 安全取源列表（避免非数组）
  const getSourceArray = (): PhoneModelListItem[] =>
    Array.isArray(sourceList.value) ? sourceList.value : []

  // el-select 的 filter-method 回调
  const filterPhoneModel = (query: string) => {
    lastQuery.value = query
    const list = getSourceArray()
    if (!query) {
      filteredModels.value = [...list]
      return
    }
    const q = normalize(query)
    filteredModels.value = list.filter((item) => normalize(item.name).includes(q))
  }

  // 型号列表异步更新后，用当前关键词重算选项
  watch(sourceList, () => filterPhoneModel(lastQuery.value), { immediate: true, deep: true })

  return { filteredModels, filterPhoneModel }
}

