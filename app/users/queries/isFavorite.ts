import { resolver } from "@blitzjs/rpc"

import db from "db"
import { IsFavorite } from "app/users/validations"

export default resolver.pipe(
  resolver.authorize(),
  resolver.zod(IsFavorite),
  async ({ username }, ctx) =>
    (await db.favorite.count({
      take: 1,
      where: {
        authorId: ctx.session.userId,
        user: {
          username,
        },
      },
    })) === 1
)
