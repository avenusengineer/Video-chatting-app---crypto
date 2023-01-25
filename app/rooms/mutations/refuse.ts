import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"

import redis from "redis"
import { Refuse } from "app/rooms/validations"

// Accept a participant and generate a token.
export default resolver.pipe(
  resolver.authorize(),
  resolver.zod(Refuse),
  async ({ participant }, { session: { username } }: Ctx) => {
    await redis
      .pipeline()
      .zrem("room:" + username, participant!)
      .zrem("room:queue:" + username, participant!)
      .set(`room:${username}:${participant}`, "refused", "EX", 10)
      .exec()
  }
)
