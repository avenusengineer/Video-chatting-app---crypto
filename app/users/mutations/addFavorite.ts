import { resolver } from "@blitzjs/rpc"

import db from "db"
import { AddFavorite } from "app/users/validations"

export default resolver.pipe(
  resolver.authorize(),
  resolver.zod(AddFavorite),
  async ({ username }, ctx) => {
    await db.favorite.create({
      data: {
        author: {
          connect: {
            id: ctx.session.userId,
          },
        },
        user: {
          connect: {
            username,
          },
        },
      },
    })
  }
)
