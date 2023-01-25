import { resolver } from "@blitzjs/rpc"

import db from "db"
import { GetUser } from "app/users/validations"

export default resolver.pipe(
  resolver.zod(GetUser),
  async ({ username, isCreator }) =>
    await db.user.findFirstOrThrow({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        price: true,
        status: true,
        lastSeenAt: true,
        images: {
          orderBy: {
            order: "asc",
          },
        },
      },
      where: {
        username,
        deletedAt: null,
        ...(isCreator && {
          role: "CREATOR",
        }),
      },
    })
)
