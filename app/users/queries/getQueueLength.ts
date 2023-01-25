import { resolver } from "@blitzjs/rpc"

import redis from "redis"
import { QueueLength } from "app/users/validations"

export default resolver.pipe(resolver.zod(QueueLength), async ({ room }) => {
  return await redis.zcount("room:" + room, 0, "+inf")
})
