/**
 * SKU 规格展示：兼容后端 { label, value } 与旧版键值对 Record
 */
export function formatSkuAttrsDisplay(attrs: unknown): string {
  if (attrs == null) return '—'
  if (typeof attrs === 'string') {
    const t = attrs.trim()
    if (!t) return '—'
    try {
      return formatSkuAttrsDisplay(JSON.parse(t) as unknown)
    } catch {
      return t
    }
  }
  if (typeof attrs !== 'object' || Array.isArray(attrs)) return '—'
  const o = attrs as Record<string, unknown>
  if ('label' in o || 'value' in o) {
    const l = o.label != null ? String(o.label) : ''
    const v = o.value != null ? String(o.value) : ''
    if (!l && !v) return '—'
    return l ? `${l}：${v}` : v
  }
  const entries = Object.entries(o)
  if (!entries.length) return '—'
  return entries.map(([k, v]) => `${k}：${v == null ? '' : String(v)}`).join('；')
}

/** 解析为编辑表单用的 label / value */
export function parseSkuAttrsToLabelValue(attrs: unknown): { label: string; value: string } {
  if (attrs == null || attrs === '') return { label: '规格', value: '' }
  if (typeof attrs === 'string') {
    try {
      return parseSkuAttrsToLabelValue(JSON.parse(attrs) as unknown)
    } catch {
      return { label: '规格', value: attrs }
    }
  }
  if (typeof attrs !== 'object' || Array.isArray(attrs)) return { label: '规格', value: '' }
  const o = attrs as Record<string, unknown>
  if ('label' in o || 'value' in o) {
    return {
      label: o.label != null ? String(o.label) : '规格',
      value: o.value != null ? String(o.value) : '',
    }
  }
  const entries = Object.entries(o)
  if (entries.length === 1) {
    return { label: entries[0][0], value: String(entries[0][1] ?? '') }
  }
  return { label: '规格', value: formatSkuAttrsDisplay(attrs) }
}
