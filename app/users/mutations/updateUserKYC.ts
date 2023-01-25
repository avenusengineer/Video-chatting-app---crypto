import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

import db from "db"

const UpdateUserKYC = z.object({
  kycReferenceKey: z.string().min(1),
})

export default resolver.pipe(
  resolver.authorize(),
  resolver.zod(UpdateUserKYC),
  async ({ kycReferenceKey }, { session }) => {
    await db.user.update({
      where: {
        id: session.userId,
      },
      data: {
        kycReferenceKey,
        kycSubmittedAt: new Date(),
      },
    })
  }
)
