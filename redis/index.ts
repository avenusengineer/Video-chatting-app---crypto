import Redis, { RedisOptions } from "ioredis"
import hash from "object-hash"

const client = new Redis(process.env.REDIS_URL!)

export const parseOptionsFromURL = (): RedisOptions | undefined => {
  if (!process.env.REDIS_URL) {
    return undefined
  }

  const url = new URL(process.env.REDIS_URL)

  return {
    host: url.hostname,
    port: parseInt(url.port, 10),
    password: url.password,
  }
}

export const cache =
  <F extends Function & ((...args: any) => any)>(key: string, func: F, expiration = 60 * 10) =>
    async (...args: Parameters<F>): Promise<ReturnType<F>> => {
      const argsHash = hash(args)
      const uniqueKey = `cache_func_${key}_${argsHash}`

      const cachedResult = await client.get(uniqueKey)
      if (cachedResult) {
        return JSON.parse(cachedResult)
      }

      const result = await func(...args)

      if (result) {
        client.set(uniqueKey, JSON.stringify(result), "EX", expiration)
      }

      return result
    }

export const clearCache =
  <F extends Function & ((...args: any) => any)>(key: string, _func: F) =>
    async (...args: Parameters<F>) => {
      const argsHash = hash(args)
      await client.del(`cache_func_${key}_${argsHash}`)
    }

export default client
