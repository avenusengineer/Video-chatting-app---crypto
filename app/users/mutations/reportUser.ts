import { resolver } from "@blitzjs/rpc"

import db from "db"
import { ReportUser } from "app/users/validations"

export default resolver.pipe(
  resolver.authorize(),
  resolver.zod(ReportUser),
  async ({ userId }, { session }) => {
    await db.report.upsert({
      where: {
        authorId_userId: {
          authorId: session.userId,
          userId,
        },
      },
      update: {},
      create: {
        authorId: session.userId,
        userId,
      },
    })
  }
)
