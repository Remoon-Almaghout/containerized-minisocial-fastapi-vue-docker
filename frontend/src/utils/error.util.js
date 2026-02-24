export function getErrorMessage(err, fallback = 'Unbekannter Fehler') {
  // Axios / fetch network errors
  if (err?.message === 'Network Error' || (err?.request && !err?.response)) {
    return 'Server nicht erreichbar / CORS Problem.'
  }

  const data = err?.response?.data

  const detail = data?.detail

  if (typeof detail === 'string' && detail.trim()) return detail

  if (Array.isArray(detail) && detail.length) {
    const msgs = detail
      .map((item) => {
        if (!item) return null
        if (typeof item === 'string') return item
        const loc = Array.isArray(item.loc) ? item.loc.join('.') : ''
        const msg = item.msg || item.message || ''
        return [loc, msg].filter(Boolean).join(': ')
      })
      .filter(Boolean)

    if (msgs.length) return msgs.join(' | ')
  }

  if (detail && typeof detail === 'object') {
    if (typeof detail.msg === 'string') return detail.msg
    try {
      return JSON.stringify(detail)
    } catch {}
  }

  if (typeof data?.message === 'string' && data.message.trim()) return data.message

  if (typeof err?.message === 'string' && err.message.trim()) return err.message

  return fallback
}
