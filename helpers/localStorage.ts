interface ExpirationValue {
  value: string
  expiry: number
}

export const setExpirationValue = (key: string, value: string, ttl: number) => {
  const payload: ExpirationValue = {
    expiry: new Date().getTime() + ttl,
    value,
  }

  localStorage.setItem(key, JSON.stringify(payload))
}

export const getEpxirationValue = (key: string): string | null => {
  const token = localStorage.getItem(key)
  if (token) {
    const { value, expiry } = JSON.parse(token) as ExpirationValue
    if (new Date().getTime() > expiry) {
      localStorage.removeItem(key)
      return null
    }

    return value
  }

  return null
}
