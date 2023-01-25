import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

import db, { UserStatus } from "db"

export const UpdateStatus = z.object({
  status: z.enum(Object.keys(UserStatus) as [UserStatus, ...UserStatus[]]),
})

export default resolver.pipe(
  resolver.authorize(),
  resolver.zod(UpdateStatus),
  async ({ status }, ctx) => {
    await db.user.update({
      where: {
        id: ctx.session.userId,
      },
      data: {
        status,
      },
    })

    return status
  }
)
