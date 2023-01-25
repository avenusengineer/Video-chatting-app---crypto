import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"

import redis from "redis"

// Returns a list of participants in the queue
export default resolver.pipe(resolver.authorize(), async (_, { session: { username } }: Ctx) => {
  await redis.zadd("presence", "GT", Date.now(), username!)
})
