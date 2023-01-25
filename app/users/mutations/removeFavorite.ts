import { resolver } from "@blitzjs/rpc"

import db from "db"
import { RemoveFavorite } from "app/users/validations"

export default resolver.pipe(
  resolver.authorize(),
  resolver.zod(RemoveFavorite),
  async ({ username }, ctx) => {
    await db.favorite.deleteMany({
      where: {
        authorId: ctx.session.userId,
        user: {
          username,
        },
      },
    })
  }
)
