/** 图片上传地址（自动上传直连） */
export const UPLOAD_ACTION = 'https://x08d6czkyi.sealosgzg.site/upload'

/**
 * 从上传接口响应中解析图片 URL（兼容字符串 JSON、{ url }、{ data: { url } } 等）
 */
export function parseUploadResponseUrl(res: unknown): string | null {
  if (res == null) return null
  if (typeof res === 'string') {
    const t = res.trim()
    if (!t) return null
    if (t.startsWith('http') || t.startsWith('//')) return t
    try {
      return parseUploadResponseUrl(JSON.parse(t) as unknown)
    } catch {
      return null
    }
  }
  if (typeof res === 'object') {
    const o = res as Record<string, unknown>
    if (typeof o.url === 'string' && o.url) return o.url
    const d = o.data
    if (typeof d === 'string' && d) return d
    if (d && typeof d === 'object') {
      const dd = d as Record<string, unknown>
      if (typeof dd.url === 'string' && dd.url) return dd.url
    }
  }
  return null
}
