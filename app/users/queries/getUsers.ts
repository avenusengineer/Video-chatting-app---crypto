import { resolver } from "@blitzjs/rpc"

import db from "db"
import { GetUsers } from "app/users/validations"

export default resolver.pipe(
  resolver.zod(GetUsers),
  async ({ usernames }) =>
    await db.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        images: {
          orderBy: {
            order: "asc",
          },
        },
      },
      where: {
        username: {
          in: usernames,
        },
      },
    })
)
