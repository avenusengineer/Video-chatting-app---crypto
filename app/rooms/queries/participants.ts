import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"

import redis from "redis"

// Default: 2 seconds
const TIMEOUT = process.env.TIMEOUT ? parseInt(process.env.TIMEOUT) : 1000 * 2

// Returns a list of participants in the queue
export default resolver.pipe(resolver.authorize(), async (_, { session: { username } }: Ctx) => {
  const roomKey = "room:queue:" + username

  // Delete expired users
  const timestamp = Date.now() - TIMEOUT
  await redis.zremrangebyscore("room:" + username, 0, timestamp)
  await redis.zinterstore(roomKey, 2, roomKey, "room:" + username, "AGGREGATE", "MIN")

  return await redis.zrangebyscore(roomKey, 0, "+inf", "LIMIT", 0, 10)
})
