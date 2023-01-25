import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

import db from "db"

export const VerifyUsername = z.object({
  username: z.string().min(1),
})

export default resolver.pipe(
  resolver.zod(VerifyUsername),
  async ({ username }) => (await db.user.count({ where: { username } })) === 0
)
